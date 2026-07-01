"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { AnimatedButton } from "@/components/animated-button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

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

      await signup(email, password);
      toast.success("Аккаунт создан");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось создать аккаунт");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="border border-border bg-card p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold">Создать аккаунт</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Зарегистрируйтесь, чтобы сохранять историю проверок
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative flex items-center gap-2 border bg-card p-1 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Пароль
              </label>
              <div className="relative flex items-center gap-2 border bg-card p-1 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Подтвердите пароль
              </label>
              <div className="relative flex items-center gap-2 border bg-card p-1 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
                <div className="flex flex-1 items-center gap-2 px-3">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatedButton type="submit" className="w-full" isLoading={isLoading} loadingText="Создаем...">
              Создать
            </AnimatedButton>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

