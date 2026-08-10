"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setContactMessageReadAction } from "@/lib/admin/contact/actions";

/**
 * Read / Unread toggle for contact messages (list view).
 */
export function ReadToggleButton({
  id,
  read,
}: {
  id: string;
  read: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handle() {
    startTransition(async () => {
      const result = await setContactMessageReadAction(id, !read);
      if (result.ok) router.refresh();
    });
  }

  return (
    <Button
      variant={read ? "outline" : "default"}
      size="sm"
      disabled={pending}
      onClick={handle}
      type="button"
    >
      {read ? (
        <Mail className="mr-1 h-3.5 w-3.5" />
      ) : (
        <MailOpen className="mr-1 h-3.5 w-3.5" />
      )}
      {read ? "Mark Unread" : "Mark Read"}
    </Button>
  );
}