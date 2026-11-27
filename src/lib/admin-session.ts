// Sesi admin terpisah dari sesi customer/EO (yang memakai localStorage "wavy_auth_*").
// Token admin disimpan di cookie supaya proxy bisa menolak /admin/* sebelum halaman dirender;
// login sebagai customer/EO tidak menyentuh cookie ini, dan login admin tidak menyentuh sesi customer/EO.
import { ApiError, api } from "@/lib/api";
import { ADMIN_TOKEN_COOKIE, isAdminTokenUsable } from "@/lib/admin-token";
const ADMIN_USER_KEY = "wavy_admin_user";
const MAX_AGE = 60 * 60 * 24; // = masa berlaku JWT admin dari backend (24 jam)

export type AdminProfile = { id: number; name: string; email: string };

export function getAdminToken(): string | null {
  if (typeof document === "undefined") return null;
  const hit = document.cookie.split("; ").find((c) => c.startsWith(`${ADMIN_TOKEN_COOKIE}=`));
  const token = hit ? decodeURIComponent(hit.slice(ADMIN_TOKEN_COOKIE.length + 1)) : null;
  return isAdminTokenUsable(token) ? token : null;
}

export function setAdminSession(token: string, admin: AdminProfile) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE}; SameSite=Strict${secure}`;
  try {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(admin));
  } catch {
    /* profil hanya untuk tampilan awal; /admin/me tetap sumber utama */
  }
}

export function clearAdminSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Strict`;
  try {
    localStorage.removeItem(ADMIN_USER_KEY);
  } catch {
    /* abaikan */
  }
}

export function getAdminProfile(): AdminProfile | null {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    return raw ? (JSON.parse(raw) as AdminProfile) : null;
  } catch {
    return null;
  }
}

// Request admin selalu memakai token admin — tidak pernah jatuh ke token customer/EO.
function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) return Promise.reject(new ApiError(401, "admin session missing"));
  return api<T>(path, { ...init, headers: { ...(init.headers as Record<string, string>), Authorization: `Bearer ${token}` } });
}

export const adminGet = <T>(path: string) => adminRequest<T>(path);

export const adminPatch = <T>(path: string, data?: unknown) =>
  adminRequest<T>(path, { method: "PATCH", body: data === undefined ? undefined : JSON.stringify(data) });

// Antrean verifikasi berubah (setujui/tolak/suspend): shell admin memuat ulang badge jumlah pending.
export const ADMIN_ORGANIZERS_CHANGED = "wavy:admin-organizers-changed";
export const notifyOrganizersChanged = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(ADMIN_ORGANIZERS_CHANGED));
};
