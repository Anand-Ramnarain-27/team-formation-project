import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function analytics(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        const themeId = request.params.themeId;
        const groupId = request.params.groupId;

        if (themeId) {
          // Handle GET /analytics/themes/{themeId} (get analytics for a specific theme)
          return await getThemeAnalytics(themeId, context);
        } else if (groupId) {
          // Handle GET /analytics/groups/{groupId} (get analytics for a specific group)
          return await getGroupAnalytics(groupId, context);
        } else {
          return { status: 400, body: 'Theme ID or Group ID is required.' };
        }
      default:
        return { status: 405, body: 'Method not allowed.' };
    }
  } catch (error) {
    // Safely handle the error
    if (error instanceof Error) {
      context.error(`Error processing request: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Internal Server Error' };
  }
}

// Get analytics for a specific theme
async function getThemeAnalytics(
  themeId: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Fetch analytics for the specified theme
    const analytics = await prisma.analytics_reports.findMany({
      where: {
        theme_id: parseInt(themeId),
      },
    });

    if (!analytics || analytics.length === 0) {
      return {
        status: 404,
        body: 'No analytics found for the specified theme.',
      };
    }

    return { status: 200, jsonBody: analytics };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching theme analytics: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch theme analytics.' };
  }
}

// Get analytics for a specific group
async function getGroupAnalytics(
  groupId: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Fetch analytics for the specified group
    const analytics = await prisma.analytics_reports.findMany({
      where: {
        theme_id: parseInt(groupId), // Assuming group_id is stored in theme_id for simplicity
      },
    });

    if (!analytics || analytics.length === 0) {
      return {
        status: 404,
        body: 'No analytics found for the specified group.',
      };
    }

    return { status: 200, jsonBody: analytics };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching group analytics: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch group analytics.' };
  }
}

app.http('analytics', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: analytics,
});
