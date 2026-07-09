import { describe, expect, it } from "vitest";

import type { TaskState } from "./api";
import { countryCodeToDisplayName, countryCodeToFlagUrl } from "./country";
import { calculateFineEstimate } from "./fines";
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
      screenshotId: "img-top",
      about: "Краткое описание сайта",
      country: "RU",
      ssl: {
        issuer: "Example CA",
        validFrom: 1700000000,
        validTo: 2000000000,
        protocol: "TLS 1.3",
        subjectName: "example.com",
        subjectAlternativeNames: ["example.com", "www.example.com"],
      },
      results: [
        { id: "https", result: "ok", pages: ["https://example.com"] },
        { id: "cookies", result: "warn", data: { domains: ["tracker.example"] }, images: ["img-cookie"] },
        { id: "ssl/tls", result: "fail", about: "certificate problem" },
      ],
    };

    const result = taskToCheckResult(task);

    expect(result.url).toBe("https://example.com");
    expect(result.overallStatus).toBe("non_compliant");
    expect(result.complianceScore).toBe(50);
    expect(result.riskScore).toBe(50);
    expect(result.passedCount).toBe(1);
    expect(result.warningCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.totalCount).toBe(3);
    expect(result.reportId).toBe("report-1");
    expect(result.sslIsExpired).toBe(true);
    expect(result.sslIssuer).toBe("Example CA");
    expect(result.sslProtocol).toBe("TLS 1.3");
    expect(result.siteAiDescription).toBe("Краткое описание сайта");
    expect(result.siteCountryFlag).toBe("/flags/ru.svg");
    expect(result.screenshotId).toBe("img-top");
    expect(result.maxFineLegalEntity).toBe(20_350_000);
    expect(result.maxFineIndividual).toBe(507_500);
    expect(result.checks.find((check) => check.label === "Куки и сторонние трекеры")?.images).toEqual(["img-cookie"]);
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

  it("downgrades Russian browser trust SSL issues from failure to warning", () => {
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
              "bs.yandex.ru": "insecure",
              "vk.ru": "insecure",
            },
          },
        },
      ],
    };

    const result = taskToCheckResult(task);

    expect(result.overallStatus).toBe("partial");
    expect(result.failedCount).toBe(0);
    expect(result.warningCount).toBe(1);
    expect(result.complianceScore).toBe(50);
    expect(result.checks[0].status).toBe("warning");
    expect(result.sslIsExpired).toBe(false);
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
      screenshotId: "img-history",
      about: "History about",
      country: "us",
      results: [{ id: "https", result: "ok" }],
    });

    expect(task).toMatchObject({
      "req-id": "req-2",
      url: "https://example.org",
      type: "fast",
      status: "completed",
      progress: 100,
      report_id: "report-2",
      screenshotId: "img-history",
      about: "History about",
      country: "us",
    });
  });

  it("calculates fines from the catalog only for failed and warning checks", () => {
    expect(
      calculateFineEstimate([
        { id: "https", result: "ok" },
        { id: "ssl/tls", result: "fail" },
        { id: "privacy-policy", result: "warn" },
      ])
    ).toEqual({
      physicalPerson: 501_500,
      legalEntity: 20_030_000,
    });
  });

  it("maps country codes to local flag URLs and display names", () => {
    expect(countryCodeToFlagUrl("ru")).toBe("/flags/ru.svg");
    expect(countryCodeToFlagUrl("US")).toBe("/flags/us.svg");
    expect(countryCodeToFlagUrl("unknown")).toBeNull();
    expect(countryCodeToFlagUrl(null)).toBeNull();
    expect(countryCodeToDisplayName("unknown")).toBe("Не определено");
    expect(countryCodeToDisplayName(null)).toBe("Не определено");
  });
});
