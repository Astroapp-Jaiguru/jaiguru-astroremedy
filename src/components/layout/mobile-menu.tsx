"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
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
  siteName,
  tagline,
  logo,
  logoAlt,
}: {
  navItems: NavItem[];
  socials: { platform: string; url: string }[];
  whatsappHref: string;
  callNumber: string;
  siteName: string;
  tagline: string;
  logo: string | null;
  logoAlt: string;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

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
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gold-gradient font-heading text-xl font-bold text-white">
            <Image
              src={logo ?? "/favicon.png"}
              alt={logoAlt}
              fill
              unoptimized={!!logo}
              sizes="44px"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <SheetTitle className="font-heading text-lg font-bold text-royal-purple">
              {siteName}
            </SheetTitle>
            <SheetDescription className="text-xs">{tagline}</SheetDescription>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav className="flex flex-col">
            {navItems.map((item) => {
              if (item.children && item.children.length > 0) {
                const openSection = expanded === item.label;
                return (
                  <div key={item.label} className="border-b border-border/50 py-1">
                    <button
                      type="button"
                      onClick={() => setExpanded(openSection ? null : item.label)}
                      className={cn(
                        "flex min-h-[48px] w-full items-center justify-between rounded-xl px-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-golden/10 hover:text-royal-purple",
                        isActive(item.href) && "bg-golden/10 text-royal-purple"
                      )}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          openSection && "rotate-180"
                        )}
                      />
                    </button>
                    {openSection ? (
                      <div className="mb-2 ml-3 flex flex-col border-l-2 border-golden/30 pl-2">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="flex min-h-[40px] items-center rounded-lg px-3 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
                        >
                          All Consultations
                        </Link>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex min-h-[40px] items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground",
                              isActive(child.href) && "bg-golden/10 font-semibold text-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-[48px] items-center rounded-xl px-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-golden/10 hover:text-royal-purple",
                    isActive(item.href) && "bg-golden/10 text-royal-purple"
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
          <SocialIconRow
              links={socials}
              size="sm"
              variant="ink"
              className="justify-center"
            />
        </div>
      </SheetContent>
    </Sheet>
  );
}
