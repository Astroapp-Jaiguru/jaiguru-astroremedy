"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAIN_NAV_ITEMS, type NavItem } from "@/components/layout/nav-items";

export type { NavItem };

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
        "relative pb-2 text-[15px] font-semibold text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-golden after:transition-all after:duration-300 hover:text-royal-purple hover:after:w-full",
        isActive && "text-royal-purple after:w-full"
      )}
    >
      {item.label}
    </Link>
  );
}

export function NavMenu({
  className,
  consultationTopics,
}: {
  className?: string;
  consultationTopics?: { label: string; href: string }[];
}) {
  const pathname = usePathname();
  const navItems = MAIN_NAV_ITEMS.map((item) =>
    item.label === "Consultations" && consultationTopics?.length
      ? { ...item, children: consultationTopics }
      : item
  );

  return (
    <nav className={cn("hidden items-center gap-7 xl:flex", className)}>
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(item.href + "/");

        if (item.children) {
          return (
            <div key={item.label} className="group relative">
              <button
                type="button"
                className="flex cursor-pointer items-center gap-1 pb-2 text-[15px] font-semibold text-foreground transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-golden after:transition-all after:duration-300 hover:text-royal-purple group-hover:after:w-full"
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
                          "block rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground",
                          childActive && "bg-golden/10 font-semibold text-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                  <div className="mt-1 border-t border-golden/25 pt-1">
                    <Link
                      href={item.href}
                      className="block rounded-xl px-4 py-2.5 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
                    >
                      All {item.label} →
                    </Link>
                  </div>
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
