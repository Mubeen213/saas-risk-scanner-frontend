import { Skeleton } from "@/components/ui";
import { cn } from "@/utils/cn";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

const StatsCard = ({
  label,
  value,
  icon,
  isLoading = false,
  disabled = false,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "flex items-center gap-4 bg-background-primary rounded-xl p-5",
        disabled && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg",
          disabled
            ? "bg-background-tertiary text-text-tertiary"
            : "bg-info-50 text-info-500"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-4 w-12" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-semibold text-text-primary">
              {disabled ? "--" : value}
            </div>
            <div className="text-sm text-text-secondary">{label}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
