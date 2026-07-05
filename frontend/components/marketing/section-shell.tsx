import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  children: ReactNode;
  id?: string;
  className?: string;
  contentClassName?: string;
}

export function SectionShell({
  children,
  id,
  className,
  contentClassName,
}: SectionShellProps) {
  return (
    <section id={id} className={cn("relative py-20 sm:py-24 lg:py-28", className)}>
      <div className={cn("mx-auto max-w-7xl px-5 sm:px-8 lg:px-10", contentClassName)}>
        <div className="section-lamp-frame relative overflow-hidden rounded-[28px] px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
