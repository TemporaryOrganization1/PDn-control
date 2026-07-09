import { Building2, Landmark, Radar, UsersRound } from "lucide-react";
import { SectionShell } from "@/components/marketing/section-shell";

const cases = [
  {
    icon: Building2,
    title: "Владельцам сайтов",
    text: "Быстро понять, какие риски видит внешний аудит и что исправить до претензий.",
  },
  {
    icon: Landmark,
    title: "Юристам",
    text: "Получить доказательства, адреса страниц и первичный список действий для проверки по 152-ФЗ.",
  },
  {
    icon: UsersRound,
    title: "Маркетингу и продукту",
    text: "Проверить формы, лендинги и новые страницы до запуска рекламного трафика.",
  },
  {
    icon: Radar,
    title: "Командам безопасности",
    text: "Свести юридические риски и технические признаки сайта в одном отчете.",
  },
];

export function UseCases() {
  return (
    <SectionShell>
        <div className="max-w-2xl">
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Для команд, которым нужен не чек-лист, а управляемый риск
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cases.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="base-surface rounded-2xl p-5">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-5 text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
    </SectionShell>
  );
}
