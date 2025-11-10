import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleOAuthHandler, GoogleOAuthConfig, parseSessionToken, SESSION_COOKIE_NAME } from './google-oauth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Fetch real GA4 data based on the question
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
}
