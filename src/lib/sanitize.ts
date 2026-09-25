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
    const BULLET_RE = /^[-•]\s+/;
    const isEnglish = (line: string) => /^[A-Za-z]/.test(line) && /[a-z]/.test(line) && line.split(" ").length >= 6;
    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;
      const lines = trimmed.split(/\n/).map((l) => l.trim()).filter(Boolean);
      const looksLikeList = lines.length >= 2 && lines.every((l) => /^[-•\d.)]+\s/.test(l));
      if (looksLikeList) {
        const items = lines
          .map((l) => {
            const raw = l.replace(/^[-•\d.)]+\s*/, "");
            const content = isEnglish(raw) ? `<em>${escapeHtml(raw)}</em>` : escapeHtml(raw);
            return `<li>${content}</li>`;
          })
          .join("");
        parts.push(`<ul>${items}</ul>`);
        continue;
      }
      const out: string[] = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const bullet = BULLET_RE.test(line);
        const raw = bullet ? line.replace(BULLET_RE, "") : line;
        if (looksHeading(raw)) { out.push(`<h3>${escapeHtml(raw)}</h3>`); continue; }
        if (bullet) {
          const isEn = isEnglish(raw);
          const next = lines[i + 1];
          const nextIsEn = next && !BULLET_RE.test(next) && !looksHeading(next) && isEnglish(next.trim());
          if (isEn) out.push(`<ul><li><em>${escapeHtml(raw)}</em></li></ul>`);
          else if (nextIsEn) {
            out.push(`<ul><li>${escapeHtml(raw)}<br><em>${escapeHtml(next.trim())}</em></li></ul>`);
            i++;
          } else out.push(`<ul><li>${escapeHtml(raw)}</li></ul>`);
        } else {
          if (isEnglish(line)) out.push(`<p><em>${escapeHtml(line)}</em></p>`);
          else out.push(`<p>${escapeHtml(line)}</p>`);
        }
      }
      parts.push(out.join(""));
    }
    html = parts.join("");
  }
  html = html.replace(/(?<!["'>])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}
