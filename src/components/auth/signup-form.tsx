"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signupAction } from "@/lib/auth/actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          placeholder="Arup Shastri"
          required
        />
      </div>
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
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98361 25780"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="setupKey">Admin Setup Key</Label>
        <Input
          id="setupKey"
          name="setupKey"
          type="password"
          autoComplete="off"
          placeholder="Required when configured"
        />
        <p className="text-xs text-muted-foreground">
          The setup key restricts public admin account creation. Ask the site
          owner for the key.
        </p>
      </div>
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Admin Account
      </Button>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/admin/signin" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
