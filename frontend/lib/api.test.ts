import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, getProgress, getUsage, startCheck, upgradeToPaid } from "./api";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("frontend API helpers", () => {
  it("normalizes bare domains before starting a check", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: "ERR_OK", "req-id": "req-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(startCheck(" example.com ")).resolves.toMatchObject({
      code: "ERR_OK",
      "req-id": "req-1",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/check",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ url: "https://example.com", type: "detail" }),
      })
    );
  });

  it("keeps explicit http URLs unchanged", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ code: "ERR_OK", "req-id": "req-2" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await startCheck("http://localhost:3000", "fast");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/check",
      expect.objectContaining({
        body: JSON.stringify({ url: "http://localhost:3000", type: "fast" }),
      })
    );
  });

  it("maps backend error codes to ApiError instances", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ code: "ERR_GUEST_LIMIT" }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(startCheck("example.com")).rejects.toMatchObject({
      name: "ApiError",
      code: "ERR_GUEST_LIMIT",
      status: 429,
    });
  });

  it("maps the rolling scan limit and loads the shared usage endpoint", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ tier: "free", limited: true, limit: 3, used: 2, remaining: 1, window_days: 30 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: "ERR_SCAN_LIMIT" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getUsage()).resolves.toMatchObject({ tier: "free", remaining: 1, window_days: 30 });
    await expect(startCheck("example.com")).rejects.toMatchObject({
      name: "ApiError",
      code: "ERR_SCAN_LIMIT",
      status: 403,
    });
    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/usage", { credentials: "include" });
  });

  it("returns a consistent not-found error for missing progress", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 404 }))
    );

    await expect(getProgress("missing id")).rejects.toBeInstanceOf(ApiError);
    await expect(getProgress("missing id")).rejects.toMatchObject({
      code: "ERR_NOT_FOUND",
      status: 404,
    });
  });

  it("activates Paid through the authenticated server endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", message: "Plan changed to paid" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(upgradeToPaid()).resolves.toMatchObject({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/subscription/change",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ plan: "paid" }),
      })
    );
  });
});
