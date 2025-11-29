/**
 * Auth Context
 * Manages authentication state across the application
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserResponse } from "@/types/auth";
import { getCurrentUser, logout as logoutApi } from "@/api/auth";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/api/client";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    accessToken: string,
    refreshToken: string,
    user: UserResponse
  ) => void;
  /** Login with HTTP-only cookies (tokens managed by backend) */
  loginWithCookies: (user: UserResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  const login = useCallback(
    (accessToken: string, refreshToken: string, user: UserResponse) => {
      setTokens(accessToken, refreshToken);
      setUser(user);
    },
    []
  );

  const loginWithCookies = useCallback((user: UserResponse) => {
    // Tokens are in HTTP-only cookies, just set user state
    // Clear any localStorage tokens to avoid conflicts
    clearTokens();
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout API - it will clear cookies on the backend
      // Send empty refresh_token since backend reads from cookie
      await logoutApi("");
    } catch {
      // Ignore logout API errors - still clear local state
    }
    clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      // Try to get user info - works with either localStorage token or cookies
      try {
        const response = await getCurrentUser();
        if (response.data) {
          setUser(response.data);
        }
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithCookies,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
