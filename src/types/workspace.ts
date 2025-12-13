/**
 * Workspace Types
 * Matches backend schemas/workspace.py
 */

export interface WorkspaceStats {
  total_users: number;
  total_groups: number;
  total_apps: number;
  active_authorizations: number;
  last_sync_at: string | null;
}

export interface WorkspaceUserListItem {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  is_delegated_admin: boolean;
  status: string;
  authorized_apps_count: number;
}

export interface WorkspaceGroupListItem {
  id: number;
  email: string;
  name: string;
  description: string | null;
  direct_members_count: number;
}

export interface OAuthAppListItem {
  id: number;
  name: string;
  client_id: string;
  risk_score: number;
  is_system_app: boolean;
  is_trusted: boolean;
  scopes_summary: string[];
  active_grants_count: number;
  last_activity_at: string | null;
}

// Keeping this alias for compatibility if needed, or better to remove/replace usages
export type DiscoveredAppListItem = OAuthAppListItem;

export interface UserAppAuthorization {
  app_id: number;
  app_name: string | null;
  client_id: string;
  scopes: string[];
  authorized_at: string;
  status: string;
}

export interface UserDetail {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  status: string;
  org_unit_path: string | null;
  authorizations: UserAppAuthorization[];
}

export interface AppAuthorizationUser {
  user_id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  scopes: string[];
  authorized_at: string;
  status: string;
}

export interface AppDetail {
  id: number;
  name: string;
  client_id: string;
  risk_score: number;
  is_system_app: boolean;
  is_trusted: boolean;
  status: string;
  all_scopes: string[];
  active_grants_count: number;
  last_activity_at: string | null;
  authorizations: AppAuthorizationUser[];
}

export interface GroupMember {
  user_id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface GroupDetail {
  id: number;
  email: string;
  name: string;
  description: string | null;
  direct_members_count: number;
  members: GroupMember[];
}

export interface ConnectionInfo {
  connection_id: number;
  status: string;
  admin_email: string | null;
  workspace_domain: string | null;
  last_sync_completed_at: string | null;
  last_sync_status: string | null;
}

export interface ConnectionSettings {
  connection: ConnectionInfo | null;
  can_sync: boolean;
  is_syncing: boolean;
}

export interface WorkspaceUsersListResponse {
  items: WorkspaceUserListItem[];
  pagination: PaginationInfo;
}

export interface WorkspaceGroupsListResponse {
  items: WorkspaceGroupListItem[];
  pagination: PaginationInfo;
}

export interface DiscoveredAppsListResponse {
  items: OAuthAppListItem[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export type TabId = "apps" | "users" | "groups";
