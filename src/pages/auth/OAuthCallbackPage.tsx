/**
 * OAuth Callback Page
 * Handles the callback from Google OAuth
 *
 * The backend redirects here with:
 * - Success: ?success=true&is_new_user=true/false (tokens are in HTTP-only cookies)
 * - Error: ?error=CODE&error_message=msg
 *
 * Tokens are stored in secure HTTP-only cookies by the backend,
 * so they're automatically sent with API requests.
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { getCurrentUser } from "@/api/auth";

export const OAuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithCookies } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      // Check for error in query params
      const errorParam = searchParams.get("error");
      const errorMessage = searchParams.get("error_message");

      if (errorParam) {
        setError(errorMessage || "Authentication failed");
        return;
      }

      // Check for success indicator
      const success = searchParams.get("success");
      if (success !== "true") {
        setError("Invalid callback response");
        return;
      }

      try {
        // Tokens are in HTTP-only cookies, fetch user info to verify auth
        const userResponse = await getCurrentUser();

        if (userResponse.data) {
          // Login successful - cookies are already set by backend
          loginWithCookies(userResponse.data);

          const redirectPath =
            sessionStorage.getItem("auth_redirect") || "/dashboard";
          sessionStorage.removeItem("auth_redirect");

          // Clean URL and navigate
          navigate(redirectPath, { replace: true });
        } else {
          setError(
            userResponse.error?.message || "Failed to verify authentication"
          );
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Failed to complete authentication. Please try again.");
      }
    };

    processCallback();
  }, [searchParams, loginWithCookies, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-red-800">
              Authentication Failed
            </h1>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              onClick={() => navigate("/auth/signin")}
              className="mt-6 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Spinner size="lg" />
      <p className="mt-4 text-text-secondary">Completing sign in...</p>
    </div>
  );
};
