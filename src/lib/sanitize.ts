const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
  let html = doc.body.innerHTML;
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    const HEADING_RE = /^(SYARAT|TERMS|GENERAL|INFORMASI|BATASAN|LAYANAN|KEBIJAKAN|PEMERIKSAAN|CUSTOMER|PROMOTERS|TENTANG|ABOUT|NO RE-ENTRY|AGE |SPECIAL NEED|WRISTBAND|GENERAL POLICIES|GENERAL REGULATIONS|COPYRIGHT)/;
    const looksHeading = (line: string) =>
      line.length <= 70 &&
      (HEADING_RE.test(line) ||
        (/^[A-Z0-9][A-Z0-9\s\-&/()]{4,}$/.test(line) && /[A-Z]/.test(line) && !/[.!?]$/.test(line) && !line.includes("www.") && !line.includes("http")));
    const blocks = dirty.split(/\n\s*\n/);
    const parts: string[] = [];
    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;
      const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
      const looksLikeList = lines.length >= 2 && lines.every((l) => /^[-•\d.)]+\s/.test(l));
      if (looksLikeList) {
        const isOrdered = /^\d+[.)]/.test(lines[0]);
        const tag = isOrdered ? "ol" : "ul";
        const items = lines
          .map((l) => `<li>${escapeHtml(l.replace(/^[-•\d.)]+\s*/, ""))}</li>`)
          .join("");
        parts.push(`<${tag}>${items}</${tag}>`);
      } else if (lines.length === 1 && looksHeading(lines[0])) {
        parts.push(`<h3>${escapeHtml(lines[0])}</h3>`);
      } else {
        for (const line of lines) {
          if (looksHeading(line)) parts.push(`<h3>${escapeHtml(line)}</h3>`);
          else parts.push(`<p>${escapeHtml(line)}</p>`);
        }
      }
    }
    html = parts.join("");
  }
  html = html.replace(/(?<!["'>])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}
