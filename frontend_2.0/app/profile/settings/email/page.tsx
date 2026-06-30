"use client";

import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/back-button";
import { useAuth } from "@/components/auth-provider";

export default function EmailSettingsPage() {
  const { user } = useAuth();

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
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="px-6 py-10 sm:px-10 sm:py-14 lg:col-span-10 lg:col-start-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Настройки email
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Смена email пока не поддерживается backend
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="flex justify-center lg:col-span-6 lg:col-start-2">
            <Card className="w-full rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Текущий email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={user?.email || ""} readOnly />
                <p className="text-sm text-muted-foreground">
                  Мы не показываем успешное сохранение без backend endpoint. Когда API смены email появится, эту форму можно будет включить.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

