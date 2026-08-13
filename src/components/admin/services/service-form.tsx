"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createServiceAction, updateServiceAction } from "@/lib/admin/services/actions";

export interface ServiceFormValues {
  id?: string;
  name: string;
  slug: string;
  categoryId: string;
  mode: string;
  duration: string;
  slotDuration: string;
  price: string;
  priceLabel: string;
  competitorPrice: string;
  priceFloor: string;
  priceSource: string;
  imageUrl: string;
  shortDescription: string;
  longDescription: string;
  benefits: string[];
  syllabus: string[];
  serviceArea: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: string;
}

export function ServiceForm({
  categories,
  service,
}: {
  categories: { id: string; name: string }[];
  service?: ServiceFormValues;
}) {
  const action = service?.id ? updateServiceAction : createServiceAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(service?.id);

  return (
    <form action={formAction} className="space-y-6">
      {service?.id ? <input type="hidden" name="id" value={service.id} /> : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.success && (
        <Alert>
          <AlertDescription>Service saved successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">Service Name *</Label>
          <Input id="name" name="name" defaultValue={service?.name ?? ""} required placeholder="e.g. Astrology Course - Online Beginner" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={service?.slug ?? ""} placeholder="Leave empty to auto-generate" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={service?.categoryId ?? ""}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="mode">Mode</Label>
          <select
            id="mode"
            name="mode"
            defaultValue={service?.mode ?? "ONLINE"}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HOME_SERVICE">Home Service</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" name="duration" defaultValue={service?.duration ?? ""} placeholder="e.g. 8 sessions / 1 session" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slotDuration">Slot Duration</Label>
          <select
            id="slotDuration"
            name="slotDuration"
            defaultValue={service?.slotDuration ?? "60"}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="30">30 mins</option>
            <option value="45">45 mins</option>
            <option value="60">1 hour</option>
            <option value="90">1.5 hours</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (₹)</Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={service?.price ?? ""} placeholder="1999" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceLabel">Price Label (override)</Label>
          <Input id="priceLabel" name="priceLabel" defaultValue={service?.priceLabel ?? ""} placeholder="e.g. ₹1,499/session" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="competitorPrice">Competitor Price (₹)</Label>
          <Input id="competitorPrice" name="competitorPrice" type="number" step="0.01" min="0" defaultValue={service?.competitorPrice ?? ""} placeholder="Refreshed weekly by the engine" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceFloor">Price Floor (₹, optional)</Label>
          <Input id="priceFloor" name="priceFloor" type="number" step="0.01" min="0" defaultValue={service?.priceFloor ?? ""} placeholder="Never sell below this" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priceSource">Price Source</Label>
          <select
            id="priceSource"
            name="priceSource"
            defaultValue={service?.priceSource ?? "manual"}
            className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <option value="manual">Manual</option>
            <option value="competitor">Competitor-priced</option>
          </select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="imageUrl">Service Image URL</Label>
          <Input id="imageUrl" name="imageUrl" defaultValue={service?.imageUrl ?? ""} placeholder="https://..." />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea id="shortDescription" name="shortDescription" rows={2} defaultValue={service?.shortDescription ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="longDescription">Long Description</Label>
          <Textarea id="longDescription" name="longDescription" rows={4} defaultValue={service?.longDescription ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="benefits">Benefits (one per line or comma)</Label>
          <Textarea id="benefits" name="benefits" rows={3} defaultValue={service?.benefits?.join("\n") ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="syllabus">Syllabus (one per line)</Label>
          <Textarea id="syllabus" name="syllabus" rows={3} defaultValue={service?.syllabus?.join("\n") ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceArea">Service Area</Label>
          <Input id="serviceArea" name="serviceArea" defaultValue={service?.serviceArea ?? ""} placeholder="e.g. Kolkata & Online" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={service?.sortOrder ?? "0"} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={service?.isFeatured ?? false} className="size-4 accent-[#4C1D95]" />
          Featured
        </label>
        <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
          <input type="checkbox" name="isActive" defaultChecked={service?.isActive ?? true} className="size-4 accent-[#4C1D95]" />
          Active
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Service" : "Create Service"}
      </Button>
    </form>
  );
}