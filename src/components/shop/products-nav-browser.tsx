"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, LayoutGrid } from "lucide-react";
import type { NavMenuItem } from "@/lib/product-navigation";
import { cn } from "@/lib/utils";

/**
 * In-page multi-level product navigation browser for the /products catalogue.
 * Desktop: hovering a category pill opens a cascading menu — every submenu
 * appears instantly to the right of the hovered row (or below / to the left
 * when near the viewport edge). Panels are fixed-positioned so submenus are
 * NEVER clipped or hidden behind a scrollbar — no horizontal dragging needed.
 * Very tall leaf lists scroll vertically only, capped to the viewport.
 * Mobile: a collapsible accordion tree.
 */

const PANEL_WIDTH = 256;
const ROW_H = 36;
const GAP = 8;

interface Panel {
  items: NavMenuItem[];
  left: number;
  top: number;
  footer?: { href: string; label: string };
}

function estimateHeight(items: NavMenuItem[], withFooter: boolean): number {
  return Math.min(items.length * ROW_H + 16 + (withFooter ? 45 : 0), window.innerHeight * 0.7);
}

/** Place a panel to the right of (x,y), flipping below/left near the edges. */
function fitPanel(x: number, y: number, w: number, h: number): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = x + w + GAP > vw ? Math.max(GAP, x - w - GAP) : x + GAP;
  const top = Math.min(Math.max(y, GAP), Math.max(GAP, vh - h - GAP));
  return { left, top };
}

function AccordionTree({
  items,
  depth,
  onNavigate,
}: {
  items: NavMenuItem[];
  depth: number;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className={cn("flex flex-col", depth > 0 && "ml-3 border-l-2 border-golden/30 pl-2")}>
      {items.map((item) => {
        const hasKids = item.children.length > 0;
        const isOpen = open === item.slug;
        return (
          <div key={item.slug}>
            {hasKids ? (
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.slug)}
                className="flex min-h-[40px] w-full items-center justify-between rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground"
              >
                {item.name}
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className="flex min-h-[40px] items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-golden/10 hover:text-foreground"
              >
                {item.name}
              </Link>
            )}
            {hasKids && isOpen ? (
              <AccordionTree items={item.children} depth={depth + 1} onNavigate={onNavigate} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ProductsNavBrowser({ items }: { items: NavMenuItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeAll = useCallback(() => setPanels([]), []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(closeAll, 250);
  }, [closeAll]);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  // Close the menu on page scroll or viewport resize so positions stay correct.
  useEffect(() => {
    const close = () => closeAll();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [closeAll]);

  /** Open the first-level panel below the hovered category pill. */
  const openRoot = (item: NavMenuItem, pillEl: HTMLElement) => {
    if (item.children.length === 0) return;
    const rect = pillEl.getBoundingClientRect();
    const h = estimateHeight(item.children, true);
    const top = Math.min(Math.max(rect.bottom + GAP, GAP), Math.max(GAP, window.innerHeight - h - GAP));
    const left = Math.max(GAP, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - GAP));
    setPanels([
      {
        items: item.children,
        left,
        top,
        footer: { href: item.href, label: `All ${item.name} →` },
      },
    ]);
  };

  /** Hovering a row opens its submenu to the right; leaves truncate deeper panels. */
  const openRow = (depth: number, child: NavMenuItem, rowEl: HTMLElement) => {
    if (child.children.length === 0) {
      setPanels((p) => p.slice(0, depth + 1));
      return;
    }
    const rect = rowEl.getBoundingClientRect();
    const h = estimateHeight(child.children, false);
    const pos = fitPanel(rect.right, rect.top, PANEL_WIDTH, h);
    setPanels((p) => {
      const next = p.slice(0, depth + 1);
      next.push({ items: child.children, left: pos.left, top: pos.top });
      return next;
    });
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Desktop: category pills + cascading fixed-position panels */}
      <div
        className="relative hidden md:block"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#FACC15]/70">
            <LayoutGrid className="h-3.5 w-3.5" />
            Browse
          </span>
          {items.map((item) => (
            <div
              key={item.slug}
              onMouseEnter={(e) => openRoot(item, e.currentTarget)}
            >
              <Link
                href={item.href}
                onClick={closeAll}
                className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#0B1120]/60 px-4 py-2 text-sm font-semibold text-[#FACC15] shadow-[0_4px_16px_rgba(0,0,0,0.25)] transition hover:border-[#FACC15]/70 hover:bg-[#FACC15]/10"
              >
                {item.name}
                {item.children.length > 0 ? <ChevronDown className="h-3.5 w-3.5" /> : null}
              </Link>
            </div>
          ))}
        </div>

        {panels.map((panel, depth) => (
          <div
            key={depth}
            className="fixed z-50"
            style={{ left: panel.left, top: panel.top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <div className="max-h-[70vh] w-64 overflow-y-auto rounded-2xl border border-golden/25 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.2)]">
              {panel.items.map((child) => (
                <div
                  key={child.slug}
                  onMouseEnter={(e) => openRow(depth, child, e.currentTarget)}
                >
                  <Link
                    href={child.href}
                    onClick={closeAll}
                    className="flex h-9 items-center justify-between gap-2 rounded-xl px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-golden/10 hover:text-slate-900"
                  >
                    {child.name}
                    {child.children.length > 0 ? (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#B8860B]" />
                    ) : null}
                  </Link>
                </div>
              ))}
              {panel.footer ? (
                <div className="mt-1 border-t border-golden/25 pt-1">
                  <Link
                    href={panel.footer.href}
                    onClick={closeAll}
                    className="block h-9 rounded-xl px-3 py-1.5 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
                  >
                    {panel.footer.label}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: collapsible accordion */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-[#0B1120]/60 px-4 py-3 text-sm font-semibold text-[#FACC15] transition hover:bg-[#FACC15]/10"
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Browse by Category
          </span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", mobileOpen && "rotate-180")} />
        </button>
        {mobileOpen ? (
          <div className="mt-2 rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-xl">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[40px] items-center rounded-lg px-3 text-sm font-bold text-[#B8860B] transition-colors hover:bg-golden/10 hover:text-[#9A6B00]"
            >
              Browse All Products →
            </Link>
            <AccordionTree items={items} depth={0} onNavigate={() => setMobileOpen(false)} />
          </div>
        ) : null}
      </div>
    </div>
  );
}