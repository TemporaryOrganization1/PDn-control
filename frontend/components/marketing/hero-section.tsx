import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AddressCheckForm } from "@/components/address-check-form";
import { GuestChecksBadge } from "@/components/guest-checks-badge";
import { ReportPreviewCard } from "@/components/marketing/report-preview-card";
import { siteConfig } from "@/lib/data";

export function HeroSection() {
  return (
    <section id="product" className="hero-gavel-bg relative overflow-hidden">
      <div className="mx-auto grid min-h-[calc(100svh-4rem)] w-full max-w-7xl grid-cols-1 gap-8 px-5 py-16 sm:min-h-[720px] sm:gap-10 sm:px-8 sm:py-22 lg:min-h-[760px] lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] lg:px-10 lg:py-28">
        <div className="relative z-10 flex max-w-3xl flex-col justify-center">
          <h1
            className="hero-reveal max-w-4xl text-4xl font-semibold leading-[1.04] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            style={{ "--hero-reveal-delay": "80ms" } as CSSProperties}
          >
            Проверка сайта на риски по 152-ФЗ
          </h1>

          <p
            className="hero-reveal mt-5 max-w-2xl text-lg leading-8 text-foreground/82"
            style={{ "--hero-reveal-delay": "180ms" } as CSSProperties}
          >
            {siteConfig.description}
          </p>

          <div
            className="hero-reveal mt-8 max-w-2xl"
            style={{ "--hero-reveal-delay": "300ms" } as CSSProperties}
          >
            <AddressCheckForm />
          </div>

          <div
            className="hero-reveal mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--hero-reveal-delay": "410ms" } as CSSProperties}
          >
            <GuestChecksBadge />
            <Link
              href="#report"
              className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.07] hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
            >
              Посмотреть пример отчета
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="relative z-10 flex items-center pt-2 sm:pt-0 lg:justify-end">
          <div
            className="hero-reveal hero-reveal-subtle hero-report-preview-ambient hero-report-preview-fade w-full max-w-xl"
            style={{ "--hero-reveal-delay": "540ms" } as CSSProperties}
          >
            <ReportPreviewCard className="relative z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
