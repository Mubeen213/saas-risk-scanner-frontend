/**
 * Sign In Page
 * Google OAuth sign in/sign up page
 */

import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Card } from "@/components/ui";
import { getGoogleAuthUrl } from "@/api/auth";
import { parseApiError } from "@/api/errors";

export const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const response = await getGoogleAuthUrl(callbackUrl);

      if (response.data?.authorization_url) {
        // Store intended destination for after OAuth
        sessionStorage.setItem("auth_redirect", from);
        window.location.href = response.data.authorization_url;
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch (err) {
      const apiError = parseApiError(err);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-text-primary">
            SaaS Risk Scanner
          </h1>
          <p className="mt-2 text-text-secondary">
            Monitor third-party app risks in your Google Workspace
          </p>
        </div>

        <Card padding="lg">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-medium text-text-primary">
                Sign in to continue
              </h2>
              <p className="mt-1 text-sm text-text-tertiary">
                Use your company Google account
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-xs text-text-tertiary">
              Personal email addresses (Gmail, Outlook, etc.) are not allowed.
              <br />
              Please use your company email.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
