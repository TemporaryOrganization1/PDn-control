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
      toast.error("Введите URL сайта для проверки");
      return;
    }
    if (!URL_REGEX.test(trimmed)) {
      toast.error("Введите корректный URL сайта");
      return;
    }

    checkInFlightRef.current = true;
    setIsChecking(true);
    try {
      const response = await startCheck(trimmed, "detail");
      const reqId = response["req-id"] || response.data?.["req-id"];
      if (!reqId) {
        throw new Error("Backend не вернул идентификатор проверки");
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
    <div className="w-full max-w-lg space-y-3">
      <div className="relative flex items-center gap-2 border bg-card p-1 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
        <div className="flex flex-1 items-center gap-2 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCheck();
            }}
          />
        </div>
        <AnimatedButton onClick={handleCheck} isLoading={isChecking} loadingText="Проверка...">
          Проверить
        </AnimatedButton>
      </div>
    </div>
  );
}
