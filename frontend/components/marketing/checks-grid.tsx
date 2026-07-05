import {
  BadgeCheck,
  FileLock2,
  FormInput,
  Lock,
  Network,
  ScrollText,
} from "lucide-react";
import { SectionShell } from "@/components/marketing/section-shell";

const checks = [
  {
    icon: ScrollText,
    title: "Политика ПДн",
    text: "Наличие, доступность и базовая полнота политики конфиденциальности.",
  },
  {
    icon: FormInput,
    title: "Формы сбора данных",
    text: "Поиск форм, где пользователь оставляет контакты или персональные данные.",
  },
  {
    icon: BadgeCheck,
    title: "Согласия",
    text: "Проверка видимых согласий и связки с обработкой персональных данных.",
  },
  {
    icon: Lock,
    title: "SSL",
    text: "Технические признаки HTTPS и данные сертификата, переданные backend.",
  },
  {
    icon: Network,
    title: "IP и домены",
    text: "Фиксация сетевых признаков для технического раздела отчета.",
  },
  {
    icon: FileLock2,
    title: "PDF-артефакты",
    text: "Подготовка отчета для передачи юристу, compliance или владельцу продукта.",
  },
];

export function ChecksGrid() {
  return (
    <SectionShell>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div>
            <p className="text-sm font-medium text-primary">Что проверяет система</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Юридические и технические признаки в одном отчете
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              PDn Control показывает не абстрактную оценку, а конкретные участки,
              где возникают риски: страницы, формы, policy, сертификаты и evidence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {checks.map((check) => {
              const Icon = check.icon;
              return (
                <article key={check.title} className="base-surface rounded-2xl p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-base font-semibold">{check.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {check.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
    </SectionShell>
  );
}
