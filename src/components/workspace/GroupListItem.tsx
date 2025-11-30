import { useNavigate } from "react-router-dom";
import { ChevronRight, Users2 } from "lucide-react";
import type { WorkspaceGroupListItem } from "@/types/workspace";

interface GroupListItemProps {
  group: WorkspaceGroupListItem;
}

const GroupListItem = ({ group }: GroupListItemProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/groups/${group.id}`)}
      className="flex items-center gap-4 w-full px-4 py-3 text-left rounded-lg hover:bg-interactive-hover transition-colors group"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-protocol-profinet/10 text-protocol-profinet">
        <Users2 className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-text-primary truncate">
          {group.name}
        </div>
        <div className="text-sm text-text-secondary truncate">
          {group.email}
        </div>
      </div>

      <div className="text-sm text-text-secondary w-24 text-center shrink-0">
        {group.direct_members_count} members
      </div>

      <div className="text-sm text-text-tertiary w-48 truncate shrink-0 hidden md:block">
        {group.description || "No description"}
      </div>

      <ChevronRight className="h-4 w-4 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  );
};

export default GroupListItem;
