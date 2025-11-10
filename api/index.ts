import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { Resend } from 'resend';
import { 
  GoogleOAuthHandler, 
  GoogleOAuthConfig, 
  UserSession, 
  SESSION_COOKIE_NAME, 
  createSessionToken, 
  parseSessionToken 
} from './google-oauth.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`]
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Contact form submission schema
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  subject: z.string().optional()
});

// Contact form submission endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const validation = ContactFormSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Invalid form data", 
        details: validation.error.errors 
      });
    }

    const { name, email, company, message, subject } = validation.data;

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email to paul@digitalawol.com
    await resend.emails.send({
      from: "Opal44 Contact Form <noreply@opal44.com>",
      to: ["paul@digitalawol.com"],
      subject: subject ? `${subject} - ${name}` : `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">${subject || 'New Contact Form Submission'}</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          </div>
          
          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;">
              <strong>Reply to:</strong> ${email}
            </p>
          </div>
        </div>
      `,
      text: `
${subject || 'New Contact Form Submission'}

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ''}

Message:
${message}

Reply to: ${email}
      `
    });

    res.json({ success: true, message: "Thank you for your message! We'll get back to you soon." });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: "Failed to send message. Please try again later." });
  }
});

// Google OAuth redirect URL endpoint
app.get('/api/oauth/google/redirect_url', async (req, res) => {
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
});

// Get the current user object for the frontend
app.get("/api/users/me", async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];
    
    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = parseSessionToken(sessionToken);
    
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

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
});

// Get GA4 properties for the authenticated user
app.get("/api/ga4/properties", async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];
    
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
  } catch (error: any) {
    console.error('Get GA4 properties error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return more detailed error information
    res.status(500).json({ 
      error: 'Failed to fetch GA4 properties',
      details: error.message,
      hint: 'Make sure you have granted Analytics access during sign-in'
    });
  }
});

// Get GA4 analytics data for a specific property
app.get("/api/ga4/analytics", async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];
    
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
    const { propertyId, startDate, endDate, metrics = 'sessions,activeUsers,screenPageViews', dimensions = 'date' } = req.query;

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
  } catch (error: any) {
    console.error('Get GA4 analytics error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to fetch GA4 analytics data',
      details: error.message,
      hint: 'Make sure the property ID is correct and you have access to it'
    });
  }
});

// OAuth callback route - handles the redirect from Google
app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

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
    const tokens = await oauthHandler.exchangeCodeForToken(code);
    
    // Get user info
    const userInfo = await oauthHandler.getUserInfo(tokens.access_token);
    
    // Verify GA4 access
    const hasGA4Access = await oauthHandler.verifyGA4Access(tokens.access_token);

    // Create session
    const userSession: UserSession = {
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

    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
    });

    // Redirect to dashboard after successful authentication
    const frontendUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:5173';
    
    res.redirect(`${frontendUrl}/dashboard`);
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
});

// Chat endpoint for AI assistant
app.post('/api/chat', async (req, res) => {
  try {
    const { question, propertyId, startDate, endDate } = req.body;

    if (!question || !propertyId) {
      return res.status(400).json({ error: 'Question and propertyId are required' });
    }

    // Get session and access token
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];
    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const session = parseSessionToken(sessionToken);
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    // Fetch real GA4 data
    const baseUrl = process.env.NODE_ENV === 'production'
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: `${baseUrl}/api/auth/callback`,
    };

    const oauthHandler = new GoogleOAuthHandler(config);
    
    // Fetch GA4 analytics data
    const ga4Data = await oauthHandler.fetchGA4Analytics(
      session.accessToken,
      propertyId,
      startDate,
      endDate
    );

    // Using OpenAI API via fetch (works with new API keys including sk-proj-*)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful GA4 (Google Analytics 4) analytics assistant. You analyze the user's REAL GA4 data and provide insights in a structured, engaging format.

Current context:
- Property ID: ${propertyId}
- Date range: ${startDate} to ${endDate}

REAL GA4 DATA (use this data to answer questions):

Overall Metrics:
Sessions: ${ga4Data.metrics.sessions}
Users: ${ga4Data.metrics.users}
Pageviews: ${ga4Data.metrics.pageViews}
Bounce Rate: ${ga4Data.metrics.bounceRate.toFixed(2)}%
Average Session Duration: ${(ga4Data.metrics.avgSessionDuration / 60).toFixed(2)} minutes
Conversions: ${ga4Data.metrics.conversions}

Traffic Sources (Channels): ${JSON.stringify(ga4Data.trafficSources)}

CRITICAL INSTRUCTIONS:
1. You MUST use the REAL GA4 data provided above
2. If the question asks for specific data (like top countries, top pages, etc.) that is NOT in the data above, explain that you have overall metrics and channel data available, and provide insights based on what you can see
3. DO NOT make up fake specific data like country names, page URLs, or detailed breakdowns that aren't provided
4. Present what you CAN answer from the real data in the same engaging format
5. The format examples below show HOW to present data, but use ONLY real data

ANSWER WITH THE PROVIDED REAL GA4 DATA - Use these examples as STYLE GUIDANCE only:

Format examples (use this style with REAL data):
For "What are my top-performing pages?":
🤖 AI Assistant: Based on your GA4 data, here are your top-performing pages: 1. / - [real pageviews], 2. /products - [real pageviews], 3. /about - [real pageviews]

For "How many users came from social media?":
🤖 AI Assistant: From social media platforms, you received [real sessions] sessions, which represents [real percentage]% of your total traffic. This is performing well compared to the industry average of 8-12%.

For "Which country has the highest engagement?":
🤖 AI Assistant: Based on your geographic data, your top countries by sessions are: 1. United States - [real sessions] sessions ([real %]), 2. United Kingdom - [real sessions] ([real %]), 3. Canada - [real sessions] ([real %])

For "Compare this month to last month":
🤖 AI Assistant: Comparing this month to last month: 📈 Sessions: [real] (+[%]), 👤 Users: [real] (+[%]), 📄 Pageviews: [real] (+[%]), ⚡ Bounce Rate: [real]% ([±%]). Overall analysis...

For "What's my bounce rate trend?":
🤖 AI Assistant: Your current bounce rate is [real]%, which is good for most industries (typically 40-60%). Your average session duration is [real], indicating users are engaged. Consider optimizing pages with higher bounce rates.

CRITICAL RULES:
1. ALWAYS start with "🤖 AI Assistant:" 
2. ALWAYS answer ANY question related to GA4, web analytics, traffic, users, conversions, pages, countries, channels, etc.
3. Use the REAL GA4 data provided above to answer
4. If specific data is not in the metrics above, explain what you can see from the available data
5. Format: Use numbered lists, percentages, emojis (📈👤📄⚡), and actionable insights
6. Provide context and industry comparisons when relevant

VALID QUESTION TYPES - ANSWER ALL OF THESE:
✓ Conversion rates by channel (Organic Search vs Paid Search)
✓ Top content pages leading to events
✓ Engagement time per session by device/location
✓ New users by channel grouping
✓ Top channels by traffic
✓ Top pages by views
✓ Top countries by new users
✓ Session data, user behavior, traffic sources
✓ ANY question about analytics data, metrics, or website performance

ONLY REJECT (NOTHING ELSE):
✗ Greetings: "Hello", "How are you?", "Good morning"
✗ Weather questions
✗ Personal questions: "Tell me about yourself"
✗ Topics completely unrelated to web analytics or GA4

For rejected questions only: "I cannot answer your question because it is not related to GA4 analytics. Please ask me about GA4 data and I will help you."

IMPORTANT: The examples above are just for formatting reference. Answer ALL analytics-related questions using the REAL data provided.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(errorData?.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as any;
    const answer = data?.choices?.[0]?.message?.content || 'No response generated';

    return res.status(200).json({
      answer: answer,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message || 'Unknown error',
    });
  }
});

// Logout endpoint
app.get('/api/logout', async (req, res) => {
  try {
    console.log('Logout endpoint called');
    
    // Clear cookies by setting them to empty with immediate expiration
    const cookieOptions = [
      `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    ];
    
    res.setHeader('Set-Cookie', cookieOptions);
    
    console.log('Cookies cleared in Express app');
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Export for Vercel serverless function
export default app;

