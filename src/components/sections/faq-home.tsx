import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/sections/section-heading";
import { FaqAccordion, type FaqItem } from "@/components/sections/faq-accordion";
import { Reveal } from "@/components/motion/reveal";
import type { ReactElement } from "react";

/**
 * Homepage FAQ section - elegant glassmorphism accordion, fully managed
 * from /admin/faq. Renders only when active questions exist and sits
 * naturally between the surrounding sections.
 */
export async function FaqHome(): Promise<ReactElement> {
  let faqs: FaqItem[] = [];
  try {
    const rows = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true, category: true },
    });
    faqs = rows;
  } catch {
    // DB unreachable - hide the section.
  }

  if (faqs.length === 0) return <></>;

  return (
    <section
      id="faq"
      aria-label="Frequently asked questions"
      className="scroll-mt-24 py-20"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Need Help?"
            title="Frequently Asked"
            highlight="Questions"
            subtitle="Answers to the questions we hear most often - reach out any time if yours isn't covered."
          />
        </Reveal>
        <Reveal className="mt-10">
          <FaqAccordion faqs={faqs} />
        </Reveal>
      </div>
    </section>
  );
}