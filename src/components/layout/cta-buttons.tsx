import type { ReactNode } from "react";
import Link from "next/link";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsappIcon } from "@/components/layout/social-icons";

/**
 * Pill CTA buttons used across header / hero / footer (scope UI spec §5.2, §7).
 */

function ctaBase(className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[var(--jaiguru-btn-radius)] font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden",
    className
  );
}

const sizes = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-[15px]",
  lg: "h-[52px] px-8 text-[15px]",
} as const;

export function WhatsAppButton({
  href,
  label,
  size = "md",
  className,
  iconOnly,
  labelClassName,
}: {
  href: string;
  label?: string;
  size?: keyof typeof sizes;
  className?: string;
  iconOnly?: boolean;
  labelClassName?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label ?? "WhatsApp"}
      className={ctaBase(
        cn(
          "bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] hover:bg-[#1eb957] hover:shadow-[0_12px_36px_rgba(37,211,102,0.45)]",
          sizes[size],
          iconOnly && "px-0",
          className
        )
      )}
    >
      <WhatsappIcon className="h-5 w-5 shrink-0" />
      {!iconOnly && (
        <span className={cn("whitespace-nowrap", labelClassName)}>{label}</span>
      )}
    </a>
  );
}

export function CallButton({
  href,
  label = "Call Now",
  size = "md",
  variant = "purple",
  className,
  iconOnly,
  labelClassName,
}: {
  href: string;
  label?: string;
  size?: keyof typeof sizes;
  variant?: "purple" | "gold";
  className?: string;
  iconOnly?: boolean;
  labelClassName?: string;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      className={ctaBase(
        cn(
          variant === "purple"
            ? "bg-royal-purple text-white hover:bg-indigo-deep"
            : "bg-golden text-dark-text hover:bg-premium-gold",
          sizes[size],
          iconOnly && "px-0",
          className
        )
      )}
    >
      <Phone className="h-5 w-5 shrink-0" />
      {!iconOnly && (
        <span className={cn("whitespace-nowrap", labelClassName)}>{label}</span>
      )}
    </a>
  );
}

export function OutlineButton({
  href,
  label,
  size = "md",
  className,
  children,
}: {
  href: string;
  label?: string;
  size?: keyof typeof sizes;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={ctaBase(
        cn(
          "border border-white/35 text-white hover:bg-white/10",
          sizes[size],
          className
        )
      )}
    >
      {children ?? <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
}
