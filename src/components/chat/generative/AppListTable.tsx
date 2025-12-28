import { cn } from "@/utils/cn";

interface App {
  id: number;
  name: string;
  risk: "high" | "medium" | "low";
  users: number;
}

interface AppListTableProps {
  data: App[];
}

const riskColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-green-100 text-green-700",
};

export const AppListTable = ({ data }: AppListTableProps) => {
  return (
    <div className="w-full bg-background-primary rounded-xl border border-border-light overflow-hidden">
      <table className="w-full">
        <thead className="bg-background-secondary">
          <tr>
            <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-4 py-3">
              Application
            </th>
            <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-4 py-3">
              Risk Level
            </th>
            <th className="text-left text-xs font-medium text-text-secondary uppercase tracking-wider px-4 py-3">
              Users
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {data.map((app) => (
            <tr
              key={app.id}
              className="hover:bg-interactive-hover transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-text-primary">
                {app.name}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                    riskColors[app.risk]
                  )}
                >
                  {app.risk}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-text-secondary">
                {app.users}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
