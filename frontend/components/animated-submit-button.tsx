"use client";

import { Loader2 } from "lucide-react";

interface AnimatedSubmitButtonProps {
  isChecking: boolean;
  onClick: () => void;
  text?: string;
  loadingText?: string;
  className?: string;
}

export function AnimatedSubmitButton({
  isChecking,
  onClick,
  text = "Проверить",
  loadingText = "Проверка...",
  className,
}: AnimatedSubmitButtonProps) {
  const letters = text.split("");

  return (
    <button
      onClick={onClick}
      disabled={isChecking}
      className={
        "premium-cta group relative inline-flex h-10 shrink-0 items-center justify-center overflow-hidden px-5 text-sm font-semibold whitespace-nowrap outline-none select-none disabled:pointer-events-none disabled:opacity-55" +
        (className ? ` ${className}` : "")
      }
    >
      {isChecking ? (
        <span className="flex items-center gap-1.5">
          <Loader2 className="size-4 animate-spin" />
          {loadingText}
        </span>
      ) : (
        <>
          <span className="flex items-center justify-center">
            {letters.map((letter, i) => (
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
            {letters.map((letter, i) => (
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
      )}
    </button>
  );
}
