const UNKNOWN_COUNTRY_LABEL = "Не определено";

function normalizeCountryCode(code: string | null | undefined): string | null {
  const normalized = code?.trim().toLowerCase();
  if (!normalized || normalized === "unknown" || normalized === "localhost" || normalized.length !== 2) {
    return null;
  }
  return normalized;
}

export function countryCodeToFlagUrl(code: string | null | undefined): string | null {
  const normalized = normalizeCountryCode(code);
  return normalized ? `/flags/${normalized}.svg` : null;
}

export function countryCodeToDisplayName(code: string | null | undefined): string {
  const normalized = normalizeCountryCode(code);
  if (!normalized) return UNKNOWN_COUNTRY_LABEL;

  try {
    const displayNames = new Intl.DisplayNames(["ru"], { type: "region" });
    return displayNames.of(normalized.toUpperCase()) || normalized.toUpperCase();
  } catch {
    return normalized.toUpperCase();
  }
}
