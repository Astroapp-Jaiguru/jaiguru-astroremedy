import type { ReactNode } from "react";

/**
 * Tiny markdown renderer for legal page content (Phase 6, scope §28).
 * Supports the subset used in seeded content: `#`/`##`/`###` headings,
 * `-` lists, `**bold**`, `*italic*` and `_italic_`, paragraphs, `---` rules.
 * Kept dependency-free; renders to styled JSX.
 */

function inline(
  text: string,
  textClass: string,
  headingClass: string
): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className={`font-semibold ${headingClass}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={i} className={`italic ${textClass}`}>
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Text color overrides. Legal pages use the dark legal-ink variables; pages
 * that render markdown on a dark surface (e.g. product return policy) pass
 * light Tailwind classes so the content stays readable.
 */
export function Markdown({
  content,
  textClass = "text-[var(--jaiguru-legal-text-color)]",
  headingClass = "text-[var(--jaiguru-legal-heading-color)]",
}: {
  content: string;
  textClass?: string;
  headingClass?: string;
}): ReactNode {
  const lines = content.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let para: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={key++} className="mt-4 space-y-2 pl-1">
        {list.map((item, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm leading-relaxed ${textClass}`}>
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#FACC15]" />
            <span>{inline(item, textClass, headingClass)}</span>
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(
      <p key={key++} className={`mt-4 text-sm leading-relaxed ${textClass}`}>
        {inline(para.join(" "), textClass, headingClass)}
      </p>
    );
    para = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushPara();
      continue;
    }
    if (line === "---") {
      flushList();
      flushPara();
      blocks.push(<hr key={key++} className="my-6 border-[var(--jaiguru-legal-card-border)]/40" />);
      continue;
    }
    if (line.startsWith("### ")) {
      flushList();
      flushPara();
      blocks.push(
        <h3 key={key++} className={`mt-6 font-display text-lg font-bold ${headingClass}`}>
          {inline(line.slice(4), textClass, headingClass)}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push(
        <h2 key={key++} className={`mt-8 font-display text-xl font-bold ${headingClass}`}>
          {inline(line.slice(3), textClass, headingClass)}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      flushPara();
      blocks.push(
        <h1 key={key++} className={`mt-8 font-display text-2xl font-bold ${headingClass}`}>
          {inline(line.slice(2), textClass, headingClass)}
        </h1>
      );
      continue;
    }
    if (/^[-*•]\s+/.test(line)) {
      flushPara();
      list.push(line.replace(/^[-*•]\s+/, ""));
      continue;
    }
    para.push(line);
  }
  flushList();
  flushPara();

  return <div>{blocks}</div>;
}