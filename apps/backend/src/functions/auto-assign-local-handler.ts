import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function autoAssignLocalHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Auto-assign function triggered manually.');

  try {
    // Fetch all themes where the voting deadline has passed and groups haven't been assigned yet
    const now = new Date();
    const themes = await prisma.theme.findMany({
      where: {
        voting_deadline: { lt: now }, // Voting deadline has passed
        groups: { none: {} }, // No groups have been created yet
      },
      include: {
        ideas: {
          include: {
            votes: true,
          },
        },
      },
    });

    for (const theme of themes) {
      context.log(`Processing theme: ${theme.title}`);

      // Get all students who are not already in a group for this theme
      const students = await prisma.users.findMany({
        where: {
          role: 'Student',
          NOT: {
            group_members: {
              some: {
                group: {
                  theme_id: theme.theme_id,
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

      context.log(`Groups created for theme: ${theme.title}`);
    }

    return {
      status: 200,
      jsonBody: { message: 'Auto-assign function executed successfully.' },
    };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error in auto-assign function: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Internal Server Error' };
  } finally {
    await prisma.$disconnect();
  }
}

app.http('autoAssign', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: autoAssignLocalHandler,
});