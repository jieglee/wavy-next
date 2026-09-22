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
        const items = lines.map((l) => `<li>${l.replace(/^[-•\d.)]+\s*/, "")}</li>`).join("");
        parts.push(`<${tag}>${items}</${tag}>`);
      } else {
        for (const line of lines) parts.push(`<p>${line}</p>`);
      }
    }
    html = parts.join("");
  }
  html = html.replace(/(?<!["'>])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  return html;
}
