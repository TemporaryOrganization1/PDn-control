"use client";

import { useEffect, useState } from "react";
import { Shield, Sparkles, RefreshCw } from "lucide-react";

const HINTS = [
  {
    icon: Shield,
    text: "PDF и визуальные доказательства создаются только для paid-проверок",
  },
  {
    icon: Sparkles,
    text: "Free использует 3 AI-перехода, Paid — 10 и полный evidence",
  },
  {
    icon: RefreshCw,
    text: "Сменить пароль можно в личном кабинете",
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
    <section className="w-full border-b border-white/10 px-5 py-4 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <div className="flex items-center relative h-12">
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
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10">
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
