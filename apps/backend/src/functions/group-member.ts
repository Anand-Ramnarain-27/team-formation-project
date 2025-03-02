import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';
import { AddMemberRequestBody } from '../utils/types';

const prisma = new PrismaClient();

export async function groupMemberHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        return await getGroupMembers(request, context);
      case 'POST':
        return await addGroupMember(request, context);
      case 'DELETE':
        return await removeGroupMember(request, context);
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

// Get all members of a group
async function getGroupMembers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('id');
    if (!groupId) {
      return { status: 400, body: 'Group ID is required.' };
    }

    const groupMembers = await prisma.group_members.findMany({
      where: { group_id: parseInt(groupId, 10) },
      include: {
        member: true,
      },
    });

    return { status: 200, jsonBody: groupMembers };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching group members: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching group members: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch group members.' };
  }
}

// Add a member to a group
async function addGroupMember(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const groupId = request.query.get('groupId');
    const userId = request.query.get('userId');

    if (!groupId || !userId) {
      return { status: 400, body: 'Group ID and User ID are required.' };
    }

    const groupMember = await prisma.group_members.create({
      data: {
        group_id: parseInt(groupId, 10),
        user_id: parseInt(userId, 10),
      },
    });

    return { status: 201, jsonBody: groupMember };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error adding group member: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while adding group member: ${error}`);
    }
    return { status: 500, body: 'Failed to add group member.' };
  }
}

// Remove a member from a group
async function removeGroupMember(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('groupId');
    const userId = request.query.get('userId');

    if (!groupId || !userId) {
      return { status: 400, body: 'Group ID and User ID are required.' };
    }

    await prisma.group_members.delete({
      where: {
        group_members_group_id_user_id_unique: {
          group_id: parseInt(groupId, 10),
          user_id: parseInt(userId, 10),
        },
      },
    });

    return { status: 200, body: 'Group member removed successfully.' };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error removing group member: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while removing group member: ${error}`);
    }
    return { status: 500, body: 'Failed to remove group member.' };
  }
}

const groupMember = corsMiddleware(groupMemberHandler);

app.http('groupMember', {
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: groupMember,
});