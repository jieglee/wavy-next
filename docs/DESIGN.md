# Wavy — Design System & Layout

> Pegangan visual untuk semua halaman. Tujuannya: setiap halaman terasa satu keluarga,
> dan tidak ada yang terlihat seperti template default.

## 1. Konsep: "Concert Spotlight"

Panggung gelap, satu sorot lampu. Konten utama selalu berada di "sorotan";
sisanya mundur ke gelap. Rasio warna **60-30-10**:

- **60%** — permukaan dasar (gelap di app, terang di auth/marketing)
- **30%** — permukaan sekunder (panel, card, sidebar)
- **10%** — aksen pink/magenta: CTA utama, status aktif, angka penting. Jangan dipakai untuk dekorasi.

## 2. Token warna

Audit menemukan **tiga set warna duplikat** dan banyak hex langsung di halaman.
Aturan fase 2:

1. Kumpulkan semua hex yang dipakai; petakan ke token di bawah (ambil nilai yang paling sering dipakai sekarang bila mirip).
2. Definisikan **satu kali** di `globals.css` sebagai CSS variable (format yang dipakai shadcn), expose lewat `@theme` Tailwind v4.
3. Ganti semua hex di halaman dengan token. Hex langsung di komponen = dilarang.

| Token | Peran | Arah nilai |
|---|---|---|
| `--background` | Dasar app (60%) | Hitam keunguan sangat gelap |
| `--surface` / `--card` | Panel & card (30%) | Sedikit lebih terang dari background, undertone ungu |
| `--surface-raised` | Popover, modal, card aktif | Satu tingkat di atas surface |
| `--border` | Garis | Putih ~8–12% opacity |
| `--foreground` | Teks utama | Off-white, bukan putih murni |
| `--muted-foreground` | Teks sekunder | Abu keunguan |
| `--primary` | Aksen 10% | Hot pink / magenta (nilai yang sudah dipakai sekarang) |
| `--primary-glow` | Gradient sorotan | Magenta → ungu, dipakai untuk "spotlight" |
| `--stage` | Hero banner app | Maroon/merah gelap yang sudah ada di app |
| `--success` / `--warning` / `--destructive` | Status order & tiket | Hijau, amber, merah — desaturasi sedikit agar tidak bertabrakan dengan pink |
| `--chart-1..5` | Seri chart Bklit | Turunan primary + ungu + 2 netral; harus terbedakan di dark mode |

Permukaan auth/marketing tetap: gradient pink-magenta-ungu dengan panel putih, teks hitam.

### 2.1 Nilai final token (fase 2, branch `feat/design-foundation`)

Didefinisikan sekali di `wavy-next/src/app/globals.css`, di-expose lewat `@theme inline`
(`bg-primary`, `text-muted-foreground`, `border-border`, dst.).

- **`:root` (terang)** = tema yang dipakai halaman sekarang. Nilainya diambil dari hex yang paling sering dipakai, supaya tampilan tidak berubah.
- **`.dark` ("Concert Spotlight")** = arah nilai di tabel atas. Aktif lewat class `.dark` pada ancestor. Saat ini belum dipakai halaman mana pun (shell admin & scan memakai tema terang).
- Token turunan (`--card-foreground`, `--popover`, `--chart-*`, dll.) dideklarasikan ulang di `:root, .dark`, jadi area `.dark` ikut memakai nilai gelap.

| Token | `:root` (terang) | `.dark` | Catatan |
|---|---|---|---|
| `--background` | `#FFFFFF` | `#14131C` | `.dark` = latar admin yang sudah ada |
| `--foreground` | `#1B1A3A` | `#F4F2F8` | |
| `--surface` | `#FAFAF8` | `#211F2B` | `.dark` = stop gradient poster yang sudah ada |
| `--surface-raised` | `#FFFFFF` | `#2B2937` | `--popover` = `--surface-raised` |
| `--card` | `#FFFFFF` | = `--surface` | Di terang, card putih di atas putih + border |
| `--muted` | `#F0EFF7` | `#2B2937` | Chip, tab, latar sekunder (= `wavy-surface` lama). `--secondary`/`--accent` = `--muted` |
| `--muted-foreground` | `#6E6B80` | `#A19DB3` | |
| `--border` | `#EDEBF2` | `rgb(255 255 255 / 0.1)` | |
| `--input` | `#D8D5E8` | `rgb(255 255 255 / 0.16)` | Border input/hover (token standar shadcn) |
| `--ring` | = `--primary` | = `--primary` | |
| `--primary` | `#FF5470` | `#FF5470` | `--primary-foreground` `#FFFFFF` |
| `--primary-glow` | `#7C3AED` | `#8B5CF6` | Pasangan gradient `from-primary to-primary-glow` |
| `--stage` | `#10191D` | `#10191D` | Lihat catatan di bawah |
| `--success` | `#047857` | `#34D399` | |
| `--warning` | `#B45309` | `#FBBF24` | Badge pending, peringatan. Nilai terang digelapkan dari `#D97706` agar teks lolos kontras AA |
| `--destructive` | `#DC2626` | `#F87171` | |
| `--info` | `#2563EB` | `#60A5FA` | Ikon/teks informasi (bukan link, bukan CTA) |
| `--info-foreground` | `#FFFFFF` | `#14131C` | Teks di atas latar `--info` solid |
| `--info-subtle` | `#EFF6FF` | `rgb(96 165 250 / 0.14)` | Latar chip/banner informasi (countdown, kategori, pencarian trending, banner checkout) |
| `--chart-1` | = `--primary` | = `--primary` | |
| `--chart-2` | = `--primary-glow` | = `--primary-glow` | |
| `--chart-3` | `#FF9AAE` | `#FFB3C1` | Turunan primary, lebih muda |
| `--chart-4` | = `--muted-foreground` | = `--muted-foreground` | Netral |
| `--chart-5` | = `--foreground` | = `--foreground` | Netral |
| `--radius` | `0.5rem` | | `rounded-sm/md/lg/xl` = 4/6/8/12px, sama dengan default Tailwind |

Variabel chart Bklit (`--chart-background`, `--chart-grid`, `--chart-label`, tooltip, dll.) merujuk ke token di atas.

**Catatan `--stage`:** tabel arah nilai menyebut "maroon yang sudah ada di app". Ternyata hero yang dipakai sekarang (detail konser) berwarna `#10191D` (hitam kehijauan). Maroon (`#8B0000`/`#2B0000`) hanya muncul di gradient placeholder poster. Nilainya dibiarkan `#10191D` agar hero tidak berubah. Perlu diputuskan apakah hero memang mau dibuat maroon.

### 2.2 Pemetaan hex lama → token

Kelas token lama (tiga set) juga sudah dimigrasikan:
`wavy-text-primary`/`off-white`/`plum-black`/`dark-plum` → `foreground`,
`wavy-text-secondary`/`lavender-gray`/`abu-ungu` → `muted-foreground`,
`wavy-surface`/`graphite-plum` → `muted`, `wavy-bg`/`white-pure` → `background` (`text-wavy-bg` di atas aksen → `primary-foreground`),
`wavy-border`/`border-dark`/`border-hangat` → `border`, `wavy-accent`/`coral-spotlight` → `primary`, `coral-gelap` → `destructive`.
`ivory`, `lime-pucat`, dan `olive-gelap` tidak dipakai, jadi dihapus.

Hex yang mirip dipetakan ke token dengan opacity Tailwind (`/80`, `/70`, ...). Di atas latar putih hasilnya hampir sama persis dengan hex aslinya.

| Hex lama | Token | | Hex lama | Token |
|---|---|---|---|---|
| `#1B1A3A` `#1B1A24` `#111827` `#1F2937` `#111111` `#14121A` `#1A2B4C` `#1D1B24` | `foreground` | | `#FF5470` | `primary` |
| `#374151` `#3D3D3D` | `foreground/85` | | `#FFE4EA` | `primary/15` |
| `#4B5563` `#4A4757` | `foreground/80` | | `#7C3AED` | `primary-glow` |
| `#6E6B80` `#6B6875` `#6B7280` `#6B6673` | `muted-foreground` | | `#EF4444` `#DC2626` `#991B1B` `#E63950` | `destructive` |
| `#8B889C` | `muted-foreground/80` | | `#FEF2F2` `#FEE2E2` | `destructive/10` |
| `#9CA3AF` `#9AA0A6` | `muted-foreground/70` | | `#FECACA` | `destructive/30` |
| `#D1D5DB` (teks) | `muted-foreground/40` | | `#065F46` | `success` |
| `#EDEBF2` `#E5E7EB` `#E6E4F0` `#F0F0F4` `#EEEEF2` `#E8E3F2` `#E5E1DA` | `border` | | `#ECFDF5` | `success/10` |
| `#F3F4F6` `#F0EFF7` (sebagai garis) | `border` | | `#10191D` | `stage` |
| `#F3F4F6` `#F0EFF7` (sebagai latar) | `muted` | | `#14131C` (shell admin) | `.dark` + `background` |
| `#D1D5DB` `#D8D5E8` `#D4CFE6` (garis) | `input` | | `#FFFFFF` (`color="#fff"` ikon) | `var(--primary-foreground)` |
| `#FAFAF8` `#FDFCFB` `#F8F8FA` `#F9FAFB` `#FCFCFD` `#FAFAFF` | `surface` | | | |

Di inline style, konstanta JS, atribut SVG, dan stop gradient, hex yang nilainya sama persis dengan token diganti `var(--token)`.

### 2.3 Biru, lime, dan palet Tailwind (keputusan lanjutan fase 2)

- **CTA, tab aktif, dan link teks memakai `--primary`**, termasuk "Beli Tiket", tombol follow/ingatkan/ulasan, link T&C (`.tnc-html a`), dan link deskripsi. Semua varian biru sudah dihapus: `#1E40AF` `#1A4BDE` `#1E3A8A` `#0F56FF` `#1A2E6B` `#2B5CFF` `#1A3AB8` `#0B46D9` `#3B82F6`.
  - Judul/ikon navy non-link (`#1A2E6B`, `#1E3A8A`) → `foreground`.
  - Glow/gradient dekoratif biru → `primary-glow`.
  - Shadow kartu biru `rgba(30,64,175,…)` → `color-mix(var(--foreground) …)`.
- **Latar biru muda (`#EFF6FF`, `#DBEAFE`) dan banner lime checkout (`#C6FF5C`) → `--info-subtle`.** Ikon/teks biru di dalam chip itu → `text-info`.
- **Kelas palet Tailwind sudah diganti token**, mengikuti badge status §6:

| Palet lama | Token |
|---|---|
| `gray-50` / `100` / `200` (latar) | `surface` / `muted` / `border` |
| `gray-300` (teks) · `gray-300` (garis) | `muted-foreground/40` · `input` |
| `gray-400` · `gray-500/600` · `gray-700` · `gray-800` | `muted-foreground/70` · `muted-foreground` · `foreground/85` · `foreground` |
| `amber-*` | `warning` (`50`→`/5`, `100`→`/10`, `200`→`/30`) |
| `emerald-*`, `green-*` | `success` (pola opacity sama) |
| `red-*`, `rose-*` (state error) | `destructive` (pola opacity sama) |
| `blue-50` / `blue-600` | `info-subtle` / `info` |
| `purple-50` / `purple-600` | `primary-glow/10` / `primary-glow` |
| `pink-50` | `primary/5` |
| `hover:bg-*-700` | `hover:bg-<token>/90` |

  Area di dalam scope `.dark` (saat ini belum ada) memakai nilai gelap: shade `-300/-400` di sana jadi token yang sama, dan otomatis memakai nilai gelapnya (`--success` gelap = emerald-400, `--destructive` gelap = red-400).

### 2.4 Pengecualian yang diizinkan (boleh tetap hex)

| Hex | Dipakai untuk | Lokasi |
|---|---|---|
| `#FFB800` | Bintang rating (termasuk bekas `amber-400` di review) | `concert-reviews`, `concert-review-modal` |
| `#FF8A65` `#FF3B30` `#FF7A7A` `#7AA8FF` `#7FC4A0` | Aksen bar per negara | `landing/discover-countries` (section "Jelajahi Event di Kotamu") |

Di luar daftar ini, hex di halaman dilarang.

### 2.5 Poster tanpa gambar

Semua poster/banner event yang kosong (atau gagal dimuat) memakai satu komponen: `EventPoster` / `PosterFallback` di `src/components/concerts/event-poster.tsx`.

- Latar: `bg-linear-to-br from-stage to-primary-glow` (token, tanpa hex).
- Isi: judul event (`font-display`, `text-primary-foreground`) rata kiri-bawah; ukuran `sm` (thumbnail kecil) hanya memuat inisial.
- Dipakai di: kartu konser, "Event untuk kamu", featured events, lineup landing, hasil pencarian, featured picks, hero & banner checkout, daftar event portal admin, detail order.
- Slide promo tanpa gambar (`landing/promo-carousel`) memakai gradient dari `stage`, `primary`, `primary-glow`.

Gradient placeholder hex lama (`#7DD3E8`, `#8B0000`, `#211F2B`, `#C084FC`, dst.) sudah dihapus. Keputusan `--stage` maroon atau tidak (catatan §2.1) masih terbuka.

Komponen vendor Bklit (`src/components/charts/gradients.tsx`) berisi preset gradient hex dari registry. Preset ini tidak dipakai dan sengaja dibiarkan.

## 3. Tipografi

| Font | Dipakai untuk |
|---|---|
| **Space Grotesk** | Display & heading (judul konser, angka besar dashboard) |
| **Inter** | Body, form, tabel |
| **IBM Plex Mono** | Harga, kode order, kode tiket, timestamp, label kecil uppercase |

- Skala: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 72 (desktop hero boleh lebih).
- Heading pakai tracking sedikit rapat (-0.02em); label mono pakai uppercase + tracking lebar.
- **Baseline grid 4px**: semua spacing & line-height kelipatan 4.

## 4. Grid system per halaman

Setiap halaman memakai satu grid system utama yang **sengaja terlihat**. Grid dasar: 12 kolom, gutter 24px (desktop) / 16px (mobile), margin 16–24px mobile.

### Publik & customer

| Halaman | Grid | Komposisi |
|---|---|---|
| Landing — hero | **Axial** | Satu sumbu vertikal di tengah = sorot lampu. Judul, tanggal, CTA berjajar di sumbu itu. |
| Landing — lineup / konser unggulan | **Diagonal** | Card poster tersusun miring mengikuti arah sorotan; saat scroll bergerak horizontal. |
| Landing — cara beli / fitur | **Modular** | Bento 3×2, satu modul besar untuk poin utama. |
| Browse konser | **Modular** | Grid kartu poster 4 → 2 → 1 kolom; filter sticky di atas. |
| Detail konser | **Hierarchical** | Poster besar dominan (kiri, 7 kolom), info + lineup di bawahnya; **kartu tiket sticky** di kanan (5 kolom). Mobile: poster → info → bar beli sticky di bawah layar. |
| Checkout | **Column** | 2 kolom: form (8) + ringkasan order sticky (4). Mobile: ringkasan jadi bar bawah yang bisa dibuka. |
| Tiket saya | **Modular** | Kartu tiket berbentuk tiket fisik (sobekan/perforasi), 3 → 1 kolom. |
| Detail tiket (QR) | **Axial** | QR di tengah sumbu, info di atas/bawah, garis perforasi horizontal. Layar penuh di mobile. |
| Riwayat order | **Baseline** | Daftar rapat berirama 4px; tanggal & kode mono rata kiri, status & total rata kanan. Mobile: tiap baris jadi card. |
| Profil / level | **Radial** | Progress level sebagai ring di tengah, statistik mengelilingi. |

### Portal admin (`/admin`)

Satu role pengelola (v2): fitur Creator Studio lama ada di sini. Shell: sidebar kiri (desktop) → bottom nav 5 menu
(Dasbor, Event, Order, Scan, Artis) di mobile. Header halaman: judul Space Grotesk + aksi utama kanan (`AdminPageHeader`).

| Halaman | Grid | Komposisi |
|---|---|---|
| Dashboard admin | **Modular** (bento) | KPI 8 tile (4 kolom desktop, 2 di mobile: pendapatan & tiket dengan tren 7 hari, pending aktif, check-in, order, event tayang, sisa kuota, customer) → pendapatan per hari (8) + kuota terisi radial (4) → event terlaris (7) + order per status (5) → order terbaru (12). |
| Daftar event | **Modular / Column** | Toggle grid kartu ↔ tabel. |
| Form event (buat/edit) | **Column** | Form 8 kolom dibagi section (info, jadwal & tenggat, kategori tiket); **preview kartu konser live** sticky 4 kolom. |
| Kategori tiket & kuota | **Baseline** | Tabel dengan bar kuota (terjual / pending / sisa). |
| Verifikasi pembayaran | **Baseline** | Antrian tabel; detail di panel samping (drawer di mobile). |
| Scan tiket | **Axial** | Kamera di tengah, hasil valid/invalid besar di bawahnya. |
| Artis | **Baseline** | Tabel artis + form; artis yang dipakai event tidak bisa dihapus. |
| Login admin | **Column** | Panel foto kiri (desktop) + form kanan, sama dengan login customer. |

### Login customer

Satu alur, tiga langkah di kartu yang sama: email → OTP 6 kotak (muat di 360px, label per digit) → isi nama
(hanya akun baru). Tidak ada halaman daftar terpisah; mobile (`wavy-mobile`) memakai alur yang sama.

## 5. Dashboard & chart (Bklit)

- Semua chart pakai komponen dari **Bklit UI** (butuh `shadcn init` dulu — fase 2, branch terpisah). Cek registry Bklit untuk komponen yang tersedia; jangan campur library chart lain.
- Warna chart **hanya** dari `--chart-1..5`.
- Angka KPI: Space Grotesk besar + label IBM Plex Mono kecil uppercase + delta (naik/turun) berwarna status.
- Usulan chart: penjualan per hari (area/line), pendapatan per kategori tiket (bar), kuota terisi (radial), check-in vs terjual (bar/progress).
- Tiap chart wajib punya state **loading** (skeleton), **kosong** (pesan + CTA), dan **error** (pesan jelas, tombol coba lagi).

## 6. Komponen & detail

- Radius: 12px card, 8px input/tombol, full untuk badge/pill.
- Card: background `--surface`, border `--border`, tanpa shadow tebal. Card aktif/disorot boleh glow tipis `--primary-glow`.
- Badge status order/tiket: pending (`bg-warning/10 text-warning`), paid (`bg-success/10 text-success`), expired & cancelled (`bg-muted text-muted-foreground`), ditolak & refund (`bg-destructive/10 text-destructive`). Teks mono uppercase.
- Tabel → card list di bawah breakpoint `md`.
- Ikon: satu set saja (yang sudah dipakai di project).

## 7. Motion

- **App (dashboard, form, tabel):** halus dan cepat — 150–250ms, fade/slide kecil. Tidak ada animasi scroll berat.
- **Landing (fase 5):** scroll-driven ala portfolio Jeffrey — ganti AOS dengan framer-motion (`useScroll`/`useTransform`) + smooth scroll (Lenis). Ide: hero yang di-pin dengan sorot lampu yang menyempit saat scroll, lineup bergerak horizontal di section diagonal, kartu tiket "tersobek" saat masuk viewport, angka statistik menghitung naik.
- Selalu hormati `prefers-reduced-motion`.

## 8. Anti-template checklist (cek sebelum PR)

- [ ] Tidak ada hex langsung atau kelas palet Tailwind (`gray-*`, `amber-*`, …); semua dari token, kecuali pengecualian §2.4 (dan gradient §2.5 sampai fase 3)
- [ ] Pink hanya untuk aksen (≤10% layar)
- [ ] Grid halaman sesuai tabel §4 dan terasa sengaja
- [ ] Harga/kode/tanggal pakai IBM Plex Mono
- [ ] Tidak ada gradient ungu generik di luar `--primary-glow`
- [ ] State loading / kosong / error ada dan tidak pakai data mock
- [ ] Rapi di lebar 360px, 768px, 1280px
- [ ] Teks lewat next-intl (id/en)
