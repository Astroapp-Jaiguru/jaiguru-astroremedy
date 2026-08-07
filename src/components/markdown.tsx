import type { ReactNode } from "react";

/**
 * Tiny markdown renderer for legal page content (Phase 6, scope §28).
 * Supports the subset used in seeded content: `#`/`##`/`###` headings,
 * `-` lists, `**bold**`, `*italic*` and `_italic_`, paragraphs, `---` rules.
 * Kept dependency-free; renders to styled JSX.
 */

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\n]+\*|_[^_\n]+_)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--jaiguru-legal-heading-color)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (
      (part.startsWith("*") && part.endsWith("*")) ||
      (part.startsWith("_") && part.endsWith("_"))
    ) {
      return (
        <em key={i} className="italic text-[var(--jaiguru-legal-text-color)]">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function Markdown({ content }: { content: string }): ReactNode {
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
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--jaiguru-legal-text-color)]">
            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#FACC15]" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(
      <p key={key++} className="mt-4 text-sm leading-relaxed text-[var(--jaiguru-legal-text-color)]">
        {inline(para.join(" "))}
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
        <h3 key={key++} className="mt-6 font-display text-lg font-bold text-[var(--jaiguru-legal-heading-color)]">
          {inline(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      flushPara();
      blocks.push(
        <h2 key={key++} className="mt-8 font-display text-xl font-bold text-[var(--jaiguru-legal-heading-color)]">
          {inline(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      flushPara();
      blocks.push(
        <h1 key={key++} className="mt-8 font-display text-2xl font-bold text-[var(--jaiguru-legal-heading-color)]">
          {inline(line.slice(2))}
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