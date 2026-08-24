"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Check, Copy, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { savePaymentSettingsAction } from "@/lib/admin/payments/actions";
import type { PaymentSettings } from "@/lib/payments/settings";

/**
 * Admin Payment Settings: Razorpay API keys, webhook secret and the
 * generated webhook URL to configure in the Razorpay dashboard.
 */

export function PaymentSettingsForm({
  initial,
  webhookUrl,
}: {
  initial: PaymentSettings;
  webhookUrl: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    savePaymentSettingsAction,
    undefined
  );
  const handledRef = useRef(false);
  const [copied, setCopied] = useState<"url" | "secret" | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      if (state.webhookSecret) {
        setShowSecret(true);
        toast.success("Settings saved — webhook secret generated");
      } else {
        toast.success("Payment settings saved");
      }
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const copy = async (text: string, key: "url" | "secret") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-4 w-4" />
            Razorpay API Keys
          </CardTitle>
          <CardDescription>
            From the Razorpay Dashboard → Settings → API Keys. The Key ID is
            public (sent to the browser); the Secret Key is server-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
            <Input
              id="razorpayKeyId"
              name="razorpayKeyId"
              placeholder="rzp_live_xxxxxxxxxxxxxxxx"
              defaultValue={initial.razorpayKeyId}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="razorpaySecretKey">Razorpay Secret Key</Label>
            <div className="flex gap-2">
              <Input
                id="razorpaySecretKey"
                name="razorpaySecretKey"
                type={showSecret ? "text" : "password"}
                placeholder="Leave blank to keep the current key"
                defaultValue=""
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Toggle secret visibility"
                onClick={() => setShowSecret((v) => !v)}
              >
                <Lock className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Saved keys are stored encrypted in the database and never shown
              again — replace by typing a new value.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-4 w-4" />
            Webhook
          </CardTitle>
          <CardDescription>
            Configure this URL in Razorpay Dashboard → Settings → Webhooks so
            payment confirmations mark orders as Paid automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex gap-2">
              <code className="flex h-10 flex-1 items-center overflow-x-auto rounded-lg border bg-muted px-3 font-mono text-xs">
                {webhookUrl}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copy webhook URL"
                onClick={() => copy(webhookUrl, "url")}
              >
                {copied === "url" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Events to subscribe: <code className="font-mono">payment.captured</code>{" "}
              and <code className="font-mono">order.paid</code>.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="razorpayWebhookSecret">Webhook Secret</Label>
            <div className="flex gap-2">
              <Input
                id="razorpayWebhookSecret"
                name="razorpayWebhookSecret"
                type="password"
                placeholder="Auto-generated if left blank on save"
                defaultValue={initial.razorpayWebhookSecret}
              />
              {initial.razorpayWebhookSecret ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Copy webhook secret"
                  onClick={() => copy(initial.razorpayWebhookSecret, "secret")}
                >
                  {copied === "secret" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-muted-foreground">
              Paste the same secret in Razorpay Dashboard → Webhooks. Leave
              blank to auto-generate a fresh secret on save.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Payment Settings
      </Button>
    </form>
  );
}