import { Skeleton } from "@/components/ui";

interface ListItemSkeletonProps {
  variant: "app" | "user" | "group";
}

const ListItemSkeleton = ({ variant }: ListItemSkeletonProps) => {
  if (variant === "app") {
    return (
      <div className="flex items-center gap-4 p-4 border-b border-gray-100">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </div>
    );
  }

  if (variant === "user") {
    return (
      <div className="flex items-center gap-4 p-4 border-b border-gray-100">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-40 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-100">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-40 mb-2" />
        <Skeleton className="h-3 w-56" />
      </div>
      <Skeleton className="h-4 w-12" />
      <Skeleton className="h-4 w-4" />
    </div>
  );
};

export default ListItemSkeleton;
