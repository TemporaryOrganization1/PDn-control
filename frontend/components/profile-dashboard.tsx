import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "danger";

interface DashboardPageProps {
  children: ReactNode;
  className?: string;
}

export function DashboardPage({ children, className }: DashboardPageProps) {
  return (
    <div className={cn("dashboard-page relative min-h-[calc(100vh-4rem)] overflow-hidden", className)}>
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        {children}
      </div>
    </div>
  );
}

interface DashboardHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-col gap-5 sm:mb-10 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 font-mono text-xs uppercase text-muted-foreground/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
    </header>
  );
}

export function DashboardPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("dashboard-panel relative overflow-hidden rounded-[22px] p-4 sm:rounded-[28px] sm:p-7 lg:p-8", className)}
    >
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export function DashboardCard({
  children,
  className,
  asButton = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  asButton?: boolean;
}) {
  return (
    <div
      className={cn(
        "dashboard-card rounded-[18px] p-4 sm:rounded-2xl sm:p-5",
        asButton && "dashboard-action-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DashboardSectionTitle({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-col gap-2 sm:mb-6", className)}>
      <div className="flex items-center gap-3">
        {Icon ? <DashboardIcon icon={Icon} size="sm" /> : null}
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function DashboardIcon({
  icon: Icon,
  tone = "neutral",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "dashboard-action-icon inline-flex shrink-0 items-center justify-center rounded-2xl",
        `dashboard-action-icon-${tone}`,
        size === "sm" && "h-9 w-9 rounded-xl",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-12 w-12",
        className
      )}
    >
      <Icon
        aria-hidden="true"
        focusable="false"
        className={cn(
          "dashboard-action-icon-glyph",
          size === "sm" ? "h-4 w-4" : "h-5 w-5"
        )}
      />
    </span>
  );
}

export function DashboardStatusPill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span className={cn("dashboard-status-pill", `dashboard-status-${tone}`, className)}>
      <span aria-hidden="true" className="dashboard-status-dot" />
      {children}
    </span>
  );
}
