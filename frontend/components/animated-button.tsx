"use client";

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function AnimatedButton({
  children,
  onClick,
  type = "button",
  disabled = false,
  isLoading = false,
  loadingText = "Загрузка...",
  className = "",
  variant = "primary",
  size = "md",
}: AnimatedButtonProps) {
  const baseClasses =
    "group inline-flex shrink-0 items-center justify-center rounded-2xl text-sm font-semibold whitespace-nowrap outline-none select-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-55";

  const sizeClasses = {
    sm: "h-9 px-4 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-11 px-6 text-base",
  };

  const variantClasses = {
    primary: "premium-cta",
    outline:
      "border border-white/10 bg-white/[0.035] text-foreground hover:bg-white/[0.07]",
    ghost: "bg-transparent text-foreground hover:bg-accent",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <div className="flex w-full items-center justify-center overflow-hidden">
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </span>
        ) : (
          <span className="flex items-center justify-center">{children}</span>
        )}
      </div>
    </button>
  );
}
