import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SigninForm } from "@/components/auth/signin-form";

export default function VendorSigninPage() {
  return (
    <AuthShell
      title="Vendor Sign In"
      description="Sign in to manage your approved vendor account."
    >
      <Suspense>
        <SigninForm defaultCallbackUrl="/vendor/dashboard" requiredRole="VENDOR" />
      </Suspense>
    </AuthShell>
  );
}
