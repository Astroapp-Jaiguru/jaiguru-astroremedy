import { cache } from "react";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Payment gateway configuration stored in SiteSetting key "payments".
 * Razorpay keys are secrets - never read client-side; the public Key ID
 * alone is exposed (safe by design, it is not a secret).
 */

export interface PaymentSettings {
  razorpayKeyId: string;
  razorpaySecretKey: string;
  razorpayWebhookSecret: string;
}

export const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  razorpayKeyId: "",
  razorpaySecretKey: "",
  razorpayWebhookSecret: "",
};

function isPaymentSettings(v: unknown): v is PaymentSettings {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.razorpayKeyId === "string" &&
    typeof o.razorpaySecretKey === "string" &&
    typeof o.razorpayWebhookSecret === "string"
  );
}

/** Read the payment settings (cached once per request). */
export const getPaymentSettings = cache(async (): Promise<PaymentSettings> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "payments" } });
    if (isPaymentSettings(row?.value)) return row.value;
  } catch (e) {
    console.error("[payments] getPaymentSettings failed:", e);
  }
  return EMPTY_PAYMENT_SETTINGS;
});

/** Persist payment settings. Generates a webhook secret when missing. */
export async function savePaymentSettings(
  settings: PaymentSettings
): Promise<PaymentSettings> {
  const merged: PaymentSettings = {
    razorpayKeyId: settings.razorpayKeyId.trim(),
    razorpaySecretKey: settings.razorpaySecretKey.trim(),
    razorpayWebhookSecret:
      settings.razorpayWebhookSecret.trim() ||
      randomBytes(24).toString("hex"),
  };
  await prisma.siteSetting.upsert({
    where: { key: "payments" },
    update: { value: merged as never },
    create: { key: "payments", value: merged as never },
  });
  return merged;
}

/** Public Razorpay Key ID (safe to expose to the browser). */
export async function getRazorpayKeyId(): Promise<string> {
  const settings = await getPaymentSettings();
  return settings.razorpayKeyId;
}

/**
 * Razorpay webhook URL Razorpay must be configured to call. Derived from
 * the public site domain when available, falling back to the request host.
 */
export function razorpayWebhookUrl(host?: string | null): string {
  const base =
    host && host !== "localhost:3000"
      ? `https://${host}`
      : process.env.NEXT_PUBLIC_SITE_URL ??
        "https://www.jaiguruastroremedy.com";
  return `${base}/api/razorpay/webhook`;
}
