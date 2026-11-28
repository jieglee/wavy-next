// Cek i18n web (next-intl):
//   1. id.json dan en.json punya key yang sama persis (tidak ada yang hilang di salah satu bahasa),
//      tidak ada nilai kosong, dan placeholder {x} di kedua bahasa sama.
//   2. Key literal yang dipakai kode (useTranslations("Ns") + t("key")) ada di messages.
//   3. Teks UI hardcode di .tsx (teks JSX dan atribut placeholder/title/alt/aria-label/label).
//
//   node scripts/check-i18n.mjs            -> gagal (exit 1) bila ada masalah
//   node scripts/check-i18n.mjs --verbose  -> tampilkan semua temuan
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const verbose = process.argv.includes("--verbose");
const load = (l) => JSON.parse(fs.readFileSync(path.join(root, "src/messages", `${l}.json`), "utf8"));
const messages = { id: load("id"), en: load("en") };

/** { "A.b.c": "teks" } untuk semua daun string (array body halaman info ikut sebagai A.b.0). */
function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}
const flat = { id: flatten(messages.id), en: flatten(messages.en) };
const problems = [];

// ---------- 1. paritas key ----------
for (const [a, b] of [["id", "en"], ["en", "id"]]) {
  for (const key of Object.keys(flat[a])) if (!(key in flat[b])) problems.push(`[key] "${key}" ada di ${a}.json tapi tidak ada di ${b}.json`);
}
// hanya nama argumen ICU ({count}, {count, plural, ...}); isi cabang plural tidak dihitung
const placeholders = (s) => [...new Set([...String(s).matchAll(/\{(\w+)\s*(?=[,}])/g)].map((m) => m[1]))].sort().join(",");
for (const key of Object.keys(flat.id)) {
  if (!(key in flat.en)) continue;
  for (const l of ["id", "en"]) if (String(flat[l][key]).trim() === "") problems.push(`[kosong] ${l}.json "${key}"`);
  if (placeholders(flat.id[key]) !== placeholders(flat.en[key]))
    problems.push(`[placeholder] "${key}": id {${placeholders(flat.id[key])}} vs en {${placeholders(flat.en[key])}}`);
}

// en sama persis dengan id dan berisi kata Indonesia = belum diterjemahkan
const ID_WORDS = /\b(dan|yang|untuk|tidak|belum|dengan|kamu|dari|tiket|pesanan|konser|bayar|masuk|lihat|semua|hapus|simpan|batal|sudah|akan|bisa|harus|atau)\b/i;
for (const key of Object.keys(flat.id))
  if (flat.en[key] === flat.id[key] && ID_WORDS.test(String(flat.id[key]))) problems.push(`[belum diterjemahkan] en.json "${key}" = "${String(flat.en[key]).slice(0, 60)}"`);

// ---------- 2 & 3. pindai kode ----------
const SKIP_DIRS = [path.join("src", "components", "charts")]; // komponen vendor Bklit (bukan teks UI)
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!SKIP_DIRS.some((s) => p.endsWith(s))) walk(p);
    } else if (/\.tsx$/.test(e.name)) files.push(p);
  }
})(path.join(root, "src"));

const TEXT_PROPS = new Set(["label", "title", "subtitle", "description", "text", "placeholder", "eyebrow", "ctaLabel", "pill", "pillCTA", "message", "desc", "body", "caption", "heading", "cta"]);
const TEXT_ATTRS = new Set(["placeholder", "title", "alt", "aria-label", "label", "description"]);
// teks yang boleh hardcode: nama merek, simbol, kode
const ALLOWED = [
  /^Wavy( Admin| logo)?[\s.·]*$/,
  /^(Instagram|Facebook|TikTok|Threads|WhatsApp|X)$/,
  /^https?:\/\/$/,
  /^(&bull;|•)+$/,
  /^&copy;$/,
  /^Event4u$/,
  /^Midtrans$/,
  /^QRIS$/,
  /^WIB$/,
  /^Rp$/,
  /^[A-Z]{2}$/,
  /^#\d*$/,
  /^[\d\s.,:+\-×%/·]+$/,
  /^Lv\b/,
  /^𝕏$/,
  /^f$/,
];
const hasWords = (s) => /\p{L}{2,}/u.test(s);
const allowed = (s) => ALLOWED.some((r) => r.test(s.trim()));

const missingKeys = [];
const hardcoded = [];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const src = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const line = (n) => sf.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const ignored = (n) => {
    // // i18n-ignore di baris yang sama atau sebelumnya
    const l = line(n);
    const lines = src.split("\n");
    return /i18n-ignore/.test(lines[l - 1] ?? "") || /i18n-ignore/.test(lines[l - 2] ?? "");
  };

  // variabel -> namespace, dari: const t = useTranslations("Ns") / await getTranslations("Ns").
  // Per scope fungsi: `t` boleh punya namespace berbeda di tiap komponen dalam satu file.
  const nsOf = (decl) => {
    let init = decl.initializer;
    if (!init) return undefined;
    if (ts.isAwaitExpression(init)) init = init.expression;
    if (!(ts.isCallExpression(init) && ts.isIdentifier(init.expression) && /^(useTranslations|getTranslations)$/.test(init.expression.text))) return undefined;
    const arg = init.arguments[0];
    if (!arg) return "";
    if (ts.isStringLiteral(arg)) return arg.text;
    if (ts.isObjectLiteralExpression(arg)) {
      const p = arg.properties.find((x) => x.name?.getText() === "namespace");
      if (p && ts.isPropertyAssignment(p) && ts.isStringLiteral(p.initializer)) return p.initializer.text;
    }
    return undefined;
  };
  const scopeCache = new Map();
  const declsIn = (scope) => {
    if (scopeCache.has(scope)) return scopeCache.get(scope);
    const m = new Map();
    (function find(n) {
      if (n !== scope && ts.isFunctionLike(n)) return; // fungsi bersarang punya scope sendiri
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
        const v = nsOf(n);
        if (v !== undefined) m.set(n.name.text, v);
      }
      ts.forEachChild(n, find);
    })(scope);
    scopeCache.set(scope, m);
    return m;
  };
  const resolveNs = (node, name) => {
    for (let p = node.parent; p; p = p.parent) {
      if (ts.isFunctionLike(p) || ts.isSourceFile(p)) {
        const m = declsIn(p);
        if (m.has(name)) return m.get(name);
      }
    }
    return undefined;
  };

  (function visit(n) {
    // t("key") / t.rich("key") dengan key literal
    if (ts.isCallExpression(n)) {
      let callee = n.expression;
      if (ts.isPropertyAccessExpression(callee) && /^(rich|markup|raw|has)$/.test(callee.name.text)) callee = callee.expression;
      const arg = n.arguments[0];
      const nsName = ts.isIdentifier(callee) ? resolveNs(n, callee.text) : undefined;
      if (nsName !== undefined && arg && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) {
        const full = [nsName, arg.text].filter(Boolean).join(".");
        const exists = (m) => full in m || Object.keys(m).some((k) => k.startsWith(`${full}.`));
        if (!(ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === "has"))
          for (const l of ["id", "en"]) if (!exists(flat[l])) missingKeys.push(`${rel}:${line(n)} "${full}" tidak ada di ${l}.json`);
      }
    }
    // teks JSX
    if (ts.isJsxText(n)) {
      const text = n.text.replace(/\s+/g, " ").trim();
      if (text && hasWords(text) && !allowed(text) && !ignored(n)) hardcoded.push(`${rel}:${line(n)} teks "${text.slice(0, 70)}"`);
    }
    // atribut teks dengan string literal
    if (ts.isJsxAttribute(n) && TEXT_ATTRS.has(n.name.getText()) && n.initializer) {
      let v = null;
      if (ts.isStringLiteral(n.initializer)) v = n.initializer.text;
      else if (ts.isJsxExpression(n.initializer) && n.initializer.expression && ts.isStringLiteral(n.initializer.expression)) v = n.initializer.expression.text;
      if (v && hasWords(v) && !allowed(v) && !ignored(n)) hardcoded.push(`${rel}:${line(n)} ${n.name.getText()}="${v.slice(0, 70)}"`);
    }
    // string literal yang langsung dirender: {cond ? "Aktif" : "Nonaktif"}, {x || "Tanpa nama"}
    if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && hasWords(n.text) && !allowed(n.text) && !ignored(n)) {
      let p = n.parent;
      while (p && (ts.isConditionalExpression(p) || ts.isParenthesizedExpression(p) || (ts.isBinaryExpression(p) && /^(\|\||\?\?|&&)$/.test(p.operatorToken.getText())))) p = p.parent;
      // CSS di <style jsx>{`...`}</style> bukan teks UI
      const inStyle = p && ts.isJsxExpression(p) && p.parent && ts.isJsxElement(p.parent) && p.parent.openingElement.tagName.getText() === "style";
      const inJsx = !inStyle && p && ts.isJsxExpression(p) && p.parent && (ts.isJsxElement(p.parent) || ts.isJsxFragment(p.parent) || (ts.isJsxAttribute(p.parent) && TEXT_ATTRS.has(p.parent.name.getText())));
      if (inJsx) hardcoded.push(`${rel}:${line(n)} ekspresi "${n.text.slice(0, 70)}"`);
      // properti data UI: { label: "Detail" }, { title: "..." }
      if (ts.isPropertyAssignment(n.parent) && n.parent.initializer === n && TEXT_PROPS.has(n.parent.name.getText()))
        hardcoded.push(`${rel}:${line(n)} ${n.parent.name.getText()}: "${n.text.slice(0, 70)}"`);
    }
    // toast.success("...") / toast.error("...")
    if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression) && n.expression.expression.getText() === "toast") {
      const arg = n.arguments[0];
      if (arg && ts.isStringLiteral(arg) && hasWords(arg.text) && !ignored(n)) hardcoded.push(`${rel}:${line(n)} toast "${arg.text.slice(0, 70)}"`);
    }
    ts.forEachChild(n, visit);
  })(sf);
}

problems.push(...missingKeys.map((m) => `[key dipakai] ${m}`), ...hardcoded.map((m) => `[hardcode] ${m}`));

const summary = `i18n: ${Object.keys(flat.id).length} key id, ${Object.keys(flat.en).length} key en, ${files.length} file .tsx dipindai`;
if (problems.length === 0) {
  console.log(`${summary} — OK`);
  process.exit(0);
}
console.log(summary);
for (const p of verbose ? problems : problems.slice(0, 80)) console.log("  " + p);
if (!verbose && problems.length > 80) console.log(`  ... ${problems.length - 80} lagi (--verbose)`);
console.log(`\n${problems.length} masalah`);
process.exit(1);
