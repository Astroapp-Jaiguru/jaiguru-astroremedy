"use client";

import { useEffect } from "react";

const PURGE_KEY = "jaiguru-admin-cache-purged-v2";

/**
 * Aggressive cache busting for the admin dashboard. Runs on every full page
 * load and guarantees the browser always fetches fresh files:
 *
 *  1. Every Next.js static script / stylesheet URL gets a unique
 *     ?v=<timestamp> query parameter appended, forcing the browser to treat
 *     each file as a brand-new URL (stylesheets are refetched immediately;
 *     already-executed module scripts ignore the src change but the cache
 *     purge below re-downloads them anyway).
 *  2. One-time (per browser session): wipes every Cache Storage entry and
 *     unregisters any service worker, then performs a forced reload so the
 *     next page load re-downloads the entire dashboard from the server.
 *  3. /admin responses additionally ship strict no-store headers, so the
 *     reloaded HTML is always the newest version.
 */
export function CacheBuster() {
  useEffect(() => {
    try {
      const stamp = Date.now();

      // 1. Bust all static asset URLs with ?v=<timestamp>.
      document
        .querySelectorAll(
          'link[rel="stylesheet"][href*="_next/static"], script[src*="_next/static"]'
        )
        .forEach((el) => {
          const attr = el.hasAttribute("src") ? "src" : "href";
          const url = el.getAttribute(attr);
          if (!url || url.includes("v=")) return;
          try {
            const parsed = new URL(url, window.location.href);
            parsed.searchParams.set("v", stamp.toString());
            el.setAttribute(attr, parsed.toString());
          } catch {
            // Ignore unparseable URLs.
          }
        });

      // 2. One-time: purge browser/SW caches, then force a fresh reload.
      if (!sessionStorage.getItem(PURGE_KEY)) {
        sessionStorage.setItem(PURGE_KEY, "1");
        let finished = false;
        const reload = () => {
          if (finished) return;
          finished = true;
          window.location.reload();
        };
        const purge = (async () => {
          try {
            if ("caches" in window) {
              const keys = await window.caches.keys();
              await Promise.all(keys.map((key) => window.caches.delete(key)));
            }
            if ("serviceWorker" in navigator) {
              const registrations =
                await navigator.serviceWorker.getRegistrations();
              await Promise.all(
                registrations.map((registration) => registration.unregister())
              );
            }
          } finally {
            reload();
          }
        })();
        // Safety net in case cache clearing hangs.
        setTimeout(reload, 2500);
        void purge;
      }
    } catch {
      // Cache busting is best-effort - never block the dashboard.
    }
  }, []);

  return null;
}
