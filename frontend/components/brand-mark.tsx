import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  markClassName?: string;
}

export function BrandMark({ className, markClassName }: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className={cn("h-5 w-5", markClassName)}
        role="img"
      >
        <path
          d="M8.5 8.5h8.2c4.1 0 6.8 2.4 6.8 6s-2.7 6-6.8 6h-3.2v3"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.5 23.5V8.5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d="M13.5 13.1h3.1c1.3 0 2.2.7 2.2 1.9s-.9 1.9-2.2 1.9h-3.1"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M23.5 8.5v15h-6.1"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.72"
        />
        <path
          d="M6 16H3.8M28.2 16H26M16 6V3.8M16 28.2V26"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}
