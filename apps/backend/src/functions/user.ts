import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { UserCreateRequestBody, UserUpdateRequestBody } from '../utils/types';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function userHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        if(request.query.get('id')){
          return await getUserById(request, context);
        }
        return await getUsers(context);
      case 'POST':
        return await createUser(request, context);
      case 'PATCH':
        return await updateUser(request, context);
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

// Get a user by ID
async function getUserById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('id');
    if (!userId) {
      return { status: 400, body: 'User ID is required.' };
    }

    const user = await prisma.users.findUnique({
      where: { user_id: parseInt(userId, 10) },
    });

    if (!user) {
      return { status: 404, body: 'user not found.' };
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

// Create a new user
async function createUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const userBody: UserCreateRequestBody = body as UserCreateRequestBody;
    const user = await prisma.users.create({
      data: {
        name: userBody.name,
        email: userBody.email,
        role: userBody.role,
        auth_provider: userBody.auth_provider || null,
      },
    });
    return { status: 201, jsonBody: user };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating user: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while creating user: ${error}`);
    }
    return { status: 500, body: 'Failed to create user.' };
  }
}

// Update an existing user
async function updateUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('id');
    if (!userId) {
      return { status: 400, body: 'User ID is required.' };
    }

    const body = await request.json();
    if (typeof body !== 'object' || body === null) {
      return { status: 400, body: 'Invalid request body' };
    }

    const userBody: UserUpdateRequestBody = body as UserUpdateRequestBody;

    const user = await prisma.users.update({
      where: { user_id: parseInt(userId, 10) },
      data: {
        name: userBody.name,
        email: userBody.email,
        role: userBody.role,
        auth_provider: userBody.auth_provider || null,
      },
    });

    return { status: 200, jsonBody: user };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error updating user: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while updating user: ${error}`);
    }
    return { status: 500, body: 'Failed to update user.' };
  }
}

const user = corsMiddleware(userHandler);

app.http('user', {
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: user,
});
