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
      console.error('GA4 analytics: No session token found');
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = parseSessionToken(sessionToken);
    if (!session) {
      console.error('GA4 analytics: Invalid or expired session');
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (!session.accessToken) {
      console.error('GA4 analytics: No access token in session');
      return res.status(401).json({ error: "No access token found" });
    }

    // Get query parameters
    const { propertyId, startDate, endDate, metrics = 'sessions,totalUsers,screenPageViews,bounceRate,averageSessionDuration,conversions', dimensions = 'date' } = req.query;

    if (!propertyId) {
      return res.status(400).json({ error: "Property ID is required" });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    console.log('GA4 analytics: Fetching data for property:', propertyId, 'from', startDate, 'to', endDate);

    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${baseUrl}/api/auth/callback`,
    };

    const oauthHandler = new GoogleOAuthHandler(config);

    // Fetch analytics data
    const analyticsData = await oauthHandler.fetchGA4Analytics(
      session.accessToken, 
      propertyId as string, 
      startDate as string, 
      endDate as string, 
      metrics as string, 
      dimensions as string
    );

    console.log('GA4 analytics: Successfully fetched data');

    res.json(analyticsData);
  } catch (error) {
    console.error('Get GA4 analytics error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Determine status code based on error message
    let statusCode = 500;
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      statusCode = 429;
    } else if (errorMessage.includes('403') || errorMessage.includes('Access denied')) {
      statusCode = 403;
    } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('401') || errorMessage.includes('authenticated')) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      error: 'Failed to fetch GA4 analytics data',
      details: errorMessage,
      hint: 'Make sure the property ID is correct and you have access to it'
    });
  }
}
