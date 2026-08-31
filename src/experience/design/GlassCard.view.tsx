import React from "react";
import { GLASS_LEVELS } from "./designTokens";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  specular?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({
  level = 2,
  specular = true,
  children,
  className = "",
  ...props
}: GlassCardProps) {
  const levelClass =
    level === 1
      ? GLASS_LEVELS.L1_BACKGROUND.className
      : level === 3
      ? GLASS_LEVELS.L3_SHEET.className
      : GLASS_LEVELS.L2_CARD.className;

  const specularClass = specular ? "specular-border" : "";

  return (
    <div
      className={`rounded-xl transition-all duration-200 ${levelClass} ${specularClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
