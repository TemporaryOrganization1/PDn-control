import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Globe,
  XCircle,
} from "lucide-react";
import type { CheckItem } from "@/lib/data";
import {
  DashboardCard,
  DashboardIcon,
  DashboardStatusPill,
} from "@/components/profile-dashboard";

interface ExpandedCheckCardProps {
  item: CheckItem;
}

const STATUS_META = {
  pass: {
    icon: CheckCircle2,
    tone: "success",
    glow: "report-glow-success",
    label: "Пройдено",
  },
  warning: {
    icon: AlertTriangle,
    tone: "warning",
    glow: "report-glow-warning",
    label: "Предупреждение",
  },
  fail: {
    icon: XCircle,
    tone: "danger",
    glow: "report-glow-danger",
    label: "Нарушение",
  },
} as const;

export function ExpandedCheckCard({ item }: ExpandedCheckCardProps) {
  const meta = STATUS_META[item.status];

  return (
    <DashboardCard className={`report-glow ${meta.glow}`}>
      <div className="flex items-start gap-4">
        <DashboardIcon icon={meta.icon} tone={meta.tone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            <DashboardStatusPill tone={meta.tone}>{meta.label}</DashboardStatusPill>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-muted-foreground">
              {item.title}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
        </div>
      </div>

      {item.lawExcerpts.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-foreground/70">Выдержки из закона</p>
          <div className="space-y-2">
            {item.lawExcerpts.map((excerpt, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-foreground/75"
              >
                {excerpt}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {item.foundUrls.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground/70">
            <ExternalLink className="h-3.5 w-3.5" />
            URLs где найден риск
          </p>
          <div className="space-y-2">
            {item.foundUrls.map((url, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <code className="break-all font-mono text-xs text-foreground/75">{url}</code>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {item.domainsIps.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground/70">
            <Globe className="h-3.5 w-3.5" />
            Домены и IP-адреса
          </p>
          <div className="flex flex-wrap gap-2">
            {item.domainsIps.map((domain, index) => (
              <span
                key={index}
                className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[11px] text-foreground/75"
              >
                {domain}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {item.details.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-foreground/70">Технические детали</p>
          <ul className="space-y-2">
            {item.details.map((detail, index) => (
              <li
                key={index}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-foreground/80"
              >
                {detail}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </DashboardCard>
  );
}
