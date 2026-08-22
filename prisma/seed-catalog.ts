import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Phase 5 - Bulk catalogue seed.
 * Seeds a full 550-product catalogue (scope §4.6):
 *   Spiritual Items: 180 | Gemstones: 180 | Vastu Items: 120 | Yoga Equipment: 70
 * Deterministic (seeded PRNG) and idempotent (unique slugs + skipDuplicates).
 * The 13 curated Phase-4 products (incl. 12 featured) are untouched.
 */

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const TARGETS: Record<string, number> = {
  "spiritual-items": 180,
  gemstones: 180,
  "vastu-items": 120,
  "yoga-equipment": 70,
};

function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IMG: Record<string, [string, string]> = {
  "spiritual-items": ["1E1B4B", "FACC15"],
  gemstones: ["312E81", "E0C3FC"],
  "vastu-items": ["4C1D95", "FACC15"],
  "yoga-equipment": ["0F766E", "ECFDF5"],
};

function placehold(catSlug: string, text: string): string {
  const [bg, fg] = IMG[catSlug];
  return `https://placehold.co/600x400/${bg}/${fg}/png?text=${encodeURIComponent(text.slice(0, 34))}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

interface Draft {
  name: string;
  subcategory: string;
  price: number;
  description: string;
  benefits: string[];
  tags: string[];
  material?: string;
  size?: string;
  weight?: string;
  color?: string;
}

/** Compose a family: base names x option labels. */
function combine(
  bases: { name: string; price: number }[],
  opts: string[],
  subcategory: string,
  description: (base: string, opt: string) => string,
  benefits: string[],
  tags: string[]
): Draft[] {
  const out: Draft[] = [];
  for (const base of bases)
    for (const opt of opts)
      out.push({
        name: `${base.name} (${opt})`,
        subcategory,
        price: base.price,
        description: description(base.name, opt),
        benefits,
        tags,
        material: opt,
      });
  return out;
}

// ---------------------------------------------------------------------------
// SPIRITUAL ITEMS - 180
// ---------------------------------------------------------------------------
function spiritualDrafts(): Draft[] {
  const d: Draft[] = [];

  // 1. Yantras: 8 x 3 = 24
  d.push(
    ...combine(
      [
        { name: "Sri Yantra", price: 699 },
        { name: "Lakshmi Yantra", price: 699 },
        { name: "Kuber Yantra", price: 699 },
        { name: "Shree Vidya Yantra", price: 749 },
        { name: "Vastu Yantra", price: 699 },
        { name: "Ganesh Yantra", price: 649 },
        { name: "Navgraha Yantra", price: 899 },
        { name: "Sade Sati Yantra", price: 799 },
      ],
      ["Copper", "Silver", "Panchadhatu"],
      "Yantras",
      (b, o) => `Purified ${o} engraved ${b} for wealth, protection and positive energy at home.`,
      ["Energised", "Engraved", "Pooja ready"],
      ["yantra", "plate"]
    )
  );

  // 2. Murtis: 8 x 4 = 32
  d.push(
    ...combine(
      [
        { name: "Ganapati Idol", price: 1499 },
        { name: "Lakshmi Ganesh Idol", price: 1799 },
        { name: "Hanuman Idol", price: 1499 },
        { name: "Durga Maa Idol", price: 1899 },
        { name: "Shiv Parivar Idol", price: 1999 },
        { name: "Kali Maa Idol", price: 1899 },
        { name: "Kuber Idol", price: 1699 },
        { name: "Radha Krishna Idol", price: 1999 },
      ],
      ["Panchadhatu", "Brass", "Silver Plated", "Marble"],
      "Murtis & Idols",
      (b, o) => `Divine ${b} in premium ${o} for the home temple and sustained positivity.`,
      ["Handcrafted", "Auspicious", "Gift ready"],
      ["murti", "idol"]
    )
  );

  // 3. Rudraksha: 9 bead counts x 2 = 18
  for (const beads of [1, 3, 5, 7, 9, 11, 12, 14])
    for (const type of ["Rudraksha Mala", "Rudraksha Bracelet"])
      d.push({
        name: `${beads} Mukhi ${type}`,
        subcategory: "Rudraksha",
        price: 799,
        description: `Authentic energised ${beads} mukhi rudraksha ${type} recommended for planetary remedies.`,
        benefits: ["Original beads", "Energy charged", "Certificate pouch"],
        tags: ["rudraksha", `${beads} mukhi`],
      });

  // 4. Puja kits: 12
  const kits = [
    "Navgraha Puja Kit", "Satyanarayan Puja Kit", "Grihapravesh Kit", "Bhumi Pujan Kit",
    "Mundan Ceremony Kit", "Rudrabhishek Kit", "Lakshmi Puja Kit", "Home Satsang Kit",
    "Annaprashana Kit", "Shanti Swastik Kit", "Ganesh Puja Kit", "Varalakshmi Kit",
  ];
  for (const k of kits)
    d.push({
      name: k,
      subcategory: "Puja Kits",
      price: 899,
      description: `Complete ${k} with all ritual items, easy step guide and checklist.`,
      benefits: ["Complete", "Guide included", "Ready to use"],
      tags: ["puja", "kit"],
    });

  // 5. Incense: 8 x 3 = 24
  d.push(
    ...combine(
      [
        { name: "Sandal Incense Sticks", price: 199 },
        { name: "Rose Incense Sticks", price: 199 },
        { name: "Dhoop Batti", price: 149 },
        { name: "Sambrani Cups", price: 179 },
        { name: "Gugul Resin", price: 249 },
        { name: "Loban Powder", price: 229 },
        { name: "Aarti Batti", price: 129 },
        { name: "Natural Camphor", price: 99 },
      ],
      ["60 gm Pack", "120 gm Pack", "250 gm Pack"],
      "Incense & Fragrance",
      (b, o) => `Premium ${b} in ${o} - calming aroma for pooja and meditation.`,
      ["Natural", "Long lasting", "Hand rolled"],
      ["incense", "fragrance"]
    )
  );

  // 6. Kavach & Raksha: 6 x 3 = 18
  d.push(
    ...combine(
      [
        { name: "Hanuman Kavach", price: 499 },
        { name: "Mantra Kavach", price: 549 },
        { name: "Rudraksha Kavach", price: 599 },
        { name: "Black Thread Raksha", price: 299 },
        { name: "Navratna Kavach", price: 799 },
        { name: "Kalash Raksha Sutra", price: 399 },
      ],
      ["", "Silver Plated", "Gold Plated"],
      "Kavach & Raksha",
      (b, o) =>
        o
          ? `${b} (${o}) - recommended protection against negative energy.`
          : `${b} - recommended protection against negative energy.`,
      ["Energised", "Durable", "Gift box"],
      ["kavach", "protection"]
    )
  );

  // 7. Diya & Lamps: 6 x 3 = 18
  d.push(
    ...combine(
      [
        { name: "Akhand Diya", price: 299 },
        { name: "Cow Ghee Diya", price: 249 },
        { name: "Brass Lamp", price: 399 },
        { name: "Copper Deepam", price: 449 },
        { name: "Glass Aarti Diya", price: 199 },
        { name: "Mythical Diya Set", price: 349 },
      ],
      ["Small", "Medium", "Large"],
      "Diya & Lamps",
      (b, o) => `${b} in ${o} size for ghee and oil lamps at home and the mandir corner.`,
      ["Premium", "Durable", "Warm glow"],
      ["diya", "lamp"]
    )
  );

  // 8. Puja Essentials: 6 x 3 = 18
  d.push(
    ...combine(
      [
        { name: "Aarti Thali", price: 399 },
        { name: "Pooja Kalash", price: 349 },
        { name: "Chandan Powder Set", price: 249 },
        { name: "Hanuman Chalisa (Pocket)", price: 149 },
        { name: "Shrimad Bhagwat Geeta", price: 299 },
        { name: "Pancharati Set", price: 449 },
      ],
      ["Brass", "Copper", "Silver"],
      "Puja Essentials",
      (b, o) => `Traditional ${b} crafted in ${o}, made for daily offerings and satsang.`,
      ["Premium", "Shine finish", "Long lasting"],
      ["puja"]
    )
  );

  // 9. Extras to reach 180: 16
  const extras: Draft[] = [
    { name: "Sacred Cloth Vastra Set", subcategory: "Sacred Items", price: 249, description: "Clean choti vastras for puja and idols.", benefits: ["Soft", "Multi pack"], tags: ["vastras"] },
    { name: "Gomati Chakra (100 pc)", subcategory: "Sacred Items", price: 299, description: "Auspicious Gomati chakras for wealth rituals.", benefits: ["Natural", "Genuine"], tags: ["gomati"] },
    { name: "Cowrie Shell Set", subcategory: "Sacred Items", price: 149, description: "Cowrie shells kauri for pooja and japa.", benefits: ["Natural", "Polished"], tags: ["kauri"] },
    { name: "Havan Samagri (500 gm)", subcategory: "Havan & Yagya", price: 499, description: "Pure havan samagri with ghee, herbs and camphor.", benefits: ["Pure herbs", "Ready"], tags: ["havan"] },
    { name: "Fresh Kumkum & Red Cloth", subcategory: "Sacred Items", price: 99, description: "Red kumkum powder and vastra for rituals.", benefits: ["Fresh", "Ritual ready"], tags: ["kumkum"] },
    { name: "Wooden Sri Yantra Carving", subcategory: "Yantras", price: 449, description: "Hand-engraved wooden Sri Yantra for meditation corners.", benefits: ["Handcrafted", "Eco friendly"], tags: ["yantra"] },
    { name: "Shivling Abhishek Set", subcategory: "Puja Kits", price: 799, description: "Narmadeshwar shivling with abhishek ingredients.", benefits: ["Complete", "Sacred"], tags: ["shivling"] },
    { name: "Navgraha Bead Necklace", subcategory: "Sacred Jewellery", price: 1299, description: "Nine planet beads for daily wear and remedies.", benefits: ["Energised", "9 stones"], tags: ["navgraha"] },
    { name: "Sphatik Mala (108)", subcategory: "Malas", price: 699, description: "Crystal sphatik japa mala for meditation.", benefits: ["Crystal", "108 beads"], tags: ["sphatik"] },
    { name: "Tulsi Japa Mala", subcategory: "Malas", price: 249, description: "Sacred tulsi mala for bhajan and japa.", benefits: ["Natural tulsi", "108 beads"], tags: ["tulsi"] },
    { name: "Sandalwood Japa Mala", subcategory: "Malas", price: 549, description: "Sandalwood mala with cool, calming fragrance.", benefits: ["Sandal", "108 beads"], tags: ["sandalwood"] },
    { name: "Rudraksha Pendant Set", subcategory: "Sacred Jewellery", price: 999, description: "Silver rudraksha pendant with 5 mukhi bead.", benefits: ["Silver", "Energised"], tags: ["rudraksha"] },
    { name: "Durga Yantra Copper", subcategory: "Yantras", price: 649, description: "Copper Durga yantra for fearlessness and protection.", benefits: ["Energised"], tags: ["yantra"] },
    { name: "Kuber Lakshmi Combo", subcategory: "Yantras", price: 1199, description: "Kuber and Lakshmi yantras together for prosperity.", benefits: ["Wealth remedy"], tags: ["yantra"] },
    { name: "Akshat Rice Pack (1 kg)", subcategory: "Sacred Items", price: 149, description: "Yellow haldi akshat rice for pooja offerings.", benefits: ["Fresh", "1 kg"], tags: ["akshat"] },
    { name: "Bell Ghanti (Pooja)", subcategory: "Sacred Items", price: 499, description: "Resonant brass ghanti for aarti and puja.", benefits: ["Deep sound", "Brass"], tags: ["ghanti"] },
    { name: "Om Symbol Wall Plaque", subcategory: "Sacred Items", price: 549, description: "Panchadhatu Om plaque for the prayer wall.", benefits: ["Premium", "Wall mount"], tags: ["om"] },
    { name: "Panchmukhi Hanuman Yantra", subcategory: "Yantras", price: 749, description: "Five-faced Hanuman yantra for courage and protection.", benefits: ["Energised"], tags: ["yantra", "hanuman"] },
  ];
  d.push(...extras);

  return d;
}

// ---------------------------------------------------------------------------
// GEMSTONES - 18 stones x 10 forms = 180
// ---------------------------------------------------------------------------
interface Stone {
  name: string;
  hindi: string;
  pricePerCt: number;
  color: string;
}

const STONES: Stone[] = [
  { name: "Ruby", hindi: "Manik", pricePerCt: 6000, color: "red" },
  { name: "Blue Sapphire", hindi: "Neelam", pricePerCt: 5200, color: "blue" },
  { name: "Emerald", hindi: "Panna", pricePerCt: 4200, color: "green" },
  { name: "Yellow Sapphire", hindi: "Pukhraj", pricePerCt: 3600, color: "yellow" },
  { name: "Red Coral", hindi: "Moonga", pricePerCt: 1800, color: "coral" },
  { name: "Natural Pearl", hindi: "Moti", pricePerCt: 900, color: "pearl" },
  { name: "Gomed", hindi: "Gomed", pricePerCt: 1200, color: "brown" },
  { name: "Cat's Eye", hindi: "Lehsunia", pricePerCt: 2100, color: "green" },
  { name: "Diamond", hindi: "Heera", pricePerCt: 28000, color: "white" },
  { name: "Amethyst", hindi: "Jamunia", pricePerCt: 3200, color: "purple" },
  { name: "Citrine", hindi: "Sounla", pricePerCt: 1400, color: "yellow" },
  { name: "Blue Topaz", hindi: "Moline", pricePerCt: 1500, color: "blue" },
  { name: "Garnet", hindi: "Varon", pricePerCt: 800, color: "red" },
  { name: "Aquamarine", hindi: "Beriz", pricePerCt: 7500, color: "aqua" },
  { name: "White Opal", hindi: "Dudhiya", pricePerCt: 2500, color: "white" },
  { name: "Turquoise", hindi: "Feroza", pricePerCt: 2200, color: "blue" },
  { name: "Jade", hindi: "Jade", pricePerCt: 1100, color: "green" },
  { name: "Moonstone", hindi: "Moon", pricePerCt: 950, color: "silver" },
];

const GEM_FORMS: { label: string; f: number; size?: string; weight?: string }[] = [
  { label: "Loose Stone (0.5 Ct)", f: 0.5, weight: "0.5 Ct" },
  { label: "Loose Stone (1 Ct)", f: 1, weight: "1 Ct" },
  { label: "Loose Stone (2 Ct)", f: 2, weight: "2 Ct" },
  { label: "Loose Stone (3 Ct)", f: 3, weight: "3 Ct" },
  { label: "Loose Stone (5 Ct)", f: 5, weight: "5 Ct" },
  { label: "Solitaire Ring (1.5 Ct)", f: 1.5, size: "Ring Size 18" },
  { label: "Bead Mala (27 Beads)", f: 0.9, size: "27 Beads" },
  { label: "Bead Mala (108 Beads)", f: 1.6, size: "108 Beads" },
  { label: "Gold Plated Pendant (1 Ct)", f: 1.1, size: "Pendant" },
  { label: "Bracelet Charm (0.8 Ct)", f: 0.8, size: "Bracelet" },
];

function gemstoneDrafts(): Draft[] {
  const d: Draft[] = [];
  for (const stone of STONES)
    for (const form of GEM_FORMS) {
      const price = Math.max(299, Math.round(stone.pricePerCt * form.f));
      d.push({
        name: `${stone.hindi} ${form.label}`,
        subcategory: "Gemstones",
        price,
        description: `Certified ${stone.name} (${stone.hindi}) in ${form.label}. Recommended for astrological remedy after kundali guidance.`,
        benefits: ["Lab certified", "Untreated", "Astrological use"],
        tags: [stone.hindi.toLowerCase(), "gemstone"],
        material: stone.name,
        weight: form.weight,
        color: stone.color,
        size: form.size,
      });
    }
  return d;
}

// ---------------------------------------------------------------------------
// VASTU ITEMS - 40 bases x 3 materials = 120
// ---------------------------------------------------------------------------
const VASTU_BASES: { name: string; price: number }[] = [
  { name: "Vastu Pyramid", price: 599 },
  { name: "Vastu Tortoise with Baby", price: 899 },
  { name: "Vastu Conch", price: 799 },
  { name: "Vastu Kalash", price: 649 },
  { name: "Vastu Swastik", price: 349 },
  { name: "Vastu Bell", price: 549 },
  { name: "Om Symbol Plaque", price: 549 },
  { name: "Vastu Wind Chime", price: 699 },
  { name: "Vastu Elephant Pair", price: 999 },
  { name: "Vastu Ganesh Statue", price: 1299 },
  { name: "Vastu Kuber Statue", price: 1499 },
  { name: "Lakshmi Charan", price: 449 },
  { name: "Vastu Shankh", price: 849 },
  { name: "Vastu Compass", price: 1199 },
  { name: "Vastu Globe", price: 1299 },
  { name: "Vastu Kumbh", price: 749 },
  { name: "Vastu Copper Pot", price: 699 },
  { name: "Vastu Diya Deepam", price: 449 },
  { name: "Brass Deepam", price: 549 },
  { name: "Vastu Yantra Plaque", price: 649 },
  { name: "Vastu Trimurti Wall", price: 999 },
  { name: "Vastu Brighu Plaque", price: 699 },
  { name: "Vastu Flower Vase", price: 799 },
  { name: "Vastu Buddha Statue", price: 1699 },
  { name: "Vastu Turtle Sculpture", price: 849 },
  { name: "Swastik Wall Symbol", price: 399 },
  { name: "Vastu Trishul", price: 899 },
  { name: "Vastu Damru", price: 549 },
  { name: "Vastu Nandi Statue", price: 1399 },
  { name: "Vastu Ganesh Plaque", price: 749 },
  { name: "Vastu Lotus Statue", price: 849 },
  { name: "Tree of Life Plaque", price: 999 },
  { name: "Navgraha Yantra Wall", price: 899 },
  { name: "Shri Yantra Vastu Wall", price: 949 },
  { name: "Vastu Lamp Set", price: 649 },
  { name: "Akhand Diya Vastu", price: 499 },
  { name: "Vastu Hanuman Plaque", price: 799 },
  { name: "Vastu Aarti Stand", price: 599 },
  { name: "Vastu Marble Turtle", price: 1099 },
  { name: "Vastu Chakram", price: 899 },
];

function vastuDrafts(): Draft[] {
  return combine(
    VASTU_BASES,
    ["Copper", "Brass", "Gold Plated"],
    "Vastu Decor",
    (b, o) => `${b} in ${o} - placed at the right vastu direction it strengthens positive energy.`,
    ["Positive energy", "Premium polish", "Vastu remedy"],
    ["vastu", "decor"]
  );
}

// ---------------------------------------------------------------------------
// YOGA EQUIPMENT - 70
// ---------------------------------------------------------------------------
function yogaDrafts(): Draft[] {
  const d: Draft[] = [];

  // Mats: 6 x 3 = 18
  d.push(
    ...combine(
      [
        { name: "Non-Slip TPE Mat", price: 799 },
        { name: "Align Grid Mat", price: 999 },
        { name: "Travel Mat", price: 649 },
        { name: "Eco Jute Mat", price: 1099 },
        { name: "Sticky Yoga Mat", price: 699 },
        { name: "Foldable Mat", price: 899 },
      ],
      ["Standard", "Premium", "Pro"],
      "Yoga Mats",
      (b, o) => `${b} (${o}) - non-slip, cushioned surface for home practice.`,
      ["Non-slip", "Easy wash"],
      ["yoga", "mat"]
    )
  );

  // Blocks: 4
  for (const b of ["Cork Yoga Block", "Foam Yoga Block", "Wood Yoga Block", "EVA Yoga Block"])
    d.push({
      name: b,
      subcategory: "Blocks & Props",
      price: 599,
      description: `${b} for stable alignment in every asana.`,
      benefits: ["Stable", "Lightweight"],
      tags: ["block", "yoga"],
    });

  // Straps & bands: 5
  for (const s of ["Yoga Strap (2 m)", "Cotton Yoga Belt", "Resistance Band", "Ankle Strap", "Adjustable Strap"])
    d.push({
      name: s,
      subcategory: "Straps & Bands",
      price: 349,
      description: `${s} for alignment, stretch and support during practice.`,
      benefits: ["Durable", "Adjustable"],
      tags: ["strap", "yoga"],
    });

  // Meditation seating: 6
  for (const c of ["Zafu Cushion", "Meditation Seat", "Butterfly Cushion", "Floor Cushion", "Meditation Bench", "Kneeling Pad"])
    d.push({
      name: c,
      subcategory: "Meditation",
      price: 999,
      description: `${c} for comfortable, upright meditation posture.`,
      benefits: ["Posture support", "Removable cover"],
      tags: ["meditation", "cushion"],
    });

  // Sound healing: 5
  for (const b of ["Tibetan Singing Bowl (12 cm)", "Tibetan Singing Bowl (18 cm)", "Meditation Bell", "Bowl Mallet", "Singing Bowl Set"])
    d.push({
      name: b,
      subcategory: "Sound Healing",
      price: 2199,
      description: `${b} for sound healing and deep meditation.`,
      benefits: ["Hand hammered", "Rich tone"],
      tags: ["singing bowl", "healing"],
    });

  // Wellness: 6
  for (const w of ["Copper Bottle (500 ml)", "Copper Bottle (750 ml)", "Copper Flask (1 L)", "Ayurvedic Copper Jug", "Copper Cups (Set of 2)", "Copper Tumbler"])
    d.push({
      name: w,
      subcategory: "Wellness",
      price: 649,
      description: `${w} for ayurvedic copper-charged drinking water.`,
      benefits: ["Pure copper", "Leak proof"],
      tags: ["copper", "wellness"],
    });

  // Props: 8
  for (const p of ["Yoga Wheel", "Rectangular Bolster", "Yoga Knee Pad", "Mat Carrier Strap", "Mat Cleaner Spray", "Yoga Ring", "Yoga Towel", "Balance Cushion"])
    d.push({
      name: p,
      subcategory: "Props",
      price: 899,
      description: `${p} - practical accessory to deepen your home practice.`,
      benefits: ["Durable", "Practice essential"],
      tags: ["prop", "yoga"],
    });

  // Malas: 5
  for (const m of ["Rudraksha Yoga Mala", "Sandalwood Mala", "Lotus Seed Mala", "Sphatik Mala", "Tulsi Yoga Mala"])
    d.push({
      name: m,
      subcategory: "Malas",
      price: 699,
      description: `${m} (108 beads) for japa and meditation.`,
      benefits: ["108 beads", "Energised"],
      tags: ["mala", "japa"],
    });

  // Extras: 13
  const extras: Draft[] = [
    { name: "Yoga Mat Cover", subcategory: "Mats", price: 499, description: "Protective cover for storing and carrying your mat.", benefits: ["Washable"], tags: ["mat", "cover"] },
    { name: "Foam Roller", subcategory: "Props", price: 1499, description: "Foam roller for myofascial release after practice.", benefits: ["High density"], tags: ["roller"] },
    { name: "Balance Board", subcategory: "Props", price: 1899, description: "Wooden balance board to strengthen ankles and core.", benefits: ["Stable base"], tags: ["balance"] },
    { name: "Meditation Timer", subcategory: "Meditation", price: 899, description: "Digital meditation timer with gentle bells.", benefits: ["Precise", "Portable"], tags: ["timer"] },
    { name: "Neti Pot", subcategory: "Wellness", price: 399, description: "Ceramic neti pot for nasal cleansing practice.", benefits: ["Ceramic", "Easy grip"], tags: ["neti"] },
    { name: "Copper Tongue Cleaner", subcategory: "Wellness", price: 299, description: "Ayurvedic copper tongue scraper for daily routine.", benefits: ["Pure copper"], tags: ["ayurveda"] },
    { name: "Pranayama Trainer", subcategory: "Meditation", price: 749, description: "Resistance pranayama trainer for breathing practice.", benefits: ["Breath control"], tags: ["pranayama"] },
    { name: "Yoga Socks (Grip)", subcategory: "Accessories", price: 349, description: "Non-slip grip socks for warm practice floors.", benefits: ["Anti-slip"], tags: ["socks"] },
    { name: "Headstand Bench", subcategory: "Props", price: 2499, description: "Supported headstand bench for safe inversion practice.", benefits: ["Safe inversions"], tags: ["headstand"] },
    { name: "D-Ring Yoga Strap", subcategory: "Straps & Bands", price: 449, description: "D-ring strap with adjustable loops for deep stretch.", benefits: ["Adjustable"], tags: ["strap"] },
    { name: "Yoga Blocks (Pair)", subcategory: "Blocks & Props", price: 899, description: "Pair of foam blocks for seated and standing poses.", benefits: ["Pair", "Dense foam"], tags: ["block"] },
    { name: "Stretch Strap with Loops", subcategory: "Straps & Bands", price: 549, description: "Looped stretch strap for hamstring and shoulder work.", benefits: ["5 loops"], tags: ["stretch"] },
    { name: "Yoga Blanket", subcategory: "Meditation", price: 799, description: "Soft cotton blanket for savasana and meditation.", benefits: ["Cotton", "Warm"], tags: ["blanket"] },
  ];
  d.push(...extras);

  return d;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const CAT_CODE: Record<string, string> = {
  "spiritual-items": "SPI",
  gemstones: "GEM",
  "vastu-items": "VAS",
  "yoga-equipment": "YOG",
};

const GENERATORS: Record<string, () => Draft[]> = {
  "spiritual-items": spiritualDrafts,
  gemstones: gemstoneDrafts,
  "vastu-items": vastuDrafts,
  "yoga-equipment": yogaDrafts,
};

async function main() {
  console.log("Seeding JAIGURU ASTROREMEDY catalogue...");

  const categories = await prisma.productCategory.findMany({
    select: { id: true, slug: true, name: true, _count: { select: { products: true } } },
  });
  const bySlug = new Map(categories.map((c) => [c.slug, c]));

  let insertedTotal = 0;

  for (const [slug, target] of Object.entries(TARGETS)) {
    const cat = bySlug.get(slug);
    if (!cat) {
      console.warn(`  Category "${slug}" not found - skipping.`);
      continue;
    }
    const existing = cat._count.products;
    const needed = target - existing;
    if (needed <= 0) {
      console.log(`  ${cat.name}: already ${existing}/${target} - nothing to add.`);
      continue;
    }

    const rand = seededRandom(1000 + cat._count.products);
    const drafts = GENERATORS[slug]().slice(0, needed);
    if (drafts.length < needed) {
      console.warn(`  ${cat.name}: only ${drafts.length} drafts for ${needed} needed.`);
    }

    const payloads = drafts.map((dr, i) => {
      const hasDiscount = rand() < 0.4;
      const discountPrice = hasDiscount
        ? Math.round(dr.price * (0.7 + rand() * 0.25))
        : null;
      const stockRoll = rand();
      const stockStatus =
        stockRoll < 0.92 ? "IN_STOCK" : stockRoll < 0.96 ? "OUT_OF_STOCK" : "PRE_ORDER";
      return {
        name: dr.name,
        slug: `${slug}-${String(i + 1).padStart(3, "0")}-${slugify(dr.name)}`,
        categoryId: cat.id,
        subcategory: dr.subcategory,
        sku: `JG-${CAT_CODE[slug]}-${String(i + 1).padStart(3, "0")}`,
        mainImage: placehold(slug, dr.name),
        price: dr.price,
        discountPrice,
        stockStatus,
        quantity: 5 + Math.floor(rand() * 495),
        shortDescription: dr.description,
        longDescription: `${dr.description} Each piece is checked before dispatch. For personal guidance on which item suits your chart, message us on WhatsApp.`,
        benefits: dr.benefits,
        tags: dr.tags,
        material: dr.material ?? null,
        size: dr.size ?? null,
        weight: dr.weight ?? null,
        color: dr.color ?? null,
        isFeatured: false,
        isPopular: false,
        isNewArrival: false,
        isActive: true,
        rating: Math.round((4.2 + rand() * 0.8) * 100) / 100,
        ratingCount: 5 + Math.floor(rand() * 395),
        sortOrder: 0,
      };
    });

    const result = await prisma.product.createMany({
      data: payloads as never,
      skipDuplicates: true,
    });
    insertedTotal += result.count;
    console.log(`  ${cat.name}: inserted ${result.count} (target ${target})`);
  }

  const final = await prisma.product.groupBy({
    by: ["categoryId"],
    _count: true,
  });
  const totals = categories.map((c) => ({
    name: c.name,
    count: final.find((f) => f.categoryId === c.id)?._count ?? 0,
  }));
  console.log("FINAL COUNTS:", JSON.stringify(totals));
  console.log(`Inserted this run: ${insertedTotal}`);
  const total = totals.reduce((s, t) => s + t.count, 0);
  const expected = Object.values(TARGETS).reduce((s, n) => s + n, 0);
  if (total !== expected) {
    console.error(`MISMATCH: expected ${expected} products total, found ${total}.`);
    process.exit(1);
  }
  console.log(`COMPLETE Catalogue ready: ${total} products (featured preserved).`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
