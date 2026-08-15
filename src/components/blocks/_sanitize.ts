const blockedElements = /<(script|style|iframe|object|embed|form|input|button|textarea|select|template)\b[^>]*>[\s\S]*?<\/\1\s*>|<(script|style|iframe|object|embed|form|input|button|textarea|select|template)\b[^>]*\/?>/gi;
const eventHandlers = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const unsafeProtocols = /\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data):[\s\S]*?\2/gi;

export function sanitizeCmsHtml(html: string): string {
  return html
    .replace(blockedElements, "")
    .replace(eventHandlers, "")
    .replace(unsafeProtocols, " $1=\"#\"");
}
