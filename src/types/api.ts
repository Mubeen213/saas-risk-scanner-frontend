/**
 * Common API Response Types
 * Matches backend schemas/common.py
 */

export interface MetaResponse {
  request_id: string;
  timestamp: string;
}

export interface PaginationResponse {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
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
