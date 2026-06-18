const API_BASE = '/api';
const AUTH_BASE = 'http://localhost:8081';
const SECRET = import.meta.env.VITE_API_SECRET || 'top-secret-key';

// ─── Auth API ───────────────────────────────────────────────

export async function register(email, name, surname, password) {
  const res = await fetch(`${AUTH_BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, surname, password }),
  });
  const data = await res.json();
  if (data.code !== 'ERR_OK') throw new Error(data.msg);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${AUTH_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (data.code) throw new Error(data.msg);
  return data; // {access_token, refresh_token, expires_in}
}

export async function getMe(accessToken) {
  const res = await fetch(`${AUTH_BASE}/api/v1/auth/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (data.code !== 'ERR_OK') throw new Error(data.msg);
  return data.data;
}

export async function refreshTokens(refreshToken) {
  const res = await fetch(`${AUTH_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (data.code) throw new Error(data.msg);
  return data;
}

// ─── Check API ──────────────────────────────────────────────

export async function startCheck(url, type = 'detail') {
  const normalized = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  const res = await fetch(`${API_BASE}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: normalized, type, secret: SECRET }),
  });
  const data = await res.json();
  if (data.code !== 'ERR_OK') throw new Error(data.msg || data.code);
  return data;
}

export async function getProgress(reqId) {
  const res = await fetch(`${API_BASE}/progress/${encodeURIComponent(reqId)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Task not found');
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

const CHECK_INFO = {
  'https':              { label: 'Незащищённые HTTP-соединения',        severity: 'Высокий',  color: 'bg-orange-500', art: 'HTTPS' },
  'ssl/tls':            { label: 'SSL/TLS: небезопасное соединение',     severity: 'Критично',  color: 'bg-red-500',    art: 'SSL' },
  'ips':                { label: 'Серверы за пределами РФ',             severity: 'Высокий',  color: 'bg-orange-500', art: 'Геолокация' },
  'cookie-ads':         { label: 'Сторонние трекеры и реклама',         severity: 'Средний',  color: 'bg-blue-500',   art: 'Трекеры' },
  'sep-consent':        { label: 'Нет отдельного согласия на обработку ПД', severity: 'Критично', color: 'bg-red-500', art: 'Ст. 9' },
  'foreign-words':      { label: 'Использование иностранных слов в документах', severity: 'Низкий', color: 'bg-gray-400', art: 'Язык' },
  'privacy-policy':     { label: 'Политика конфиденциальности не найдена', severity: 'Критично', color: 'bg-red-500', art: 'Политика' },
  'cookie-banner':      { label: 'Отсутствует баннер cookie-согласия',  severity: 'Средний',  color: 'bg-blue-500',   art: 'Cookie' },
  'consent-forms':      { label: 'Нет форм согласия на обработку ПД',   severity: 'Высокий',  color: 'bg-orange-500', art: 'Формы' },
  'email-pdn':          { label: 'Нет email для запросов по ПД',        severity: 'Средний',  color: 'bg-blue-500',   art: 'Контакты' },
  'ad-marking':         { label: 'Отсутствует маркировка рекламы',      severity: 'Средний',  color: 'bg-blue-500',   art: 'Реклама' },
  'minors-data':        { label: 'Обработка данных несовершеннолетних', severity: 'Критично',  color: 'bg-red-500',    art: 'Дети' },
  'special-categ':      { label: 'Обработка спецкатегорий ПД',          severity: 'Высокий',  color: 'bg-orange-500', art: 'Спецкатегории' },
  'forms':              { label: 'Формы сбора ПД без согласия',         severity: 'Высокий',  color: 'bg-orange-500', art: 'Формы' },
};

export function getCheckInfo(id) {
  return CHECK_INFO[id] || { label: id, severity: 'Средний', color: 'bg-blue-500', art: id };
}

export function calcRiskScore(results) {
  if (!results || results.length === 0) return 0;
  const fails = results.filter(r => r.result === 'fail').length;
  const warns = results.filter(r => r.result === 'warn').length;
  const score = 100 - (fails * 25 + warns * 10);
  return Math.max(0, Math.min(100, score));
}