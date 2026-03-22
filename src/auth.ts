import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail, verifyPassword, saveUser } from "@/lib/user-db";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = findUserByEmail(credentials.email as string);
        if (!user || !user.password) return null;

        const isValid = await verifyPassword(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const existingUser = findUserByEmail(user.email as string);
        if (!existingUser) {
          // Persist the social user to our local DB
          saveUser({
            id: user.id || Math.random().toString(36).substring(7),
            name: user.name || "Social User",
            email: user.email as string,
            image: user.image || undefined,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = findUserByEmail(session.user.email as string);
        if (dbUser) {
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
    ...authConfig.callbacks,
  },
});
