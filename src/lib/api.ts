const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:1420/api/v1";

// status 0 = request tidak sampai ke server (backend mati / jaringan putus)
export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

// Backend mengirim dua bentuk error:
//   { error: "pesan" }                       -> error lama
//   { error: { code: "SALES_CLOSED", message } } -> aturan bisnis (PRD §4)
// Selalu hasilkan message berupa string, jangan pernah "[object Object]".
export function parseApiError(status: number, body: unknown): ApiError {
  const fallback = `Request failed (${status})`;
  const err = body && typeof body === "object" ? (body as { error?: unknown }).error : undefined;
  if (typeof err === "string" && err.trim()) return new ApiError(status, err);
  if (err && typeof err === "object") {
    const { code, message } = err as { code?: unknown; message?: unknown };
    return new ApiError(
      status,
      typeof message === "string" && message.trim() ? message : fallback,
      typeof code === "string" ? code : undefined
    );
  }
  return new ApiError(status, fallback);
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch (cause) {
    throw new ApiError(0, cause instanceof Error ? cause.message : "Network error", "NETWORK_ERROR");
  }

  const body: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = parseApiError(res.status, body);
    // suspend berlaku langsung (PRD §4.5): shell Creator Studio mendengarkan event ini
    if (err.code === "ORGANIZER_SUSPENDED" && typeof window !== "undefined") {
      window.dispatchEvent(new Event("wavy:organizer-suspended"));
    }
    throw err;
  }
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