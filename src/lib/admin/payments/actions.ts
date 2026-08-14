"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import {
  getPaymentSettings,
  savePaymentSettings,
} from "@/lib/payments/settings";

export interface PaymentFormState {
  error?: string;
  success?: boolean;
  webhookSecret?: string;
}

function text(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Save Razorpay API keys and (re)generate the webhook secret when blank.
 */
export async function savePaymentSettingsAction(
  _prev: PaymentFormState | undefined,
  fd: FormData
): Promise<PaymentFormState> {
  try {
    await requireAdmin();
    const existing = await getPaymentSettings();
    const saved = await savePaymentSettings({
      razorpayKeyId: text(fd, "razorpayKeyId") || existing.razorpayKeyId,
      razorpaySecretKey:
        text(fd, "razorpaySecretKey") || existing.razorpaySecretKey,
      razorpayWebhookSecret:
        text(fd, "razorpayWebhookSecret") || existing.razorpayWebhookSecret,
    });
    revalidatePath("/admin/payment-settings");
    revalidatePath("/");
    return {
      success: true,
      webhookSecret: saved.razorpayWebhookSecret,
    };
  } catch (e) {
    console.error("[admin] savePaymentSettingsAction failed:", e);
    return { error: e instanceof Error ? e.message : "Failed to save settings" };
  }
}
