import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export const Skeleton = ({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) => {
  const baseClasses = "bg-gray-200";

  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : "100%",
    height: height
      ? typeof height === "number"
        ? `${height}px`
        : height
      : variant === "text"
      ? "1em"
      : "100%",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton = ({ height = 300 }: ChartSkeletonProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height={24} />
        <Skeleton width={80} height={20} />
      </div>
      <Skeleton height={height} />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton height={20} />
        <Skeleton height={20} />
      </div>
    </div>
  );
};

interface StatCardSkeletonProps {
  className?: string;
}

export const StatCardSkeleton = ({ className = "" }: StatCardSkeletonProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={32} />
          <Skeleton width="50%" height={12} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
    </div>
  );
};
