"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Check, Circle, Globe, Loader2, Terminal } from "lucide-react";
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
    case "data_collection":
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
    case "data_collection":
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
  const scanLog = useMemo(
    () => [
      "[12:41:02] task accepted by queue",
      "[12:41:04] crawler worker started",
      `[12:41:07] target: ${checkedUrl}`,
      progress >= 20
        ? "[12:41:11] public pages discovery in progress"
        : "[12:41:11] waiting for browser context",
      progress >= 60
        ? "[12:41:18] analyzing forms, policy and ssl evidence"
        : "[12:41:18] collecting technical signals",
    ],
    [checkedUrl, progress]
  );

  if (!reqId) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6">
        <div className="elevated-surface max-w-md rounded-2xl p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
          <h1 className="text-xl font-semibold">Проверка не выбрана</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Запустите проверку с главной страницы, чтобы увидеть прогресс.
          </p>
          <Link className="mt-5 inline-flex rounded-xl border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15" href="/">
            Перейти к проверке
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <section className="border-b border-white/10 px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-medium text-primary">Scan console</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Проверяем сайт
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Выполняется анализ сайта на соответствие требованиям законодательства о ПДн.
            </p>
          </div>

          <div className="elevated-surface overflow-hidden rounded-2xl">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-primary/10">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Проверяемый сайт</p>
                    <p className="truncate font-mono text-sm font-medium text-foreground">
                      {checkedUrl}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm">
                  <span className="text-muted-foreground">Статус: </span>
                  <span className="font-medium text-foreground">{currentStatusLabel}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-mono tabular-nums">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {error ? (
              <div className="border border-red-500/20 bg-red-500/[0.06] p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
                  <div>
                    <h2 className="text-sm font-semibold">Проверка не завершилась</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
                <div className="p-5 sm:p-6">
                  <div className="space-y-0">
                    {STAGES.map((stage, i) => {
                      const status = stageStatus(activeStage, i);
                      return (
                        <div
                          key={stage.label}
                          className={`flex items-center gap-4 border-l-2 py-5 pl-5 transition-all duration-500 ${
                            status === "active"
                              ? "border-primary"
                              : status === "done"
                                ? "border-emerald-400/50"
                                : "border-white/10"
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-300 ${
                              status === "done"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : status === "active"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-white/[0.04] text-muted-foreground"
                            }`}
                          >
                            {status === "done" ? (
                              <Check className="h-4 w-4" />
                            ) : status === "active" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
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

                <div className="border-t border-white/10 bg-black/20 p-5 lg:border-l lg:border-t-0 sm:p-6">
                  <div className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Terminal className="h-3.5 w-3.5 text-primary" />
                    technical log
                  </div>
                  <div className="space-y-2">
                    {scanLog.map((line) => (
                      <p key={line} className="font-mono text-xs leading-6 text-foreground/70">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CheckHints />
    </div>
  );
}

