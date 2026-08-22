"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Confirmed delete button for admin lists (products / services).
 * Submits the record id to the given server action, then refreshes.
 */
export function DeleteButton({
  id,
  action,
  label = "Delete",
}: {
  id: string;
  action: (id: string) => Promise<{ ok: boolean }>;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(recordId: string) {
    if (!window.confirm(`Are you sure you want to delete this ${label.toLowerCase()}?`)) return;
    startTransition(async () => {
      const result = await action(recordId);
      if (result.ok) router.refresh();
      else window.alert("Could not delete. Please try again.");
    });
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() => handleDelete(id)}
      type="button"
    >
      <Trash2 className="mr-1 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}