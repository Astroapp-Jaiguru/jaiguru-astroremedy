"use server";

import { prisma } from "@/lib/prisma";

/**
 * Public contact form action (scope §19).
 * Persists enquiries into the ContactMessage table, which admins manage
 * from the dashboard (Contact Messages module).
 */

export interface ContactMessageFormState {
  error?: string;
  success?: boolean;
  id?: string;
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function submitContactMessageAction(
  _state: ContactMessageFormState | undefined,
  fd: FormData
): Promise<ContactMessageFormState> {
  const name = str(fd, "name");
  const phone = str(fd, "phone");

  if (!name) return { error: "Please enter your name." };
  if (!phone) return { error: "Please enter your phone number." };
  if (name.length > 120) return { error: "Name is too long." };
  if (phone.length > 30) return { error: "Phone number is too long." };

  const whatsappNumber = str(fd, "whatsappNumber") || null;
  const serviceInterest = str(fd, "serviceInterest") || null;
  const message = str(fd, "message") || null;
  const preferredDate = str(fd, "preferredDate") || null;
  const preferredTime = str(fd, "preferredTime") || null;

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name,
        phone,
        whatsappNumber,
        serviceInterest,
        message,
        preferredDate,
        preferredTime,
      },
      select: { id: true },
    });
    return { success: true, id: created.id };
  } catch (e) {
    console.error("[contact] submitContactMessage failed:", e);
    return {
      error: "Sorry, we could not send your message. Please try again or contact us directly on WhatsApp.",
    };
  }
}
