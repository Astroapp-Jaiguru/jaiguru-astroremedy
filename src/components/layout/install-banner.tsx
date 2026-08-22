"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "jaiguru-install-dismissed";

/**
 * PWA install banner. Shown on the homepage only, once the browser fires
 * beforeinstallprompt and the user has not dismissed it before.
 * Positioned bottom-left on desktop (floating CTAs live bottom-right) and
 * above the mobile sticky call bar.
 */
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.location.pathname !== "/") return;
    if (localStorage.getItem(DISMISS_KEY)) {
      setDismissed(true);
      return;
    }
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone
    ) {
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      localStorage.setItem(DISMISS_KEY, "1");
    };
    const onDismiss = () => {
      setDismissed(true);
      localStorage.setItem(DISMISS_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (dismissed || !promptEvent) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:bottom-6 md:left-6 md:right-auto md:w-[340px]">
      <div className="rounded-2xl border border-premium-gold/40 bg-deep-navy/95 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-premium-gold/50 bg-golden/10">
            <Download className="h-5 w-5 text-golden" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Install Jaiguru Astroremedy</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-300/80">
              Add to your home screen for one-tap access to consultations,
              courses and products.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              localStorage.setItem(DISMISS_KEY, "1");
            }}
            aria-label="Dismiss install prompt"
            className="shrink-0 rounded-full p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => promptEvent?.prompt()}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FACC15] to-[#F97316] px-4 py-2.5 text-sm font-bold text-slate-900 shadow-[0_8px_25px_rgba(250,204,21,0.35)] transition hover:brightness-105"
          >
            <Download className="h-4 w-4" />
            Install App
          </button>
        </div>
      </div>
    </div>
  );
}