import { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Menu,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/signin");
  };

  const NavItem = ({
    item,
    collapsed,
  }: {
    item: { icon: any; label: string; path: string };
    collapsed: boolean;
  }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
          isActive
            ? "bg-interactive-active text-text-primary shadow-sm"
            : "text-text-secondary hover:bg-interactive-hover hover:text-text-primary",
          collapsed && "justify-center px-2"
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          collapsed ? "h-6 w-6" : ""
        )}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-text-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {item.label}
        </div>
      )}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen bg-background-secondary">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 bg-background-primary border-r border-border-light transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border-light">
          {!isCollapsed && (
            <span className="text-lg font-bold text-text-primary truncate">
              SaaS Risk
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("ml-auto", isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavItem key={item.path} item={item} collapsed={isCollapsed} />
            ))}
          </div>

          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                Workspace
              </div>
            )}
            {workspaceNavItems.map((item) => (
              <NavItem key={item.path} item={item} collapsed={isCollapsed} />
            ))}
          </div>

          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                System
              </div>
            )}
            {settingsNavItems.map((item) => (
              <NavItem key={item.path} item={item} collapsed={isCollapsed} />
            ))}
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-border-light">
          {user && (
            <div
              className={cn(
                "flex items-center gap-3",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    className="h-8 w-8 rounded-full shrink-0 border border-border-medium"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-white text-xs font-medium shrink-0 shadow-sm">
                    {(user.full_name || user.email)[0].toUpperCase()}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {user.full_name || user.email.split("@")[0]}
                    </span>
                    <span className="text-xs text-text-tertiary truncate">
                      {user.email}
                    </span>
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="shrink-0 text-text-tertiary hover:text-error-500"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between bg-background-primary px-4 border-b border-border-light lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-text-primary">SaaS Risk</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-brand-secondary text-white flex items-center justify-center text-sm font-medium">
              {(user.full_name || user.email)[0].toUpperCase()}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-background-backdrop lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-64 bg-background-primary shadow-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-lg font-bold text-text-primary">Menu</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-6">
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavItem key={item.path} item={item} collapsed={false} />
                ))}
              </div>
              <div className="space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  Workspace
                </div>
                {workspaceNavItems.map((item) => (
                  <NavItem key={item.path} item={item} collapsed={false} />
                ))}
              </div>
              <div className="space-y-1">
                <div className="px-3 mb-2 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
                  System
                </div>
                {settingsNavItems.map((item) => (
                  <NavItem key={item.path} item={item} collapsed={false} />
                ))}
              </div>
            </nav>
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <main className="flex-1 p-6 lg:p-8 mt-16 lg:mt-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
