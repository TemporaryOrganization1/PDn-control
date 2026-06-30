"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, FileText, XCircle } from "lucide-react";
import { toast } from "sonner";
import { BackButton } from "@/components/back-button";
import { getReports, downloadReport, type CheckHistoryItem } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  if (status === "failed") return <XCircle className="h-5 w-5 text-red-500" />;
  return <AlertTriangle className="h-5 w-5 text-amber-500" />;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}

export default function HistoryPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const [history, setHistory] = useState<CheckHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !isLoggedIn) return;

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
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Не удалось загрузить историю");
      })

    return () => {
      cancelled = true;
    };
  }, [isLoading, isLoggedIn]);

  const handleDownloadPDF = async (e: React.MouseEvent, reportId?: string) => {
    e.stopPropagation();
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
    <div className="flex flex-col">
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="px-6 pb-3 pt-10 sm:px-10 sm:pt-14 lg:col-span-10 lg:col-start-2">
            <BackButton />
          </div>
        </div>
      </section>
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              История проверок
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Все проверки, сохраненные в вашем аккаунте
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-10 lg:col-start-2">
            {isLoading || (isLoggedIn && history === null) ? (
              <p className="text-sm text-muted-foreground">Загрузка истории...</p>
            ) : error ? (
              <div className="border border-red-500/20 bg-red-500/5 p-6 text-sm text-muted-foreground">
                {error}
              </div>
            ) : !isLoggedIn ? (
              <div className="border border-border/50 bg-background/50 p-6 text-sm text-muted-foreground">
                Войдите в аккаунт, чтобы просмотреть историю проверок.
              </div>
            ) : history === null || history.length === 0 ? (
              <div className="flex flex-col items-center border border-border/50 bg-background/50 p-10 text-center">
                <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">История пока пустая</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Запустите проверку после входа в аккаунт, и она появится здесь.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 border border-border/50 bg-background/50 p-4 sm:flex-row sm:items-center"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {statusIcon(item.status)}
                        <span className="font-medium">{item.url}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{formatDate(item.created_at)}</span>
                        <span>Тип: {item.check_type || "detail"}</span>
                        <span>Статус: {item.status}</span>
                        {item.results ? <span>Проверок: {item.results.length}</span> : null}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center gap-2 border border-border bg-transparent px-4 text-xs font-bold hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!item.report_id}
                      onClick={(event) => handleDownloadPDF(event, item.report_id)}
                    >
                      <Download className="h-4 w-4" />
                      PDF отчет
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
