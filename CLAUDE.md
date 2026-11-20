@AGENTS.md

# CLAUDE.md — Wavy

## Struktur
- Folder induk berisi dua repo git terpisah:
  - `wavy-next/` — frontend (Next.js 16, React 19, Tailwind v4, next-intl)
  - `wavy-backend/` — backend (Bun + Hono + raw SQL postgres-js, NeonDB, `/api/v1`, port 1420)
- Backend modular: `src/modules/<domain>/` (routes, controller, service, schema). Tidak pakai ORM.

## Baca dulu sebelum kerja
1. `docs/PRD.md` — scope, aturan bisnis, fase
2. `docs/DESIGN.md` — token, tipografi, grid per halaman, motion
3. `docs/AUDIT.md` — kondisi terakhir & bug yang diketahui

## Alur kerja (wajib)
- Setiap fitur/fix = **branch baru dari `main`** di repo yang relevan (mis. `fix/order-validation`, `feat/creator-studio-dashboard`).
- Commit kecil dan rutin dengan pesan jelas.
- **Tanpa atribusi AI apa pun** di commit & PR: tidak ada `Co-Authored-By`, tidak ada "Generated with Claude Code", tidak ada link sesi.
- Jangan merge ke `main` dan jangan push kecuali diminta. Review & merge dilakukan Kalsah lewat PR.
- Jangan mengubah, me-reset, atau memindahkan branch `main` (termasuk `git branch -f`, reset, rebase `main`) tanpa diminta. Untuk update, cukup `git fetch` dan buat branch dari `origin/main`.
- Satu branch = satu topik. Jangan menyelipkan perubahan di luar topik.

## Aturan kode
- Frontend: warna hanya lewat token (`docs/DESIGN.md` §2). Dilarang hex langsung.
- Frontend: dilarang fallback ke data mock dan dilarang toast sukses saat API gagal. Tampilkan error.
- Frontend: semua teks UI baru lewat next-intl (id & en).
- Backend: aturan bisnis di `docs/PRD.md` §4 ditegakkan di service + SQL, bukan hanya di frontend.
- Backend: operasi kuota/order dalam transaksi dengan row lock.
- Chart hanya pakai Bklit UI.

## Server & port
- Port 3000 (frontend) dan 1420 (backend) milik Kalsah. Server yang dijalankan agen pakai port 3001 ke atas.
- Server uji backend hanya ke database lokal `*_test`. Jangan pernah menjalankan server/script ke Neon production.
- Matikan semua server yang dijalankan sebelum menyatakan pekerjaan selesai.

## Selesai berarti
- Lolos lint/typecheck/build.
- Dicek di lebar 360px dan desktop.
- Checklist §8 DESIGN.md terpenuhi (untuk perubahan UI).
- Ringkasan di akhir: apa yang berubah, branch, commit, dan hal yang perlu dicek Kalsah.