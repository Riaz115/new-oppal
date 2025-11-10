import { VercelRequest, VercelResponse } from '@vercel/node';
import { SESSION_COOKIE_NAME } from './google-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Logout requested, clearing cookies...');
    
    // Clear cookies with multiple variations to ensure they're cleared everywhere
    const cookieOptions = [
      `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Secure; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=; Path=/; SameSite=None; Secure; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=; Path=/; SameSite=Lax; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=""; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=""; Path=/; Max-Age=0`,
      `${SESSION_COOKIE_NAME}=deleted; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    ];
    
    res.setHeader('Set-Cookie', cookieOptions);
    
    console.log('Cookies cleared successfully');
    
    // Also clear the cookie header
    res.removeHeader('Cookie');
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
}
