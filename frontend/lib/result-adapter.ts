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

const DOMAIN_DETAIL_KEYS = new Set([
  "domains",
  "domain",
  "ips",
  "ip",
  "endpoints",
  "services",
]);

function isDomainOnlyDetail(key: string, value: unknown): boolean {
  if (!DOMAIN_DETAIL_KEYS.has(key)) return false;
  if (typeof value === "string") return true;
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function formatDetailValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(formatDetailValue).join(", ");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${formatDetailValue(item)}`)
      .join("; ");
  }
  return String(value);
}

function formatObjectDetail(value: Record<string, unknown>): string {
  const title = typeof value.domain === "string" ? value.domain : undefined;
  const fields = Object.entries(value)
    .filter(([key]) => key !== "domain")
    .map(([key, item]) => `${key}: ${formatDetailValue(item)}`);

  if (title && fields.length > 0) return `${title}: ${fields.join("; ")}`;
  if (title) return title;
  return formatDetailValue(value);
}

function formatDomainMapDetail(value: Record<string, unknown>): string[] {
  return Object.entries(value)
    .filter(([, item]) => item !== undefined && item !== null)
    .map(([key, item]) => `${key}: ${formatDetailValue(item)}`);
}

function flattenData(value: unknown): string[] {
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
    if (key === "pages" || key === "about" || isDomainOnlyDetail(key, item)) return [];
    if (Array.isArray(item)) {
      return item.map((entry) => {
        if (entry && typeof entry === "object") return formatObjectDetail(entry as Record<string, unknown>);
        return `${key}: ${formatDetailValue(entry)}`;
      });
    }
    if (item && typeof item === "object") {
      if (DOMAIN_DETAIL_KEYS.has(key)) return formatDomainMapDetail(item as Record<string, unknown>);
      return `${key}: ${formatDetailValue(item)}`;
    }
    return `${key}: ${formatDetailValue(item)}`;
  });
}

function addDomainObjectValues(result: Set<string>, object: Record<string, unknown>): void {
  if (typeof object.domain === "string") result.add(object.domain);
  for (const key of ["ip", "ips"]) {
    const value = object[key];
    if (typeof value === "string") {
      result.add(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") result.add(item);
      }
    }
  }
}

function addDomainMapValues(result: Set<string>, object: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(object)) {
    result.add(key);
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") result.add(item);
      }
    } else if (value && typeof value === "object") {
      addDomainObjectValues(result, value as Record<string, unknown>);
    }
  }
}

function addDomainCandidate(result: Set<string>, candidate: unknown): void {
  if (Array.isArray(candidate)) {
    for (const item of candidate) {
      if (typeof item === "string") result.add(item);
      if (item && typeof item === "object") addDomainObjectValues(result, item as Record<string, unknown>);
    }
  } else if (candidate && typeof candidate === "object") {
    addDomainMapValues(result, candidate as Record<string, unknown>);
  } else if (typeof candidate === "string") {
    result.add(candidate);
  }
}

function domainsFor(check: BackendCheckResult): string[] {
  const data = check.data;
  if (!data) return [];
  const candidates = [data.domains, data.domain, data.ips, data.ip, data.endpoints, data.services];
  const result = new Set<string>();

  for (const candidate of candidates) {
    addDomainCandidate(result, candidate);
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
    details: dataDetails,
    lawExcerpts: status === "pass" ? [] : ["Проверьте соответствие требованиям 152-ФЗ и связанным нормативным актам."],
    foundUrls: pages,
    domainsIps: domainsFor(check),
    title: titleFor(status),
  };
}

function sortChecksBySeverity(checks: CheckItem[]): CheckItem[] {
  const priority: Record<UiStatus, number> = {
    fail: 0,
    warning: 1,
    pass: 2,
  };

  return checks
    .map((item, index) => ({ item, index }))
    .sort((a, b) => priority[a.item.status] - priority[b.item.status] || a.index - b.index)
    .map(({ item }) => item);
}

function fallbackItem(label: string): CheckItem {
  return {
    status: "pass",
    label,
    description: "Проверка не выявила нарушений по этому направлению.",
    details: [],
    lawExcerpts: [],
    foundUrls: [],
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
  const checks = sortChecksBySeverity(results.map(toCheckItem));

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
