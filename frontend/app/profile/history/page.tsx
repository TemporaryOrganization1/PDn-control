"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileText,
  ListFilter,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AuthGuard } from "@/components/auth-guard";
import { BackButton } from "@/components/back-button";
import {
  DashboardCard,
  DashboardHeader,
  DashboardIcon,
  DashboardPage,
  DashboardPanel,
  DashboardSectionTitle,
  DashboardStatusPill,
} from "@/components/profile-dashboard";
import { downloadReport, getReports, type CheckHistoryItem } from "@/lib/api";

type StatusTone = "neutral" | "success" | "warning" | "danger";

function statusMeta(status: string): {
  label: string;
  tone: StatusTone;
  icon: LucideIcon;
} {
  if (status === "completed") {
    return { label: "Завершено", tone: "success", icon: CheckCircle2 };
  }
  if (status === "failed") {
    return { label: "Ошибка", tone: "danger", icon: XCircle };
  }
  return { label: status || "В работе", tone: "warning", icon: AlertTriangle };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

export default function HistoryPage() {
  const [history, setHistory] = useState<CheckHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReports()
      .then((items) => {
        if (cancelled) return;
        const uniqueItems = Array.from(
          new Map(
            items
              .filter((item) => item.report_id)
              .map((item) => [item.req_id || item.report_id, item])
          ).values()
        );
        setHistory(uniqueItems);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить историю");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const items = history || [];
    return {
      total: items.length,
      completed: items.filter((item) => item.status === "completed").length,
      failed: items.filter((item) => item.status === "failed").length,
    };
  }, [history]);

  const handleDownloadPDF = async (reportId?: string) => {
    if (!reportId) {
      toast.error("PDF для этой проверки пока недоступен");
      return;
    }

    try {
      await downloadReport(reportId);
      toast.success("PDF отчет скачивается");
    } catch (downloadError) {
      toast.error(downloadError instanceof Error ? downloadError.message : "Не удалось скачать PDF");
    }
  };

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton />
        </div>
        <DashboardHeader
          eyebrow="Reports archive"
          title="История проверок"
          description="Архив завершенных отчетов с датой, статусом, краткой сводкой риска и быстрым скачиванием PDF."
        />

        <DashboardPanel>
          <DashboardSectionTitle
            icon={ListFilter}
            title="Сводка архива"
            description="Статусы показаны текстом и мягкой подсветкой, без цветных dashboard-бейджей."
          />

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <DashboardCard>
              <p className="text-xs uppercase text-muted-foreground">Всего отчетов</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {history === null && !error ? "..." : summary.total}
              </p>
            </DashboardCard>
            <DashboardCard>
              <DashboardStatusPill tone="success">Завершено</DashboardStatusPill>
              <p className="mt-4 text-2xl font-semibold text-foreground">{summary.completed}</p>
            </DashboardCard>
            <DashboardCard>
              <DashboardStatusPill tone="danger">Ошибки</DashboardStatusPill>
              <p className="mt-4 text-2xl font-semibold text-foreground">{summary.failed}</p>
            </DashboardCard>
          </div>

          {history === null && !error ? (
            <DashboardCard>
              <p className="text-sm text-muted-foreground">Загрузка истории проверок...</p>
            </DashboardCard>
          ) : error ? (
            <DashboardCard className="report-glow report-glow-danger">
              <div className="flex items-start gap-4">
                <DashboardIcon icon={AlertTriangle} tone="danger" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Не удалось загрузить историю</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
                </div>
              </div>
            </DashboardCard>
          ) : history === null || history.length === 0 ? (
            <DashboardCard className="flex flex-col items-center py-12 text-center">
              <DashboardIcon icon={FileText} size="lg" />
              <p className="mt-5 text-sm font-semibold text-foreground">История пока пустая</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Запустите проверку после входа в аккаунт, и отчет появится в этом архиве.
              </p>
            </DashboardCard>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const meta = statusMeta(item.status);
                const checksTotal = item.results?.length ?? 0;
                const issuesTotal =
                  item.results?.filter((result) => result.result === "fail" || result.result === "warn").length ?? 0;

                return (
                  <DashboardCard key={item.id} className="p-4">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <DashboardIcon icon={meta.icon} tone={meta.tone} size="sm" />
                          <p className="min-w-0 truncate font-mono text-sm text-foreground">{item.url}</p>
                          <DashboardStatusPill tone={meta.tone}>{meta.label}</DashboardStatusPill>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span>{formatDate(item.created_at)}</span>
                          <span>Тип: {item.check_type || "detail"}</span>
                          <span>Проверок: {checksTotal}</span>
                          <span>Риск-сигналы: {issuesTotal}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-foreground transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-55"
                        disabled={!item.report_id}
                        onClick={() => handleDownloadPDF(item.report_id)}
                      >
                        <Download className="h-4 w-4" />
                        PDF отчет
                      </button>
                    </div>
                  </DashboardCard>
                );
              })}
            </div>
          )}
        </DashboardPanel>
      </DashboardPage>
    </AuthGuard>
  );
}
