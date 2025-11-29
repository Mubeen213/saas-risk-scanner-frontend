/**
 * API Constants
 * Configuration for API endpoints and defaults
 */

// API Base URL
// In development, use relative path (Vite proxy forwards /api to backend)
// In production, use the full URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

// API Endpoints
export const API_ENDPOINTS = {
  // Health
  HEALTH: "/health",

  // Auth
  AUTH: {
    GOOGLE: "/auth/google",
    GOOGLE_CALLBACK: "/auth/google/callback",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
  },
} as const;

// Pagination Defaults
export const PAGINATION_DEFAULTS = {} as const;

// Request Timeouts (in milliseconds)
export const REQUEST_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  LONG: 30000, // 30 seconds
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Unable to connect to the server. Please check your connection.",
  TIMEOUT: "Request timed out. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "An error occurred on the server. Please try again later.",
  UNKNOWN_ERROR: "An unexpected error occurred.",
} as const;
