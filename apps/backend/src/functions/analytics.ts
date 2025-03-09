import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function generateAllThemesAnalyticsHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
      // Fetch all themes with their related data
      const themes = await prisma.theme.findMany({
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

      // Calculate total students across all themes
      const totalStudents = themes.reduce(
          (acc, theme) => acc + theme.groups.reduce(
              (groupAcc, group) => groupAcc + group.group_members.length,
              0
          ),
          0
      );

      // Calculate total ideas across all themes
      const totalIdeas = themes.reduce(
          (acc, theme) => acc + theme.ideas.length,
          0
      );

      // Calculate total approved ideas across all themes
      const totalPendingIdeas = themes.reduce(
          (acc, theme) => acc + theme.ideas.filter((idea) => idea.status === 'Pending').length,
          0
      );

      // Calculate average rating across all themes
      const averageRating = totalPendingIdeas / totalIdeas || 0;

      // Calculate participation statistics across all themes
      const participationStats = {
          ideas_submitted: totalIdeas,
          votes_cast: themes.reduce(
              (acc, theme) => acc + theme.ideas.reduce(
                  (ideaAcc, idea) => ideaAcc + idea.votes.length,
                  0
              ),
              0
          ),
          reviews_completed: themes.reduce(
              (acc, theme) => acc + theme.groups.reduce(
                  (groupAcc, group) => groupAcc + group.reviews.length,
                  0
              ),
              0
          ),
          totalIdeas: totalIdeas,
          totalVotes: themes.reduce(
              (acc, theme) => acc + theme.ideas.reduce(
                  (ideaAcc, idea) => ideaAcc + idea.votes.length,
                  0
              ),
              0
          ),
          totalReviews: themes.reduce(
              (acc, theme) => acc + theme.groups.reduce(
                  (groupAcc, group) => groupAcc + group.reviews.length,
                  0
              ),
              0
          ),
          averageRating: averageRating,
      };

      // Return the analytics report for all themes
      const report = {
          report_id: 2, // You can generate a unique ID if needed
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

const generateAllThemesAnalytics = corsMiddleware(generateAllThemesAnalyticsHandler);

app.http('generateAllThemesAnalytics', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: generateAllThemesAnalytics,
});