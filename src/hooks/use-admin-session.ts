"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, clearAuthSession } from "@/lib/api";
import { useAuthToken, useAuthUser } from "@/hooks/use-auth-session";

const readRole = () => {
  try {
    return localStorage.getItem("wavy_auth_role");
  } catch {
    return null;
  }
};

/**
 * Sesi panel admin: wajib token dengan role "admin" (disimpan saat POST /admin/login).
 * Token lain (customer/organizer) atau tidak ada token -> ke /admin/login.
 * Profil admin diambil dari GET /admin/me di AdminShell; 401 dari request admin dilaporkan lewat
 * `useAdminUnauthorized(error)`.
 */
export function useAdminSession() {
  const router = useRouter();
  const token = useAuthToken();
  const user = useAuthUser<{ name?: string; email?: string }>();

  useEffect(() => {
    // token dibaca lewat useSyncExternalStore; null saat render server, jadi cek langsung
    if (!localStorage.getItem("wavy_auth_token") || readRole() !== "admin") router.replace("/admin/login");
  }, [router, token]);

  function logout() {
    clearAuthSession();
    router.replace("/admin/login");
  }

  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    /** true bila token admin sudah terbaca di client — dipakai sebagai syarat fetch */
    ready: !!token && readRole() === "admin",
    logout,
  };
}

/** 401 dari endpoint admin (token kedaluwarsa / bukan admin) -> hapus sesi, ke login admin. */
export function useAdminUnauthorized(...errors: unknown[]) {
  const router = useRouter();
  const unauthorized = errors.some((e) => e instanceof ApiError && e.status === 401);
  useEffect(() => {
    if (!unauthorized) return;
    clearAuthSession();
    router.replace("/admin/login?reason=expired");
  }, [unauthorized, router]);
}
