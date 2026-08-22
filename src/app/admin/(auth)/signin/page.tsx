import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SigninForm } from "@/components/auth/signin-form";
import { HardRefreshHint } from "@/components/auth/hard-refresh-hint";

export default function AdminSigninPage() {
  return (
    <AuthShell
      title="Welcome Back"
      description="Sign in to manage the JAIGURU ASTROREMEDY website."
    >
      <Suspense>
        <SigninForm />
      </Suspense>
      <HardRefreshHint />
    </AuthShell>
  );
}