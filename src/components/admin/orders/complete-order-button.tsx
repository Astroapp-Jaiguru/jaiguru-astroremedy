"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markOrderCompletedAction } from "@/lib/admin/orders/actions";

/**
 * One-click "Mark as Completed" for the orders list.
 */
export function CompleteOrderButton({
  id,
  label = "Mark Completed",
}: {
  id: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const result = await markOrderCompletedAction(id);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={handle}
      type="button"
      className="border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300"
    >
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      {label}
    </Button>
  );
}