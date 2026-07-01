import { describe, expect, it } from "vitest";

import type { TaskState } from "./api";
import { historyItemToTask, taskToCheckResult } from "./result-adapter";

describe("result adapter", () => {
  it("converts backend results into aggregate UI status and counters", () => {
    const task: TaskState = {
      "req-id": "req-1",
      url: "https://example.com",
      type: "detail",
      status: "completed",
      progress: 100,
      report_id: "report-1",
      created_at: "2026-07-01T10:00:00Z",
      results: [
        { id: "https", result: "ok", pages: ["https://example.com"] },
        { id: "cookies", result: "warn", data: { domains: ["tracker.example"] } },
        { id: "ssl/tls", result: "fail", about: "certificate problem" },
      ],
    };

    const result = taskToCheckResult(task);

    expect(result.url).toBe("https://example.com");
    expect(result.overallStatus).toBe("non_compliant");
    expect(result.complianceScore).toBe(55);
    expect(result.riskScore).toBe(45);
    expect(result.passedCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.totalCount).toBe(3);
    expect(result.reportId).toBe("report-1");
    expect(result.sslIsExpired).toBe(true);
    expect(result.checks).toHaveLength(3);
  });

  it("turns history items back into task state for result rendering", () => {
    const task = historyItemToTask({
      id: "history-1",
      req_id: "req-2",
      url: "https://example.org",
      check_type: "fast",
      status: "completed",
      report_id: "report-2",
      created_at: "2026-07-01T11:00:00Z",
      results: [{ id: "https", result: "ok" }],
    });

    expect(task).toMatchObject({
      "req-id": "req-2",
      url: "https://example.org",
      type: "fast",
      status: "completed",
      progress: 100,
      report_id: "report-2",
    });
  });
});
