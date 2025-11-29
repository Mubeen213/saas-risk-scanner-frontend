/**
 * Axios Client Configuration
 * Centralized HTTP client with interceptors for logging and error handling
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import {
  API_BASE_URL,
  REQUEST_TIMEOUTS,
  API_ENDPOINTS,
} from "../constants/api";

// Token storage keys
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/**
 * Token management functions
 */
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

/**
 * Create and configure axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUTS.DEFAULT,
  headers: {
    "Content-Type": "application/json",
  },
  // Enable cookies for cross-origin requests (needed for HTTP-only cookie auth)
  withCredentials: true,
});

/**
 * Request Interceptor
 * Logs outgoing requests, adds auth token and any necessary headers
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach Bearer token if available
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (import.meta.env.DEV) {
      // console.log(
      //   `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
      //   {
      //     params: config.params,
      //     data: config.data,
      //   }
      // );
    }
    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error("[API Request Error]", error);
    }
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Logs responses and handles errors globally, including 401 token refresh
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      // console.log(
      //   `[API Response] ${response.config.method?.toUpperCase()} ${
      //     response.config.url
      //   }`,
      //   {
      //     status: response.status,
      //     data: response.data,
      //   }
      // );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh or redirect for auth-check requests (like /auth/me)
      // These are expected to fail when user is not authenticated
      const isAuthCheckRequest = originalRequest.url?.includes("/auth/me");

      // Don't redirect if already on an auth page
      const isOnAuthPage = window.location.pathname.startsWith("/auth");

      const refreshToken = getRefreshToken();
      if (refreshToken && !isAuthCheckRequest) {
        try {
          const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            { refresh_token: refreshToken },
            { withCredentials: true }
          );

          const { access_token, refresh_token } = response.data.data;
          setTokens(access_token, refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        } catch {
          clearTokens();
          // Only redirect if not already on auth page
          if (!isOnAuthPage) {
            window.location.href = "/auth/signin";
          }
        }
      } else if (!isAuthCheckRequest && !isOnAuthPage) {
        // Only redirect if it's not an auth check and we're not already on auth page
        clearTokens();
        window.location.href = "/auth/signin";
      }
    }

    // Log error responses in development
    if (import.meta.env.DEV) {
      console.error("[API Response Error]", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
