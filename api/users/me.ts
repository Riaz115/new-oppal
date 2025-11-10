import { VercelRequest, VercelResponse } from '@vercel/node';
import { SESSION_COOKIE_NAME, parseSessionToken } from '../google-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Set CORS headers
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  try {
    console.log('Request cookies:', req.cookies);
    console.log('Request headers.cookie:', req.headers.cookie);
    
    // Try to get cookie from req.cookies first
    let sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    
    // If not found in req.cookies, manually parse the Cookie header
    if (!sessionToken && req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc: Record<string, string>, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = decodeURIComponent(value);
        }
        return acc;
      }, {});
      sessionToken = cookies[SESSION_COOKIE_NAME];
      console.log('Parsed cookies from header:', cookies);
      console.log('Found session token:', sessionToken ? 'Yes' : 'No');
    }
    
    // Also decode if from req.cookies
    if (sessionToken) {
      try {
        sessionToken = decodeURIComponent(sessionToken);
      } catch (e) {
        // Already decoded or no encoding
      }
    }
    
    if (!sessionToken) {
      console.log('No session token found in request. Cookie name:', SESSION_COOKIE_NAME);
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log('Session token length:', sessionToken.length);
    console.log('Session token preview:', sessionToken.substring(0, 50));
    
    const session = parseSessionToken(sessionToken);
    if (!session) {
      console.log('Invalid or expired session token. Token length:', sessionToken.length);
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    
    console.log('Successfully parsed session for user:', session.email);

    res.json({
      id: session.id,
      email: session.email,
      name: session.name,
      picture: session.picture,
      hasGA4Access: session.hasGA4Access,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
