import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { z } from "zod";
import { Resend } from "resend";
import {
  GoogleOAuthHandler,
  GoogleOAuthConfig,
  UserSession,
  SESSION_COOKIE_NAME,
  createSessionToken,
  parseSessionToken,
} from "./google-oauth.js";

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://opal44.com", "https://www.opal44.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static files from the client build
app.use(express.static(join(__dirname, "../../dist/client")));

// Contact form submission schema
const ContactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  subject: z.string().optional(),
});

// Contact form submission endpoint
app.post("/api/contact", async (req, res) => {
  try {
    const validation = ContactFormSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Invalid form data",
        details: validation.error.errors,
      });
    }

    const { name, email, company, message, subject } = validation.data;

    // Initialize Resend with API key
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Send email to paul@digitalawol.com
    await resend.emails.send({
      from: "Opal44 Contact Form <noreply@opal44.com>",
      to: ["paul@digitalawol.com"],
      subject: subject
        ? `${subject} - ${name}`
        : `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">${
            subject || "New Contact Form Submission"
          }</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #374151;">Contact Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
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
${subject || "New Contact Form Submission"}

Name: ${name}
Email: ${email}
${company ? `Company: ${company}` : ""}

Message:
${message}

Reply to: ${email}
      `,
    });

    res.json({
      success: true,
      message: "Thank you for your message! We'll get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res
      .status(500)
      .json({ error: "Failed to send message. Please try again later." });
  }
});

// Google OAuth redirect URL endpoint
app.get("/api/oauth/google/redirect_url", async (req, res) => {
  try {
    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri:
        process.env.NODE_ENV === "production"
          ? "https://opal44.com/api/auth/callback"
          : "http://localhost:3000/api/auth/callback",
    };

    const oauthHandler = new GoogleOAuthHandler(config);
    const redirectUrl = oauthHandler.getAuthUrl();

    res.json({ redirectUrl });
  } catch (error) {
    console.error("OAuth redirect error:", error);
    res.status(500).json({ error: "Failed to generate redirect URL" });
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
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get GA4 properties for the authenticated user
app.get("/api/ga4/properties", async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      console.error("GA4 properties: No session token found");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = parseSessionToken(sessionToken);

    if (!session) {
      console.error("GA4 properties: Invalid or expired session");
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (!session.accessToken) {
      console.error("GA4 properties: No access token in session");
      return res.status(401).json({ error: "No access token found" });
    }

    console.log("GA4 properties: Fetching properties for user:", session.email);

    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri:
        process.env.NODE_ENV === "production"
          ? "https://opal44.com/api/auth/callback"
          : "http://localhost:3000/api/auth/callback",
    };

    const oauthHandler = new GoogleOAuthHandler(config);
    const properties = await oauthHandler.fetchGA4Properties(
      session.accessToken
    );

    console.log(
      "GA4 properties: Successfully fetched",
      properties.length,
      "properties"
    );
    res.json({ properties });
  } catch (error: any) {
    console.error("Get GA4 properties error:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    // Return more detailed error information
    res.status(500).json({
      error: "Failed to fetch GA4 properties",
      details: error.message,
      hint: "Make sure you have granted Analytics access during sign-in",
    });
  }
});

// Get GA4 analytics data for a specific property
app.get("/api/ga4/analytics", async (req, res) => {
  try {
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      console.error("GA4 analytics: No session token found");
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = parseSessionToken(sessionToken);

    if (!session) {
      console.error("GA4 analytics: Invalid or expired session");
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    if (!session.accessToken) {
      console.error("GA4 analytics: No access token in session");
      return res.status(401).json({ error: "No access token found" });
    }

    const { propertyId, startDate, endDate } = req.query;

    if (!propertyId || !startDate || !endDate) {
      return res.status(400).json({
        error: "Missing required parameters",
        details: "propertyId, startDate, and endDate are required",
      });
    }

    console.log("GA4 analytics: Fetching analytics for property:", propertyId);
    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri:
        process.env.NODE_ENV === "production"
          ? "https://opal44.com/api/auth/callback"
          : "http://localhost:3000/api/auth/callback",
    };

    const oauthHandler = new GoogleOAuthHandler(config);
    const analyticsData = await oauthHandler.fetchGA4Analytics(
      session.accessToken,
      propertyId as string,
      startDate as string,
      endDate as string
    );

    console.log("GA4 analytics: Successfully fetched analytics data");
    res.json(analyticsData);
  } catch (error: any) {
    console.error("Get GA4 analytics error:", error);
    console.error("Error details:", error.message);

    res.status(500).json({
      error: "Failed to fetch GA4 analytics",
      details: error.message,
    });
  }
});

// AI Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { question, propertyId, startDate, endDate, dateRangeLabel } =
      req.body as {
        question?: string;
        propertyId?: string;
        startDate?: string;
        endDate?: string;
        dateRangeLabel?: string;
      };

    if (!question || !propertyId) {
      return res
        .status(400)
        .json({ error: "Question and propertyId are required" });
    }

    // Get session and access token
    const sessionToken = req.cookies[SESSION_COOKIE_NAME];
    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = parseSessionToken(sessionToken);
    if (!session || !session.accessToken) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // Fetch real GA4 data
    const config: GoogleOAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri:
        process.env.NODE_ENV === "production"
          ? "https://opal44.com/api/auth/callback"
          : "http://localhost:3000/api/auth/callback",
    };

    const oauthHandler = new GoogleOAuthHandler(config);

    // Fetch GA4 analytics data for current period
    const ga4Data = await oauthHandler.fetchGA4Analytics(
      session.accessToken,
      propertyId,
      startDate!,
      endDate!
    );

    // Calculate and fetch comparison period data
    let previousPeriodData = null;
    let thisMonthData = null;
    let lastMonthData = null;

    // Check if this is a "compare this month to last month" type question
    const isMonthComparisonQuestion =
      question.toLowerCase().includes("compare") &&
      (question.toLowerCase().includes("this month") ||
        question.toLowerCase().includes("last month"));

    try {
      if (isMonthComparisonQuestion && dateRangeLabel) {
        // Special handling for month comparison questions
        // Support both "This month" and "Last month" selections
        const today = new Date();

        if (dateRangeLabel.toLowerCase().includes("this month")) {
          // User selected "This month" - fetch last month data
          const lastMonthStart = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          const lastMonthEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );

          lastMonthData = await oauthHandler.fetchGA4Analytics(
            session.accessToken,
            propertyId,
            lastMonthStart.toISOString().split("T")[0],
            lastMonthEnd.toISOString().split("T")[0]
          );
          thisMonthData = ga4Data;
          previousPeriodData = lastMonthData; // for backward compatibility
        } else if (dateRangeLabel.toLowerCase().includes("last month")) {
          // User selected "Last month" - fetch this month data (up to yesterday)
          const thisMonthStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const todayDate = new Date(today);
          // GA4 cannot fetch future dates; ensure end is today (same day allowed)
          const thisMonthEnd = todayDate;

          if (thisMonthEnd < thisMonthStart) {
            // We're on the first day of the month: use start date as end date
            thisMonthEnd.setTime(thisMonthStart.getTime());
          }

          thisMonthData = await oauthHandler.fetchGA4Analytics(
            session.accessToken,
            propertyId,
            thisMonthStart.toISOString().split("T")[0],
            thisMonthEnd.toISOString().split("T")[0]
          );
          lastMonthData = ga4Data;
          previousPeriodData = ga4Data;
        }
      } else {
        // Standard previous period calculation for non-month-comparison questions
        const start = new Date(startDate!);
        const end = new Date(endDate!);
        const periodDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        );
        const prevEnd = new Date(start);
        prevEnd.setDate(prevEnd.getDate() - 1);
        const prevStart = new Date(prevEnd);
        prevStart.setDate(prevStart.getDate() - periodDays);

        const prevStartDate = prevStart.toISOString().split("T")[0];
        const prevEndDate = prevEnd.toISOString().split("T")[0];

        previousPeriodData = await oauthHandler.fetchGA4Analytics(
          session.accessToken,
          propertyId,
          prevStartDate,
          prevEndDate
        );
      }
    } catch (error) {
      console.error("Failed to fetch comparison period data for chat:", error);
      // Continue without previous period data
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful GA4 (Google Analytics 4) analytics assistant. You analyze the user's REAL GA4 data and provide insights in a structured, engaging format.

Current context:
- Property ID: ${propertyId}
- Date range: ${startDate} to ${endDate}
- Selected period: ${dateRangeLabel || "Custom date range"}

REAL GA4 DATA (use this data to answer questions):
NOTE: The data below is for the "${
              dateRangeLabel || "selected"
            }" period (${startDate} to ${endDate})

Overall Metrics:
Sessions: ${ga4Data.metrics.sessions}
Users: ${ga4Data.metrics.users}
Pageviews: ${ga4Data.metrics.pageViews}
Bounce Rate: ${(ga4Data.metrics.bounceRate * 100).toFixed(1)}%
Average Session Duration: ${(ga4Data.metrics.avgSessionDuration / 60).toFixed(
              2
            )} minutes
Conversions: ${ga4Data.metrics.conversions}

Traffic Sources (Channels): ${JSON.stringify(ga4Data.trafficSources)}

Country Data (Top Countries): ${JSON.stringify(ga4Data.countryData || [])}

COMPARISON DATA:
${
  thisMonthData && lastMonthData
    ? `
THIS MONTH DATA (Auto-fetched for comparison):
Sessions: ${thisMonthData.metrics.sessions}
Users: ${thisMonthData.metrics.users}
Pageviews: ${thisMonthData.metrics.pageViews}
Bounce Rate: ${(thisMonthData.metrics.bounceRate * 100).toFixed(1)}%
Avg Session Duration: ${(thisMonthData.metrics.avgSessionDuration / 60).toFixed(
        2
      )} minutes
Conversions: ${thisMonthData.metrics.conversions}

LAST MONTH DATA (Auto-fetched for comparison):
Sessions: ${lastMonthData.metrics.sessions}
Users: ${lastMonthData.metrics.users}
Pageviews: ${lastMonthData.metrics.pageViews}
Bounce Rate: ${(lastMonthData.metrics.bounceRate * 100).toFixed(1)}%
Avg Session Duration: ${(lastMonthData.metrics.avgSessionDuration / 60).toFixed(
        2
      )} minutes
Conversions: ${lastMonthData.metrics.conversions}

NOTE: Both This Month and Last Month data have been automatically fetched for your comparison question.
`
    : previousPeriodData
    ? `
PREVIOUS PERIOD DATA (for comparison):
Previous Period Sessions: ${previousPeriodData.metrics.sessions}
Previous Period Users: ${previousPeriodData.metrics.users}
Previous Period Pageviews: ${previousPeriodData.metrics.pageViews}
Previous Period Bounce Rate: ${(
        previousPeriodData.metrics.bounceRate * 100
      ).toFixed(1)}%
Previous Period Avg Session Duration: ${(
        previousPeriodData.metrics.avgSessionDuration / 60
      ).toFixed(2)} minutes
Previous Period Conversions: ${previousPeriodData.metrics.conversions}
`
    : "Previous period data not available"
}

CRITICAL INSTRUCTIONS:
1. You MUST use the REAL GA4 data provided above including country data and previous period data
2. The current data is for the "${
              dateRangeLabel || "selected"
            }" period - ALWAYS mention this in your responses

COMPARISON QUESTIONS - SPECIAL HANDLING:
3. If user asks "Compare this month to last month" or similar:
   - FIRST CHECK: Look for "THIS MONTH DATA" and "LAST MONTH DATA" sections in the COMPARISON DATA above
   - If BOTH sections exist with real data: Use them directly for comparison (DO NOT ask the user to change filters)
   - If these sections are NOT present: user likely selected a different range (e.g., "Last 7 days")
     → Say: "⚠️ To compare this month with last month, please select either **'This month'** or **'Last month'** from the date range filter in the dashboard. Currently you have '${
       dateRangeLabel || "a different range"
     }' selected. Once you pick 'This month' or 'Last month', I'll fetch both months' data and give you the comparison!"
   - The data will be auto-fetched when the selection is "This month" (current month data already fetched, last month auto-fetched) OR "Last month" (last month data already fetched, current month auto-fetched)
   
4. If user asks other comparison questions (not month-specific):
   - Use the standard PREVIOUS PERIOD DATA section for comparison

GENERAL INSTRUCTIONS:
5. When asked about countries, engagement by location, or geographic data, use the Country Data section above
6. The Country Data includes: country name, sessions, users, pageviews, bounce rate, and average session duration
7. The Country Data is already filtered to show only identifiable countries (entries like "(not set)" are excluded)
8. For valid comparison questions (when correct date range is selected), use the PREVIOUS PERIOD DATA section
9. When comparing, use labels: "${
              dateRangeLabel || "Selected Period"
            }" vs "Previous Period"
10. Calculate percentage changes: ((Current - Previous) / Previous) * 100
11. Show comparisons with + or - signs and use 📈 for increases, 📉 for decreases
12. When showing comparisons, be LOGICALLY ACCURATE:
   - If CURRENT period = 0 and PREVIOUS period > 0: Say "Current period/This month has no data" (e.g., "0 vs 48 - This month has no data")
   - If PREVIOUS period = 0 and CURRENT period > 0: Say "Previous period/Last month had no data" (e.g., "48 vs 0 - Last month had no data")
   - DO NOT calculate percentages when either period is 0
   - Always check which period has 0 before making statements
13. DO NOT make up fake data - only use the real data provided
14. Present the data in an engaging format with emojis (like flags 🌍🇺🇸🇵🇰) and clear formatting
15. Focus on actual identified countries for insights and rankings
16. If specific data is not available, explain what data you DO have and provide those insights

ANSWER WITH THE PROVIDED REAL GA4 DATA - Use these examples as STYLE GUIDANCE only:

Format examples (use this style with REAL data):
For "What are my top-performing pages?":
🤖 AI Assistant: Based on your GA4 data, here are your top-performing pages: 1. / - [real pageviews], 2. /products - [real pageviews], 3. /about - [real pageviews]

For "How many users came from social media?":
🤖 AI Assistant: From social media platforms, you received [real sessions] sessions, which represents [real percentage]% of your total traffic. This is performing well compared to the industry average of 8-12%.

For "Which country has the highest engagement?":
🤖 AI Assistant: Based on your geographic data, here are your top countries by engagement:
1. [Country Name] 🌍 - [sessions] sessions, [users] users, [pageviews] pageviews, [bounce rate]% bounce rate, avg session duration: [X] minutes
2. [Country Name] 🌍 - [sessions] sessions, [users] users...

The country with the highest engagement is [Country Name] with [sessions] sessions and an average session duration of [X] minutes.

For "Compare this month to last month":

🤖 AI Assistant: Here's the comparison between this month and last month:

**This Month:**
📈 Sessions: [use THIS MONTH DATA Sessions]
👤 Users: [use THIS MONTH DATA Users]
📄 Pageviews: [use THIS MONTH DATA Pageviews]
⚡ Bounce Rate: [use THIS MONTH DATA Bounce Rate]
⏱️ Avg Session Duration: [use THIS MONTH DATA duration]
🎯 Conversions: [use THIS MONTH DATA Conversions]

**Last Month:**
📈 Sessions: [use LAST MONTH DATA Sessions]
👤 Users: [use LAST MONTH DATA Users]
📄 Pageviews: [use LAST MONTH DATA Pageviews]
⚡ Bounce Rate: [use LAST MONTH DATA Bounce Rate]
⏱️ Avg Session Duration: [use LAST MONTH DATA duration]
🎯 Conversions: [use LAST MONTH DATA Conversions]

**Comparison (This Month vs Last Month):**
Use THIS MONTH DATA and LAST MONTH DATA sections to compare:

LOGIC CHECK:
- If THIS MONTH = 0 and LAST MONTH > 0: "0 vs [last month value] - This month has no data yet"
- If THIS MONTH > 0 and LAST MONTH = 0: "[this month value] vs 0 - Last month had no data"
- If BOTH > 0: Calculate percentage: ((THIS MONTH - LAST MONTH) / LAST MONTH) * 100

Examples:
- Sessions: 0 (This Month) vs 48 (Last Month) → "This month has no data yet (0 vs 48)"
- Sessions: 48 (This Month) vs 0 (Last Month) → "Last month had no data (48 vs 0)"
- Sessions: 50 (This Month) vs 48 (Last Month) → "+4.2% increase 📈 (50 vs 48)"
- Sessions: 30 (This Month) vs 48 (Last Month) → "-37.5% decrease 📉 (30 vs 48)"

Overall Analysis: [Provide insights - mention which month is currently being viewed in dashboard if relevant]

If "THIS MONTH DATA" and "LAST MONTH DATA" sections are missing (meaning the user did not pick "This month" or "Last month"), respond instead with:
🤖 AI Assistant: ⚠️ To compare this month with last month, please select either **'This month'** or **'Last month'** from the date range filter in the dashboard. Currently you have '${
              dateRangeLabel || "Last 7 days"
            }' selected. Once you pick 'This month' or 'Last month', I'll fetch both months' data and provide the comparison!

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
✓ Top countries by sessions, users, or engagement (USE COUNTRY DATA)
✓ Which country has highest engagement/sessions/users (USE COUNTRY DATA)
✓ Geographic breakdown and country analytics (USE COUNTRY DATA)
✓ Session data, user behavior, traffic sources
✓ ANY question about analytics data, metrics, or website performance

ONLY REJECT (NOTHING ELSE):
✗ Greetings: "Hello", "How are you?", "Good morning"
✗ Weather questions
✗ Personal questions: "Tell me about yourself"
✗ Topics completely unrelated to web analytics or GA4

For rejected questions only: "I cannot answer your question because it is not related to GA4 analytics. Please ask me about GA4 data and I will help you."

IMPORTANT: The examples above are just for formatting reference. Answer ALL analytics-related questions using the REAL data provided.`,
          },
          { role: "user", content: question },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        (errorData as any).error?.message ||
          `OpenAI API error: ${response.status}`
      );
    }

    const data = await response.json();
    const answer =
      (data as any).choices?.[0]?.message?.content || "No response generated";

    return res.status(200).json({ answer });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return res.status(500).json({
      error: "Failed to get AI response",
      details: error.message || "Unknown error",
    });
  }
});

// OAuth callback route - handles the redirect from Google
app.get("/api/auth/callback", async (req, res) => {
  const code = req.query.code as string;
  const error = req.query.error as string;

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
      redirectUri:
        process.env.NODE_ENV === "production"
          ? "https://opal44.com/api/auth/callback"
          : "http://localhost:3000/api/auth/callback",
    };

    const oauthHandler = new GoogleOAuthHandler(config);

    // Exchange code for tokens
    const tokens = await oauthHandler.exchangeCodeForToken(code);

    // Get user info
    const userInfo = await oauthHandler.getUserInfo(tokens.access_token);

    // Verify GA4 access
    const hasGA4Access = await oauthHandler.verifyGA4Access(
      tokens.access_token
    );

    // Create session
    const userSession: UserSession = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      hasGA4Access,
    };

    const sessionToken = createSessionToken(userSession);

    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
    });

    // Redirect to dashboard after successful authentication
    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? "https://opal44.com/dashboard"
        : "http://localhost:5173/dashboard";

    res.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.send(`
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Authentication Failed</h2>
        <p style="color: #6b7280; margin: 20px 0;">Failed to complete sign up. Please try again.</p>
        <a href="/signup" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Try Again</a>
      </div>
    `);
  }
});

// Logout endpoint
app.get("/api/logout", async (req, res) => {
  try {
    res.cookie(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Failed to logout" });
  }
});

// Catch-all route for client-side routing (SPA)
// This must be last to avoid interfering with API routes
app.use((req, res) => {
  // For API routes, return 404
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  // For all other routes, serve the main HTML file to enable client-side routing
  res.sendFile(join(__dirname, "../../dist/client/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
