import { LockKeyhole, RefreshCw, Shield, Workflow } from "lucide-react";
import { SectionShell } from "@/components/marketing/section-shell";

const points = [
  {
    icon: Shield,
    title: "Публичный анализ",
    text: "Сервис анализирует открытые страницы и не вносит изменения в проверяемый сайт.",
  },
  {
    icon: Workflow,
    title: "Сохраненные этапы",
    text: "Запуск проверки, этапы прогресса и результат остаются в текущем контракте проекта.",
  },
  {
    icon: LockKeyhole,
    title: "История по профилю скана",
    text: "Free-результат хранится 7 дней, а PDF и бессрочная история доступны для сканов, запущенных в Paid.",
  },
  {
    icon: RefreshCw,
    title: "Повторяемый сценарий",
    text: "Один и тот же пользовательский сценарий подходит для первичной проверки, повторного контроля и подготовки к аудиту.",
  },
];

export function SecuritySection() {
  return (
    <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Спокойный контроль без лишней магии
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Интерфейс показывает реальные этапы проверки и не обещает больше,
              чем может подтвердить результат.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {points.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.title} className="base-surface rounded-2xl p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{point.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {point.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
    </SectionShell>
  );
}
