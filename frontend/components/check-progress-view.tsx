"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Circle, Globe, Loader2 } from "lucide-react";
import { CheckHints } from "@/components/check-hints";
import { getProgress, type TaskState } from "@/lib/api";
import { saveLastResult } from "@/lib/result-storage";

type StageStatus = "pending" | "active" | "done";

const STAGES = [
  { label: "Задача поставлена в очередь" },
  { label: "Обработчик запускает проверку" },
  { label: "Выполняется анализ сайта" },
  { label: "Формируется отчет" },
];

function activeStageIndex(progress: number, status: string): number {
  if (progress >= 95) return 3;

  switch (status) {
    case "queued":
      return 0;
    case "dispatched":
    case "starting":
      return 1;
    case "browser_ready":
      return 2;
    default:
      if (progress >= 20) return 2;
      if (progress >= 10) return 1;
      return 0;
  }
}

function stageStatus(activeIndex: number, index: number): StageStatus {
  if (index < activeIndex) return "done";
  if (index === activeIndex) return "active";
  return "pending";
}

function statusLabel(status: string, progress: number): string {
  if (progress >= 95) return "Формируется отчет";

  switch (status) {
    case "queued":
      return "Задача поставлена в очередь";
    case "dispatched":
    case "starting":
      return "Обработчик запускает проверку";
    case "browser_ready":
      return "Выполняется анализ сайта";
    case "failed":
      return "Проверка завершилась с ошибкой";
    default:
      return "Проверка выполняется";
  }
}

export default function CheckProgressView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reqId = searchParams.get("reqId");
  const [task, setTask] = useState<TaskState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!reqId) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const nextTask = await getProgress(reqId);
        if (cancelled) return;
        setTask(nextTask);

        if (nextTask.status === "completed" || nextTask.progress >= 100) {
          saveLastResult(nextTask);
          router.push(`/result?reqId=${encodeURIComponent(reqId)}`);
          return;
        }

        if (nextTask.status === "failed" || (nextTask.errors && nextTask.errors.length > 0)) {
          setError(nextTask.errors?.[0] || "Проверка завершилась с ошибкой");
          return;
        }

        pollRef.current = setTimeout(poll, 2000);
      } catch (pollError) {
        if (cancelled) return;
        setError(pollError instanceof Error ? pollError.message : "Не удалось получить прогресс проверки");
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [reqId, router]);

  const progress = Math.max(0, Math.min(100, task?.progress || 0));
  const checkedUrl = task?.url || "ожидаем данные backend";
  const currentStatus = useMemo(() => task?.status || "queued", [task?.status]);
  const activeStage = useMemo(() => activeStageIndex(progress, currentStatus), [currentStatus, progress]);
  const currentStatusLabel = useMemo(
    () => statusLabel(currentStatus, progress),
    [currentStatus, progress]
  );

  if (!reqId) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
        <div className="max-w-md border border-border bg-card p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-xl font-semibold">Проверка не выбрана</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Запустите проверку с главной страницы, чтобы увидеть прогресс.
          </p>
          <Link className="mt-5 inline-flex border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary" href="/">
            Перейти к проверке
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Проверка сайта
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Выполняется анализ сайта на соответствие требованиям законодательства о ПДн
            </p>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-4 sm:px-10 lg:grid-cols-12">
          <div className="flex items-center gap-3 lg:col-span-8 lg:col-start-2">
            <div className="flex h-9 w-9 items-center justify-center bg-primary/10">
              <Globe className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Проверяемый сайт</p>
              <p className="truncate font-mono text-sm font-medium text-foreground">
                {checkedUrl}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card">
        <div className="grid grid-cols-1 px-6 py-6 sm:px-10 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-2">
            <div className="flex items-center gap-3">
              <div className="h-1 flex-1 bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="min-w-[3ch] text-xs tabular-nums text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Статус: {currentStatusLabel}</p>
          </div>
        </div>
      </section>

      {error ? (
        <section className="w-full border-b bg-card">
          <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
            <div className="border border-red-500/20 bg-red-500/5 p-6 lg:col-span-8 lg:col-start-2">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-500" />
                <div>
                  <h2 className="text-sm font-semibold">Проверка не завершилась</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full border-b bg-card">
          <div className="grid grid-cols-1 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-12">
            <div className="space-y-0 lg:col-span-6 lg:col-start-2">
              {STAGES.map((stage, i) => {
                const status = stageStatus(activeStage, i);
                return (
                  <div
                    key={stage.label}
                    className={`flex items-center gap-4 border-l-2 py-5 pl-5 transition-all duration-500 ${
                      status === "active"
                        ? "border-primary"
                        : status === "done"
                          ? "border-primary/40"
                          : "border-border"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center transition-all duration-300 ${
                        status === "done"
                          ? "bg-primary text-primary-foreground"
                          : status === "active"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {status === "done" ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : status === "active" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{stage.label}</p>
                      {status === "active" && (
                        <p className="mt-0.5 animate-pulse text-xs text-muted-foreground">
                          Выполняется...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <CheckHints />
    </div>
  );
}

