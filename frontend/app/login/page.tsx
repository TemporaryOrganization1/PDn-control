"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AnimatedButton } from "@/components/animated-button";
import { BrandMark } from "@/components/brand-mark";
import { Input } from "@/components/ui/input";
import {
  consumePostAuthRedirect,
  readPostAuthRedirect,
  rememberPostAuthRedirect,
  resolveSafeRedirectPath,
} from "@/lib/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const redirectTarget = resolveSafeRedirectPath(
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("redirectTo"),
    readPostAuthRedirect(),
  );

  const redirectAfterLogin = useCallback(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    consumePostAuthRedirect(redirectTarget);
    router.replace(redirectTarget);
  }, [redirectTarget, router]);

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      redirectAfterLogin();
    }
  }, [isLoggedIn, authLoading, redirectAfterLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!email || !password) {
        toast.error("Заполните все поля");
        return;
      }

      await login(email, password);
      toast.success("Вход выполнен");
      redirectAfterLogin();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось войти");
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

  return (
    <div className="auth-page-bg flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-16">
      <div className="mx-auto flex w-full max-w-[560px] flex-col justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <BrandMark
              className="h-12 w-12 rounded-2xl"
              markClassName="h-7 w-7"
            />
          </div>
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            PDn Control
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Войти в аккаунт
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Нет аккаунта?{" "}
            <Link
              href="/signup"
              onClick={() => rememberPostAuthRedirect(redirectTarget)}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-foreground/90"
            >
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
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground/90"
            >
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

          <AnimatedButton
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            loadingText="Входим..."
          >
            Войти
          </AnimatedButton>
        </form>

        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-5 text-muted-foreground">
          Продолжая, вы соглашаетесь с правилами сервиса и обработкой данных для
          работы аккаунта.
        </p>
      </div>
    </div>
  );
}
