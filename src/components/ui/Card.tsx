/**
 * Card Component
 * Container for content blocks with consistent styling
 */

import React from "react";

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  padding = "md",
  hoverable = false,
  onClick,
}) => {
  const baseStyles =
    "bg-white rounded-lg border border-[rgb(230,227,223)] shadow-sm";

  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const hoverStyles = hoverable
    ? "cursor-pointer transition-all hover:shadow-md hover:border-[rgb(176,172,167)]"
    : "";

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
