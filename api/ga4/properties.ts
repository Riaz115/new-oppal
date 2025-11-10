import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleOAuthHandler, GoogleOAuthConfig, SESSION_COOKIE_NAME, parseSessionToken } from '../google-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    
    if (!sessionToken && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {});
      sessionToken = cookies[SESSION_COOKIE_NAME];
    }
    
    if (!sessionToken) {
      console.error('GA4 properties: No session token found');
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = parseSessionToken(sessionToken);
    if (!session) {
      console.error('GA4 properties: Invalid or expired session');
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (!session.accessToken) {
      console.error('GA4 properties: No access token in session');
      return res.status(401).json({ error: "No access token found" });
    }

    console.log('GA4 properties: Fetching properties for user:', session.email);

    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${baseUrl}/api/auth/callback`,
    };

    const oauthHandler = new GoogleOAuthHandler(config);
    const properties = await oauthHandler.fetchGA4Properties(session.accessToken);

    console.log('GA4 properties: Successfully fetched', properties.length, 'properties');
    res.json({ properties });
  } catch (error) {
    console.error('Get GA4 properties error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    res.status(500).json({
      error: 'Failed to fetch GA4 properties',
      details: error instanceof Error ? error.message : 'Unknown error',
      hint: 'Make sure you have granted Analytics access during sign-in'
    });
  }
}
