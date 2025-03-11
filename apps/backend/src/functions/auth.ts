import {
    app,
    HttpRequest,
    HttpResponseInit,
    InvocationContext,
  } from '@azure/functions';
  import * as https from 'https';
  import { IncomingMessage } from 'http';
  import { corsMiddleware } from '../utils/cors';
  import { PrismaClient } from '@prisma/client';
  
  const prisma = new PrismaClient();
  
  async function auth(
    request: HttpRequest,
    context: InvocationContext
  ): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
  
    const code = request.query.get('code');
  
    if (!code) {
      return { status: 400, body: 'Authorization code is required' };
    }
  
    try {
      // Step 1: Exchange the code for an access token
      const accessToken = await exchangeCodeForAccessToken(code);
  
      // Step 2: Fetch user details from GitHub
      const userDetails = await fetchGitHubUserDetails(accessToken);
  
      // Step 3: Fetch user emails from GitHub
      const emails = await fetchGitHubUserEmails(accessToken);
  
      // Step 4: Find the primary email or the first available email
      const primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
  
      // Step 5: Store or update user in the database
      const user = await prisma.users.upsert({
        where: { email: primaryEmail },
        update: {
          name: userDetails.name || userDetails.login,
        },
        create: {
          name: userDetails.name || userDetails.login,
          email: primaryEmail,
          role: 'Student', // Default role
          auth_provider: 'github',
        },
      });
  
      // Step 6: Return the access token and user details to the frontend
      return {
        status: 200,
        jsonBody: {
          accessToken,
          user: {
            id: user.user_id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
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
        Accept: 'application/json',
      },
    };
  
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res: IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk.toString()));
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
  
  // Helper function to fetch user details from GitHub
  async function fetchGitHubUserDetails(accessToken: string): Promise<any> {
    const options = {
      hostname: 'api.github.com',
      path: '/user',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Team Formation App',
      },
    };
  
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res: IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk.toString()));
        res.on('end', () => {
          const userDetails = JSON.parse(data);
          resolve(userDetails);
        });
      });
  
      req.on('error', (error: Error) => reject(error));
      req.end();
    });
  }
  
  // Helper function to fetch user emails from GitHub
  async function fetchGitHubUserEmails(accessToken: string): Promise<any> {
    const options = {
      hostname: 'api.github.com',
      path: '/user/emails',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Team Formation App',
      },
    };
  
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res: IncomingMessage) => {
        let data = '';
        res.on('data', (chunk: Buffer) => (data += chunk.toString()));
        res.on('end', () => {
          const emails = JSON.parse(data);
          resolve(emails);
        });
      });
  
      req.on('error', (error: Error) => reject(error));
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