import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/generated/prisma/client";

export const authOptions: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (existing) {
        if (!existing.isActive) return false;
        await prisma.user.update({
          where: { id: existing.id },
          data: { name: user.name ?? existing.name, avatarUrl: user.image ?? existing.avatarUrl, lastLoginAt: new Date() },
        });
        return true;
      }
      await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: { name: user.name ?? user.email!.split("@")[0], email: user.email!, avatarUrl: user.image, role: "CUSTOMER" },
        });
        await tx.organization.create({
          data: { name: `${created.name}'s Organization`, type: "BUYER", ownerId: created.id },
        });
      });
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const user = await prisma.user.findUnique({ where: { email: token.email }, select: { id: true, name: true, email: true, role: true } });
        if (user) Object.assign(token, { id: user.id, name: user.name, email: user.email, role: user.role });
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? "");
        session.user.name = String(token.name ?? session.user.name ?? "");
        session.user.email = String(token.email ?? session.user.email ?? "");
        session.user.role = (token.role as Role) ?? "CUSTOMER";
      }
      return session;
    },
  },
};

const { handlers } = NextAuth(authOptions);
export const handler = handlers;
export const GET = handlers.GET;
export const POST = handlers.POST;
