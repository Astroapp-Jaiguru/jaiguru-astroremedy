import { prisma } from "@/lib/prisma";
import { getTypographyOverrides } from "@/lib/typography-overrides";
import { FaqManager, type FaqRow } from "@/components/admin/faq/faq-manager";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  let faqs: FaqRow[] = [];
  const faqTypography = (await getTypographyOverrides()).faq;
  try {
    const rows = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    faqs = rows.map((r) => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
      category: r.category,
      sortOrder: r.sortOrder,
      isActive: r.isActive,
      typography: faqTypography[r.id],
    }));
  } catch (e) {
    console.error("[admin] FaqPage failed:", e);
  }

  return <FaqManager faqs={faqs} />;
}