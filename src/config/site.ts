/**
 * JAIGURU ASTROREMEDY - Central site configuration.
 * Values used across public pages and admin. Contact/branding values
 * are also editable from the admin dashboard (SiteSetting model).
 */

export const siteConfig = {
  name: "JAIGURU ASTROREMEDY",
  tagline: "Vedic Astrology, Vastu, Numerology, Yoga & Spiritual Remedies",
  astrologer: {
    name: "Arup Shastri (Jai Guru)",
    title: "Vedic Astrologer",
    subtitle: "A Spiritual Master, True Healer",
    expertise: ["Vedic Astrology", "Vastu", "Numerology", "Yoga"],
    specialties: [
      "Astrology",
      "Medical Astrology",
      "Mental Peace",
      "Vastu",
      "Spiritual Remedies",
      "Black Magic Protection Guidance",
      "Gemstone Guidance",
    ],
  },
  business: {
    legalOwnerName: "ARUP KAR",
    astrologerDisplayName: "Astrologer Arup Shastri",
    businessName: "ASTRO GEMS",
    registrationBody: "Kolkata Municipal Corporation",
    websiteName: "jaiguruastroremedy.com",
    foundedLine:
      "Astrologer Arup Shastri is the founder of ASTRO GEMS, a registered enterprise located in Kolkata and registered under the Kolkata Municipal Corporation.",
    copyrightLine:
      "© 2026 Astrologer Arup Shastri. All rights reserved. Website owned and operated by ASTRO GEMS.",
    ownedByLine: "jaiguruastroremedy.com is owned and operated by ASTRO GEMS.",
    registeredLine:
      "ASTRO GEMS is a registered enterprise under the Kolkata Municipal Corporation.",
  },
  contact: {
    whatsappNumber: "919874886574",
    whatsappDisplay: "+91 98748 86574",
    callNumber: "+91 98361 25780",
    callDisplay: "+91 98361 25780",
    bookingLabel: "Booking / Query",
    email: "",
  },
  chamber: {
    address: "51/A, Jatindra Mohan Avenue, Kolkata - 700005",
    landmark: "Sovabazar Metro Crossing",
    googleMapsQuery: "51/A Jatindra Mohan Avenue Kolkata 700005",
    mapsLink:
      "https://www.google.com/maps/search/?api=1&query=51%2FA+Jatindra+Mohan+Avenue+Kolkata+700005",
    embedUrl: "",
  },
  consultation: {
    astrologyFee: 700,
    numerologyFee: 700,
    vastuFee: 700,
    currency: "₹",
  },
  social: {
    facebook: "",
    youtube: "",
    instagram: "",
    twitter: "",
    whatsapp: "",
  },
  links: {
    googleReview: "",
  },
  defaultSeo: {
    title: "JAIGURU ASTROREMEDY | Best Astrologer in Kolkata - Arup Shastri (Jai Guru)",
    description:
      "Best astrologer in Kolkata. Vedic Astrology, Vastu, Numerology, Yoga & Spiritual Remedies by Vedic Astrologer Arup Shastri (Jai Guru). Book consultation at ₹700. Chamber at Sovabazar Metro Crossing.",
    keywords:
      "best astrologer in Kolkata, astrologer near Sovabazar, vastu consultant Kolkata, numerology consultation Kolkata, gemstones in Kolkata, spiritual remedy Kolkata, yoga home service Kolkata, astrology course Kolkata, medical astrology Kolkata",
  },
  disclaimers: {
    general:
      "Astrology, numerology, vastu, yoga and spiritual guidance are provided for personal, spiritual and informational purposes only. They are not a substitute for professional medical, psychological, legal, financial or emergency advice. For medical or mental health issues, users should consult qualified licensed professionals.",
  },
} as const;

export const WA_BASE = (number: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}`;

export function whatsappLink(message: string, number?: string): string {
  const target = (number ?? siteConfig.contact.whatsappNumber).replace(/\D/g, "");
  return `${WA_BASE(target)}?text=${encodeURIComponent(message)}`;
}

export const telLink = (number: string) => `tel:${number.replace(/\s/g, "")}`;

/** Default product order message (scope section 17). */
export function productOrderMessage(product: {
  name: string;
  category?: string | null;
  price?: string | number;
  url: string;
}): string {
  return [
    "Hello JAIGURU ASTROREMEDY,",
    "",
    "I want to order this product:",
    "",
    `Product Name: ${product.name}`,
    `Category: ${product.category ?? "-"}`,
    `Price: ₹${product.price ?? "-"}`,
    `Product Link: ${product.url}`,
    "",
    "Please confirm availability.",
    "",
    "Payment Option:",
    "I can pay through PhonePe/UPI.",
    "UPI ID: [To be updated later]",
    "",
    "My Name:",
    "My Address:",
  ].join("\n");
}

/** Default service booking message (scope section 17). */
export function serviceBookingMessage(service: {
  name: string;
  mode: string;
  price?: string | number;
  url: string;
}): string {
  return [
    "Hello JAIGURU ASTROREMEDY,",
    "",
    "I want to book this service:",
    "",
    `Service Name: ${service.name}`,
    `Mode: ${service.mode}`,
    `Price: ₹${service.price ?? "-"}`,
    `Service Link: ${service.url}`,
    "",
    "Please confirm available timing.",
    "",
    "Payment Option:",
    "I can pay through PhonePe/UPI.",
    "UPI ID: [To be updated later]",
    "",
    "My Name:",
    "Preferred Date:",
    "Preferred Time:",
  ].join("\n");
}

/** Consultation enquiry message. */
export function consultationMessage(serviceName: string): string {
  return [
    "Hello JAIGURU ASTROREMEDY,",
    "",
    `I want to book a ${serviceName} consultation (₹700).`,
    "",
    "My Name:",
    "My Date of Birth:",
    "My Place of Birth:",
    "Preferred Date & Time:",
  ].join("\n");
}
