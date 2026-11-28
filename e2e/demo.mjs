// Skenario demo UKK (docs/PRD.md §7) end-to-end, headless. Dua role: admin (web) dan customer.
//
// Prasyarat (lihat e2e/README.md):
//   - backend wavy-backend (skema v2, mis. chore/seed-demo-v2 atau lebih baru) jalan ke Postgres LOKAL *_test,
//     dengan SMTP_HOST=127.0.0.1 SMTP_PORT=$E2E_SMTP_PORT (sink SMTP dijalankan skrip ini)
//   - frontend wavy-next jalan dengan NEXT_PUBLIC_API_URL menunjuk ke backend itu
//
// Env: E2E_WEB, E2E_API, E2E_DB_URL (wajib localhost & nama db *_test), E2E_SMTP_PORT,
//      CHROMIUM_PATH (opsional; default chromium dari ms-playwright), E2E_HEADED=1 untuk lihat browser.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { chromium } from "playwright-core";
import { startSmtpSink } from "./smtp-sink.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const WEB = process.env.E2E_WEB ?? "http://localhost:3001";
const API = process.env.E2E_API ?? "http://localhost:3002/api/v1";
const DB_URL = process.env.E2E_DB_URL ?? "postgres://postgres:postgres@localhost:5432/wavy_test";
const SMTP_PORT = Number(process.env.E2E_SMTP_PORT ?? 2525);
const OUT = path.join(here, "artifacts");
fs.mkdirSync(OUT, { recursive: true });

// pengaman: hanya database lokal *_test
{
  const u = new URL(DB_URL);
  if (!["localhost", "127.0.0.1"].includes(u.hostname) || !u.pathname.endsWith("_test")) {
    console.error(`E2E_DB_URL harus Postgres lokal dengan nama *_test (dapat: ${u.hostname}${u.pathname})`);
    process.exit(2);
  }
}

const msg = JSON.parse(fs.readFileSync(path.join(here, "../src/messages/id.json"), "utf8"));
const msgEn = JSON.parse(fs.readFileSync(path.join(here, "../src/messages/en.json"), "utf8"));
const sql = postgres(DB_URL, { onnotice: () => {} });
const RUN = Date.now().toString(36);
const ADMIN = { email: `admin-${RUN}@wavy.test`, password: "admin-demo-123" };
const BUYER_A = `buyer-a-${RUN}@wavy.test`;
const BUYER_B = `buyer-b-${RUN}@wavy.test`;
const H = 60 * 60 * 1000;
const wibInput = (d) => new Date(d.getTime() + 7 * H).toISOString().slice(0, 16);

const results = [];
const ctx = {};

async function step(name, fn) {
  const started = Date.now();
  try {
    await fn();
    results.push({ name, ok: true, ms: Date.now() - started });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    // baris pertama + baris "waiting for ..." dari Playwright (locator mana yang gagal)
    const lines = String(err?.message ?? err).split("\n");
    const detail = [lines[0], lines.find((l) => /waiting for/.test(l))?.trim()].filter(Boolean).join(" | ");
    results.push({ name, ok: false, ms: Date.now() - started, error: detail });
    console.log(`  ✗ ${name}\n      ${detail}`);
    for (const [label, page] of Object.entries(ctx.pages ?? {})) {
      await page.screenshot({ path: path.join(OUT, `fail-${results.length}-${label}.png`), fullPage: true }).catch(() => {});
    }
  }
}

function expect(cond, message) {
  if (!cond) throw new Error(message);
}

async function api(pathname, { token, method = "GET", body } = {}) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function newPage(browser, label, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport, locale: "id-ID", timezoneId: "Asia/Jakarta" });
  const page = await context.newPage();
  page.on("dialog", (d) => d.accept());
  ctx.pages[label] = page;
  return page;
}

const overflowX = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

async function seed() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  const [artist] = await sql`INSERT INTO artists (name, genre) VALUES (${"Band Demo " + RUN}, 'Rock') RETURNING id`;
  ctx.artistId = Number(artist.id);
  const [a] = await sql`INSERT INTO admins (name, email, password)
                        VALUES ('Admin Demo', ${ADMIN.email}, crypt(${ADMIN.password}, gen_salt('bf', 10))) RETURNING id`;
  ctx.adminId = Number(a.id);
}

/** Login customer lewat OTP (kode dari DB). `name` diisi = akun baru: langkah isi nama wajib muncul. */
async function customerLogin(page, email, name) {
  await page.goto(`${WEB}/id/auth/login`);
  await page.locator('input[type="email"]').fill(email);
  await page.getByRole("button", { name: msg.Auth.continue, exact: true }).click();
  const boxes = page.locator('input[inputmode="numeric"][maxlength="1"]');
  await boxes.first().waitFor({ timeout: 15000 });
  let code = null;
  for (let i = 0; i < 20 && !code; i++) {
    const [row] = await sql`SELECT code FROM otp_codes WHERE email = ${email} ORDER BY created_at DESC LIMIT 1`;
    code = row?.code ?? null;
    if (!code) await page.waitForTimeout(250);
  }
  expect(code, "kode OTP tidak ditemukan di otp_codes");
  for (let i = 0; i < 6; i++) await boxes.nth(i).fill(code[i]);
  await page.getByRole("button", { name: msg.Auth.signIn, exact: true }).click();
  if (name) {
    const input = page.locator("#customer-name");
    await input.waitFor({ timeout: 15000 });
    // nama terlalu pendek -> pesan per field, tidak terkirim
    await input.fill("A");
    await page.getByRole("button", { name: msg.Auth.nameSubmit, exact: true }).click();
    await page.getByText(msg.Auth.nameTooShort).waitFor({ timeout: 5000 });
    await input.fill(name);
    await page.getByRole("button", { name: msg.Auth.nameSubmit, exact: true }).click();
  }
  await page.waitForURL(/\/home/, { timeout: 20000 });
}

/** Checkout lewat UI; mengembalikan id order baru, atau null bila tetap di halaman checkout. */
async function checkout(page, eventId, categoryName, qty) {
  await page.goto(`${WEB}/id/concerts/${eventId}/checkout`);
  // draft checkout sebelumnya (sessionStorage) dipulihkan halaman; mulai dari langkah 1 setiap kali
  await page.evaluate((key) => sessionStorage.removeItem(key), `wavy-checkout-${eventId}`);
  await page.reload();
  // select jumlah di baris kategori yang namanya persis categoryName
  const qtySelect = page
    .locator(`xpath=//*[text()[normalize-space()='${categoryName}']]/ancestor::*[.//select][1]//select`)
    .first();
  await qtySelect.waitFor({ timeout: 20000 });
  await qtySelect.selectOption(String(qty));
  await page.getByRole("button", { name: msg.Checkout.cta.order, exact: true }).click();
  await page.locator("#co-first").fill("Pembeli");
  await page.locator("#co-last").fill("Demo");
  await page.getByPlaceholder("81223333444").fill("81223333444");
  await page.locator("#co-id").fill("3171000000000001");
  await page.getByLabel(msg.Checkout.form.dobDay, { exact: true }).fill("17");
  await page.getByLabel(msg.Checkout.form.dobMonth, { exact: true }).selectOption("8");
  await page.getByLabel(msg.Checkout.form.dobYear, { exact: true }).fill("2000");
  await page.locator('input[type="radio"][name="gender"]').first().check();
  const boxes = page.locator('input[type="checkbox"]');
  await boxes.nth(0).check();
  await boxes.nth(1).check();
  await page.getByRole("button", { name: msg.Checkout.cta.next, exact: true }).click();
  await page.getByRole("button", { name: msg.Checkout.cta.createOrder, exact: true }).click();
  try {
    await page.waitForURL(/\/orders\/\d+/, { timeout: 10000 });
    return Number(page.url().match(/\/orders\/(\d+)/)[1]);
  } catch {
    return null;
  }
}

async function main() {
  const smtp = await startSmtpSink(SMTP_PORT);
  const exe =
    process.env.CHROMIUM_PATH ??
    path.join(os.homedir(), "AppData/Local/ms-playwright/chromium-1254/chrome-win64/chrome.exe");
  const browser = await chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined, headless: !process.env.E2E_HEADED });
  ctx.pages = {};
  console.log(`Wavy demo e2e — run ${RUN}\n  web ${WEB}\n  api ${API}\n`);

  await step("0. seed artis & admin di DB uji", seed);

  const admin = await newPage(browser, "admin");
  await step("1a. admin login", async () => {
    await admin.goto(`${WEB}/id/admin/login`);
    await admin.locator('input[type="email"]').fill(ADMIN.email);
    await admin.locator('input[type="password"]').fill(ADMIN.password);
    await admin.locator('button[type="submit"]').click();
    await admin.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
    // sesi admin terpisah: login admin tidak mengisi slot sesi customer
    expect((await admin.evaluate(() => localStorage.getItem("wavy_auth_token"))) === null, "login admin mengisi sesi customer");
    const login = await api("/admin/login", { method: "POST", body: { email: ADMIN.email, password: ADMIN.password } });
    ctx.adminToken = login.json.access_token;
    expect(ctx.adminToken, `POST /admin/login -> ${login.status}`);
  });

  await step("1b. admin buat event (draft) dengan tenggat penjualan", async () => {
    const now = new Date();
    await admin.goto(`${WEB}/id/admin/events/new`);
    await admin.locator("#ev-title").fill(`Konser Demo ${RUN}`);
    await admin.locator("#ev-artist").selectOption(String(ctx.artistId));
    await admin.locator("#ev-category").fill("Music");
    await admin.locator("#ev-venue").fill("Jakarta");
    await admin.locator("#ev-date").fill(wibInput(new Date(now.getTime() + 30 * 24 * H)));
    await admin.locator("#ev-sales-start").fill(wibInput(new Date(now.getTime() - H)));
    await admin.locator("#ev-sales-end").fill(wibInput(new Date(now.getTime() + 20 * 24 * H)));
    await admin.getByRole("button", { name: msg.Studio.form.createDraft }).click();
    await admin.waitForURL(/\/admin\/events\/\d+$/, { timeout: 20000 });
    ctx.eventId = Number(admin.url().match(/events\/(\d+)$/)[1]);
    const ev = await api(`/admin/events/${ctx.eventId}`, { token: ctx.adminToken });
    expect(ev.json.status === "draft", `status event ${ev.json.status}, harusnya draft`);
    expect(ev.json.sales_end_at, "sales_end_at tidak tersimpan");
    const [row] = await sql`SELECT created_by FROM events WHERE id = ${ctx.eventId}`;
    expect(Number(row.created_by) === ctx.adminId, `created_by ${row.created_by}, harusnya ${ctx.adminId}`);
  });

  await step("1c. publish tanpa kategori ditolak", async () => {
    await admin.getByRole("button", { name: msg.Studio.detail.publish, exact: true }).click();
    await admin.getByText(msg.Studio.errors.NO_TICKET_CATEGORY).waitFor({ timeout: 10000 });
    const ev = await api(`/admin/events/${ctx.eventId}`, { token: ctx.adminToken });
    expect(ev.json.status === "draft", "event berubah status padahal tanpa kategori");
  });

  await step("1d. admin tambah 2 kategori tiket (kuota 3)", async () => {
    const c = msg.Studio.categories;
    for (const [name, price] of [["VIP", "250000"], ["Reguler", "100000"]]) {
      await admin.getByRole("button", { name: c.add }).click();
      await admin.locator("#cat-name").fill(name);
      await admin.locator("#cat-price").fill(price);
      await admin.locator("#cat-quota").fill("3");
      await admin.getByRole("button", { name: c.save, exact: true }).click();
      await admin.getByText(name, { exact: true }).first().waitFor({ timeout: 10000 });
      await admin.getByRole("button", { name: c.add }).waitFor({ timeout: 10000 });
    }
    const ev = await api(`/admin/events/${ctx.eventId}`, { token: ctx.adminToken });
    expect(ev.json.ticket_categories?.length === 2, `jumlah kategori ${ev.json.ticket_categories?.length}`);
  });

  await step("1e. admin publish -> penjualan terbuka", async () => {
    await admin.getByRole("button", { name: msg.Studio.detail.publish, exact: true }).click();
    await admin.getByRole("button", { name: msg.Studio.detail.close }).waitFor({ timeout: 10000 });
    const pub = await api(`/concerts/${ctx.eventId}`);
    expect(pub.json.sales_status === "open", `sales_status publik ${pub.json.sales_status}`);
    expect(!("organizer_name" in pub.json), "respons konser masih memuat organizer_name");
    ctx.categoryIds = pub.json.ticket_categories.map((c) => c.id);
  });

  const buyerA = await newPage(browser, "buyerA", { width: 360, height: 800 });
  await step("2a. customer A baru: email -> OTP -> isi nama (360px)", async () => {
    await customerLogin(buyerA, BUYER_A, "Pembeli A");
    const [c] = await sql`SELECT name FROM customers WHERE email = ${BUYER_A}`;
    expect(c?.name === "Pembeli A", `nama customer ${c?.name}`);
    expect((await overflowX(buyerA)) <= 0, "halaman melebar di 360px");
  });

  await step("2b. login ulang akun lama tanpa langkah nama; ubah nama di /me", async () => {
    await buyerA.evaluate(() => localStorage.clear());
    await customerLogin(buyerA, BUYER_A);
    await buyerA.goto(`${WEB}/id/me`);
    await buyerA.getByRole("heading", { name: "Pembeli A", exact: true }).waitFor({ timeout: 15000 });
    await buyerA.getByRole("button", { name: msg.Profile.editName }).click();
    await buyerA.locator("#profile-name").fill("Pembeli A Baru");
    await buyerA.getByRole("button", { name: msg.Profile.save, exact: true }).click();
    await buyerA.getByRole("heading", { name: "Pembeli A Baru", exact: true }).waitFor({ timeout: 10000 });
    const [c] = await sql`SELECT name FROM customers WHERE email = ${BUYER_A}`;
    expect(c.name === "Pembeli A Baru", `nama setelah ubah ${c.name}`);
    expect((await overflowX(buyerA)) <= 0, "/me melebar di 360px");
  });

  await step("2c. customer A checkout 2 tiket VIP -> order pending", async () => {
    ctx.orderA = await checkout(buyerA, ctx.eventId, "VIP", 2);
    expect(ctx.orderA, "tidak diarahkan ke halaman order setelah checkout");
    const [o] = await sql`SELECT status FROM orders WHERE id = ${ctx.orderA}`;
    expect(o.status === "pending_payment", `status order ${o.status}`);
  });

  await step("2d. admin approve pembayaran (verifikasi manual, verified_by tercatat)", async () => {
    await admin.goto(`${WEB}/id/admin/orders`);
    await admin.getByText(`#${ctx.orderA} ·`).first().click();
    await admin.getByRole("button", { name: msg.Studio.orders.approve }).click();
    await admin.getByText(msg.Studio.orders.approved).first().waitFor({ timeout: 10000 });
    const [o] = await sql`SELECT status, paid_at, verified_by FROM orders WHERE id = ${ctx.orderA}`;
    expect(o.status === "paid" && o.paid_at, `status ${o.status}, paid_at ${o.paid_at}`);
    expect(Number(o.verified_by) === ctx.adminId, `verified_by ${o.verified_by}`);
  });

  await step("2e. tiket + QR muncul di Tiket saya", async () => {
    await buyerA.goto(`${WEB}/id/tickets`);
    const show = buyerA.getByRole("link", { name: msg.Tickets.showQr });
    await show.first().waitFor({ timeout: 15000 });
    expect((await show.count()) >= 2, `jumlah link QR ${await show.count()}, harusnya ≥ 2`);
    await show.first().click();
    await buyerA.waitForURL(/\/tickets\/\d+/, { timeout: 15000 });
    await buyerA.getByText(msg.Tickets.gatePass).first().waitFor({ timeout: 10000 });
    const qrSvg = buyerA.locator("svg[height][width]").filter({ has: buyerA.locator("path") });
    await qrSvg.first().waitFor({ timeout: 10000 });
    await buyerA.screenshot({ path: path.join(OUT, "tiket-qr.png") });
  });

  const buyerB = await newPage(browser, "buyerB", { width: 390, height: 844 });
  await step("3. customer B beli melebihi sisa kuota -> ditolak dengan pesan jelas", async () => {
    await customerLogin(buyerB, BUYER_B, "Pembeli B");
    const orderId = await checkout(buyerB, ctx.eventId, "VIP", 2); // VIP sisa 1
    expect(orderId === null, `order ${orderId} malah dibuat`);
    await buyerB.getByText(msg.Errors.codes.QUOTA_EXCEEDED).first().waitFor({ timeout: 10000 });
    const [c] = await sql`SELECT COUNT(*)::int AS n FROM orders WHERE event_id = ${ctx.eventId} AND status <> 'expired'`;
    expect(c.n === 1, `jumlah order aktif ${c.n}, harusnya 1`);
  });

  await step("3b. customer B batalkan order pending -> cancelled, kuota langsung kembali; admin melihat cancelled", async () => {
    const before0 = await api(`/concerts/${ctx.eventId}`);
    const regulerId = before0.json.ticket_categories.find((c) => c.name === "Reguler").id;
    const before = await api(`/concerts/${ctx.eventId}`);
    const remainingBefore = before.json.ticket_categories.find((c) => c.id === regulerId).remaining;
    const orderId = await checkout(buyerB, ctx.eventId, "Reguler", 2);
    expect(orderId, "order Reguler tidak dibuat");
    const held = await api(`/concerts/${ctx.eventId}`);
    expect(held.json.ticket_categories.find((c) => c.id === regulerId).remaining === remainingBefore - 2, "kuota tidak tertahan");

    const c = msg.OrderDetail.cancel;
    await buyerB.getByRole("button", { name: c.cta }).click();
    const dialog = buyerB.getByRole("alertdialog");
    await dialog.getByText(c.confirmTitle).waitFor({ timeout: 5000 });
    // "Tidak" = order tetap pending
    await dialog.getByRole("button", { name: c.keep }).click();
    expect((await sql`SELECT status FROM orders WHERE id = ${orderId}`)[0].status === "pending_payment", "order berubah padahal batal diurungkan");
    await buyerB.getByRole("button", { name: c.cta }).click();
    await buyerB.getByRole("alertdialog").getByRole("button", { name: c.confirm }).click();
    await buyerB.getByText(msg.OrderDetail.cancelledTitle).first().waitFor({ timeout: 10000 });
    const [o] = await sql`SELECT status FROM orders WHERE id = ${orderId}`;
    expect(o.status === "cancelled", `status ${o.status}`);
    const after = await api(`/concerts/${ctx.eventId}`);
    expect(after.json.ticket_categories.find((c) => c.id === regulerId).remaining === remainingBefore, "kuota tidak kembali setelah batal");
    expect((await overflowX(buyerB)) <= 0, "detail order melebar");

    await admin.goto(`${WEB}/id/admin/orders`);
    await admin.getByRole("tab", { name: msg.OrderStatus.cancelled }).click();
    await admin.getByText(`#${orderId} ·`).first().waitFor({ timeout: 10000 });
  });

  await step("4. admin close sales -> order ditolak; buka lagi -> terbuka tanpa notifikasi ulang", async () => {
    await admin.goto(`${WEB}/id/admin/events/${ctx.eventId}`);
    await admin.getByRole("button", { name: msg.Studio.detail.close }).click();
    await admin.getByRole("button", { name: msg.Studio.detail.reopen }).waitFor({ timeout: 10000 });
    const buyerToken = await buyerB.evaluate(() => localStorage.getItem("wavy_auth_token"));
    const res = await api("/orders", {
      token: buyerToken,
      method: "POST",
      body: { event_id: ctx.eventId, ticket_category_id: ctx.categoryIds[1], quantity: 1, full_name: "B", email: BUYER_B, phone: "81223333444", id_number: "1", birth_date: "2000-01-01", gender: "L", wa_consent: "Tidak" },
    });
    expect(res.status >= 400 && res.status < 500 && res.json.error?.code === "SALES_CLOSED", `POST /orders -> ${res.status} ${JSON.stringify(res.json)}`);
    await buyerB.goto(`${WEB}/id/concerts/${ctx.eventId}/checkout`);
    await buyerB.getByText(msg.Errors.codes.SALES_CLOSED).first().waitFor({ timeout: 20000 });

    const [{ n: before }] = await sql`SELECT COUNT(*)::int AS n FROM notifications`;
    await admin.getByRole("button", { name: msg.Studio.detail.reopen }).click();
    await admin.getByRole("button", { name: msg.Studio.detail.close }).waitFor({ timeout: 10000 });
    const pub = await api(`/concerts/${ctx.eventId}`);
    expect(pub.json.sales_status === "open", `sales_status setelah buka lagi ${pub.json.sales_status}`);
    const [{ n: after }] = await sql`SELECT COUNT(*)::int AS n FROM notifications`;
    expect(after === before, `buka lagi mengirim ${after - before} notifikasi`);
  });

  await step("5a. admin scan QR -> valid (scanned_at & scanned_by tercatat)", async () => {
    const [t] = await sql`SELECT qr_code FROM tickets WHERE order_id = ${ctx.orderA} ORDER BY id LIMIT 1`;
    ctx.qr = t.qr_code;
    await admin.goto(`${WEB}/id/admin/scan`);
    await admin.locator("#scan-manual").fill(ctx.qr);
    await admin.getByRole("button", { name: msg.Studio.scan.check }).click();
    await admin.getByText(msg.Studio.scan.valid).waitFor({ timeout: 10000 });
    const [s] = await sql`SELECT is_scanned, scanned_at, scanned_by FROM tickets WHERE qr_code = ${ctx.qr}`;
    expect(s.is_scanned && s.scanned_at && Number(s.scanned_by) === ctx.adminId, `scan ${JSON.stringify(s)}`);
  });

  await step("5b. scan ulang -> ditolak (duplikat)", async () => {
    await admin.waitForTimeout(3200); // lewati debounce kamera 3 detik
    await admin.locator("#scan-manual").fill(ctx.qr);
    await admin.getByRole("button", { name: msg.Studio.scan.check }).click();
    await admin.getByText(msg.Studio.errors.ALREADY_SCANNED).first().waitFor({ timeout: 10000 });
    const [t] = await sql`SELECT COUNT(*)::int AS n FROM tickets WHERE order_id = ${ctx.orderA} AND is_scanned`;
    expect(t.n === 1, `tiket ter-scan ${t.n}, harusnya 1`);
  });

  await step("6a. dashboard admin: KPI sesuai data, tidak melebar di 360px", async () => {
    const d = msg.Admin.dashboard;
    await admin.goto(`${WEB}/id/admin/dashboard`);
    await admin.getByText(d.checkedInNote.split("{sold}")[0].trim()).first().waitFor({ timeout: 15000 });
    const dash = await api("/admin/dashboard", { token: ctx.adminToken });
    const stats = await api("/admin/stats", { token: ctx.adminToken });
    expect(dash.json.kpi.checked_in >= 1, `checked_in ${dash.json.kpi.checked_in}`);
    expect(stats.json.ticket_sold >= 2, `ticket_sold ${stats.json.ticket_sold}`);
    const sum = Object.values(stats.json.orders_by_status).reduce((a, b) => a + b, 0);
    expect(sum === stats.json.order_count, `orders_by_status ${sum} != order_count ${stats.json.order_count}`);
    await admin.screenshot({ path: path.join(OUT, "admin-dashboard-desktop.png"), fullPage: true });
    await admin.setViewportSize({ width: 360, height: 800 });
    await admin.waitForTimeout(500);
    expect((await overflowX(admin)) <= 0, "dashboard melebar di 360px");
    await admin.screenshot({ path: path.join(OUT, "admin-dashboard-360.png"), fullPage: true });
    await admin.setViewportSize({ width: 1280, height: 900 });
  });

  await step("6b. /admin/* wajib sesi admin; sesi customer tidak membuka admin; halaman & endpoint EO hilang", async () => {
    const guest = await newPage(browser, "guest");
    for (const p of ["/id/admin", "/id/admin/dashboard", "/id/admin/events"]) {
      await guest.goto(`${WEB}${p}`);
      await guest.waitForURL(/\/id\/admin\/login$/, { timeout: 15000 });
    }
    expect(await buyerA.evaluate(() => !!localStorage.getItem("wavy_auth_token")), "buyerA tidak punya sesi customer");
    await buyerA.goto(`${WEB}/id/admin/dashboard`);
    await buyerA.waitForURL(/\/id\/admin\/login$/, { timeout: 15000 });
    for (const p of ["/id/organizer/login", "/id/organizer/dashboard", "/id/organizer-guide"]) {
      const res = await guest.goto(`${WEB}${p}`);
      expect(res.status() === 404, `${p} -> ${res.status()}, harusnya 404`);
    }
    const old = await api("/auth/organizer/login", { method: "POST", body: { email: "x@y.z", password: "x" } });
    expect(old.status === 404, `POST /auth/organizer/login -> ${old.status}, harusnya 404`);
  });

  await step("6c. ganti bahasa ke EN di shell admin & /me; pilihan tersimpan (cookie NEXT_LOCALE)", async () => {
    // label radiogroup ikut bahasa halaman: "Bahasa" (id) / "Language" (en)
    const lang = (page, m = msg) => page.getByRole("radiogroup", { name: m.Locale.label });
    // admin: sidebar desktop
    await admin.goto(`${WEB}/id/admin/orders`);
    await lang(admin).first().getByRole("radio", { name: msg.Locale.name.en }).click();
    await admin.waitForURL(/\/en\/admin\/orders/, { timeout: 15000 });
    await admin.getByRole("heading", { name: msgEn.Studio.orders.title }).waitFor({ timeout: 10000 });
    const cookie = (await admin.context().cookies()).find((c) => c.name === "NEXT_LOCALE");
    expect(cookie?.value === "en", `cookie NEXT_LOCALE = ${cookie?.value}`);
    expect(cookie.expires > Date.now() / 1000 + 300 * 24 * 3600, "cookie bahasa tidak persisten (cookie sesi)");
    // /admin tanpa prefix mengikuti bahasa tersimpan
    await admin.goto(`${WEB}/admin`);
    await admin.waitForURL(/\/en\/admin\/dashboard/, { timeout: 15000 });
    await admin.getByRole("heading", { name: msgEn.Admin.dashboard.title }).waitFor({ timeout: 10000 });
    await lang(admin, msgEn).first().getByRole("radio", { name: msgEn.Locale.name.id }).click();
    await admin.waitForURL(/\/id\/admin\/dashboard/, { timeout: 15000 });

    // customer: /me
    await buyerA.goto(`${WEB}/id/me`);
    await lang(buyerA).first().getByRole("radio", { name: msg.Locale.name.en }).click();
    await buyerA.waitForURL(/\/en\/me/, { timeout: 15000 });
    await buyerA.getByText(msgEn.Profile.logout).first().waitFor({ timeout: 10000 });
    await buyerA.goto(`${WEB}/`);
    await buyerA.waitForURL(/\/en(\/|$)/, { timeout: 15000 });
    // menu user navbar juga punya pilihan bahasa
    await buyerA.goto(`${WEB}/en/tickets`);
    await buyerA.getByRole("button", { name: msgEn.Navbar.accountMenu }).click();
    await lang(buyerA, msgEn).first().getByRole("radio", { name: msgEn.Locale.name.id }).click();
    await buyerA.waitForURL(/\/id\/tickets/, { timeout: 15000 });
    await buyerA.getByRole("heading", { name: msg.Tickets.title }).first().waitFor({ timeout: 10000 });
  });

  await step("7. backend mati -> frontend menampilkan error, bukan data palsu", async () => {
    // simulasi backend mati: semua request ke API gagal di level jaringan
    const ctx7 = buyerA.context();
    await ctx7.route(`${API}/**`, (route) => route.abort("connectionrefused"));
    await buyerA.goto(`${WEB}/id/tickets`);
    await buyerA.getByText(msg.Errors.network).first().waitFor({ timeout: 15000 });
    expect((await buyerA.getByRole("link", { name: msg.Tickets.showQr }).count()) === 0, "tiket tetap tampil saat backend mati");
    await buyerA.screenshot({ path: path.join(OUT, "backend-mati.png") });
    await ctx7.unroute(`${API}/**`);
  });

  await browser.close();
  smtp.close();
  await sql.end();

  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, "result.json"), JSON.stringify({ run: RUN, results }, null, 2));
  console.log(`\n${results.length - failed.length}/${results.length} langkah lolos`);
  process.exit(failed.length ? 1 : 0);
}

main().catch(async (err) => {
  console.error(err);
  await sql.end().catch(() => {});
  process.exit(1);
});
