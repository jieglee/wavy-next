"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { clearAdminSession, getAdminProfile, getAdminToken } from "@/lib/admin-session";

// cookie tidak punya event perubahan; snapshot dibaca ulang tiap render (string, jadi stabil)
const subscribe = () => () => {};
const serverSnapshot = () => null;

/**
 * Sesi panel admin: cookie "wavy_admin_token" dari POST /admin/login, terpisah dari sesi customer/EO.
 * Proxy sudah menolak /admin/* tanpa cookie ini; hook ini menjaga kasus cookie habis saat halaman terbuka.
 * Profil admin diambil dari GET /admin/me di AdminShell; 401 dari request admin dilaporkan lewat
 * `useAdminUnauthorized(error)`.
 */
export function useAdminSession() {
  const router = useRouter();
  const token = useSyncExternalStore(subscribe, getAdminToken, serverSnapshot);

  useEffect(() => {
    // snapshot null saat render server/hidrasi, jadi cek cookie langsung
    if (!getAdminToken()) router.replace("/admin/login");
  }, [router, token]);

  function logout() {
    clearAdminSession();
    router.replace("/admin/login");
  }

  const profile = token ? getAdminProfile() : null;
  return {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    /** true bila token admin sudah terbaca di client — dipakai sebagai syarat fetch */
    ready: !!token,
    logout,
  };
}

/** 401 dari endpoint admin (token kedaluwarsa / bukan admin) -> hapus sesi admin, ke login admin. */
export function useAdminUnauthorized(...errors: unknown[]) {
  const router = useRouter();
  const unauthorized = errors.some((e) => e instanceof ApiError && e.status === 401);
  useEffect(() => {
    if (!unauthorized) return;
    clearAdminSession();
    router.replace("/admin/login?reason=expired");
  }, [unauthorized, router]);
}
