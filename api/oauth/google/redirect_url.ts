import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleOAuthHandler, GoogleOAuthConfig } from '../../google-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${baseUrl}/api/auth/callback`,
    };

    const oauthHandler = new GoogleOAuthHandler(config);
    const redirectUrl = oauthHandler.getAuthUrl();

    res.json({ redirectUrl });
  } catch (error) {
    console.error('OAuth redirect error:', error);
    res.status(500).json({ error: 'Failed to generate redirect URL' });
  }
}
