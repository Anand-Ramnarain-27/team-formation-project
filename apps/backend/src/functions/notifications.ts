import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { NotificationRequestBody } from '../utils/types'; 
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function notificationHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'POST':
        return await sendNotification(request, context);
      case 'GET':
        return await getNotifications(request, context);
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

async function sendNotification(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as NotificationRequestBody;

    const newNotification = await prisma.notifications.create({
      data: {
        recipient_role: body.recipient_role,
        message: body.message,
        created_by: body.created_by,
      },
    });

    return { status: 201, jsonBody: newNotification };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error sending notification: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to send notification.' };
  }
}

async function getNotifications(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('user_id');
    const userRole = request.query.get('user_role');
    
    if (!userId || !userRole) {
      return { status: 400, body: 'User ID and role are required.' };
    }

    const notifications = await prisma.notifications.findMany({
      where: {
        OR: [
          { recipient_role: userRole },
          { recipient_role: 'All' }
        ]
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return { status: 200, jsonBody: notifications };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching notifications: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch notifications.' };
  }
}

const notification = corsMiddleware(notificationHandler);

app.http('notification', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: notification,
});