const INTERNAL_ORIGIN = "https://pdn-control.local";
const DEFAULT_REDIRECT_PATH = "/profile";
const POST_AUTH_REDIRECT_KEY = "pdn-control:post-auth-redirect";
const AUTH_ENTRY_PATHS = new Set(["/login", "/signup", "/verify-email"]);

export function resolveSafeRedirectPath(
  candidate: string | null | undefined,
  fallback = DEFAULT_REDIRECT_PATH,
): string {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\")
  ) {
    return fallback;
  }

  try {
    const target = new URL(candidate, INTERNAL_ORIGIN);
    if (target.origin !== INTERNAL_ORIGIN) return fallback;
    if (AUTH_ENTRY_PATHS.has(target.pathname)) return fallback;

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export function rememberPostAuthRedirect(candidate: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      POST_AUTH_REDIRECT_KEY,
      resolveSafeRedirectPath(candidate),
    );
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}

export function readPostAuthRedirect(fallback = DEFAULT_REDIRECT_PATH): string {
  if (typeof window === "undefined") return fallback;

  try {
    return resolveSafeRedirectPath(
      window.localStorage.getItem(POST_AUTH_REDIRECT_KEY),
      fallback,
    );
  } catch {
    return fallback;
  }
}

export function consumePostAuthRedirect(
  fallback = DEFAULT_REDIRECT_PATH,
): string {
  const redirectTarget = readPostAuthRedirect(fallback);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(POST_AUTH_REDIRECT_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }

  return redirectTarget;
}
