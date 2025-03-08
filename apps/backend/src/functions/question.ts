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
  
  // Get Questions by Theme ID
  async function getQuestionsByThemeId(
    request: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> {
    try {
      const themeId = request.query.get('theme_id');
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
  
  // Create a New Question
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
  
  const question = corsMiddleware(questionHandler);
  
  app.http('question', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: question,
  });