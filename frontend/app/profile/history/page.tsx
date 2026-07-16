"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  ListFilter,
  Trash2,
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
import {
  deleteReport,
  downloadReport,
  getReports,
  type CheckHistoryItem,
} from "@/lib/api";
import { historyItemToTask } from "@/lib/result-adapter";
import { saveLastResult } from "@/lib/result-storage";

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
  const labels: Record<string, string> = {
    queued: "В очереди",
    dispatched: "Передано обработчику",
    starting: "Запускается",
    data_collection: "Сбор данных",
    pending: "В ожидании",
    running: "В работе",
  };
  return {
    label: labels[status] || "В работе",
    tone: "warning",
    icon: AlertTriangle,
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

function checkTypeLabel(type?: string | null): string {
  if (type === "fast") return "Быстрая";
  if (type === "detail" || !type) return "Подробная";
  return type;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<CheckHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReports()
      .then((items) => {
        if (cancelled) return;
        const uniqueItems = Array.from(
          new Map(
            items.map((item) => [
              item.req_id || item.report_id || item.id,
              item,
            ]),
          ).values(),
        );
        setHistory(uniqueItems);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Не удалось загрузить историю",
          );
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
      toast.error(
        downloadError instanceof Error
          ? downloadError.message
          : "Не удалось скачать PDF",
      );
    }
  };

  const handleOpenReport = (item: CheckHistoryItem) => {
    saveLastResult(historyItemToTask(item));
    router.push("/result");
  };

  const handleDeleteReport = async (item: CheckHistoryItem) => {
    if (!item.report_id) {
      toast.error("У этого отчета нет идентификатора PDF-отчета для удаления");
      return;
    }
    const confirmed = window.confirm(
      "Удалить отчет из истории? PDF и связанные изображения будут удалены бэкендом.",
    );
    if (!confirmed) return;

    setDeletingReportId(item.report_id);
    try {
      await deleteReport(item.report_id);
      setHistory(
        (current) =>
          current?.filter(
            (entry) =>
              entry.report_id !== item.report_id && entry.id !== item.id,
          ) ?? null,
      );
      toast.success("Отчет удален");
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error
          ? deleteError.message
          : "Не удалось удалить отчет",
      );
    } finally {
      setDeletingReportId(null);
    }
  };

  return (
    <AuthGuard>
      <DashboardPage>
        <div className="mb-6">
          <BackButton href="/profile" />
        </div>
        <DashboardHeader
          eyebrow="Архив отчетов"
          title="История проверок"
          description="Free-проверки хранятся 7 дней; PDF и изображения доступны только у сканов, запущенных во время Paid."
        />

        <DashboardPanel>
          <DashboardSectionTitle
            icon={ListFilter}
            title="Сводка архива"
            description="Статусы показаны текстом и мягкой подсветкой, без цветных панельных меток."
          />

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <DashboardCard>
              <p className="text-xs uppercase text-muted-foreground">
                Всего отчетов
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {history === null && !error ? "..." : summary.total}
              </p>
            </DashboardCard>
            <DashboardCard>
              <DashboardStatusPill tone="success">
                Завершено
              </DashboardStatusPill>
              <p className="mt-4 text-2xl font-semibold text-foreground">
                {summary.completed}
              </p>
            </DashboardCard>
            <DashboardCard>
              <DashboardStatusPill tone="danger">Ошибки</DashboardStatusPill>
              <p className="mt-4 text-2xl font-semibold text-foreground">
                {summary.failed}
              </p>
            </DashboardCard>
          </div>

          {history === null && !error ? (
            <DashboardCard>
              <p className="text-sm text-muted-foreground">
                Загрузка истории проверок...
              </p>
            </DashboardCard>
          ) : error ? (
            <DashboardCard className="report-glow report-glow-danger">
              <div className="flex items-start gap-4">
                <DashboardIcon icon={AlertTriangle} tone="danger" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Не удалось загрузить историю
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {error}
                  </p>
                </div>
              </div>
            </DashboardCard>
          ) : history === null || history.length === 0 ? (
            <DashboardCard className="flex flex-col items-center py-12 text-center">
              <DashboardIcon icon={FileText} size="lg" />
              <p className="mt-5 text-sm font-semibold text-foreground">
                История пока пустая
              </p>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Запустите проверку после входа в аккаунт, и отчет появится в
                этом архиве.
              </p>
            </DashboardCard>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const meta = statusMeta(item.status);
                const checksTotal = item.results?.length ?? 0;
                const issuesTotal =
                  item.results?.filter(
                    (result) =>
                      result.result === "fail" || result.result === "warn",
                  ).length ?? 0;

                return (
                  <DashboardCard key={item.id} className="p-4">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <DashboardIcon
                            icon={meta.icon}
                            tone={meta.tone}
                            size="sm"
                          />
                          <p className="min-w-0 truncate font-mono text-sm text-foreground">
                            {item.url}
                          </p>
                          <DashboardStatusPill tone={meta.tone}>
                            {meta.label}
                          </DashboardStatusPill>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                          <span>{formatDate(item.created_at)}</span>
                          <span>Тип: {checkTypeLabel(item.check_type)}</span>
                          <span>Проверок: {checksTotal}</span>
                          <span>Риск-сигналы: {issuesTotal}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-foreground transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          onClick={() => handleOpenReport(item)}
                        >
                          <Eye className="h-4 w-4" />
                          Открыть
                        </button>
                        {item.scan_profile?.pdf_enabled && item.report_id ? (
                          <button
                            type="button"
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-foreground transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-55"
                            onClick={() => handleDownloadPDF(item.report_id)}
                          >
                            <Download className="h-4 w-4" />
                            PDF отчет
                          </button>
                        ) : (
                          <span className="inline-flex h-10 items-center rounded-2xl border border-white/10 bg-white/[0.025] px-4 text-xs text-muted-foreground">
                            Краткий отчет без PDF
                          </span>
                        )}
                        <button
                          type="button"
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] px-4 text-xs font-semibold text-foreground transition hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={
                            !item.report_id ||
                            deletingReportId === item.report_id
                          }
                          onClick={() => handleDeleteReport(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingReportId === item.report_id
                            ? "Удаляем..."
                            : "Удалить"}
                        </button>
                      </div>
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
