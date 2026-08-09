import { cn } from "@/lib/utils";

/**
 * Reusable premium section heading (scope §9 / §19).
 * Gold "eyebrow" pill, Playfair Display title with optional gold-gradient
 * highlight word, and a muted subtitle. Centered by default.
 */
interface SectionHeadingProps {
  eyebrow: string;
  title?: string;
  highlight?: string;
  highlightAfter?: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  highlightAfter,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-12 flex flex-col gap-4",
        centered && "items-center text-center",
        className
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-premium-gold/40 bg-golden/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-golden">
        {eyebrow}
      </span>
      {title ? (
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}{" "}
          {highlight ? (
            <span className="bg-gradient-to-r from-golden via-premium-gold to-saffron bg-clip-text text-transparent">
              {highlight}
            </span>
          ) : null}
          {highlightAfter ? ` ${highlightAfter}` : ""}
        </h2>
      ) : null}
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base",
            centered && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      ) : null}
      <div
        className={cn(
          "flex items-center gap-2",
          centered && "justify-center"
        )}
      >
        <span className="h-px w-10 bg-premium-gold/60" />
        <span className="h-1.5 w-1.5 rotate-45 bg-golden" />
        <span className="h-px w-10 bg-premium-gold/60" />
      </div>
    </div>
  );
}