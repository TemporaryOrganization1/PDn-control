"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <button
              type="button"
              className="mb-2 flex items-center gap-2 text-sm font-medium hover:underline"
              onClick={() => router.push("/pricing")}
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              Назад к тарифам
            </button>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Оформление подписки
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Платежный backend пока не подключен
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-6 lg:col-start-2">
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Оплата недоступна
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Мы не имитируем успешный платеж на frontend. Для включения подписки нужен backend endpoint оплаты и хранения тарифа.
                </p>
                <AnimatedButton variant="outline" onClick={() => router.push("/pricing")}>
                  Вернуться к тарифам
                </AnimatedButton>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

