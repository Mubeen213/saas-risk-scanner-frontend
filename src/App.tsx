import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { SignInPage } from "@/pages/auth/SignInPage";
import { OAuthCallbackPage } from "@/pages/auth/OAuthCallbackPage";
import { IntegrationCallbackPage } from "@/pages/integrations/IntegrationCallbackPage";
import { DashboardPage } from "@/pages/dashboard";
import { SettingsPage } from "@/pages/settings";
import {
  UserDetailPage,
  GroupDetailPage,
  AppDetailPage,
  AppsPage,
  UsersPage,
  GroupsPage,
} from "@/pages/workspace";

const AppLayout = () => (
  <>
    <ScrollRestoration />
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Public routes
      {
        path: "/auth/signin",
        element: <SignInPage />,
      },
      {
        path: "/auth/callback",
        element: <OAuthCallbackPage />,
      },

      // Protected routes
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "apps",
            element: <AppsPage />,
          },
          {
            path: "apps/:id",
            element: <AppDetailPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "users/:id",
            element: <UserDetailPage />,
          },
          {
            path: "groups",
            element: <GroupsPage />,
          },
          {
            path: "groups/:id",
            element: <GroupDetailPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          // Integration callback (protected - user must be logged in)
          {
            path: "integrations/callback",
            element: <IntegrationCallbackPage />,
          },
        ],
      },

      // Catch-all redirect
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
