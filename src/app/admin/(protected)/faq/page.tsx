import { prisma } from "@/lib/prisma";
import { FaqManager, type FaqRow } from "@/components/admin/faq/faq-manager";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  let faqs: FaqRow[] = [];
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
    }));
  } catch (e) {
    console.error("[admin] FaqPage failed:", e);
  }

  return <FaqManager faqs={faqs} />;
}