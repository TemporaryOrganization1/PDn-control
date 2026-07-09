"use client";

import { useRouter } from "next/navigation";
import { Check, CreditCard, FileText, Infinity, ShieldCheck } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import {
  DashboardCard,
  DashboardHeader,
  DashboardIcon,
  DashboardPage,
  DashboardPanel,
  DashboardSectionTitle,
  DashboardStatusPill,
} from "@/components/profile-dashboard";

const plans = [
  {
    name: "Бесплатный",
    price: "0 ₽",
    period: "/ месяц",
    description: "Для первичной проверки сайта и знакомства с форматом отчета.",
    features: [
      "3 бесплатные проверки",
      "Базовый отчет",
      "Поддержка по почте",
      "Можно начать без регистрации",
    ],
    cta: "Начать бесплатно",
    href: "/",
    variant: "outline" as const,
    highlighted: false,
    icon: FileText,
  },
  {
    name: "Платный",
    price: "990 ₽",
    period: "/ месяц",
    description: "Для регулярного контроля, PDF-отчетов и истории проверок.",
    features: [
      "Неограниченные проверки",
      "Расширенный отчет с PDF",
      "Приоритетная поддержка",
      "Доступ к API",
      "История проверок",
      "Мультипользовательский доступ",
    ],
    cta: "Купить подписку",
    href: "/pricing/checkout",
    variant: "primary" as const,
    highlighted: true,
    icon: CreditCard,
  },
];

const comparisonRows = [
  { feature: "Количество проверок", free: "3 в месяц", paid: "Неограниченно" },
  { feature: "PDF отчет", free: false, paid: true },
  { feature: "Приоритетная поддержка", free: false, paid: true },
  { feature: "Доступ к API", free: false, paid: true },
  { feature: "История проверок", free: "7 дней", paid: "Без ограничений" },
  { feature: "Мультипользовательский доступ", free: false, paid: true },
  { feature: "Кастомные правила", free: false, paid: true },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground">{value}</span>;
  }

  if (value) {
    return (
      <span className="inline-flex items-center justify-center">
        <Check className="h-4 w-4 text-foreground/80" />
      </span>
    );
  }

  return <span className="text-muted-foreground">—</span>;
}

export default function PricingPage() {
  const router = useRouter();

  return (
    <DashboardPage>
      <DashboardHeader
        eyebrow="Тарифы"
        title="Тарифы и цены"
        description="Выберите режим проверки под текущую задачу: первичная оценка рисков или регулярный контроль с расширенными отчетами."
      />

      <div className="space-y-6">
        <DashboardPanel>
          <DashboardSectionTitle
            icon={ShieldCheck}
            title="Планы"
            description="Платный план выделен не цветом, а светлой рамкой, верхней подсветкой и основной кнопкой действия."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => (
              <DashboardCard
                key={plan.name}
                className={plan.highlighted ? "report-glow report-glow-success" : ""}
              >
                <div className="flex items-start justify-between gap-4">
                  <DashboardIcon icon={plan.icon} tone={plan.highlighted ? "success" : "neutral"} />
                  {plan.highlighted ? (
                    <DashboardStatusPill tone="success">Рекомендуемый</DashboardStatusPill>
                  ) : (
                    <DashboardStatusPill>Стартовый</DashboardStatusPill>
                  )}
                </div>

                <div className="mt-7">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">{plan.name}</h2>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{plan.price}</span>
                    <span className="pb-2 text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035]">
                        <Check className="h-3 w-3 text-foreground/80" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <AnimatedButton
                  variant={plan.variant}
                  className="mt-8 w-full"
                  onClick={() => router.push(plan.href)}
                >
                  {plan.cta}
                </AnimatedButton>
              </DashboardCard>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardSectionTitle
            icon={Infinity}
            title="Сравнение тарифов"
            description="Таблица компактная на настольных экранах и остается читаемой на узких экранах через горизонтальную прокрутку."
          />
          <DashboardCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.025]">
                    <th className="px-5 py-4 text-left text-xs font-medium uppercase text-muted-foreground">
                      Возможность
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-medium uppercase text-muted-foreground">
                      Бесплатный
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-medium uppercase text-muted-foreground">
                      Платный
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.feature} className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.025]">
                      <td className="px-5 py-4 text-sm text-foreground">{row.feature}</td>
                      <td className="px-5 py-4 text-center">
                        <FeatureValue value={row.free} />
                      </td>
                      <td className="px-5 py-4 text-center">
                        <FeatureValue value={row.paid} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </DashboardPanel>
      </div>
    </DashboardPage>
  );
}
