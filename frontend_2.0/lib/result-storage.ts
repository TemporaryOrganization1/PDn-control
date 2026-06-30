"use client";

import type { TaskState } from "@/lib/api";

export const LAST_RESULT_KEY = "pdn:last-result";

export interface StoredLastResult {
  reqId: string;
  url: string;
  completedTask?: TaskState;
  savedAt: string;
}

export function getStoredLastResult(): StoredLastResult | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLastResult>;
    if (!parsed.reqId || !parsed.url || !parsed.savedAt) return null;
    return {
      reqId: parsed.reqId,
      url: parsed.url,
      completedTask: parsed.completedTask,
      savedAt: parsed.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveLastResult(task: TaskState): void {
  if (typeof window === "undefined" || !task["req-id"] || !task.url) return;

  const value: StoredLastResult = {
    reqId: task["req-id"],
    url: task.url,
    completedTask: task,
    savedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(value));
}

