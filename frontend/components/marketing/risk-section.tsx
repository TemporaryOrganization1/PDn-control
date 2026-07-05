import { Banknote, Gauge, Scale, TriangleAlert } from "lucide-react";
import { SectionShell } from "@/components/marketing/section-shell";

const metrics = [
  { label: "Risk score", value: "74%", icon: Gauge, tone: "text-red-300" },
  { label: "Возможный штраф", value: "до 300 000 ₽", icon: Banknote, tone: "text-amber-300" },
  { label: "Приоритет", value: "исправить формы", icon: TriangleAlert, tone: "text-red-300" },
];

export function RiskSection() {
  return (
    <SectionShell>
        <div className="elevated-surface overflow-hidden rounded-2xl">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:p-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/[0.07] px-3 py-1 text-xs font-medium text-amber-200">
                <Scale className="h-3.5 w-3.5" />
                Risk and fine calculation
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Риски переводятся в понятный финансовый приоритет
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Отчет помогает понять, что исправлять сначала: критические нарушения,
                предупреждения или технические детали, которые влияют на доверие.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {metric.label}
                      </p>
                      <Icon className={`h-4 w-4 ${metric.tone}`} />
                    </div>
                    <p className="mt-3 text-2xl font-semibold tracking-tight">
                      {metric.value}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/20 px-6 py-5 sm:px-8 lg:px-10">
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-amber-300 to-red-400" />
            </div>
            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
              <span>низкий риск</span>
              <span>требуется внимание</span>
              <span>критический риск</span>
            </div>
          </div>
        </div>
    </SectionShell>
  );
}
