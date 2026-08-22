import { prisma } from "@/lib/prisma";
import { siteConfig } from "@/config/site";
import { ContactSettingsForm } from "@/components/admin/settings/contact-settings-form";
import type { ContactFormValues } from "@/components/admin/settings/contact-settings-form";

export const dynamic = "force-dynamic";

export default async function ContactSettingsPage() {
  let values: ContactFormValues = {
    whatsappNumber: `+${siteConfig.contact.whatsappNumber.replace(/^\+/, "")}`,
    whatsappDisplay: siteConfig.contact.whatsappDisplay,
    callNumber: siteConfig.contact.callNumber,
    callDisplay: siteConfig.contact.callDisplay,
    bookingLabel: siteConfig.contact.bookingLabel,
    email: siteConfig.contact.email,
    address: siteConfig.chamber.address,
    landmark: siteConfig.chamber.landmark,
    businessHours: "Mon - Sat: 10:00 AM - 8:00 PM | Sun: By Appointment",
    consultationFee: siteConfig.consultation.astrologyFee,
    upiId: siteConfig.contact.upiId,
  };
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "contact" },
    });
    const v =
      row?.value && typeof row.value === "object"
        ? (row.value as Record<string, unknown>)
        : {};
    const s = (x: unknown, fb: string) =>
      typeof x === "string" && x ? x : fb;
    const n = (x: unknown, fb: number) =>
      typeof x === "number" && Number.isFinite(x) ? x : fb;
    values = {
      whatsappNumber: s(v.whatsappNumber, values.whatsappNumber),
      whatsappDisplay: s(v.whatsappDisplay, values.whatsappDisplay),
      callNumber: s(v.callNumber, values.callNumber),
      callDisplay: s(v.callDisplay, values.callDisplay),
      bookingLabel: s(v.bookingLabel, values.bookingLabel),
      email: s(v.email, values.email),
      address: s(v.address, values.address),
      landmark: s(v.landmark, values.landmark),
      businessHours: s(v.businessHours, values.businessHours),
      consultationFee: n(v.consultationFee, values.consultationFee),
      upiId: s(v.upiId, values.upiId),
    };
  } catch {
    // DB unreachable - use design defaults.
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Contact Settings</h1>
        <p className="text-sm text-muted-foreground">
          WhatsApp, call numbers, email, chamber details and business hours —
          reflected in the top header, footer and hero CTAs.
        </p>
      </div>
      <ContactSettingsForm initial={values} />
    </div>
  );
}
