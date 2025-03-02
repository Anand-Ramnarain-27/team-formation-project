import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function analyticsReportHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        return await getAnalyticsReport(request, context);
      default:
        return { status: 405, body: 'Method not allowed.' };
    }
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error processing request: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Internal Server Error' };
  }
}

// Get analytics report for a specific theme
async function getAnalyticsReport(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themeId = request.query.get('id');

    if (!themeId) {
      return { status: 400, body: 'themeId query parameter is required.' };
    }

    const report = await prisma.analytics_reports.findFirst({
      where: { theme_id: parseInt(themeId, 10) },
    });

    if (!report) {
      return { status: 404, body: 'Analytics report not found.' };
    }

    return { status: 200, jsonBody: report };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching analytics report: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching analytics report: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch analytics report.' };
  }
}

const analyticsReport = corsMiddleware(analyticsReportHandler);

app.http('analyticsReport', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: analyticsReport,
});