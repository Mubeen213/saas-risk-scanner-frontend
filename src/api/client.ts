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

      // Don't try to refresh for the refresh endpoint itself (would cause infinite loop)
      const isRefreshRequest = originalRequest.url?.includes("/auth/refresh");

      // Don't redirect if already on an auth page
      const isOnAuthPage = window.location.pathname.startsWith("/auth");

      // Try to refresh using cookie-based refresh token
      if (!isRefreshRequest) {
        try {
          console.log("[Auth] Attempting token refresh...");
          // Send empty body - the refresh token is in HTTP-only cookie
          const response = await axios.post(
            `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
            {},
            { withCredentials: true }
          );

          console.log("[Auth] Refresh response:", response.data?.status);

          if (response.data?.status === "success") {
            console.log(
              "[Auth] Retrying original request:",
              originalRequest.url
            );
            // Tokens are set in cookies by the backend, retry original request
            const retryResponse = await apiClient(originalRequest);
            console.log("[Auth] Retry successful:", retryResponse.status);
            return retryResponse;
          }
        } catch (refreshError) {
          console.error("[Auth] Refresh failed:", refreshError);
          clearTokens();
          // Only redirect if not already on auth page
          if (!isOnAuthPage) {
            window.location.href = "/auth/signin";
          }
        }
      } else if (!isOnAuthPage) {
        // Refresh failed, redirect to sign in
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
