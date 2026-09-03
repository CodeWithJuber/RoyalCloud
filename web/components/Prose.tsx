import { marked } from "marked";

/* CMS markdown body → HTML. Content is local and trusted (edited via Decap),
   but we still strip script/event-handler markup defensively. */
const BLOCKED =
  /<(script|style|iframe|object|embed|form|input|button|textarea|select|template)\b[^>]*>[\s\S]*?<\/\1\s*>|<(script|style|iframe|object|embed|form|input|button|textarea|select|template)\b[^>]*\/?>/gi;
const HANDLERS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const UNSAFE = /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data):[\s\S]*?\2/gi;

export function sanitizeHtml(html: string): string {
  return html.replace(BLOCKED, "").replace(HANDLERS, "").replace(UNSAFE, ' $1="#"');
}

export async function Prose({ markdown }: { markdown: string }) {
  const html = sanitizeHtml(await marked.parse(markdown));
  return (
    <section className="section prose-section">
      <div className="site-shell prose" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}
