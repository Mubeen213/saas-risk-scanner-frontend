import { useNavigate } from "react-router-dom";
import { ChevronRight, AppWindow } from "lucide-react";
import { Badge } from "@/components/ui";
import type { OAuthAppListItem } from "@/types/workspace";

interface AppListItemProps {
  app: OAuthAppListItem;
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

const AppListItem = ({ app }: AppListItemProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/apps/${app.id}`)}
      className="flex items-center gap-4 w-full px-4 py-3 text-left rounded-lg hover:bg-interactive-hover transition-colors group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-50 text-info-500">
        <AppWindow className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
            <div className="font-medium text-text-primary truncate">
            {app.name || "Unknown App"}
            </div>
            {app.is_system_app && (
                <Badge variant="default" size="sm">System</Badge>
            )}
             {app.is_trusted && (
                <Badge variant="success" size="sm">Trusted</Badge>
            )}
        </div>
        <div className="text-sm text-text-secondary truncate">
          {app.client_id}
        </div>
      </div>

      <div className="text-sm text-text-secondary w-20 text-center shrink-0">
        {app.risk_score > 0 ? (
            <span className="text-error-500 font-medium">{app.risk_score} Risk</span>
        ) : (
            <span className="text-success-500">Safe</span>
        )}
      </div>

      <div className="text-sm text-text-secondary w-16 text-center shrink-0">
        {app.active_grants_count} users
      </div>

      <div className="text-sm text-text-tertiary w-24 shrink-0">
        {app.last_activity_at ? formatDate(app.last_activity_at) : "-"}
      </div>

      <ChevronRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

export default AppListItem;
