const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Baris pendek huruf kapital tanpa huruf kecil & bukan kalimat → judul bagian. */
const isAllCapsHeading = (line: string) => {
  const l = line.trim();
  if (!l || l.length > 70) return false;
  if (/[.!?。]$/.test(l)) return false;
  if (/https?:|www\./i.test(l)) return false;
  if (!/^[A-Z0-9&.'"_\-()/,;: ]+$/.test(l)) return false;
  return /[A-Z]/.test(l);
};

type TncItem =
  | { type: "p" | "h3"; text: string }
  | { type: "li"; ordered: boolean; text: string };

const isLi = (x: TncItem): x is Extract<TncItem, { type: "li" }> => x.type === "li";

/** Ubah plain text menjadi HTML terstruktur: heading h3, list ul/ol, paragraf. */
function plainTextToHtml(dirty: string): string {
  const blocks = dirty.split(/\n\s*\n/);
  const parts: string[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);

    const struct: TncItem[] = [];
    let textBuf: string[] = [];
    const flushText = () => {
      if (!textBuf.length) return;
      struct.push({ type: "p", text: textBuf.join(" ") });
      textBuf = [];
    };

    for (const line of lines) {
      if (isAllCapsHeading(line)) {
        flushText();
        struct.push({ type: "h3", text: line });
        continue;
      }
      const item = line.match(/^(?:[-•*]\s*|\d+[.)][)\s]*)((?:.|\s)*)$/);
      if (item && item[1].trim()) {
        flushText();
        struct.push({ type: "li", ordered: /^\d+[.)]/.test(line), text: item[1].trim() });
        continue;
      }
      textBuf.push(line);
    }
    flushText();

    for (let i = 0; i < struct.length; i++) {
      const item = struct[i];
      if (isLi(item)) {
        const run: Extract<TncItem, { type: "li" }>[] = [];
        let k = i;
        let next = struct[k];
        while (isLi(next) && next.ordered === item.ordered) {
          run.push(next);
          k++;
          next = struct[k];
        }
        const tag = item.ordered ? "ol" : "ul";
        parts.push(`<${tag}>${run.map((it) => `<li>${escapeHtml(it.text)}</li>`).join("")}</${tag}>`);
        i = k - 1;
      } else if (item.type === "h3") {
        parts.push(`<h3>${escapeHtml(item.text)}</h3>`);
      } else {
        parts.push(`<p>${escapeHtml(item.text)}</p>`);
      }
    }
  }
  return parts.join("");
}

export function sanitizeHtml(dirty: string): string {
  const doc = new DOMParser().parseFromString(dirty, "text/html");
  const allowed: Record<string, string[]> = {
    table: [], thead: [], tbody: [], tr: [], th: [], td: [], tfoot: [],
    ul: [], ol: [], li: [], p: [], div: [], span: [], b: [], strong: [],
    i: [], em: [], u: [], s: [], a: [], br: [], hr: [], h1: [], h2: [],
    h3: [], h4: [], h5: [], h6: [], img: [], svg: [], small: [], blockquote: [],
  };
  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const tag = child.tagName.toLowerCase();
      if (!(tag in allowed)) {
        if (tag === "script" || tag === "iframe" || tag === "object" || tag === "embed" || tag === "form") {
          child.remove();
          continue;
        }
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        if (name.startsWith("on") || (attr.value && /^\s*javascript:/i.test(attr.value))) {
          child.removeAttribute(attr.name);
        } else if (name === "href" && tag === "a") {
          const href = attr.value.trim();
          if (!/^(https?:|\/|#)/i.test(href)) child.removeAttribute(attr.name);
        }
      }
      walk(child);
    }
  };
  walk(doc.body);
  // Kunci: jangan deteksi dari hasil parse (teks plain seperti "<To you>" bisa
  // di-parse jadi tag HTML palsu dan bikin jalur plain-text dilewati). Deteksi
  // dari struktur HTML asli di input.
  const hasHtmlStructure = /<\s*(?:p|br|div|ul|ol|li|h[1-6]|table|thead|tbody|tr|td|th|strong|b|i|em|u|s|a|img|hr|blockquote|span|small|font)\b/i.test(dirty);
  let html = hasHtmlStructure ? doc.body.innerHTML : plainTextToHtml(dirty);
  html = html.replace(/(?<!["'>])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}
