"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  Download,
  FileText,
  Lock,
  Mail,
  Receipt,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getReports } from "@/lib/api";

function formatRegistrationDate(value?: string) {
  if (!value) return "Нет данных";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Нет данных";
  return date.toLocaleDateString("ru-RU");
}

function ProfileActionCard({
  icon: Icon,
  title,
  description,
  onClick,
  tone = "neutral",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="dashboard-card dashboard-action-card flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-white/30"
    >
      <span className="flex min-w-0 items-center gap-4">
        <DashboardIcon icon={Icon} tone={tone} />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
        </span>
      </span>
      <ArrowRight className="dashboard-action-arrow h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn, deleteAccount, logout } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [checksCount, setChecksCount] = useState<number | null>(null);
  const registrationDate = useMemo(
    () => formatRegistrationDate(user?.createdAt),
    [user?.createdAt]
  );

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let cancelled = false;
    getReports()
      .then((items) => {
        if (cancelled) return;
        const uniqueChecks = new Set(items.map((item) => item.req_id || item.report_id || item.id));
        setChecksCount(uniqueChecks.size);
      })
      .catch(() => {
        if (!cancelled) setChecksCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  if (!user) {
    return (
      <AuthGuard>
        <DashboardPage>
          <div className="flex min-h-[48vh] items-center justify-center text-sm text-muted-foreground">
            Загрузка кабинета...
          </div>
        </DashboardPage>
      </AuthGuard>
    );
  }

  const isPaid = user.plan === "paid";
  const checksLabel = checksCount === null ? "Загрузка..." : checksCount.toString();

  return (
    <AuthGuard>
      <DashboardPage>
        <DashboardHeader
          eyebrow="Управление аккаунтом"
          title="Личный кабинет"
          description=""
          action={
            <AnimatedButton onClick={() => router.push("/#product")}>
              Новая проверка
            </AnimatedButton>
          }
        />

        <div className="space-y-6">
          <DashboardPanel>
            <DashboardSectionTitle
              icon={User}
              title="Сводка аккаунта"
              description=""
            />

            <div className="grid gap-4 lg:grid-cols-4">
              <DashboardCard className="lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <DashboardIcon icon={Mail} tone={user.isVerified ? "success" : "warning"} />
                  <DashboardStatusPill tone={user.isVerified ? "success" : "warning"}>
                    {user.isVerified ? "Почта подтверждена" : "Почта не подтверждена"}
                  </DashboardStatusPill>
                </div>
                <div className="mt-5">
                  <p className="text-xs uppercase text-muted-foreground">Электронная почта</p>
                  <p className="mt-2 truncate font-mono text-sm text-foreground">{user.email}</p>
                </div>
                <div className="mt-5 flex justify-end">
                  <AnimatedButton
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/profile/settings/email")}
                  >
                    Изменить
                  </AnimatedButton>
                </div>
              </DashboardCard>

              <DashboardCard>
                <DashboardIcon icon={Calendar} />
                <p className="mt-5 text-xs uppercase text-muted-foreground">Регистрация</p>
                <p className="mt-2 text-sm font-medium text-foreground">{registrationDate}</p>
              </DashboardCard>

              <DashboardCard>
                <DashboardIcon icon={FileText} />
                <p className="mt-5 text-xs uppercase text-muted-foreground">Проверок с отчетом</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">{checksLabel}</p>
              </DashboardCard>

              <DashboardCard className="lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <DashboardIcon icon={CreditCard} tone={isPaid ? "success" : "neutral"} />
                  <DashboardStatusPill tone={isPaid ? "success" : "neutral"}>
                    {isPaid ? "Платный тариф" : "Бесплатный тариф"}
                  </DashboardStatusPill>
                </div>
                <p className="mt-5 text-sm font-semibold text-foreground">План и лимиты</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {isPaid
                    ? "Расширенный режим хранения отчетов и работы с проверками."
                    : "Базовый доступ. Расширение тарифа доступно в разделе подписки."}
                </p>
                <div className="mt-5 flex justify-end">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/profile/subscription")}
                  >
                    Управлять тарифом
                  </AnimatedButton>
                </div>
              </DashboardCard>

              <DashboardCard className="lg:col-span-2">
                <div className="flex items-start justify-between gap-4">
                  <DashboardIcon icon={ShieldCheck} />
                  <DashboardStatusPill>Рабочая область доказательств</DashboardStatusPill>
                </div>
                <p className="mt-5 text-sm font-semibold text-foreground">Отчеты и доказательства</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Сохраненные проверки доступны в истории. PDF скачивается только для завершенных отчетов.
                </p>
                <div className="mt-5 flex justify-end">
                  <AnimatedButton
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/profile/history")}
                  >
                    Открыть историю
                  </AnimatedButton>
                </div>
              </DashboardCard>
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <DashboardSectionTitle
              title="Разделы кабинета"
              description=""
            />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ProfileActionCard
                icon={Mail}
                title="Настройки почты"
                description="Изменить адрес для входа и уведомлений."
                tone="success"
                onClick={() => router.push("/profile/settings/email")}
              />
              <ProfileActionCard
                icon={Lock}
                title="Настройки пароля"
                description="Обновить пароль доступа к аккаунту."
                onClick={() => router.push("/profile/settings/password")}
              />
              <ProfileActionCard
                icon={CreditCard}
                title="Подписка"
                description="Текущий тариф, лимиты и управление планом."
                onClick={() => router.push("/profile/subscription")}
              />
              <ProfileActionCard
                icon={Download}
                title="История проверок"
                description="Список проверок и скачивание PDF-отчетов."
                tone="warning"
                onClick={() => router.push("/profile/history")}
              />
              <ProfileActionCard
                icon={Receipt}
                title="История покупок"
                description="Транзакции и счета после подключения платежей."
                onClick={() => router.push("/profile/purchases")}
              />
            </div>
          </DashboardPanel>

          <DashboardPanel>
            <DashboardCard className="report-glow report-glow-danger">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <DashboardIcon icon={Trash2} tone="danger" />
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm font-semibold text-foreground">Удаление аккаунта</p>
                      <DashboardStatusPill tone="danger">Опасная зона</DashboardStatusPill>
                    </div>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      Все данные аккаунта, история проверок и сохраненные отчеты будут безвозвратно удалены.
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <AnimatedButton
                      variant="outline"
                      size="sm"
                      disabled={isDeleting}
                      className="border-red-400/20 text-foreground hover:border-red-200/30 hover:bg-red-400/10"
                    >
                      {isDeleting ? "Удаление..." : "Удалить аккаунт"}
                    </AnimatedButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить аккаунт?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Аккаунт, история проверок и все
                        сохраненные отчеты будут безвозвратно удалены.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        className="border border-red-400/30 bg-red-400/10 text-foreground hover:bg-red-400/15"
                        onClick={async () => {
                          setIsDeleting(true);
                          try {
                            await deleteAccount();
                            await logout();
                            toast.success("Аккаунт удален");
                            router.push("/");
                          } catch {
                            setIsDeleting(false);
                            toast.error("Не удалось удалить аккаунт");
                          }
                        }}
                      >
                        {isDeleting ? "Удаление..." : "Удалить"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </DashboardCard>
          </DashboardPanel>
        </div>
      </DashboardPage>
    </AuthGuard>
  );
}
