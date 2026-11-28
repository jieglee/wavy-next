# E2E — skenario demo UKK (PRD §7)

`demo.mjs` menjalankan seluruh skenario demo dengan Chromium headless (playwright-core)
terhadap backend + Postgres **lokal** `*_test`. Tidak pernah ke Neon.

## Langkah

1. Backend (repo `wavy-backend`, skema v2: `chore/seed-demo-v2` atau lebih baru), DB lokal `wavy_test`
   yang skemanya sudah dibangun oleh `bun test` (`db/migrations/*.sql`):

   ```sh
   PORT=3002 DATABASE_URL=postgres://postgres:postgres@localhost:5432/wavy_test DATABASE_SSL=disable \
   SMTP_HOST=127.0.0.1 SMTP_PORT=2525 SMTP_USER=e2e SMTP_PASS=e2e SMTP_FROM=e2e@wavy.test \
   JWT_SECRET=e2e-secret MIDTRANS_SERVER_KEY= bun src/index.ts
   ```

   Email OTP diterima sink SMTP palsu milik skrip (`smtp-sink.mjs`); kode OTP dibaca dari tabel `otp_codes`.

2. Frontend (port 3001 — termasuk origin yang diizinkan CORS backend):

   ```sh
   NEXT_PUBLIC_API_URL=http://localhost:3002/api/v1 npx next build && npx next start -p 3001
   ```

3. Jalankan:

   ```sh
   cd e2e && npm install && npm run demo
   ```

Env opsional: `E2E_WEB`, `E2E_API`, `E2E_DB_URL` (wajib localhost + nama `*_test`), `E2E_SMTP_PORT`,
`CHROMIUM_PATH`, `E2E_HEADED=1`.

Skenario memakai dua role: **admin** (buat event, kategori, publish, verifikasi bayar, tutup/buka lagi
penjualan, scan, dashboard) dan **customer** (email -> OTP -> isi nama untuk akun baru, ubah nama di `/me`,
checkout, tiket QR). Juga dicek: halaman & endpoint EO lama 404, tidak melebar di 360px.

Hasil per langkah tercetak di terminal dan disimpan di `e2e/artifacts/result.json`; screenshot
kegagalan di `e2e/artifacts/fail-*.png`.

Catatan: langkah 7 ("backend mati") disimulasikan dengan memblokir semua request ke API di browser
(`connectionrefused`), sehingga backend tidak perlu dimatikan di tengah skenario.
