const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1420/api/v1";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wavy_auth_token");
}

export function setAuthToken(token: string, role?: string, user?: object) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wavy_auth_token", token);
  if (role) localStorage.setItem("wavy_auth_role", role);
  if (user) localStorage.setItem("wavy_auth_user", JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("wavy_auth_token");
  localStorage.removeItem("wavy_auth_role");
  localStorage.removeItem("wavy_auth_user");
}

export function getAuthUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("wavy_auth_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getAuthRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wavy_auth_role");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((init?.headers as Record<string, string>) ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  const body = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new ApiError(res.status, body.error ?? `Request failed (${res.status})`);
  return body as T;
}

export const apiGet = <T>(path: string, token?: string) =>
  api<T>(path, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);

export const apiPost = <T>(path: string, data?: unknown, token?: string) =>
  api<T>(path, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });

export const apiPut = <T>(path: string, data?: unknown, token?: string) =>
  api<T>(path, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });

export const apiPatch = <T>(path: string, data?: unknown, token?: string) =>
  api<T>(path, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });

export const apiDelete = <T>(path: string, token?: string) =>
  api<T>(path, {
    method: "DELETE",
    ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
  });