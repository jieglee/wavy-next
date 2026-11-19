# Audit Project Wavy

Tanggal: 2026-11-20
Cakupan: `wavy-next` (frontend) dan `wavy-backend` (Hono). Audit ini read-only, tidak ada kode yang diubah.

Snapshot yang diaudit:

| Repo | Branch | Commit |
|---|---|---|
| wavy-next | `feat/checkout-tnc-kategori-dob` | `9aa024a` (1 commit di depan `main`) |
| wavy-backend | `feat/order-attendee-data` | `ac54d0a` (1 commit di depan `main`) |

Keterangan status: **Ada** = berfungsi end-to-end, **Sebagian** = ada tapi kurang/bermasalah, **Belum** = tidak ada.

---

## 1. Frontend (wavy-next)

### 1.1 Versi stack

| Paket | Versi |
|---|---|
| Next.js | 16.2.12 (App Router; middleware bernama `src/proxy.ts`) |
| React / React DOM | 19.2.4 |
| Tailwind CSS | v4 (`@tailwindcss/postcss`, konfigurasi via `@theme inline` di `globals.css`, tanpa `tailwind.config`) |
| TypeScript | ^5 |
| shadcn/ui | **Tidak terpasang** (tidak ada `components.json`, `components/ui/`, `clsx`, `tailwind-merge`, Radix, atau `class-variance-authority`) |
| i18n | next-intl ^4.13.6, locale `id` (default), `en`, `ko` |
| Auth | next-auth ^4.24.15 (route `/api/auth/[...nextauth]`), tapi token API disimpan di `localStorage` (`wavy_auth_token`) |
| Animasi | motion / framer-motion ^12.43.0, aos ^2.3.4 |
| Ikon | lucide-react, @tabler/icons-react |
| Toast | react-hot-toast |

### 1.2 Route (`src/app`)

Semua halaman berada di bawah `[locale]` (`/id/...`, `/en/...`, `/ko/...`).

| Route | Fungsi | Sumber data |
|---|---|---|
| `/` | Landing | `/concerts`, `/homepage` |
| `/home` | Beranda (sudah login) | `/concerts`, `/homepage` + hotels.json |
| `/auth/login` | Login customer (OTP email) | `/auth/send-otp`, `/auth/verify-otp` |
| `/concerts` | Browse/daftar konser | `/concerts` |
| `/concerts/[id]` | Detail konser | `/concerts/:id`, review, follow artist |
| `/concerts/[id]/checkout` | Checkout (data pembeli, T&C, metode bayar) | `POST /orders` |
| `/concerts/[id]/queue` | Waiting room / waiting list | `/concerts/:id/waiting-room`, `/waiting-list` |
| `/orders/[id]` | Detail order + instruksi bayar | `/orders/:id` (fallback mock) |
| `/tickets` | Dompet tiket + transfer | `/tickets` (fallback mock) |
| `/me` | Profil customer | lihat temuan di 3.3 |
| `/hotels/[id]` | Detail hotel (traveler mode) | `src/data/hotels.json` (statis) |
| `/organizer/login` | Login EO | `/auth/organizer/login` |
| `/organizer/register` | Registrasi EO | `/auth/organizer/register` |
| `/organizer/dashboard` | Dashboard EO | `/organizer/dashboard` |
| `/organizer/events` | Kelola event & kategori tiket | `/organizer/events*` (fallback mock) |
| `/organizer/artists` | CRUD artis | `/organizer/artists*` |
| `/organizer/orders` | Verifikasi pembayaran & refund | `/organizer/orders*` |
| `/organizer/scan` | Validasi QR di gate | `/organizer/scan/validate` |
| `/admin/login` | Login admin | `/admin/login` |
| `/admin/dashboard` | Statistik, organizer, event, customer | `/admin/*` |
| `/api/auth/[...nextauth]` | Route handler next-auth | - |

### 1.3 Komponen (`src/components`)

- **app/**: `navbar`, `footer`, `welcome-banner`
- **auth/**: `login-otp`
- **concerts/**: `concert-artist`, `concert-booking-card`, `concert-card`, `concert-countdown`, `concert-description`, `concert-for-you`, `concert-gallery`, `concert-hero`, `concert-organizer-share`, `concert-review-modal`, `concert-reviews`, `concert-seatmap`, `concert-sticky-bar`, `concert-sticky-header`, `concert-tabs`, `concert-terms`, `concert-ticket-sidebar`
- **landing/**: `benefits`, `cta-banner`, `discover-countries`, `featured`, `featured-events`, `featured-picks`, `footer`, `how-it-works`, `navbar`, `promo-carousel`, `testimonials`, `traveler-mode`, `wavy-icon`, `wavy-icon-animated`
- **nav/**: `animated-search-placeholder`, `category-dropdown`, `search-dropdown`
- **root**: `aos-provider`, `scroll-to-top`, `splash-screen`, `splash-wrapper`, `toaster`
- Lainnya: `src/layout/layout.tsx`, `src/layout/navbar.tsx` (ada dua navbar lain di `components/app` dan `components/landing`, sehingga totalnya tiga)

Tidak ada library komponen dasar (button, input, dialog, dll.). Elemen UI ditulis langsung dengan kelas Tailwind per halaman.

### 1.4 Design token (`src/app/globals.css`, `src/lib/fonts.ts`)

**Font**

| Token | Nilai |
|---|---|
| `--font-sans`, `--font-display`, `--font-mono` | Poppins (400/500/600) via `next/font/google` |
| `--font-brand` | Bagel Fat One (400) |

Catatan: `--font-mono` juga diarahkan ke Poppins.

**Warna** (didefinisikan di `@theme inline`)

| Grup | Token | Hex |
|---|---|---|
| Wavy (semantik) | `wavy-bg` | `#FFFFFF` |
| | `wavy-surface` | `#F0EFF7` |
| | `wavy-accent` | `#FF5470` |
| | `wavy-blue` | `#1E40AF` |
| | `wavy-border` | `#E6E4F0` |
| | `wavy-text-primary` | `#1B1A24` |
| | `wavy-text-secondary` | `#6E6B80` |
| Set lama | `plum-black` | `#1B1A24` |
| | `graphite-plum` | `#F0EFF7` |
| | `off-white` | `#1B1A24` (namanya off-white, nilainya gelap) |
| | `lavender-gray` | `#6E6B80` |
| | `coral-spotlight` | `#FF5470` |
| | `azure` | `#1E40AF` |
| | `lime` | `#C6FF5C` |
| | `border-dark` | `#E6E4F0` |
| Set hangat | `ivory` | `#F7F4EF` |
| | `white-pure` | `#FFFFFF` |
| | `dark-plum` | `#1D1B24` |
| | `abu-ungu` | `#6B6875` |
| | `coral-gelap` | `#E63950` |
| | `lime-pucat` | `#EAF5D0` |
| | `olive-gelap` | `#4B7A23` |
| | `border-hangat` | `#E5E1DA` |

Temuan:
- Ada tiga set token yang sebagian besar duplikat (misalnya `#FF5470` punya dua nama, `#1B1A24` punya tiga).
- Banyak halaman memakai hex literal (`text-[#6B6875]`, `text-[#FF5470]`, `bg-[#F8F8FA]`, `#1B1A3A`, `#111827`) dan tidak memakai token.
- Belum ada dark mode maupun token semantik gaya shadcn (`--background`, `--foreground`, `--primary`, `--chart-*`).

**Spacing / radius**: tidak ada token kustom. Semuanya memakai skala default Tailwind v4 (gutter umumnya `px-4`/`px-6`, kartu `rounded-xl`/`rounded-2xl`).

### 1.5 Kompatibilitas Bklit UI

Bklit UI adalah registry shadcn untuk komponen chart React. Cara pasangnya `npx shadcn@latest init` lalu `npx shadcn@latest add @bklit/<chart>`, dan theming-nya berbasis CSS variable.

| Syarat | Status di wavy-next |
|---|---|
| React 19 / Next App Router | OK |
| Tailwind v4 | OK |
| Alias `@/*` di tsconfig | OK (`@/*` -> `./src/*`) |
| `motion` | Sudah terpasang |
| shadcn sudah di-init (`components.json`) | **Belum** |
| Helper `cn` (clsx + tailwind-merge) | **Bentrok**: `src/lib/utils.ts` sudah punya `cn` versi sendiri (hanya filter + join, tanpa merge) |
| CSS variable shadcn (`--background`, `--chart-1..5`, dll.) | **Belum ada** |

**Kesimpulan:** secara stack seharusnya kompatibel, tapi belum bisa langsung dipakai. Perlu `shadcn init` lebih dulu, dan langkah itu akan:
1. membuat `components.json`,
2. menimpa/menambah `src/lib/utils.ts` (`cn` lama perlu diganti versi clsx + tailwind-merge; perilakunya kompatibel untuk pemakaian sekarang),
3. menambahkan blok CSS variable ke `globals.css`. Variable `--chart-*` perlu dipetakan ke palet Wavy.

Belum diuji dengan instalasi nyata. Daftar dependensi npm per chart (misalnya visx) belum terkonfirmasi dari dokumentasi resmi, jadi sebaiknya dicoba di branch terpisah. Kandidat pemakaian: dashboard EO dan dashboard admin.

---

## 2. Backend (wavy-backend)

Stack: Bun + Hono ^4.6, `postgres` (porsager), Zod + `@hono/zod-validator`, JWT (`jsonwebtoken`), bcryptjs, nodemailer (OTP). Port default 1420, base path `/api/v1`. CORS hanya mengizinkan `localhost:3000/3001`. Skema DB/migrasi **tidak ada di repo**; hanya ada script seed di `scripts/`.

Auth middleware (`src/middleware/auth.middleware.ts`) membaca JWT Bearer dan klaim `organizer_id`, `customer_id`, atau `admin_id`.

### 2.1 Endpoint per modul

**auth** (`/api/v1/auth`), publik

| Method | Path | Keterangan |
|---|---|---|
| POST | `/organizer/login` | Login EO (menolak `pending_verification` dan `suspended`) |
| POST | `/organizer/register` | Registrasi EO, kirim OTP verifikasi |
| POST | `/organizer/verify-email` | Verifikasi OTP EO, status menjadi `active` |
| POST | `/send-otp` | OTP login customer (auto-create customer) |
| POST | `/verify-otp` | Verifikasi OTP, mengembalikan token customer |

**organizer** (`/api/v1/organizer`), semua `organizerAuth`

| Method | Path | Keterangan |
|---|---|---|
| GET | `/events` | Daftar event milik EO |
| POST | `/events` | Buat event (title, artist_id, category, venue, date, poster_url, description) |
| GET | `/events/:id` | Detail + kategori tiket |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Hapus event |
| POST | `/events/:id/publish` | Status menjadi `published` + notifikasi follower |
| POST | `/events/:id/close-sales` | Status menjadi `closed` |
| GET | `/events/:id/ticket-categories` | Daftar kategori |
| POST | `/events/:id/ticket-categories` | Buat kategori (name, price, quota) |
| PUT | `/ticket-categories/:id` | Update (quota tidak boleh < sold) |
| DELETE | `/ticket-categories/:id` | Hapus kategori |
| GET | `/artists` | Daftar artis |
| POST | `/artists` | Buat artis |
| PUT | `/artists/:id` | Update artis |
| DELETE | `/artists/:id` | Hapus artis |
| GET | `/dashboard` | revenue, ticket_sold, remaining_ticket, popular_category, peak_purchase_hour |
| GET | `/orders?status=` | Order untuk event milik EO |
| POST | `/orders/:id/verify` | `{approve}`: `paid` + terbitkan tiket QR, atau `rejected` + tawarkan ke waiting list |
| POST | `/orders/:id/refund` | `refunded`, hapus tiket, kembalikan stok |
| POST | `/scan/validate` | Validasi QR (JWT) + tandai `is_scanned` |

**admin** (`/api/v1/admin`)

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| POST | `/login` | publik | Login admin (email + password) |
| GET | `/stats` | admin | Jumlah organizer, customer, event, order, revenue, tiket terjual |
| GET | `/organizers` | admin | Daftar organizer + event_count + revenue |
| PATCH | `/organizers/:id` | admin | `status: active \| suspended` |
| GET | `/events` | admin | Semua event (read-only) |
| GET | `/customers` | admin | Semua customer (read-only) |

**customer / order** (`/api/v1`), `customerAuth`

| Method | Path | Keterangan |
|---|---|---|
| POST | `/orders` | Buat order `pending_payment` (qty 1-4, data pembeli, `expires_at` = +15 menit) |
| GET | `/orders/history` | Riwayat order customer |
| GET | `/orders/:id` | Detail order |
| GET | `/me/level` | Level customer berdasarkan jumlah konser yang dihadiri |

**ticket** (`/api/v1`), `customerAuth`

| Method | Path | Keterangan |
|---|---|---|
| GET | `/tickets` | Dompet tiket (termasuk `qr_code` = JWT bertanda tangan) |
| GET | `/tickets/:id` | Detail tiket |
| POST | `/tickets/:id/transfer` | Transfer ke email customer lain |

**concert** (`/api/v1`)

| Method | Path | Auth | Keterangan |
|---|---|---|---|
| GET | `/concerts?category=&q=` | publik | Hanya event `published` |
| GET | `/concerts/:id` | publik | Detail + kategori tiket + review (hanya `published`) |
| POST/DELETE | `/concerts/:id/notify-me` | customer | Pengingat event |

**Modul tambahan** (`/api/v1`)

| Method | Path | Auth |
|---|---|---|
| GET | `/homepage` | publik |
| GET, POST | `/events/:id/reviews` | GET publik, POST customer |
| GET | `/favorites` | customer |
| POST/DELETE | `/favorites/organizers/:id`, `/favorites/artists/:id` | customer |
| GET | `/notifications`, POST `/notifications/:id/read` | customer |
| POST, GET | `/concerts/:id/waiting-room` | customer |
| POST, DELETE | `/concerts/:id/waiting-list` | customer |
| GET | `/health` | publik |

### 2.2 Payment

- **Tidak ada integrasi payment gateway** (tidak ada Midtrans/Snap/webhook, dan tidak ada env key server/client).
- Alurnya manual: `POST /orders` membuat order `pending_payment`, customer transfer manual (instruksi di FE `/orders/[id]`), lalu EO approve/reject lewat `POST /organizer/orders/:id/verify`.
- Customer tidak punya endpoint upload bukti transfer, jadi EO memverifikasi tanpa bukti.
- `expires_at` (15 menit) disimpan tapi **tidak pernah ditegakkan**: tidak ada job kedaluwarsa, dan `verifyOrder` tidak memeriksanya.

---

## 3. Perbandingan dengan scope UKK

### 3.1 Event Organizer (EO)

| Item | Backend | Frontend | Catatan |
|---|---|---|---|
| CRUD event | Ada | Sebagian | FE: list, create, delete, publish, close. **Tidak ada edit event** (`PUT` tidak dipanggil). Ada fallback mock saat API gagal. |
| CRUD artist | Ada | Ada | |
| CRUD kategori tiket | Ada | Sebagian | FE hanya list + create. Tidak ada edit/hapus kategori. Ada fallback mock. |
| Tenggat penjualan (sales deadline) | Belum | Belum | Tidak ada kolom/field `sales_end`. Satu-satunya batas waktu adalah tanggal event (untuk refund/scan). |
| Kuota | Sebagian | Ada | Kuota per kategori dicek saat order, tapi `sold` baru bertambah saat order di-approve, jadi banyak order `pending` bisa melebihi kuota (**oversell**). Pengecekan juga tanpa lock/transaksi. |
| Verifikasi pembayaran | Ada | Ada | Approve/reject manual. Tidak ada bukti bayar dan tidak cek `expires_at`. |
| Close sales | Sebagian | Ada | Status menjadi `closed` dan event hilang dari listing publik, tapi **`POST /orders` tidak mengecek status event**, sehingga order ke event `closed`/`draft` tetap diterima jika ID diketahui. |
| Dashboard | Ada | Ada | Revenue, terjual, sisa, kategori populer, jam puncak. Belum ada chart (kandidat Bklit UI). |
| (Ekstra) Scan QR gate | Ada | Ada | FE berupa input teks token, belum pakai kamera. |
| (Ekstra) Refund | Ada | Ada | |

### 3.2 Admin

| Item | Backend | Frontend | Catatan |
|---|---|---|---|
| Kelola organizer | Sebagian | Ada | List + active/suspend. Tidak ada detail, hapus, atau approval manual. Suspend tidak mencabut token EO yang masih aktif (`organizerAuth` tidak cek status di DB, token berlaku 24 jam). |
| Kelola platform | Sebagian | Sebagian | Statistik + daftar event/customer hanya read-only. Belum ada moderasi event (takedown), kelola kategori/genre global, atau kelola admin. |
| Seed admin | Ada | - | `scripts/seed-admin.ts` |

### 3.3 Customer

| Item | Backend | Frontend | Catatan |
|---|---|---|---|
| Browse konser | Ada | Ada | Filter kategori + pencarian. |
| Detail konser | Ada | Ada | Bug kecil FE: unfollow artis memanggil `POST` (seharusnya `DELETE`). |
| Checkout | Ada | Sebagian | Form data pembeli + T&C sudah tersambung. Pilihan metode bayar (bank/e-wallet/QRIS) **hanya tampilan**. Jika API error selain stok habis, FE menampilkan toast sukses dan redirect ke `/orders/{angka acak}` (**order palsu**). Multi-kategori membuat beberapa order terpisah. |
| Tiket QR | Ada | Sebagian | BE menerbitkan JWT per tiket. FE **tidak merender QR sungguhan**: modal hanya menampilkan ikon `QrCode` + potongan token (belum ada library QR). Jika API gagal, data mock ditampilkan. Transfer tiket sudah tersambung. |
| Riwayat order | Ada | Sebagian | BE: `GET /orders/history`. FE `/me` memanggil `GET /orders`, **endpoint yang tidak ada**. `/orders/[id]` punya fallback mock. |
| Profil | Sebagian | Sebagian | BE hanya `GET /me/level`, tidak ada get/update profil (nama, telepon, dll.). FE `/me` memanggil `/customers/me/level`, **path salah** (seharusnya `/me/level`). |
| (Ekstra) Review, favorit, notifikasi, waiting room/list, notify-me | Ada | Ada/Sebagian | Di luar scope UKK. |

### 3.4 Payment gateway Midtrans

| Item | Backend | Frontend |
|---|---|---|
| Buat transaksi Snap / Core API | Belum | Belum |
| Webhook notifikasi (update `paid` + terbitkan tiket otomatis) | Belum | - |
| Snap.js / redirect pembayaran | - | Belum |
| Env (`MIDTRANS_SERVER_KEY`, `CLIENT_KEY`, `IS_PRODUCTION`) | Belum | Belum |

Logika penerbitan tiket di `organizerService.verifyOrder` (approve) bisa dipindahkan ke service bersama, supaya bisa dipanggil oleh webhook Midtrans maupun verifikasi manual EO.

---

## 4. Ringkasan temuan prioritas

1. **Midtrans belum ada** di kedua sisi. Ini gap terbesar terhadap scope.
2. **Tenggat penjualan belum ada** (perlu kolom di DB, field di schema/FE, dan pengecekan di `POST /orders`).
3. **`POST /orders` tidak cek status event**, sehingga close sales bisa ditembus.
4. **Oversell**: kuota tidak memperhitungkan order `pending_payment`, dan `expires_at` tidak ditegakkan.
5. **FE salah path**: `/me` memanggil `/customers/me/level` dan `GET /orders` (seharusnya `/me/level` dan `/orders/history`).
6. **Checkout membuat order palsu** saat error, karena redirect ke ID acak dengan toast sukses.
7. **QR tiket belum dirender** (hanya ikon).
8. **Fallback mock data** di `/tickets`, `/orders/[id]`, dan `/organizer/events` bisa menyamarkan error API saat demo/ujian.
9. FE EO belum bisa **edit event** maupun **edit/hapus kategori tiket**.
10. **Auth guard FE belum ada** (`src/proxy.ts` masih TODO), dan suspend organizer tidak langsung berlaku.
11. Skema/migrasi DB tidak ada di repo, sehingga setup ulang database sulit direproduksi.
12. Design token duplikat dan banyak hex literal. shadcn belum di-init, padahal itu syarat Bklit UI.
