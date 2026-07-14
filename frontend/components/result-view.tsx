"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Image as ImageIcon,
  Scale,
  Server,
  ShieldAlert,
  LockKeyhole,
  X,
  XCircle,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import { ExpandedCheckCard } from "@/components/expanded-check-card";
import { PdfDownloadButton } from "@/components/download-pdf-button";
import {
  DashboardCard,
  DashboardHeader,
  DashboardIcon,
  DashboardPage,
  DashboardPanel,
  DashboardSectionTitle,
  DashboardStatusPill,
} from "@/components/profile-dashboard";
import { getProgress, type TaskState } from "@/lib/api";
import { countryCodeToDisplayName } from "@/lib/country";
import type { ServerGeoItem } from "@/lib/data";
import { taskToCheckResult } from "@/lib/result-adapter";
import { getStoredLastResult, saveLastResult } from "@/lib/result-storage";

type Tone = "neutral" | "success" | "warning" | "danger";

const STATUS_META: Record<
  string,
  {
    icon: LucideIcon;
    tone: Tone;
    glow: string;
    label: string;
    summary: string;
  }
> = {
  compliant: {
    icon: CheckCircle2,
    tone: "success",
    glow: "report-glow-success",
    label: "Критических нарушений не найдено",
    summary: "Проверка не выявила существенных рисков по данным, переданным бэкендом.",
  },
  partial: {
    icon: AlertTriangle,
    tone: "warning",
    glow: "report-glow-warning",
    label: "Есть предупреждения",
    summary: "Найдены зоны, которые стоит проверить вручную и закрыть до повторной проверки.",
  },
  non_compliant: {
    icon: XCircle,
    tone: "danger",
    glow: "report-glow-danger",
    label: "Есть нарушения",
    summary: "Найдены нарушения или существенные риски, требующие приоритетного разбора.",
  },
};

function completionMeta(score: number): { tone: Tone; glow: string; label: string } {
  if (score >= 80) return { tone: "success", glow: "report-glow-success", label: "Высокий индекс" };
  if (score >= 50) return { tone: "warning", glow: "report-glow-warning", label: "Средний индекс" };
  return { tone: "danger", glow: "report-glow-danger", label: "Низкий индекс" };
}

function CompletionScoreBar({ score }: { score: number }) {
  const meta = completionMeta(score);

  return (
    <DashboardCard className={`report-glow ${meta.glow}`}>
      <div className="flex items-start justify-between gap-4">
        <DashboardIcon icon={CheckCircle2} tone={meta.tone} />
        <DashboardStatusPill tone={meta.tone}>{meta.label}</DashboardStatusPill>
      </div>
      <div className="mt-6">
        <p className="text-xs uppercase text-muted-foreground">Индекс прохождения проверок</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-foreground">{score}%</span>
          <span className="text-xs text-muted-foreground">чем выше, тем лучше</span>
        </div>
      </div>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white/80 shadow-[0_0_26px_rgba(255,255,255,0.18)] transition-all duration-1000"
          style={{ width: `${score}%` }}
        />
      </div>
    </DashboardCard>
  );
}

function imageUrl(id: string): string {
  return `/api/img/${encodeURIComponent(id)}`;
}

function checkTypeLabel(type?: string | null): string {
  if (type === "fast") return "Быстрая";
  if (type === "detail" || !type) return "Подробная";
  return type;
}

function CountryFlag({ src, label }: { src?: string; label: string }) {
  if (!src) return null;
  return (
    <img
      src={src}
      alt={label}
      className="h-4 w-6 rounded-[3px] border border-white/10 object-cover"
      loading="lazy"
    />
  );
}

function serverFlagUrl(country: string): string | undefined {
  const normalized = country?.trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "localhost" || normalized.length !== 2) {
    return undefined;
  }
  return `/flags/${normalized}.svg`;
}

function ExpandButton({
  expanded,
  hiddenCount,
  onClick,
}: {
  expanded: boolean;
  hiddenCount: number;
  onClick: () => void;
}) {
  const Icon = expanded ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      className="mt-3 inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-foreground transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      onClick={onClick}
    >
      <Icon className="h-3.5 w-3.5" />
      {expanded ? "Свернуть" : `Показать еще ${hiddenCount}`}
    </button>
  );
}

function ExpandablePillList({
  items,
  emptyLabel,
  initialCount = 18,
}: {
  items: string[];
  emptyLabel: string;
  initialCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasItems = items.length > 0;
  const visibleItems = hasItems ? (expanded ? items : items.slice(0, initialCount)) : [emptyLabel];
  const hiddenCount = Math.max(0, items.length - initialCount);

  return (
    <div>
      <div className="mt-2 flex max-h-52 flex-wrap gap-2 overflow-hidden data-[expanded=true]:max-h-none" data-expanded={expanded}>
        {visibleItems.map((item) => (
          <span
            key={item}
            className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-xs text-foreground/80"
          >
            {item}
          </span>
        ))}
      </div>
      {hiddenCount > 0 ? (
        <ExpandButton expanded={expanded} hiddenCount={hiddenCount} onClick={() => setExpanded((value) => !value)} />
      ) : null}
    </div>
  );
}

function ExpandableServerGeoList({ items, initialCount = 6 }: { items: ServerGeoItem[]; initialCount?: number }) {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = Math.max(0, items.length - initialCount);

  return (
    <div className="space-y-3">
      {visibleItems.map((item, index) => {
        const countryLabel = countryCodeToDisplayName(item.country);
        return (
          <div key={`${item.domain}-${item.ip}-${index}`} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <code className="min-w-0 truncate font-mono text-foreground/80">{item.domain}</code>
              <span className="inline-flex shrink-0 items-center gap-2 text-muted-foreground">
                <CountryFlag src={serverFlagUrl(item.country)} label={countryLabel} />
                {countryLabel}
              </span>
            </div>
            <p className="mt-2 font-mono text-muted-foreground">{item.ip}</p>
          </div>
        );
      })}
      {hiddenCount > 0 ? (
        <ExpandButton expanded={expanded} hiddenCount={hiddenCount} onClick={() => setExpanded((value) => !value)} />
      ) : null}
    </div>
  );
}

function ImageLightbox({
  imageId,
  alt,
  onClose,
}: {
  imageId: string;
  alt: string;
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
            alt={alt}
            className="mx-auto max-h-[82vh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function LoadingResultState() {
  return (
    <DashboardPage>
      <div className="flex min-h-[58vh] items-center justify-center">
        <DashboardCard className="flex flex-col items-center px-10 py-8 text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
          <p className="mt-4 text-sm text-muted-foreground">Загрузка отчета...</p>
        </DashboardCard>
      </div>
    </DashboardPage>
  );
}

function EmptyResultState() {
  return (
    <DashboardPage>
      <div className="flex min-h-[58vh] items-center justify-center">
        <DashboardCard className="flex max-w-md flex-col items-center py-10 text-center">
          <DashboardIcon icon={FileText} size="lg" />
          <p className="mt-5 text-lg font-semibold text-foreground">Результатов пока нет</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Запустите первую проверку, и здесь откроется последний отчет.
          </p>
          <Link className="premium-cta mt-6 inline-flex h-10 items-center justify-center px-5 text-sm font-semibold" href="/">
            Перейти к проверке
          </Link>
        </DashboardCard>
      </div>
    </DashboardPage>
  );
}

function EmptyBackendResults({ url }: { url: string }) {
  return (
    <DashboardPage>
      <div className="flex min-h-[58vh] items-center justify-center">
        <DashboardCard className="report-glow report-glow-warning flex max-w-md flex-col items-center py-10 text-center">
          <DashboardIcon icon={AlertTriangle} tone="warning" size="lg" />
          <p className="mt-5 text-lg font-semibold text-foreground">Проверка не вернула результатов</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Бэкенд завершил проверку {url}, но не передал список проверок для отчета.
          </p>
          <Link className="premium-cta mt-6 inline-flex h-10 items-center justify-center px-5 text-sm font-semibold" href="/">
            Запустить новую проверку
          </Link>
        </DashboardCard>
      </div>
    </DashboardPage>
  );
}

function ErrorResultState({ message }: { message: string }) {
  return (
    <DashboardPage>
      <div className="flex min-h-[58vh] items-center justify-center">
        <DashboardCard className="report-glow report-glow-danger flex max-w-md flex-col items-center py-10 text-center">
          <DashboardIcon icon={XCircle} tone="danger" size="lg" />
          <p className="mt-5 text-lg font-semibold text-foreground">Не удалось открыть результат</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
        </DashboardCard>
      </div>
    </DashboardPage>
  );
}

export default function ResultView() {
  const searchParams = useSearchParams();
  const reqId = searchParams.get("reqId");
  const [task, setTask] = useState<TaskState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setTask(null);
      setLoading(true);
      setError(null);

      try {
        if (reqId) {
          const current = await getProgress(reqId);
          if (cancelled) return;
          setTask(current);
          if (current.status === "completed" || current.progress >= 100) {
            saveLastResult(current);
          }
          return;
        }

        const stored = getStoredLastResult();
        if (stored?.completedTask) {
          setTask(stored.completedTask);
          return;
        }

        setTask(null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить результат");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [reqId]);

  const result = useMemo(() => (task ? taskToCheckResult(task) : null), [task]);
  const detailItems = useMemo(() => result?.checks || [], [result]);

  if (loading) return <LoadingResultState />;
  if (error) return <ErrorResultState message={error} />;
  if (!task || !result) return <EmptyResultState />;
  if (!task.results || task.results.length === 0) return <EmptyBackendResults url={task.url} />;

  const statusMeta = STATUS_META[result.overallStatus] || STATUS_META.non_compliant;
  const StatusIcon = statusMeta.icon;
  const isFull = result.scanProfile.detail_level === "full";

  return (
    <DashboardPage>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BackButton />
        {result.scanProfile.pdf_enabled && result.reportId ? <PdfDownloadButton result={result} /> : null}
      </div>

      {result.scanProfile.screenshots_enabled ? <DashboardPanel className="mb-6">
        <div className="min-w-0">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <DashboardIcon icon={ImageIcon} size="sm" />
              <div>
                <p className="text-sm font-semibold text-foreground">Скриншот сайта</p>
                <p className="mt-1 text-xs text-muted-foreground">Доказательство из верхнего изображения отчета обработчика</p>
              </div>
            </div>
            {result.screenshotId ? (
              <button
                type="button"
                className="block max-h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                onClick={() => setActiveImage(result.screenshotId || null)}
              >
                <img
                  src={imageUrl(result.screenshotId)}
                  alt="Скриншот проверенного сайта"
                  className="h-full max-h-[420px] w-full object-contain"
                />
              </button>
            ) : (
              <DashboardCard className="flex min-h-44 items-center justify-center text-center">
                <div>
                  <p className="text-sm font-semibold text-foreground">Скриншот не передан</p>
                  <p className="mt-2 text-sm text-muted-foreground">Отчет доступен без верхнего изображения сайта.</p>
                </div>
              </DashboardCard>
            )}
          </div>
        </div>
      </DashboardPanel> : (
        <DashboardPanel className="mb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <DashboardIcon icon={LockKeyhole} />
              <div>
                <p className="font-semibold text-foreground">Визуальные доказательства и PDF доступны в Paid</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Бесплатная проверка показывает статусы и краткие выводы. Скриншоты, затронутые URL и полный PDF создаются только для нового paid-скана.
                </p>
              </div>
            </div>
            <Link className="premium-cta inline-flex h-10 shrink-0 items-center justify-center px-5 text-sm font-semibold" href="/pricing">
              Сравнить тарифы
            </Link>
          </div>
        </DashboardPanel>
      )}

      <DashboardHeader
        eyebrow="Отчет о соответствии"
        title={isFull ? "Полный отчет о проверке сайта" : "Краткий отчет о проверке сайта"}
        description={isFull
          ? "Сводка рисков, возможных штрафов и технических доказательств по результатам проверки."
          : "Сводка рисков, возможных штрафов и коротких выводов без скрытых технических доказательств."}
      />

      <div className="space-y-6">
        <DashboardPanel>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <DashboardStatusPill>Тип: {checkTypeLabel(task.type)}</DashboardStatusPill>
                <DashboardStatusPill>{isFull ? "Полный отчет" : "Краткий free-отчет"}</DashboardStatusPill>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch">
                <DashboardCard className="min-w-0">
                  <p className="text-xs uppercase text-muted-foreground">Проверенный сайт</p>
                  <p className="mt-2 truncate font-mono text-sm font-medium text-foreground">{result.url}</p>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <DashboardIcon icon={Clock} size="sm" />
                    <span>{result.checkedAt}</span>
                  </div>
                </DashboardCard>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <DashboardCard className="min-w-0">
                  <p className="text-xs uppercase text-muted-foreground">Идентификатор отчета</p>
                  <p className="mt-2 truncate font-mono text-xs text-foreground/80">{result.reportId || "Не сохранен"}</p>
                </DashboardCard>
                <DashboardCard>
                  <p className="text-xs uppercase text-muted-foreground">Тип проверки</p>
                  <p className="mt-2 font-mono text-xs text-foreground/80">{checkTypeLabel(task.type)}</p>
                </DashboardCard>
              </div>

              <DashboardCard className="mt-4">
                <p className="text-sm font-semibold text-foreground">Описание от бэкенда</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{result.siteAiDescription}</p>
              </DashboardCard>
            </div>

            <DashboardCard className={`report-glow ${statusMeta.glow}`}>
              <div className="flex items-start justify-between gap-4">
                <DashboardIcon icon={StatusIcon} tone={statusMeta.tone} />
                <DashboardStatusPill tone={statusMeta.tone}>{statusMeta.label}</DashboardStatusPill>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase text-muted-foreground">Ключевой вывод</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{statusMeta.summary}</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{result.failedCount}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">нарушения</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{result.warningCount}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">предупреждения</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{result.passedCount}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">пройдено</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </DashboardPanel>

        <div className="grid gap-6 lg:grid-cols-4">
          <CompletionScoreBar score={result.complianceScore} />

          <DashboardCard>
            <div className="flex items-start justify-between gap-4">
              <DashboardIcon icon={Banknote} tone={result.maxFineIndividual > 0 ? "warning" : "neutral"} />
              <DashboardStatusPill tone={result.maxFineIndividual > 0 ? "warning" : "neutral"}>Физическое лицо</DashboardStatusPill>
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase text-muted-foreground">Возможный штраф</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {result.maxFineIndividual === 0 ? "—" : `${result.maxFineIndividual.toLocaleString("ru-RU")} ₽`}
              </p>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">первичная оценка возможного максимума, не юридическое заключение</p>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-start justify-between gap-4">
              <DashboardIcon icon={Scale} tone={result.maxFineLegalEntity > 0 ? "warning" : "neutral"} />
              <DashboardStatusPill tone={result.maxFineLegalEntity > 0 ? "warning" : "neutral"}>Юридическое лицо</DashboardStatusPill>
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase text-muted-foreground">Возможный штраф</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {result.maxFineLegalEntity === 0 ? "—" : `${result.maxFineLegalEntity.toLocaleString("ru-RU")} ₽`}
              </p>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">нарушение = 100%, предупреждение = 50%, пройденная проверка не добавляет сумму</p>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-start justify-between gap-4">
              <DashboardIcon icon={Scale} />
              <DashboardStatusPill>Статистика</DashboardStatusPill>
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Пройдено</span>
                <span className="font-semibold text-foreground">{result.passedCount}/{result.totalCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-muted-foreground">Предупреждения</span>
                <span className="font-semibold text-foreground">{result.warningCount}/{result.totalCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
                <span className="text-muted-foreground">Провалено</span>
                <span className="font-semibold text-foreground">{result.failedCount}/{result.totalCount}</span>
              </div>
            </div>
          </DashboardCard>
        </div>

        {isFull ? <DashboardPanel>
          <DashboardSectionTitle
            icon={Server}
            title="Технические доказательства"
            description="Инфраструктурные данные отчета сгруппированы отдельно, чтобы не смешивать краткую сводку и технические признаки."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <DashboardCard>
              <div className="mb-5 flex items-center gap-3">
                <DashboardIcon icon={Server} />
                <p className="text-sm font-semibold text-foreground">Информация о сайте</p>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Домены и IP</span>
                  <ExpandablePillList items={result.siteIps} emptyLabel="Не определено" />
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <span className="text-muted-foreground">Гео</span>
                  <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <CountryFlag src={result.siteCountryFlag} label={result.siteCountry} />
                    {result.siteCountry}
                  </span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="mb-5 flex items-center gap-3">
                <DashboardIcon icon={Server} />
                <p className="text-sm font-semibold text-foreground">География серверов</p>
              </div>
              {result.serverGeo.length > 0 ? (
                <ExpandableServerGeoList items={result.serverGeo} />
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">Обработчик не передал список `ips.data.services`.</p>
              )}
            </DashboardCard>

            <DashboardCard className={result.sslIsExpired ? "report-glow report-glow-danger" : ""}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <DashboardIcon icon={ShieldAlert} tone={result.sslIsExpired ? "danger" : "neutral"} />
                  <p className="text-sm font-semibold text-foreground">Данные SSL</p>
                </div>
                <DashboardStatusPill tone={result.sslIsExpired ? "danger" : "neutral"}>
                  {result.sslIsExpired ? "Истек или есть проблемы" : result.sslIssuer === "Не определено" ? "Не передан бэкендом" : "Действует"}
                </DashboardStatusPill>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Издатель</span>
                  <span className="text-right font-medium text-foreground">{result.sslIssuer}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <span className="text-muted-foreground">Протокол</span>
                  <span className="text-right font-medium text-foreground">{result.sslProtocol}</span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground">Имя субъекта</p>
                  <p className="mt-1 break-all font-mono text-xs text-foreground/80">{result.sslSubjectName}</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground">Альтернативные имена субъекта</p>
                  <p className="mt-1 break-all font-mono text-xs text-foreground/80">
                    {result.sslSubjectAlternativeNames.length > 0 ? result.sslSubjectAlternativeNames.join(", ") : "Не определено"}
                  </p>
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Действует с</p>
                    <p className="mt-1 font-mono text-xs text-foreground/80">{result.sslValidFrom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Действует до</p>
                    <p className="mt-1 font-mono text-xs text-foreground/80">{result.sslValidTo}</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </DashboardPanel> : null}

        {detailItems.length > 0 ? <DashboardPanel>
          <DashboardSectionTitle
            icon={FileText}
            title={isFull ? "Детальная проверка" : "Краткие карточки категорий"}
            description={isFull
              ? "Каждый блок ниже построен из данных бэкенда и отсортирован по приоритету: нарушения, предупреждения, затем пройденные проверки."
              : "Free-результат показывает статус и короткий вывод; URL, инфраструктура, правовые пояснения и evidence не сохраняются."}
          />
          <div className="space-y-4">
            {detailItems.map((item) => (
              <ExpandedCheckCard key={item.label} item={item} compact={!isFull} />
            ))}
          </div>
        </DashboardPanel> : null}
      </div>

      {activeImage ? (
        <ImageLightbox imageId={activeImage} alt="Скриншот-доказательство" onClose={() => setActiveImage(null)} />
      ) : null}
    </DashboardPage>
  );
}
