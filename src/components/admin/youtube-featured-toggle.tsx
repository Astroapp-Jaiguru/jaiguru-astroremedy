"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleYoutubeFeaturedAction } from "@/lib/admin/youtube/actions";

/**
 * Featured toggle for admin YouTube gallery. Marks the 4 videos shown on the
 * homepage preview band; only featured + active videos appear there.
 */
export function YoutubeFeaturedToggle({
  id,
  isFeatured,
}: {
  id: string;
  isFeatured: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={isFeatured ? "default" : "outline"}
      size="sm"
      disabled={pending}
      aria-pressed={isFeatured}
      onClick={() =>
        startTransition(async () => {
          await toggleYoutubeFeaturedAction(id, !isFeatured);
        })
      }
    >
      <Star
        className={`h-4 w-4 ${isFeatured ? "fill-current" : ""}`}
      />
      {isFeatured ? "Featured" : "Feature"}
    </Button>
  );
}