import { Badge } from "@/components/ui";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface ScopesListProps {
  scopes: string[];
}



const isHighRisk = (scope: string): boolean => {
  const lower = scope.toLowerCase();
  // Read-only is generally lower risk
  if (lower.includes("readonly")) return false;
  // User info/email is generally lower risk
  if (lower.includes("userinfo") || lower.includes("email")) return false;
  
  // Explicit high risk keywords
  if (lower.includes("settings") || lower.includes("admin")) return true;
  if (!lower.includes("readonly")) return true; // Default to risk if not read-only
  
  return false;
};

const formatScopeName = (scope: string): string => {
  const parts = scope.split("/");
  return parts[parts.length - 1]
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace("auth ", "");
};

const ScopesList = ({ scopes }: ScopesListProps) => {
  return (
    <div className="grid grid-cols-1 gap-2">
      {scopes.map((scope) => {
        const highRisk = isHighRisk(scope);
        return (
          <div 
            key={scope} 
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              highRisk 
                ? "border-warning-200 bg-warning-50/30" 
                : "border-border-light bg-background-primary"
            }`}
          >
            <div className={`mt-0.5 ${highRisk ? "text-warning-600" : "text-success-600"}`}>
              {highRisk ? (
                <ShieldAlert className="h-4 w-4" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${highRisk ? "text-warning-900" : "text-text-primary"}`}>
                  {formatScopeName(scope)}
                </span>
                {highRisk && (
                  <Badge variant="warning" size="sm" className="h-5">
                    Write Access
                  </Badge>
                )}
              </div>
              <div className="text-xs text-text-tertiary truncate font-mono mt-0.5">
                {scope}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScopesList;
