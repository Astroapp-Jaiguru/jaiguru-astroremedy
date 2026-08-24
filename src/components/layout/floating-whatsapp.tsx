"use client";

import { useState } from "react";
import { WhatsappIcon } from "@/components/layout/social-icons";
import { ServiceNavModal } from "@/components/layout/service-nav-modal";

/** Desktop floating WhatsApp button (bottom-right stack). */
export function FloatingWhatsappRound({ whatsappNumber }: { whatsappNumber: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="WhatsApp"
        onClick={() => setOpen(true)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-[0_12px_35px_rgba(37,211,102,0.4)] transition-transform hover:scale-105"
      >
        <WhatsappIcon className="h-7 w-7" />
      </button>
      <ServiceNavModal open={open} onOpenChange={setOpen} whatsappNumber={whatsappNumber} />
    </>
  );
}

/** Mobile bottom-bar WhatsApp cell. */
export function FloatingWhatsappBar({ whatsappNumber }: { whatsappNumber: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 bg-whatsapp text-[15px] font-semibold text-white"
      >
        <WhatsappIcon className="h-5 w-5" />
        WhatsApp
      </button>
      <ServiceNavModal open={open} onOpenChange={setOpen} whatsappNumber={whatsappNumber} />
    </>
  );
}