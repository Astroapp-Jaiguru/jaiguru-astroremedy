import { headers } from "next/headers";
import { requireAdmin } from "@/lib/dal";
import { getPaymentSettings } from "@/lib/payments/settings";
import { razorpayWebhookUrl } from "@/lib/payments/settings";
import { PaymentSettingsForm } from "@/components/admin/payments/payment-settings-form";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  await requireAdmin();
  const headersList = await headers();
  const host = headersList.get("host");
  const settings = await getPaymentSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Payment Settings</h1>
        <p className="text-sm text-muted-foreground">
          Razorpay gateway keys and webhook configuration for the checkout.
        </p>
      </div>
      <PaymentSettingsForm
        initial={settings}
        webhookUrl={razorpayWebhookUrl(host)}
      />
    </div>
  );
}