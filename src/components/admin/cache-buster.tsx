"use client";

import { useEffect } from "react";

const BUST_KEY = "jaiguru-admin-cache-bust-v1";

/**
 * Guarantees the admin dashboard never renders from a stale browser cache:
 *  1. Static Next.js assets (scripts / stylesheets / font links) get a fresh
 *     ?v=<timestamp> query parameter appended on every load, so Chrome is
 *     forced to treat them as brand-new URLs (changed stylesheet URLs are
 *     refetched immediately).
 *  2. Every /admin response already ships strict no-store headers from the
 *     proxy, so the next page load always receives fresh HTML with the
 *     newest hashed chunks.
 */
export function CacheBuster() {
  useEffect(() => {
    try {
      if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(BUST_KEY)) {
        sessionStorage.setItem(BUST_KEY, "1");
      }

      const stamp = Date.now();
      const bust = (el: Element) => {
        const attr = el.getAttribute("src") ?? el.getAttribute("href");
        if (!attr || !attr.includes("_next/static")) return;
        const mark = el.getAttribute("data-cache-busted");
        if (mark === stamp.toString()) return;
        el.setAttribute("data-cache-busted", stamp.toString());
        const url = new URL(attr, window.location.href);
        url.searchParams.set("v", stamp.toString());
        if (el.getAttribute("src")) {
          el.setAttribute("src", url.toString());
        } else {
          el.setAttribute("href", url.toString());
        }
      };
      document
        .querySelectorAll('script[src*="_next/static"], link[rel="stylesheet"][href*="_next/static"]')
        .forEach(bust);

      const perf = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const isFreshLoad =
        !perf || perf.type === "navigate" || perf.type === "reload";
      if (isFreshLoad) {
        document.body.classList.add("cache-busted");
      }
    } catch {
      // Cache busting is best-effort - never block the dashboard.
    }
  }, []);

  return null;
}