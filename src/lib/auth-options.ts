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

      const existing = await prisma.$queryRaw`
        SELECT id FROM "User" WHERE email = ${user.email} LIMIT 1
      `;

      if ((existing as any[]).length === 0) {
        const created = await prisma.$queryRaw`
          INSERT INTO "User" (name, email, passwordhash, role, avatarurl, isactive, createdat, updatedat)
          VALUES (${user.name ?? user.email.split("@")[0]}, ${user.email}, 'oauth-google', 'CUSTOMER', ${user.image}, true, NOW(), NOW())
          RETURNING id
        `;
        user.id = (created as any)[0].id;
      } else {
        user.id = (existing as any)[0].id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      if (token.id) {
        const record = await prisma.$queryRaw`
          SELECT role, name, email FROM "User" WHERE id = ${String(token.id)} LIMIT 1
        `;
        if ((record as any[]).length > 0) {
          token.role = (record as any)[0].role;
          token.name = (record as any)[0].name;
          token.email = (record as any)[0].email;
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
