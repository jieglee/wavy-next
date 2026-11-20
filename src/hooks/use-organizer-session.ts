"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, apiGet, clearAuthSession } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken, useAuthUser } from "@/hooks/use-auth-session";

export type OrganizerProfile = { id: number; name: string; email: string; status: string };

/** Event global dari lib/api saat backend membalas 403 ORGANIZER_SUSPENDED. */
export const ORGANIZER_SUSPENDED_EVENT = "wavy:organizer-suspended";

const isSuspended = (err: unknown) =>
  err instanceof ApiError && err.status === 403 && err.code === "ORGANIZER_SUSPENDED";

/**
 * Sesi Creator Studio: wajib token organizer, profil diambil dari GET /organizer/me.
 * 401 -> login ulang; 403 suspended (dari /me atau request lain) -> sesi dihapus, ke login.
 * Error lain (mis. backend mati) tidak mengusir user; halaman menampilkan error sendiri.
 */
export function useOrganizerSession() {
  const router = useRouter();
  const token = useAuthToken();
  const stored = useAuthUser<{ name?: string; email?: string }>();
  const me = useApiResource(token ? `organizer-me:${token}` : null, () => apiGet<OrganizerProfile>("/organizer/me"));

  useEffect(() => {
    // token dibaca lewat useSyncExternalStore; null saat render server, jadi cek langsung
    if (!localStorage.getItem("wavy_auth_token")) router.replace("/organizer/login");
  }, [router, token]);

  useEffect(() => {
    if (me.error === undefined) return;
    if (isSuspended(me.error)) {
      clearAuthSession();
      router.replace("/organizer/login?reason=suspended");
    } else if (me.error instanceof ApiError && me.error.status === 401) {
      clearAuthSession();
      router.replace("/organizer/login?reason=expired");
    }
  }, [me.error, router]);

  useEffect(() => {
    const onSuspended = () => {
      clearAuthSession();
      router.replace("/organizer/login?reason=suspended");
    };
    window.addEventListener(ORGANIZER_SUSPENDED_EVENT, onSuspended);
    return () => window.removeEventListener(ORGANIZER_SUSPENDED_EVENT, onSuspended);
  }, [router]);

  function logout() {
    clearAuthSession();
    router.replace("/organizer/login");
  }

  return {
    name: me.data?.name ?? stored?.name ?? "",
    email: me.data?.email ?? stored?.email ?? "",
    ready: !!token,
    logout,
  };
}
