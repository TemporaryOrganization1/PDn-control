const API_BASE = '/api';

async function parseResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data.code && data.code !== 'ERR_OK')) {
    const err = new Error(data.msg || data.code || `HTTP ${res.status}`);
    err.code = data.code;
    err.status = res.status;
    err.data = data.data;
    throw err;
  }
  return data;
}

export async function startCheck(url, type = 'detail') {
  const normalized = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  const res = await fetch(`${API_BASE}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ url: normalized, type }),
  });
  return parseResponse(res);
}

export async function getProgress(reqId) {
  const res = await fetch(`${API_BASE}/progress/${encodeURIComponent(reqId)}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 404) throw new Error('Task not found');
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: 'include',
  });
  return parseResponse(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(res);
}

export async function logout() {
  const res = await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return parseResponse(res);
}

export async function changePassword(currentPassword, newPassword) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return parseResponse(res);
}

const CHECK_INFO = {
  https: {
    passLabel: 'HTTP-соединения не обнаружены',
    failLabel: 'Обнаружены незащищенные HTTP-соединения',
    severity: 'Высокий',
    color: 'bg-orange-500',
    art: 'HTTPS',
  },
  'ssl/tls': {
    passLabel: 'SSL/TLS-соединения настроены корректно',
    failLabel: 'SSL/TLS: небезопасное соединение',
    severity: 'Критично',
    color: 'bg-red-500',
    art: 'SSL',
  },
  ips: {
    passLabel: 'Серверы расположены в допустимых юрисдикциях',
    failLabel: 'Серверы за пределами РФ',
    severity: 'Высокий',
    color: 'bg-orange-500',
    art: 'Геолокация',
  },
  'cookie-ads': {
    passLabel: 'Сторонние трекеры и реклама не обнаружены',
    failLabel: 'Обнаружены сторонние трекеры или реклама',
    severity: 'Средний',
    color: 'bg-blue-500',
    art: 'Трекеры',
  },
  'sep-consent': {
    passLabel: 'Отдельное согласие на обработку ПД найдено',
    failLabel: 'Нет отдельного согласия на обработку ПД',
    severity: 'Критично',
    color: 'bg-red-500',
    art: 'Ст. 9',
  },
  'foreign-words': {
    passLabel: 'Иностранные слова без перевода не обнаружены',
    failLabel: 'Использование иностранных слов без перевода',
    severity: 'Низкий',
    color: 'bg-gray-400',
    art: 'Язык',
  },
  'privacy-policy': {
    passLabel: 'Политика конфиденциальности найдена',
    failLabel: 'Политика конфиденциальности не найдена',
    severity: 'Критично',
    color: 'bg-red-500',
    art: 'Политика',
  },
  'cookie-banner': {
    passLabel: 'Cookie-баннер согласия найден',
    failLabel: 'Отсутствует корректный cookie-баннер согласия',
    severity: 'Средний',
    color: 'bg-blue-500',
    art: 'Cookie',
  },
  'consent-forms': {
    passLabel: 'Формы согласия на обработку ПД найдены',
    failLabel: 'Нет форм согласия на обработку ПД',
    severity: 'Высокий',
    color: 'bg-orange-500',
    art: 'Формы',
  },
  'email-pdn': {
    passLabel: 'Email для запросов по ПД найден',
    failLabel: 'Нет email для запросов по ПД',
    severity: 'Средний',
    color: 'bg-blue-500',
    art: 'Контакты',
  },
  'ad-marking': {
    passLabel: 'Присутствует маркировка рекламы',
    failLabel: 'Отсутствует маркировка рекламы',
    severity: 'Средний',
    color: 'bg-blue-500',
    art: 'Реклама',
  },
  'minors-data': {
    passLabel: 'Нарушений по данным несовершеннолетних не обнаружено',
    failLabel: 'Проблемы с обработкой данных несовершеннолетних',
    severity: 'Критично',
    color: 'bg-red-500',
    art: 'Дети',
  },
  'special-categ': {
    passLabel: 'Спецкатегории ПД не обрабатываются или оформлены корректно',
    failLabel: 'Проблемы с обработкой спецкатегорий ПД',
    severity: 'Высокий',
    color: 'bg-orange-500',
    art: 'Спецкатегории',
  },
  forms: {
    passLabel: 'Формы сбора ПД оформлены корректно',
    failLabel: 'Формы сбора ПД без согласия',
    severity: 'Высокий',
    color: 'bg-orange-500',
    art: 'Формы',
  },
};

export function getCheckInfo(id, result) {
  const info = CHECK_INFO[id];
  if (!info) return { label: id, severity: 'Средний', color: 'bg-blue-500', art: id };

  return {
    ...info,
    label: result === 'ok' ? info.passLabel : info.failLabel,
  };
}

export function calcRiskScore(results) {
  if (!results || results.length === 0) return 0;
  const fails = results.filter(r => r.result === 'fail').length;
  const warns = results.filter(r => r.result === 'warn').length;
  const score = 100 - (fails * 25 + warns * 10);
  return Math.max(0, Math.min(100, score));
}
