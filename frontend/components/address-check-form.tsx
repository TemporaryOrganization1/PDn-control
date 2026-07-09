"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AnimatedButton } from "@/components/animated-button";
import { toast } from "sonner";
import { startCheck } from "@/lib/api";

const URL_REGEX = /^https?:\/\/.+\..+|www\..+\..+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;

export function AddressCheckForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const checkInFlightRef = useRef(false);

  const handleCheck = async () => {
    if (checkInFlightRef.current) return;

    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Введите адрес сайта для проверки");
      return;
    }
    if (!URL_REGEX.test(trimmed)) {
      toast.error("Введите корректный адрес сайта");
      return;
    }

    checkInFlightRef.current = true;
    setIsChecking(true);
    try {
      const response = await startCheck(trimmed, "detail");
      const reqId = response["req-id"] || response.data?.["req-id"];
      if (!reqId) {
        throw new Error("Бэкенд не вернул идентификатор проверки");
      }
      router.push(`/check?reqId=${encodeURIComponent(reqId)}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось запустить проверку");
    } finally {
      checkInFlightRef.current = false;
      setIsChecking(false);
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-3">
      <div className="relative flex flex-col gap-2 rounded-[1.35rem] border border-white/10 bg-background/60 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_48px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all duration-200 focus-within:border-white/20 focus-within:ring-4 focus-within:ring-white/[0.055] sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 min-w-0 border-0 bg-transparent p-0 font-mono text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCheck();
            }}
          />
        </div>
        <AnimatedButton
          onClick={handleCheck}
          isLoading={isChecking}
          loadingText="Проверка..."
          size="lg"
          className="hero-primary-cta w-full sm:w-auto"
        >
          Проверить сайт
        </AnimatedButton>
      </div>
    </div>
  );
}
