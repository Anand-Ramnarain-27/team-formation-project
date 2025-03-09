import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext,
} from '@azure/functions';
import { PrismaClient } from '@prisma/client';
import { corsMiddleware } from '../utils/cors';

const prisma = new PrismaClient();

export async function questionHandler(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    try {
        switch (request.method) {
            case 'GET':
                return await getQuestionsByThemeId(request, context);
            case 'POST':
                return await createQuestion(request, context);
            case 'PUT':
                return await updateQuestion(request, context);
            case 'DELETE':
                return await deleteQuestion(request, context);
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

async function getQuestionsByThemeId(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const themeId = request.query.get('id');
        if (!themeId) {
            return { status: 400, body: 'Theme ID is required.' };
        }

        const questions = await prisma.question.findMany({
            where: { theme_id: parseInt(themeId, 10) },
        });

        return { status: 200, jsonBody: questions };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error fetching questions by theme ID: ${error.message}`);
        } else {
            context.error(`Unknown error occurred while fetching questions by theme ID: ${error}`);
        }
        return { status: 500, body: 'Failed to fetch questions.' };
    }
}

async function createQuestion(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = (await request.json()) as { theme_id: number; question_text: string };

        const newQuestion = await prisma.question.create({
            data: {
                theme_id: body.theme_id,
                question_text: body.question_text,
            },
        });

        return { status: 201, jsonBody: newQuestion };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error creating question: ${error.message}`);
        } else {
            context.error(`Unknown error occurred while creating question: ${error}`);
        }
        return { status: 500, body: 'Failed to create question.' };
    }
}

async function updateQuestion(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = (await request.json()) as { id: number; theme_id: number; question_text: string };
        const questionId = body.id;

        const updatedQuestion = await prisma.question.update({
            where: { question_id: questionId },
            data: {
                theme_id: body.theme_id,
                question_text: body.question_text,
            },
        });

        return { status: 200, jsonBody: updatedQuestion };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error updating question: ${error.message}`);
        } else {
            context.error(`Unknown error occurred while updating question: ${error}`);
        }
        return { status: 500, body: 'Failed to update question.' };
    }
}

async function deleteQuestion(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = (await request.json()) as { id: number };
        const questionId = body.id;

        await prisma.question.delete({
            where: { question_id: questionId },
        });

        return { status: 204, body: 'Question deleted successfully.' };
    } catch (error) {
        if (error instanceof Error) {
            context.error(`Error deleting question: ${error.message}`);
        } else {
            context.error(`Unknown error occurred while deleting question: ${error}`);
        }
        return { status: 500, body: 'Failed to delete question.' };
    }
}

const question = corsMiddleware(questionHandler);

app.http('question', {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: question,
});