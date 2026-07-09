"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AnimatedButton } from "@/components/animated-button";
import { BrandMark } from "@/components/brand-mark";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const { signup, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.push("/profile");
    }
  }, [isLoggedIn, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password || !confirmPassword) {
        toast.error("Заполните все поля");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Пароли не совпадают");
        return;
      }

      if (password.length < 8) {
        toast.error("Пароль должен быть не короче 8 символов");
        return;
      }

      const result = await signup(email, password);
      if (result.status === "pending_verification") {
        toast.success("Аккаунт создан! Проверьте почту для подтверждения.", {
          duration: 5000,
        });
        setShowVerificationMessage(true);
      } else {
        toast.success("Аккаунт создан!");
        router.push("/profile");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось создать аккаунт");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="auth-page-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
        <div className="text-sm text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  if (showVerificationMessage) {
    return (
      <div className="auth-page-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
        <div className="mx-auto flex w-full max-w-[560px] flex-col justify-center text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.055] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_34px_rgba(0,0,0,0.22)]">
            <Mail className="h-7 w-7 text-foreground" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Почта отправлена</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Отправили письмо с подтверждением на {email}. Перейдите по ссылке в письме, чтобы активировать аккаунт.
          </p>
          <Link
            href="/login"
            className="premium-cta mt-8 inline-flex h-11 w-full items-center justify-center px-6 text-sm font-semibold"
          >
            Перейти к входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-[560px] flex-col justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <BrandMark className="h-12 w-12 rounded-2xl" markClassName="h-7 w-7" />
          </div>
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            PDn Control
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Создать аккаунт</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Войти
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground/90">
              Электронная почта
            </label>
            <div className="auth-input-shell relative flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground/90">
              Пароль
            </label>
            <div className="auth-input-shell relative flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/90">
              Подтвердите пароль
            </label>
            <div className="auth-input-shell relative flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200">
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-0 bg-transparent p-0 text-base shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  required
                />
              </div>
            </div>
          </div>

          <AnimatedButton type="submit" className="w-full" size="lg" isLoading={isLoading} loadingText="Создаем...">
            Создать аккаунт
          </AnimatedButton>
        </form>

        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-5 text-muted-foreground">
          Продолжая, вы соглашаетесь с правилами сервиса и обработкой данных для работы аккаунта.
        </p>
      </div>
    </div>
  );
}
