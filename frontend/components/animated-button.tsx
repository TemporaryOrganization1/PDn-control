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
  const baseClasses = "group shrink-0 text-sm font-bold whitespace-nowrap outline-none select-none disabled:pointer-events-none disabled:opacity-50";

  const sizeClasses = {
    sm: "h-9 px-4 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-11 px-6 text-base",
  };

  const variantClasses = {
    primary: "bg-primary text-primary-foreground",
    outline: "border-border bg-transparent text-foreground hover:bg-accent",
    ghost: "bg-transparent text-foreground hover:bg-accent",
  };

  const buttonText = typeof children === "string" ? children : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${className}`}
    >
      <div className={`group-hover:scale-95 overflow-hidden flex items-center justify-center duration-300 ease-out rounded-sm transition-all relative border border-transparent ${variantClasses[variant]} ${sizeClasses[size]}`}>
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingText}
          </span>
        ) : (
          <>
            {typeof children === "string" ? (
              <>
                <span className="flex items-center justify-center">
                  {buttonText.split("").map((letter, i) => (
                    <span
                      key={`top-${i}`}
                      className="inline-block transition-all duration-150 ease-out group-hover:-translate-y-8 group-hover:opacity-0"
                      style={{ transitionDelay: `${i * 10}ms` }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  {buttonText.split("").map((letter, i) => (
                    <span
                      key={`bottom-${i}`}
                      className="inline-block translate-y-8 opacity-0 transition-all duration-150 ease-out group-hover:translate-y-0 group-hover:opacity-100"
                      style={{ transitionDelay: `${i * 10}ms` }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </span>
              </>
            ) : (
              children
            )}
          </>
        )}
      </div>
    </button>
  );
}