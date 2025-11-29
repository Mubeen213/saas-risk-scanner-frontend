/**
 * EmptyState Component
 * Display when no data is available
 */

import React from "react";

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  message,
  icon,
  action,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      {icon && <div className="mb-4 text-[rgb(160,160,160)]">{icon}</div>}
      <h3 className="text-lg font-medium text-[rgb(47,47,47)] mb-2">{title}</h3>
      {message && (
        <p className="text-sm text-[rgb(92,92,92)] text-center max-w-md mb-4">
          {message}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
