"use client";

import { useActionState } from "react";
import { Loader2, Send, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WhatsAppButton } from "@/components/layout/cta-buttons";
import { whatsappLink } from "@/config/site";
import { submitContactMessageAction } from "@/lib/contact/actions";

/**
 * Public contact / enquiry form (scope §19).
 * Saves to ContactMessage; on success shows a thank-you panel with a
 * WhatsApp follow-up shortcut.
 */
export function ContactForm({
  serviceOptions,
  whatsappNumber,
}: {
  serviceOptions: string[];
  whatsappNumber: string;
}) {
  const [state, formAction, pending] = useActionState(
    submitContactMessageAction,
    undefined
  );

  const followUpLink = whatsappLink(
    [
      "Hello JAIGURU ASTROREMEDY,",
      "",
      "I just submitted the contact form on your website.",
      "Please get back to me at the earliest.",
    ].join("\n"),
    whatsappNumber
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.success ? (
        <div className="glass-card rounded-3xl p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-[#4ADE80]" />
          <h3 className="mt-4 font-display text-2xl font-bold text-white">
            Thank You!
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Your message has been received. Our team will get back to you
            shortly. For a faster response, you can also message us directly on
            WhatsApp.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <WhatsAppButton href={followUpLink} label="Chat on WhatsApp" />
            <a
              href="/contact"
              className="text-sm font-medium text-[#FACC15] underline-offset-4 hover:underline"
            >
              Send another message
            </a>
          </div>
        </div>
      ) : (
        <>
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--jaiguru-contact-label-color)]">Your Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Ramesh Agarwal"
                className="border-[#D4AF37]/30 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[var(--jaiguru-contact-label-color)]">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                className="border-[#D4AF37]/30 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="text-[var(--jaiguru-contact-label-color)]">WhatsApp Number (optional)</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                placeholder="+91 98765 43210"
                className="border-[#D4AF37]/30 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceInterest" className="text-[var(--jaiguru-contact-label-color)]">Service Interested In</Label>
              <select
                id="serviceInterest"
                name="serviceInterest"
                defaultValue=""
                className="flex h-10 w-full rounded-lg border border-[#D4AF37]/30 bg-[#0F172A] px-3 text-sm text-white outline-none transition-colors focus-visible:border-[#FACC15] disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#0F172A]"
              >
                <option value="">General Enquiry</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferredDate" className="text-[var(--jaiguru-contact-label-color)]">Preferred Date</Label>
              <Input
                id="preferredDate"
                name="preferredDate"
                type="date"
                className="border-[#D4AF37]/30 bg-white/5 text-white [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredTime" className="text-[var(--jaiguru-contact-label-color)]">Preferred Time</Label>
              <Input
                id="preferredTime"
                name="preferredTime"
                type="time"
                className="border-[#D4AF37]/30 bg-white/5 text-white [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-[var(--jaiguru-contact-label-color)]">Your Message</Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              placeholder="Tell us about your concern or query..."
              className="border-[#D4AF37]/30 bg-white/5 text-white placeholder:text-slate-500"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="btn-glow-gold w-full bg-gold-gradient font-semibold text-cosmic-black hover:opacity-90 sm:w-auto sm:min-w-[220px]"
          >
            {pending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {pending ? "Sending..." : "Send Message"}
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-[#FACC15]" />
            We usually respond within a few hours during business hours.
          </p>
        </>
      )}
    </form>
  );
}
