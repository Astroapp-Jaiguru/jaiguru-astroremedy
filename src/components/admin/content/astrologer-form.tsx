"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/image-uploader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { saveAstrologerAction } from "@/lib/admin/content/actions";
import type { AstrologerSettings } from "@/lib/admin/content/actions";

export function AstrologerForm({ initial }: { initial: AstrologerSettings }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveAstrologerAction,
    undefined
  );
  const handledRef = useRef(false);
  const [photoUrl, setPhotoUrl] = useState(initial.photoUrl);

  useEffect(() => {
    if (state?.success && !handledRef.current) {
      handledRef.current = true;
      toast.success("Astrologer profile saved");
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
            <CardTitle className="text-lg">Identity</CardTitle>
            <CardDescription>
              Shown on the About page and hero metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initial.name}
                placeholder="Arup Shastri (Jai Guru)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={initial.title}
                placeholder="Vedic Astrologer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={initial.subtitle}
                placeholder="A Spiritual Master, True Healer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                defaultValue={initial.yearsExperience}
                placeholder="20+"
              />
              <p className="text-xs text-muted-foreground">
                Shown in the hero and About page, e.g. &quot;20+ Years of
                Vedic Experience&quot;.
              </p>
            </div>
            <ImageUploader
              name="photoUrl"
              value={photoUrl}
              onChange={setPhotoUrl}
              label="Profile Photo Image"
              hint="Square photo - rendered round in the header and hero."
              aspect="circle"
              previewClassName="size-24 rounded-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bio & Specialties</CardTitle>
            <CardDescription>
              Bio appears at the top of the About page story. Tags are
              comma-separated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About Text</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={5}
                defaultValue={initial.bio}
                placeholder="One or two paragraphs introducing the astrologer..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expertise">Expertise (comma separated)</Label>
              <Textarea
                id="expertise"
                name="expertise"
                rows={2}
                defaultValue={initial.expertise.join(", ")}
                placeholder="Vedic Astrology, Vastu, Numerology, Yoga"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties (comma separated)</Label>
              <Textarea
                id="specialties"
                name="specialties"
                rows={3}
                defaultValue={initial.specialties.join(", ")}
                placeholder="Astrology, Medical Astrology, Mental Peace..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={pending} className="min-w-[130px]">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Profile
        </Button>
      </div>
    </form>
  );
}