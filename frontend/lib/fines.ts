import type { BackendCheckResult } from "@/lib/api";

export const fineCatalog = {
  checks: [
    {
      check_name: "Согласие на обработку ПДн",
      check_ids: ["sep-consent"],
      max_fine_rub: { physical_person: 15000, legal_entity: 700000 },
    },
    {
      check_name: "Политика конфиденциальности",
      check_ids: ["privacy-policy"],
      max_fine_rub: { physical_person: 3000, legal_entity: 60000 },
    },
    {
      check_name: "Контакты по персональным данным",
      check_ids: ["email-pdn"],
      max_fine_rub: { physical_person: 4000, legal_entity: 80000 },
    },
    {
      check_name: "География серверов",
      check_ids: ["ips", "country"],
      max_fine_rub: { physical_person: 50000, legal_entity: 18000000 },
    },
    {
      check_name: "Куки-баннер",
      check_ids: ["cookie-banner"],
      max_fine_rub: { physical_person: 15000, legal_entity: 700000 },
    },
    {
      check_name: "foreign-words",
      check_ids: ["foreign-words"],
      max_fine_rub: { physical_person: 2500, legal_entity: 500000 },
    },
    {
      check_name: "Формы согласия",
      check_ids: ["consent-forms", "forms"],
      max_fine_rub: { physical_person: 15000, legal_entity: 700000 },
    },
    {
      check_name: "Маркировка рекламы",
      check_ids: ["ad-marking"],
      max_fine_rub: { physical_person: 0, legal_entity: 500000 },
    },
    {
      check_name: "Данные несовершеннолетних",
      check_ids: ["minors-data"],
      max_fine_rub: { physical_person: 15000, legal_entity: 700000 },
    },
    {
      check_name: "Специальные категории ПДн",
      check_ids: ["special-categ"],
      max_fine_rub: { physical_person: 15000, legal_entity: 700000 },
    },
    {
      check_name: "HTTPS соединения",
      check_ids: ["https"],
      max_fine_rub: { physical_person: 500000, legal_entity: 20000000 },
    },
    {
      check_name: "Куки и сторонние трекеры",
      check_ids: ["cookie-ads", "cookies"],
      max_fine_rub: { physical_person: 15000, legal_entity: 700000 },
    },
    {
      check_name: "SSL/TLS сертификат",
      check_ids: ["ssl/tls"],
      max_fine_rub: { physical_person: 500000, legal_entity: 20000000 },
    },
  ],
} as const;

export interface FineEstimate {
  physicalPerson: number;
  legalEntity: number;
}

export function calculateFineEstimate(checks: BackendCheckResult[]): FineEstimate {
  const byId = new Map<string, (typeof fineCatalog.checks)[number]>();
  for (const entry of fineCatalog.checks) {
    for (const id of entry.check_ids) byId.set(id, entry);
  }

  return checks.reduce<FineEstimate>(
    (total, check) => {
      const entry = byId.get(check.id);
      if (!entry) return total;
      if (check.result === "fail") {
        total.physicalPerson += entry.max_fine_rub.physical_person;
        total.legalEntity += entry.max_fine_rub.legal_entity;
      }
      if (check.result === "warn") {
        total.physicalPerson += Math.round(entry.max_fine_rub.physical_person / 2);
        total.legalEntity += Math.round(entry.max_fine_rub.legal_entity / 2);
      }
      return total;
    },
    { physicalPerson: 0, legalEntity: 0 }
  );
}
