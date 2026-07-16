"use client";

import { useRouter } from "next/navigation";
import { Check, Clock3, FileText, Infinity, ShieldCheck } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { useAuth } from "@/components/auth-provider";
import {
  DashboardCard,
  DashboardHeader,
  DashboardIcon,
  DashboardPage,
  DashboardPanel,
  DashboardSectionTitle,
  DashboardStatusPill,
} from "@/components/profile-dashboard";
import { hasActivePaidPlan } from "@/lib/plan";

const plans = [
  {
    id: "free",
    name: "Free",
    access: "Бесплатно",
    period: "без срока",
    description: "Для первичной проверки сайта и знакомства с форматом отчета.",
    features: [
      "3 проверки за 30 дней",
      "3 AI-перехода по сайту",
      "Краткие статусы и выводы",
      "Можно начать без регистрации",
    ],
    variant: "outline" as const,
    highlighted: false,
    icon: FileText,
  },
  {
    id: "paid",
    name: "Paid",
    access: "30 дней",
    period: "временный доступ",
    description:
      "Для расширенной проверки с полными доказательствами, PDF и скриншотами.",
    features: [
      "Неограниченные проверки",
      "10 AI-переходов по сайту",
      "Полный отчет с PDF и скриншотами",
      "URLs, домены/IP и правовые пояснения",
      "История paid-проверок без срока",
    ],
    variant: "primary" as const,
    highlighted: true,
    icon: ShieldCheck,
  },
];

const comparisonRows = [
  {
    feature: "Количество проверок",
    free: "3 за 30 дней",
    paid: "Неограниченно",
  },
  { feature: "AI-переходы по сайту", free: "3", paid: "10" },
  { feature: "Детальность", free: "Краткая сводка", paid: "Полные evidence" },
  { feature: "PDF отчет", free: false, paid: true },
  { feature: "Скриншоты", free: false, paid: true },
  {
    feature: "История проверок",
    free: "7 дней в аккаунте",
    paid: "Без срока для Paid-сканов",
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (typeof value === "string") {
    return <span className="text-sm text-foreground">{value}</span>;
  }

  if (value) {
    return (
      <span className="inline-flex items-center justify-center">
        <Check aria-hidden="true" className="h-4 w-4 text-foreground/80" />
        <span className="sr-only">Да</span>
      </span>
    );
  }

  return (
    <span className="text-muted-foreground">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Нет</span>
    </span>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const hasPaidAccess = hasActivePaidPlan(user?.plan, user?.planExpiresAt);

  const paidHref = user
    ? "/profile/subscription"
    : "/login?redirectTo=%2Fprofile%2Fsubscription";

  const paidCta = hasPaidAccess
    ? "Управлять Paid-доступом"
    : user
      ? "Активировать Paid на 30 дней"
      : "Войти и активировать Paid";

  return (
    <DashboardPage>
      <DashboardHeader
        eyebrow="Тарифы"
        title="Тарифные планы"
        description="Сравните бесплатную первичную проверку и временный расширенный доступ с полными доказательствами."
      />

      <div className="space-y-6">
        <DashboardPanel>
          <DashboardSectionTitle
            icon={ShieldCheck}
            title="Два режима проверки"
            description="Free доступен сразу, а Paid включается на 30 дней в личном кабинете."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            {plans.map((plan) => (
              <DashboardCard
                key={plan.name}
                className={plan.highlighted ? "report-glow" : ""}
              >
                <div className="flex items-start justify-between gap-4">
                  <DashboardIcon icon={plan.icon} />
                  {plan.highlighted ? (
                    <DashboardStatusPill>Расширенный</DashboardStatusPill>
                  ) : (
                    <DashboardStatusPill>Стартовый</DashboardStatusPill>
                  )}
                </div>

                <div className="mt-7">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {plan.name}
                  </h2>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                      {plan.access}
                    </span>
                    <span className="pb-2 text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                    >
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
                  disabled={plan.id === "paid" && isLoading}
                  onClick={() =>
                    router.push(plan.id === "paid" ? paidHref : "/#product")
                  }
                >
                  {plan.id === "paid" ? paidCta : "Начать бесплатно"}
                </AnimatedButton>
              </DashboardCard>
            ))}
          </div>

          <DashboardCard className="mt-5">
            <div className="flex items-start gap-4">
              <DashboardIcon icon={Clock3} />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Paid активируется без оплаты
                </p>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                  В текущей версии нет платежей и автоматического продления.
                  Авторизованный пользователь может включить Paid на 30 дней,
                  после чего аккаунт вернется на Free. Ранее созданные
                  Paid-отчеты останутся доступны в истории.
                </p>
              </div>
            </div>
          </DashboardCard>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardSectionTitle
            icon={Infinity}
            title="Сравнение тарифов"
            description="Возможности соответствуют текущим серверным лимитам и профилям проверки."
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
                      Free
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-medium uppercase text-muted-foreground">
                      Paid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-white/10 last:border-b-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4 text-sm text-foreground">
                        {row.feature}
                      </td>
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
