import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { LEGAL_PAGES } from "./legal-content";

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
});

const SEED_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin@jaiguruastroremedy.com";
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "JaiGuru@2025";

async function main() {
  console.log("Seeding JAIGURU ASTROREMEDY database...");

  // -------------------------------------------------------------------------
  // 1. Admin user
  // -------------------------------------------------------------------------
  const existingAdmin = await prisma.user.findUnique({
    where: { email: SEED_ADMIN_EMAIL },
  });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
    await prisma.user.create({
      data: {
        name: "Arup Shastri",
        email: SEED_ADMIN_EMAIL,
        phone: "+91 98361 25780",
        passwordHash,
        role: "ADMIN",
      },
    });
    console.log(`OK Admin user created: ${SEED_ADMIN_EMAIL}`);
  } else {
    console.log(`INFO  Admin user already exists: ${SEED_ADMIN_EMAIL}`);
  }

  await prisma.marketplaceSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
  console.log("OK Marketplace settings initialized");

  // -------------------------------------------------------------------------
  // 2. Product categories (scope §8)
  // -------------------------------------------------------------------------
  const productCategories = [
    {
      name: "Spiritual Items",
      slug: "spiritual-items",
      description:
        "Rudraksha malas, puja items, yantras, kavach, spiritual bracelets, incense, copper items and energized remedy items.",
      icon: "Om",
      sortOrder: 1,
    },
    {
      name: "Gemstones",
      slug: "gemstones",
      description:
        "Amethyst, Citrine, Pearl, Coral, Ruby, Emerald, Yellow Sapphire, Blue Sapphire, Hessonite, Cat's Eye and semi-precious stones.",
      icon: "Gem",
      sortOrder: 2,
    },
    {
      name: "Vastu Items",
      slug: "vastu-items",
      description:
        "Vastu pyramids, vastu yantras, tortoise, copper swastik, evil eye, vastu mirrors and directional remedies.",
      icon: "Compass",
      sortOrder: 3,
    },
    {
      name: "Yoga Equipment",
      slug: "yoga-equipment",
      description:
        "Yoga mats, yoga belts, yoga blocks, meditation cushions, copper bottles, yoga wheels, bolsters and acupressure items.",
      icon: "Dumbbell",
      sortOrder: 4,
    },
  ];
  const productCategoryRecords: Record<string, { id: string }> = {};
  for (const cat of productCategories) {
    const record = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, sortOrder: cat.sortOrder },
      create: cat,
    });
    productCategoryRecords[cat.slug] = { id: record.id };
  }
  console.log(`OK Product categories: ${productCategories.length}`);

  // -------------------------------------------------------------------------
  // 2b. Featured products (12 samples for the homepage - 3 per category)
  // -------------------------------------------------------------------------
  const featuredProducts = [
    {
      name: "Rudraksha Japa Mala (15 Mukhi)",
      slug: "rudraksha-japa-mala-15-mukhi",
      categoryId: productCategoryRecords["spiritual-items"].id,
      subcategory: "Malas",
      price: 1499,
      discountPrice: 1199,
      shortDescription:
        "Authentic energised 15 mukhi rudraksha mala for prosperity and self-confidence.",
      benefits: ["Energy-charged", "Original beads", "With certificate pouch"],
      tags: ["rudraksha", "mala"],
      isFeatured: true,
      isPopular: true,
      rating: 4.8,
      ratingCount: 245,
      sortOrder: 1,
    },
    {
      name: "Sri Yantra Copper Plate",
      slug: "sri-yantra-copper-plate",
      categoryId: productCategoryRecords["spiritual-items"].id,
      subcategory: "Yantra",
      price: 799,
      discountPrice: 649,
      shortDescription:
        "Drawn Sri Yantra on pure copper plate for wealth, harmony and positivity at home.",
      benefits: ["Pure copper", "Attracts wealth", "Energised"],
      tags: ["yantra", "copper"],
      isFeatured: true,
      rating: 4.6,
      ratingCount: 88,
      sortOrder: 2,
    },
    {
      name: "Nandi Bracelet (Rahu Remedy)",
      slug: "nandi-bracelet-rahu-remedy",
      categoryId: productCategoryRecords["spiritual-items"].id,
      subcategory: "Bracelets",
      price: 999,
      discountPrice: 799,
      shortDescription:
        "Spiritual bracelet recommended for calming Rahu dosha and mental peace.",
      benefits: ["Rahu remedy", "Stylish design", "Energised"],
      tags: ["bracelet", "remedy"],
      isFeatured: true,
      isPopular: true,
      stockStatus: "PRE_ORDER",
      rating: 4.7,
      ratingCount: 132,
      sortOrder: 3,
    },
    {
      name: "Navagraha Puja Kit",
      slug: "navagraha-puja-kit",
      categoryId: productCategoryRecords["spiritual-items"].id,
      subcategory: "Puja Kits",
      price: 1299,
      discountPrice: 1049,
      shortDescription:
        "Complete nine-planet pooja kit with all items needed for Navagraha Shanti.",
      benefits: ["9 planet items", "Easy guide included", "Ritual-ready"],
      tags: ["puja", "kit"],
      isFeatured: true,
      rating: 4.7,
      ratingCount: 96,
      sortOrder: 4,
    },
    {
      name: "Ceylon Blue Sapphire (Neelam) 3.50 Ct",
      slug: "ceylon-blue-sapphire-neelam-3-50-ct",
      categoryId: productCategoryRecords["gemstones"].id,
      subcategory: "Gemstones",
      price: 15999,
      discountPrice: 13999,
      shortDescription:
        "Certified Ceylon blue sapphire recommended for Saturn strength and career growth.",
      benefits: ["Untreated stone", "Lab certificate", "Energised"],
      tags: ["blue sapphire", "neelam"],
      isFeatured: true,
      isNewArrival: true,
      rating: 4.9,
      ratingCount: 154,
      sortOrder: 5,
    },
    {
      name: "Amethyst Gemstone Bracelet",
      slug: "amethyst-gemstone-bracelet",
      categoryId: productCategoryRecords["gemstones"].id,
      subcategory: "Bracelets",
      price: 1499,
      discountPrice: 1199,
      shortDescription:
        "Amethyst bracelet for mental clarity, focus and protection from negative energy.",
      benefits: ["8mm beads", "Mental clarity", "Energised"],
      tags: ["amethyst", "bracelet"],
      isFeatured: true,
      isPopular: true,
      rating: 4.7,
      ratingCount: 120,
      sortOrder: 6,
    },
    {
      name: "Yellow Sapphire Bead Mala (Pukhraj)",
      slug: "yellow-sapphire-bead-mala-pukhraj",
      categoryId: productCategoryRecords["gemstones"].id,
      subcategory: "Malas",
      price: 6999,
      discountPrice: 5999,
      shortDescription:
        "Pukhraj bead mala for Jupiter strength, wisdom and prosperity.",
      benefits: ["Jupiter remedy", "Certified beads", "Energised"],
      tags: ["pukhraj", "yellow sapphire", "mala"],
      isFeatured: true,
      rating: 4.8,
      ratingCount: 74,
      sortOrder: 7,
    },
    {
      name: "Vastu Pyramid (Gold Finish)",
      slug: "vastu-pyramid-gold-finish",
      categoryId: productCategoryRecords["vastu-items"].id,
      subcategory: "Pyramids",
      price: 499,
      discountPrice: 399,
      shortDescription:
        "Gold finish vastu pyramid for home and office energy correction.",
      benefits: ["Vastu defect remover", "Gold finish", "3 inch size"],
      tags: ["vastu", "pyramid"],
      isFeatured: true,
      rating: 4.5,
      ratingCount: 210,
      sortOrder: 8,
    },
    {
      name: "Crystal Vastu Tortoise with Baby",
      slug: "crystal-vastu-tortoise-with-baby",
      categoryId: productCategoryRecords["vastu-items"].id,
      subcategory: "Vastu Decor",
      price: 899,
      discountPrice: 749,
      shortDescription:
        "Crystal tortoise with baby for longevity, prosperity and family harmony.",
      benefits: ["Crystal glass", "9 inch", "North direction"],
      tags: ["vastu", "tortoise"],
      isFeatured: true,
      rating: 4.7,
      ratingCount: 95,
      sortOrder: 9,
    },
    {
      name: "Copper Swastik for Home",
      slug: "copper-swastik-for-home",
      categoryId: productCategoryRecords["vastu-items"].id,
      subcategory: "Vastu Decor",
      price: 299,
      discountPrice: 249,
      shortDescription:
        "Copper Swastik for main entrance to remove obstacles and bring luck.",
      benefits: ["Pure copper", "Wall mountable", "Auspicious"],
      tags: ["vastu", "swastik"],
      isFeatured: true,
      rating: 4.6,
      ratingCount: 140,
      sortOrder: 10,
    },
    {
      name: "Non-Slip Yoga Mat (6mm)",
      slug: "non-slip-yoga-mat-6mm",
      categoryId: productCategoryRecords["yoga-equipment"].id,
      subcategory: "Mats",
      price: 799,
      discountPrice: 649,
      shortDescription:
        "Premium anti-skid yoga mat with alignment lines for home practice.",
      benefits: ["6mm cushioning", "Anti-skid", "Carry strap"],
      tags: ["yoga", "mat"],
      isFeatured: true,
      isPopular: true,
      rating: 4.7,
      ratingCount: 340,
      sortOrder: 11,
    },
    {
      name: "Meditation Cushion (Zafu)",
      slug: "meditation-cushion-zafu",
      categoryId: productCategoryRecords["yoga-equipment"].id,
      subcategory: "Meditation",
      price: 1299,
      discountPrice: 999,
      shortDescription:
        "Comfortable zafu meditation cushion with buckwheat fill for long sits.",
      benefits: ["Buckwheat fill", "Removable cover", "Posture support"],
      tags: ["meditation", "cushion"],
      isFeatured: true,
      rating: 4.8,
      ratingCount: 190,
      sortOrder: 12,
    },
    {
      name: "Copper Water Bottle (750ml)",
      slug: "copper-water-bottle-750ml",
      categoryId: productCategoryRecords["yoga-equipment"].id,
      subcategory: "Wellness",
      price: 699,
      discountPrice: 549,
      shortDescription:
        "Pure copper bottle for ayurvedic copper-charged water daily wellness.",
      benefits: ["Pure copper", "Leak proof", "750ml"],
      tags: ["copper", "wellness"],
      isFeatured: false,
      rating: 4.6,
      ratingCount: 260,
      sortOrder: 13,
    },
  ];

  for (const prod of featuredProducts) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        subcategory: prod.subcategory ?? null,
        price: prod.price,
        discountPrice: prod.discountPrice,
        shortDescription: prod.shortDescription,
        benefits: prod.benefits ?? [],
        tags: prod.tags ?? [],
        isFeatured: prod.isFeatured ?? false,
        isPopular: prod.isPopular ?? false,
        isNewArrival: prod.isNewArrival ?? false,
        rating: prod.rating ?? 4.5,
        ratingCount: prod.ratingCount ?? 0,
        sortOrder: prod.sortOrder ?? 0,
      },
      create: prod as never,
    });
  }
  console.log(`OK Featured products: ${featuredProducts.length}`);

  // -------------------------------------------------------------------------
  // 3. Service categories (scope §7.7) + 9 service packages (scope §14)
  // -------------------------------------------------------------------------
  const astroCat = await prisma.serviceCategory.upsert({
    where: { slug: "astrology-course" },
    update: {},
    create: {
      name: "Astrology Course",
      slug: "astrology-course",
      description:
        "Learn Vedic Astrology with Vedic Astrologer Arup Shastri (Jai Guru) - online, offline and home guidance.",
      icon: "Star",
      sortOrder: 1,
    },
  });
  const yogaCat = await prisma.serviceCategory.upsert({
    where: { slug: "yoga-course" },
    update: {},
    create: {
      name: "Yoga Course",
      slug: "yoga-course",
      description:
        "Yoga and meditation guidance at home with personalized attention.",
      icon: "Activity",
      sortOrder: 2,
    },
  });

  const services = [
    {
      name: "Astrology Course - Online Beginner",
      slug: "astrology-course-beginner-online",
      categoryId: astroCat.id,
      mode: "ONLINE",
      duration: "8 sessions",
      price: 1999,
      shortDescription:
        "Learn the fundamentals of Vedic Astrology from scratch - birth chart, planets and houses.",
      longDescription:
        "A structured online course for absolute beginners. Learn birth chart reading, the nine planets, twelve houses and basic predictions with practical exercises.",
      benefits: [
        "Understand your own birth chart",
        "Learn planet meanings and strengths",
        "Basics of house interpretations",
        "Lifetime doubt-clearing support",
      ],
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: "Astrology Course - Online Advanced",
      slug: "astrology-course-advanced-online",
      categoryId: astroCat.id,
      mode: "ONLINE",
      duration: "16 sessions",
      price: 4999,
      shortDescription:
        "Advanced Vedic Astrology - dashas, yogas, transits and predictive techniques.",
      longDescription:
        "Advanced predictive astrology course covering dashas, planetary yogas, transits, prashna and remedial measures with case studies.",
      benefits: [
        "Dasha and transit predictions",
        "Yoga and combination analysis",
        "Remedial astrology mastery",
        "Certificate on completion",
      ],
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: "Astrology Course - Offline Beginner",
      slug: "astrology-course-beginner-offline",
      categoryId: astroCat.id,
      mode: "OFFLINE",
      duration: "8 sessions",
      price: 2999,
      shortDescription:
        "Classroom astrology course at the Sovabazar chamber, Kolkata.",
      longDescription:
        "Personal classroom training at the chamber near Sovabazar Metro Crossing. Small batches, personal attention and practical chart work.",
      benefits: [
        "Direct guidance from Jai Guru",
        "Classroom practice sessions",
        "Small batch sizes",
        "Offline doubt clearing",
      ],
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: "Astrology Course - Offline Advanced",
      slug: "astrology-course-advanced-offline",
      categoryId: astroCat.id,
      mode: "OFFLINE",
      duration: "16 sessions",
      price: 7999,
      shortDescription:
        "Advanced classroom astrology course with practical case studies.",
      longDescription:
        "Deep-dive offline course for serious students. Detailed predictive techniques, medical astrology basics and remedies with hands-on practice.",
      benefits: [
        "Advanced predictive skills",
        "Medical astrology introduction",
        "Personal mentoring",
        "Case study practice",
      ],
      isFeatured: true,
      sortOrder: 4,
    },
    {
      name: "Astrology Course - Personal Home Guidance",
      slug: "astrology-course-personal-home",
      categoryId: astroCat.id,
      mode: "HOME_SERVICE",
      duration: "1 session",
      price: 1499,
      priceLabel: "₹1,499/session",
      shortDescription:
        "One-on-one astrology learning at your home, tailored to your pace.",
      longDescription:
        "Personalized astrology lessons at your home in Kolkata. Learn at your own pace with a custom syllabus designed for you.",
      benefits: [
        "Fully personalized syllabus",
        "Learn at your home",
        "Flexible timing",
        "All levels welcome",
      ],
      isFeatured: true,
      sortOrder: 5,
    },
    {
      name: "Yoga Course - Home Beginner",
      slug: "yoga-course-home-beginner",
      categoryId: yogaCat.id,
      mode: "HOME_SERVICE",
      duration: "1 session",
      price: 999,
      priceLabel: "₹999/session",
      shortDescription:
        "Gentle yoga foundations taught at home for beginners.",
      longDescription:
        "Start your yoga journey at home with simple asanas, breathing and relaxation techniques suited for beginners and seniors.",
      benefits: [
        "Gentle beginner asanas",
        "Breathing techniques",
        "Relaxation & stretching",
        "Home comfort",
      ],
      isFeatured: true,
      sortOrder: 6,
    },
    {
      name: "Yoga Course - Home Monthly Package",
      slug: "yoga-course-home-monthly",
      categoryId: yogaCat.id,
      mode: "HOME_SERVICE",
      duration: "1 month",
      price: 4999,
      priceLabel: "₹4,999/month",
      shortDescription:
        "Regular home yoga sessions - 4 sessions per month with progress tracking.",
      longDescription:
        "A complete monthly home yoga program: 4 guided sessions per month, personalized asana routines and lifestyle guidance.",
      benefits: [
        "4 sessions per month",
        "Progress tracking",
        "Personalized routines",
        "Lifestyle guidance",
      ],
      isFeatured: true,
      sortOrder: 7,
    },
    {
      name: "Yoga Course - Spiritual Yoga & Meditation",
      slug: "yoga-course-spiritual-meditation",
      categoryId: yogaCat.id,
      mode: "HOME_SERVICE",
      duration: "1 session",
      price: 1299,
      priceLabel: "₹1,299/session",
      shortDescription:
        "Spiritual yoga, pranayama and meditation for inner peace.",
      longDescription:
        "Spiritual yoga combining asanas, pranayama, mantra and meditation to calm the mind and deepen spiritual practice.",
      benefits: [
        "Pranayama practices",
        "Meditation guidance",
        "Mantra chanting",
        "Mental peace & focus",
      ],
      isFeatured: true,
      sortOrder: 8,
    },
    {
      name: "Astrology + Yoga + Spiritual Guidance Package",
      slug: "astro-yoga-spiritual-package",
      categoryId: astroCat.id,
      mode: "HOME_SERVICE",
      duration: "1 session",
      price: 2499,
      priceLabel: "₹2,499/session",
      shortDescription:
        "The unique quick solution method - Astrology + Yoga + Spirituality combined.",
      longDescription:
        "JAIGURU ASTROREMEDY's signature package combining astrology analysis, yoga practices and spiritual remedies for holistic personal solutions.",
      benefits: [
        "Complete horoscope analysis",
        "Personalized yoga routine",
        "Spiritual remedy guidance",
        "Quick solution method",
      ],
      isFeatured: true,
      sortOrder: 9,
    },
  ];
  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {
        name: svc.name,
        mode: svc.mode as never,
        duration: svc.duration,
        price: svc.price as never,
        priceLabel: svc.priceLabel ?? null,
        shortDescription: svc.shortDescription ?? null,
        longDescription: svc.longDescription ?? null,
        benefits: svc.benefits ?? [],
        isFeatured: svc.isFeatured ?? false,
        sortOrder: svc.sortOrder ?? 0,
        isActive: true,
      },
      create: svc as never,
    });
  }
  console.log(`OK Services: ${services.length}`);

  // -------------------------------------------------------------------------
  // 4. Announcements (scope §7.4)
  // -------------------------------------------------------------------------
  const announcements = [
    {
      title: "Astrology Course Announcement",
      text: "New Batch for Astrology Course Starting Soon || Consultation Fee: ₹700",
      textColor: "#111827",
      backgroundColor: "#FACC15",
      fontSize: 15,
      fontStyle: "bold",
      speed: 30,
      isActive: true,
      sortOrder: 1,
    },
    {
      title: "Home & Online Consultations Announcement",
      text: "Home Visits Available in Kolkata || Worldwide Online Consultations Available",
      textColor: "#FFFFFF",
      backgroundColor: "#4C1D95",
      fontSize: 15,
      fontStyle: "normal",
      speed: 30,
      isActive: true,
      sortOrder: 2,
    },
  ];
  for (const a of announcements) {
    await prisma.announcement.upsert({
      where: { id: `seed-${a.title.toLowerCase().replace(/\s+/g, "-")}` },
      update: {
        text: a.text,
        textColor: a.textColor,
        backgroundColor: a.backgroundColor,
        fontSize: a.fontSize,
        fontStyle: a.fontStyle,
        speed: a.speed,
        isActive: a.isActive,
        sortOrder: a.sortOrder,
      },
      create: { ...a, id: `seed-${a.title.toLowerCase().replace(/\s+/g, "-")}` },
    });
  }
  console.log(`OK Announcements: ${announcements.length}`);

  // -------------------------------------------------------------------------
  // 5. Homepage sections (scope §7)
  // -------------------------------------------------------------------------
  const homepageSections = [
    { key: "top-header", title: "Top Header", subtitle: "Booking / Query contact bar", sortOrder: 1 },
    { key: "main-header", title: "Main Header", subtitle: "Logo, brand, navigation", sortOrder: 2 },
    { key: "announcement-bar-1", title: "Announcement Bar 1", subtitle: "First scrolling announcement", sortOrder: 3 },
    { key: "hero", title: "Hero Section", subtitle: "Astrologer image, headline, CTAs", sortOrder: 4 },
    { key: "announcement-bar-2", title: "Announcement Bar 2", subtitle: "Second scrolling announcement", sortOrder: 5 },
    { key: "consultation-cards", title: "Consultation Cards", subtitle: "9 consultation service cards", sortOrder: 6 },
    { key: "featured-products", title: "Featured Products", subtitle: "12 featured products", sortOrder: 7 },
    { key: "featured-services", title: "Featured Services", subtitle: "9 service package cards", sortOrder: 8 },
    { key: "youtube-gallery", title: "YouTube Gallery", subtitle: "Video thumbnails with play overlay", sortOrder: 9 },
    { key: "photo-gallery", title: "Photo Gallery", subtitle: "Responsive image grid", sortOrder: 10 },
    { key: "video-gallery", title: "Video Gallery", subtitle: "Embedded video cards", sortOrder: 11 },
    { key: "testimonials", title: "Testimonials", subtitle: "Customer reviews", sortOrder: 12 },
    { key: "google-reviews", title: "Google Reviews", subtitle: "Google review CTA", sortOrder: 13 },
    { key: "facebook-section", title: "Facebook Section", subtitle: "Facebook page embed / CTA", sortOrder: 14 },
    { key: "chamber-location", title: "Chamber Location", subtitle: "Address, direction, call buttons", sortOrder: 15 },
    { key: "google-map", title: "Google Map", subtitle: "Full-width embedded map", sortOrder: 16 },
    { key: "footer", title: "Footer", subtitle: "Links, contact, copyright", sortOrder: 17 },
  ];
  for (const s of homepageSections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: s.key },
      update: { title: s.title, subtitle: s.subtitle, sortOrder: s.sortOrder },
      create: {
        sectionKey: s.key,
        title: s.title,
        subtitle: s.subtitle,
        sortOrder: s.sortOrder,
        isVisible: true,
      },
    });
  }
  console.log(`OK Homepage sections: ${homepageSections.length}`);

  // -------------------------------------------------------------------------
  // 6. Site settings (branding, hero, contact, profile, map, payment, seo)
  // -------------------------------------------------------------------------
  const siteSettings: Record<string, unknown> = {
    branding: {
      logo: null,
      logoAlt: "JAIGURU ASTROREMEDY Logo",
      siteName: "JAIGURU ASTROREMEDY",
      tagline:
        "Vedic Astrology, Vastu, Numerology, Yoga & Spiritual Remedies",
      favicon: null,
    },
    hero: {
      badge: "Trusted Vedic Astrology, Vastu, Numerology & Yoga Guidance in Kolkata",
      astrologerImage: null,
      masterImage: null,
      headlineBefore: "Personalized ",
      headlineHighlight: "Astrology, Vastu, Numerology",
      headlineAfter: " & Spiritual Guidance",
      subtext:
        "Consult Vedic Astrologer Arup Shastri (Jai Guru) for astrology, numerology, vastu, yoga and spiritual remedy guidance at Sovabazar, Kolkata.",
      feeText: "Consultation Fee: ₹700",
      buttons: {
        whatsapp: { label: "Book Consultation", active: true },
        call: { label: "Call Now", active: true },
        products: { label: "View Products", active: true },
        services: { label: "Explore Services", active: true },
      },
      trustChips: [
        "Astrology Consultation",
        "Numerology",
        "Vastu",
        "Yoga",
        "Spiritual Remedies",
      ],
      floatingCards: [
        { icon: "receipt", label: "Consultation", value: "₹700" },
        { icon: "store", label: "Kolkata Chamber", value: "Sovabazar Metro" },
        { icon: "whatsapp", label: "WhatsApp Booking", value: "Fast Response" },
      ],
    },
    contact: {
      whatsappNumber: "+91 98748 86574",
      whatsappNumberRaw: "919874886574",
      callNumber: "+91 98361 25780",
      email: "",
      address: "51/A, Jatindra Mohan Avenue, Kolkata - 700005",
      landmark: "Sovabazar Metro Crossing",
      businessHours: "Mon - Sat: 10:00 AM - 8:00 PM | Sun: By Appointment",
      consultationFee: 700,
    },
    astrologerProfile: {
      name: "Vedic Astrologer Arup Shastri (Jai Guru)",
      shortTitle: "A Spiritual Master, True Healer",
      photo: null,
      masterPhoto: null,
      bio: "",
      expertise: [
        "Vedic Astrology",
        "Vastu",
        "Numerology",
        "Yoga",
        "Medical Astrology",
        "Spiritual Remedies",
        "Gemstone Guidance",
        "Black Magic Protection Guidance",
        "Astrology + Yoga + Spirituality Quick Solution Method",
      ],
      services: [
        "Astrology Consultation (₹700)",
        "Numerology Consultation (₹700)",
        "Vastu Consultation (₹700)",
      ],
    },
    googleMap: {
      embedUrl: "",
      address: "51/A, Jatindra Mohan Avenue, Kolkata - 700005",
      landmark: "Sovabazar Metro Crossing",
      mapsLink:
        "https://www.google.com/maps/search/?api=1&query=51%2FA+Jatindra+Mohan+Avenue+Kolkata+700005",
      directionsLink:
        "https://www.google.com/maps/dir/?api=1&destination=51%2FA+Jatindra+Mohan+Avenue+Kolkata+700005",
    },
    googleReview: {
      link: "",
      title: "Give Review on Google",
      description: "Share your experience on Google",
    },
    facebook: {
      pageUrl: "",
      embedEnabled: false,
      embedUrl: "",
    },
    payment: {
      upiId: "",
      receiverName: "",
      instructions:
        "Pay through PhonePe / UPI and send the screenshot on WhatsApp to confirm your order.",
    },
    whatsappMessageTemplate: {
      product: "",
      service: "",
    },
    footer: {
      about:
        "Premium Vedic Astrology, Vastu, Numerology, Yoga and Spiritual Remedy guidance in Kolkata by Vedic Astrologer Arup Shastri (Jai Guru).",
      ownedBy: "",
      registered: "",
      copyright:
        "© 2026 Astrologer Arup Shastri. All rights reserved. jaiguruastroremedy.com is owned and operated by ASTRO GEMS, a registered enterprise under the Kolkata Municipal Corporation.",
    },
  };
  for (const [key, value] of Object.entries(siteSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never },
    });
  }
  console.log(`OK Site settings: ${Object.keys(siteSettings).length}`);

  // -------------------------------------------------------------------------
  // 7. Theme settings (scope UI spec)
  // -------------------------------------------------------------------------
  const themeSettings: Record<string, unknown> = {
    colors: {
      primary: "#4C1D95",
      primaryForeground: "#FFFFFF",
      deepNavy: "#0F172A",
      indigoDeep: "#312E81",
      golden: "#FACC15",
      premiumGold: "#D4AF37",
      emerald: "#16A34A",
      whatsapp: "#25D366",
      saffron: "#F97316",
      cream: "#FFF7ED",
      mutedText: "#6B7280",
      darkText: "#111827",
    },
    gradients: {
      hero: "linear-gradient(135deg, #0F172A 0%, #312E81 45%, #4C1D95 100%)",
      goldAccent: "linear-gradient(90deg, #FACC15 0%, #D4AF37 50%, #F97316 100%)",
      spiritualCard:
        "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(255,247,237,0.92))",
      darkPremium:
        "linear-gradient(135deg, #111827 0%, #1E1B4B 50%, #312E81 100%)",
      topbar: "linear-gradient(90deg, #0F172A, #312E81, #4C1D95)",
    },
    fonts: {
      heading: "Playfair Display",
      body: "Inter",
    },
    radius: {
      card: 12,
      button: 8,
    },
    buttons: {
      whatsapp: "#25D366",
      call: "#16A34A",
      primary: "#4C1D95",
    },
    cardStyle: {
      backgroundColor: "#FFFFFF",
      borderColor: "#E5E7EB",
      borderWidth: 1,
      shadow: "soft",
      padding: "p-5",
      hoverEffect: true,
    },
    sectionSpacing: {
      desktop: "py-24",
      mobile: "py-16",
    },
    theme: {
      primary: "#4C1D95",
      secondary: "#312E81",
      accent: "#FACC15",
      bodyFont: "inter",
      headingFont: "playfair-display",
      cardRadius: 12,
      buttonRadius: 9999,
      sectionSpacing: 80,
      productCardRadius: 16,
      serviceCardRadius: 16,
    },
  };
  for (const [key, value] of Object.entries(themeSettings)) {
    await prisma.themeSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as never },
    });
  }
  console.log(`OK Theme settings: ${Object.keys(themeSettings).length}`);

  // -------------------------------------------------------------------------
  // 8. SEO settings
  // -------------------------------------------------------------------------
  const seoSettings: Record<string, unknown> = {
    default: {
      title:
        "JAIGURU ASTROREMEDY | Best Astrologer in Kolkata - Arup Shastri (Jai Guru)",
      description:
        "Best astrologer in Kolkata. Vedic Astrology, Vastu, Numerology, Yoga & Spiritual Remedies by Vedic Astrologer Arup Shastri (Jai Guru). Book consultation at ₹700. Chamber at Sovabazar Metro Crossing.",
      keywords:
        "best astrologer in Kolkata, astrologer near Sovabazar, vastu consultant Kolkata, numerology consultation Kolkata, gemstones in Kolkata, spiritual remedy Kolkata, yoga home service Kolkata, astrology course Kolkata, medical astrology Kolkata",
      ogImage: null,
    },
  };
  for (const [key, value] of Object.entries(seoSettings)) {
    await prisma.seoSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as never },
    });
  }
  console.log(`OK SEO settings: ${Object.keys(seoSettings).length}`);

  // -------------------------------------------------------------------------
  // 9. Social links (placeholders - owner provides URLs later)
  // -------------------------------------------------------------------------
  const socialLinks = [
    { platform: "facebook", icon: "Facebook", sortOrder: 1 },
    { platform: "youtube", icon: "Youtube", sortOrder: 2 },
    { platform: "instagram", icon: "Instagram", sortOrder: 3 },
    { platform: "twitter", icon: "Twitter", sortOrder: 4 },
    { platform: "whatsapp", icon: "Whatsapp", sortOrder: 5 },
    { platform: "googlebusiness", icon: "Google", sortOrder: 6 },
  ];
  for (const link of socialLinks) {
    await prisma.socialLink.upsert({
      where: { platform: link.platform },
      update: {},
      create: { ...link, url: "" },
    });
  }
  console.log(`OK Social links: ${socialLinks.length}`);

  // -------------------------------------------------------------------------
  // 10. Legal pages - Phase 7 professional content (legal-content.ts)
  // -------------------------------------------------------------------------
  for (const page of LEGAL_PAGES) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {
        title: page.title,
        content: page.content,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sortOrder: page.sortOrder,
      },
      create: {
        slug: page.slug,
        title: page.title,
        content: page.content,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        sortOrder: page.sortOrder,
      },
    });
  }
  console.log(`OK Legal pages: ${LEGAL_PAGES.length}`);

  // -------------------------------------------------------------------------
  // 12. Testimonials (dummy data for the homepage Testimonials section)
  // -------------------------------------------------------------------------
  const testimonials = [
    {
      id: "testimonial-ramesh-agarwal",
      customerName: "Ramesh Agarwal",
      location: "Kolkata",
      rating: 5,
      text: "Jai Guru ji's reading was incredibly accurate. My career struggled for years, but following his gemstone and mantra guidance changed things within months. Truly thankful.",
      serviceRef: "Astrology Consultation",
      isApproved: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      id: "testimonial-priya-sen",
      customerName: "Priya Sen",
      location: "Howrah",
      rating: 5,
      text: "The numerology consultation opened my eyes. My daughter's name correction brought immediate positive changes in her health and academics. Very professional and kind.",
      serviceRef: "Numerology Consultation",
      isApproved: true,
      isFeatured: true,
      sortOrder: 2,
    },
    {
      id: "testimonial-anirban-dutta",
      customerName: "Anirban Dutta",
      location: "Kolkata",
      rating: 5,
      text: "Vastu consultation for my new home was detailed and practical. The small changes Jai Guru suggested improved harmony and prosperity in the whole family.",
      serviceRef: "Vastu Consultation",
      isApproved: true,
      isFeatured: true,
      sortOrder: 3,
    },
    {
      id: "testimonial-farhana-khan",
      customerName: "Farhana Khan",
      location: "Delhi",
      rating: 5,
      text: "I was suffering from fear and negativity for years. The black magic protection guidance and spiritual remedies finally gave me peace. Forever grateful to Jai Guru ji.",
      serviceRef: "Black Magic Protection Guidance",
      isApproved: true,
      isFeatured: true,
      sortOrder: 4,
    },
    {
      id: "testimonial-subhash-mondal",
      customerName: "Subhash Mondal",
      location: "Kolkata",
      rating: 4,
      text: "Took the online beginner astrology course. Classes are very well structured and Jai Guru ji explains complex concepts so simply. Worth every rupee.",
      serviceRef: "Astrology Course",
      isApproved: true,
      isFeatured: true,
      sortOrder: 5,
    },
    {
      id: "testimonial-meera-bhattacharya",
      customerName: "Meera Bhattacharya",
      location: "Kolkata",
      rating: 5,
      text: "Weekly home yoga sessions have transformed my health and meditation practice. Jai Guru ji's guidance blends yoga, spirituality and practicality beautifully.",
      serviceRef: "Yoga Guidance",
      isApproved: true,
      isFeatured: true,
      sortOrder: 6,
    },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: t.id },
      update: {
        customerName: t.customerName,
        location: t.location ?? null,
        rating: t.rating,
        text: t.text,
        serviceRef: t.serviceRef ?? null,
        isApproved: true,
        isFeatured: true,
        sortOrder: t.sortOrder,
      },
      create: t,
    });
  }
  console.log(`OK Testimonials: ${testimonials.length}`);

  console.log("\nCOMPLETE Database seeding complete!");
  console.log("Admin login:", SEED_ADMIN_EMAIL, "/", SEED_ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
