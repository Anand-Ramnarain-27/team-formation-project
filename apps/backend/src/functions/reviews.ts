import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient, rating_enum } from '@prisma/client';
import { ReviewRequestBody, ratingEnumMap, ReviewDeadline } from '../utils/types';
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
        if (request.query.get('id')) {
          return await getReviewById(request, context);
        } else if (request.query.get('group_id')) {
          return await getReviewsByGroupId(request, context);
        } else if (request.query.get('reviewer_id')) {
          return await getReviewsByReviewerId(request, context);
        } else if (request.query.get('reviewee_id')) {
          return await getReviewsByRevieweeId(request, context);
        }
        return await getAllReviews(context);
      case 'POST':
        return await createReview(request, context);
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

export function isWithinReviewPeriod(reviewDeadlines: ReviewDeadline[]): boolean {
  const now = new Date();
  return reviewDeadlines.some((period) => {
    const start = new Date(period.start);
    const end = new Date(period.end);
    return now >= start && now <= end;
  });
}

async function getAllReviews(context: InvocationContext): Promise<HttpResponseInit> {
  try {
    const reviews = await prisma.review.findMany();
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

async function getReviewById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const reviewId = request.query.get('id');
    if (!reviewId) {
      return { status: 400, body: 'Review ID is required.' };
    }

    const review = await prisma.review.findUnique({
      where: { review_id: parseInt(reviewId, 10) },
    });

    if (!review) {
      return { status: 404, body: 'Review not found.' };
    }

    return { status: 200, jsonBody: review };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching review by ID: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching review by ID: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch review.' };
  }
}

async function getReviewsByGroupId(
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
    });

    return { status: 200, jsonBody: reviews };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching reviews by group ID: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching reviews by group ID: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch reviews.' };
  }
}

async function getReviewsByReviewerId(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const reviewerId = request.query.get('reviewer_id');
    if (!reviewerId) {
      return { status: 400, body: 'Reviewer ID is required.' };
    }

    const reviews = await prisma.review.findMany({
      where: { reviewer_id: parseInt(reviewerId, 10) },
    });

    return { status: 200, jsonBody: reviews };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching reviews by reviewer ID: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching reviews by reviewer ID: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch reviews.' };
  }
}

async function getReviewsByRevieweeId(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const revieweeId = request.query.get('reviewee_id');
    if (!revieweeId) {
      return { status: 400, body: 'Reviewee ID is required.' };
    }

    const reviews = await prisma.review.findMany({
      where: { reviewee_id: parseInt(revieweeId, 10) },
    });

    return { status: 200, jsonBody: reviews };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching reviews by reviewee ID: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching reviews by reviewee ID: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch reviews.' };
  }
}

async function checkExistingReview(
  reviewerId: number,
  revieweeId: number,
  groupId: number,
  context: InvocationContext
): Promise<boolean> {
  try {
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        group_id: groupId,
      },
    });
    return !!existingReview;
  } catch (error) {
    context.error(`Error checking existing review: ${error}`);
    throw error;
  }
}

async function createReview(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = await request.json();
    const reviewBody: ReviewRequestBody = body as ReviewRequestBody;

    const group = await prisma.groups.findUnique({
      where: { group_id: reviewBody.group_id },
      include: { theme: true },
    });

    if (!group || !group.theme) {
      return { status: 404, body: 'Group or theme not found.' };
    }

    const reviewDeadlines: ReviewDeadline[] = Array.isArray(group.theme.review_deadline)
      ? group.theme.review_deadline
      : JSON.parse(group.theme.review_deadline as string);

    if (!isWithinReviewPeriod(reviewDeadlines)) {
      return { status: 400, body: 'Reviews can only be submitted during the review period.' };
    }


    if (reviewBody.rating < 1 || reviewBody.rating > 5) {
      return { status: 400, body: 'Invalid rating value. Must be between 1 and 5.' };
    }

    if (!(reviewBody.rating in ratingEnumMap)) {
      return { status: 400, body: 'Invalid rating value.' };
    }

    const reviewExists = await checkExistingReview(
      reviewBody.reviewer_id,
      reviewBody.reviewee_id,
      reviewBody.group_id,
      context
    );

    if (reviewExists) {
      return { status: 400, body: 'You have already submitted a review for this member in the current review period.' };
    }

    const ratingValue = ratingEnumMap[reviewBody.rating as 1|2|3|4|5];

    const review = await prisma.review.create({
      data: {
        reviewer_id: reviewBody.reviewer_id,
        reviewee_id: reviewBody.reviewee_id,
        group_id: reviewBody.group_id,
        rating: ratingValue,
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

const review = corsMiddleware(reviewHandler);

app.http('review', {
  methods: ['GET', 'POST', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: review,
});