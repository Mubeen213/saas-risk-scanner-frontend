/**
 * Auth API Functions
 * API calls for authentication endpoints
 */

import apiClient from "./client";
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

/**
 * Get Google OAuth authorization URL
 */
export const getGoogleAuthUrl = async (
  redirectUri: string
): Promise<ApiResponse<AuthUrlResponse>> => {
  const response = await apiClient.get<ApiResponse<AuthUrlResponse>>(
    API_ENDPOINTS.AUTH.GOOGLE,
    { params: { redirect_uri: redirectUri } }
  );
  return response.data;
};

/**
 * Handle OAuth callback from Google
 */
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

/**
 * Refresh access token using refresh token
 */
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

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<ApiResponse<UserResponse>> => {
  const response = await apiClient.get<ApiResponse<UserResponse>>(
    API_ENDPOINTS.AUTH.ME
  );
  return response.data;
};

/**
 * Logout user and invalidate tokens
 */
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
