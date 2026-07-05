"use client";

import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth-guard";
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

export default function PurchasesPage() {
  const router = useRouter();

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton />
        </div>
        <DashboardHeader
          eyebrow="Billing evidence"
          title="История покупок"
          description="Здесь будут храниться платежные события, счета и статусы транзакций после подключения платежного backend."
        />

        <DashboardPanel>
          <DashboardSectionTitle
            icon={Receipt}
            title="Транзакции"
            description="Пустое состояние остается компактным и рабочим: без иллюстраций и лишней маркетинговой подачи."
          />
          <DashboardCard className="flex flex-col items-center py-12 text-center">
            <DashboardIcon icon={Receipt} size="lg" />
            <DashboardStatusPill className="mt-5">Платежный backend не подключен</DashboardStatusPill>
            <p className="mt-5 text-sm font-semibold text-foreground">Покупок пока нет</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              После подключения платежей здесь появятся реальные транзакции, счета и история изменений тарифа.
            </p>
            <AnimatedButton className="mt-6" onClick={() => router.push("/pricing")}>
              Посмотреть тарифы
            </AnimatedButton>
          </DashboardCard>
        </DashboardPanel>
      </DashboardPage>
    </AuthGuard>
  );
}

