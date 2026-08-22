import { createHmac, timingSafeEqual } from "crypto";
import Razorpay from "razorpay";
import { getPaymentSettings } from "@/lib/payments/settings";

/**
 * Razorpay server helpers. The instance is created per-call from the
 * admin-configured keys (Payment Settings), so key changes take effect
 * immediately without a redeploy.
 */

let clientCache: Razorpay | null = null;
let clientKey = "";

function getClient(): Razorpay | null {
  // instance is memoized per key pair
  return clientCache;
}

export async function createRazorpayClient(): Promise<Razorpay | null> {
  const settings = await getPaymentSettings();
  if (!settings.razorpayKeyId || !settings.razorpaySecretKey) return null;
  const fingerprint = `${settings.razorpayKeyId}:${settings.razorpaySecretKey}`;
  if (!clientCache || clientKey !== fingerprint) {
    clientCache = new Razorpay({
      key_id: settings.razorpayKeyId,
      key_secret: settings.razorpaySecretKey,
    });
    clientKey = fingerprint;
  }
  return getClient();
}

export interface CreateRazorpayOrderInput {
  amount: number; // in rupees
  receipt: string; // order reference
  notes?: Record<string, string>;
}

/** Create a Razorpay order for the checkout flow. */
export async function createRazorpayOrder(
  input: CreateRazorpayOrderInput
): Promise<{ id: string; amount: number; currency: string }> {
  const client = await createRazorpayClient();
  if (!client) throw new Error("Razorpay is not configured");
  const order = await client.orders.create({
    amount: Math.round(input.amount * 100), // paise
    currency: "INR",
    receipt: input.receipt.slice(0, 40),
    notes: input.notes ?? {},
  });
  return { id: order.id, amount: Number(order.amount), currency: String(order.currency) };
}

/** Verify a Razorpay webhook signature (HMAC-SHA256 with the webhook secret). */
export async function verifyWebhookSignature(
  body: string,
  signature: string | null,
  webhookSecret?: string
): Promise<boolean> {
  if (!signature) return false;
  const secret = webhookSecret ?? (await getPaymentSettings()).razorpayWebhookSecret;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Verify the payment signature returned by the Razorpay checkout modal. */
export async function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<boolean> {
  const settings = await getPaymentSettings();
  if (!settings.razorpaySecretKey) return false;
  const expected = createHmac("sha256", settings.razorpaySecretKey)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(params.razorpaySignature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}