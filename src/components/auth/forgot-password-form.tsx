"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { forgotPasswordAction } from "@/lib/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    undefined
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@jaiguruastroremedy.com"
          required
        />
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      {state?.message && (
        <Alert>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Send Reset Link
      </Button>
      <div className="text-center text-sm">
        Remembered it?{" "}
        <Link href="/admin/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
