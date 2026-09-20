/**
 * Auth.js v5 configuration backed by Neon + Drizzle.
 *
 * Credentials (email + bcrypt password) is the only provider, which keeps the
 * deployment free of third-party OAuth setup. The Drizzle adapter still stores
 * users/accounts/sessions so an OAuth provider can be added later without a
 * migration.
 */
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";
import type { AppRole } from "@/lib/db/schema";
import { requireEmailVerification } from "@/lib/auth/policy";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: AppRole;
      company: string | null;
      locale: string;
    } & DefaultSession["user"];
  }
  interface User {
    role?: AppRole;
    company?: string | null;
    locale?: string;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: isDatabaseConfigured
    ? DrizzleAdapter(db, {
        usersTable: users,
        accountsTable: accounts,
        sessionsTable: sessions,
        verificationTokensTable: verificationTokens,
      })
    : undefined,
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/en/login", error: "/en/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        if (!isDatabaseConfigured) return null;
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const [record] = await db
          .select()
          .from(users)
          .where(eq(users.email, parsed.data.email.toLowerCase()))
          .limit(1);

        if (!record?.passwordHash) return null;
        const ok = await bcrypt.compare(parsed.data.password, record.passwordHash);
        if (!ok) return null;
        // Second gate: `loginAction` already reports this with a resend button,
        // but the provider must refuse on its own so no other entry point can
        // mint a session for an unconfirmed address.
        if (requireEmailVerification && !record.emailVerified) return null;

        return {
          id: record.id,
          email: record.email,
          name: record.name,
          image: record.image,
          role: record.role,
          company: record.company,
          locale: record.locale,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role ?? "client";
        token.company = user.company ?? null;
        token.locale = user.locale ?? "ar";
      }
      if (trigger === "update" && session?.locale) {
        token.locale = session.locale as string;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? token.sub ?? "";
        session.user.role = (token.role as AppRole) ?? "client";
        session.user.company = (token.company as string | null) ?? null;
        session.user.locale = (token.locale as string) ?? "ar";
      }
      return session;
    },
  },
});

