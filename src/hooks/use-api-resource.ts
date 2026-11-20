"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";

type Settled<T> = { key: string | null; data?: T; error?: unknown };

export type ApiResource<T> = {
  /** true sampai request untuk `key` saat ini selesai (termasuk saat key masih null) */
  loading: boolean;
  data: T | undefined;
  error: unknown;
  /** ulangi request (tombol "coba lagi") */
  reload: () => void;
  /** ubah data lokal setelah mutasi berhasil (mis. tandai notifikasi dibaca) */
  mutate: (update: (prev: T) => T) => void;
};

/**
 * Fetch data untuk halaman dengan state loading / error yang eksplisit — tanpa data mock.
 *
 * `key` mengidentifikasi request (mis. path + filter). Saat key berubah, data lama
 * disembunyikan dan `loading` kembali true. `key = null` berarti belum siap
 * (mis. token belum terbaca) dan diperlakukan sebagai loading.
 *
 * Status loading diturunkan dari key, bukan setState sinkron di dalam effect
 * (aturan react-hooks/set-state-in-effect).
 */
export function useApiResource<T>(key: string | null, fetcher: () => Promise<T>): ApiResource<T> {
  const [nonce, setNonce] = useState(0);
  const requestKey = key === null ? null : `${key}#${nonce}`;
  const [settled, setSettled] = useState<Settled<T>>({ key: null });

  const run = useEffectEvent(() => fetcher());

  useEffect(() => {
    if (requestKey === null) return;
    let cancelled = false;
    run().then(
      (data) => {
        if (!cancelled) setSettled({ key: requestKey, data });
      },
      (error: unknown) => {
        if (!cancelled) setSettled({ key: requestKey, error });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const loading = requestKey === null || settled.key !== requestKey;
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const mutate = useCallback(
    (update: (prev: T) => T) =>
      setSettled((s) => (s.data === undefined ? s : { ...s, data: update(s.data) })),
    []
  );

  return {
    loading,
    data: loading ? undefined : settled.data,
    error: loading ? undefined : settled.error,
    reload,
    mutate,
  };
}
