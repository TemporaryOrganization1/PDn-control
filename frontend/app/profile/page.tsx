"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { AuthGuard } from "@/components/auth-guard";
import { AnimatedButton } from "@/components/animated-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getReports } from "@/lib/api";
import { 
  User, 
  Mail, 
  Lock, 
  CreditCard, 
  Download, 
  Calendar,
  FileText,
  ArrowRight 
} from "lucide-react";

function formatRegistrationDate(value?: string) {
  if (!value) return "Нет данных";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Нет данных";
  return date.toLocaleDateString("ru-RU");
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
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
        const uniquePdfChecks = new Set(
          items
            .filter((item) => item.report_id)
            .map((item) => item.req_id || item.report_id)
        );
        setChecksCount(uniquePdfChecks.size);
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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex flex-col">
        {/* Header */}
        <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-10 sm:px-10 sm:py-14">
          <div className="lg:col-span-10 lg:col-start-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Личный кабинет
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Управляйте своим аккаунтом и просматривайте историю
            </p>
          </div>
        </div>
      </section>

      {/* User Info Overview */}
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-10 sm:px-10 sm:py-14">
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-6">
              <User className="h-4 w-4 text-primary" />
              Информация об аккаунте
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Email */}
              <Card className="h-full rounded-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate flex-1">{user?.email || ""}</p>
                    {user?.isVerified ? (
                      <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[8px] ml-2">
                        Подтверждён
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-500/20 text-amber-500 text-[8px] ml-2">
                        Не подтверждён
                      </Badge>
                    )}
                  </div>
                  <div className="mt-auto flex justify-end">
                    <AnimatedButton 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => router.push("/profile/settings/email")}
                    >
                      Изменить
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>

              {/* Registration Date */}
              <Card className="h-full rounded-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Дата регистрации
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{registrationDate}</p>
                </CardContent>
              </Card>

              {/* Checks Count */}
              <Card className="h-full rounded-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Проверок всего
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">{checksCount === null ? "Загрузка..." : checksCount}</p>
                </CardContent>
              </Card>

              {/* Plan */}
              <Card className="h-full rounded-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    Тариф
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col h-[calc(100%-4rem)]">
                  <div className="mb-2">
                    {user?.plan === "paid" ? (
                      <Badge variant="outline" className="border-blue-500/20 text-blue-500">
                        Платный
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-emerald-500/20 text-emerald-500">
                        Бесплатный
                      </Badge>
                    )}
                  </div>
                  <div className="mt-auto flex justify-end">
                    <AnimatedButton 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => router.push("/profile/subscription")}
                    >
                      Управлять
                    </AnimatedButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-10 sm:px-10 sm:py-14">
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="flex items-center gap-2 text-sm font-medium mb-6">
              Настройки
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Settings */}
              <Card className="cursor-pointer transition-all duration-200 hover:border-primary/50 rounded-none" onClick={() => router.push("/profile/settings/email")}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Настройки email</p>
                      <p className="text-xs text-muted-foreground">Изменить адрес почты</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Password Settings */}
              <Card className="cursor-pointer transition-all duration-200 hover:border-primary/50 rounded-none" onClick={() => router.push("/profile/settings/password")}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Настройки пароля</p>
                      <p className="text-xs text-muted-foreground">Изменить пароль</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Subscription */}
              <Card className="cursor-pointer transition-all duration-200 hover:border-primary/50 rounded-none" onClick={() => router.push("/profile/subscription")}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Подписка</p>
                      <p className="text-xs text-muted-foreground">Управление тарифом</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Check History */}
              <Card className="cursor-pointer transition-all duration-200 hover:border-primary/50 rounded-none" onClick={() => router.push("/profile/history")}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">История проверок</p>
                      <p className="text-xs text-muted-foreground">Все ваши проверки</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>

              {/* Purchase History */}
              <Card className="cursor-pointer transition-all duration-200 hover:border-primary/50 rounded-none" onClick={() => router.push("/profile/purchases")}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center bg-primary/10">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">История покупок</p>
                      <p className="text-xs text-muted-foreground">Транзакции и счета</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
    </AuthGuard>
  );
}
