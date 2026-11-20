# Wavy — PRD (Product Requirements, versi ringkas)

> Dokumen acuan scope & aturan bisnis. Status per item mengacu ke `docs/AUDIT.md`.
> Kalau ada konflik antara dokumen ini dan kode, dokumen ini yang benar — kodenya yang diperbaiki.

## 1. Ringkasan

Wavy adalah marketplace tiket konser yang mempertemukan **Event Organizer (EO)** dengan **customer**.
Proyek UKK Rekayasa Perangkat Lunak. Format aplikasi: **satu web app responsif** (tidak ada app mobile terpisah).

- Frontend: `wavy-next` — Next.js 16, React 19, Tailwind v4, next-intl (id/en)
- Backend: `wavy-backend` — Bun + Hono + raw SQL (postgres-js), NeonDB, base path `/api/v1`, port 1420

## 2. Role

| Role | Login | Area |
|---|---|---|
| Customer | OTP email (passwordless, akun dibuat otomatis) | Landing, browse/detail konser, checkout, tiket saya, riwayat order, profil |
| Organizer (EO) | Email + password (JWT) | Creator Studio: dashboard, event, artist, kategori tiket, verifikasi pembayaran |
| Admin | JWT | Kelola organizer & platform |

"Creator" = nama area/menu untuk EO (Creator Studio), **bukan** role terpisah.

## 3. Scope per role

### Customer
- Browse & cari konser (filter, search)
- Detail konser: info, lineup artist, kategori tiket + harga + sisa kuota + status penjualan
- Checkout: pilih kategori & jumlah, data attendee, setuju T&C, bayar (Midtrans)
- Tiket saya: daftar tiket + **QR yang benar-benar dirender**
- Riwayat order + detail order (status: pending / paid / expired / cancelled)
- Profil & level (`/me/level`)

### Organizer (Creator Studio)
- Dashboard: penjualan, pendapatan, kuota terisi, check-in (chart pakai Bklit)
- CRUD event (termasuk **edit**), CRUD artist
- CRUD kategori tiket (termasuk **edit & hapus**), kuota per kategori
- Tenggat penjualan: `sales_start_at` / `sales_end_at`
- Close sales manual (override)
- Verifikasi pembayaran manual (cadangan kalau tidak lewat Midtrans)
- Scan/validasi QR tiket (anti-duplikat — backend sudah ada)

### Admin
- Daftar & detail organizer, suspend / aktifkan (berlaku **langsung**)
- Ringkasan platform (jumlah event, order, pendapatan)
- Moderasi event (lihat, nonaktifkan bila perlu)

## 4. Aturan bisnis (wajib ditegakkan di backend)

1. **Status penjualan dihitung, bukan disimpan manual saja.** Penjualan terbuka hanya jika:
   event tidak di-close manual **dan** `now` di antara `sales_start_at` dan `sales_end_at` **dan** kuota masih ada.
2. **`POST /orders` menolak** order untuk event yang closed / di luar tenggat / kuota habis (error jelas, bukan 500).
3. **Anti-oversell:** kuota terpakai = order `paid` + order `pending` yang belum expired. Cek & reservasi dalam satu transaksi SQL (row lock pada kategori tiket).
4. **Order pending expired setelah 15 menit.** Dicek saat query (lazy expiry) — tidak butuh cron. Order expired melepas kuota.
5. **Suspend organizer berlaku langsung:** middleware auth organizer mengecek status di DB tiap request, bukan cuma validitas JWT.
6. **Pembayaran:** Midtrans Snap (sandbox). Webhook memverifikasi signature → order `paid` → tiket + QR terbit. Expired/deny → order `expired`, kuota kembali. Verifikasi manual EO tetap ada sebagai cadangan.

## 5. Kebutuhan non-fungsional

- **Responsif** mobile-first; semua halaman (termasuk dashboard EO/admin) harus layak di lebar 360px.
- **Error harus kelihatan.** Dilarang fallback ke data mock dan dilarang toast sukses palsu saat API gagal.
- **i18n** id/en untuk semua teks UI baru.
- **Konsistensi desain** mengikuti `docs/DESIGN.md` (token, bukan hex langsung).

## 6. Fase kerja

Setiap fase/fitur = branch baru dari `main`, commit rutin, review lewat PR.

| Fase | Isi | Selesai jika |
|---|---|---|
| 0 | Merge branch fitur yang tertunda (`feat/checkout-tnc-kategori-dob`, `feat/order-attendee-data`) | `main` berisi keduanya, tidak ada konflik |
| 1 | Fix backend: aturan bisnis 1–5 | Order ke event closed/lewat tenggat ditolak; tidak bisa oversell walau ada order pending; suspend langsung memblokir |
| 1b | Fix frontend: path `/me`, hapus order palsu & fallback mock, render QR | Semua bug poin 5–7 audit hilang |
| 2 | Fondasi desain: `shadcn init`, Bklit, satu set token warna | Tiga set warna digabung jadi satu; tidak ada hex langsung di halaman |
| 3 | Halaman baru: Creator Studio, admin, area customer | Semua item di §3 ada & responsif |
| 4 | Midtrans | Alur bayar sandbox end-to-end + webhook |
| 5 | Redesign landing page (scroll motion) | Sesuai §Landing di DESIGN.md |

## 7. Skenario demo UKK (dipakai sebagai uji akhir)

1. EO login → buat event + 2 kategori tiket (kuota kecil, mis. 3) + tenggat → publish.
2. Customer login OTP → buka detail → checkout → bayar sandbox → tiket + QR muncul di "Tiket saya".
3. Customer lain coba beli melebihi kuota → ditolak dengan pesan jelas.
4. EO close sales → customer coba order → ditolak.
5. EO scan QR → valid; scan ulang → ditolak (duplikat).
6. Admin suspend EO → EO langsung tidak bisa akses dashboard.
7. Matikan backend → frontend menampilkan error, bukan data palsu.

## 8. Di luar scope

App mobile native, refund otomatis, multi-currency, upload bukti transfer (kecuali Midtrans batal dipakai).
