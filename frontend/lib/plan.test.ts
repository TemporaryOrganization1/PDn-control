import { describe, expect, it } from "vitest";

import { formatPlanTimeLeft, hasActivePaidPlan } from "./plan";

describe("plan state helpers", () => {
  const now = Date.parse("2026-07-16T12:00:00Z");

  it("treats only non-expired Paid access as active", () => {
    expect(hasActivePaidPlan("free", undefined, now)).toBe(false);
    expect(hasActivePaidPlan("paid", undefined, now)).toBe(true);
    expect(hasActivePaidPlan("paid", "2026-07-16T12:01:00Z", now)).toBe(true);
    expect(hasActivePaidPlan("paid", "2026-07-16T11:59:00Z", now)).toBe(false);
    expect(hasActivePaidPlan("paid", "invalid", now)).toBe(false);
  });

  it("formats the remaining temporary access window", () => {
    expect(formatPlanTimeLeft("2026-07-18T15:04:00Z", now)).toBe(
      "2 д 3 ч 4 мин",
    );
    expect(formatPlanTimeLeft("2026-07-16T11:59:00Z", now)).toBe("Истек");
  });
});
