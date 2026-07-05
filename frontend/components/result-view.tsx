"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
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
    summary: "Проверка не выявила существенных рисков по переданным backend данным.",
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

function riskMeta(score: number): { tone: Tone; glow: string; label: string } {
  if (score >= 60) return { tone: "danger", glow: "report-glow-danger", label: "Высокий риск" };
  if (score > 0) return { tone: "warning", glow: "report-glow-warning", label: "Есть риск" };
  return { tone: "success", glow: "report-glow-success", label: "Низкий риск" };
}

function RiskScoreBar({ score }: { score: number }) {
  const meta = riskMeta(score);

  return (
    <DashboardCard className={`report-glow ${meta.glow}`}>
      <div className="flex items-start justify-between gap-4">
        <DashboardIcon icon={ShieldAlert} tone={meta.tone} />
        <DashboardStatusPill tone={meta.tone}>{meta.label}</DashboardStatusPill>
      </div>
      <div className="mt-6">
        <p className="text-xs uppercase text-muted-foreground">Risk score</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-foreground">{score}%</span>
          <span className="text-xs text-muted-foreground">вероятность штрафа</span>
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
            Backend завершил проверку {url}, но не передал список проверок для отчета.
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

  if (loading) return <LoadingResultState />;
  if (error) return <ErrorResultState message={error} />;
  if (!task || !result) return <EmptyResultState />;
  if (!task.results || task.results.length === 0) return <EmptyBackendResults url={task.url} />;

  const statusMeta = STATUS_META[result.overallStatus] || STATUS_META.non_compliant;
  const StatusIcon = statusMeta.icon;

  return (
    <DashboardPage>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BackButton />
        <PdfDownloadButton result={result} />
      </div>

      <DashboardHeader
        eyebrow="Enterprise compliance report"
        title="Отчет о проверке сайта"
        description="Сводка рисков, возможных штрафов и технического evidence по результатам backend-проверки."
      />

      <div className="space-y-6">
        <DashboardPanel>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <DashboardStatusPill>
                  {result.checkType === "free" ? "Бесплатная проверка" : "Платная проверка"}
                </DashboardStatusPill>
                <DashboardStatusPill>Report evidence</DashboardStatusPill>
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

              <DashboardCard className="mt-4">
                <p className="text-sm font-semibold text-foreground">Описание от backend</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{result.siteAiDescription}</p>
              </DashboardCard>
            </div>

            <DashboardCard className={`report-glow ${statusMeta.glow}`}>
              <div className="flex items-start justify-between gap-4">
                <DashboardIcon icon={StatusIcon} tone={statusMeta.tone} />
                <DashboardStatusPill tone={statusMeta.tone}>{statusMeta.label}</DashboardStatusPill>
              </div>
              <div className="mt-6">
                <p className="text-xs uppercase text-muted-foreground">Key finding</p>
                <p className="mt-2 text-lg font-semibold leading-7 text-foreground">{statusMeta.summary}</p>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{result.failedCount}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">failed</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{result.warningCount}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">warning</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3 text-center">
                  <p className="text-xl font-semibold text-foreground">{result.passedCount}</p>
                  <p className="mt-1 text-[10px] uppercase text-muted-foreground">passed</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </DashboardPanel>

        <div className="grid gap-6 lg:grid-cols-3">
          <RiskScoreBar score={result.riskScore} />

          <DashboardCard>
            <div className="flex items-start justify-between gap-4">
              <DashboardIcon icon={Banknote} tone={result.maxFineLegalEntity > 0 ? "warning" : "neutral"} />
              <DashboardStatusPill tone={result.maxFineLegalEntity > 0 ? "warning" : "neutral"}>
                Возможный штраф
              </DashboardStatusPill>
            </div>
            <div className="mt-6">
              <p className="text-xs uppercase text-muted-foreground">Юридическое лицо</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {result.maxFineLegalEntity === 0 ? "—" : `${result.maxFineLegalEntity.toLocaleString("ru-RU")} ₽`}
              </p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Для физлица:{" "}
                {result.maxFineIndividual === 0 ? "—" : `${result.maxFineIndividual.toLocaleString("ru-RU")} ₽`}
              </p>
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

        <DashboardPanel>
          <DashboardSectionTitle
            icon={Server}
            title="Техническое evidence"
            description="Инфраструктурные данные отчета сгруппированы отдельно, чтобы не смешивать executive summary и технические признаки."
          />
          <div className="grid gap-5 lg:grid-cols-2">
            <DashboardCard>
              <div className="mb-5 flex items-center gap-3">
                <DashboardIcon icon={Server} />
                <p className="text-sm font-semibold text-foreground">Информация о сайте</p>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Домены и IP</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(result.siteIps.length > 0 ? result.siteIps : ["Не определено"]).map((ip) => (
                      <span
                        key={ip}
                        className="rounded-xl border border-white/10 bg-black/20 px-2.5 py-1 font-mono text-xs text-foreground/80"
                      >
                        {ip}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <span className="text-muted-foreground">Гео</span>
                  <span className="font-medium text-foreground">
                    {result.siteCountryFlag} {result.siteCountry}
                  </span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard className={result.sslIsExpired ? "report-glow report-glow-danger" : ""}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <DashboardIcon icon={ShieldAlert} tone={result.sslIsExpired ? "danger" : "neutral"} />
                  <p className="text-sm font-semibold text-foreground">Данные SSL</p>
                </div>
                <DashboardStatusPill tone={result.sslIsExpired ? "danger" : "neutral"}>
                  {result.sslIsExpired ? "Есть проблемы" : "Не передан backend"}
                </DashboardStatusPill>
              </div>
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Издатель</span>
                  <span className="text-right font-medium text-foreground">{result.sslIssuer}</span>
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Valid from</p>
                    <p className="mt-1 font-mono text-xs text-foreground/80">{result.sslValidFrom}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valid to</p>
                    <p className="mt-1 font-mono text-xs text-foreground/80">{result.sslValidTo}</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardSectionTitle
            icon={FileText}
            title="Детальная проверка"
            description="Каждый блок ниже построен из данных backend и отсортирован по приоритету: нарушения, предупреждения, затем пройденные проверки."
          />
          <div className="space-y-4">
            {detailItems.map((item) => (
              <ExpandedCheckCard key={item.label} item={item} />
            ))}
          </div>
        </DashboardPanel>
      </div>
    </DashboardPage>
  );
}
