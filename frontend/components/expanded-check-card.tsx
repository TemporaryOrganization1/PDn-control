"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  X,
  XCircle,
} from "lucide-react";
import type { CheckItem } from "@/lib/data";
import { countryCodeToFlagUrl } from "@/lib/country";
import {
  DashboardCard,
  DashboardIcon,
  DashboardStatusPill,
} from "@/components/profile-dashboard";

interface ExpandedCheckCardProps {
  item: CheckItem;
  compact?: boolean;
}

const STATUS_META = {
  pass: {
    icon: CheckCircle2,
    tone: "success",
    glow: "report-glow-success",
    label: "Пройдено",
  },
  warning: {
    icon: AlertTriangle,
    tone: "warning",
    glow: "report-glow-warning",
    label: "Предупреждение",
  },
  fail: {
    icon: XCircle,
    tone: "danger",
    glow: "report-glow-danger",
    label: "Нарушение",
  },
} as const;

function imageUrl(id: string): string {
  return `/api/img/${encodeURIComponent(id)}`;
}

function extractCountryFlagUrl(detail: string): string | undefined {
  const match = detail.match(/\bcountry:\s*(\w{2})\b/);
  if (!match) return undefined;
  const code = match[1].toLowerCase();
  if (code === "unknown" || code === "localhost") return undefined;
  const url = countryCodeToFlagUrl(code);
  return url ?? undefined;
}

function FlaggedDetail({ flagUrl, text }: { flagUrl: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <img
        src={flagUrl}
        alt=""
        className="h-3.5 w-5 rounded-[2px] border border-white/10 object-cover"
        loading="lazy"
      />
      {text}
    </span>
  );
}

function ExpandablePillList({ items, initialCount = 18 }: { items: string[]; initialCount?: number }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = Math.max(0, items.length - initialCount);
  const Icon = expanded ? ChevronUp : ChevronDown;

  return (
    <div>
      <div className="flex max-h-52 flex-wrap gap-2 overflow-hidden data-[expanded=true]:max-h-none" data-expanded={expanded}>
        {visibleItems.map((domain, index) => (
          <span
            key={`${domain}-${index}`}
            className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-[11px] text-foreground/75"
          >
            {domain}
          </span>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <button
          type="button"
          className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-foreground transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          onClick={() => setExpanded((value) => !value)}
        >
          <Icon className="h-3.5 w-3.5" />
          {expanded ? "Свернуть" : `Показать еще ${hiddenCount}`}
        </button>
      ) : null}
    </div>
  );
}

function EvidenceLightbox({
  imageId,
  onClose,
}: {
  imageId: string;
  onClose: () => void;
}) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="w-full max-w-[min(96vw,1180px)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <code className="min-w-0 truncate font-mono text-xs text-white/65">{imageId}</code>
          <div className="flex shrink-0 items-center gap-2">
            <a
              className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-3 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              href={imageUrl(imageId)}
              download
            >
              <Download className="h-3.5 w-3.5" />
              Скачать
            </a>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-white transition hover:border-white/25 hover:bg-white/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/[0.045] p-2 shadow-2xl">
          <img
            src={imageUrl(imageId)}
            alt="Доказательство"
            className="mx-auto max-h-[82vh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export function ExpandedCheckCard({ item, compact = false }: ExpandedCheckCardProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  if (item.status === "unknown") return null;
  const meta = STATUS_META[item.status];

  return (
    <DashboardCard className={`report-glow ${meta.glow}`}>
      <div className="flex items-start gap-4">
        <DashboardIcon icon={meta.icon} tone={meta.tone} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            <DashboardStatusPill tone={meta.tone}>{meta.label}</DashboardStatusPill>
            {/* <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-xs text-muted-foreground">
              {item.title}
            </span> */}
          </div>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
        </div>
      </div>

      {!compact && item.lawExcerpts.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-foreground/70">Выдержки из закона</p>
          <div className="space-y-2">
            {item.lawExcerpts.map((excerpt, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-foreground/75"
              >
                {excerpt}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!compact && item.foundUrls.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground/70">
            <ExternalLink className="h-3.5 w-3.5" />
            Адреса, где найден риск
          </p>
          <div className="space-y-2">
            {item.foundUrls.map((url, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <code className="break-all font-mono text-xs text-foreground/75">{url}</code>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!compact && item.domainsIps.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground/70">
            <Globe className="h-3.5 w-3.5" />
            Домены и IP-адреса
          </p>
          <ExpandablePillList items={item.domainsIps} />
        </div>
      ) : null}

      {!compact && item.details.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 text-xs font-medium text-foreground/70">Технические детали</p>
          <ul className="space-y-2">
            {item.details.map((detail, index) => {
              const flagUrl = extractCountryFlagUrl(detail);
              return (
                <li
                  key={index}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-5 text-foreground/80"
                >
                  {flagUrl ? (
                    <FlaggedDetail flagUrl={flagUrl} text={detail} />
                  ) : (
                    detail
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!compact && item.images.length > 0 ? (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-2 text-xs font-medium text-foreground/70">
            <ImageIcon className="h-3.5 w-3.5" />
            Прикрепленные изображения
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {item.images.map((id) => (
              <div key={id} className="rounded-2xl border border-white/10 bg-black/20 p-2">
                <button
                  type="button"
                  className="block aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  onClick={() => setActiveImage(id)}
                  title="Открыть изображение"
                >
                  <img
                    src={imageUrl(id)}
                    alt="Доказательство"
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </button>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <code className="min-w-0 truncate font-mono text-[10px] text-muted-foreground">{id}</code>
                  <a
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-foreground/80 transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    href={imageUrl(id)}
                    download
                    title="Скачать изображение"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeImage ? (
        <EvidenceLightbox imageId={activeImage} onClose={() => setActiveImage(null)} />
      ) : null}
    </DashboardCard>
  );
}
