/**
 * Dashboard Page
 * Main dashboard with Google Workspace connection CTA
 */

import { useState, useEffect } from "react";
import { Card, Button, Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  ArrowRight,
  Loader2,
  CheckCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import {
  initiateConnection,
  getConnections,
  syncConnection,
  type ConnectionInfo,
} from "@/api/integrations";

export const DashboardPage = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);

  useEffect(() => {
    fetchConnectionStatus();
  }, []);

  const fetchConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const response = await getConnections();
      const connections = response.data?.connections || [];
      if (connections.length > 0) {
        // For now, just use the first connection (Google Workspace)
        setConnection(connections[0]);
      }
    } catch (err) {
      console.error("Failed to fetch connection status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectWorkspace = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await initiateConnection("google-workspace");
      console.log("Connect response:", response);

      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else if (response.error) {
        setError(response.error.message || "Failed to initiate connection");
      } else {
        setError("Failed to get authorization URL");
      }
    } catch (err) {
      console.error("Failed to connect workspace:", err);
      setError("Failed to connect. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTriggerSync = async () => {
    if (!connection) return;
    setIsSyncing(true);
    setError(null);

    try {
      await syncConnection(connection.id);
      await fetchConnectionStatus();
    } catch (err) {
      console.error("Failed to trigger sync:", err);
      setError("Failed to start sync. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  const renderConnectionStatus = () => {
    if (isLoading) {
      return (
        <Card padding="lg">
          <div className="flex flex-col items-center py-8">
            <Spinner size="lg" />
            <p className="mt-4 text-text-secondary">
              Checking connection status...
            </p>
          </div>
        </Card>
      );
    }

    if (connection) {
      const isActive = connection.status === "active";
      const isSyncInProgress = connection.last_sync_status === "in_progress";

      return (
        <Card padding="lg">
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h2 className="text-xl font-semibold text-text-primary">
              Google Workspace Connected
            </h2>

            <p className="mt-2 max-w-md text-text-secondary">
              {connection.workspace_domain
                ? `Connected to ${connection.workspace_domain}`
                : "Your workspace is connected"}
            </p>

            <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-tertiary">Status</span>
                  <p className="font-medium text-text-primary">
                    {isActive ? (
                      <span className="text-green-600">Active</span>
                    ) : (
                      <span className="text-yellow-600">
                        {connection.status}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Admin Email</span>
                  <p className="font-medium text-text-primary">
                    {connection.admin_email || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Last Sync</span>
                  <p className="font-medium text-text-primary">
                    {formatDate(connection.last_sync_completed_at)}
                  </p>
                </div>
                <div>
                  <span className="text-text-tertiary">Sync Status</span>
                  <p className="font-medium text-text-primary">
                    {isSyncInProgress ? (
                      <span className="flex items-center text-blue-600">
                        <Clock className="mr-1 h-4 w-4 animate-pulse" />
                        Processing...
                      </span>
                    ) : connection.last_sync_status === "completed" ? (
                      <span className="text-green-600">Completed</span>
                    ) : connection.last_sync_status ? (
                      connection.last_sync_status
                    ) : (
                      "Not synced yet"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {isSyncInProgress && (
              <div className="mt-6 flex items-center rounded-lg bg-blue-50 px-4 py-3 text-blue-700">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>
                  Your data is being processed. This may take a few minutes...
                </span>
              </div>
            )}

            {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                onClick={handleTriggerSync}
                disabled={isSyncing || isSyncInProgress}
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting Sync...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            <p className="mt-4 text-xs text-text-tertiary">
              Connected on {formatDate(connection.created_at)}
            </p>
          </div>
        </Card>
      );
    }

    // Not connected - show CTA
    return (
      <Card padding="lg">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>

          <h2 className="text-xl font-semibold text-text-primary">
            Connect Your Google Workspace
          </h2>

          <p className="mt-2 max-w-md text-text-secondary">
            Connect your organization's Google Workspace to discover risky
            third-party app authorizations across all users.
          </p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <Button
            variant="primary"
            size="lg"
            className="mt-6"
            onClick={handleConnectWorkspace}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect Google Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="mt-4 text-xs text-text-tertiary">
            Requires Google Workspace Admin access
          </p>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back, {user?.full_name || user?.email}
        </p>
      </div>

      {renderConnectionStatus()}
    </div>
  );
};
