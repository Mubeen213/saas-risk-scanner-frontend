import { AppWindow, Users, Users2 } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { cn } from "@/utils/cn";
import type { TabId } from "@/types/workspace";

interface WorkspaceTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  disabled?: boolean;
  counts: {
    apps: number;
    users: number;
    groups: number;
  };
  isLoading?: boolean;
}

const WorkspaceTabs = ({
  activeTab,
  onTabChange,
  disabled = false,
  counts,
  isLoading = false,
}: WorkspaceTabsProps) => {
  const tabs = [
    { id: "apps" as TabId, label: "Apps", count: counts.apps, icon: AppWindow },
    { id: "users" as TabId, label: "Users", count: counts.users, icon: Users },
    {
      id: "groups" as TabId,
      label: "Groups",
      count: counts.groups,
      icon: Users2,
    },
  ];

  return (
    <div
      className={cn(
        "flex border-b border-gray-200",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              isActive
                ? "border-brand-secondary text-brand-secondary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {isLoading ? (
              <Skeleton className="h-5 w-8 rounded-full" />
            ) : (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default WorkspaceTabs;
