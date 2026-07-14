export const siteConfig = {
  name: "PDn Control",
  tagline: "Проверка сайта на риски по 152-ФЗ",
  description:
    "Введите адрес сайта — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.",
  serviceIps: [
    "45.67.89.10",
    "45.67.89.11",
    "45.67.89.12",
    "2600:1f18:100:1::1",
  ],
};

export interface CheckItem {
  status: "pass" | "warning" | "fail" | "unknown";
  label: string;
  description: string;
  details: string[];
  lawExcerpts: string[];
  foundUrls: string[];
  domainsIps: string[];
  images: string[];
  title: string;
}

export interface ServerGeoItem {
  domain: string;
  ip: string;
  country: string;
}

export interface CheckResult {
  url: string;
  complianceScore: number;
  overallStatus: "compliant" | "partial" | "non_compliant";
  policyStatus: CheckItem;
  consentStatus: CheckItem;
  formsStatus: CheckItem;
  securityStatus: CheckItem;
  checks: CheckItem[];
  checkedAt: string;
  maxFineLegalEntity: number;
  maxFineIndividual: number;
  riskScore: number;
  checkType: "guest" | "free" | "paid" | "legacy_full";
  passedCount: number;
  failedCount: number;
  warningCount: number;
  unknownCount: number;
  totalCount: number;
  siteIps: string[];
  siteCountry: string;
  siteCountryCode?: string;
  siteCountryFlag: string;
  serverGeo: ServerGeoItem[];
  siteAiDescription: string;
  screenshotId?: string | null;
  sslIssuer: string;
  sslProtocol: string;
  sslSubjectName: string;
  sslSubjectAlternativeNames: string[];
  sslValidFrom: string;
  sslValidTo: string;
  sslIsExpired: boolean;
  reportId?: string;
  scanProfile: import("@/lib/api").ScanProfile;
}
