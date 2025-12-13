import { useState, useEffect, useCallback } from "react";
import { AlertCircle, RefreshCw, BarChart3, Lock } from "lucide-react";
import { Button, Spinner, EmptyState, Card } from "@/components/ui";
import { StatsGrid, ConnectWorkspaceCTA } from "@/components/workspace";
import { getWorkspaceStats, getConnectionSettings } from "@/api/workspace";
import { initiateConnection } from "@/api/integrations";
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
      const response = await initiateConnection("google-workspace");
      if (response.data) {
        window.location.href = response.data.authorization_url;
      } else if (response.error) {
        setConnectError(response.error.message);
        setIsConnecting(false);
      } else {
        setConnectError("Failed to initiate connection");
        setIsConnecting(false);
      }
    } catch {
      setConnectError("Failed to initiate connection");
      setIsConnecting(false);
    }
  };

  if (connectionError) {
    return (
      <div className="bg-background-primary rounded-xl p-8 shadow-sm border border-border-light">
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
      <div className="flex flex-col items-center justify-center py-32">
        <Spinner size="lg" />
        <p className="mt-4 text-text-secondary font-medium">
          Checking connection status...
        </p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto py-12">
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
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Dashboard</h1>
        <p className="mt-2 text-text-secondary text-lg">
          Overview of your Google Workspace security posture
        </p>
      </div>

      {/* Stats Overview */}
      <section>
        <StatsGrid
          stats={stats}
          isLoading={statsLoading}
          isConnected={isConnected}
        />
      </section>

      {statsError && (
        <div className="rounded-lg bg-warning-50 px-4 py-3 flex items-center justify-between border border-warning-100">
          <span className="text-sm text-warning-700 font-medium">
            Failed to load statistics
          </span>
          <Button size="sm" variant="ghost" onClick={fetchStats} className="text-warning-700 hover:bg-warning-100">
            Retry
          </Button>
        </div>
      )}

      {/* Analytics Placeholder */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="xl" className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-background-secondary to-transparent opacity-50" />
          <div className="relative z-10 bg-background-primary p-4 rounded-full shadow-sm mb-2">
             <BarChart3 className="h-8 w-8 text-brand-secondary" />
          </div>
          <div className="relative z-10 max-w-sm">
            <h3 className="text-lg font-semibold text-text-primary">Analytics Dashboard</h3>
            <p className="text-text-secondary mt-1">
              Detailed insights into your workspace security trends and risk factors are coming soon.
            </p>
          </div>
          <div className="absolute inset-0 bg-background-primary/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="bg-background-primary px-4 py-2 rounded-full shadow-lg text-sm font-medium text-brand-secondary">Coming Soon</span>
          </div>
        </Card>

        <Card padding="xl" className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-4 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-bl from-background-secondary to-transparent opacity-50" />
           <div className="relative z-10 bg-background-primary p-4 rounded-full shadow-sm mb-2">
             <Lock className="h-8 w-8 text-brand-secondary" />
          </div>
          <div className="relative z-10 max-w-sm">
            <h3 className="text-lg font-semibold text-text-primary">Security Recommendations</h3>
            <p className="text-text-secondary mt-1">
              AI-powered recommendations to improve your security posture will be available shortly.
            </p>
          </div>
           <div className="absolute inset-0 bg-background-primary/5 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
             <span className="bg-background-primary px-4 py-2 rounded-full shadow-lg text-sm font-medium text-brand-secondary">Coming Soon</span>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default DashboardPage;
