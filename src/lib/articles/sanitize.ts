import "server-only";

const DANGEROUS_TAGS =
  /<\/?(script|iframe|object|embed|style|link|meta|form|input|button|textarea|select|option|video|audio|source|track|svg|math|template|base)\b[^>]*>/gi;

/**
 * Basic server-side HTML allowlisting for admin-authored article content.
 * Strips scriptable elements, event handlers and javascript: URLs before the
 * content is rendered on the public article pages (defense in depth — only
 * admins can author articles, but the output never carries executable code).
 */
export function sanitizeArticleHtml(html: string): string {
  let out = html
    .replace(DANGEROUS_TAGS, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\shref\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, "")
    .replace(/\ssrc\s*=\s*("javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]+)/gi, "");
  return out;
}