import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function assignHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const themeId = request.query.get('themeId');
    if (!themeId) {
      return { status: 400, body: 'Theme ID is required.' };
    }

    const theme = await prisma.theme.findUnique({
      where: { theme_id: parseInt(themeId, 10) },
      include: {
        ideas: {
          include: {
            votes: true,
          },
        },
        groups: true,
      },
    });

    if (!theme) {
      return { status: 404, body: 'Theme not found.' };
    }

    // Check if the voting phase is over
    const now = new Date();
    if (now < new Date(theme.voting_deadline)) {
      return { status: 400, body: 'Voting phase is not yet over.' };
    }

    // Get all students who are not already in a group for this theme
    const students = await prisma.users.findMany({
      where: {
        role: 'Student',
        NOT: {
          group_members: {
            some: {
              group: {
                theme_id: parseInt(themeId, 10),
              },
            },
          },
        },
      },
    });

    // Sort ideas by vote count (descending) and creation time (ascending for ties)
    const sortedIdeas = theme.ideas
      .map((idea) => ({
        ...idea,
        voteCount: idea.votes.length,
      }))
      .sort((a, b) => {
        if (b.voteCount !== a.voteCount) {
          return b.voteCount - a.voteCount;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });

    // Get the top N ideas based on the number_of_groups
    const topIdeas = sortedIdeas.slice(0, theme.number_of_groups);

    // Create groups for the top ideas
    const createdGroups = await Promise.all(
      topIdeas.map(async (idea) => {
        const group = await prisma.groups.create({
          data: {
            theme_id: theme.theme_id,
            group_name: idea.idea_name,
            team_lead: idea.submitted_by,
          },
        });
        return group;
      })
    );

    // If auto_assign_group is true, assign the remaining students to the groups
    if (theme.auto_assign_group) {
      const studentsToAssign = students.filter(
        (student) => !topIdeas.some((idea) => idea.submitted_by === student.user_id)
      );

      // Shuffle students randomly
      const shuffledStudents = studentsToAssign.sort(() => Math.random() - 0.5);

      // Assign students to groups equally
      const groupAssignments = [];
      for (let i = 0; i < shuffledStudents.length; i++) {
        const groupIndex = i % createdGroups.length;
        groupAssignments.push({
          group_id: createdGroups[groupIndex].group_id,
          user_id: shuffledStudents[i].user_id,
        });
      }

      // Add group members to the database
      await prisma.group_members.createMany({
        data: groupAssignments,
      });
    }

    return {
      status: 200,
      jsonBody: {
        message: 'Groups created successfully.',
        groups: createdGroups,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error processing request: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Internal Server Error' };
  }
}

const assign = corsMiddleware(assignHandler);

app.http('assign', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: assign,
});