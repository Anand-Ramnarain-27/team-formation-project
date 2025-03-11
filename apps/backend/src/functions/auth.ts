import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import * as https from 'https';
import { IncomingMessage } from 'http';
import { corsMiddleware } from '../utils/cors';

async function auth(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const code = request.query.get('code');

    if (!code) {
        return { status: 400, body: 'Authorization code is required' };
    }

    try {
        // Step 1: Exchange the code for an access token
        const accessToken = await exchangeCodeForAccessToken(code);

        // Step 2: Return the access token to the frontend
        return {
            status: 200,
            jsonBody: {
                accessToken,
            },
        };
    } catch (error) {
        if (error instanceof Error) {
            context.log(`Error during GitHub login: ${error.message}`);
        } else {
            context.log(`Error during GitHub login: ${String(error)}`);
        }
        return { status: 500, body: 'Internal Server Error' };
    }
}

// Helper function to exchange the code for an access token
async function exchangeCodeForAccessToken(code: string): Promise<string> {
    const data = JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
    });

    const options = {
        hostname: 'github.com',
        path: '/login/oauth/access_token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res: IncomingMessage) => {
            let data = '';
            res.on('data', (chunk: Buffer) => data += chunk.toString());
            res.on('end', () => {
                const response = JSON.parse(data);
                if (response.error) {
                    reject(new Error(response.error_description));
                } else {
                    resolve(response.access_token);
                }
            });
        });

        req.on('error', (error: Error) => reject(error));
        req.write(data);
        req.end();
    });
}

// Wrap the auth function with the corsMiddleware
const authWithCors = corsMiddleware(auth);

app.http('auth', {
    methods: ['GET', 'POST', 'OPTIONS'],
    authLevel: 'anonymous',
    handler: authWithCors,
});