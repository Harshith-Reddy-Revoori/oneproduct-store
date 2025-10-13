// web/auth.ts
import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type AdminUser = User & { role: "admin" };

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email || "").toLowerCase().trim();
        const password = credentials?.password || "";

        const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || "";

        if (!email || !password) return null;
        if (email === adminEmail && password === adminPassword) {
          const user: AdminUser = {
            id: "admin",
            name: "Admin",
            email: adminEmail,
            role: "admin",
          };
          return user;
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      const withRole = user as Partial<{ role: string }> | null;
      if (withRole?.role) token.role = withRole.role;
      return token;
    },
    async session({ session, token }) {
      // Attach role onto session for easy checks in server components
      (session as unknown as { role?: string }).role =
        (token as unknown as { role?: string }).role || "user";
      return session;
    },
  },
  pages: { signIn: "/login" },
};
