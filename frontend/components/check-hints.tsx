"use client";

import { useEffect, useState } from "react";
import { Shield, Sparkles, RefreshCw } from "lucide-react";

const HINTS = [
  {
    icon: Shield,
    text: "Добавьте IP-адреса нашего сервиса в белый список (whitelist), чтобы проверка проходила корректно",
  },
  {
    icon: Sparkles,
    text: "В платном плане доступны расширенные проверки и приоритетная поддержка",
  },
  {
    icon: RefreshCw,
    text: "Количество бесплатных проверок сбрасывается каждый день",
  },
];

export function CheckHints() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % HINTS.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="w-full border-b bg-card/50">
      <div className="grid grid-cols-1 lg:grid-cols-12 px-6 py-6 sm:px-10">
        <div className="lg:col-span-8 lg:col-start-2">
          <div className="relative h-12">
            {HINTS.map((hint, i) => {
              const Icon = hint.icon;
              return (
                <div
                  key={i}
                  className={`absolute left-0 right-0 flex items-start gap-2 transition-all duration-500 ${
                    i === activeIndex
                      ? "translate-y-0 opacity-100"
                      : "translate-y-2 opacity-0"
                  }`}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center bg-primary/10">
                    <Icon className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground pt-0.5">
                    {hint.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
