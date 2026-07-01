"use client";

import { useRouter } from "next/navigation";
import { AnimatedButton } from "@/components/animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      name: "Бесплатный",
      price: "0 ₽",
      period: "/месяц",
      description: "Для небольших проектов",
      features: [
        "3 бесплатные проверки",
        "Базовый отчёт",
        "Поддержка по email",
        "Без регистрации",
      ],
      cta: "Начать бесплатно",
      href: "/",
      variant: "outline" as const,
      highlighted: false,
    },
    {
      name: "Платный",
      price: "990 ₽",
      period: "/месяц",
      description: "Для бизнеса и агентств",
      features: [
        "Неограниченные проверки",
        "Расширенный отчёт с PDF",
        "Приоритетная поддержка",
        "API доступ",
        "История проверок",
        "Мультипользовательский доступ",
      ],
      cta: "Купить подписку",
      href: "/pricing/checkout",
      variant: "primary" as const,
      highlighted: true,
    },
  ];

  const comparisonRows = [
    { feature: "Количество проверок", free: "3 в месяц", paid: "Неограниченно" },
    { feature: "PDF отчёт", free: false, paid: true },
    { feature: "Приоритетная поддержка", free: false, paid: true },
    { feature: "API доступ", free: false, paid: true },
    { feature: "История проверок", free: "7 дней", paid: "Без ограничений" },
    { feature: "Мультипользовательский доступ", free: false, paid: true },
    { feature: "Кастомные правила", free: false, paid: true },
  ];

  return (
    <div className="flex flex-col">
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-10 sm:px-10 sm:py-14">
          <div className="lg:col-span-10 lg:col-start-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Тарифы и цены
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Выберите подходящий план для ваших задач
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-10 sm:px-10 sm:py-14">
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`flex flex-col ${plan.highlighted ? "border-primary/50 shadow-lg" : ""} rounded-none`}
                >
                  <CardHeader>
                    {plan.highlighted && (
                      <Badge className="w-fit mb-2 bg-primary/10 text-primary border-primary/20">
                        Рекомендуемый
                      </Badge>
                    )}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 space-y-4">
                    <ul className="space-y-3 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <AnimatedButton
                      variant={plan.variant}
                      className="w-full mt-auto"
                      onClick={() => router.push(plan.href)}
                    >
                      {plan.cta}
                    </AnimatedButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-10 sm:px-10 sm:py-14">
          <div className="lg:col-span-10 lg:col-start-2">
            <h2 className="text-2xl font-bold mb-6 text-center">
              Сравнение тарифов
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Возможность
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium">
                      Бесплатный
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium">
                      Платный
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 px-4 text-sm">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        {typeof row.free === "boolean" ? (
                          row.free ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm">{row.free}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {typeof row.paid === "boolean" ? (
                          row.paid ? (
                            <Check className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        ) : (
                          <span className="text-sm">{row.paid}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}