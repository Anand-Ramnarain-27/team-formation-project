import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { UserUpdateRequestBody } from '../utils/types'; // Import the interface from types.ts

const prisma = new PrismaClient();

export async function user(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        const userId = request.params.id;
        if (userId) {
          // Handle GET /users/{id}
          return await getUserById(userId, context);
        } else {
          // Handle GET /users
          return await getUsers(context);
        }
      case 'PUT':
        // Handle PUT /users/{id}
        const updateUserId = request.params.id;
        if (updateUserId) {
          return await updateUser(updateUserId, request, context);
        } else {
          return { status: 400, body: 'User ID is required for update.' };
        }
      default:
        return { status: 405, body: 'Method not allowed.' };
    }
  } catch (error) {
    // Safely handle the error object
    if (error instanceof Error) {
      context.error(`Error processing request: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Internal Server Error' };
  }
}

// Get all users
async function getUsers(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const users = await prisma.users.findMany();
    return { status: 200, jsonBody: users };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching users: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching users: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch users.' };
  }
}

// Get user by ID
async function getUserById(
  userId: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: parseInt(userId) },
    });

    if (!user) {
      return { status: 404, body: 'User not found.' };
    }

    return { status: 200, jsonBody: user };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching user by ID: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching user by ID: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch user.' };
  }
}

// Update user by ID
async function updateUser(
  userId: string,
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as UserUpdateRequestBody;

    // Update the user
    const updatedUser = await prisma.users.update({
      where: { user_id: parseInt(userId) },
      data: body,
    });

    return { status: 200, jsonBody: updatedUser };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error updating user: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while updating user: ${error}`);
    }
    return { status: 500, body: 'Failed to update user.' };
  }
}

app.http('user', {
  methods: ['GET', 'PUT'],
  authLevel: 'anonymous',
  handler: user,
});
