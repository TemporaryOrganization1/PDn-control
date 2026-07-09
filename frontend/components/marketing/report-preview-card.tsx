import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportPreviewCardProps {
  className?: string;
}

const findings = [
  {
    label: "Политика ПДн",
    detail: "Не найдена ссылка в футере",
    status: "Нарушение",
    glowClassName: "report-glow-danger",
    icon: ShieldAlert,
  },
  {
    label: "Формы сбора данных",
    detail: "Нет явного согласия перед отправкой",
    status: "Риск",
    glowClassName: "report-glow-warning",
    icon: AlertTriangle,
  },
  {
    label: "SSL-сертификат",
    detail: "HTTPS доступен, срок действия проверен",
    status: "Пройдено",
    glowClassName: "report-glow-success",
    icon: CheckCircle2,
  },
];

export function ReportPreviewCard({ className }: ReportPreviewCardProps) {
  return (
    <div
      className={cn(
        "elevated-surface relative overflow-hidden rounded-2xl p-5 sm:p-6",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-foreground/65" />
            Предпросмотр отчета
          </div>
          <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
            Проверка сайта
          </h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            идентификатор отчета: PDN-2026-07-04
          </p>
        </div>

        <div className="report-glow report-glow-danger rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Риск
          </p>
          <p className="text-2xl font-semibold text-foreground/88">74%</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="report-glow report-glow-danger rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Нарушений
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground/88">2</p>
        </div>
        <div className="report-glow report-glow-warning rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Рисков
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground/88">3</p>
        </div>
        <div className="report-glow report-glow-success rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Пройдено
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground/88">8</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {findings.map((finding) => {
          const Icon = finding.icon;
          return (
            <div
              key={finding.label}
              className={cn(
                "report-glow rounded-xl border border-white/10 bg-white/[0.032] p-3 text-foreground/76",
                finding.glowClassName
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {finding.label}
                    </p>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {finding.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {finding.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="report-glow report-glow-warning mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <Scale className="h-3.5 w-3.5 text-foreground/65" />
          Возможный штраф
        </div>
        <p className="mt-2 text-2xl font-semibold tracking-tight">
          до 300 000 ₽
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Расчет зависит от состава нарушений и статуса оператора.
        </p>
      </div>
    </div>
  );
}
