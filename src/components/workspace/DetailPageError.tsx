import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";

interface DetailPageErrorProps {
  message: string;
  onRetry: () => void;
  backPath: string;
  backLabel: string;
}

const DetailPageError = ({
  message,
  onRetry,
  backPath,
  backLabel,
}: DetailPageErrorProps) => (
  <div className="space-y-6">
    <Link
      to={backPath}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {backLabel}
    </Link>

    <Card padding="lg">
      <div className="flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load details
        </h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <Button onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </Card>
  </div>
);

export default DetailPageError;
