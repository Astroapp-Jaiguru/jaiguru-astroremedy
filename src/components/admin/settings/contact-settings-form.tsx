"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveContactAction } from "@/lib/admin/settings/actions";

export interface ContactFormValues {
  whatsappNumber: string;
  whatsappDisplay: string;
  callNumber: string;
  callDisplay: string;
  bookingLabel: string;
  email: string;
  address: string;
  landmark: string;
  businessHours: string;
  consultationFee: number;
  upiId: string;
}

export function ContactSettingsForm({ initial }: { initial: ContactFormValues }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveContactAction,
    undefined
  );
  const handledRef = useRef(false);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Contact settings saved");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phone & WhatsApp</CardTitle>
            <CardDescription>
              Used in the top header, footer, hero buttons and floating CTAs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                defaultValue={initial.whatsappNumber}
                placeholder="+91 98748 86574"
              />
              <p className="text-xs text-muted-foreground">
                With country code. All WhatsApp buttons across the site open a
                chat with this number.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappDisplay">WhatsApp Display Text</Label>
              <Input
                id="whatsappDisplay"
                name="whatsappDisplay"
                defaultValue={initial.whatsappDisplay}
                placeholder="+91 98748 86574"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callNumber">Call Number</Label>
              <Input
                id="callNumber"
                name="callNumber"
                defaultValue={initial.callNumber}
                placeholder="+91 98361 25780"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="callDisplay">Call Display Text</Label>
              <Input
                id="callDisplay"
                name="callDisplay"
                defaultValue={initial.callDisplay}
                placeholder="+91 98361 25780"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingLabel">Booking Label</Label>
              <Input
                id="bookingLabel"
                name="bookingLabel"
                defaultValue={initial.bookingLabel}
                placeholder="Booking / Query"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                name="upiId"
                defaultValue={initial.upiId}
                placeholder="9836125780@ibl"
              />
              <p className="text-xs text-muted-foreground">
                Shown inside the payment popup (PhonePe / Google Pay link, text
                and QR) on all product &quot;Order&quot; and service
                &quot;Book&quot; buttons.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Email, Chamber & Hours</CardTitle>
            <CardDescription>
              Shown in the footer contact column and on the contact page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initial.email}
                placeholder="hello@jaiguruastroremedy.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Chamber Address</Label>
              <Input
                id="address"
                name="address"
                defaultValue={initial.address}
                placeholder="51/A, Jatindra Mohan Avenue, Kolkata - 700005"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark</Label>
              <Input
                id="landmark"
                name="landmark"
                defaultValue={initial.landmark}
                placeholder="Sovabazar Metro Crossing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessHours">Business Hours</Label>
              <Input
                id="businessHours"
                name="businessHours"
                defaultValue={initial.businessHours}
                placeholder="Mon - Sat: 10:00 AM - 8:00 PM | Sun: By Appointment"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
              <Input
                id="consultationFee"
                name="consultationFee"
                type="number"
                defaultValue={initial.consultationFee}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Contact Settings
        </Button>
      </div>
    </form>
  );
}