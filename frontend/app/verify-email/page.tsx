"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AnimatedButton } from "@/components/animated-button";

function VerifyEmailContent() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.status === "verified") {
        setIsVerified(true);
        toast.success("Почта успешно подтверждена!");
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setError(data.msg || "Неверный или истекший токен подтверждения");
        toast.error(data.msg || "Ошибка подтверждения почты");
      }
    } catch {
      setError("Не удалось подключиться к серверу");
      toast.error("Ошибка подключения к серверу");
    } finally {
      setIsVerifying(false);
    }
  }, [router]);

  useEffect(() => {
    // Коротко показываем загрузку, затем проверяем токен.
    const timeout = setTimeout(() => {
      const token = searchParams.get("token");
      if (token) {
        verifyEmail(token);
      } else {
        setError("Токен подтверждения не найден");
        setIsVerifying(false);
      }
      setShowLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchParams, verifyEmail]);

  if (isVerified) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="border border-border bg-card p-8 text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h1 className="mb-2 text-2xl font-bold">Почта подтверждена!</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Ваша почта успешно подтверждена. Сейчас вы будете перенаправлены...
            </p>
            <AnimatedButton onClick={() => router.push("/profile")} className="w-full">
              Перейти в профиль
            </AnimatedButton>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <div className="border border-border bg-card p-8 text-center">
            <XCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h1 className="mb-2 text-2xl font-bold">Ошибка подтверждения</h1>
            <p className="mb-6 text-sm text-muted-foreground">{error}</p>
            <AnimatedButton onClick={() => router.push("/login")} className="w-full">
              Перейти к входу
            </AnimatedButton>
          </div>
        </div>
      </div>
    );
  }

  if (isVerifying || showLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">Подтверждение...</div>
      </div>
    );
  }

  return null;
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
