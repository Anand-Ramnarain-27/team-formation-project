import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { VoteRequestBody } from '../utils/types'; 
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function voteHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'POST':
        // Handle POST /votes (cast a vote)
        return await castVote(request, context);
      case 'GET':
        // Handle GET /votes (get votes for a specific theme)
        return await getVotes(request, context);
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

// Cast a vote on an idea
async function castVote(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as VoteRequestBody;

    // Check if the user has already voted for this idea
    const existingVote = await prisma.votes.findFirst({
      where: {
        idea_id: body.idea_id,
        voted_by: body.voted_by,
      },
    });

    if (existingVote) {
      return { status: 400, body: 'You have already voted for this idea.' };
    }

    // Create a new vote
    const newVote = await prisma.votes.create({
      data: {
        idea_id: body.idea_id,
        voted_by: body.voted_by,
      },
    });

    return { status: 201, jsonBody: newVote };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error casting vote: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to cast vote.' };
  }
}

// Get all votes for a specific theme
async function getVotes(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themeId = request.query.get('theme_id');
    if (!themeId) {
      return { status: 400, body: 'Theme ID is required.' };
    }

    // Fetch all votes for ideas under the specified theme
    const votes = await prisma.votes.findMany({
      where: {
        idea: {
          theme_id: parseInt(themeId),
        },
      },
      include: {
        idea: true, // Include the related idea details
      },
    });

    return { status: 200, jsonBody: votes };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching votes: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch votes.' };
  }
}

const vote = corsMiddleware(voteHandler);

app.http('vote', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: vote,
});