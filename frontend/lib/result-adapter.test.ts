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

  it("orders detailed checks by severity before rendering", () => {
    const task: TaskState = {
      "req-id": "req-1",
      url: "https://example.com",
      type: "detail",
      status: "completed",
      progress: 100,
      results: [
        { id: "passed-first", result: "ok" },
        { id: "failed-first", result: "fail" },
        { id: "warning-first", result: "warn" },
        { id: "failed-second", result: "fail" },
        { id: "passed-second", result: "ok" },
      ],
    };

    const result = taskToCheckResult(task);

    expect(result.checks.map((check) => check.label)).toEqual([
      "failed-first",
      "failed-second",
      "warning-first",
      "passed-first",
      "passed-second",
    ]);
  });

  it("does not duplicate endpoint-only details already shown as domains", () => {
    const task: TaskState = {
      "req-id": "req-1",
      url: "https://example.com",
      type: "detail",
      status: "completed",
      progress: 100,
      results: [
        {
          id: "cookie-ads",
          result: "fail",
          data: {
            endpoints: ["fonts.gstatic.com", "www.googletagmanager.com"],
          },
        },
      ],
    };

    const [check] = taskToCheckResult(task).checks;

    expect(check.domainsIps).toEqual([
      "fonts.gstatic.com",
      "www.googletagmanager.com",
    ]);
    expect(check.details).toEqual([]);
  });

  it("keeps SSL endpoint reasons in details without treating them as domains", () => {
    const task: TaskState = {
      "req-id": "req-1",
      url: "https://example.com",
      type: "detail",
      status: "completed",
      progress: 100,
      results: [
        {
          id: "ssl/tls",
          result: "fail",
          data: {
            endpoints: {
              "api.example.com": "self-signed",
              "cdn.example.com": "insecure",
            },
          },
        },
      ],
    };

    const [check] = taskToCheckResult(task).checks;

    expect(check.domainsIps).toEqual(["api.example.com", "cdn.example.com"]);
    expect(check.details).toEqual([
      "api.example.com: self-signed",
      "cdn.example.com: insecure",
    ]);
  });

  it("formats service objects without leaking object string representations", () => {
    const task: TaskState = {
      "req-id": "req-1",
      url: "https://example.com",
      type: "detail",
      status: "completed",
      progress: 100,
      results: [
        {
          id: "ips",
          result: "fail",
          data: {
            services: [
              {
                domain: "cdn.example.com",
                ip: ["203.0.113.10"],
                country: ["US"],
              },
            ],
          },
        },
      ],
    };

    const [check] = taskToCheckResult(task).checks;

    expect(check.domainsIps).toEqual(["cdn.example.com", "203.0.113.10"]);
    expect(check.details).toEqual(["cdn.example.com: ip: 203.0.113.10; country: US"]);
  });

  it("shows page URLs only in found URLs, not duplicated in details", () => {
    const task: TaskState = {
      "req-id": "req-1",
      url: "https://mail.ru/",
      type: "detail",
      status: "completed",
      progress: 100,
      results: [
        {
          id: "sep-consent",
          result: "fail",
          pages: ["https://mail.ru/"],
          about: "Consent document is merged with the privacy policy.",
        },
      ],
    };

    const [check] = taskToCheckResult(task).checks;

    expect(check.foundUrls).toEqual(["https://mail.ru/"]);
    expect(check.details).toEqual([]);
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
