import {
  Star,
  Hash,
  Compass,
  Stethoscope,
  Sparkles,
  Gem,
  Activity,
  Shield,
  HeartHandshake,
  type LucideIcon,
} from "lucide-react";

/**
 * Canonical consultation topic data (scope §7.5).
 * Stored in the `ConsultationTopic` table (admin-editable) with the fallback
 * rows below used only when the database is empty. `iconKey` values map to
 * Lucide icons through TOPIC_ICONS.
 */
export interface ConsultationTopicRow {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  iconKey: string;
  fee: string;
  homeFee: string;
  durationMinutes: number;
  keywords: string[];
  benefits: string[];
}

export const TOPIC_ICONS: Record<string, LucideIcon> = {
  star: Star,
  hash: Hash,
  compass: Compass,
  stethoscope: Stethoscope,
  sparkles: Sparkles,
  gem: Gem,
  activity: Activity,
  shield: Shield,
  "heart-handshake": HeartHandshake,
};

export const DEFAULT_CONSULTATION_TOPICS: ConsultationTopicRow[] = [
  {
    slug: "astrology",
    title: "Astrology Consultation",
    description:
      "Complete birth chart reading with personalised predictions for career, health, marriage and finance.",
    longDescription:
      "A deep, personalised reading of your complete birth chart — planets, houses and dashas — mapped against the transits of today. Receive clear, honest predictions for career, health, marriage, finance and children, along with the exact remedies that will dissolve obstacles in your path.",
    iconKey: "star",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["gemstone", "rudraksha", "kundli", "mala", "yantra"],
    benefits: [
      "Full birth chart (kundli) reading",
      "Career, health, marriage & finance predictions",
      "Personalised dasha and transit analysis",
      "Practical remedies for current obstacles",
    ],
  },
  {
    slug: "numerology",
    title: "Numerology Consultation",
    description:
      "Name, number and date-of-birth analysis to unlock luck, and correct remedies for a harmonious life.",
    longDescription:
      "Your numbers shape your destiny. We analyse your date of birth and full name to find your core, expression, destiny and lucky numbers — then recommend the simplest corrections (name changes, lucky numbers, favourable days) that align your life with harmony and abundance.",
    iconKey: "hash",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["gemstone", "mala", "yantra", "ring"],
    benefits: [
      "Core, expression & destiny number analysis",
      "Lucky numbers, colours and days for you",
      "Name vibration correction if needed",
      "Gemstone & number remedies that truly work",
    ],
  },
  {
    slug: "vastu",
    title: "Vastu Consultation",
    description:
      "In-depth vastu analysis for home, office or business with practical corrective remedies.",
    longDescription:
      "A room-by-room vastu audit of your home, office or shop. We identify energy blockages in each direction, then give simple, practical corrections — placements, colours, remedies and rituals — that restore balance, prosperity and peace without expensive construction changes.",
    iconKey: "compass",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["yantra", "idol", "vastu", "crystal"],
    benefits: [
      "Direction-wise energy audit of every room",
      "Simple fixes — no costly demolition needed",
      "Colour, placement and remedy guidance",
      "Ideal for home, office and business premises",
    ],
  },
  {
    slug: "medical-astrology",
    title: "Medical Astrology Guidance",
    description:
      "Health insights from your birth chart and natural remedies to improve wellbeing and balance.",
    longDescription:
      "Astrology's oldest branch reads the health of your body directly from your chart. Understand which planets govern your constitution, spot weak areas early, and receive natural, holistic remedies — diet, gemstones, mantras and daily practices — that strengthen your wellbeing.",
    iconKey: "stethoscope",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["gemstone", "mala", "rudraksha", "health"],
    benefits: [
      "Planetary health map from your chart",
      "Early detection of weak bodily areas",
      "Natural diet, gemstone & mantra remedies",
      "Supportive care — not a substitute for doctors",
    ],
  },
  {
    slug: "spiritual-remedies",
    title: "Spiritual Remedy Guidance",
    description:
      "Personalised mantra, ritual and spiritual remedies to dissolve obstacles and negative energy.",
    longDescription:
      "When nothing else explains your repeated failures, delays or unrest, spiritual causes may be at play. Receive a personalised remedy plan — mantras, japas, rituals, donations and pujas — precisely matched to your chart, to clear obstacles and restore confidence and flow.",
    iconKey: "sparkles",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["mala", "rudraksha", "yantra", "incense"],
    benefits: [
      "Personalised mantra & japa plan",
      "Ritual and puja guidance for your chart",
      "Remedies for obstacles, delays & negativity",
      "Clear step-by-step sadhana instructions",
    ],
  },
  {
    slug: "gemstone",
    title: "Gemstone Recommendation",
    description:
      "Right gemstone, quality and timing recommendation based on your exact kundali birth chart.",
    longDescription:
      "A wrong gemstone can hurt more than help. Using your exact birth chart we determine which planet needs strengthening, then recommend the precise gemstone, quality, carat weight, metal and wearing day — so you get the maximum benefit from every rupee you invest.",
    iconKey: "gem",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["gemstone", "ring", "rudraksha", "crystal"],
    benefits: [
      "Chart-based gemstone selection only",
      "Quality, carat and metal guidance",
      "Correct wearing day & finger for you",
      "Avoids harmful or unnecessary gemstones",
    ],
  },
  {
    slug: "yoga",
    title: "Yoga Guidance",
    description:
      "Personalised asanas, pranayama and meditation routines for health, peace and focus.",
    longDescription:
      "Your body responds to specific practices. Based on your constitution, age and goals, we design a simple daily routine of asanas, pranayama and meditation — along with energised products to support your sadhana — for health, peace of mind and sharper focus.",
    iconKey: "activity",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["yoga", "mala", "mat", "meditation"],
    benefits: [
      "Routine designed for YOUR constitution",
      "Simple asanas, pranayama & meditation",
      "Progress checkpoints and adjustments",
      "Supports health, peace and focus",
    ],
  },
  {
    slug: "black-magic-protection",
    title: "Black Magic Protection Guidance",
    description:
      "Detection of negative energies and traditional protective remedies for safety and peace of mind.",
    longDescription:
      "If you feel unexplained illness, endless misfortune, family discord or strange dreams, negative energy may be involved. We detect the presence and source of negative influence and apply traditional protective remedies — kavach mantras, yantras and rituals — to seal your home and your family.",
    iconKey: "shield",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["yantra", "rudraksha", "kavach", "incense"],
    benefits: [
      "Detection of negative energy or influence",
      "Traditional kavach & yantra protection",
      "Home sealing rituals & remedies",
      "Restores peace, sleep and family harmony",
    ],
  },
  {
    slug: "personal-problem",
    title: "Personal Problem Guidance",
    description:
      "Support for love, family, business and emotional problems with honest astrological direction.",
    longDescription:
      "Love, marriage, family, business and emotional struggles deserve honest answers. We study your chart to understand the root of the problem, tell you plainly what is possible and what is not, and give you a clear, actionable path — remedies, timings and decisions — to move forward with confidence.",
    iconKey: "heart-handshake",
    fee: "₹700",
    homeFee: "₹1,500",
    durationMinutes: 30,
    keywords: ["gemstone", "mala", "yantra", "rudraksha"],
    benefits: [
      "Honest root-cause reading of your problem",
      "Love, marriage, family & business guidance",
      "Clear timing of favourable periods",
      "Personalised remedy plan to move forward",
    ],
  },
];
