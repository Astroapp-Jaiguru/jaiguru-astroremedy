"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Public newsletter subscription (footer form).
 * Upserts by email so double submissions just refresh the row.
 */
export async function subscribeAction(
  prev: { error?: string } | undefined,
  fd: FormData
): Promise<{ ok?: boolean; error?: string }> {
  const email = String(fd.get("email") ?? "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  const name = String(fd.get("name") ?? "").trim().slice(0, 120) || null;
  const source = String(fd.get("source") ?? "footer").slice(0, 40);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await prisma.subscriber.upsert({
      where: { email },
      update: { isActive: true, name, source },
      create: { email, name, source },
    });
  } catch (e) {
    console.error("[subscribe] failed:", e);
    return { error: "Could not subscribe right now. Please try again." };
  }
  revalidatePath("/admin/subscribers");
  return { ok: true };
}