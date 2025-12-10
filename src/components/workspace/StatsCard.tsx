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
        "flex items-center gap-4 bg-background-primary rounded-xl p-5 border border-border-light shadow-sm transition-all duration-200 hover:shadow-md",
        disabled && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          disabled
            ? "bg-background-tertiary text-text-tertiary"
            : "bg-brand-secondary/10 text-brand-secondary"
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
            <div className="text-2xl font-bold text-text-primary tracking-tight">
              {disabled ? "--" : value}
            </div>
            <div className="text-sm font-medium text-text-secondary">{label}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
