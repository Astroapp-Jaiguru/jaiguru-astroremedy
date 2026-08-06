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
      <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#FACC15]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#FACC15]">
        {eyebrow}
      </span>
      {title ? (
        <h2 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}{" "}
          {highlight ? (
            <span className="bg-gradient-to-r from-[#FACC15] via-[#D4AF37] to-[#F97316] bg-clip-text text-transparent">
              {highlight}
            </span>
          ) : null}
          {highlightAfter ? ` ${highlightAfter}` : ""}
        </h2>
      ) : null}
      {subtitle ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base",
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
        <span className="h-px w-10 bg-[#D4AF37]/60" />
        <span className="h-1.5 w-1.5 rotate-45 bg-[#FACC15]" />
        <span className="h-px w-10 bg-[#D4AF37]/60" />
      </div>
    </div>
  );
}