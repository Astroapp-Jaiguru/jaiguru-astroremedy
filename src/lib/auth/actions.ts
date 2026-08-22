"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/dal";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
  type ChangePasswordState,
  type ForgotPasswordState,
  type ResetPasswordState,
  type SigninState,
  type SignupState,
} from "@/lib/auth/validation";

const SALT_ROUNDS = 10;

async function setSessionForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) throw new Error("User not found after authentication.");
  await createSession({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export async function signinAction(
  _state: SigninState,
  formData: FormData
): Promise<SigninState> {
  const parsed = signinSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email, password } = parsed.data;
  const requiredRole = formData.get("requiredRole");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { error: "Invalid email or password." };
  }

  const valid = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!valid) {
    return { error: "Invalid email or password." };
  }

  if (
    typeof requiredRole === "string" &&
    ["VENDOR", "BUYER", "SUPPLIER"].includes(requiredRole) &&
    user.role !== requiredRole
  ) {
    return { error: "This account is not authorized for this sign-in page." };
  }

  await setSessionForUser(user.id);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const callbackUrl = formData.get("callbackUrl");
  const target =
    typeof callbackUrl === "string" &&
    callbackUrl.startsWith("/") &&
    !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/admin";

  redirect(target);
}

export async function signupAction(
  _state: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
    setupKey: formData.get("setupKey") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { name, email, phone, password, setupKey } = parsed.data;

  const setupKeyEnv = process.env.ADMIN_SETUP_KEY;
  if (setupKeyEnv && setupKey !== setupKeyEnv) {
    return { error: "Invalid admin setup key." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  });

  await setSessionForUser(user.id);
  redirect("/admin");
}

export async function signoutAction(): Promise<void> {
  await deleteSession();
  redirect("/admin/signin");
}

export async function changePasswordAction(
  _state: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/signin");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) return { error: "User not found." };

  const valid = dbUser.passwordHash ? await bcrypt.compare(currentPassword, dbUser.passwordHash) : false;
  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function forgotPasswordAction(
  _state: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Do not reveal whether the account exists.
    return {
      message:
        "If an account exists for this email, a password reset link has been created.",
    };
  }

  const token = randomBytes(32).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/admin/reset-password?token=${token}`;

  // No mail service configured yet - log the link and return it in dev.
  // TODO(Phase 9+): send the link via email (Resend/SES) when owner provides it.
  console.log(`[JAIGURU] Password reset link for ${email}: ${resetUrl}`);

  return {
    message:
      process.env.NODE_ENV === "development"
        ? `Reset link created: ${resetUrl}`
        : "If an account exists for this email, a password reset link has been created.",
  };
}

export async function resetPasswordAction(
  _state: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { token, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { passwordResetToken: token },
  });
  if (!user || !user.passwordResetExpires) {
    return { error: "This reset link is invalid or has already been used." };
  }
  if (user.passwordResetExpires < new Date()) {
    return { error: "This reset link has expired. Please request a new one." };
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { success: true, message: "Password updated. You can now sign in." };
}
