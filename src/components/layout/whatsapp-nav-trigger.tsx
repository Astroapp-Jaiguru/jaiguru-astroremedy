"use client";

import { useState, type ReactNode } from "react";
import { ServiceNavModal } from "@/components/layout/service-nav-modal";

/**
 * Generic WhatsApp CTA wrapper — turns any WhatsApp button into a trigger
 * for the navigation dialog (Book a Consultation / Course / Product /
 * Talk to Executive). Rendering is delegated to the caller via children.
 */
export function WhatsappNavTrigger({
  whatsappNumber,
  className,
  ariaLabel,
  children,
}: {
  whatsappNumber: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => setOpen(true)}
        className={className}
      >
        {children}
      </button>
      <ServiceNavModal
        open={open}
        onOpenChange={setOpen}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}