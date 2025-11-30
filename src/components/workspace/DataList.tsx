import { AlertCircle, RefreshCw } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import ListItemSkeleton from "./ListItemSkeleton";

interface DataListProps<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  emptyState: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  skeletonCount?: number;
  skeletonVariant: "app" | "user" | "group";
  renderItem: (item: T, index: number) => React.ReactNode;
  onRetry?: () => void;
}

const DataList = <T,>({
  items,
  isLoading,
  error,
  emptyState,
  skeletonCount = 5,
  skeletonVariant,
  renderItem,
  onRetry,
}: DataListProps<T>) => {
  if (isLoading) {
    return (
      <div>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ListItemSkeleton key={i} variant={skeletonVariant} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-red-400" />}
          title="Failed to load data"
          message={error}
          action={
            onRetry && (
              <Button onClick={onRetry} variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )
          }
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8">
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          message={emptyState.description}
        />
      </div>
    );
  }

  return <div>{items.map((item, index) => renderItem(item, index))}</div>;
};

export default DataList;
