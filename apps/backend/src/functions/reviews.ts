import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient, rating_enum } from '@prisma/client';
import { ReviewRequestBody,ratingEnumMap } from '../utils/types';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function reviewHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        return await getReviews(request, context);
      case 'POST':
        return await createReview(request, context);
      case 'DELETE':
        return await deleteReview(request, context);
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

    const reviews = await prisma.review.findMany({
      where: { group_id: parseInt(groupId, 10) },
      include: {
        reviewer: { select: { name: true } },
        reviewee: { select: { name: true } },
      },
    });

    return { status: 200, jsonBody: reviews };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching reviews: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching reviews: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch reviews.' };
  }
}

// Create a new review
async function createReview(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const reviewBody: ReviewRequestBody = body as ReviewRequestBody;

    // Map the numeric rating to the corresponding enum value
    const ratingEnumValue = ratingEnumMap[reviewBody.rating];
    if (!ratingEnumValue) {
      return { status: 400, body: 'Invalid rating value.' };
    }

    const review = await prisma.review.create({
      data: {
        reviewer_id: reviewBody.reviewer_id,
        reviewee_id: reviewBody.reviewee_id,
        group_id: reviewBody.group_id,
        rating: ratingEnumValue, // Use the enum value
        feedback: reviewBody.feedback,
      },
    });

    return { status: 201, jsonBody: review };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating review: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while creating review: ${error}`);
    }
    return { status: 500, body: 'Failed to create review.' };
  }
}
 
// Delete a review
async function deleteReview(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const reviewId = request.query.get('id');
    if (!reviewId) {
      return { status: 400, body: 'Review ID is required.' };
    }

    await prisma.review.delete({
      where: { review_id: parseInt(reviewId, 10) },
    });

    return { status: 200, body: 'Review deleted successfully.' };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error deleting review: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while deleting review: ${error}`);
    }
    return { status: 500, body: 'Failed to delete review.' };
  }
}

const review = corsMiddleware(reviewHandler);

app.http('review', {
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: review,
});