"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FacebookIcon, WhatsappIcon, XTwitterIcon } from "@/components/layout/social-icons";
import { cn } from "@/lib/utils";
import {
  absoluteUrl,
  facebookShareUrl,
  whatsappShareUrl,
  xShareUrl,
} from "@/lib/share";

/**
 * Share buttons for item detail pages (products / services / consultations).
 * Reusable and channel-agnostic: add a new network by appending an entry to
 * `channels` below. Renders a glass card with a "Share" heading and pill
 * buttons for WhatsApp, Facebook, X and Copy Link.
 */
export function ShareButtons({
  title,
  description,
  path,
  className,
}: {
  title: string;
  description?: string;
  /** Relative page path, e.g. "/products/5-mukhi-rudraksha-mala". */
  path: string;
  className?: string;
}) {
  const url = absoluteUrl(path);
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    toast.success("Link copied!", {
      description: "Share it anywhere you like.",
    });
    window.setTimeout(() => setCopied(false), 2500);
  };

  const channels = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: whatsappShareUrl({ url, title, description }),
      icon: <WhatsappIcon className="h-4 w-4" />,
      className:
        "border-[#25D366]/40 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white",
    },
    {
      key: "facebook",
      label: "Facebook",
      href: facebookShareUrl(url),
      icon: <FacebookIcon className="h-4 w-4" />,
      className:
        "border-[#1877F2]/40 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    },
    {
      key: "x",
      label: "X (Twitter)",
      href: xShareUrl({ url, title }),
      icon: <XTwitterIcon className="h-4 w-4" />,
      className:
        "border-white/25 bg-white/10 text-slate-200 hover:bg-white hover:text-slate-900",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur",
        className
      )}
    >
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF37]">
        <Share2 className="h-3.5 w-3.5" />
        Share this page
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
        {channels.map((ch) => (
          <a
            key={ch.key}
            href={ch.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${ch.label}`}
            title={`Share on ${ch.label}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
              ch.className
            )}
          >
            {ch.icon}
            {ch.label}
          </a>
        ))}
        <button
          type="button"
          onClick={copyLink}
          aria-label="Copy page link"
          title="Copy page link"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.35)]",
            copied
              ? "border-[#25D366]/60 bg-[#25D366]/20 text-[#25D366]"
              : "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-slate-900"
          )}
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
