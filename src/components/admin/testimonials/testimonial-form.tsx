"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createTestimonialAction,
  updateTestimonialAction,
} from "@/lib/admin/testimonials/actions";

export interface TestimonialFormValues {
  id?: string;
  customerName: string;
  photoUrl: string;
  rating: string;
  text: string;
  serviceRef: string;
  location: string;
  isApproved: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

export function TestimonialForm({
  testimonial,
}: {
  testimonial?: TestimonialFormValues;
}) {
  const action = testimonial?.id
    ? updateTestimonialAction
    : createTestimonialAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(testimonial?.id);

  return (
    <form action={formAction} className="space-y-6">
      {testimonial?.id ? (
        <input type="hidden" name="id" value={testimonial.id} />
      ) : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input id="customerName" name="customerName" defaultValue={testimonial?.customerName ?? ""} required placeholder="e.g. Ramesh Agarwal" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" name="location" defaultValue={testimonial?.location ?? ""} placeholder="e.g. Kolkata" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (1-5)</Label>
          <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={testimonial?.rating ?? "5"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={testimonial?.sortOrder ?? "0"} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="serviceRef">Related Service / Product</Label>
          <Input id="serviceRef" name="serviceRef" defaultValue={testimonial?.serviceRef ?? ""} placeholder="e.g. Astrology Consultation" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="photoUrl">Photo URL (optional)</Label>
          <Input id="photoUrl" name="photoUrl" defaultValue={testimonial?.photoUrl ?? ""} placeholder="https://... (leave empty to show initial avatar)" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="text">Testimonial Text *</Label>
          <Textarea id="text" name="text" rows={4} defaultValue={testimonial?.text ?? ""} required placeholder="What the client says about their experience" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isApproved" defaultChecked={testimonial?.isApproved ?? false} className="size-4 accent-[#4C1D95]" />
          Approved (visible on site)
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={testimonial?.isFeatured ?? false} className="size-4 accent-[#4C1D95]" />
          Featured (homepage)
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Testimonial" : "Add Testimonial"}
      </Button>
    </form>
  );
}