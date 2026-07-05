"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
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

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <DashboardPage>
      <div className="mb-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          onClick={() => router.push("/pricing")}
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к тарифам
        </button>
      </div>

      <DashboardHeader
        eyebrow="Checkout"
        title="Оформление подписки"
        description="Платежный backend пока не подключен, поэтому frontend не имитирует успешную оплату."
      />

      <DashboardPanel>
        <DashboardSectionTitle icon={CreditCard} title="Оплата" />
        <DashboardCard className="report-glow report-glow-warning max-w-2xl">
          <div className="flex items-start gap-4">
            <DashboardIcon icon={CreditCard} tone="warning" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-foreground">Оплата недоступна</p>
                <DashboardStatusPill tone="warning">Backend required</DashboardStatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Для включения подписки нужен backend endpoint оплаты и хранения тарифа.
                Интерфейс оставлен честной заглушкой, без фиктивного успешного платежа.
              </p>
              <AnimatedButton variant="outline" className="mt-6" onClick={() => router.push("/pricing")}>
                Вернуться к тарифам
              </AnimatedButton>
            </div>
          </div>
        </DashboardCard>
      </DashboardPanel>
    </DashboardPage>
  );
}
