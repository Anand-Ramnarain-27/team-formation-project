import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient, rating_enum } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

// Map rating_enum to numeric values
const ratingMap: Record<rating_enum, number> = {
  [rating_enum.RATING_1]: 1,
  [rating_enum.RATING_2]: 2,
  [rating_enum.RATING_3]: 3,
  [rating_enum.RATING_4]: 4,
  [rating_enum.RATING_5]: 5,
};

export async function studentProfileHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    const userId = request.query.get('userId');
    if (!userId) {
      return { status: 400, body: 'userId query parameter is required.' };
    }

    // Fetch student details
    const student = await prisma.users.findUnique({
      where: { user_id: parseInt(userId, 10) },
    });

    if (!student) {
      return { status: 404, body: 'Student not found.' };
    }

    // Fetch ideas submitted by the student
    const ideas = await prisma.ideas.findMany({
      where: { submitted_by: parseInt(userId, 10) },
      include: {
        votes: true, // Include votes for each idea
      },
    });

    // Fetch groups where the student is a member or team lead
    const groupMemberships = await prisma.group_members.findMany({
      where: { user_id: parseInt(userId, 10) },
      include: { group: true },
    });

    const teamLeadGroups = await prisma.groups.findMany({
      where: { team_lead: parseInt(userId, 10) },
    });

    // Combine groups (remove duplicates)
    const groups = [
      ...groupMemberships.map((membership) => membership.group),
      ...teamLeadGroups,
    ].filter(
      (group, index, self) =>
        index === self.findIndex((g) => g.group_id === group.group_id)
    );

    // Fetch reviews received by the student
    const reviews = await prisma.review.findMany({
      where: { reviewee_id: parseInt(userId, 10) },
    });

    // Calculate average rating from received reviews
    const averageRating =
      reviews.length > 0
        ? reviews.reduce(
            (acc, review) => acc + ratingMap[review.rating], // Convert rating_enum to numeric value
            0
          ) / reviews.length
        : 0;

    // Calculate participation stats
    const participationStats = {
      ideas_submitted: ideas.length,
      votes_cast: ideas.reduce(
        (acc: number, idea: { votes: { length: number } }) =>
          acc + idea.votes.length,
        0
      ),
      reviews_completed: reviews.length,
      totalIdeas: ideas.length,
      totalVotes: ideas.reduce(
        (acc: number, idea: { votes: { length: number } }) =>
          acc + idea.votes.length,
        0
      ),
      totalReviews: reviews.length,
      averageRating: averageRating, // Use the calculated average rating
    };

    // Return the student profile data
    const profileData = {
      student,
      ideas,
      groups,
      reviews,
      participationStats,
    };

    return { status: 200, jsonBody: profileData };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching student profile: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Internal Server Error' };
  } finally {
    await prisma.$disconnect();
  }
}

// Wrap the handler with CORS middleware
const studentProfile = corsMiddleware(studentProfileHandler);

// Register the Azure Function
app.http('studentProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: studentProfile,
});