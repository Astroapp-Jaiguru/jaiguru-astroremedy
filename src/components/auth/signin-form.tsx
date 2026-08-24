"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signinAction } from "@/lib/auth/actions";

export function SigninForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const [state, formAction, pending] = useActionState(signinAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
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
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
      <div className="flex items-center justify-between text-sm">
        <Link
          href="/admin/forgot-password"
          className="text-muted-foreground hover:text-foreground"
        >
          Forgot password?
        </Link>
        <Link href="/admin/signup" className="text-primary hover:underline">
          Create account
        </Link>
      </div>
    </form>
  );
}
