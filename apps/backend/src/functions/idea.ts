import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient, status_enum } from '@prisma/client';
import { IdeaRequestBody } from '../utils/types'; // Import the interface

const prisma = new PrismaClient();

export async function idea(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        switch (request.method) {
            case 'GET':
                const ideaId = request.params.id;
                if (ideaId) {
                    // Handle GET /ideas/{id}
                    return await getIdeaById(ideaId, context);
                } else {
                    // Handle GET /ideas
                    return await getIdeas(request, context);
                }
            case 'POST':
                // Handle POST /ideas
                return await submitIdea(request, context);
            case 'PUT':
                // Handle PUT /ideas/{id}
                const updateIdeaId = request.params.id;
                if (updateIdeaId) {
                    return await updateIdea(updateIdeaId, request, context);
                } else {
                    return { status: 400, body: "Idea ID is required for update." };
                }
            case 'DELETE':
                // Handle DELETE /ideas/{id}
                const deleteIdeaId = request.params.id;
                if (deleteIdeaId) {
                    return await deleteIdea(deleteIdeaId, context);
                } else {
                    return { status: 400, body: "Idea ID is required for deletion." };
                }
            default:
                return { status: 405, body: "Method not allowed." };
        }
    } catch (error) {
        // Safely handle the error
        if (error instanceof Error) {
            context.error(`Error processing request: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Internal Server Error" };
    }
}

// Get all ideas (optionally filtered by theme_id)
async function getIdeas(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const themeId = request.query.get('theme_id');
        const ideas = await prisma.ideas.findMany({
            where: themeId ? { theme_id: parseInt(themeId) } : undefined,
        });
        return { status: 200, jsonBody: ideas };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error fetching ideas: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to fetch ideas." };
    }
}

// Get idea by ID
async function getIdeaById(ideaId: string, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const idea = await prisma.ideas.findUnique({
            where: { idea_id: parseInt(ideaId) },
        });

        if (!idea) {
            return { status: 404, body: "Idea not found." };
        }

        return { status: 200, jsonBody: idea };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error fetching idea by ID: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to fetch idea." };
    }
}

// Submit a new idea
async function submitIdea(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Parse and validate the request body
        const body = await request.json() as IdeaRequestBody;
        const newIdea = await prisma.ideas.create({
            data: {
                theme_id: body.theme_id,
                submitted_by: body.submitted_by,
                idea_name: body.idea_name,
                description: body.description,
                status: body.status || status_enum.Pending, // Use the enum value
            },
        });

        return { status: 201, jsonBody: newIdea };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error creating idea: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to create idea." };
    }
}

// Update idea by ID
async function updateIdea(ideaId: string, request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Parse and validate the request body
        const body = await request.json() as Partial<IdeaRequestBody>;

        // Ensure only allowed fields are passed to Prisma
        const updateData: Partial<IdeaRequestBody> = {
            idea_name: body.idea_name,
            description: body.description,
            status: body.status,
        };

        const updatedIdea = await prisma.ideas.update({
            where: { idea_id: parseInt(ideaId) },
            data: updateData,
        });

        return { status: 200, jsonBody: updatedIdea };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error updating idea: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to update idea." };
    }
}

// Delete idea by ID
async function deleteIdea(ideaId: string, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        await prisma.ideas.delete({
            where: { idea_id: parseInt(ideaId) },
        });

        return { status: 204, body: "Idea deleted successfully." };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error deleting idea: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to delete idea." };
    }
}

app.http('idea', {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    authLevel: 'anonymous',
    handler: idea
});