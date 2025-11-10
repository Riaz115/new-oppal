import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  hasGA4Access: boolean;
}

export interface AuthContextValue {
  user: User | null;
  isPending: boolean;
  isFetching: boolean;
  fetchUser: () => Promise<void>;
  redirectToLogin: () => Promise<void>;
  exchangeCodeForSessionToken: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const fetchUser = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include', // Include cookies in request
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setIsFetching(false);
    }
  };

  const redirectToLogin = async () => {
    try {
      const response = await fetch('/api/oauth/google/redirect_url');
      const data = await response.json();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Failed to get redirect URL:', error);
    }
  };

  const exchangeCodeForSessionToken = async () => {
    // This function is no longer needed since OAuth callback is handled server-side
    // but keeping it for backward compatibility
    throw new Error('OAuth callback should be handled server-side');
  };

  const logout = async () => {
    try {
      // Clear user state first
      setUser(null);
      
      // Additional cleanup - clear any local storage
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Call logout API
      await fetch('/api/logout', {
        credentials: 'include', // Include cookies in request
        method: 'GET',
        cache: 'no-store',
      });
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Failed to logout:', error);
      // Even if API fails, clear local state
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setIsPending(false));
  }, []);

  const value: AuthContextValue = {
    user,
    isPending,
    isFetching,
    fetchUser,
    redirectToLogin,
    exchangeCodeForSessionToken,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
