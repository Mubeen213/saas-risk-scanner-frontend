import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, AppWindow, Key, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { Badge, Button } from "@/components/ui";
import { DetailPageSkeleton, DetailPageError } from "@/components/workspace";
import Timeline from "@/components/workspace/Timeline";
import { getWorkspaceUserDetail, getAppTimeline } from "@/api/workspace";
import type { UserDetail, UserAppAuthorization } from "@/types/workspace";

interface PageState {
  isLoading: boolean;
  error: string | null;
  data: UserDetail | null;
}

import { formatDisplayDate } from "@/utils/dateUtils";

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

const AuthorizedAppRow = ({ auth, userId }: { auth: UserAppAuthorization; userId: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const toggleExpand = async () => {
    if (!isExpanded && !hasLoaded) {
      setIsLoading(true);
      try {
        const res = await getAppTimeline(auth.app_id, {
          page: 1,
          page_size: 10,
          user_id: userId,
        });
        if (res.data) {
          setTimeline(res.data.items);
        }
        setHasLoaded(true);
      } catch (err) {
        console.error("Failed to load timeline", err);
      } finally {
        setIsLoading(false);
      }
    }
    setIsExpanded(!isExpanded);
  };

  // Helper to format grant date, handling 1970/null
  const formatGrantDate = (dateString: string) => {
      if (!dateString) return <span className="text-text-tertiary">-</span>;
      const date = new Date(dateString);
      if (date.getFullYear() <= 1970) return <span className="text-text-tertiary" title="Exact date unknown (legacy grant)">Unknown</span>;
      return formatDisplayDate(dateString);
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div 
        className="flex items-center gap-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors px-2 rounded-lg -mx-2"
        onClick={toggleExpand}
      >
        <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
           <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
        
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

        <div className="text-sm text-gray-500 shrink-0 min-w-[100px] text-right">
          {formatGrantDate(auth.authorized_at)}
        </div>
      </div>

      {isExpanded && (
        <div className="pl-14 pr-4 pb-6 pt-2 space-y-4">
            {/* Granted Scopes Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Granted Scopes
                </h4>
                {auth.scopes.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No scopes granted</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {auth.scopes.map((scope, index) => {
                            // Extract the readable scope name from full URL
                            const scopeName = scope.includes('/') 
                                ? scope.split('/').pop() || scope 
                                : scope;
                            
                            // Check if scope is sensitive (drive, gmail, calendar related)
                            const isSensitive = /drive|gmail|calendar|contacts|admin/i.test(scope);
                            
                            return (
                                <span
                                    key={index}
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                        isSensitive 
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}
                                    title={scope}
                                >
                                    {scopeName}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Activity History Section */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Activity History
                </h4>
                <Timeline events={timeline} isLoading={isLoading} />
            </div>
        </div>
      )}
    </div>
  );
};

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        backPath="/users"
        backLabel="Back to Users"
      />
    );
  }

  const user = state.data;
  if (!user) return null;

  const displayName = user.full_name || user.email.split("@")[0];

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="pl-0 gap-2 text-text-secondary hover:text-text-primary mb-4"
        onClick={() => navigate("/users")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Users
      </Button>

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
          <div className="text-center py-8 text-text-tertiary">
            This user hasn't authorized any third-party apps
          </div>
        ) : (
          <div>
            {user.authorizations.map((auth) => (
              <AuthorizedAppRow key={auth.app_id} auth={auth} userId={user.id} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserDetailPage;
