# Pembayaran Midtrans (Snap, sandbox)

Wavy memakai **Midtrans Snap mode sandbox** untuk proyek UKK — tidak ada uang sungguhan.
Verifikasi manual oleh EO (Creator Studio → Pembayaran) tetap ada sebagai cadangan.

## 1. Env yang harus diisi

**Backend** (`wavy-backend/.env`)

| Variabel | Isi |
|----------|-----|
| `MIDTRANS_SERVER_KEY` | Server Key sandbox (`SB-Mid-server-...`). **Rahasia**, jangan di-commit. |
| `MIDTRANS_CLIENT_KEY` | Client Key sandbox (`SB-Mid-client-...`). Saat ini hanya untuk catatan; dipakai frontend. |
| `MIDTRANS_IS_PRODUCTION` | `false` |

**Frontend** (`wavy-next/.env.local`)

| Variabel | Isi |
|----------|-----|
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Client Key sandbox yang sama. Kosong = tombol bayar disembunyikan. |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | `false` (memuat `app.sandbox.midtrans.com/snap/snap.js`) |

Variabel `NEXT_PUBLIC_*` dibaca saat build: setelah mengubahnya, jalankan ulang `next dev` / `next build`.

Migrasi database (sekali per database, idempoten):

```sh
cd wavy-backend && bun scripts/migrate-payment.ts   # orders.payment_ref, orders.payment_type
```

## 2. Cara ambil key sandbox

1. Daftar / masuk di <https://dashboard.sandbox.midtrans.com> (akun sandbox gratis).
2. Pastikan environment di kiri atas **Sandbox**.
3. **Settings → Access Keys**: salin **Server Key** dan **Client Key**.
4. (Opsional, untuk webhook) **Settings → Payment → Notification URL**:
   `https://<domain-backend-publik>/api/v1/payments/midtrans/notification`.

## 3. Alur

1. Customer membuat pesanan → status `pending_payment`, batas 15 menit (`expires_at`).
2. Di halaman pesanan, **Bayar sekarang** → `POST /orders/:id/pay` → popup Snap.
   Setiap percobaan memakai `order_id` Midtrans baru (`WAVY-<id>-<acak>`); kedaluwarsa Snap = sisa waktu order.
3. Lunas lewat salah satu jalur (logikanya sama):
   - **Webhook** `POST /payments/midtrans/notification` (signature `sha512(order_id+status_code+gross_amount+server_key)` dicek).
   - **Cek status** `GET /orders/:id/payment-status`: dipanggil frontend saat popup Snap selesai/ditutup dan saat
     tombol **Cek status pembayaran** ditekan. Ini yang membuat localhost jalan **tanpa webhook**.
4. `settlement` / `capture` → order `paid`, `paid_at` terisi, tiket + QR terbit (fungsi yang sama dengan approve EO).
   `expire` / `cancel` / `deny` → order `expired`, kuota dilepas.

## 4. Tes pembayaran di sandbox

Tanpa webhook (localhost biasa):

1. Isi env di atas, jalankan backend & frontend.
2. Login customer, pesan tiket, buka halaman pesanan, klik **Bayar sekarang**.
3. Pilih **BCA Virtual Account** (atau bank lain), salin nomor VA.
4. Buka simulator <https://simulator.sandbox.midtrans.com> → **Virtual Account** → bank yang sama → tempel nomor VA → **Inquire** → **Pay**.
5. Kembali ke Wavy: tutup popup atau klik **Cek status pembayaran** → status **Lunas**, tiket muncul di **Tiket saya**.

Metode lain di sandbox: QRIS/GoPay lewat simulator QR; kartu kredit uji `4811 1111 1111 1114`, CVV `123`,
exp bulan/tahun di masa depan, OTP `112233`.

Dengan webhook (opsional): ekspos backend lokal, mis. `ngrok http 1420`, lalu isi Notification URL di dashboard
sandbox dengan URL ngrok + `/api/v1/payments/midtrans/notification`.

## 5. Checklist tes manual

- [ ] Tanpa `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`: halaman pesanan pending tidak menampilkan **Bayar sekarang**, teks verifikasi manual tampil, tidak ada error di console.
- [ ] Tanpa `MIDTRANS_SERVER_KEY`: `POST /orders/:id/pay` → 503 `PAYMENT_NOT_CONFIGURED`, pesan error tampil (bukan toast sukses).
- [ ] Dengan key: **Bayar sekarang** membuka popup Snap sandbox dengan total = total pesanan.
- [ ] Bayar VA lewat simulator → **Cek status pembayaran** → Lunas, tiket + QR muncul.
- [ ] Tutup popup tanpa bayar → status tetap Menunggu bayar, bisa klik **Bayar sekarang** lagi.
- [ ] Biarkan sampai waktu habis → Kedaluwarsa; **Bayar sekarang** tidak muncul, `POST /pay` → 409 `ORDER_EXPIRED`.
- [ ] Order sudah lunas lewat approve EO → tombol bayar hilang; notifikasi Midtrans yang datang belakangan tidak menerbitkan tiket ganda.
- [ ] EO tetap bisa approve manual order pending (cadangan).
- [ ] Cek di lebar 360px dan desktop.
