import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';
import { VoteRequestBody } from '../utils/types';

const prisma = new PrismaClient();

export async function voteHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        return await getVotes(request, context);
      case 'POST':
        return await createVote(request, context);
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

async function getVotes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const ideaId = request.query.get('ideaId');
    let votes;

    if (ideaId) {
      votes = await prisma.votes.findMany({
        where: { idea_id: parseInt(ideaId, 10) },
      });
    } else {
      votes = await prisma.votes.findMany();
    }

    return { status: 200, jsonBody: votes };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching votes: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching votes: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch votes.' };
  }
}

async function createVote(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as VoteRequestBody;
    const vote = await prisma.votes.create({
      data: {
        idea_id: body.idea_id,
        voted_by: body.voted_by,
      },
    });

    return { status: 201, jsonBody: vote };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating vote: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while creating vote: ${error}`);
    }
    return { status: 500, body: 'Failed to create vote.' };
  }
}

const vote = corsMiddleware(voteHandler);

app.http('vote', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: vote,
});
