/**
 * Dashboard Layout
 * Main layout wrapper for authenticated pages
 */

import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import { LogOut } from "lucide-react";

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/signin");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar placeholder */}
      <aside className="hidden w-64 border-r border-border bg-white lg:block">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-semibold text-text-primary">
            SaaS Risk Scanner
          </span>
        </div>
        <nav className="p-4">{/* Navigation items will be added later */}</nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
          <div className="lg:hidden">
            <span className="text-lg font-semibold text-text-primary">
              SaaS Risk Scanner
            </span>
          </div>

          <div className="ml-auto flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                )}
                <span className="hidden text-sm text-text-primary sm:block">
                  {user.full_name || user.email}
                </span>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
