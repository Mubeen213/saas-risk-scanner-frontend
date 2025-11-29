/**
 * API Error Handling
 * Custom error class and utilities for parsing backend errors
 */

import { AxiosError } from "axios";
import { API_ERROR_MESSAGES, HTTP_STATUS } from "../constants/api";

/**
 * Custom API Error class
 * Provides structured error information from API responses
 */
export class ApiError extends Error {
  public statusCode: number;
  public detail: string;
  public originalError?: AxiosError;

  constructor(
    message: string,
    statusCode: number,
    detail: string,
    originalError?: AxiosError
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.detail = detail;
    this.originalError = originalError;

    // Maintains proper stack trace for where error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Backend error response structure (matches FastAPI error format)
 */
interface BackendErrorResponse {
  detail?: string | { msg: string; type: string; loc: string[] }[];
}

/**
 * Parse error from axios error response
 * Extracts meaningful error information from backend responses
 */
export function parseApiError(error: unknown): ApiError {
  // Handle AxiosError
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<BackendErrorResponse>;

    // Network error (no response)
    if (!axiosError.response) {
      if (axiosError.code === "ECONNABORTED") {
        return new ApiError(
          API_ERROR_MESSAGES.TIMEOUT,
          0,
          "Request timeout",
          axiosError
        );
      }
      return new ApiError(
        API_ERROR_MESSAGES.NETWORK_ERROR,
        0,
        "Network error - unable to reach server",
        axiosError
      );
    }

    const { status, data } = axiosError.response;

    // Extract error detail from response
    let errorDetail: string = API_ERROR_MESSAGES.UNKNOWN_ERROR;
    let errorMessage: string = API_ERROR_MESSAGES.UNKNOWN_ERROR;

    if (data && typeof data === "object") {
      // Handle string detail (most common from FastAPI)
      if (typeof data.detail === "string") {
        errorDetail = data.detail;
        errorMessage = data.detail;
      }
      // Handle validation error array (FastAPI validation errors)
      else if (Array.isArray(data.detail)) {
        errorDetail = data.detail
          .map((err) => `${err.loc.join(".")}: ${err.msg}`)
          .join(", ");
        errorMessage = "Validation error: " + errorDetail;
      }
    }

    // Set user-friendly message based on status code
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        errorMessage = errorDetail || "Invalid request";
        break;
      case HTTP_STATUS.UNAUTHORIZED:
        errorMessage = API_ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case HTTP_STATUS.FORBIDDEN:
        errorMessage = API_ERROR_MESSAGES.UNAUTHORIZED;
        break;
      case HTTP_STATUS.NOT_FOUND:
        errorMessage = errorDetail || API_ERROR_MESSAGES.NOT_FOUND;
        break;
      case HTTP_STATUS.CONFLICT:
        errorMessage = errorDetail || "Resource conflict";
        break;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        errorMessage = API_ERROR_MESSAGES.SERVER_ERROR;
        break;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        errorMessage = "Service temporarily unavailable";
        break;
      default:
        errorMessage = errorDetail || API_ERROR_MESSAGES.UNKNOWN_ERROR;
    }

    return new ApiError(errorMessage, status, errorDetail, axiosError);
  }

  // Handle ApiError (already parsed)
  if (error instanceof ApiError) {
    return error;
  }

  // Handle generic Error
  if (error instanceof Error) {
    return new ApiError(error.message, 0, error.message);
  }

  // Handle unknown error types
  return new ApiError(API_ERROR_MESSAGES.UNKNOWN_ERROR, 0, String(error));
}

/**
 * Check if error is a specific HTTP status code
 */
export function isErrorStatus(error: unknown, statusCode: number): boolean {
  return error instanceof ApiError && error.statusCode === statusCode;
}

/**
 * Check if error is a network error (no response from server)
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 0;
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  const apiError = parseApiError(error);
  return apiError.message;
}
