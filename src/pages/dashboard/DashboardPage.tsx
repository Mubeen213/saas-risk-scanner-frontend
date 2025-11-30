import { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, Spinner, EmptyState } from "@/components/ui";
import { StatsGrid, ConnectWorkspaceCTA } from "@/components/workspace";
import { getWorkspaceStats, getConnectionSettings } from "@/api/workspace";
import type { WorkspaceStats, ConnectionSettings } from "@/types/workspace";

const DashboardPage = () => {
  const [connectionSettings, setConnectionSettings] =
    useState<ConnectionSettings | null>(null);
  const [connectionLoading, setConnectionLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const [stats, setStats] = useState<WorkspaceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const isConnected = !!connectionSettings?.connection;

  const fetchConnectionStatus = useCallback(async () => {
    setConnectionLoading(true);
    setConnectionError(null);
    try {
      const response = await getConnectionSettings();
      if (response.error) {
        setConnectionError(response.error.message);
      } else {
        setConnectionSettings(response.data);
      }
    } catch {
      setConnectionError("Failed to check connection status");
    } finally {
      setConnectionLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    if (!isConnected) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      const response = await getWorkspaceStats();
      if (response.error) {
        setStatsError(response.error.message);
      } else {
        setStats(response.data);
      }
    } catch {
      setStatsError("Failed to load statistics");
    } finally {
      setStatsLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetchConnectionStatus();
  }, [fetchConnectionStatus]);

  useEffect(() => {
    if (isConnected) {
      fetchStats();
    }
  }, [isConnected, fetchStats]);

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      const googleUrl = `${
        import.meta.env.VITE_API_URL
      }/oauth/google/authorize`;
      window.location.href = googleUrl;
    } catch {
      setConnectError("Failed to initiate connection");
      setIsConnecting(false);
    }
  };

  if (connectionError) {
    return (
      <div className="bg-background-primary rounded-xl p-8">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-error-500" />}
          title="Failed to check connection status"
          message={connectionError}
          action={
            <Button onClick={fetchConnectionStatus} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (connectionLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" />
        <p className="mt-4 text-text-secondary">
          Checking connection status...
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto">
        <ConnectWorkspaceCTA
          onConnect={handleConnect}
          isConnecting={isConnecting}
          error={connectError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="mt-1 text-text-secondary">
          Overview of your Google Workspace security posture
        </p>
      </div>

      {/* Stats Overview */}
      <StatsGrid
        stats={stats}
        isLoading={statsLoading}
        isConnected={isConnected}
      />

      {statsError && (
        <div className="rounded-lg bg-warning-50 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            Failed to load statistics
          </span>
          <Button size="sm" variant="ghost" onClick={fetchStats}>
            Retry
          </Button>
        </div>
      )}

      {/* Placeholder for future content */}
      <div className="bg-background-primary rounded-xl border border-border-light p-12">
        <div className="text-center text-text-tertiary">
          <p className="text-sm">Analytics and insights coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
