export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export class GoogleOAuthHandler {
  private config: GoogleOAuthConfig;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;
  }

  /**
   * Generate the OAuth redirect URL
   */
  getAuthUrl(): string {
    const params = [
      `client_id=${encodeURIComponent(this.config.clientId)}`,
      `redirect_uri=${encodeURIComponent(this.config.redirectUri)}`,
      "response_type=code",
      "scope=openid%20email%20profile%20https://www.googleapis.com/auth/analytics.readonly",
      "access_type=offline",
      "prompt=consent",
    ].join("&");

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    const body = [
      `client_id=${encodeURIComponent(this.config.clientId)}`,
      `client_secret=${encodeURIComponent(this.config.clientSecret)}`,
      `code=${encodeURIComponent(code)}`,
      "grant_type=authorization_code",
      `redirect_uri=${encodeURIComponent(this.config.redirectUri)}`,
    ].join("&");

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json() as Promise<GoogleTokenResponse>;
  }

  /**
   * Get user info from Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get user info: ${error}`);
    }

    return response.json() as Promise<GoogleUserInfo>;
  }

  /**
   * Verify GA4 access by checking available properties
   */
  async verifyGA4Access(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("GA4 access verification failed:", error);
      return false;
    }
  }

  /**
   * Fetch GA4 properties for the authenticated user
   */
  async fetchGA4Properties(accessToken: string): Promise<any[]> {
    try {
      console.log("Fetching GA4 properties from Google Analytics Admin API...");

      const response = await fetch(
        "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("GA4 API Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GA4 API Error Response:", errorText);

        // Parse error for better details
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(
            `GA4 API Error (${response.status}): ${
              errorJson.error?.message || errorText
            }`
          );
        } catch (parseError) {
          throw new Error(`GA4 API Error (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      console.log("GA4 API Response data:", JSON.stringify(data, null, 2));

      // Extract properties from account summaries
      const properties: any[] = [];
      if (data.accountSummaries && Array.isArray(data.accountSummaries)) {
        for (const account of data.accountSummaries) {
          if (
            account.propertySummaries &&
            Array.isArray(account.propertySummaries)
          ) {
            for (const property of account.propertySummaries) {
              properties.push({
                id: property.property,
                displayName: property.displayName,
                account: account.account,
                accountDisplayName: account.displayName,
              });
            }
          }
        }
      }

      console.log(`Successfully extracted ${properties.length} properties`);
      return properties;
    } catch (error: any) {
      console.error("Failed to fetch GA4 properties:", error);
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      throw error;
    }
  }

  /**
   * Fetch GA4 analytics data for a specific property
   */
  async fetchGA4Analytics(
    accessToken: string,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    try {
      console.log(
        `Fetching GA4 analytics for property ${propertyId} from ${startDate} to ${endDate}...`
      );
      console.log("==== STEP 1: Fetching AGGREGATE data (no dimensions) ====");

      // STEP 1: Fetch aggregate data WITHOUT date dimension for accurate totals
      const aggregateRequestBody = {
        dateRanges: [{ startDate, endDate }],
        dimensions: [], // NO DIMENSIONS = AGGREGATE DATA
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
          { name: "conversions" },
        ],
      };

      const aggregateResponse = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aggregateRequestBody),
        }
      );

      if (!aggregateResponse.ok) {
        const errorText = await aggregateResponse.text();
        console.error("GA4 Aggregate API Error Response:", errorText);
        throw new Error(
          `GA4 Analytics API Error (${aggregateResponse.status}): ${errorText}`
        );
      }

      const aggregateData = await aggregateResponse.json();
      console.log(
        "GA4 Aggregate Response:",
        JSON.stringify(aggregateData, null, 2)
      );

      // Parse aggregate metrics
      let totalSessions = 0;
      let totalUsers = 0;
      let totalPageViews = 0;
      let avgBounceRate = 0;
      let avgSessionDuration = 0;
      let totalConversions = 0;

      if (aggregateData.rows && aggregateData.rows.length > 0) {
        const row = aggregateData.rows[0]; // Only one row with aggregate data
        totalSessions = parseInt(row.metricValues[0]?.value || "0");
        totalUsers = parseInt(row.metricValues[1]?.value || "0");
        totalPageViews = parseInt(row.metricValues[2]?.value || "0");
        avgBounceRate = parseFloat(row.metricValues[3]?.value || "0");
        avgSessionDuration = parseFloat(row.metricValues[4]?.value || "0");
        totalConversions = parseInt(row.metricValues[5]?.value || "0");

        console.log("==== AGGREGATE METRICS FROM GA4 ====");
        console.log("  Sessions:", totalSessions);
        console.log("  Users (UNIQUE):", totalUsers);
        console.log("  PageViews:", totalPageViews);
        console.log("  Bounce Rate:", avgBounceRate);
        console.log("  Avg Session Duration:", avgSessionDuration);
        console.log("  Conversions:", totalConversions);
      }

      // STEP 2: Fetch daily breakdown for chart
      console.log("==== STEP 2: Fetching DAILY data for chart ====");
      const dailyRequestBody = {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
        keepEmptyRows: true,
      };

      const dailyResponse = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dailyRequestBody),
        }
      );

      if (!dailyResponse.ok) {
        const errorText = await dailyResponse.text();
        console.error("GA4 Daily API Error Response:", errorText);
        throw new Error(
          `GA4 Analytics API Error (${dailyResponse.status}): ${errorText}`
        );
      }

      const dailyData = await dailyResponse.json();
      console.log("GA4 Daily Response rows:", dailyData.rows?.length || 0);

      // Parse chart data
      const chartData: any[] = [];
      if (dailyData.rows && Array.isArray(dailyData.rows)) {
        for (const row of dailyData.rows) {
          const dateValue = row.dimensionValues[0].value;
          // GA4 returns date as YYYYMMDD, convert to YYYY-MM-DD
          const formattedDate = `${dateValue.substring(
            0,
            4
          )}-${dateValue.substring(4, 6)}-${dateValue.substring(6, 8)}`;
          const sessions = parseInt(row.metricValues[0]?.value || "0");

          console.log(`  Date ${formattedDate}: Sessions=${sessions}`);
          chartData.push({
            date: formattedDate,
            sessions,
          });
        }
      }

      // Fetch traffic sources data
      const trafficSources = await this.fetchGA4TrafficSources(
        accessToken,
        propertyId,
        startDate,
        endDate
      );

      // Fetch country data
      const countryData = await this.fetchGA4CountryData(
        accessToken,
        propertyId,
        startDate,
        endDate
      );

      const result = {
        metrics: {
          sessions: totalSessions,
          users: totalUsers,
          pageViews: totalPageViews,
          bounceRate: avgBounceRate,
          avgSessionDuration: avgSessionDuration,
          conversions: totalConversions,
        },
        chartData,
        trafficSources,
        countryData,
        timestamp: new Date().toISOString(),
        dateRange: { startDate, endDate },
      };

      console.log("==== FINAL RESULT ====");
      console.log("Metrics:", result.metrics);
      console.log("Chart data points:", result.chartData.length);
      console.log("======================");

      return result;
    } catch (error: any) {
      console.error("Failed to fetch GA4 analytics:", error);
      throw error;
    }
  }

  /**
   * Fetch GA4 traffic sources data for a specific property
   */
  async fetchGA4TrafficSources(
    accessToken: string,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      console.log(
        `Fetching GA4 traffic sources for property ${propertyId} from ${startDate} to ${endDate}...`
      );

      // Build the request body for Google Analytics Data API
      // Using sessionDefaultChannelGroup to get traffic sources
      const requestBody = {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      };

      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GA4 Traffic Sources API Error Response:", errorText);
        // Don't throw error, just return empty array if it fails
        return [];
      }

      const data = await response.json();
      console.log(
        "GA4 Traffic Sources API Response:",
        JSON.stringify(data, null, 2)
      );

      // Parse traffic sources data
      const trafficSources: any[] = [];

      if (data.rows && Array.isArray(data.rows)) {
        for (const row of data.rows) {
          const sourceName = row.dimensionValues[0].value || "Unknown";
          const sessions = parseInt(row.metricValues[0].value || "0");

          // Normalize source names - GA4 uses channel groups like "Organic Search", "Paid Social", etc.
          let normalizedName = sourceName;
          const lowerName = sourceName.toLowerCase().trim();

          // Check in order of specificity - more specific matches first
          if (
            lowerName.includes("organic search") ||
            lowerName.includes("organic") ||
            (lowerName.includes("search") && !lowerName.includes("paid"))
          ) {
            normalizedName = "Organic";
          } else if (
            lowerName.includes("paid social") ||
            lowerName.includes("organic social") ||
            lowerName.includes("social")
          ) {
            normalizedName = "Social";
          } else if (
            lowerName.includes("email") ||
            lowerName.includes("mail")
          ) {
            normalizedName = "Email";
          } else if (
            lowerName.includes("direct") ||
            sourceName === "(none)" ||
            sourceName === "(direct)"
          ) {
            normalizedName = "Direct";
          } else if (lowerName.includes("referral")) {
            normalizedName = "Referral";
          } else if (lowerName.includes("unassigned")) {
            normalizedName = "Unassigned";
          }

          // Check if we already have this normalized name
          const existingIndex = trafficSources.findIndex(
            (ts) => ts.name === normalizedName
          );
          if (existingIndex >= 0) {
            trafficSources[existingIndex].value += sessions;
          } else {
            trafficSources.push({
              name: normalizedName,
              value: sessions,
            });
          }
        }
      }

      // Sort by value descending
      trafficSources.sort((a, b) => b.value - a.value);

      console.log(
        `Successfully extracted ${trafficSources.length} traffic sources`
      );
      return trafficSources;
    } catch (error: any) {
      console.error("Failed to fetch GA4 traffic sources:", error);
      // Return empty array instead of throwing to prevent breaking the main analytics fetch
      return [];
    }
  }

  /**
   * Fetch GA4 country data for a specific property
   */
  async fetchGA4CountryData(
    accessToken: string,
    propertyId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      console.log(
        `Fetching GA4 country data for property ${propertyId} from ${startDate} to ${endDate}...`
      );

      // Build the request body for Google Analytics Data API
      // Using country dimension to get country-based metrics
      const requestBody = {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "country" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20, // Top 20 countries
      };

      const response = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("GA4 Country Data API Error Response:", errorText);
        // Don't throw error, just return empty array if it fails
        return [];
      }

      const data = await response.json();
      console.log(
        "GA4 Country Data API Response:",
        JSON.stringify(data, null, 2)
      );

      // Parse country data
      const countryData: any[] = [];

      if (data.rows && Array.isArray(data.rows)) {
        for (const row of data.rows) {
          const country = row.dimensionValues[0].value || "Unknown";

          // Skip "(not set)" entries - filter them out
          if (country === "(not set)" || country.toLowerCase() === "not set") {
            continue;
          }

          const sessions = parseInt(row.metricValues[0].value || "0");
          const users = parseInt(row.metricValues[1].value || "0");
          const pageViews = parseInt(row.metricValues[2].value || "0");
          const bounceRate = parseFloat(row.metricValues[3].value || "0");
          const avgSessionDuration = parseFloat(
            row.metricValues[4].value || "0"
          );

          countryData.push({
            country,
            sessions,
            users,
            pageViews,
            bounceRate,
            avgSessionDuration,
          });
        }
      }

      console.log(`Successfully extracted ${countryData.length} countries`);
      return countryData;
    } catch (error: any) {
      console.error("Failed to fetch GA4 country data:", error);
      // Return empty array instead of throwing to prevent breaking the main analytics fetch
      return [];
    }
  }
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  hasGA4Access: boolean;
}

export const SESSION_COOKIE_NAME = "opal44_session";

/**
 * Create a session token (simple implementation - in production use JWT or similar)
 */
export function createSessionToken(userSession: UserSession): string {
  // Simple base64-like encoding for session data
  const jsonString = JSON.stringify(userSession);
  let result = "";
  for (let i = 0; i < jsonString.length; i++) {
    result += String.fromCharCode(jsonString.charCodeAt(i) + 1);
  }
  return result;
}

/**
 * Parse session token
 */
export function parseSessionToken(token: string): UserSession | null {
  try {
    // Reverse the simple encoding
    let decoded = "";
    for (let i = 0; i < token.length; i++) {
      decoded += String.fromCharCode(token.charCodeAt(i) - 1);
    }
    const session = JSON.parse(decoded) as UserSession;

    // Check if token is expired
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}
