import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function AdminForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot Password"
      description="Enter your email to receive a password reset link."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
