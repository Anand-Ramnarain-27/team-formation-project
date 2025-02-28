import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export function corsMiddleware(handler: Function) {
  return async function (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS request (preflight)
    if (request.method === 'OPTIONS') {
      return {
        status: 204,
        headers
      };
    }

    // Call the original handler
    const response = await handler(request, context);

    // Add CORS headers to the response
    return {
      ...response,
      headers: {
        ...response.headers,
        ...headers
      }
    };
  };
}
