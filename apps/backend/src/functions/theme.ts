import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { ThemeRequestBody } from '../utils/types'; // Import the interface from types.ts

const prisma = new PrismaClient();

export async function theme(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    switch (request.method) {
      case 'GET':
        const themeId = request.params.id;
        if (themeId) {
          // Handle GET /themes/{id}
          return await getThemeById(themeId, context);
        } else {
          // Handle GET /themes
          return await getThemes(context);
        }
      case 'POST':
        // Handle POST /themes
        return await createTheme(request, context);
      case 'PUT':
        // Handle PUT /themes/{id}
        const updateThemeId = request.params.id;
        if (updateThemeId) {
          return await updateTheme(updateThemeId, request, context);
        } else {
          return { status: 400, body: 'Theme ID is required for update.' };
        }
      case 'DELETE':
        // Handle DELETE /themes/{id}
        const deleteThemeId = request.params.id;
        if (deleteThemeId) {
          return await deleteTheme(deleteThemeId, context);
        } else {
          return { status: 400, body: 'Theme ID is required for deletion.' };
        }
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

// Get all themes
async function getThemes(
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const themes = await prisma.theme.findMany();
    return { status: 200, jsonBody: themes };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching themes: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch themes.' };
  }
}

// Get theme by ID
async function getThemeById(
  themeId: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const theme = await prisma.theme.findUnique({
      where: { theme_id: parseInt(themeId) },
    });

    if (!theme) {
      return { status: 404, body: 'Theme not found.' };
    }

    return { status: 200, jsonBody: theme };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error fetching theme by ID: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to fetch theme.' };
  }
}

// Create a new theme
async function createTheme(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as ThemeRequestBody;
    const newTheme = await prisma.theme.create({
      data: {
        title: body.title,
        description: body.description,
        submission_deadline: new Date(body.submission_deadline),
        voting_deadline: new Date(body.voting_deadline),
        review_deadline: body.review_deadline,
        auto_assign_group: body.auto_assign_group,
        team_lead_acceptance: body.team_lead_acceptance,
        number_of_groups: body.number_of_groups,
        created_by: body.created_by,
      },
    });

    return { status: 201, jsonBody: newTheme };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error creating theme: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to create theme.' };
  }
}

// Update theme by ID
async function updateTheme(
  themeId: string,
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Parse and validate the request body
    const body = (await request.json()) as Partial<ThemeRequestBody>;
    const updatedTheme = await prisma.theme.update({
      where: { theme_id: parseInt(themeId) },
      data: body,
    });

    return { status: 200, jsonBody: updatedTheme };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error updating theme: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to update theme.' };
  }
}

// Delete theme by ID
async function deleteTheme(
  themeId: string,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    await prisma.theme.delete({
      where: { theme_id: parseInt(themeId) },
    });

    return { status: 204, body: 'Theme deleted successfully.' };
  } catch (error) {
    if (error instanceof Error) {
      context.error(`Error deleting theme: ${error.message}`);
    } else {
      context.error(`Unknown error occurred: ${error}`);
    }
    return { status: 500, body: 'Failed to delete theme.' };
  }
}

app.http('theme', {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  authLevel: 'anonymous',
  handler: theme,
});