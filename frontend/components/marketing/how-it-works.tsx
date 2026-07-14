import { ClipboardCheck, FileSearch, Globe2, ListChecks } from "lucide-react";
import { SectionShell } from "@/components/marketing/section-shell";

const steps = [
  {
    icon: Globe2,
    title: "Введите адрес сайта",
    text: "Сервис принимает домен или полный адрес и запускает проверку через существующий бэкенд.",
  },
  {
    icon: FileSearch,
    title: "Собираем информацию",
    text: "Сборщик проходит публичные страницы, фиксирует формы, политику конфиденциальности, SSL и технические признаки сайта.",
  },
  {
    icon: ListChecks,
    title: "Классифицируем риски",
    text: "Проверки группируются по нарушениям, предупреждениям и пройденным контролям.",
  },
  {
    icon: ClipboardCheck,
    title: "Формируем отчет",
    text: "На выходе — сводка рисков; Paid дополнительно создаёт полный evidence и PDF.",
  },
];

export function HowItWorks() {
  return (
    <SectionShell id="how">
        <div className="max-w-2xl">
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            От адреса сайта до финального отчета за один сценарий
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Пользовательский путь остается простым: пользователь запускает проверку, а система показывает
            понятный путь от сборщика до финального отчета.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="base-surface rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {step.text}
                </p>
              </article>
            );
          })}
        </div>
    </SectionShell>
  );
}
