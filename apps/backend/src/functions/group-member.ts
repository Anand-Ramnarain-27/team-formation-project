import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { AddMemberRequestBody } from '../utils/types';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function groupMemberHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'POST':
        // Handle POST /groups/{id}/members (add a member to a group)
        const groupId = request.params.id;
        if (groupId) {
          return await addMember(groupId, request, context);
        } else {
          return { status: 400, body: 'Group ID is required.' };
        }
      case 'DELETE':
        // Handle DELETE /groups/{id}/members/{userId} (remove a member from a group)
        const deleteGroupId = request.params.id;
        const userId = request.params.userId;
        if (deleteGroupId && userId) {
          return await removeMember(deleteGroupId, userId, context);
        } else {
          return { status: 400, body: 'Group ID and User ID are required.' };
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

// Add a member to a group
async function addMember(
  groupId: string,
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as AddMemberRequestBody;

    // Check if the user is already a member of the group
    const existingMember = await prisma.group_members.findFirst({
      where: {
        group_id: parseInt(groupId),
        user_id: body.user_id,
      },
    });

    if (existingMember) {
      return { status: 400, body: 'User is already a member of this group.' };
    }

    // Add the user to the group
    const newMember = await prisma.group_members.create({
      data: {
        group_id: parseInt(groupId),
        user_id: body.user_id,
      },
    });

    return { status: 201, jsonBody: newMember };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error adding member: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to add member.' };
  }
}

// Remove a member from a group
async function removeMember(
  groupId: string,
  userId: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Delete the group member
    await prisma.group_members.deleteMany({
      where: {
        group_id: parseInt(groupId),
        user_id: parseInt(userId),
      },
    });

    return { status: 204, body: 'Member removed successfully.' };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error removing member: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to remove member.' };
  }
}

const groupMember = corsMiddleware(groupMemberHandler);

app.http('groupMember', {
  methods: ['POST', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: groupMember,
});