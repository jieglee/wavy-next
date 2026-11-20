"use client";

import { useMemo, useSyncExternalStore } from "react";

// Baca sesi dari localStorage tanpa hydration mismatch: server & render hidrasi
// pertama memakai snapshot null, lalu client memperbarui dengan nilai asli.

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
};
const readKey = (key: string) => () => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const serverSnapshot = () => null;

const readToken = readKey("wavy_auth_token");
const readUser = readKey("wavy_auth_user");

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, readToken, serverSnapshot);
}

export function useAuthUser<T>(): T | null {
  const raw = useSyncExternalStore(subscribe, readUser, serverSnapshot);
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}
