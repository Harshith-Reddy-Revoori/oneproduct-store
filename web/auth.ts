// web/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },

  providers: [
    // Admin password login (kept as-is)
    CredentialsProvider({
      name: "Admin",
      credentials: { password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const ok =
          credentials?.password &&
          process.env.ADMIN_PASSWORD &&
          credentials.password === process.env.ADMIN_PASSWORD;
        if (!ok) return null;
        return {
          id: "admin",
          name: "Store Admin",
          email: process.env.ADMIN_EMAIL || "admin@example.com",
          role: "admin",
        } as any;
      },
    }),

    // Customer email magic link
    EmailProvider({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        // identifier is the user's email
        // url is the magic sign-in link
        await resend.emails.send({
          from: (provider as any).from,
          to: identifier,
          subject: "Your sign-in link",
          html: `
            <div style="font-family:Arial,sans-serif">
              <h2>Sign in to One-Product Store</h2>
              <p>Click the button to sign in:</p>
              <p><a href="${url}" style="display:inline-block;padding:10px 16px;border:1px solid #000;border-radius:8px;text-decoration:none;">Sign in</a></p>
              <p style="font-size:12px;color:#666">If you didn't request this, you can ignore this email.</p>
            </div>
          `,
        });
      },
    }),
  ],

  pages: {
    verifyRequest: "/verify-request", // nice confirmation page after they submit email
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user && (user as any).role) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (token?.role) (session as any).role = token.role;
      return session;
    },
  },
};
