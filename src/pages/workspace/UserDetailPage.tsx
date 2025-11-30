import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AppWindow, Key } from "lucide-react";
import Card from "@/components/ui/Card";
import { Badge } from "@/components/ui";
import { DetailPageSkeleton, DetailPageError } from "@/components/workspace";
import { getWorkspaceUserDetail } from "@/api/workspace";
import type { UserDetail, UserAppAuthorization } from "@/types/workspace";

interface PageState {
  isLoading: boolean;
  error: string | null;
  data: UserDetail | null;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getStatusBadgeVariant = (
  status: string
): "default" | "success" | "warning" | "error" => {
  switch (status.toLowerCase()) {
    case "active":
      return "success";
    case "suspended":
      return "error";
    case "archived":
      return "warning";
    default:
      return "default";
  }
};

const AuthorizedAppRow = ({ auth }: { auth: UserAppAuthorization }) => {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
        <AppWindow className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">
          {auth.app_name || "Unknown App"}
        </div>
        <div className="text-sm text-gray-500 truncate">{auth.client_id}</div>
      </div>

      <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0">
        <Key className="h-4 w-4" />
        {auth.scopes.length} scopes
      </div>

      <div className="text-sm text-gray-500 shrink-0">
        {formatDate(auth.authorized_at)}
      </div>
    </div>
  );
};

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const userId = id ? parseInt(id, 10) : null;

  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    data: null,
  });

  const fetchUserDetail = async (userIdToFetch: number) => {
    setState({ isLoading: true, error: null, data: null });
    try {
      const response = await getWorkspaceUserDetail(userIdToFetch);
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
        error: "Failed to load user details",
        data: null,
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetail(userId);
    }
  }, [userId]);

  if (state.isLoading) {
    return <DetailPageSkeleton />;
  }

  if (state.error) {
    return (
      <DetailPageError
        message={state.error}
        onRetry={() => userId && fetchUserDetail(userId)}
        backPath="/dashboard"
        backLabel="Back to Dashboard"
      />
    );
  }

  const user = state.data;
  if (!user) return null;

  const displayName = user.full_name || user.email.split("@")[0];

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
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={displayName}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-xl font-medium">
            {displayName[0].toUpperCase()}
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-gray-900">
              {displayName}
            </h1>
            {user.is_admin && (
              <Badge variant="info" size="sm">
                Admin
              </Badge>
            )}
          </div>
          <p className="text-gray-500">{user.email}</p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(user.status)}
          size="sm"
          className="ml-auto"
        >
          {user.status}
        </Badge>
      </div>

      <Card padding="lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className="font-medium text-gray-900">{user.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Org Unit Path</div>
            <div className="font-medium text-gray-900">
              {user.org_unit_path || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 mb-1">Authorized Apps</div>
            <div className="font-medium text-gray-900">
              {user.authorizations.length}
            </div>
          </div>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Authorized Apps ({user.authorizations.length})
        </h2>
        {user.authorizations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            This user hasn't authorized any third-party apps
          </div>
        ) : (
          <div>
            {user.authorizations.map((auth) => (
              <AuthorizedAppRow key={auth.app_id} auth={auth} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserDetailPage;
