"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
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

export default function EmailSettingsPage() {
  const router = useRouter();
  const { user, updateEmail } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateEmail(email);
      toast.success("Почта обновлена");
      router.push("/profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось обновить почту");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton />
        </div>
        <DashboardHeader
          eyebrow="Настройки аккаунта"
          title="Настройки почты"
          description="Измените адрес электронной почты, который используется для входа и уведомлений аккаунта."
        />

        <DashboardPanel>
          <DashboardSectionTitle icon={Mail} title="Почта аккаунта" />
          <DashboardCard className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Новая почта
                </label>
                <div className="auth-input-shell flex h-14 items-center gap-3 rounded-2xl px-4">
                  <DashboardIcon icon={Mail} size="sm" className="h-8 w-8 rounded-xl" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-full border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <AnimatedButton type="submit" isLoading={isLoading} loadingText="Сохранение...">
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
