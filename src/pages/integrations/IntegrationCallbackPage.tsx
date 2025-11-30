/**
 * Integration OAuth Callback Page
 * Handles the callback from Google Workspace Admin OAuth
 *
 * The backend redirects here with:
 * - Success: ?success=true&connection_id=123
 * - Error: ?error=CODE&error_message=msg
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Spinner } from "@/components/ui";
import { Shield, CheckCircle, XCircle } from "lucide-react";

export const IntegrationCallbackPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const processCallback = async () => {
      // Check for error in query params
      const errorParam = searchParams.get("error");
      const errorMessage = searchParams.get("error_message");

      if (errorParam) {
        setStatus("error");
        setMessage(errorMessage || "Failed to connect workspace");
        return;
      }

      // Check for success indicator
      const success = searchParams.get("success");
      const connectionId = searchParams.get("connection_id");

      if (success === "true" && connectionId) {
        setStatus("success");
        setMessage("Google Workspace connected successfully!");

        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 2000);
      } else {
        setStatus("error");
        setMessage("Invalid callback response");
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary">
            Completing workspace connection...
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-red-800">
              Connection Failed
            </h1>
            <p className="mt-2 text-sm text-red-600">{message}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-semibold text-green-800">
            Workspace Connected!
          </h1>
          <p className="mt-2 text-sm text-green-600">{message}</p>
          <p className="mt-4 text-xs text-green-500">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    </div>
  );
};
