import type { BackendCheckResult, CheckHistoryItem, TaskState } from "@/lib/api";
import type { CheckItem, CheckResult } from "@/lib/data";

type UiStatus = CheckItem["status"];

const CHECK_LABELS: Record<string, string> = {
  https: "HTTPS соединения",
  "ssl/tls": "SSL/TLS сертификат",
  ips: "География серверов",
  country: "География серверов",
  "cookie-ads": "Cookie и сторонние трекеры",
  cookies: "Cookie и сторонние трекеры",
  "sep-consent": "Согласие на обработку ПДн",
  "privacy-policy": "Политика конфиденциальности",
  "cookie-banner": "Cookie-баннер",
  "consent-forms": "Формы согласия",
  forms: "Формы сбора данных",
  "email-pdn": "Контакты по персональным данным",
  "ad-marking": "Маркировка рекламы",
  "minors-data": "Данные несовершеннолетних",
  "special-categ": "Специальные категории ПДн",
  ai: "AI-анализ документов",
};

function toUiStatus(result: string): UiStatus {
  if (result === "ok") return "pass";
  if (result === "warn") return "warning";
  return "fail";
}

function titleFor(status: UiStatus): CheckItem["title"] {
  if (status === "pass") return "отлично";
  if (status === "warning") return "предупреждение";
  return "нарушение";
}

function descriptionFor(check: BackendCheckResult, status: UiStatus): string {
  if (check.about && check.about !== "<nil>") return check.about;
  const label = CHECK_LABELS[check.id] || check.id;
  if (status === "pass") return `${label}: нарушений не обнаружено.`;
  if (status === "warning") return `${label}: обнаружены предупреждения, рекомендуется проверить вручную.`;
  return `${label}: обнаружено нарушение или существенный риск.`;
}

function flattenData(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([key]) => key !== "pages" && key !== "about")
    .map(([key, item]) => {
      if (Array.isArray(item)) return `${key}: ${item.join(", ")}`;
      if (item && typeof item === "object") return `${key}: ${JSON.stringify(item)}`;
      return `${key}: ${String(item)}`;
    });
}

function domainsFor(check: BackendCheckResult): string[] {
  const data = check.data;
  if (!data) return [];
  const candidates = [data.domains, data.domain, data.ips, data.ip, data.endpoints, data.services];
  const result = new Set<string>();

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === "string") result.add(item);
        if (item && typeof item === "object") {
          const object = item as Record<string, unknown>;
          if (typeof object.domain === "string") result.add(object.domain);
          if (Array.isArray(object.ip)) {
            for (const ip of object.ip) {
              if (typeof ip === "string") result.add(ip);
            }
          }
        }
      }
    } else if (candidate && typeof candidate === "object") {
      for (const [key, value] of Object.entries(candidate as Record<string, unknown>)) {
        result.add(key);
        if (typeof value === "string") result.add(value);
      }
    } else if (typeof candidate === "string") {
      result.add(candidate);
    }
  }

  return Array.from(result);
}

function toCheckItem(check: BackendCheckResult): CheckItem {
  const status = toUiStatus(check.result);
  const label = CHECK_LABELS[check.id] || check.id;
  const dataDetails = flattenData(check.data);
  const pages = check.pages || [];

  return {
    status,
    label,
    description: descriptionFor(check, status),
    details: dataDetails.length > 0 ? dataDetails : pages.map((page) => `Страница: ${page}`),
    lawExcerpts: status === "pass" ? [] : ["Проверьте соответствие требованиям 152-ФЗ и связанным нормативным актам."],
    foundUrls: pages,
    aiResponse: check.about && check.about !== "<nil>" ? check.about : descriptionFor(check, status),
    domainsIps: domainsFor(check),
    title: titleFor(status),
  };
}

function fallbackItem(label: string): CheckItem {
  return {
    status: "pass",
    label,
    description: "Проверка не выявила нарушений по этому направлению.",
    details: [],
    lawExcerpts: [],
    foundUrls: [],
    aiResponse: "Нарушений не обнаружено.",
    domainsIps: [],
    title: "отлично",
  };
}

function pickItem(results: BackendCheckResult[], ids: string[], label: string): CheckItem {
  const found = results.find((item) => ids.includes(item.id));
  return found ? toCheckItem(found) : fallbackItem(label);
}

function formatDate(value?: string): string {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toLocaleString("ru-RU");
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusFromCounts(failedCount: number, warningCount: number): CheckResult["overallStatus"] {
  if (failedCount > 0) return "non_compliant";
  if (warningCount > 0) return "partial";
  return "compliant";
}

function riskScore(failedCount: number, warningCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.min(100, failedCount * 30 + warningCount * 15);
}

function maxFineLegalEntity(overallStatus: CheckResult["overallStatus"]): number {
  if (overallStatus === "compliant") return 0;
  if (overallStatus === "partial") return 300_000;
  return 500_000;
}

function maxFineIndividual(overallStatus: CheckResult["overallStatus"]): number {
  if (overallStatus === "compliant") return 0;
  if (overallStatus === "partial") return 50_000;
  return 100_000;
}

export function taskToCheckResult(task: TaskState): CheckResult {
  const results = task.results || [];
  const passedCount = results.filter((item) => item.result === "ok").length;
  const warningCount = results.filter((item) => item.result === "warn").length;
  const failedCount = results.filter((item) => item.result === "fail").length;
  const totalCount = results.length;
  const overallStatus = statusFromCounts(failedCount, warningCount);
  const score = Math.max(0, 100 - riskScore(failedCount, warningCount, totalCount));
  const checks = results.map(toCheckItem);

  return {
    url: task.url,
    complianceScore: score,
    overallStatus,
    policyStatus: pickItem(results, ["privacy-policy", "ai"], "Политика конфиденциальности"),
    consentStatus: pickItem(results, ["sep-consent", "consent-forms", "cookie-banner", "cookies"], "Согласие на обработку ПДн"),
    formsStatus: pickItem(results, ["forms"], "Формы сбора данных"),
    securityStatus: pickItem(results, ["https", "ssl/tls", "ips", "country"], "Меры защиты данных"),
    checks,
    checkedAt: formatDate(task.created_at),
    maxFineLegalEntity: maxFineLegalEntity(overallStatus),
    maxFineIndividual: maxFineIndividual(overallStatus),
    riskScore: riskScore(failedCount, warningCount, totalCount),
    checkType: "free",
    passedCount,
    failedCount,
    warningCount,
    totalCount,
    siteIps: domainsFor(results.find((item) => ["ips", "country"].includes(item.id)) || { id: "", result: "ok" }),
    siteCountry: "Не определено",
    siteCountryFlag: "",
    siteAiDescription: results.find((item) => item.about && item.about !== "<nil>")?.about || "Описание сайта не передано backend.",
    sslIssuer: "Не определено",
    sslValidFrom: "Не определено",
    sslValidTo: "Не определено",
    sslIsExpired: results.some((item) => item.id === "ssl/tls" && item.result === "fail"),
    reportId: task.report_id,
  };
}

export function historyItemToTask(item: CheckHistoryItem): TaskState {
  return {
    "req-id": item.req_id,
    url: item.url,
    type: item.check_type || "detail",
    status: item.status,
    progress: item.status === "completed" ? 100 : 0,
    results: item.results || [],
    errors: [],
    report_id: item.report_id,
    created_at: item.created_at,
  };
}
