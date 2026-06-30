import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Globe,
} from "lucide-react";
import type { CheckItem } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

interface ExpandedCheckCardProps {
  item: CheckItem;
}

const STATUS_ICONS = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
} as const;

const STATUS_COLORS = {
  pass: "text-emerald-500",
  warning: "text-amber-500",
  fail: "text-red-500",
} as const;

const STATUS_BG = {
  pass: "bg-emerald-500/5 border-emerald-500/10",
  warning: "bg-amber-500/5 border-amber-500/10",
  fail: "bg-red-500/5 border-red-500/10",
} as const;

export function ExpandedCheckCard({ item }: ExpandedCheckCardProps) {
  const StatusIcon = STATUS_ICONS[item.status];
  const statusColor = STATUS_COLORS[item.status];
  const statusBg = STATUS_BG[item.status];

  return (
    <div className={`border ${statusBg}`}>
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center ${statusColor} bg-current/5`}
            >
              <StatusIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{item.label}</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] uppercase tracking-wider ${statusColor} border-current/20`}
                >
                  {item.title}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm text-foreground/80">{item.description}</p>

          {/* Law excerpts */}
          {item.lawExcerpts.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-xs font-medium text-foreground/70">
                Выдержки из закона:
              </p>
              <div className="space-y-1">
                {item.lawExcerpts.map((excerpt, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 rounded-sm border border-border/50 bg-background/50 px-3 py-1.5"
                  >
                    <span className="mt-0.5 h-1 w-1 shrink-0 bg-primary/60" />
                    <span className="text-xs text-foreground/70">
                      {excerpt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Found URLs */}
          {item.foundUrls.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/70">
                <ExternalLink className="h-3 w-3" />
                URLs где найдена ошибка:
              </p>
              <div className="space-y-1">
                {item.foundUrls.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-sm border border-border/50 bg-background/50 px-3 py-1.5"
                  >
                    <span className="h-1 w-1 shrink-0 bg-red-500/60" />
                    <code className="text-xs text-foreground/70">{url}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Response */}
          <div className="mt-4">
            <p className="mb-1.5 text-xs font-medium text-foreground/70">
              Ответ ИИ:
            </p>
            <div className="rounded-sm border border-border/50 bg-background/50 px-3 py-2">
              <p className="text-xs leading-relaxed text-foreground/70">
                {item.aiResponse}
              </p>
            </div>
          </div>

          {/* Domains / IPs */}
          {item.domainsIps.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/70">
                <Globe className="h-3 w-3" />
                Домены и IP-адреса:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.domainsIps.map((d, i) => (
                  <span
                    key={i}
                    className="border border-border/50 bg-background/50 px-2 py-0.5 font-mono text-[11px] text-foreground/70"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          {item.details.length > 0 && (
            <ul className="mt-4 space-y-1">
              {item.details.map((detail, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-foreground/80"
                >
                  <span
                    className={`mt-1.5 h-1 w-1 shrink-0 ${statusColor} bg-current`}
                  />
                  {detail}
                </li>
              ))}
            </ul>
          )}

        </div>
      </div>
  );
}
