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
        // Handle POST /notifications (send a notification)
        return await sendNotification(request, context);
      case 'GET':
        // Handle GET /notifications (get notifications for the logged-in user)
        return await getNotifications(request, context);
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

// Send a notification
async function sendNotification(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as NotificationRequestBody;

    // Create a new notification
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

// Get notifications for the logged-in user based on their role
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

    // Fetch notifications based on user role
    // Users should see notifications targeted at their role or 'All'
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