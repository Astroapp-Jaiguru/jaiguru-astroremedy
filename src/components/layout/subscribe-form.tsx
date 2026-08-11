"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Mail } from "lucide-react";
import { subscribeAction } from "@/lib/subscribe/actions";

/**
 * Footer newsletter form (email only). Records into the Subscriber model;
 * admins manage the list under Admin → Audience → Subscribers.
 */
export function SubscribeForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, undefined);
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.ok && !handledRef.current) {
      handledRef.current = true;
      toast.success("Subscribed! You'll receive updates from Jai Guru.");
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="source" value="footer" />
      <label
        htmlFor="subscribe-email"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-golden"
      >
        <Mail className="h-3.5 w-3.5" />
        Receive Spiritual Updates
      </label>
      <div className="mt-2.5 flex gap-2">
        <input
          id="subscribe-email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full min-w-0 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/45 focus:border-golden/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-[#111827] shadow-[0_8px_24px_rgba(250,204,21,0.3)] transition hover:brightness-110 disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </form>
  );
}