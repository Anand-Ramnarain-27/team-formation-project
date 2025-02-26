import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GetThemes(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        const themes = await prisma.theme.findMany();
        return {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(themes)
        };
    } catch (error) {
        console.error('Error fetching themes:', error);
        return {
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
        };
    } finally {
        await prisma.$disconnect();
    }
};

app.http('GetThemes', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: GetThemes
});