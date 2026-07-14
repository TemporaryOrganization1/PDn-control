"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Timer } from "lucide-react";
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

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (!user?.planExpiresAt) {
      const resetTimer = setTimeout(() => setTimeLeft(""), 0);
      return () => clearTimeout(resetTimer);
    }

    const updateTimer = () => {
      const expires = new Date(user.planExpiresAt!).getTime();
      const now = Date.now();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("Истек");
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${days} д ${hours} ч ${minutes} мин`);
    };

    const initialTimer = setTimeout(updateTimer, 0);
    const interval = setInterval(updateTimer, 1000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [user?.planExpiresAt]);

  const switchPlan = async (plan: "free" | "paid") => {
    setError("");
    setSuccess("");
    if (plan === "paid") {
      setIsUpgrading(true);
    } else {
      setIsDowngrading(true);
    }

    try {
      const res = await fetch("/api/subscription/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.msg || "Не удалось изменить тариф");
      } else {
        setSuccess(data.message || "Тариф обновлен");
        await refresh();
      }
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setIsUpgrading(false);
      setIsDowngrading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton />
        </div>
        <DashboardHeader
          eyebrow="План и лимиты"
          title="Управление подпиской"
          description="Тарифы оформлены как рабочие опции кабинета: текущий план подсвечен нейтрально, основные действия остаются рядом с описанием."
          action={
            <AnimatedButton variant="outline" onClick={() => router.push("/pricing")}>
              Смотреть тарифы
            </AnimatedButton>
          }
        />

        <DashboardPanel>
          <DashboardSectionTitle
            icon={CreditCard}
            title="Планы аккаунта"
            description="До подключения платежной системы Paid активируется прямо в личном кабинете и действует 30 дней."
          />

          <div className="grid gap-5 lg:grid-cols-2">
            <DashboardCard className={user?.plan === "free" ? "report-glow report-glow-success" : ""}>
              <div className="flex items-start justify-between gap-4">
                <DashboardIcon icon={CreditCard} tone={user?.plan === "free" ? "success" : "neutral"} />
                {user?.plan === "free" ? (
                  <DashboardStatusPill tone="success">Текущий план</DashboardStatusPill>
                ) : null}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-foreground">Бесплатный</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">0 ₽</span>
                  <span className="pb-1 text-sm text-muted-foreground">/ месяц</span>
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
                  disabled={isDowngrading || user?.plan === "free"}
                  onClick={() => void switchPlan("free")}
                >
                  {user?.plan === "free"
                    ? "Бесплатный активен"
                    : isDowngrading
                      ? "Переключаем..."
                      : "Перейти на бесплатный"}
                </AnimatedButton>
              </div>
            </DashboardCard>

            <DashboardCard className={user?.plan === "paid" ? "report-glow report-glow-success" : ""}>
              <div className="flex items-start justify-between gap-4">
                <DashboardIcon icon={CreditCard} tone={user?.plan === "paid" ? "success" : "neutral"} />
                {user?.plan === "paid" ? (
                  <DashboardStatusPill tone="success">Текущий план</DashboardStatusPill>
                ) : null}
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-foreground">Платный</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold tracking-tight text-foreground">990 ₽</span>
                  <span className="pb-1 text-sm text-muted-foreground">/ месяц</span>
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

              {user?.plan === "paid" && user?.planExpiresAt ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center gap-3">
                    <DashboardIcon icon={Timer} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Платный план активен</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {timeLeft ? `До окончания: ${timeLeft}` : "Загрузка времени..."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-7">
                <AnimatedButton
                  className="w-full"
                  disabled={isUpgrading || user?.plan === "paid"}
                  onClick={() => void switchPlan("paid")}
                >
                  {user?.plan === "paid"
                    ? "План активен"
                    : isUpgrading
                      ? "Активируем..."
                      : "Активировать подписку"}
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
