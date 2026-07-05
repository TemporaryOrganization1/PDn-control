export const siteConfig = {
  name: "PDn Control",
  tagline: "Проверка сайта на риски по 152-ФЗ",
  description:
    "Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.",
  serviceIps: [
    "45.67.89.10",
    "45.67.89.11",
    "45.67.89.12",
    "2600:1f18:100:1::1",
  ],
};

export interface CheckItem {
  status: "pass" | "warning" | "fail";
  label: string;
  description: string;
  details: string[];
  lawExcerpts: string[];
  foundUrls: string[];
  domainsIps: string[];
  title: string;
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
  checkType: "free" | "paid";
  passedCount: number;
  failedCount: number;
  warningCount: number;
  totalCount: number;
  siteIps: string[];
  siteCountry: string;
  siteCountryFlag: string;
  siteAiDescription: string;
  sslIssuer: string;
  sslValidFrom: string;
  sslValidTo: string;
  sslIsExpired: boolean;
  reportId?: string;
}
