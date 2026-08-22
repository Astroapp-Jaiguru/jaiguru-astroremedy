"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signoutAction } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form action={signoutAction}>
      <Button variant="outline" size="sm" type="submit">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </form>
  );
}
