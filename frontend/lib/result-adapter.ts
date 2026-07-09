import type { BackendCheckResult, BackendSslInfo, CheckHistoryItem, TaskState } from "@/lib/api";
import { countryCodeToDisplayName, countryCodeToFlagUrl } from "@/lib/country";
import type { CheckItem, CheckResult, ServerGeoItem } from "@/lib/data";
import { calculateFineEstimate } from "@/lib/fines";

type UiStatus = CheckItem["status"];

const CHECK_LABELS: Record<string, string> = {
  https: "HTTPS соединения",
  "ssl/tls": "SSL/TLS сертификат",
  ips: "География серверов",
  country: "География серверов",
  "cookie-ads": "Куки и сторонние трекеры",
  cookies: "Куки и сторонние трекеры",
  "sep-consent": "Согласие на обработку ПДн",
  "privacy-policy": "Политика конфиденциальности",
  "cookie-banner": "Куки-баннер",
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

function isRussianDomainName(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized.endsWith(".ru") || normalized.endsWith(".su") || normalized.endsWith(".xn--p1ai");
}

function sslIssueEntries(check: BackendCheckResult): Array<[string, string]> {
  const endpoints = check.data?.endpoints;
  if (!endpoints || typeof endpoints !== "object" || Array.isArray(endpoints)) return [];
  return Object.entries(endpoints as Record<string, unknown>).flatMap(([domain, reason]) => {
    if (typeof reason !== "string") return [];
    return [[domain, reason] as [string, string]];
  });
}

function hasOnlyRussianBrowserTrustIssues(check: BackendCheckResult): boolean {
  if (check.id !== "ssl/tls" || check.result !== "fail") return false;
  const issues = sslIssueEntries(check);
  return issues.length > 0 && issues.every(([domain, reason]) => reason === "insecure" && isRussianDomainName(domain));
}

function normalizeCheckResult(check: BackendCheckResult): BackendCheckResult {
  if (!hasOnlyRussianBrowserTrustIssues(check)) return check;
  return {
    ...check,
    result: "warn",
    about: check.about || "SSL/TLS сертификат использует российскую цепочку доверия; это не считается критической ошибкой, но стоит проверить вручную.",
  };
}

function titleFor(status: UiStatus): CheckItem["title"] {
  if (status === "pass") return "отлично";
  if (status === "warning") return "предупреждение";
  return "нарушение";
}

function descriptionFor(check: BackendCheckResult, status: UiStatus): string {
  if (check.about && check.about !== "<nil>") return check.about;
  if (check.data && typeof check.data.about === "string" && check.data.about !== "<nil>") {
    return check.data.about;
  }
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

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function toCheckItem(check: BackendCheckResult): CheckItem {
  const status = toUiStatus(check.result);
  const label = CHECK_LABELS[check.id] || check.id;
  const dataDetails = flattenData(check.data);
  const pages = check.pages?.length ? check.pages : stringArray(check.data?.pages);
  const images = check.images?.length ? check.images : stringArray(check.data?.images);

  return {
    status,
    label,
    description: descriptionFor(check, status),
    details: dataDetails,
    lawExcerpts: status === "pass" ? [] : ["Проверьте соответствие требованиям 152-ФЗ и связанным нормативным актам."],
    foundUrls: pages,
    domainsIps: domainsFor(check),
    images,
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
    images: [],
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

function completionScore(results: BackendCheckResult[]): number {
  if (results.length === 0) return 0;
  const points = results.reduce((total, item) => {
    if (item.result === "ok") return total + 1;
    if (item.result === "warn") return total + 0.5;
    return total;
  }, 0);
  return Math.round((points / results.length) * 100);
}

function legacyRiskScoreFromCompletion(score: number): number {
  return Math.max(0, Math.min(100, 100 - score));
}

function formatSslDate(value?: number): string {
  if (!value) return "Не определено";
  const timestampMs = value > 100_000_000_000 ? value : value * 1000;
  const date = new Date(timestampMs);
  if (Number.isNaN(date.getTime())) return "Не определено";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function sslIsExpired(ssl?: BackendSslInfo | null): boolean {
  if (!ssl?.validTo) return false;
  const timestampMs = ssl.validTo > 100_000_000_000 ? ssl.validTo : ssl.validTo * 1000;
  return timestampMs < Date.now();
}

function serverGeoFor(results: BackendCheckResult[]): ServerGeoItem[] {
  const data = results.find((item) => item.id === "ips" || item.id === "country")?.data;
  const services = Array.isArray(data?.services) ? data.services : [];
  return services.flatMap((service) => {
    if (!service || typeof service !== "object") return [];
    const item = service as Record<string, unknown>;
    const domain = typeof item.domain === "string" ? item.domain : "Не определено";
    const ips = stringArray(item.ip);
    const countries = stringArray(item.country);
    if (ips.length === 0) {
      return [{ domain, ip: "Не определено", country: countries[0] || "unknown" }];
    }
    return ips.map((ip, index) => ({
      domain,
      ip,
      country: countries[index] || countries[0] || "unknown",
    }));
  });
}

function normalizedCountryCode(value?: string | null): string | undefined {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "localhost") return undefined;
  return normalized;
}

export function taskToCheckResult(task: TaskState): CheckResult {
  const results = (task.results || []).map(normalizeCheckResult);
  const passedCount = results.filter((item) => item.result === "ok").length;
  const warningCount = results.filter((item) => item.result === "warn").length;
  const failedCount = results.filter((item) => item.result === "fail").length;
  const totalCount = results.length;
  const overallStatus = statusFromCounts(failedCount, warningCount);
  const score = completionScore(results);
  const checks = sortChecksBySeverity(results.map(toCheckItem));
  const fineEstimate = calculateFineEstimate(results);
  const countryCode = normalizedCountryCode(task.country);
  const ssl = task.ssl;

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
    maxFineLegalEntity: fineEstimate.legalEntity,
    maxFineIndividual: fineEstimate.physicalPerson,
    riskScore: legacyRiskScoreFromCompletion(score),
    checkType: "free",
    passedCount,
    failedCount,
    warningCount,
    totalCount,
    siteIps: domainsFor(results.find((item) => ["ips", "country"].includes(item.id)) || { id: "", result: "ok" }),
    siteCountry: countryCodeToDisplayName(task.country),
    siteCountryCode: countryCode,
    siteCountryFlag: countryCodeToFlagUrl(task.country) || "",
    serverGeo: serverGeoFor(results),
    siteAiDescription: task.about || results.find((item) => item.about && item.about !== "<nil>")?.about || "Описание сайта не передано бэкендом.",
    screenshotId: task.screenshotId ?? null,
    sslIssuer: ssl?.issuer || "Не определено",
    sslProtocol: ssl?.protocol || "Не определено",
    sslSubjectName: ssl?.subjectName || "Не определено",
    sslSubjectAlternativeNames: ssl?.subjectAlternativeNames || [],
    sslValidFrom: formatSslDate(ssl?.validFrom),
    sslValidTo: formatSslDate(ssl?.validTo),
    sslIsExpired: sslIsExpired(ssl) || results.some((item) => item.id === "ssl/tls" && item.result === "fail"),
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
    screenshotId: item.screenshotId,
    ssl: item.ssl,
    about: item.about,
    country: item.country,
    errors: [],
    report_id: item.report_id,
    created_at: item.created_at,
  };
}
