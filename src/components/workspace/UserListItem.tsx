import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui";
import type { WorkspaceUserListItem } from "@/types/workspace";

interface UserListItemProps {
  user: WorkspaceUserListItem;
}

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

const UserListItem = ({ user }: UserListItemProps) => {
  const navigate = useNavigate();
  const displayName =
    user.full_name || user.email?.split("@")[0] || "Unknown User";
  const isAdmin = user.is_admin || user.is_delegated_admin;

  return (
    <button
      onClick={() => navigate(`/users/${user.id}`)}
      className="flex items-center gap-4 w-full px-4 py-3 text-left rounded-lg hover:bg-interactive-hover transition-colors group"
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={displayName}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-secondary text-white text-sm font-medium">
          {displayName[0]?.toUpperCase() || "?"}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary truncate">
          {displayName}
        </div>
        <div className="text-sm text-text-secondary truncate">{user.email}</div>
      </div>

      <Badge
        variant={isAdmin ? "info" : "default"}
        size="sm"
        className="shrink-0"
      >
        {isAdmin ? "Admin" : "User"}
      </Badge>

      <div className="text-sm text-text-secondary w-16 text-center shrink-0">
        {user.authorized_apps_count} apps
      </div>

      <Badge
        variant={getStatusBadgeVariant(user.status)}
        size="sm"
        className="w-20 justify-center shrink-0"
      >
        {user.status}
      </Badge>

      <ChevronRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

export default UserListItem;
