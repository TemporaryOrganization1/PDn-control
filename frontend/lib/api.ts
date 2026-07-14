"use client";

export interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
  email_verified?: boolean;
  plan?: "free" | "paid";
  plan_expires_at?: string;
}

export interface GuestInfo {
  limit: number;
  used: number;
  remaining: number;
}

export interface MeResponse {
  user: AuthUser | null;
  guest?: GuestInfo;
}

export interface ScanProfile {
  tier: "guest" | "free" | "paid" | "legacy_full";
  detail_level: "summary" | "full";
  ai_iterations: number;
  pdf_enabled: boolean;
  screenshots_enabled: boolean;
}

export interface ScanQuota {
  tier: "guest" | "free" | "paid";
  limited: boolean;
  limit?: number;
  used?: number;
  remaining?: number;
  window_days?: number;
  next_available_at?: string;
}

export interface RegisterResponse {
  status: string;
  message: string;
  user: {
    id: string;
    email: string;
    email_verified: boolean;
    created_at: string;
  };
}

export interface CheckResponse {
  code: string;
  "req-id": string;
  data?: {
    status?: string;
    "req-id"?: string;
    guest?: GuestInfo;
    scan_profile?: ScanProfile;
    quota?: ScanQuota;
  };
  msg?: string;
}

export interface BackendCheckResult {
  id: string;
  result: "ok" | "warn" | "fail" | "unknown" | string;
  pages?: string[];
  about?: string;
  images?: string[];
  data?: Record<string, unknown>;
}

export interface BackendSslInfo {
  issuer: string;
  validFrom: number;
  validTo: number;
  protocol: string;
  subjectName: string;
  subjectAlternativeNames: string[];
}

export interface TaskState {
  "req-id": string;
  url: string;
  type: string;
  status: string;
  worker?: string;
  progress: number;
  results?: BackendCheckResult[];
  screenshotId?: string | null;
  ssl?: BackendSslInfo | null;
  about?: string | null;
  country?: string | null;
  errors?: string[];
  report_id?: string;
  created_at?: string;
  scan_profile?: ScanProfile;
}

export interface CheckHistoryItem {
  id: string;
  email?: string;
  req_id: string;
  url: string;
  check_type: string;
  status: string;
  report_id?: string;
  created_at: string;
  file_name?: string;
  results?: BackendCheckResult[];
  screenshotId?: string | null;
  ssl?: BackendSslInfo | null;
  about?: string | null;
  country?: string | null;
  scan_profile?: ScanProfile;
}

export class ApiError extends Error {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const API_ERROR_MESSAGES: Record<string, string> = {
  ERR_INVALID_URL: "Введите корректный адрес сайта",
  ERR_INVALID_TYPE: "Некорректный тип проверки",
  ERR_GUEST_LIMIT: "Гостевой лимит проверок исчерпан. Войдите или зарегистрируйтесь, чтобы продолжить.",
  ERR_SCAN_LIMIT: "Лимит бесплатных проверок исчерпан. Следующая попытка станет доступна после окончания 30-дневного окна.",
  ERR_WORKER_UNAVAILABLE: "Сейчас нет свободных обработчиков. Попробуйте еще раз чуть позже.",
  ERR_INVALID_CREDENTIALS: "Неверная почта или пароль",
  ERR_EMAIL_EXISTS: "Пользователь с такой почтой уже существует",
  ERR_WEAK_PASSWORD: "Пароль должен быть не короче 8 символов",
  ERR_UNAUTHORIZED: "Нужно войти в аккаунт",
  ERR_FORBIDDEN: "Недостаточно прав для этого действия",
  ERR_NOT_FOUND: "Запрошенные данные не найдены",
  ERR_EMAIL_NOT_VERIFIED: "Подтвердите вашу почту перед входом",
};

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function apiMessage(code?: string, fallback?: string): string {
  if (code && API_ERROR_MESSAGES[code]) return API_ERROR_MESSAGES[code];
  return fallback || "Не удалось выполнить запрос";
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  const code = typeof data?.code === "string" ? data.code : undefined;

  if (!response.ok || (code && code !== "ERR_OK")) {
    throw new ApiError(
      apiMessage(code, typeof data?.msg === "string" ? data.msg : undefined),
      code,
      response.status
    );
  }

  return data as T;
}

export async function getMe(): Promise<MeResponse> {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
  });
  return parseJsonResponse<MeResponse>(response);
}

export async function login(email: string, password: string): Promise<MeResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return parseJsonResponse<MeResponse>(response);
}

export async function register(email: string, password: string): Promise<RegisterResponse> {
	const response = await fetch("/api/auth/register", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ email, password }),
	});
	return parseJsonResponse<RegisterResponse>(response);
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
  await parseJsonResponse(response);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<MeResponse> {
	const response = await fetch("/api/auth/change-password", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ currentPassword, newPassword }),
	});
	return parseJsonResponse<MeResponse>(response);
}

export async function changeEmail(email: string): Promise<MeResponse> {
	const response = await fetch("/api/auth/change-email", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ email }),
	});
	return parseJsonResponse<MeResponse>(response);
}

export async function getGuestRemaining(): Promise<GuestInfo> {
  const response = await fetch("/api/guest/remaining", {
    credentials: "include",
  });
  return parseJsonResponse<GuestInfo>(response);
}

export async function startCheck(url: string, type: "fast" | "detail" = "detail"): Promise<CheckResponse> {
  const response = await fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ url: normalizeUrl(url), type }),
  });
  return parseJsonResponse<CheckResponse>(response);
}

export async function getProgress(reqId: string): Promise<TaskState> {
  const response = await fetch(`/api/progress/${encodeURIComponent(reqId)}`, {
    credentials: "include",
  });
  if (response.status === 404) {
    throw new ApiError("Результат проверки не найден", "ERR_NOT_FOUND", 404);
  }
  return parseJsonResponse<TaskState>(response);
}

export async function getReports(): Promise<CheckHistoryItem[]> {
  const response = await fetch("/api/reports", {
    credentials: "include",
  });
  return parseJsonResponse<CheckHistoryItem[]>(response);
}

export async function deleteAccount(): Promise<void> {
  const response = await fetch("/api/auth/delete-account", {
    method: "POST",
    credentials: "include",
  });
  await parseJsonResponse(response);
}

export async function upgradeToPaid(): Promise<MeResponse> {
  const response = await fetch("/api/subscription/change", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ plan: "paid" }),
  });
  return parseJsonResponse<MeResponse>(response);
}

export async function downloadReport(reportId: string): Promise<void> {
  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const code = typeof data?.code === "string" ? data.code : undefined;
    throw new ApiError(
      apiMessage(code, typeof data?.msg === "string" ? data.msg : undefined),
      code,
      response.status
    );
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("Content-Disposition");
  const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] || "report.pdf";
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  window.URL.revokeObjectURL(url);
  anchor.remove();
}

export async function getUsage(): Promise<ScanQuota> {
  const response = await fetch("/api/usage", {
    credentials: "include",
  });
  return parseJsonResponse<ScanQuota>(response);
}

export async function deleteReport(reportId: string): Promise<void> {
  const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
    method: "DELETE",
    credentials: "include",
  });
  await parseJsonResponse(response);
}
