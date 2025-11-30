/**
 * Integrations API
 * Handles workspace connection and sync operations
 */

import { API_ENDPOINTS } from "@/constants/api";
import type { ApiResponse } from "@/types/api";
import apiClient from "./client";

// Types
export interface IntegrationConnectRequest {
  identity_provider_slug: string;
}

export interface IntegrationConnectResponse {
  authorization_url: string;
  state: string;
}

export interface ConnectionInfo {
  id: number;
  organization_id: number;
  identity_provider_id: number;
  identity_provider_slug: string;
  identity_provider_name: string;
  status: string;
  admin_email: string | null;
  workspace_domain: string | null;
  last_sync_completed_at: string | null;
  last_sync_status: string | null;
  created_at: string;
}

export interface SyncStats {
  users_synced: number;
  groups_synced: number;
  apps_discovered: number;
  authorizations_found: number;
}

export interface SyncResponse {
  connection_id: number;
  status: string;
  sync_stats: SyncStats;
  started_at: string;
  completed_at: string;
}

/**
 * Initiate Google Workspace connection
 * Returns authorization URL to redirect user to Google OAuth
 */
export const initiateConnection = async (
  providerSlug: string = "google-workspace"
): Promise<ApiResponse<IntegrationConnectResponse>> => {
  const response = await apiClient.post<
    ApiResponse<IntegrationConnectResponse>
  >(API_ENDPOINTS.INTEGRATIONS.CONNECT, {
    identity_provider_slug: providerSlug,
  });
  return response.data;
};

export interface ConnectionsListResponse {
  connections: ConnectionInfo[];
}

/**
 * Get all connections for current user's organization
 */
export const getConnections = async (): Promise<
  ApiResponse<ConnectionsListResponse>
> => {
  const response = await apiClient.get<ApiResponse<ConnectionsListResponse>>(
    API_ENDPOINTS.INTEGRATIONS.LIST
  );
  return response.data;
};

/**
 * Trigger sync for a connection
 */
export const syncConnection = async (
  connectionId: number,
  fullSync: boolean = false
): Promise<ApiResponse<SyncResponse>> => {
  const response = await apiClient.post<ApiResponse<SyncResponse>>(
    API_ENDPOINTS.INTEGRATIONS.SYNC(connectionId),
    { connection_id: connectionId, full_sync: fullSync }
  );
  return response.data;
};

/**
 * Disconnect/remove a workspace connection
 */
export const disconnectWorkspace = async (
  connectionId: number
): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete<ApiResponse<{ message: string }>>(
    API_ENDPOINTS.INTEGRATIONS.DISCONNECT(connectionId)
  );
  return response.data;
};
