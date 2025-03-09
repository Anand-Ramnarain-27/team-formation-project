import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext,
  } from '@azure/functions';
  import { PrismaClient } from '@prisma/client';
  import { corsMiddleware } from '../utils/cors';
  
  const prisma = new PrismaClient();
  
  export async function generateAnalyticsHandler(
    request: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
  
    try {
      const themeId = request.query.get('themeId');
      if (!themeId) {
        return { status: 400, body: 'themeId query parameter is required.' };
      }
  
      const theme = await prisma.theme.findUnique({
        where: { theme_id: parseInt(themeId, 10) },
        include: {
          ideas: {
            include: {
              votes: true,
            },
          },
          groups: {
            include: {
              group_members: true,
              reviews: true,
            },
          },
        },
      });
  
      if (!theme) {
        return { status: 404, body: 'Theme not found.' };
      }

      const totalStudents = theme.groups.reduce(
        (acc: number, group: { group_members: { length: number } }) =>
          acc + group.group_members.length,
        0
      );
  
      const totalIdeas = theme.ideas.length;
  
      const totalRatings = theme.ideas.reduce(
        (acc: number, idea: { status: string }) =>
          acc + (idea.status === 'Approved' ? 1 : 0),
        0
      );
      const averageRating = totalRatings / totalIdeas || 0;
  
      const participationStats = {
        ideas_submitted: theme.ideas.length,
        votes_cast: theme.ideas.reduce(
          (acc: number, idea: { votes: { length: number } }) =>
            acc + idea.votes.length,
          0
        ),
        reviews_completed: theme.groups.reduce(
          (acc: number, group: { reviews: { length: number } }) =>
            acc + group.reviews.length,
          0
        ),
        totalIdeas: theme.ideas.length,
        totalVotes: theme.ideas.reduce(
          (acc: number, idea: { votes: { length: number } }) =>
            acc + idea.votes.length,
          0
        ),
        totalReviews: theme.groups.reduce(
          (acc: number, group: { reviews: { length: number } }) =>
            acc + group.reviews.length,
          0
        ),
        averageRating: averageRating,
      };
  
      const report = {
        report_id: 1,
        theme_id: theme.theme_id,
        total_students: totalStudents,
        total_reports: totalIdeas,
        average_rating: averageRating,
        participation_stats: participationStats,
      };
  
      return { status: 200, jsonBody: report };
    } catch (error) {
      if (error instanceof Error) {
        context.error(`Error generating analytics report: ${error.message}`);
      } else {
        context.error(`Unknown error occurred: ${error}`);
      }
      return { status: 500, body: 'Internal Server Error' };
    } finally {
      await prisma.$disconnect();
    }
  }

  const generateAnalytics = corsMiddleware(generateAnalyticsHandler);
  
  app.http('generateAnalytics', {
    methods: ['GET', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: generateAnalytics,
  });