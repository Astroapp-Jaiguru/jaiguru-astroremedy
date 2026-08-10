"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { isRequestStatus } from "./status";

/**
 * Admin Contact Messages actions (scope §19).
 * Messages are created by the public contact form; admins update status
 * and delete records.
 */

export interface ContactMessageFormState {
  error?: string;
  success?: boolean;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function updateContactMessageStatusAction(
  _state: ContactMessageFormState | undefined,
  fd: FormData
): Promise<ContactMessageFormState> {
  await requireAdmin();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!id) return { error: "Missing message id." };
  if (!isRequestStatus(status)) return { error: "Invalid status value." };

  try {
    await prisma.contactMessage.update({ where: { id }, data: { status } });
  } catch (e) {
    console.error("[admin] updateContactMessageStatus failed:", e);
    return { error: "Could not update the status. Please try again." };
  }

  revalidatePath("/admin/contact");
  revalidatePath(`/admin/contact/${id}`);
  redirect(`/admin/contact/${id}`);
}

export async function deleteContactMessageAction(
  id: string
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.contactMessage.delete({ where: { id } });
    revalidatePath("/admin/contact");
    revalidatePath("/admin/contact-messages");
    return { ok: true };
  } catch (e) {
    console.error("[admin] deleteContactMessage failed:", e);
    return { ok: false };
  }
}

/**
 * Read / Unread toggle.
 * A message is "unread" while its status is NEW; reading moves it to
 * IN_PROGRESS, unreading sets it back to NEW.
 */
export async function setContactMessageReadAction(
  id: string,
  read: boolean
): Promise<{ ok: boolean }> {
  await requireAdmin();
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { status: read ? "IN_PROGRESS" : "NEW" },
    });
    revalidatePath("/admin/contact-messages");
    revalidatePath(`/admin/contact/${id}`);
    return { ok: true };
  } catch (e) {
    console.error("[admin] setContactMessageRead failed:", e);
    return { ok: false };
  }
}
