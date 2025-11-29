/**
 * Dashboard Page
 * Main dashboard with Google Workspace connection CTA
 */

import { Card, Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, ArrowRight } from "lucide-react";

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">
          Welcome back, {user?.full_name || user?.email}
        </p>
      </div>

      {/* Connect Google Workspace CTA */}
      <Card padding="lg">
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>

          <h2 className="text-xl font-semibold text-text-primary">
            Connect Your Google Workspace
          </h2>

          <p className="mt-2 max-w-md text-text-secondary">
            Connect your organization's Google Workspace to discover risky
            third-party app authorizations across all users.
          </p>

          <Button variant="primary" size="lg" className="mt-6">
            Connect Google Workspace
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <p className="mt-4 text-xs text-text-tertiary">
            Requires Google Workspace Admin access
          </p>
        </div>
      </Card>
    </div>
  );
};
