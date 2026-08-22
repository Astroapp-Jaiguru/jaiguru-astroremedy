"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createConsultationTopicAction,
  updateConsultationTopicAction,
} from "@/lib/admin/consultation-topics/actions";
import { TOPIC_ICONS } from "@/lib/consultation-topics-data";

export interface ConsultationTopicFormValues {
  id?: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  iconKey: string;
  fee: string;
  homeFee: string;
  durationMinutes: string;
  keywords: string;
  benefits: string;
  isActive: boolean;
  sortOrder: string;
}

export function ConsultationTopicForm({
  topic,
}: {
  topic?: ConsultationTopicFormValues;
}) {
  const action = topic?.id
    ? updateConsultationTopicAction
    : createConsultationTopicAction;
  const [state, formAction, pending] = useActionState(action, undefined);
  const isEdit = Boolean(topic?.id);
  const iconKeys = Object.keys(TOPIC_ICONS);

  return (
    <form action={formAction} className="space-y-6">
      {topic?.id ? (
        <input type="hidden" name="id" value={topic.id} />
      ) : null}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" defaultValue={topic?.title ?? ""} required placeholder="e.g. Astrology Consultation" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" name="slug" defaultValue={topic?.slug ?? ""} required placeholder="e.g. astrology" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="iconKey">Icon</Label>
          <select
            id="iconKey"
            name="iconKey"
            defaultValue={topic?.iconKey ?? "star"}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {iconKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input id="sortOrder" name="sortOrder" type="number" defaultValue={topic?.sortOrder ?? "0"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fee">Online Fee</Label>
          <Input id="fee" name="fee" defaultValue={topic?.fee ?? "₹700"} placeholder="e.g. ₹700" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="homeFee">Home Visit Fee</Label>
          <Input id="homeFee" name="homeFee" defaultValue={topic?.homeFee ?? "₹1,500"} placeholder="e.g. ₹1,500" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duration (minutes)</Label>
          <Input id="durationMinutes" name="durationMinutes" type="number" min="5" max="180" defaultValue={topic?.durationMinutes ?? "30"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="keywords">Keywords (one per line)</Label>
          <Textarea id="keywords" name="keywords" rows={3} defaultValue={topic?.keywords ?? ""} placeholder="gemstone&#10;rudraksha&#10;kundli" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Short Description *</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={topic?.description ?? ""} required placeholder="Shown on cards and the /consultations listing" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="longDescription">Long Description *</Label>
          <Textarea id="longDescription" name="longDescription" rows={5} defaultValue={topic?.longDescription ?? ""} required placeholder="Full description shown on the dedicated consultation page" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="benefits">Benefits (one per line)</Label>
          <Textarea id="benefits" name="benefits" rows={5} defaultValue={topic?.benefits ?? ""} placeholder="Full birth chart (kundli) reading&#10;Career, health & finance predictions" />
        </div>
      </div>

      <label className="flex items-center gap-2 rounded-lg border p-3 text-sm">
        <input type="checkbox" name="isActive" defaultChecked={topic?.isActive ?? true} className="size-4 accent-[#4C1D95]" />
        Active (visible on site)
      </label>

      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? "Update Topic" : "Add Topic"}
      </Button>
    </form>
  );
}