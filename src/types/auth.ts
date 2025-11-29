/**
 * Auth Types
 * Matches backend schemas/auth.py, user.py, organization.py, role.py, plan.py
 */

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
