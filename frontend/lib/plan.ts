export function hasActivePaidPlan(
  plan?: "free" | "paid",
  planExpiresAt?: string,
  now = Date.now(),
): boolean {
  if (plan !== "paid") return false;
  if (!planExpiresAt) return true;

  const expiresAt = Date.parse(planExpiresAt);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

export function formatPlanTimeLeft(
  planExpiresAt: string,
  now = Date.now(),
): string {
  const expiresAt = Date.parse(planExpiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return "Истек";

  const difference = expiresAt - now;
  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  const minutes = Math.floor((difference % 3_600_000) / 60_000);
  return `${days} д ${hours} ч ${minutes} мин`;
}
