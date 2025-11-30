import { Users, Users2, AppWindow, Shield } from "lucide-react";
import StatsCard from "./StatsCard";
import type { WorkspaceStats } from "@/types/workspace";

interface StatsGridProps {
  stats: WorkspaceStats | null;
  isLoading: boolean;
  isConnected: boolean;
}

const StatsGrid = ({ stats, isLoading, isConnected }: StatsGridProps) => {
  const statsItems = [
    {
      label: "Users",
      value: stats?.total_users ?? 0,
      icon: <Users className="h-5 w-5" />,
    },
    {
      label: "Groups",
      value: stats?.total_groups ?? 0,
      icon: <Users2 className="h-5 w-5" />,
    },
    {
      label: "Apps",
      value: stats?.total_apps ?? 0,
      icon: <AppWindow className="h-5 w-5" />,
    },
    {
      label: "Authorizations",
      value: stats?.active_authorizations ?? 0,
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((item) => (
        <StatsCard
          key={item.label}
          label={item.label}
          value={item.value}
          icon={item.icon}
          isLoading={isLoading}
          disabled={!isConnected}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
