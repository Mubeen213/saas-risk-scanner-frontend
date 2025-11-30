import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  Calendar,
  AtSign,
  Globe,
} from "lucide-react";
import { Card, Button, EmptyState } from "@/components/ui";
import { Skeleton } from "@/components/ui/Skeleton";
import { ConnectWorkspaceCTA } from "@/components/workspace";
import { getConnectionSettings, disconnectWorkspace } from "@/api/workspace";
import type { ConnectionSettings, ConnectionInfo } from "@/types/workspace";

interface PageState {
  isLoading: boolean;
  error: string | null;
  settings: ConnectionSettings | null;
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ConnectionStatusInfo = ({
  connection,
}: {
  connection: ConnectionInfo;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <AtSign className="h-4 w-4" />
          Admin Email
        </div>
        <div className="font-medium text-gray-900">
          {connection.admin_email || "N/A"}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Globe className="h-4 w-4" />
          Workspace Domain
        </div>
        <div className="font-medium text-gray-900">
          {connection.workspace_domain || "N/A"}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Calendar className="h-4 w-4" />
          Last Sync
        </div>
        <div className="font-medium text-gray-900">
          {formatDate(connection.last_sync_completed_at)}
        </div>
      </div>

      <div>
        <div className="text-sm text-gray-500 mb-1">Sync Status</div>
        <div className="font-medium text-gray-900">
          {connection.last_sync_status || "N/A"}
        </div>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    settings: null,
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setState({ isLoading: true, error: null, settings: null });
    try {
      const response = await getConnectionSettings();
      if (response.error) {
        setState({
          isLoading: false,
          error: response.error.message,
          settings: null,
        });
      } else {
        setState({ isLoading: false, error: null, settings: response.data });
      }
    } catch {
      setState({
        isLoading: false,
        error: "Failed to load settings",
        settings: null,
      });
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      // TODO: Implement sync API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchSettings();
    } catch {
      setSyncError("Failed to trigger sync");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disconnect your workspace? This will remove all synced data."
      )
    ) {
      return;
    }
    setIsDisconnecting(true);
    setDisconnectError(null);
    try {
      const response = await disconnectWorkspace();
      if (response.error) {
        setDisconnectError(response.error.message);
      } else {
        await fetchSettings();
      }
    } catch {
      setDisconnectError("Failed to disconnect workspace");
    } finally {
      setIsDisconnecting(false);
    }
  };

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

  if (state.isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <Card padding="lg">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-56" />
            <div className="flex gap-4 mt-6">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <Card padding="lg">
          <EmptyState
            icon={<AlertCircle className="h-12 w-12 text-red-400" />}
            title="Failed to load settings"
            message={state.error}
            action={
              <Button onClick={fetchSettings} variant="secondary">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const settings = state.settings;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>

      <Card padding="lg">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Workspace Connection
        </h2>

        {settings?.connection ? (
          <>
            <ConnectionStatusInfo connection={settings.connection} />

            {syncError && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {syncError}
              </div>
            )}

            {disconnectError && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {disconnectError}
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSync}
                disabled={
                  !settings.can_sync || settings.is_syncing || isSyncing
                }
              >
                {settings.is_syncing || isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync Now"
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect Workspace"
                )}
              </Button>
            </div>
          </>
        ) : (
          <ConnectWorkspaceCTA
            onConnect={handleConnect}
            isConnecting={isConnecting}
            error={connectError}
          />
        )}
      </Card>
    </div>
  );
};

export default SettingsPage;
