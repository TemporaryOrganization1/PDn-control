"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
} from "@/components/profile-dashboard";
import { Input } from "@/components/ui/input";

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

  const fields = [
    {
      id: "oldPassword",
      label: "Старый пароль",
      value: oldPassword,
      setter: setOldPassword,
    },
    {
      id: "newPassword",
      label: "Новый пароль",
      value: newPassword,
      setter: setNewPassword,
    },
    {
      id: "confirmPassword",
      label: "Подтвердите пароль",
      value: confirmPassword,
      setter: setConfirmPassword,
    },
  ];

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton />
        </div>
        <DashboardHeader
          eyebrow="Безопасность аккаунта"
          title="Настройки пароля"
          description="Обновите пароль для входа в аккаунт. Проверка совпадения и минимальной длины выполняется до запроса."
        />

        <DashboardPanel>
          <DashboardSectionTitle icon={Lock} title="Пароль доступа" />
          <DashboardCard className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label htmlFor={field.id} className="text-sm font-medium text-foreground">
                    {field.label}
                  </label>
                  <div className="auth-input-shell flex h-14 items-center gap-3 rounded-2xl px-4">
                    <DashboardIcon icon={Lock} size="sm" className="h-8 w-8 rounded-xl" />
                    <Input
                      id={field.id}
                      type="password"
                      value={field.value}
                      onChange={(event) => field.setter(event.target.value)}
                      className="h-full border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-1">
                <AnimatedButton type="submit" isLoading={isLoading} loadingText="Сохраняем...">
                  Сохранить
                </AnimatedButton>
              </div>
            </form>
          </DashboardCard>
        </DashboardPanel>
      </DashboardPage>
    </AuthGuard>
  );
}

