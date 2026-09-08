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
  return doc.body.innerHTML;
}
