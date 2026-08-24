import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export default function AdminSignupPage() {
  return (
    <AuthShell
      title="Create Admin Account"
      description="Register a new administrator for the CMS."
    >
      <SignupForm />
    </AuthShell>
  );
}
