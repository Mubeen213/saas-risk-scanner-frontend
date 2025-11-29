/**
 * Badge Component
 * Small colored labels for protocols, status, etc.
 */

import React from "react";
import { colors } from "../../theme";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  customColor?: string;
  title?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  customColor,
  title,
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-md whitespace-nowrap";

  const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-gray-100 text-gray-800",
    success: `bg-[${colors.success[100]}] text-[${colors.success[500]}]`,
    warning: `bg-[${colors.warning[100]}] text-[${colors.warning[500]}]`,
    error: `bg-[${colors.error[100]}] text-[${colors.error[500]}]`,
    info: `bg-[${colors.info[100]}] text-[${colors.info[500]}]`,
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const style = customColor
    ? {
        backgroundColor: customColor,
        color: "#fff",
      }
    : undefined;

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={style}
      title={title}
    >
      {children}
    </span>
  );
};

export default Badge;
