import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export function corsMiddleware(handler: Function) {
  return async function (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers
      };
    }

    const response = await handler(request, context);

    return {
      ...response,
      headers: {
        ...response.headers,
        ...headers
      }
    };
  };
}
