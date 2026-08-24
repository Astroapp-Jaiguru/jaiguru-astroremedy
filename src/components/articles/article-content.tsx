import { sanitizeArticleHtml } from "@/lib/articles/sanitize";

/**
 * Renders the admin-authored article HTML (Tiptap output) with a minimal
 * allowlist. Styling mirrors the site's prose conventions.
 */
export function ArticleContent({ html }: { html: string }) {
  const clean = sanitizeArticleHtml(html);
  return (
    <div
      className="article-prose text-[15px] leading-relaxed text-slate-200 [&_a]:font-medium [&_a]:text-golden [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-[#FACC15] [&_blockquote]:border-l-4 [&_blockquote]:border-golden/60 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-300 [&_h1]:mb-4 [&_h1]:mt-8 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_img]:my-4 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10 [&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-deep-navy [&_pre]:p-4 [&_pre]:text-xs [&_hr]:my-6 [&_hr]:border-white/10 [&_strong]:font-semibold [&_strong]:text-white"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}