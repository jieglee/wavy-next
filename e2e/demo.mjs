// Skenario demo UKK (docs/PRD.md §7) end-to-end, headless.
//
// Prasyarat (lihat e2e/README.md):
//   - backend wavy-backend (feat/organizer-api atau lebih baru) jalan ke Postgres LOKAL *_test,
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
const sql = postgres(DB_URL, { onnotice: () => {} });
const RUN = Date.now().toString(36);
const EO = { email: `eo-${RUN}@wavy.test`, password: "eo-demo-123", name: `EO Demo ${RUN}` };
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
    results.push({ name, ok: false, ms: Date.now() - started, error: String(err?.message ?? err).split("\n")[0] });
    console.log(`  ✗ ${name}\n      ${String(err?.message ?? err).split("\n")[0]}`);
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

async function seed() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;
  await sql`INSERT INTO organizers (name, email, password, status, created_at)
            VALUES (${EO.name}, ${EO.email}, crypt(${EO.password}, gen_salt('bf', 10)), 'active', now())`;
  const [org] = await sql`SELECT id FROM organizers WHERE email = ${EO.email}`;
  ctx.organizerId = org.id;
  const [artist] = await sql`INSERT INTO artists (organizer_id, name, genre, photo_url, bio)
                             VALUES (${org.id}, ${"Band Demo " + RUN}, 'Rock', '', '') RETURNING id`;
  ctx.artistId = artist.id;
  await sql`INSERT INTO admins (name, email, password) VALUES ('Admin Demo', ${ADMIN.email}, crypt(${ADMIN.password}, gen_salt('bf', 10)))`;
}

async function customerLogin(page, email) {
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
  await page.waitForURL(/\/home/, { timeout: 20000 });
}

/** Checkout lewat UI; mengembalikan id order baru, atau null bila tetap di halaman checkout. */
async function checkout(page, eventId, categoryName, qty) {
  await page.goto(`${WEB}/id/concerts/${eventId}/checkout`);
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

  await step("0. seed EO, artis, admin di DB uji", seed);

  const eo = await newPage(browser, "eo");
  await step("1a. EO login", async () => {
    await eo.goto(`${WEB}/id/organizer/login`);
    await eo.locator('input[type="email"]').fill(EO.email);
    await eo.locator('input[type="password"]').fill(EO.password);
    await eo.locator('button[type="submit"]').click();
    await eo.waitForURL(/\/organizer\/dashboard/, { timeout: 20000 });
    const login = await api("/auth/organizer/login", { method: "POST", body: { email: EO.email, password: EO.password } });
    ctx.eoToken = login.json.access_token;
  });

  await step("1b. EO buat event (draft) dengan tenggat penjualan", async () => {
    const f = msg.Studio.form;
    const now = new Date();
    await eo.goto(`${WEB}/id/organizer/events/new`);
    await eo.locator("#ev-title").fill(`Konser Demo ${RUN}`);
    await eo.locator("#ev-artist").selectOption(String(ctx.artistId));
    await eo.locator("#ev-category").fill("Music");
    await eo.locator("#ev-venue").fill("Jakarta");
    await eo.locator("#ev-date").fill(wibInput(new Date(now.getTime() + 30 * 24 * H)));
    await eo.locator("#ev-sales-start").fill(wibInput(new Date(now.getTime() - H)));
    await eo.locator("#ev-sales-end").fill(wibInput(new Date(now.getTime() + 20 * 24 * H)));
    await eo.getByRole("button", { name: f.createDraft }).click();
    await eo.waitForURL(/\/organizer\/events\/\d+$/, { timeout: 20000 });
    ctx.eventId = Number(eo.url().match(/events\/(\d+)$/)[1]);
    const ev = await api(`/organizer/events/${ctx.eventId}`, { token: ctx.eoToken });
    expect(ev.json.status === "draft", `status event ${ev.json.status}, harusnya draft`);
    expect(ev.json.sales_end_at, "sales_end_at tidak tersimpan");
  });

  await step("1c. publish tanpa kategori ditolak", async () => {
    await eo.getByRole("button", { name: msg.Studio.detail.publish, exact: true }).click();
    await eo.getByText(msg.Studio.errors.NO_TICKET_CATEGORY).waitFor({ timeout: 10000 });
    const ev = await api(`/organizer/events/${ctx.eventId}`, { token: ctx.eoToken });
    expect(ev.json.status === "draft", "event berubah status padahal tanpa kategori");
  });

  await step("1d. EO tambah 2 kategori tiket (kuota 3)", async () => {
    const c = msg.Studio.categories;
    for (const [name, price] of [["VIP", "250000"], ["Reguler", "100000"]]) {
      await eo.getByRole("button", { name: c.add }).click();
      await eo.locator("#cat-name").fill(name);
      await eo.locator("#cat-price").fill(price);
      await eo.locator("#cat-quota").fill("3");
      await eo.getByRole("button", { name: c.save, exact: true }).click();
      await eo.getByText(name, { exact: true }).first().waitFor({ timeout: 10000 });
      await eo.getByRole("button", { name: c.add }).waitFor({ timeout: 10000 });
    }
    const ev = await api(`/organizer/events/${ctx.eventId}`, { token: ctx.eoToken });
    expect(ev.json.ticket_categories?.length === 2, `jumlah kategori ${ev.json.ticket_categories?.length}`);
  });

  await step("1e. EO publish -> penjualan terbuka", async () => {
    await eo.getByRole("button", { name: msg.Studio.detail.publish, exact: true }).click();
    await eo.getByRole("button", { name: msg.Studio.detail.close }).waitFor({ timeout: 10000 });
    const pub = await api(`/concerts/${ctx.eventId}`);
    expect(pub.json.sales_status === "open", `sales_status publik ${pub.json.sales_status}`);
    ctx.categoryIds = pub.json.ticket_categories.map((c) => c.id);
  });

  const buyerA = await newPage(browser, "buyerA", { width: 390, height: 844 });
  await step("2a. customer A login OTP (kode dari DB)", () => customerLogin(buyerA, BUYER_A));

  await step("2b. customer A checkout 2 tiket VIP -> order pending", async () => {
    ctx.orderA = await checkout(buyerA, ctx.eventId, "VIP", 2);
    expect(ctx.orderA, "tidak diarahkan ke halaman order setelah checkout");
    const [o] = await sql`SELECT status FROM orders WHERE id = ${ctx.orderA}`;
    expect(o.status === "pending_payment", `status order ${o.status}`);
  });

  await step("2c. EO approve pembayaran (verifikasi manual)", async () => {
    await eo.goto(`${WEB}/id/organizer/orders`);
    await eo.getByText(`#${ctx.orderA} ·`).first().click();
    await eo.getByRole("button", { name: msg.Studio.orders.approve }).click();
    await eo.getByText(msg.Studio.orders.approved).first().waitFor({ timeout: 10000 });
    const [o] = await sql`SELECT status, paid_at FROM orders WHERE id = ${ctx.orderA}`;
    expect(o.status === "paid" && o.paid_at, `status ${o.status}, paid_at ${o.paid_at}`);
  });

  await step("2d. tiket + QR muncul di Tiket saya", async () => {
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
    await customerLogin(buyerB, BUYER_B);
    const orderId = await checkout(buyerB, ctx.eventId, "VIP", 2); // VIP sisa 1
    expect(orderId === null, `order ${orderId} malah dibuat`);
    await buyerB.getByText(msg.Errors.codes.QUOTA_EXCEEDED).first().waitFor({ timeout: 10000 });
    const [c] = await sql`SELECT COUNT(*)::int AS n FROM orders WHERE event_id = ${ctx.eventId} AND status <> 'expired'`;
    expect(c.n === 1, `jumlah order aktif ${c.n}, harusnya 1`);
  });

  await step("4. EO close sales -> order customer ditolak", async () => {
    await eo.goto(`${WEB}/id/organizer/events/${ctx.eventId}`);
    await eo.getByRole("button", { name: msg.Studio.detail.close }).click();
    await eo.getByRole("button", { name: msg.Studio.detail.reopen }).waitFor({ timeout: 10000 });
    const buyerToken = await buyerB.evaluate(() => localStorage.getItem("wavy_auth_token"));
    const res = await api("/orders", {
      token: buyerToken,
      method: "POST",
      body: { event_id: ctx.eventId, ticket_category_id: ctx.categoryIds[1], quantity: 1, full_name: "B", email: BUYER_B, phone: "81223333444", id_number: "1", birth_date: "2000-01-01", gender: "L", wa_consent: "Tidak" },
    });
    expect(res.status >= 400 && res.status < 500 && res.json.error?.code === "SALES_CLOSED", `POST /orders -> ${res.status} ${JSON.stringify(res.json)}`);
    // UI: tombol pesan nonaktif / pesan penjualan ditutup
    await buyerB.goto(`${WEB}/id/concerts/${ctx.eventId}/checkout`);
    await buyerB.getByText(msg.Errors.codes.SALES_CLOSED).first().waitFor({ timeout: 20000 });
  });

  await step("5a. EO scan QR -> valid", async () => {
    const [t] = await sql`SELECT qr_code FROM tickets WHERE order_id = ${ctx.orderA} ORDER BY id LIMIT 1`;
    ctx.qr = t.qr_code;
    await eo.goto(`${WEB}/id/organizer/scan`);
    await eo.locator("#scan-manual").fill(ctx.qr);
    await eo.getByRole("button", { name: msg.Studio.scan.check }).click();
    await eo.getByText(msg.Studio.scan.valid).waitFor({ timeout: 10000 });
  });

  await step("5b. scan ulang -> ditolak (duplikat)", async () => {
    await eo.waitForTimeout(3200); // lewati debounce kamera 3 detik
    await eo.locator("#scan-manual").fill(ctx.qr);
    await eo.getByRole("button", { name: msg.Studio.scan.check }).click();
    await eo.getByText(msg.Studio.errors.ALREADY_SCANNED).first().waitFor({ timeout: 10000 });
    const [t] = await sql`SELECT COUNT(*)::int AS n FROM tickets WHERE order_id = ${ctx.orderA} AND is_scanned`;
    expect(t.n === 1, `tiket ter-scan ${t.n}, harusnya 1`);
  });

  const admin = await newPage(browser, "admin");
  await step("6. admin suspend EO -> EO langsung keluar dari dashboard", async () => {
    await admin.goto(`${WEB}/id/admin/login`);
    await admin.locator('input[type="email"]').fill(ADMIN.email);
    await admin.locator('input[type="password"]').fill(ADMIN.password);
    await admin.locator('button[type="submit"]').click();
    await admin.waitForURL(/\/admin\/dashboard/, { timeout: 20000 });
    const ao = msg.Admin.organizers;
    await admin.goto(`${WEB}/id/admin/organizers`);
    const row = admin.locator("tr", { hasText: EO.email });
    await row.getByRole("button", { name: ao.suspend, exact: true }).click();
    await admin.getByRole("alertdialog").getByRole("button", { name: ao.suspend, exact: true }).click();
    await row.getByRole("button", { name: ao.activate, exact: true }).waitFor({ timeout: 10000 });
    const [o] = await sql`SELECT status FROM organizers WHERE id = ${ctx.organizerId}`;
    expect(o.status === "suspended", `status organizer ${o.status}`);
    // token EO lama langsung tidak berlaku
    const me = await api("/organizer/me", { token: ctx.eoToken });
    expect(me.status === 403 && me.json.error?.code === "ORGANIZER_SUSPENDED", `/organizer/me -> ${me.status}`);
    await eo.goto(`${WEB}/id/organizer/dashboard`);
    await eo.waitForURL(/\/organizer\/login/, { timeout: 15000 });
    await eo.waitForTimeout(1000);
    expect(eo.url().includes("reason=suspended"), `URL EO setelah suspend: ${eo.url()}`);
    await eo.getByText(msg.Studio.session.suspended).waitFor({ timeout: 5000 });
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
