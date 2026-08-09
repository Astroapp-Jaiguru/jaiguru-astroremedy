"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Consultations",
    href: "/consultations",
    children: [
      { label: "Astrology Consultation", href: "/consultations/astrology" },
      { label: "Numerology Consultation", href: "/consultations/numerology" },
      { label: "Vastu Consultation", href: "/consultations/vastu" },
      { label: "Medical Astrology Guidance", href: "/consultations/medical-astrology" },
      { label: "Spiritual Remedy Guidance", href: "/consultations/spiritual-remedies" },
      { label: "Gemstone Recommendation", href: "/consultations/gemstone" },
      { label: "Yoga Guidance", href: "/consultations/yoga" },
      { label: "Black Magic Protection Guidance", href: "/consultations/black-magic-protection" },
      { label: "Personal Problem Guidance", href: "/consultations/personal-problem" },
    ],
  },
  { label: "Products", href: "/products" },
  { label: "Services", href: "/services" },
  {
    label: "Gallery",
    href: "/photo-gallery",
    children: [
      { label: "Photo Gallery", href: "/photo-gallery" },
      { label: "Video Gallery", href: "/video-gallery" },
      { label: "YouTube Gallery", href: "/youtube-gallery" },
    ],
  },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

function NavLink({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "relative pb-2 text-[15px] font-semibold text-dark-text transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-golden after:transition-all after:duration-300 hover:text-royal-purple hover:after:w-full",
        isActive && "text-royal-purple after:w-full"
      )}
    >
      {item.label}
    </Link>
  );
}

export function NavMenu({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("hidden items-center gap-7 xl:flex", className)}>
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        if (item.children) {
          return (
            <div key={item.label} className="group relative">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 pb-2 text-[15px] font-semibold text-dark-text transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-golden after:transition-all after:duration-300 hover:text-royal-purple group-hover:after:w-full"
              >
                {item.label}
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="w-72 rounded-2xl border border-golden/25 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">
                  {item.children.map((child) => {
                    const childActive =
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-text transition-colors hover:bg-golden/10 hover:text-royal-purple",
                          childActive && "bg-golden/10 text-royal-purple"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        }

        return <NavLink key={item.label} item={item} isActive={isActive} />;
      })}
    </nav>
  );
}