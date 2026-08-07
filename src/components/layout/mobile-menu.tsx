"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { WhatsAppButton, CallButton } from "@/components/layout/cta-buttons";
import { SocialIconRow } from "@/components/layout/social-icons";
import type { NavItem } from "@/components/layout/nav-menu";
import { cn } from "@/lib/utils";

export function MobileMenu({
  navItems,
  socials,
  whatsappHref,
  callNumber,
}: {
  navItems: NavItem[];
  socials: { platform: string; url: string }[];
  whatsappHref: string;
  callNumber: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-golden/40 bg-white text-royal-purple shadow-sm transition-colors hover:bg-golden/10 xl:hidden sm:h-11 sm:w-11"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[85%] max-w-[360px] border-l border-golden/20 bg-white p-0"
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-border/60 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold-gradient font-heading text-xl font-bold text-white">
            ॐ
          </div>
          <div className="flex-1">
            <SheetTitle className="font-heading text-lg font-bold text-royal-purple">
              JAIGURU ASTROREMEDY
            </SheetTitle>
            <SheetDescription className="text-xs">
              Vedic Astrologer Arup Shastri (Jai Guru)
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-semibold text-dark-text transition-colors hover:bg-golden/10 hover:text-royal-purple",
                    isActive && "bg-golden/10 text-royal-purple"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-border/60 bg-cream/60 p-4">
          <div className="grid grid-cols-2 gap-3">
            <WhatsAppButton href={whatsappHref} label="WhatsApp" size="sm" />
            <CallButton href={`tel:${callNumber}`} label="Call Now" size="sm" />
          </div>
          <SocialIconRow links={socials} size="sm" className="justify-center" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
