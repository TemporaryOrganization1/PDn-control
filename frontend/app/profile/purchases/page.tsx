"use client";

import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { BackButton } from "@/components/back-button";

export default function PurchasesPage() {
  const router = useRouter();

  return (
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
              История покупок
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Платежный backend пока не реализован
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="flex flex-col items-center justify-center border border-border/50 bg-background/50 py-12 text-center">
              <Receipt className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm font-medium">Покупок пока нет</p>
              <p className="mt-1 max-w-md text-xs text-muted-foreground">
                Здесь появятся реальные транзакции после подключения backend платежей.
              </p>
              <AnimatedButton className="mt-4" onClick={() => router.push("/pricing")}>
                Посмотреть тарифы
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

