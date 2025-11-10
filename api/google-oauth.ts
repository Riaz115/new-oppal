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
      'response_type=code',
      'scope=openid%20email%20profile%20https://www.googleapis.com/auth/analytics.readonly',
      'access_type=offline',
      'prompt=consent'
    ].join('&');

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
      'grant_type=authorization_code',
      `redirect_uri=${encodeURIComponent(this.config.redirectUri)}`
    ].join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

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
      const response = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('GA4 access verification failed:', error);
      return false;
    }
  }

  /**
   * Fetch GA4 properties for the authenticated user
   */
  async fetchGA4Properties(accessToken: string): Promise<any[]> {
    try {
      console.log('Fetching GA4 properties from Google Analytics Admin API...');
      
      const response = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('GA4 API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GA4 API Error Response:', errorText);
        
        // Parse error for better details
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`GA4 API Error (${response.status}): ${errorJson.error?.message || errorText}`);
        } catch (parseError) {
          throw new Error(`GA4 API Error (${response.status}): ${errorText}`);
        }
      }

      const data: any = await response.json();
      console.log('GA4 API Response data:', JSON.stringify(data, null, 2));
      
      // Extract properties from account summaries
      const properties: any[] = [];
      if (data.accountSummaries && Array.isArray(data.accountSummaries)) {
        for (const account of data.accountSummaries) {
          if (account.propertySummaries && Array.isArray(account.propertySummaries)) {
            for (const property of account.propertySummaries) {
              properties.push({
                id: property.property,
                displayName: property.displayName,
                account: account.account,
                accountDisplayName: account.displayName
              });
            }
          }
        }
      }

      console.log(`Successfully extracted ${properties.length} properties`);
      return properties;
    } catch (error: any) {
      console.error('Failed to fetch GA4 properties:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
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
    endDate: string,
    metrics: string = 'sessions,totalUsers,screenPageViews,bounceRate,averageSessionDuration,conversions',
    dimensions: string = 'date'
  ): Promise<any> {
    try {
      console.log('Fetching GA4 analytics data from Google Analytics Data API...');
      console.log('Metrics being requested:', metrics);
      console.log('Date range:', startDate, 'to', endDate);
      
      // First, fetch aggregate data without date dimension for accurate totals
      const aggregateResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: metrics.split(',').map(metric => ({ name: metric.trim() })),
          dimensions: [], // No dimensions for aggregate totals
          keepEmptyRows: false
        })
      });

      if (!aggregateResponse.ok) {
        const errorText = await aggregateResponse.text();
        throw new Error(`Failed to fetch aggregate data: ${errorText}`);
      }

      const aggregateData: any = await aggregateResponse.json();
      console.log('Aggregate Data Response:', JSON.stringify(aggregateData, null, 2));
      
      // Now fetch daily breakdown for chart
      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRanges: [
            {
              startDate,
              endDate
            }
          ],
          metrics: [{ name: 'sessions' }], // Only sessions for chart
          dimensions: [{ name: 'date' }],
          keepEmptyRows: true // Include days with zero data
        })
      });

      console.log('GA4 Analytics API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GA4 Analytics API Error Response:', errorText);
        
        // Parse error for better details
        try {
          const errorJson = JSON.parse(errorText);
          const errorMessage = errorJson.error?.message || errorText;
          const statusCode = response.status;
          
          // Provide helpful error messages
          let friendlyMessage = `GA4 Analytics API Error (${statusCode}): ${errorMessage}`;
          
          if (statusCode === 429) {
            if (errorMessage.includes('denied access')) {
              friendlyMessage = 'This property does not have access to the GA4 Reporting API. Please enable the Google Analytics Reporting API in your Google Cloud Console for this property.';
            } else {
              friendlyMessage = 'Rate limit exceeded. Please try again later.';
            }
          } else if (statusCode === 403) {
            friendlyMessage = 'Access denied to this GA4 property. Please make sure you have the necessary permissions.';
          } else if (statusCode === 404) {
            friendlyMessage = 'GA4 property not found. Please check the property ID.';
          }
          
          throw new Error(friendlyMessage);
        } catch (parseError) {
          throw new Error(`GA4 Analytics API Error (${response.status}): ${errorText}`);
        }
      }

      const data: any = await response.json();
      console.log('Daily Chart Data Response:', JSON.stringify(data, null, 2));
      console.log('Number of daily rows received:', data.rows?.length || 0);
      
      // Parse aggregate metrics from first API call
      console.log('==== GA4 AGGREGATE DATA PARSING START ====');
      let totalSessions = 0;
      let totalUsers = 0;
      let totalPageViews = 0;
      let avgBounceRate = 0;
      let avgSessionDuration = 0;
      let totalConversions = 0;

      if (aggregateData.rows && aggregateData.rows.length > 0) {
        const row = aggregateData.rows[0]; // Only one row with aggregated data
        totalSessions = parseInt(row.metricValues[0]?.value || '0');
        totalUsers = parseInt(row.metricValues[1]?.value || '0');
        totalPageViews = parseInt(row.metricValues[2]?.value || '0');
        avgBounceRate = parseFloat(row.metricValues[3]?.value || '0');
        avgSessionDuration = parseFloat(row.metricValues[4]?.value || '0');
        totalConversions = parseInt(row.metricValues[5]?.value || '0');
        
        console.log('Aggregate Metrics from GA4:');
        console.log('  Sessions:', totalSessions);
        console.log('  Users (UNIQUE):', totalUsers);
        console.log('  PageViews:', totalPageViews);
        console.log('  Bounce Rate:', avgBounceRate);
        console.log('  Avg Session Duration:', avgSessionDuration);
        console.log('  Conversions:', totalConversions);
      } else {
        console.log('No aggregate data returned from GA4');
      }
      
      // Parse daily data for chart
      const chartData: any[] = [];
      if (data.rows && Array.isArray(data.rows)) {
        console.log('==== CHART DATA PARSING ====');
        for (const row of data.rows) {
          const dateValue = row.dimensionValues[0].value;
          // GA4 returns date as YYYYMMDD, convert to YYYY-MM-DD
          const formattedDate = `${dateValue.substring(0, 4)}-${dateValue.substring(4, 6)}-${dateValue.substring(6, 8)}`;
          const sessions = parseInt(row.metricValues[0]?.value || '0');
          
          console.log(`  Date ${formattedDate}: Sessions=${sessions}`);
          chartData.push({
            date: formattedDate,
            sessions
          });
        }
      }
      
      console.log('==== GA4 DATA PARSING END ====');

      // Fetch traffic sources data
      const trafficSources = await this.fetchGA4TrafficSources(accessToken, propertyId, startDate, endDate);

      const result = {
        metrics: {
          sessions: totalSessions,
          users: totalUsers,
          pageViews: totalPageViews,
          bounceRate: avgBounceRate,
          avgSessionDuration: avgSessionDuration,
          conversions: totalConversions
        },
        chartData,
        trafficSources,
        timestamp: new Date().toISOString(),
        dateRange: { startDate, endDate } // Added for debugging
      };
      
      console.log('==== FINAL RESULT ====');
      console.log('Date Range:', startDate, 'to', endDate);
      console.log('Final Metrics:', JSON.stringify(result.metrics, null, 2));
      console.log('Chart Data Points:', result.chartData.length);
      console.log('====================');
      
      return result;
    } catch (error: any) {
      console.error('Failed to fetch GA4 analytics data:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      throw error;
    }
  }

  /**
   * Fetch GA4 traffic sources data for a specific property
   */
  async fetchGA4TrafficSources(accessToken: string, propertyId: string, startDate: string, endDate: string): Promise<any[]> {
    try {
      console.log(`Fetching GA4 traffic sources for property ${propertyId} from ${startDate} to ${endDate}...`);
      
      // Build the request body for Google Analytics Data API
      // Using sessionDefaultChannelGroup to get traffic sources
      const requestBody = {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      };

      const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${propertyId}:runReport`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GA4 Traffic Sources API Error Response:', errorText);
        // Don't throw error, just return empty array if it fails
        return [];
      }

      const data: any = await response.json();
      console.log('GA4 Traffic Sources API Response:', JSON.stringify(data, null, 2));

      // Parse traffic sources data
      const trafficSources: any[] = [];

      if (data.rows && Array.isArray(data.rows)) {
        for (const row of data.rows) {
          const sourceName = row.dimensionValues[0].value || 'Unknown';
          const sessions = parseInt(row.metricValues[0].value || '0');

          // Normalize source names
          let normalizedName = sourceName;
          if (sourceName.toLowerCase().includes('organic') || sourceName.toLowerCase().includes('search')) {
            normalizedName = 'Organic';
          } else if (sourceName.toLowerCase().includes('direct') || sourceName === '(none)') {
            normalizedName = 'Direct';
          } else if (sourceName.toLowerCase().includes('social')) {
            normalizedName = 'Social';
          } else if (sourceName.toLowerCase().includes('referral')) {
            normalizedName = 'Referral';
          } else if (sourceName.toLowerCase().includes('email')) {
            normalizedName = 'Email';
          }

          // Check if we already have this normalized name
          const existingIndex = trafficSources.findIndex(ts => ts.name === normalizedName);
          if (existingIndex >= 0) {
            trafficSources[existingIndex].value += sessions;
          } else {
            trafficSources.push({
              name: normalizedName,
              value: sessions
            });
          }
        }
      }

      // Sort by value descending
      trafficSources.sort((a, b) => b.value - a.value);

      console.log(`Successfully extracted ${trafficSources.length} traffic sources`);
      return trafficSources;
    } catch (error: any) {
      console.error('Failed to fetch GA4 traffic sources:', error);
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

export const SESSION_COOKIE_NAME = 'opal44_session';

/**
 * Create a session token (simple implementation - in production use JWT or similar)
 */
export function createSessionToken(userSession: UserSession): string {
  // Simple base64-like encoding for session data
  const jsonString = JSON.stringify(userSession);
  let result = '';
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
    console.log('Parsing session token, length:', token.length);
    
    // Reverse the simple encoding
    let decoded = '';
    for (let i = 0; i < token.length; i++) {
      decoded += String.fromCharCode(token.charCodeAt(i) - 1);
    }
    
    console.log('Decoded token length:', decoded.length);
    const session = JSON.parse(decoded) as UserSession;
    
    console.log('Parsed session, expiry:', session.expiresAt, 'current:', Date.now());
    
    // Check if token is expired
    if (Date.now() > session.expiresAt) {
      console.log('Session expired');
      return null;
    }
    
    console.log('Session valid for user:', session.email);
    return session;
  } catch (error) {
    console.error('Error parsing session token:', error);
    return null;
  }
}
