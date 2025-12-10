import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AppWindow,
  Calendar,
  Key,
  Users,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { Badge, Button } from "@/components/ui";
import { DetailPageSkeleton, DetailPageError } from "@/components/workspace";
import { getDiscoveredAppDetail } from "@/api/workspace";
import type { AppDetail, AppAuthorizationUser } from "@/types/workspace";
import { cn } from "@/utils/cn";

interface PageState {
  isLoading: boolean;
  error: string | null;
  data: AppDetail | null;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getClientTypeBadgeVariant = (
  clientType: string | null
): "default" | "info" | "success" => {
  if (!clientType) return "default";
  switch (clientType.toLowerCase()) {
    case "native":
      return "success";
    case "web":
      return "info";
    default:
      return "default";
  }
};

const ScopeItem = ({ scope }: { scope: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(scope);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-start gap-3 p-3 rounded-lg bg-background-secondary/50 border border-border-light hover:border-border-medium transition-colors">
      <div className="mt-0.5 shrink-0">
        <Key className="h-4 w-4 text-text-tertiary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-xs text-text-secondary break-all leading-relaxed">
          {scope}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="shrink-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy scope URL"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success-500" />
        ) : (
          <Copy className="h-3 w-3 text-text-tertiary" />
        )}
      </Button>
    </div>
  );
};

const AuthorizedUserRow = ({ user }: { user: AppAuthorizationUser }) => {
  const displayName = user.full_name || user.email.split("@")[0];

  return (
    <div className="flex items-center gap-4 py-4 border-b border-border-light last:border-b-0 hover:bg-background-secondary/30 px-4 -mx-4 transition-colors">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={displayName}
          className="h-10 w-10 rounded-full object-cover border border-border-medium"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary/10 text-brand-secondary text-sm font-medium shadow-sm">
          {displayName[0].toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary truncate">{displayName}</div>
        <div className="text-sm text-text-secondary truncate">{user.email}</div>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex flex-col items-end">
          <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium mb-0.5">Scopes</span>
          <Badge variant="default" size="sm" className="bg-background-tertiary text-text-secondary">
            {user.scopes.length}
          </Badge>
        </div>

        <div className="flex flex-col items-end w-24">
           <span className="text-xs text-text-tertiary uppercase tracking-wider font-medium mb-0.5">Authorized</span>
           <span className="text-sm text-text-secondary">
            {formatDate(user.authorized_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

const AppDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appId = id ? parseInt(id, 10) : null;

  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    data: null,
  });

  const [scopesExpanded, setScopesExpanded] = useState(false);

  const fetchAppDetail = async (appIdToFetch: number) => {
    setState({ isLoading: true, error: null, data: null });
    try {
      const response = await getDiscoveredAppDetail(appIdToFetch);
      if (response.error) {
        setState({
          isLoading: false,
          error: response.error.message,
          data: null,
        });
      } else {
        setState({ isLoading: false, error: null, data: response.data });
      }
    } catch {
      setState({
        isLoading: false,
        error: "Failed to load app details",
        data: null,
      });
    }
  };

  useEffect(() => {
    if (appId) {
      fetchAppDetail(appId);
    }
  }, [appId]);

  if (state.isLoading) {
    return <DetailPageSkeleton />;
  }

  if (state.error) {
    return (
      <DetailPageError
        message={state.error}
        onRetry={() => appId && fetchAppDetail(appId)}
        backPath="/apps"
        backLabel="Back to Apps"
      />
    );
  }

  const app = state.data;
  if (!app) return null;

  const visibleScopes = scopesExpanded
    ? app.all_scopes
    : app.all_scopes.slice(0, 5);
  const hasMoreScopes = app.all_scopes.length > 5;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header Navigation */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="group -ml-2 text-text-secondary hover:text-text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back
        </Button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white border border-border-light shadow-sm text-brand-secondary shrink-0">
              <AppWindow className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                {app.display_name || "Unknown App"}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <code className="px-2 py-1 rounded bg-background-secondary text-text-secondary text-xs font-mono border border-border-light">
                  {app.client_id}
                </code>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Open in Google Workspace">
                   <ExternalLink className="h-3 w-3 text-text-tertiary" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge
              variant={getClientTypeBadgeVariant(app.client_type)}
              size="lg"
              className="px-3 py-1"
            >
              {app.client_type || "Unknown Type"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="md" className="flex flex-col gap-1 bg-background-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">First Seen</div>
          <div className="flex items-center gap-2 text-lg font-semibold text-text-primary mt-1">
            <Calendar className="h-5 w-5 text-text-tertiary" />
            {formatDate(app.first_seen_at)}
          </div>
        </Card>
        <Card padding="md" className="flex flex-col gap-1 bg-background-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Last Seen</div>
          <div className="flex items-center gap-2 text-lg font-semibold text-text-primary mt-1">
            <Calendar className="h-5 w-5 text-text-tertiary" />
            {formatDate(app.last_seen_at)}
          </div>
        </Card>
        <Card padding="md" className="flex flex-col gap-1 bg-background-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Total Scopes</div>
          <div className="flex items-center gap-2 text-lg font-semibold text-text-primary mt-1">
            <Key className="h-5 w-5 text-brand-secondary" />
            {app.all_scopes.length}
          </div>
        </Card>
        <Card padding="md" className="flex flex-col gap-1 bg-background-primary shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Authorized Users</div>
          <div className="flex items-center gap-2 text-lg font-semibold text-text-primary mt-1">
            <Users className="h-5 w-5 text-success-500" />
            {app.authorizations.length}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scopes Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Key className="h-5 w-5 text-text-tertiary" />
              Scopes
            </h2>
            <span className="text-xs font-medium text-text-tertiary bg-background-secondary px-2 py-1 rounded-full">
              {app.all_scopes.length}
            </span>
          </div>
          
          <div className="space-y-3">
            {visibleScopes.map((scope) => (
              <ScopeItem key={scope} scope={scope} />
            ))}
          </div>
          
          {hasMoreScopes && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setScopesExpanded(!scopesExpanded)}
              className="w-full"
            >
              {scopesExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Show all {app.all_scopes.length} scopes
                </>
              )}
            </Button>
          )}
        </div>

        {/* Users Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <Users className="h-5 w-5 text-text-tertiary" />
              Authorized Users
            </h2>
            <span className="text-xs font-medium text-text-tertiary bg-background-secondary px-2 py-1 rounded-full">
              {app.authorizations.length} users
            </span>
          </div>

          <Card padding="lg" className="min-h-[200px]">
            {app.authorizations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Users className="h-12 w-12 text-text-tertiary mb-3 opacity-20" />
                <p className="text-text-secondary font-medium">No authorized users</p>
                <p className="text-sm text-text-tertiary mt-1">No users have granted access to this app yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-light">
                {app.authorizations.map((user) => (
                  <AuthorizedUserRow key={user.user_id} user={user} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AppDetailPage;
