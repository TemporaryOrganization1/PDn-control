"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  Server,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExpandedCheckCard } from "@/components/expanded-check-card";
import { PdfDownloadButton } from "@/components/download-pdf-button";
import { BackButton } from "@/components/back-button";
import { getProgress, type TaskState } from "@/lib/api";
import { taskToCheckResult } from "@/lib/result-adapter";
import { getStoredLastResult, saveLastResult } from "@/lib/result-storage";

const STATUS_META: Record<
  string,
  { icon: typeof ShieldAlert; color: string; label: string }
> = {
  compliant: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    label: "Все отлично",
  },
  partial: {
    icon: AlertTriangle,
    color: "text-amber-500",
    label: "Есть предупреждения",
  },
  non_compliant: {
    icon: XCircle,
    color: "text-red-500",
    label: "Есть нарушения",
  },
};

function RiskScoreBar({ score }: { score: number }) {
  const hue = Math.round((1 - score / 100) * 120);
  const barColor = `hsl(${hue}, 80%, 45%)`;
  const textColor = `hsl(${hue}, 80%, 55%)`;

  return (
    <div className="border border-border p-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ShieldAlert className="h-4 w-4 text-primary" />
        Риск-скоринг
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold" style={{ color: textColor }}>
          {score}%
        </span>
        <span className="text-xs text-muted-foreground">вероятность штрафа</span>
      </div>
      <div className="mt-3 h-2 w-full bg-secondary">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${score}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function EmptyResultState() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
      <div className="max-w-md border border-border bg-card p-8 text-center">
        <FileText className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">Результатов пока нет</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Запустите первую проверку, и здесь откроется последний отчет.
        </p>
        <Link className="mt-5 inline-flex border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary" href="/">
          Перейти к проверке
        </Link>
      </div>
    </div>
  );
}

function EmptyBackendResults({ url }: { url: string }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
      <div className="max-w-md border border-border bg-card p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h1 className="text-xl font-semibold">Проверка не вернула результатов</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Backend завершил проверку {url}, но не передал список проверок для отчета.
        </p>
        <Link className="mt-5 inline-flex border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary" href="/">
          Запустить новую проверку
        </Link>
      </div>
    </div>
  );
}

export default function ResultView() {
  const searchParams = useSearchParams();
  const reqId = searchParams.get("reqId");
  const [task, setTask] = useState<TaskState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Загрузка отчета...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
        <div className="max-w-md border border-red-500/20 bg-red-500/5 p-8 text-center">
          <XCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-semibold">Не удалось открыть результат</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!task || !result) return <EmptyResultState />;
  if (!task.results || task.results.length === 0) return <EmptyBackendResults url={task.url} />;

  const StatusIcon = STATUS_META[result.overallStatus]?.icon || STATUS_META.non_compliant.icon;
  const statusColor = STATUS_META[result.overallStatus]?.color || STATUS_META.non_compliant.color;
  const statusLabel = STATUS_META[result.overallStatus]?.label || STATUS_META.non_compliant.label;

  return (
    <div className="flex flex-col">
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-4 sm:px-10 lg:grid-cols-12">
          <div className="flex items-center justify-between lg:col-span-10 lg:col-start-2">
            <BackButton />
            <Badge variant="outline" className="border-primary/20 text-[10px] uppercase tracking-wider text-primary">
              {result.checkType === "free" ? "Бесплатно" : "Платно"}
            </Badge>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-4 sm:px-10 lg:grid-cols-12">
          <div className="flex items-center gap-3 lg:col-span-10 lg:col-start-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Проверенный сайт</p>
              <p className="truncate font-mono text-sm font-medium text-foreground">
                {result.url}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {result.checkedAt}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 gap-6 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Отчет о проверке
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Результат анализа сайта на соответствие требованиям законодательства о ПДн
            </p>
            <div className="mt-4">
              <span className={`inline-flex items-center gap-1.5 border px-3 py-1 text-xs font-semibold ${statusColor} border-current/20 bg-current/5`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {statusLabel}
              </span>
            </div>
            <div className="mt-6 border border-border p-6">
              <p className="text-sm font-medium">Описание от backend</p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                {result.siteAiDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 gap-6 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="border border-border p-6 lg:col-span-5 lg:col-start-2">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Server className="h-4 w-4 text-primary" />
              Информация о сайте
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-foreground/80">Домены и IP:</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(result.siteIps.length > 0 ? result.siteIps : ["Не определено"]).map((ip) => (
                    <span
                      key={ip}
                      className="border border-border/50 bg-background/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground/80"
                    >
                      {ip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-border p-6 lg:col-span-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <ShieldAlert className="h-4 w-4 text-primary" />
              Данные SSL
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground/80">Издатель:</span>
                <span className="font-medium">{result.sslIssuer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/80">Статус:</span>
                <span className={result.sslIsExpired ? "text-red-500" : "text-muted-foreground"}>
                  {result.sslIsExpired ? "Есть проблемы" : "Не передан backend"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 gap-6 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-4 lg:col-start-2">
            <RiskScoreBar score={result.riskScore} />
          </div>
          <div className="border border-border p-6 lg:col-span-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Banknote className="h-4 w-4 text-primary" />
              Максимальный штраф
            </div>
            <div className="mt-4 space-y-3">
              <p className="text-lg font-bold text-foreground">
                {result.maxFineLegalEntity === 0 ? "—" : `${result.maxFineLegalEntity.toLocaleString("ru-RU")} ₽`}
              </p>
              <p className="text-xs text-muted-foreground">
                Для физлица: {result.maxFineIndividual === 0 ? "—" : `${result.maxFineIndividual.toLocaleString("ru-RU")} ₽`}
              </p>
            </div>
          </div>
          <div className="border border-border p-6 lg:col-span-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Scale className="h-4 w-4 text-primary" />
              Статистика проверок
            </div>
            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-foreground/80">Пройдено</span>
                <span className="font-semibold text-emerald-500">{result.passedCount}/{result.totalCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/80">Предупреждения</span>
                <span className="font-semibold text-amber-500">{result.warningCount}/{result.totalCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground/80">Провалено</span>
                <span className="font-semibold text-red-500">{result.failedCount}/{result.totalCount}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <h2 className="mb-1 text-base font-semibold">Детальная проверка</h2>
            <p className="mb-6 text-xs text-muted-foreground">
              Каждый аспект построен из результатов, которые вернул backend.
            </p>
            <div className="space-y-4">
              {detailItems.map((item) => (
                <ExpandedCheckCard key={item.label} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full bg-card">
        <div className="grid grid-cols-1 px-6 py-8 sm:px-10 lg:grid-cols-12">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between lg:col-span-10 lg:col-start-2">
            <PdfDownloadButton result={result} />
          </div>
        </div>
      </section>
    </div>
  );
}
