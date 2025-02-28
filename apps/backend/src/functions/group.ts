import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from '@prisma/client';
import { GroupRequestBody } from '../utils/types'; 
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function groupHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        switch (request.method) {
            case 'GET':
                // Handle GET /groups (get groups for a specific theme)
                return await getGroups(request, context);
            case 'POST':
                // Handle POST /groups (create a new group)
                return await createGroup(request, context);
            case 'PUT':
                // Handle PUT /groups/{id} (update a group)
                const updateGroupId = request.params.id;
                if (updateGroupId) {
                    return await updateGroup(updateGroupId, request, context);
                } else {
                    return { status: 400, body: "Group ID is required for update." };
                }
            case 'DELETE':
                // Handle DELETE /groups/{id} (delete a group)
                const deleteGroupId = request.params.id;
                if (deleteGroupId) {
                    return await deleteGroup(deleteGroupId, context);
                } else {
                    return { status: 400, body: "Group ID is required for deletion." };
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

// Get all groups for a specific theme
async function getGroups(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const themeId = request.query.get('theme_id');
        if (!themeId) {
            return { status: 400, body: "Theme ID is required." };
        }

        const groups = await prisma.groups.findMany({
            where: {
                theme_id: parseInt(themeId),
            },
        });

        return { status: 200, jsonBody: groups };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error fetching groups: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to fetch groups." };
    }
}

// Create a new group
async function createGroup(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Parse and validate the request body
        const body = await request.json() as GroupRequestBody;
        const newGroup = await prisma.groups.create({
            data: {
                theme_id: body.theme_id,
                group_name: body.group_name,
                team_lead: body.team_lead,
            },
        });

        return { status: 201, jsonBody: newGroup };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error creating group: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to create group." };
    }
}

// Update a group by ID
async function updateGroup(groupId: string, request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        // Parse and validate the request body
        const body = await request.json() as Partial<GroupRequestBody>;

        // Ensure only allowed fields are passed to Prisma
        const updateData: Partial<GroupRequestBody> = {
            group_name: body.group_name,
            team_lead: body.team_lead,
        };

        const updatedGroup = await prisma.groups.update({
            where: { group_id: parseInt(groupId) },
            data: updateData,
        });

        return { status: 200, jsonBody: updatedGroup };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error updating group: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to update group." };
    }
}

// Delete a group by ID
async function deleteGroup(groupId: string, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        await prisma.groups.delete({
            where: { group_id: parseInt(groupId) },
        });

        return { status: 204, body: "Group deleted successfully." };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error deleting group: ${error.message}`);
        } else {
            context.error(`Unknown error occurred: ${error}`);
        }
        return { status: 500, body: "Failed to delete group." };
    }
}

const group = corsMiddleware(groupHandler);

app.http('group', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: group
});