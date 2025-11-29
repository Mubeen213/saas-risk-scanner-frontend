# Signup/Signin & Dashboard Implementation Plan

## Overview

Implement Google OAuth-based authentication (signup/signin) and an empty dashboard page for the React frontend, integrating with the FastAPI backend. Uses React Context for auth state, Axios for API calls, type-safe integration matching backend schemas, and follows the established Notion-inspired theme.

---

## Architecture

```
src/
├── api/
│   ├── client.ts          # Axios instance (modify: add auth interceptor)
│   └── auth.ts             # Auth API functions (NEW)
├── constants/
│   └── api.ts              # API endpoints (modify: add auth endpoints)
├── contexts/
│   └── AuthContext.tsx     # Auth state management (NEW)
├── hooks/
│   └── useAuth.ts          # Auth hook (NEW)
├── types/
│   ├── api.ts              # Common API response types (NEW)
│   └── auth.ts             # Auth-specific types (NEW)
├── pages/
│   └── auth/
│       ├── SignInPage.tsx        # Sign in/up page (NEW)
│       └── OAuthCallbackPage.tsx # OAuth callback handler (NEW)
│   └── dashboard/
│       └── DashboardPage.tsx     # Empty dashboard (NEW)
├── layouts/
│   └── DashboardLayout.tsx       # Dashboard layout shell (NEW)
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx    # Route guard (NEW)
└── App.tsx                       # Router config (modify)
```

---

## Step 1: TypeScript Types

### `src/types/api.ts`

Common API response types matching backend `schemas/common.py`:

```typescript
export interface MetaResponse {
  request_id: string;
  timestamp: string;
}

export interface ErrorDetail {
  code: string;
  field: string | null;
  message: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  target: string | null;
  details: ErrorDetail[] | null;
}

export interface ApiResponse<T> {
  meta: MetaResponse;
  data: T | null;
  error: ErrorResponse | null;
}
```

### `src/types/auth.ts`

Auth types matching backend `schemas/auth.py`, `schemas/user.py`, `schemas/organization.py`, `schemas/role.py`, `schemas/plan.py`:

```typescript
// Plan
export interface PlanResponse {
  id: number;
  name: string;
  display_name: string;
  max_users: number | null;
  max_apps: number | null;
}

// Role
export interface RoleResponse {
  id: number;
  name: string;
  display_name: string;
}

// Organization
export interface OrganizationResponse {
  id: number;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  status: string;
  plan: PlanResponse;
}

// User
export interface UserResponse {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  email_verified: boolean;
  status: string;
  last_login_at: string | null;
  role: RoleResponse;
  organization: OrganizationResponse;
}

// Auth Responses
export interface AuthUrlResponse {
  authorization_url: string;
}

export interface AuthSuccessResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserResponse;
  is_new_user: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string | null;
  token_type: string;
  expires_in: number;
}

export interface LogoutResponse {
  message: string;
}

// Auth Requests
export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}
```

---

## Step 2: API Constants & Auth API

### Modify `src/constants/api.ts`

Add auth endpoints:

```typescript
export const API_ENDPOINTS = {
  HEALTH: "/health",
  AUTH: {
    GOOGLE: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
} as const;
```

### Create `src/api/auth.ts`

```typescript
import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResponse } from "@/types/api";
import type {
  AuthUrlResponse,
  AuthSuccessResponse,
  TokenResponse,
  UserResponse,
  LogoutResponse,
  RefreshTokenRequest,
  LogoutRequest,
} from "@/types/auth";

export const getGoogleAuthUrl = async (
  redirectUri: string
): Promise<ApiResponse<AuthUrlResponse>> => {
  const response = await apiClient.get<ApiResponse<AuthUrlResponse>>(
    API_ENDPOINTS.AUTH.GOOGLE,
    { params: { redirect_uri: redirectUri } }
  );
  return response.data;
};

export const handleOAuthCallback = async (
  code: string,
  state: string
): Promise<ApiResponse<AuthSuccessResponse>> => {
  const response = await apiClient.get<ApiResponse<AuthSuccessResponse>>(
    API_ENDPOINTS.AUTH.GOOGLE_CALLBACK,
    { params: { code, state } }
  );
  return response.data;
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<ApiResponse<TokenResponse>> => {
  const request: RefreshTokenRequest = { refresh_token: refreshToken };
  const response = await apiClient.post<ApiResponse<TokenResponse>>(
    API_ENDPOINTS.AUTH.REFRESH,
    request
  );
  return response.data;
};

export const getCurrentUser = async (): Promise<ApiResponse<UserResponse>> => {
  const response = await apiClient.get<ApiResponse<UserResponse>>(
    API_ENDPOINTS.AUTH.ME
  );
  return response.data;
};

export const logout = async (
  refreshToken: string
): Promise<ApiResponse<LogoutResponse>> => {
  const request: LogoutRequest = { refresh_token: refreshToken };
  const response = await apiClient.post<ApiResponse<LogoutResponse>>(
    API_ENDPOINTS.AUTH.LOGOUT,
    request
  );
  return response.data;
};
```

---

## Step 3: Modify API Client

### Modify `src/api/client.ts`

Add auth token interceptor and 401 handling:

```typescript
import axios from "axios";
import { API_BASE_URL } from "@/constants/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Token management functions
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Request interceptor - attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token, refresh_token } = response.data.data;
          setTokens(access_token, refresh_token);
          
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          window.location.href = "/auth/signin";
        }
      } else {
        clearTokens();
        window.location.href = "/auth/signin";
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

## Step 4: Auth Context

### Create `src/contexts/AuthContext.tsx`

```typescript
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserResponse } from "@/types/auth";
import {
  getCurrentUser,
  logout as logoutApi,
} from "@/api/auth";
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
  login: (accessToken: string, refreshToken: string, user: UserResponse) => void;
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

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch {
        // Ignore logout API errors
      }
    }
    clearTokens();
    setUser(null);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

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
      value={{ user, isAuthenticated, isLoading, login, logout }}
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
```

---

## Step 5: Protected Route Component

### Create `src/components/auth/ProtectedRoute.tsx`

```typescript
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

---

## Step 6: Auth Pages

### Create `src/pages/auth/SignInPage.tsx`

```typescript
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import { getGoogleAuthUrl } from "@/api/auth";
import { parseApiError } from "@/api/errors";

export const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const response = await getGoogleAuthUrl(callbackUrl);

      if (response.data?.authorization_url) {
        // Store intended destination for after OAuth
        sessionStorage.setItem("auth_redirect", from);
        window.location.href = response.data.authorization_url;
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-text-primary">
            SaaS Risk Scanner
          </h1>
          <p className="mt-2 text-text-secondary">
            Monitor third-party app risks in your Google Workspace
          </p>
        </div>

        <Card padding="lg">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-text-primary">
                Sign in to continue
              </h2>
              <p className="mt-1 text-sm text-text-tertiary">
                Use your company Google account
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-error-light p-3 text-sm text-error">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-xs text-text-tertiary">
              Personal email addresses (Gmail, Outlook, etc.) are not allowed.
              <br />
              Please use your company email.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
```

### Create `src/pages/auth/OAuthCallbackPage.tsx`

```typescript
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { handleOAuthCallback } from "@/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { parseApiError } from "@/api/errors";

export const OAuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Authentication was cancelled or failed");
        return;
      }

      if (!code || !state) {
        setError("Invalid callback parameters");
        return;
      }

      try {
        const response = await handleOAuthCallback(code, state);

        if (response.data) {
          const { access_token, refresh_token, user } = response.data;
          login(access_token, refresh_token, user);

          const redirectPath = sessionStorage.getItem("auth_redirect") || "/dashboard";
          sessionStorage.removeItem("auth_redirect");
          navigate(redirectPath, { replace: true });
        } else if (response.error) {
          setError(response.error.message);
        }
      } catch (err) {
        const apiError = parseApiError(err);
        setError(apiError.message);
      }
    };

    processCallback();
  }, [searchParams, login, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-error">
            Authentication Failed
          </h1>
          <p className="mt-2 text-text-secondary">{error}</p>
          <button
            onClick={() => navigate("/auth/signin")}
            className="mt-4 text-brand-secondary hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Spinner size="lg" />
      <p className="mt-4 text-text-secondary">Completing sign in...</p>
    </div>
  );
};
```

---

## Step 7: Dashboard Layout & Page

### Create `src/layouts/DashboardLayout.tsx`

```typescript
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import { LogOut } from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/signin");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar placeholder */}
      <aside className="hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-semibold text-text-primary">
            SaaS Risk Scanner
          </span>
        </div>
        <nav className="p-4">
          {/* Navigation items will be added later */}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
          <div className="lg:hidden">
            <span className="text-lg font-semibold text-text-primary">
              SaaS Risk Scanner
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-white">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm text-text-primary sm:block">
                  {user.full_name || user.email}
                </span>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

### Create `src/pages/dashboard/DashboardPage.tsx`

```typescript
import { Card, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowRight } from "lucide-react";

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back, {user?.full_name || user?.email}
        </p>
      </div>

      {/* Connect Google Workspace CTA */}
      <Card padding="lg">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-light">
            <Shield className="h-8 w-8 text-brand-secondary" />
          </div>
          
          <h2 className="text-xl font-semibold text-text-primary">
            Connect Your Google Workspace
          </h2>
          
          <p className="mt-2 max-w-md text-text-secondary">
            Connect your organization's Google Workspace to discover risky
            third-party app authorizations across all users.
          </p>

          <Button variant="primary" size="lg" className="mt-6">
            Connect Google Workspace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-xs text-text-tertiary">
            Requires Google Workspace Admin access
          </p>
        </div>
      </Card>
    </div>
  );
};
```

---

## Step 8: Configure Routing

### Modify `src/App.tsx`

```typescript
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { SignInPage } from "@/pages/auth/SignInPage";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";

const AppLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Public routes
      {
        path: "/auth/signin",
        element: <SignInPage />,
      },
      {
        path: "/auth/callback",
        element: <OAuthCallbackPage />,
      },

      // Protected routes
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
      },

      // Catch-all redirect
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
```

---

## File Creation Checklist

| File | Status | Description |
|------|--------|-------------|
| `src/types/api.ts` | NEW | Common API response types |
| `src/types/auth.ts` | NEW | Auth-specific types |
| `src/constants/api.ts` | MODIFY | Add auth endpoints |
| `src/api/client.ts` | MODIFY | Add token interceptors |
| `src/api/auth.ts` | NEW | Auth API functions |
| `src/contexts/AuthContext.tsx` | NEW | Auth state management |
| `src/components/auth/ProtectedRoute.tsx` | NEW | Route guard |
| `src/pages/auth/SignInPage.tsx` | NEW | Sign in page |
| `src/pages/auth/OAuthCallbackPage.tsx` | NEW | OAuth callback |
| `src/layouts/DashboardLayout.tsx` | NEW | Dashboard layout |
| `src/pages/dashboard/DashboardPage.tsx` | NEW | Empty dashboard |
| `src/App.tsx` | MODIFY | Configure routes |

---

## Token Storage Strategy

- **Access Token**: localStorage (for persistence across page refreshes)
- **Refresh Token**: localStorage (used to obtain new access tokens)
- **Axios Interceptor**: Automatically attaches Bearer token to requests
- **401 Handling**: Attempts token refresh, redirects to signin on failure

---

## OAuth Flow Summary

```
1. User clicks "Continue with Google" on SignInPage
2. Frontend calls GET /api/v1/auth/google?redirect_uri=...
3. Backend returns authorization_url
4. Frontend redirects user to Google OAuth consent screen
5. User authenticates and grants consent
6. Google redirects to /auth/callback?code=...&state=...
7. OAuthCallbackPage calls GET /api/v1/auth/google/callback
8. Backend exchanges code for tokens, creates/updates user
9. Backend returns access_token, refresh_token, user data
10. Frontend stores tokens, sets user in AuthContext
11. Frontend redirects to /dashboard
```
