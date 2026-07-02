"use client";

import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AuthGuard>
      <div className="flex flex-col">
        <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="px-6 pb-3 pt-10 sm:px-10 sm:pt-14 lg:col-span-10 lg:col-start-2">
            <BackButton />
          </div>
        </div>
      </section>
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Управление подпиской
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Backend тарифов и платежей пока не реализован, поэтому тариф не меняется локально.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="rounded-none border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Бесплатный</CardTitle>
                    {user?.plan === "free" && (
                      <Badge variant="secondary" className="border-green-500/20 bg-green-500/10 text-green-600">
                        Текущий план
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">0 ₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Гостевой лимит контролируется backend
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      PDF-отчет после завершения проверки
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Платный</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">990 ₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Оплата и хранение тарифа будут доступны после появления backend endpoint для подписок.
                  </p>
                  <AnimatedButton variant="outline" className="w-full" disabled>
                    Недоступно
                  </AnimatedButton>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <AnimatedButton variant="outline" onClick={() => router.push("/pricing")}>
                Смотреть тарифы
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>
    </div>
    </AuthGuard>
  );
}

