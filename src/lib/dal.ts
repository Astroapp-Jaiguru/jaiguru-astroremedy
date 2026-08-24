import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionPayload } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

/**
 * Returns the currently authenticated user or null.
 * Memoized per request via React cache.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const session = await getSessionPayload();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) return null;
  return user;
});

/**
 * Guards an admin page/server action. Redirects to sign-in when not
 * authenticated and to a 403 when authenticated but not an admin.
 */
export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/admin/signin?callbackUrl=/admin");
  }
  if (user.role !== "ADMIN" && user.role !== "EDITOR") {
    redirect("/admin/unauthorized");
  }
  return user;
}

async function requireRole(role: "VENDOR" | "BUYER" | "SUPPLIER") {
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/signin?callbackUrl=/${role.toLowerCase()}`);
  if (user.role !== role) redirect("/admin/unauthorized");
  return user;
}

export async function requireVendor(): Promise<AuthUser> {
  return requireRole("VENDOR");
}

export async function requireBuyer(): Promise<AuthUser> {
  return requireRole("BUYER");
}

export async function requireSupplier(): Promise<AuthUser> {
  return requireRole("SUPPLIER");
}

/** Optimistic check used by the proxy for pre-filtering /admin routes. */
export async function hasSessionCookie(): Promise<boolean> {
  const session = await getSessionPayload();
  return session !== null;
}
