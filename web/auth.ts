// web/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../web/lib/prisma"; 
import { verifyPassword } from "@/lib/hash";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 1) Admin — env-based
    CredentialsProvider({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toLowerCase().trim();
        const password = credentials?.password ?? "";

        const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD ?? "";

        if (!email || !password) return null;
        if (email === adminEmail && password === adminPassword) {
          // Return a plain object; we'll persist role via JWT callback
          return {
            id: "admin",
            name: "Admin",
            email: adminEmail,
            role: "admin",
          } as any;
        }
        return null;
      },
    }),

    // 2) Customer — email+password from DB
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email ?? "").toLowerCase().trim();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        // Return minimal shape; use undefined for optional fields to please TS
        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          image: (user as any).image ?? undefined,
          role: (user as any).role ?? "customer",
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as any).role) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).role = (token as any).role ?? "customer";
      return session;
    },
  },

  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
