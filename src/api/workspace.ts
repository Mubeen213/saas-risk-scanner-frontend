/**
 * Workspace API
 * Handles workspace data operations
 */

import apiClient from "./client";
import type { ApiResponse } from "@/types/api";
import type {
  WorkspaceStats,
  WorkspaceUsersListResponse,
  WorkspaceGroupsListResponse,
  DiscoveredAppsListResponse,
  UserDetail,
  GroupDetail,
  AppDetail,
  ConnectionSettings,
  PaginationParams,
} from "@/types/workspace";

const WORKSPACE_ENDPOINTS = {
  STATS: "/workspace/stats",
  USERS: "/workspace/users",
  USER_DETAIL: (id: number) => `/workspace/users/${id}`,
  GROUPS: "/workspace/groups",
  GROUP_DETAIL: (id: number) => `/workspace/groups/${id}`,
  APPS: "/workspace/apps",
  APP_DETAIL: (id: number) => `/workspace/apps/${id}`,
  SETTINGS: "/workspace/settings",
  DISCONNECT: "/workspace/disconnect",
} as const;

export const getWorkspaceStats = async (): Promise<
  ApiResponse<WorkspaceStats>
> => {
  const response = await apiClient.get<ApiResponse<WorkspaceStats>>(
    WORKSPACE_ENDPOINTS.STATS
  );
  return response.data;
};

export const getWorkspaceUsers = async (
  params: PaginationParams = {}
): Promise<ApiResponse<WorkspaceUsersListResponse>> => {
  const response = await apiClient.get<ApiResponse<WorkspaceUsersListResponse>>(
    WORKSPACE_ENDPOINTS.USERS,
    { params }
  );
  return response.data;
};

export const getWorkspaceUserDetail = async (
  userId: number
): Promise<ApiResponse<UserDetail>> => {
  const response = await apiClient.get<ApiResponse<UserDetail>>(
    WORKSPACE_ENDPOINTS.USER_DETAIL(userId)
  );
  return response.data;
};

export const getWorkspaceGroups = async (
  params: PaginationParams = {}
): Promise<ApiResponse<WorkspaceGroupsListResponse>> => {
  const response = await apiClient.get<
    ApiResponse<WorkspaceGroupsListResponse>
  >(WORKSPACE_ENDPOINTS.GROUPS, { params });
  return response.data;
};

export const getWorkspaceGroupDetail = async (
  groupId: number
): Promise<ApiResponse<GroupDetail>> => {
  const response = await apiClient.get<ApiResponse<GroupDetail>>(
    WORKSPACE_ENDPOINTS.GROUP_DETAIL(groupId)
  );
  return response.data;
};

export const getDiscoveredApps = async (
  params: PaginationParams = {}
): Promise<ApiResponse<DiscoveredAppsListResponse>> => {
  const response = await apiClient.get<ApiResponse<DiscoveredAppsListResponse>>(
    WORKSPACE_ENDPOINTS.APPS,
    { params }
  );
  return response.data;
};

export const getDiscoveredAppDetail = async (
  appId: number
): Promise<ApiResponse<AppDetail>> => {
  const response = await apiClient.get<ApiResponse<AppDetail>>(
    WORKSPACE_ENDPOINTS.APP_DETAIL(appId)
  );
  return response.data;
};

export const getConnectionSettings = async (): Promise<
  ApiResponse<ConnectionSettings>
> => {
  const response = await apiClient.get<ApiResponse<ConnectionSettings>>(
    WORKSPACE_ENDPOINTS.SETTINGS
  );
  return response.data;
};

export const disconnectWorkspace = async (): Promise<
  ApiResponse<{ disconnected: boolean }>
> => {
  const response = await apiClient.post<ApiResponse<{ disconnected: boolean }>>(
    WORKSPACE_ENDPOINTS.DISCONNECT
  );
  return response.data;
};


export const getAppTimeline = async (
  appId: number,
  params: PaginationParams = {}
): Promise<ApiResponse<{ items: any[]; pagination: any }>> => {
  const response = await apiClient.get<ApiResponse<{ items: any[]; pagination: any }>>(
    `${WORKSPACE_ENDPOINTS.APPS}/${appId}/timeline`,
    { params }
  );
  return response.data;
};
