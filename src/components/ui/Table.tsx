/**
 * Table Component
 * Reusable table wrapper with consistent styling
 */

import React from "react";
import { cn } from "@/utils/cn";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
}

function Table<T>({
  columns,
  data,
  onRowClick,
  className = "",
  emptyMessage = "No data available",
  isLoading = false,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-background-primary rounded-xl border border-border-light overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-background-secondary border-b border-border-light" />
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 border-b border-border-light last:border-0"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-background-primary rounded-xl border border-border-light overflow-hidden shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light">
          <thead className="bg-background-secondary">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-4 text-xs font-semibold text-text-tertiary uppercase tracking-wider",
                    column.align === "center"
                      ? "text-center"
                      : column.align === "right"
                      ? "text-right"
                      : "text-left"
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background-primary divide-y divide-border-light">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-text-tertiary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={index}
                  className={cn(
                    "transition-colors duration-150",
                    onRowClick
                      ? "cursor-pointer hover:bg-interactive-hover"
                      : "hover:bg-background-secondary/50"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm text-text-primary",
                        column.align === "center"
                          ? "text-center"
                          : column.align === "right"
                          ? "text-right"
                          : "text-left"
                      )}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as any)[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
