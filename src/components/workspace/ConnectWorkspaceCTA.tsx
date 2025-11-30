import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

interface ConnectWorkspaceCTAProps {
  onConnect: () => void;
  isConnecting: boolean;
  error?: string | null;
}

const ConnectWorkspaceCTA = ({
  onConnect,
  isConnecting,
  error,
}: ConnectWorkspaceCTAProps) => {
  return (
    <div className="bg-background-primary rounded-xl p-8">
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-info-50">
          <Shield className="h-8 w-8 text-info-500" />
        </div>

        <h2 className="text-xl font-semibold text-text-primary">
          Connect Your Google Workspace
        </h2>

        <p className="mt-2 max-w-md text-text-secondary">
          Connect your organization's Google Workspace to discover risky
          third-party app authorizations across all users.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-500">
            {error}
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="mt-6"
          onClick={onConnect}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              Connect Google Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <p className="mt-4 text-xs text-text-tertiary">
          Requires Google Workspace Admin access
        </p>
      </div>
    </div>
  );
};

export default ConnectWorkspaceCTA;
