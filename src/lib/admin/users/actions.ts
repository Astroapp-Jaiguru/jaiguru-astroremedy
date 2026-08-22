"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAdmin } from "@/lib/dal";

export async function deleteUserAction(id: string): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    if (id === (await getCurrentUser())?.id) {
      return { ok: false };
    }
    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteUser failed:", e);
    return { ok: false };
  }
}