"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AnimatedButton } from "@/components/animated-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";

export default function PasswordSettingsPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!oldPassword || !newPassword || !confirmPassword) {
        toast.error("Заполните все поля");
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error("Пароли не совпадают");
        return;
      }

      if (newPassword.length < 8) {
        toast.error("Пароль должен быть не короче 8 символов");
        return;
      }

      await updatePassword(oldPassword, newPassword);
      toast.success("Пароль обновлен");
      router.push("/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось обновить пароль");
    } finally {
      setIsLoading(false);
    }
  };

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
              Настройки пароля
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Измените пароль для входа в аккаунт
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
                  <Lock className="h-4 w-4 text-primary" />
                  Изменить пароль
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { id: "oldPassword", label: "Старый пароль", value: oldPassword, setter: setOldPassword },
                    { id: "newPassword", label: "Новый пароль", value: newPassword, setter: setNewPassword },
                    { id: "confirmPassword", label: "Подтвердите пароль", value: confirmPassword, setter: setConfirmPassword },
                  ].map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label htmlFor={field.id} className="text-sm font-medium">
                        {field.label}
                      </label>
                      <div className="relative flex items-center gap-2 border bg-card p-1 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                        <div className="flex flex-1 items-center gap-2 px-3">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id={field.id}
                            type="password"
                            value={field.value}
                            onChange={(event) => field.setter(event.target.value)}
                            className="border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="flex w-full justify-end">
                    <AnimatedButton type="submit" isLoading={isLoading} loadingText="Сохраняем...">
                      Сохранить
                    </AnimatedButton>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

