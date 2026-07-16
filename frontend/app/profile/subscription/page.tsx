"use client";

import { useEffect, useState } from "react";
import { Check, ShieldCheck, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { AnimatedButton } from "@/components/animated-button";
import { BackButton } from "@/components/back-button";
import {
  DashboardCard,
  DashboardHeader,
  DashboardIcon,
  DashboardPage,
  DashboardPanel,
  DashboardSectionTitle,
  DashboardStatusPill,
} from "@/components/profile-dashboard";
import { changePlan } from "@/lib/api";
import { formatPlanTimeLeft, hasActivePaidPlan } from "@/lib/plan";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (!user?.planExpiresAt) return;

    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [user?.planExpiresAt]);

  const isPaid = hasActivePaidPlan(user?.plan, user?.planExpiresAt, now);
  const timeLeft = user?.planExpiresAt
    ? formatPlanTimeLeft(user.planExpiresAt, now)
    : "";

  const switchPlan = async (plan: "free" | "paid") => {
    setError("");
    setSuccess("");
    if (plan === "paid") {
      setIsUpgrading(true);
    } else {
      setIsDowngrading(true);
    }

    try {
      const data = await changePlan(plan);
      setSuccess(data.message || "Тариф обновлен");
      await refresh();
      setNow(Date.now());
    } catch (planError) {
      setError(
        planError instanceof Error
          ? planError.message
          : "Не удалось изменить тариф",
      );
    } finally {
      setIsUpgrading(false);
      setIsDowngrading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton href="/profile" />
        </div>
        <DashboardHeader
          eyebrow="Тариф и лимиты"
          title="Управление тарифом"
          description="Включите временный Paid-доступ или вернитесь на Free. Оплата и автоматическое продление в текущей версии не используются."
          action={
            <AnimatedButton
              variant="outline"
              onClick={() => router.push("/pricing")}
            >
              Смотреть тарифы
            </AnimatedButton>
          }
        />

        <DashboardPanel>
          <DashboardSectionTitle
            icon={ShieldCheck}
            title="Планы аккаунта"
            description="Paid активируется прямо в личном кабинете на 30 дней без платежной формы."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <DashboardCard className={!isPaid ? "report-glow" : ""}>
              <div className="flex items-start justify-between gap-4">
                <DashboardIcon icon={ShieldCheck} />
                {!isPaid ? (
                  <DashboardStatusPill>Текущий план</DashboardStatusPill>
                ) : null}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-foreground">Free</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    Бесплатно
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    без срока
                  </span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-foreground/80" />
                  3 проверки за скользящие 30 дней.
                </li>
                <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-foreground/80" />
                  Краткий результат без PDF и скриншотов, 3 AI-перехода.
                </li>
              </ul>
              <div className="mt-7">
                <AnimatedButton
                  variant="outline"
                  className="w-full"
                  disabled={isDowngrading || !isPaid}
                  onClick={() => void switchPlan("free")}
                >
                  {!isPaid
                    ? "Free активен"
                    : isDowngrading
                      ? "Переключаем..."
                      : "Перейти на Free"}
                </AnimatedButton>
              </div>
            </DashboardCard>

            <DashboardCard className={isPaid ? "report-glow" : ""}>
              <div className="flex items-start justify-between gap-4">
                <DashboardIcon icon={ShieldCheck} />
                {isPaid ? (
                  <DashboardStatusPill>Текущий план</DashboardStatusPill>
                ) : null}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-foreground">Paid</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">
                    30 дней
                  </span>
                  <span className="pb-1 text-sm text-muted-foreground">
                    временный доступ
                  </span>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-foreground/80" />
                  Проверки без лимита и 10 AI-переходов.
                </li>
                <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-foreground/80" />
                  Полные evidence и история paid-сканов без срока.
                </li>
                <li className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-foreground/80" />
                  PDF и скриншоты для каждого нового paid-скана.
                </li>
              </ul>

              {isPaid && user?.planExpiresAt ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center gap-3">
                    <DashboardIcon icon={Timer} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Платный план активен
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {timeLeft
                          ? `До окончания: ${timeLeft}`
                          : "Загрузка времени..."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-7">
                <AnimatedButton
                  className="w-full"
                  disabled={isUpgrading || isPaid}
                  onClick={() => void switchPlan("paid")}
                >
                  {isPaid
                    ? "План активен"
                    : isUpgrading
                      ? "Активируем..."
                      : "Активировать Paid на 30 дней"}
                </AnimatedButton>
              </div>
            </DashboardCard>
          </div>

          {error ? (
            <DashboardCard className="mt-5 report-glow report-glow-danger">
              <DashboardStatusPill tone="danger">Ошибка</DashboardStatusPill>
              <p className="mt-3 text-sm text-muted-foreground">{error}</p>
            </DashboardCard>
          ) : null}
          {success ? (
            <DashboardCard className="mt-5 report-glow report-glow-success">
              <DashboardStatusPill tone="success">Готово</DashboardStatusPill>
              <p className="mt-3 text-sm text-muted-foreground">{success}</p>
            </DashboardCard>
          ) : null}
        </DashboardPanel>
      </DashboardPage>
    </AuthGuard>
  );
}
