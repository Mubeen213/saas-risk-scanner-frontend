import { Skeleton } from "../ui/Skeleton";
import Card from "../ui/Card";

const DetailPageSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <Skeleton className="h-5 w-24" />

    <div className="flex items-center gap-4">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>

    <Card padding="lg">
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-3 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </Card>

    <Card padding="lg">
      <Skeleton className="h-5 w-32 mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 py-3 border-b last:border-b-0"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      ))}
    </Card>
  </div>
);

export default DetailPageSkeleton;
