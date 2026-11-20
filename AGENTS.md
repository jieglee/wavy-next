<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Wavy Frontend — Agent Notes (ID/EN)

## Ringkasan / Overview

Frontend web untuk platform ticketing **Wavy** (Next.js 16.2.12, React 19, TypeScript). Backend di repo terpisah `wavy-backend` (Bun + Hono, `http://localhost:1420/api/v1`). Konteks produk: `PROJECT_OVERVIEW.md` & `PRD.md` di root `project-ukk/` (di luar repo ini).

Frontend for the **Wavy** ticketing platform (Next.js 16.2.12, React 19, TypeScript). Backend is a separate repo, `wavy-backend` (Bun + Hono, `http://localhost:1420/api/v1`). Product context: `PROJECT_OVERVIEW.md` & `PRD.md` in the root `project-ukk/` directory (outside this repo).

## Perintah / Commands

```bash
npm install
npm run dev      # next dev (default port 3000)
npm run lint     # eslint
npm run build    # next build
npm run start    # next start
```

## Struktur / Layout

```
src/
├── app/[locale]/        # route per-lokale (id/en/ko) — admin, auth, concerts, home, hotels, me, orders, organizer, tickets, page
│   └── concerts/[id]/   # detail konser; checkout/, queue/, pembelian/
├── app/api/             # route handlers (incl. auth [...nextauth])
├── lib/                 # api.ts, auth-api.ts, price.ts, sanitize.ts, fonts.ts, utils.ts
├── types/               # tipe shared (Concert, Order, Ticket, …)
├── service/             # pemanggilan API / data
├── proxy.ts             # fetch proxy (CORS/dev)
├── i18n/, messages/     # next-intl (id/en/ko)
├── components/, hooks/, data/, layout/
```

## Konvensi Penting / Key Conventions

- **Route params = Promise** (Next 16): wajib `await params` di server component / `use(params)` di client component.
- **next-intl**: rute di-wrap locale; teks UI lewat `messages/<locale>.json` + `useTranslations`.
- **API helper** (`src/lib/api.ts`): base URL `NEXT_PUBLIC_API_URL ?? http://localhost:1420/api/v1`. Token auth di `localStorage` (`wavy_auth_token`, `wavy_auth_role`, `wavy_auth_user`). Gunakan `apiGet/apiPost/apiPut/apiPatch/apiDelete` (melempar `ApiError` saat non-2xx).
- **Checkout** (`concerts/[id]/checkout/page.tsx`): `buildOrderPayload()` dipakai di seluruh POST `/orders`; bulan tanggal lahir bahasa Indonesia (Januari–Desember); pastikan payload baru & lama tetap kompatibel dengan backend.
- **T&C** (`src/lib/sanitize.ts`): jangan deteksi HTML dari hasil `DOMParser` (teks plain seperti `<To you>` bisa jadi tag palsu) — deteksi dari struktur HTML asli input; plain text diformat otomatis (h3/ul/ol/paragraf); XSS di-strip.
- **Detail event** (`concerts/[id]/page.tsx`): kategori tiket & sidebar tiket **selalu tampil**, jangan di-gate oleh `hasSeatmap`.
- **Bahasa kode:** komentar/label Indonesian; simbol & URL endpoint Bahasa Inggris.

- **Route params are Promises** (Next 16): `await params` in server components / `use(params)` in client components.
- **next-intl**: routes wrappend in a locale segment; UI text via `messages/<locale>.json` + `useTranslations`.
- **API helper** (`src/lib/api.ts`): base URL `NEXT_PUBLIC_API_URL ?? http://localhost:1420/api/v1`. Auth token in `localStorage` (`wavy_auth_token`, `wavy_auth_role`, `wavy_auth_user`). Use `apiGet/apiPost/apiPut/apiPatch/apiDelete` (throws `ApiError` on non-2xx).
- **Checkout** (`concerts/[id]/checkout/page.tsx`): `buildOrderPayload()` is used for all POST `/orders`; birth-date month dropdown is in Indonesian; keep both new and legacy payloads compatible with the backend.
- **T&C** (`src/lib/sanitize.ts`): never detect HTML from `DOMParser` output (plain text like `<To you>` can become a fake tag) — detect from the raw input structure; plain text is auto-formatted (h3/ul/ol/paragraph); XSS is stripped.
- **Event detail** (`concerts/[id]/page.tsx`): ticket categories & ticket sidebar must **always render** — don't gate them behind `hasSeatmap`.
- **Language:** Indonesian comments/labels; English symbols & endpoint URLs.

## Catatan / Notes

- Backend harus hidup agar data tampil (CORS terbatas ke `localhost:3000/3001`). Backend default di port di `.env`-nya (`1420`).
- Active work: branch `feat/checkout-tnc-kategori-dob` (PR #23). Jangan menimpa kerja PR yang belum merge.
- Wait for the backend to be running for live data (CORS restricted to `localhost:3000/3001`; backend defaults to port from its `.env`, `1420`).
- Active work: branch `feat/checkout-tnc-kategori-dob` (PR #23). Don't clobber unmerged PR work.
