import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';
import { GroupUpdateRequestBody, GroupCreateRequestBody } from '../utils/types';

const prisma = new PrismaClient();

export async function groupHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        return await getGroups(request, context);
      case 'POST':
        return await createGroup(request, context);
      case 'PATCH':
        return await updateGroup(request, context);
      case 'DELETE':
        return await deleteGroup(request, context);
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

async function getGroups(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('id');
    const teamLeadId = request.query.get('teamLead');
    
    if (groupId) {
      const group = await prisma.groups.findUnique({
        where: { group_id: parseInt(groupId, 10) },
      });
      if (!group) {
        return { status: 404, body: 'Group not found.' };
      }
      return { status: 200, jsonBody: group };
    } else if (teamLeadId) {
      const groups = await prisma.groups.findMany({
        where: { team_lead: parseInt(teamLeadId, 10) },
      });
      return { status: 200, jsonBody: groups };
    } else {
      const groups = await prisma.groups.findMany();
      return { status: 200, jsonBody: groups };
    }
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching groups: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching groups: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch groups.' };
  }
}

async function createGroup(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as GroupCreateRequestBody;

    if (body.group_name) {
      const idea = await prisma.ideas.findUnique({
        where: { idea_name: body.group_name },
      });
      
      if (!idea) {
        return { 
          status: 400, 
          body: `Group name must be an existing idea name. '${body.group_name}' not found.` 
        };
      }
    }
    
    const group = await prisma.groups.create({
      data: {
        theme_id: body.theme_id,
        group_name: body.group_name || null,
        team_lead: body.team_lead || null,
      },
    });
    return { status: 201, jsonBody: group };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating group: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while creating group: ${error}`);
    }
    return { status: 500, body: 'Failed to create group.' };
  }
}

async function updateGroup(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('id');
    if (!groupId) {
      return { status: 400, body: 'Group ID is required.' };
    }

    const body = (await request.json()) as GroupUpdateRequestBody;
    if (typeof body !== 'object' || body === null) {
      return { status: 400, body: 'Invalid request body' };
    }

    if (body.group_name) {
      const idea = await prisma.ideas.findUnique({
        where: { idea_name: body.group_name },
      });
      
      if (!idea) {
        return { 
          status: 400, 
          body: `Group name must be an existing idea name. '${body.group_name}' not found.` 
        };
      }
    }

    const group = await prisma.groups.update({
      where: { group_id: parseInt(groupId, 10) },
      data: {
        theme_id: body.theme_id,
        group_name: body.group_name,
        team_lead: body.team_lead,
      },
    });

    return { status: 200, jsonBody: group };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error updating group: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while updating group: ${error}`);
    }
    return { status: 500, body: 'Failed to update group.' };
  }
}

async function deleteGroup(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('id');
    if (!groupId) {
      return { status: 400, body: 'Group ID is required.' };
    }

    await prisma.groups.delete({
      where: { group_id: parseInt(groupId, 10) },
    });

    return { status: 200, body: 'Group deleted successfully.' };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error deleting group: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while deleting group: ${error}`);
    }
    return { status: 500, body: 'Failed to delete group.' };
  }
}

const group = corsMiddleware(groupHandler);

app.http('group', {
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: group,
});
