import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { Prisma, PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';
import {
  ThemeCreateRequestBody,
  ThemeUpdateRequestBody,
  ReviewDeadline,
} from '../utils/types';

const prisma = new PrismaClient();

export async function themeHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        if (request.query.get('id')) {
          return await getThemeById(request, context);
        }
        return await getThemes(context);
      case 'POST':
        return await createTheme(request, context);
      case 'PUT':
        return await updateTheme(request, context);
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

async function getThemes(
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themes = await prisma.theme.findMany();

    const formattedThemes = themes.map((theme) => ({
      ...theme,
      review_deadline: Array.isArray(theme.review_deadline)
        ? theme.review_deadline
        : typeof theme.review_deadline === 'string'
        ? JSON.parse(theme.review_deadline)
        : [],
    }));

    return { status: 200, jsonBody: formattedThemes };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching themes: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while fetching themes: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch themes.' };
  }
}

async function getThemeById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themeId = request.query.get('id');
    if (!themeId) {
      return { status: 400, body: 'Theme ID is required.' };
    }

    const theme = await prisma.theme.findUnique({
      where: { theme_id: parseInt(themeId, 10) },
    });

    if (!theme) {
      return { status: 404, body: 'Theme not found.' };
    }

    const processedTheme = {
      ...theme,
      review_deadline:
        typeof theme.review_deadline === 'string'
          ? JSON.parse(theme.review_deadline)
          : theme.review_deadline,
    };

    return { status: 200, jsonBody: processedTheme };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching theme by ID: ${error.message}`);
    } else {
      context.error(
        `Unknown error occurred while fetching theme by ID: ${error}`
      );
    }
    return { status: 500, body: 'Failed to fetch theme.' };
  }
}

async function createTheme(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as ThemeCreateRequestBody;

    const submission_deadline = new Date(body.submission_deadline);
    const voting_deadline = new Date(body.voting_deadline);

    const newtheme = await prisma.theme.create({
      data: {
        title: body.title,
        description: body.description,
        submission_deadline: submission_deadline,
        voting_deadline: voting_deadline,
        review_deadline: JSON.stringify(body.review_deadline),
        auto_assign_group: body.auto_assign_group,
        team_lead_acceptance: body.team_lead_acceptance,
        number_of_groups: body.number_of_groups,
        created_by: body.created_by,
      },
    });

    return { status: 201, jsonBody: newtheme };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating theme: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while creating theme: ${error}`);
    }
    return { status: 500, body: 'Failed to create theme.' };
  }
}

async function updateTheme(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themeId = request.query.get('id');
    if (!themeId) {
      return { status: 400, body: 'Theme ID is required.' };
    }

    const body = (await request.json()) as ThemeUpdateRequestBody;
    if (typeof body !== 'object' || body === null) {
      return { status: 400, body: 'Invalid request body' };
    }

    const theme = await prisma.theme.update({
      where: { theme_id: parseInt(themeId, 10) },
      data: {
        title: body.title,
        description: body.description,
        submission_deadline: body.submission_deadline,
        voting_deadline: body.voting_deadline,
        review_deadline: JSON.stringify(body.review_deadline),
        auto_assign_group: body.auto_assign_group,
        team_lead_acceptance: body.team_lead_acceptance,
        number_of_groups: body.number_of_groups,
        created_by: body.created_by,
      },
    });

    return { status: 200, jsonBody: theme };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error updating theme: ${error.message}`);
    } else {
      context.error(`Unknown error occurred while updating theme: ${error}`);
    }
    return { status: 500, body: 'Failed to update theme.' };
  }
}

const theme = corsMiddleware(themeHandler);

app.http('theme', {
  methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  authLevel: 'anonymous',
  handler: theme,
});
