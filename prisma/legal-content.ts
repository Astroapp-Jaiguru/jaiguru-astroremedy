/**
 * Authoritative legal page content for JAIGURO ASTROREMEDY (Phase 7).
 * Shared by the seed (fresh installs) and apply-legal-content.ts (existing DBs).
 */

export interface LegalContentPage {
  slug: string;
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
}

export const BUSINESS = {
  websiteName: "jaiguruastroremedy.com",
  businessName: "ASTRO GEMS",
  legalOwner: "ARUP KAR",
  astrologer: "Astrologer Arup Shastri (Jai Guru)",
  registrationBody: "Kolkata Municipal Corporation",
  whatsapp: "+91 98748 86574",
  call: "+91 98361 25780",
  address: "51/A, Jatindra Mohan Avenue, Kolkata - 700005",
  landmark: "Sovabazar Metro Crossing",
  businessHours: "Monday - Saturday: 10:00 AM - 8:00 PM | Sunday: By Appointment",
};

export const NO_REFUND_CLAUSE =
  "No money will be refunded once paid by users, unless we are unable to provide the products or services after payment has been made.";

const GENERAL_DISCLAIMER =
  "Astrology, numerology, vastu, yoga and spiritual guidance are provided for personal, spiritual and informational purposes only. They are not a substitute for professional medical, psychological, legal, financial or emergency advice. For medical or mental health issues, users should consult qualified licensed professionals.";

export const LEGAL_PAGES: LegalContentPage[] = [
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    seoTitle: "Privacy Policy | JAIGURU ASTROREMEDY",
    seoDescription:
      "Privacy Policy of ASTRO GEMS (jaiguruastroremedy.com) — how JAIGURU ASTROREMEDY collects, uses and protects your personal information.",
    sortOrder: 1,
    content: `# Privacy Policy

## 1. Introduction
This Privacy Policy explains how ${BUSINESS.businessName} ("we", "us", "our"), the owner and operator of ${BUSINESS.websiteName}, collects, uses, stores and protects your personal information when you use our website, contact us on WhatsApp, place an order or book a consultation.

By using this website, you agree to the collection and use of information in accordance with this Privacy Policy.

## 2. Information We Collect
We collect only the information you choose to share with us, including:
- **Contact details**: name, phone number, email address and WhatsApp number.
- **Enquiry details**: messages sent through the contact form or WhatsApp, including your date, place and time of birth (for horoscope analysis) and any other details you share for your consultation.
- **Order details**: products/services you order, delivery address and payment confirmation details.
- **Technical data**: basic, non-personal information such as browser type, device type and pages visited, collected through standard website analytics.

We never ask for, and never store, your bank account passwords, card numbers or UPI PINs. Payment details are never saved on our servers.

## 3. How We Use Your Information
We use your information for the following purposes:
- To respond to your enquiries, queries and feedback.
- To process product orders and service bookings.
- To schedule and provide consultations (online or at the chamber).
- To provide delivery and after-sales support.
- To improve our website, products and services.
- To send you order/service-related updates on WhatsApp or phone.

We do **not** sell, rent or trade your personal information to any third party.

## 4. Data Sharing
We do not share your personal information with third parties, except:
- Where it is necessary to complete a delivery (shipping partner receives only name, phone and address).
- Where we are legally required to do so by a court, government authority or applicable law.

## 5. Data Security
We take reasonable and appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure or destruction. Information shared over WhatsApp is protected by WhatsApp's end-to-end encryption.

## 6. Data Retention
We retain your information only for as long as necessary to provide our services, comply with legal obligations and resolve disputes. After that, your data is deleted or anonymised.

## 7. Your Rights
You may, at any time:
- Request a copy of the personal information we hold about you.
- Request correction of inaccurate information.
- Request deletion of your personal information.
- Withdraw consent for future communications.

To exercise any of these rights, contact us on WhatsApp at ${BUSINESS.whatsapp} or call ${BUSINESS.call}.

## 8. Children's Privacy
Our services are not directed to children under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us personal information, please contact us and we will delete it.

## 9. Third-Party Links
Our website may contain links to third-party websites (such as WhatsApp, YouTube, Google Maps or payment apps). We are not responsible for the privacy practices of those websites. We encourage you to review their privacy policies.

## 10. Changes to This Policy
We may update this Privacy Policy from time to time. The latest version will always be published on this page with the date of revision. Continued use of the website after changes means you accept the updated policy.

## 11. Contact Us
If you have any questions about this Privacy Policy, contact us:
- WhatsApp: ${BUSINESS.whatsapp}
- Call: ${BUSINESS.call}
- Chamber: ${BUSINESS.address} (${BUSINESS.landmark})

_Last updated: January 2026._`,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms and Conditions",
    seoTitle: "Terms and Conditions | JAIGURU ASTROREMEDY",
    seoDescription:
      "Terms and Conditions of ASTRO GEMS (jaiguruastroremedy.com) for using products and services of Astrologer Arup Shastri (Jai Guru).",
    sortOrder: 2,
    content: `# Terms and Conditions

## 1. Acceptance of Terms
By accessing ${BUSINESS.websiteName} (the "Website"), placing an order, booking a consultation or contacting us, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Website or our services.

## 2. About Us
${BUSINESS.websiteName} is owned and operated by ${BUSINESS.businessName}, a registered enterprise under the ${BUSINESS.registrationBody}, owned by ${BUSINESS.legalOwner}. ${BUSINESS.astrologer} is the founder of ${BUSINESS.businessName}.

## 3. Nature of Services
Astrology, numerology, vastu, yoga and spiritual guidance are provided for personal, spiritual and informational purposes only. ${GENERAL_DISCLAIMER}

Results of astrological, numerological or vastu guidance vary from person to person. We do not guarantee specific outcomes, predictions or results.

## 4. Consultations and Bookings
- Consultations are available at the chamber (${BUSINESS.address}, ${BUSINESS.landmark}) and online (WhatsApp/phone/video) for clients worldwide.
- Bookings are confirmed only after payment or advance confirmation on WhatsApp.
- Please arrive on time for chamber visits. Online consultations are given at the confirmed time.
- Consultation fees are as displayed on the Website or as communicated at the time of booking.

## 5. Orders and Payments
- All product orders are confirmed only after payment confirmation.
- Prices displayed on the Website are in Indian Rupees (₹) unless stated otherwise.
- Payment once made is governed by our Cancellation and Refund Policy and Payment Policy, both available on this Website.

## 6. User Responsibilities
You agree to:
- Provide accurate and complete information while placing orders or booking consultations.
- Use the Website and our services for lawful purposes only.
- Not misuse, copy or redistribute the content of this Website, including horoscope analyses, remedy notes or course materials, without written permission.

## 7. Intellectual Property
All content on this Website, including text, graphics, logos, images, horoscope analyses and remedy materials, is the property of ${BUSINESS.businessName} and is protected under applicable copyright and trademark laws. Reproduction without permission is prohibited.

## 8. Limitation of Liability
To the maximum extent permitted by law, ${BUSINESS.businessName}, its owner ${BUSINESS.legalOwner} and ${BUSINESS.astrologer} shall not be liable for any direct, indirect, incidental, special or consequential damages arising out of your use of the Website, products or services, including reliance on astrological guidance.

## 9. Governing Law
These Terms and Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Kolkata, West Bengal.

## 10. Changes to These Terms
We reserve the right to update these Terms and Conditions at any time. The latest version will always be published on this page. Continued use of the Website after changes constitutes acceptance of the updated terms.

## 11. Contact Us
For any questions regarding these Terms and Conditions, contact us on WhatsApp at ${BUSINESS.whatsapp} or call ${BUSINESS.call}.

_Last updated: January 2026._`,
  },
  {
    slug: "cancellation-refund-policy",
    title: "Cancellation and Refund Policy",
    seoTitle: "Cancellation and Refund Policy | JAIGURU ASTROREMEDY",
    seoDescription:
      "Cancellation and Refund Policy of ASTRO GEMS (jaiguruastroremedy.com) for consultations and products.",
    sortOrder: 3,
    content: `# Cancellation and Refund Policy

## 1. No-Refund Policy (Strict Clause)
${NO_REFUND_CLAUSE}

## 2. Explanation of the No-Refund Policy
Once payment has been made by a user for any product or service, the payment is final and non-refundable. The only exception is a situation where we are unable to provide the product or the service after payment has been made — in that specific case, the amount will be refunded in full.

## 3. Scope
This policy applies to:
- All consultations (astrology, numerology, vastu, yoga and spiritual remedies).
- All products (gemstones, rudraksha, yantras, spiritual items, yoga equipment, etc.).
- All courses and guidance sessions.

## 4. Product Orders
- Orders are confirmed only after payment confirmation.
- Once an order is confirmed and processed, the payment is non-refundable as per the No-Refund Policy above.
- If, after payment, we are unable to deliver the product (for example, the item is out of stock and cannot be sourced), the full amount will be refunded.

## 5. Consultations
- Consultation fees are non-refundable once paid, as per the No-Refund Policy above.
- If we are unable to conduct a booked consultation (for example, due to unavailability of the astrologer), the full amount will be refunded, or the session will be rescheduled as per your preference.

## 6. Gemstones and Natural Products
- Gemstones are natural products. Colour, weight and clarity may vary slightly from photographs. Certificates (where applicable) ensure authenticity.
- Gemstone purchases are non-refundable after confirmation and dispatch, as per the No-Refund Policy above.

## 7. How Refunds Are Processed
- When a refund is applicable under the exception in this policy, it is processed within 7 working days to the original payment source (UPI, PhonePe, bank transfer).
- Refund eligibility is determined solely as described in this policy.

## 8. Contact
For any questions regarding cancellations or refunds, contact us on WhatsApp at ${BUSINESS.whatsapp} or call ${BUSINESS.call}.

_Last updated: January 2026._`,
  },
  {
    slug: "shipping-delivery-policy",
    title: "Shipping and Delivery Policy",
    seoTitle: "Shipping and Delivery Policy | JAIGURU ASTROREMEDY",
    seoDescription:
      "Shipping and Delivery Policy of ASTRO GEMS (jaiguruastroremedy.com) — delivery areas, timelines and charges.",
    sortOrder: 4,
    content: `# Shipping and Delivery Policy

## 1. Delivery Areas
We deliver products across India. Kolkata local delivery, as well as self-pickup from the chamber (${BUSINESS.address}, ${BUSINESS.landmark}), are available.

## 2. Delivery Time
- **Kolkata:** 1 - 3 working days.
- **Rest of India:** 3 - 7 working days.
- **Certified gemstones and special items:** may take additional time depending on sourcing and certification.

Delivery times are estimates and may vary due to courier company schedules, remote locations or unforeseen circumstances.

## 3. Shipping Charges
- Shipping charges are communicated and confirmed at the time of order confirmation on WhatsApp.
- No hidden charges are added after confirmation.

## 4. Order Processing
- Orders are processed only after payment confirmation.
- An unboxing video or photograph is recommended when receiving products.

## 5. Damaged or Defective Products
If a product arrives damaged or defective:
- Please report within 48 hours of delivery on WhatsApp with the unboxing video/photo.
- Verification will be done by us, and subject to the Cancellation and Refund Policy, a replacement or refund will be offered.

## 6. Tracking
Once the product is dispatched, the courier tracking details (where available) will be shared on WhatsApp.

## 7. Contact
For any questions regarding shipping and delivery, contact us on WhatsApp at ${BUSINESS.whatsapp} or call ${BUSINESS.call}.

_Last updated: January 2026._`,
  },
  {
    slug: "payment-policy",
    title: "Payment Policy",
    seoTitle: "Payment Policy | JAIGURU ASTROREMEDY",
    seoDescription:
      "Payment Policy of ASTRO GEMS (jaiguruastroremedy.com) — accepted payment methods for products and services.",
    sortOrder: 5,
    content: `# Payment Policy

## 1. Accepted Payment Methods
We accept the following payment methods:
- **PhonePe / UPI** (recommended) — UPI ID is shared on WhatsApp at the time of order or booking.
- **Bank transfer** — account details are shared on request on WhatsApp.
- **Cash at chamber** — for walk-in customers at the chamber in Kolkata only.

All payments for online orders, online consultations and course fees are to be made by PhonePe/UPI or bank transfer as per the details shared on WhatsApp.

## 2. Payment Confirmation
- Orders and bookings are confirmed **only after** payment confirmation.
- Please send the payment screenshot/confirmation on WhatsApp immediately after payment so that your order or booking can be processed.
- Without confirmed payment, orders and bookings cannot be processed.

## 3. Consultation Fees
- Astrology Consultation: ₹700
- Numerology Consultation: ₹700
- Vastu Consultation: ₹700
- Yoga and spiritual remedy sessions: as communicated at the time of booking.
- Course fees: as communicated for the relevant batch.

## 4. Product Prices
Product prices are displayed on the Website in Indian Rupees (₹). Final payable amount (including shipping) is confirmed on WhatsApp before dispatch.

## 5. Payment Security
- We never ask for your card number, CVV, PIN, OTP or bank passwords.
- Do not share your UPI PIN or OTP with anyone, including any person claiming to represent us.
- Payments are made directly through your own PhonePe/UPI or bank app; we do not use third-party payment gateways.
- Payment details are never stored on our servers.

## 6. Non-Refundable Payments
Once payment is made, it is subject to our Cancellation and Refund Policy. ${NO_REFUND_CLAUSE}

## 7. Contact
For any questions regarding payments, contact us on WhatsApp at ${BUSINESS.whatsapp} or call ${BUSINESS.call}.

_Last updated: January 2026._`,
  },
  {
    slug: "disclaimer",
    title: "Disclaimer",
    seoTitle: "Disclaimer | JAIGURU ASTROREMEDY",
    seoDescription:
      "Disclaimer of ASTRO GEMS (jaiguruastroremedy.com) — astrology, medical, mental health, investment and gemstone disclaimers.",
    sortOrder: 6,
    content: `# Disclaimer

## 1. General Disclaimer
${GENERAL_DISCLAIMER}

## 2. Astrology, Numerology, Vastu and Spiritual Guidance
All readings, predictions, remedies and guidance offered by ${BUSINESS.astrologer} are provided for personal, spiritual and informational purposes only. Astrological influences are based on ancient Vedic traditions and are not scientifically proven facts. Results vary from person to person, and no specific outcome is guaranteed.

## 3. Medical Disclaimer
**Medical astrology** is for understanding astrological influences only. It does not diagnose, treat or cure any medical condition. For any health issue, always consult a qualified, licensed medical professional.

## 4. Mental Health Disclaimer
For mental health concerns, depression, anxiety or any psychological condition, please consult a licensed mental health professional. Spiritual guidance is not a substitute for professional therapy or medical treatment.

## 5. Financial, Investment and Legal Disclaimer
Astrological guidance should never be the sole basis for financial, investment, business or legal decisions. Please consult qualified financial advisors, accountants or legal professionals for such matters.

## 6. Gemstone Disclaimer
Gemstone recommendations are guidance based on astrological analysis. The suitability and effect of gemstones vary from person to person. Purchase decisions and verification (certification, grading) remain entirely with the customer. We do not guarantee the astrological outcome of any gemstone.

## 7. Products Disclaimer
Products sold by ${BUSINESS.businessName} are spiritual, decorative and wellness items. They are not medical devices and do not treat or cure any illness. Energisation of items is based on spiritual practices and does not constitute a scientific claim.

## 8. No Guarantee of Outcomes
Neither ${BUSINESS.businessName}, its owner ${BUSINESS.legalOwner}, nor ${BUSINESS.astrologer} guarantees any specific result, outcome, prediction or change in the life, health, wealth, career or relationships of any user.

## 9. Limitation of Liability
To the maximum extent permitted by law, ${BUSINESS.businessName}, its owner and ${BUSINESS.astrologer} shall not be liable for any loss, damage, disappointment or consequence arising from the use of the Website, our guidance, products or services.

## 10. External Links
Links to external websites (WhatsApp, YouTube, Google Maps, etc.) are provided for convenience. We are not responsible for the content, policies or practices of external websites.

## 11. Acceptance
By using this Website, its products or services, you acknowledge that you have read and understood this Disclaimer and accept it in full.

## 12. Contact
If you have any questions about this Disclaimer, contact us on WhatsApp at ${BUSINESS.whatsapp} or call ${BUSINESS.call}.

_Last updated: January 2026._`,
  },
  {
    slug: "contact-policy",
    title: "Contact Policy",
    seoTitle: "Contact Policy | JAIGURU ASTROREMEDY",
    seoDescription:
      "Contact Policy of ASTRO GEMS (jaiguruastroremedy.com) — contact channels, response times and business hours.",
    sortOrder: 7,
    content: `# Contact Policy

## 1. Contact Channels
You can reach us through the following channels:
- **WhatsApp:** ${BUSINESS.whatsapp}
- **Call:** ${BUSINESS.call}
- **Chamber:** ${BUSINESS.address} (${BUSINESS.landmark})

## 2. Business Hours
${BUSINESS.businessHours}

## 3. Response Time
- **WhatsApp messages:** We usually respond within 2 - 4 hours during business hours. In busy periods, responses may take up to 12 hours.
- **Calls:** Best answered during business hours. If a call is missed, we return it at the earliest, usually the same day.
- **Messages received outside business hours:** Responded to the next business day.
- **Email:** We do not currently use email for enquiries; please use WhatsApp or phone for the fastest response.

## 4. Booking Queries
For booking consultations, ordering products or joining courses, message us on WhatsApp with your name and requirement. You will receive the details of the next available slot and payment instructions.

## 5. Emergency Disclaimer
This is **not** an emergency service. In case of any medical, mental health or personal emergency, immediately contact the appropriate emergency services or a qualified professional.

## 6. Privacy of Contact Information
Your contact details and messages are kept confidential as described in our Privacy Policy and are never shared with third parties.

## 7. Contact Policy Updates
We may update this Contact Policy from time to time. The latest version will always be published on this page.

_Last updated: January 2026._`,
  },
];
