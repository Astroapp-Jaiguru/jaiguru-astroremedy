import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email) return true;

      const existing = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });

      if (!existing) {
        const created = await prisma.user.create({
          data: {
            name: user.name ?? user.email.split("@")[0],
            email: user.email,
            passwordHash: "oauth-google",
            role: "CUSTOMER",
            avatarUrl: user.image,
            organizations: {
              create: {
                name: `${user.name ?? "Customer"}'s Organization`,
                type: "BUYER",
              },
            },
          },
        });
        user.id = created.id;
      } else {
        user.id = existing.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (token.id) {
        const record = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { role: true, name: true, email: true },
        });
        if (record) {
          token.role = record.role;
          token.name = record.name;
          token.email = record.email;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
      }
      return session;
    },
  },
};
