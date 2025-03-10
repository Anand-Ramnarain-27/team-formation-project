import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { AutoAssignRequestBody } from '../utils/types';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function autoAssignLocalHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Auto-assign function triggered manually.');

  try {
    const body = await request.json() as AutoAssignRequestBody;
    const themeId = body.theme_id;

    if (!themeId) {
      return { status: 400, body: 'Theme ID is required.' };
    }

    const now = new Date();
    const themes = await prisma.theme.findMany({
      where: {
        voting_deadline: { lt: now }, 
        groups: { none: {} }, 
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

      const topIdeas = sortedIdeas.slice(0, theme.number_of_groups);

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

      if (theme.auto_assign_group) {
        const studentsToAssign = students.filter(
          (student) => !topIdeas.some((idea) => idea.submitted_by === student.user_id)
        );

        const shuffledStudents = studentsToAssign.sort(() => Math.random() - 0.5);

        const groupAssignments = [];
        for (let i = 0; i < shuffledStudents.length; i++) {
          const groupIndex = i % createdGroups.length;
          groupAssignments.push({
            group_id: createdGroups[groupIndex].group_id,
            user_id: shuffledStudents[i].user_id,
          });
        }

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

const autoAssign = corsMiddleware(autoAssignLocalHandler);

app.http('autoAssign', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: autoAssign,
});