import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  AppWindow,
  Calendar,
  Key,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui";
import { DetailPageSkeleton, DetailPageError } from "@/components/workspace";
import { getDiscoveredAppDetail } from "@/api/workspace";
import type { AppDetail, AppAuthorizationUser } from "@/types/workspace";

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

const AuthorizedUserRow = ({ user }: { user: AppAuthorizationUser }) => {
  const displayName = user.full_name || user.email.split("@")[0];

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={displayName}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-medium">
          {displayName[0].toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{displayName}</div>
        <div className="text-sm text-gray-500 truncate">{user.email}</div>
      </div>

      <div className="text-sm text-gray-500 shrink-0">
        {user.scopes.length} scopes
      </div>

      <div className="text-sm text-gray-500 shrink-0">
        {formatDate(user.authorized_at)}
      </div>
    </div>
  );
};

const AppDetailPage = () => {
  const { id } = useParams<{ id: string }>();
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
        backPath="/dashboard"
        backLabel="Back to Dashboard"
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
    <div className="space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <AppWindow className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {app.display_name || "Unknown App"}
          </h1>
          <p className="text-gray-500">{app.client_id}</p>
        </div>
        <Badge
          variant={getClientTypeBadgeVariant(app.client_type)}
          size="sm"
          className="ml-auto"
        >
          {app.client_type || "Unknown"}
        </Badge>
      </div>

      <Card padding="lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">First Seen</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Calendar className="h-4 w-4 text-gray-400" />
              {formatDate(app.first_seen_at)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Last Seen</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Calendar className="h-4 w-4 text-gray-400" />
              {formatDate(app.last_seen_at)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Scopes</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Key className="h-4 w-4 text-gray-400" />
              {app.all_scopes.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Authorized Users</div>
            <div className="flex items-center gap-2 font-medium text-gray-900">
              <Users className="h-4 w-4 text-gray-400" />
              {app.authorizations.length}
            </div>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Scopes</h2>
        <div className="flex flex-wrap gap-2">
          {visibleScopes.map((scope) => (
            <Badge key={scope} variant="default" size="sm">
              {scope}
            </Badge>
          ))}
        </div>
        {hasMoreScopes && (
          <button
            onClick={() => setScopesExpanded(!scopesExpanded)}
            className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            {scopesExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show all {app.all_scopes.length} scopes
              </>
            )}
          </button>
        )}
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Authorized Users ({app.authorizations.length})
        </h2>
        {app.authorizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No users have authorized this app
          </div>
        ) : (
          <div>
            {app.authorizations.map((user) => (
              <AuthorizedUserRow key={user.user_id} user={user} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppDetailPage;
