import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleOAuthHandler, GoogleOAuthConfig, SESSION_COOKIE_NAME, createSessionToken, UserSession } from '../google-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, error } = req.query;
  const baseUrl = process.env.NODE_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  // Handle OAuth errors
  if (error) {
    return res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Authentication Error</h2>
        <p style="color: #6b7280; margin: 20px 0;">There was an error during the sign-in process: ${error}</p>
        <a href="/signup" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Try Again</a>
      </div>
    `);
  }

  if (!code) {
    return res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Missing Authorization Code</h2>
        <p style="color: #6b7280; margin: 20px 0;">No authorization code was received from Google.</p>
        <a href="/signup" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Try Again</a>
      </div>
    `);
  }

  try {
    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${baseUrl}/api/auth/callback`,
    };

    const oauthHandler = new GoogleOAuthHandler(config);

    // Exchange code for tokens
    const tokens = await oauthHandler.exchangeCodeForToken(code as string);

    // Get user info
    const userInfo = await oauthHandler.getUserInfo(tokens.access_token);

    // Verify GA4 access
    const hasGA4Access = await oauthHandler.verifyGA4Access(tokens.access_token);

    // Create session
    const userSession = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expires_in * 1000),
      hasGA4Access,
    };

    const sessionToken = createSessionToken(userSession);
    const encodedSessionToken = encodeURIComponent(sessionToken);

    // Set cookie and redirect
    const cookieValue = process.env.NODE_ENV === 'production'
      ? `${SESSION_COOKIE_NAME}=${encodedSessionToken}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${60 * 24 * 60 * 60}`
      : `${SESSION_COOKIE_NAME}=${encodedSessionToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 24 * 60 * 60}`;
    
    res.setHeader('Set-Cookie', cookieValue);

    // Redirect to dashboard after successful authentication
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:5173';

    res.redirect(302, `${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Authentication Failed</h2>
        <p style="color: #6b7280; margin: 20px 0;">Failed to complete sign up. Please try again.</p>
        <a href="/signup" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Try Again</a>
      </div>
    `);
  }
}
