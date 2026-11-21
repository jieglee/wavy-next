// Dipakai proxy dan client: tanpa dependensi browser selain atob.
export const ADMIN_TOKEN_COOKIE = "wavy_admin_token";

/**
 * Cek cepat isi JWT admin tanpa verifikasi tanda tangan (backend tetap memverifikasi setiap request).
 * Dipakai proxy (edge/node) dan client, jadi hanya memakai atob.
 */
export function isAdminTokenUsable(token: string | null | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const part = token.split(".")[1];
  if (!part) return false;
  try {
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    const payload = JSON.parse(json) as { admin_id?: unknown; exp?: unknown };
    if (typeof payload.admin_id !== "number") return false;
    return typeof payload.exp !== "number" || payload.exp * 1000 > now;
  } catch {
    return false;
  }
}
