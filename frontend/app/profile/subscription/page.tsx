"use client";

import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";
import { AnimatedButton } from "@/components/animated-button";
import { BackButton } from "@/components/back-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/components/auth-provider";
import { useState, useEffect } from "react";

export default function SubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Timer for paid plan expiration
  useEffect(() => {
    if (!user?.planExpiresAt) {
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      const expires = new Date(user.planExpiresAt!).getTime();
      const now = Date.now();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user?.planExpiresAt]);

  return (
    <AuthGuard>
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
              Управление подпиской
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Backend тарифов и платежей пока не реализован, поэтому тариф не меняется локально.
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="rounded-none border-primary/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Бесплатный</CardTitle>
                    {user?.plan === "free" && (
                      <Badge variant="secondary" className="border-green-500/20 bg-green-500/10 text-green-600">
                        Текущий план
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">0 ₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-wrap h-full justify-between">
                  <ul className="space-y-2 w-full">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Гостевой лимит контролируется backend
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      PDF-отчет после завершения проверки
                    </li>
                  </ul>
                   <div className="flex flex-col gap-3 w-full">
                    <AnimatedButton
                       variant="outline"
                       className="w-full"
                       disabled={isDowngrading || user?.plan === "free"}
                       onClick={async () => {
                         setError("");
                         setSuccess("");
                         setIsDowngrading(true);
                         try {
                           const res = await fetch("/api/subscription/change", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ plan: "free" }),
                           });
                           const data = await res.json();
                           if (!res.ok) {
                             setError(data.message || "Failed to switch to free plan");
                           } else {
                             setSuccess(data.message || "Switched to free plan successfully");
                           }
                         } catch (e) {
                           setError("Network error");
                         } finally {
                           setIsDowngrading(false);
                         }
                       }}
                     >
                       {user?.plan === "free" ? "Currently Free" : isDowngrading ? "Switching..." : "Switch to Free Plan"}
                     </AnimatedButton>
                     </div>
                </CardContent>

                
              </Card>

              <Card className="rounded-none">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Платный</CardTitle>
                    {user?.plan === "paid" && (
                      <Badge variant="secondary" className="border-green-500/20 bg-green-500/10 text-green-600">
                        Текущий план
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">990 ₽</span>
                    <span className="text-muted-foreground">/месяц</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Без гостевого лимита
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      Без ограничения срока хранения
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      PDF-отчет после завершения проверки
                    </li>
                  </ul>
                  {error && (
                    <p className="text-sm text-red-500">{error}</p>
                  )}
                  {success && (
                    <p className="text-sm text-green-500">{success}</p>
                  )}
                   {user?.plan === "paid" && user?.planExpiresAt && (
                     <div className="rounded-md bg-blue-500/10 p-3 text-sm">
                       <p className="font-medium text-blue-700">You already have a paid plan</p>
                       <p className="mt-1 text-blue-600">
                         {timeLeft ? `Expires in: ${timeLeft}` : "Loading..."}
                       </p>
                     </div>
                   )}
                   <div className="flex flex-col gap-3">
                     <AnimatedButton
                       variant="outline"
                       className="w-full"
                       disabled={isUpgrading || user?.plan === "paid"}
                       onClick={async () => {
                         setError("");
                         setSuccess("");
                         setIsUpgrading(true);
                         try {
                           const res = await fetch("/api/subscription/change", {
                             method: "POST",
                             headers: { "Content-Type": "application/json" },
                             body: JSON.stringify({ plan: "paid" }),
                           });
                           const data = await res.json();
                           if (!res.ok) {
                             setError(data.message || "Failed to upgrade plan");
                           } else {
                             setSuccess(data.message || "Plan upgraded successfully");
                           }
                         } catch (e) {
                           setError("Network error");
                         } finally {
                           setIsUpgrading(false);
                         }
                       }}
                     >
                       {user?.plan === "paid" ? "Plan is Active" : isUpgrading ? "Activating..." : "Upgrade to Paid Plan"}
                     </AnimatedButton>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <AnimatedButton variant="outline" onClick={() => router.push("/pricing")}>
                Смотреть тарифы
              </AnimatedButton>
            </div>
          </div>
        </div>
      </section>
    </div>
    </AuthGuard>
  );
}

