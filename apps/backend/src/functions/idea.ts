import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient, status_enum } from '@prisma/client';
import { IdeaRequestBody } from '../utils/types';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function ideaHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        return await getIdeas(request, context);
      case 'POST':
        return await submitIdea(request, context);
      case 'PATCH':
        return await updateIdeaStatus(request, context);
      case 'DELETE':
        return await deleteIdea(request, context);
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

// Get all ideas (optionally filtered by theme_id or idea_id)
async function getIdeas(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themeId = request.query.get('theme_id');
    const ideaId = request.query.get('idea_id');

    let whereClause = {};
    if (themeId) {
      whereClause = { theme_id: parseInt(themeId) };
    } else if (ideaId) {
      whereClause = { idea_id: parseInt(ideaId) };
    }

    const ideas = await prisma.ideas.findMany({
      where: whereClause,
    });

    return { status: 200, jsonBody: ideas };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching ideas: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch ideas.' };
  }
}

// Submit a new idea
async function submitIdea(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as IdeaRequestBody;
    const newIdea = await prisma.ideas.create({
      data: {
        theme_id: body.theme_id,
        submitted_by: body.submitted_by,
        idea_name: body.idea_name,
        description: body.description,
        status: body.status || status_enum.Pending,
      },
    });

    return { status: 201, jsonBody: newIdea };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating idea: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to create idea.' };
  }
}

// Update idea status by ID
async function updateIdeaStatus(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const ideaId = request.query.get('idea_id');
    if (!ideaId) {
      return { status: 400, body: 'Idea ID is required for status update.' };
    }

    const body = (await request.json()) as { status: 'Approved' | 'Rejected' };

    const updatedIdea = await prisma.ideas.update({
      where: { idea_id: parseInt(ideaId) },
      data: { status: body.status },
    });

    return { status: 200, jsonBody: updatedIdea };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error updating idea status: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to update idea status.' };
  }
}

// Delete idea by ID
async function deleteIdea(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const ideaId = request.query.get('idea_id');
    if (!ideaId) {
      return { status: 400, body: 'Idea ID is required for deletion.' };
    }

    await prisma.ideas.delete({
      where: { idea_id: parseInt(ideaId) },
    });

    return { status: 204, body: 'Idea deleted successfully.' };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error deleting idea: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to delete idea.' };
  }
}

const idea = corsMiddleware(ideaHandler);

app.http('idea', {
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: idea,
});