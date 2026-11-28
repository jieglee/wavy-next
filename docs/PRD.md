# Wavy — PRD (Product Requirements, versi ringkas)

> Dokumen acuan scope & aturan bisnis. Versi **v2** (2 role), rencana lengkap di `docs/PLAN-v2.md`,
> skema database di `docs/DATABASE.md`. `docs/AUDIT.md` adalah snapshot sebelum v2.
> Kalau ada konflik antara dokumen ini dan kode, dokumen ini yang benar — kodenya yang diperbaiki.

## 1. Ringkasan

Wavy adalah platform tiket konser. Event, artis, dan kategori tiket **milik platform** dan dikelola **admin**;
**customer** mencari konser, membeli tiket, dan masuk venue dengan QR.
Proyek UKK Rekayasa Perangkat Lunak. Format aplikasi: **web app responsif** (admin + customer), ditambah **app mobile khusus customer** (`wavy-mobile`).

- Frontend: `wavy-next` — Next.js 16, React 19, Tailwind v4, next-intl (id/en)
- Backend: `wavy-backend` — Bun + Hono + raw SQL (postgres-js), NeonDB, base path `/api/v1`, port 1420. Skema: `db/migrations/*.sql`.
- Mobile: `wavy-mobile` — Expo SDK 58 + expo-router + TypeScript + NativeWind, jalan di Expo Go. **Hanya role customer**; admin tetap di web. Memakai endpoint backend yang sama dengan web, tanpa endpoint khusus mobile.
  - Scope mobile: login OTP (+ isi nama untuk akun baru), beranda, jelajah (search + filter kategori), detail konser, checkout (1 kategori, maks 4 tiket), detail order + bayar Midtrans Snap (WebView), tiket saya + QR + transfer, riwayat order, profil (ubah nama) & level, notifikasi.
  - Tidak di mobile: favorit/follow, review.
  - Aturan desain sama dengan web (token `docs/DESIGN.md` §2, tipografi §3, badge §6); layout disesuaikan untuk HP.

## 2. Role

| Role | Login | Area |
|---|---|---|
| Customer | Email → OTP (passwordless). Email baru = akun dibuat otomatis, lalu **isi nama** sebelum masuk | Landing, browse/detail konser, checkout, tiket saya, riwayat order, profil |
| Admin | Email + password (JWT admin, cookie terpisah dari sesi customer) | Portal `/admin/*`: dashboard, event, kategori tiket, artis, verifikasi pembayaran, scan tiket |

Tidak ada role organizer/EO. Tidak ada halaman daftar terpisah: masuk & daftar customer adalah satu alur.

## 3. Scope per role

### Customer
- Masuk: email → OTP 6 digit → bila `needs_name` isi nama (2–80 karakter) → `PATCH /me`
- Browse & cari konser (filter kategori, search)
- Detail konser: info, artis, kategori tiket + harga + sisa kuota + status penjualan
- Checkout: pilih **satu kategori** & jumlah (maks 4), data pemesan, setuju S&K, bayar (Midtrans) atau tunggu verifikasi manual
- Tiket saya: daftar tiket + **QR yang benar-benar dirender**, transfer tiket ke email lain
- Riwayat order + detail order (status: `pending_payment` / `paid` / `expired` / `rejected` / `refunded` / `cancelled`)
- Profil: ubah nama, level (`/me/level`), favorit artis, notifikasi, "ingatkan saya" (notify-me), review

### Admin (portal `/admin`)
- Dashboard gabungan: pendapatan & tiket terjual (tren 7 hari), pending aktif, check-in, order per status, event tayang, sisa kuota, customer, pendapatan harian, kuota terisi per kategori, event terlaris, order terbaru (chart pakai Bklit)
- CRUD event (termasuk **edit**), satu artis per event (`events.artist_id`)
- CRUD artis (artis yang dipakai event tidak bisa dihapus → 409 `ARTIST_HAS_EVENTS`)
- CRUD kategori tiket (termasuk **edit & hapus**), kuota per kategori
- Tenggat penjualan: `sales_start_at` / `sales_end_at`
- Publish (wajib ada kategori), close sales manual, **buka lagi penjualan** (`reopen-sales`, tanpa notifikasi ulang)
- Verifikasi pembayaran manual (approve/reject, dicatat di `orders.verified_by`) dan refund
- Scan/validasi QR tiket (anti-duplikat, dicatat di `tickets.scanned_at` / `scanned_by`)

## 4. Aturan bisnis (wajib ditegakkan di backend)

1. **Status penjualan dihitung, bukan disimpan manual saja.** Penjualan terbuka hanya jika:
   event `published` (tidak di-close manual) **dan** `now` di antara `sales_start_at` dan `sales_end_at` **dan** kuota masih ada.
2. **`POST /orders` menolak** order untuk event yang closed / di luar tenggat / kuota habis (error berkode, bukan 500). Kategori wajib milik event order (FK komposit di DB).
3. **Anti-oversell:** kuota terpakai = order `paid` + order `pending_payment` yang belum expired. Cek & reservasi dalam satu transaksi SQL (row lock pada kategori tiket).
4. **Order pending expired setelah 15 menit.** Dicek saat query (lazy expiry) — tidak butuh cron. Order expired melepas kuota.
5. **Sesi admin terpisah dari sesi customer.** Semua `/admin/*` (kecuali login) wajib JWT admin; token customer ditolak. Proxy web menolak `/admin/*` tanpa cookie admin.
6. **Pembayaran:** Midtrans Snap (sandbox). Webhook memverifikasi signature → order `paid` → tiket + QR terbit. Expired/deny → order `expired`, kuota kembali. Verifikasi manual admin tetap ada sebagai cadangan.
7. **Nama customer** 2–80 karakter, divalidasi di backend (`PATCH /me`) dan klien; `customers.name` NULL sampai diisi.

## 5. Kebutuhan non-fungsional

- **Responsif** mobile-first; semua halaman (termasuk portal admin) harus layak di lebar 360px.
- **Error harus kelihatan.** Dilarang fallback ke data mock dan dilarang toast sukses palsu saat API gagal.
- **i18n** id/en untuk semua teks UI baru.
- **Konsistensi desain** mengikuti `docs/DESIGN.md` (token, bukan hex langsung).
- **Skema database** hanya dari `db/migrations/*.sql`; semua relasi FK, nilai terbatas CHECK (`docs/DATABASE.md`).

## 6. Fase kerja

Setiap fitur/fix = branch baru, commit rutin, review lewat PR. Fase 0–5 (v1) sudah selesai; v2:

| Fase | Isi | Selesai jika |
|---|---|---|
| v2-1 | Hapus role organizer, data & script scrape | Tidak ada tabel/endpoint/halaman EO; e2e 2 role lolos |
| v2-2 | Skema v2 (FK, CHECK, kolom audit), reset Neon | `db/migrations/001_init.sql` dipakai produksi & test |
| v2-3 | Login customer satu alur (web + mobile) | Akun baru wajib isi nama; layar Daftar mobile hilang |
| v2-4 | Dokumen (PRD, DESIGN, DATABASE) | Dokumen sesuai kode |
| ditunda | Venue & pemilih section 3D/2D | Lihat `docs/PLAN-v2.md` §7 |

## 7. Skenario demo UKK (dipakai sebagai uji akhir — `e2e/demo.mjs`)

1. Admin login → buat event + 2 kategori tiket (kuota kecil, mis. 3) + tenggat → publish (tanpa kategori ditolak).
2. Customer baru login OTP → isi nama → buka detail → checkout → bayar sandbox / admin verifikasi → tiket + QR muncul di "Tiket saya".
3. Customer lain coba beli melebihi kuota → ditolak dengan pesan jelas.
4. Admin close sales → customer coba order → ditolak; admin buka lagi → penjualan terbuka.
5. Admin scan QR → valid; scan ulang → ditolak (duplikat).
6. Sesi customer tidak bisa membuka `/admin/*`; dashboard admin menampilkan tiket terjual & check-in yang sesuai.
7. Matikan backend → frontend menampilkan error, bukan data palsu.

## 8. Di luar scope

App mobile untuk admin, dev build/rilis store app mobile (cukup Expo Go untuk demo), refund otomatis, multi-currency,
upload bukti transfer (kecuali Midtrans batal dipakai), venue & pemilih section (ditunda, `docs/PLAN-v2.md` §7).
