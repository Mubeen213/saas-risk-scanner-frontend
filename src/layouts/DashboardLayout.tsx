/**
 * Dashboard Layout
 * Main layout wrapper for authenticated pages
 */

import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  AppWindow,
  Users,
  Users2,
} from "lucide-react";
import { cn } from "@/utils/cn";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
];

const workspaceNavItems = [
  { icon: AppWindow, label: "Apps", path: "/apps" },
  { icon: Users, label: "Users", path: "/users" },
  { icon: Users2, label: "Groups", path: "/groups" },
];

const settingsNavItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/signin");
  };

  return (
    <div className="flex min-h-screen bg-background-secondary">
      {/* Sidebar */}
      <aside className="hidden w-56 bg-background-primary lg:flex lg:flex-col">
        <div className="flex h-14 items-center px-4">
          <span className="text-base font-semibold text-text-primary">
            SaaS Risk Scanner
          </span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-0.5">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-interactive-active text-text-primary"
                      : "text-text-secondary hover:bg-interactive-hover hover:text-text-primary"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Workspace Section */}
          <div>
            <div className="px-2.5 py-1 text-xs font-medium text-text-tertiary uppercase tracking-wider">
              Workspace
            </div>
            <div className="mt-1 space-y-0.5">
              {workspaceNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-interactive-active text-text-primary"
                        : "text-text-secondary hover:bg-interactive-hover hover:text-text-primary"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-0.5">
            {settingsNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-interactive-active text-text-primary"
                      : "text-text-secondary hover:bg-interactive-hover hover:text-text-primary"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User section at bottom */}
        <div className="p-3 border-t border-border-light">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="h-7 w-7 rounded-full shrink-0"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-secondary text-white text-xs font-medium shrink-0">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-text-primary truncate">
                  {user.full_name || user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex h-14 items-center justify-between bg-background-primary px-4 lg:hidden">
          <span className="text-base font-semibold text-text-primary">
            SaaS Risk Scanner
          </span>
          <div className="flex items-center gap-3">
            {user && user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || user.email}
                className="h-7 w-7 rounded-full"
              />
            ) : user ? (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-secondary text-white text-xs">
                {(user.full_name || user.email)[0].toUpperCase()}
              </div>
            ) : null}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
