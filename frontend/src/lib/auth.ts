import { apiFetch } from './api';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

// Токены живут в localStorage — так к ним могут обращаться и клиентские
// компоненты вроде корзины/избранного. Серверные компоненты (страницы,
// делающие fetch на сервере при рендере) их не видят и не должны —
// они дёргают только публичные GET-эндпоинты.
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// accessToken — обычный JWT, payload можно прочитать без проверки подписи
// (подпись всё равно проверяется backend'ом на каждый защищённый запрос).
// Пока используем только email для отображения в шапке/личном кабинете —
// роли в payload нет (см. auth/jwt.strategy.ts), для этого нужен /users/me.
export function decodeEmail(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const tokens = await apiFetch<AuthTokens>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(tokens);
  return tokens;
}

export async function register(input: RegisterInput): Promise<AuthTokens> {
  const tokens = await apiFetch<AuthTokens>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  setTokens(tokens);
  return tokens;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  clearTokens();
  if (!refreshToken) return;
  try {
    await apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    // токен уже удалён локально — если backend недоступен, не блокируем выход
  }
}

// Используется authFetch при 401: одна попытка обновить access-токен.
//
// Несколько параллельных запросов (например, страница "редактировать
// тексты" сохраняет сразу несколько полей отдельными вызовами) могут
// словить 401 одновременно. Без защиты каждый из них вызвал бы
// refreshTokens() независимо — все параллельно ушли бы на /auth/refresh
// с одним и тем же refresh-токеном, и backend уронил бы лишние вызовы
// с 500 (см. auth.service.ts). Поэтому здесь общий "in-flight" промис:
// первый вызов реально идёт в сеть, все остальные, пришедшие пока он не
// завершился, просто дожидаются того же результата.
let refreshInFlight: Promise<string> | null = null;

export async function refreshTokens(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('Aucun jeton de rafraîchissement disponible');

    const tokens = await apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    setTokens(tokens);
    return tokens.accessToken;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}
