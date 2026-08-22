"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Downloads the print-ready delivery slip PDF for an order.
 * Calls the admin-protected /api/orders/[id]/slip endpoint and saves
 * the returned PDF as a file (browser cookies are sent on same-origin
 * requests, so the session guard passes).
 */
export function SlipDownloadButton({
  id,
  reference,
}: {
  id: string;
  reference: string;
}) {
  const [pending, setPending] = useState(false);

  const download = async () => {
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch(`/api/orders/${id}/slip`, {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `delivery-slip-${reference.replace(/[^A-Za-z0-9-]/g, "")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Delivery slip downloaded");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not generate the delivery slip."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <Button type="button" onClick={download} disabled={pending}>
      {pending ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="mr-1.5 h-4 w-4" />
      )}
      Generate Delivery Slip
    </Button>
  );
}