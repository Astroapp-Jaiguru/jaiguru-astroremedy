import { z } from "zod";

export const signinSchema = z.object({
  email: z.email("Please enter a valid email address.").trim(),
  password: z.string().min(1, "Password is required."),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").trim(),
  email: z.email("Please enter a valid email address.").trim(),
  phone: z.string().trim().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be at most 72 characters."),
  setupKey: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .max(72, "New password must be at most 72 characters."),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address.").trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters.")
    .max(72, "New password must be at most 72 characters."),
});

export type SigninState =
  | { error?: string; message?: string }
  | undefined;

export type SignupState =
  | { error?: string; message?: string; success?: boolean }
  | undefined;

export type ChangePasswordState =
  | { error?: string; success?: boolean }
  | undefined;

export type ForgotPasswordState =
  | { error?: string; message?: string }
  | undefined;

export type ResetPasswordState =
  | { error?: string; message?: string; success?: boolean }
  | undefined;
