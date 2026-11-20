"use client";

import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import type { Concert } from "@/types/type";

const extract = (data: unknown): Concert[] => {
  if (Array.isArray(data)) return data as Concert[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const k of ["concerts", "data", "events"]) if (Array.isArray(d[k])) return d[k] as Concert[];
  }
  return [];
};

/** Satu sumber data landing (lineup + statistik): GET /concerts. Tanpa data karangan. */
export function useLandingConcerts() {
  return useApiResource("landing-concerts", async () => extract(await apiGet<unknown>("/concerts")));
}
