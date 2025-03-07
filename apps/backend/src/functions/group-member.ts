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
        if (request.query.get('id')) {
          return await getGroupMembers(request, context);
        } else if (request.query.get('userId')) {
          return await getUserGroups(request, context);
        }
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

// Get all members of a group, including the team lead
async function getGroupMembers(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('id');
    if (!groupId) {
      return { status: 400, body: 'Group ID is required.' };
    }

    // Fetch the group details, including the team lead user
    const group = await prisma.groups.findUnique({
      where: { group_id: parseInt(groupId, 10) },
      include: {
        leader: true, // Include the team lead user details using the `leader` relation
      },
    });

    if (!group) {
      return { status: 404, body: 'Group not found.' };
    }

    // Fetch the group members
    const groupMembers = await prisma.group_members.findMany({
      where: { group_id: parseInt(groupId, 10) },
      include: {
        member: true,
      },
    });

    // Add the team lead to the list of members if they are not already included
    if (group.team_lead && group.leader) {
      const teamLeadMember = groupMembers.find(
        (member) => member.user_id === group.team_lead
      );

      if (!teamLeadMember) {
        groupMembers.push({
          group_member_id: -1, 
          group_id: group.group_id,
          user_id: group.team_lead,
          member: group.leader, 
          created_at: group.created_at
        });
      }
    }

    return { status: 200, jsonBody: groupMembers };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching group members: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching group members: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch group members.' };
  }
}

// Get all groups of a user
async function getUserGroups(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userId = request.query.get('userId');
    if (!userId) {
      return { status: 400, body: 'User ID is required.' };
    }

    const userGroups = await prisma.group_members.findMany({
      where: { user_id: parseInt(userId, 10) },
      include: {
        group: true,
      },
    });

    return { status: 200, jsonBody: userGroups };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching user groups: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching user groups: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch user groups.' };
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
      context.error(
        `Unknown error occurred while adding group member: ${error}`
      );
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
      context.error(
        `Unknown error occurred while removing group member: ${error}`
      );
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
