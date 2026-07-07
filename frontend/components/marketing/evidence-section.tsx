import { Code2, ExternalLink, FileWarning } from "lucide-react";
import { SectionShell } from "@/components/marketing/section-shell";

const evidenceRows = [
  { label: "URL", value: "https://example.ru/contact" },
  { label: "Форма", value: "input[name='phone'] + submit" },
  { label: "Политика", value: "link[rel='privacy'] не найден" },
];

export function EvidenceSection() {
  return (
    <SectionShell id="report">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Отчет объясняет, где найден риск и почему он важен
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Вместо одинаковых блоков пользователь видит приоритет,
            техническое доказательства и рекомендацию, которую можно передать команде.
          </p>
        </div>

        <div className="elevated-surface rounded-2xl p-5 sm:p-6">
          <div className="flex items-start gap-3 border-l-2 border-red-400 pl-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08] text-red-300">
              <FileWarning className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-200">
                Критическое замечание
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight">
                Форма собирает телефон без видимого согласия
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                На странице контактов обнаружена форма, но рядом с отправкой нет
                подтверждения согласия на обработку персональных данных.
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-muted-foreground">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              блок доказательств
            </div>
            <div className="space-y-3 p-4">
              {evidenceRows.map((row) => (
                <div key={row.label} className="grid gap-1 sm:grid-cols-[96px_1fr]">
                  <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {row.label}
                  </span>
                  <code className="break-all font-mono text-xs text-foreground/85">
                    {row.value}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-start gap-3">
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              <p className="text-sm leading-6 text-muted-foreground">
                Рекомендация: добавить явный чекбокс согласия, ссылку на политику
                ПДн и зафиксировать текст согласия рядом с формой.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
