import { useNavigate } from "react-router-dom";
import { ChevronRight, AppWindow } from "lucide-react";
import { Badge } from "@/components/ui";
import type { DiscoveredAppListItem } from "@/types/workspace";

interface AppListItemProps {
  app: DiscoveredAppListItem;
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
        <div className="font-medium text-text-primary truncate">
          {app.display_name || "Unknown App"}
        </div>
        <div className="text-sm text-text-secondary truncate">
          {app.client_id}
        </div>
      </div>

      <Badge
        variant={getClientTypeBadgeVariant(app.client_type)}
        size="sm"
        className="shrink-0"
      >
        {app.client_type || "Unknown"}
      </Badge>

      <div className="text-sm text-text-secondary w-16 text-center shrink-0">
        {app.authorized_users_count} users
      </div>

      <div className="text-sm text-text-tertiary w-24 shrink-0">
        {formatDate(app.first_seen_at)}
      </div>

      <ChevronRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

export default AppListItem;
