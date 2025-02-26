import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient, rating_enum } from '@prisma/client';
import { ReviewRequestBody, ratingEnumMap } from '../utils/types';

const prisma = new PrismaClient();

export async function review(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'POST':
        // Handle POST /reviews (submit a review)
        return await submitReview(request, context);
      case 'GET':
        // Handle GET /reviews (get reviews for a specific group)
        return await getReviews(request, context);
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

// Submit a review
async function submitReview(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as ReviewRequestBody;

    // Validate the rating (should be between 1 and 5)
    if (body.rating < 1 || body.rating > 5) {
      return { status: 400, body: 'Rating must be between 1 and 5.' };
    }
    
    const ratingEnum = ratingEnumMap[body.rating];

    // Create a new review
    const newReview = await prisma.review.create({
      data: {
        reviewer_id: body.reviewer_id,
        reviewee_id: body.reviewee_id,
        group_id: body.group_id,
        rating: ratingEnum, // Use the mapped enum value
        feedback: body.feedback,
      },
    });

    return { status: 201, jsonBody: newReview };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error submitting review: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to submit review.' };
  }
}

// Get reviews for a specific group
async function getReviews(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const groupId = request.query.get('group_id');
    if (!groupId) {
      return { status: 400, body: 'Group ID is required.' };
    }

    // Fetch all reviews for the specified group
    const reviews = await prisma.review.findMany({
      where: {
        group_id: parseInt(groupId),
      },
    });

    return { status: 200, jsonBody: reviews };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching reviews: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch reviews.' };
  }
}

app.http('review', {
  methods: ['GET', 'POST'],
  authLevel: 'anonymous',
  handler: review,
});
