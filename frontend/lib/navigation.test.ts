import { beforeEach, describe, expect, it } from "vitest";
import {
  consumePostAuthRedirect,
  readPostAuthRedirect,
  rememberPostAuthRedirect,
  resolveSafeRedirectPath,
} from "@/lib/navigation";

describe("resolveSafeRedirectPath", () => {
  it("keeps local paths with query strings and fragments", () => {
    expect(
      resolveSafeRedirectPath("/profile/history?status=completed#latest"),
    ).toBe("/profile/history?status=completed#latest");
  });

  it("normalizes a local path without changing its origin", () => {
    expect(resolveSafeRedirectPath("/profile/../pricing")).toBe("/pricing");
  });

  it.each([
    null,
    undefined,
    "",
    "https://example.com/account",
    "//example.com/account",
    "///example.com/account",
    "/\\example.com/account",
    "javascript:alert(1)",
    "/login",
    "/signup?redirectTo=%2Fprofile",
    "/verify-email?token=example",
  ])(
    "uses the profile fallback for an unsafe redirect value: %s",
    (candidate) => {
      expect(resolveSafeRedirectPath(candidate)).toBe("/profile");
    },
  );

  it("supports an explicit trusted fallback", () => {
    expect(resolveSafeRedirectPath("https://example.com", "/login")).toBe(
      "/login",
    );
  });
});

describe("post-auth redirect storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("remembers a safe redirect across registration and email verification", () => {
    rememberPostAuthRedirect("/profile/subscription");

    expect(readPostAuthRedirect()).toBe("/profile/subscription");
    expect(consumePostAuthRedirect()).toBe("/profile/subscription");
    expect(readPostAuthRedirect()).toBe("/profile");
  });

  it("stores the safe fallback for an external redirect", () => {
    rememberPostAuthRedirect("https://example.com/account");

    expect(readPostAuthRedirect()).toBe("/profile");
  });
});
