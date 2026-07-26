import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { rawDb, isRawDbAvailable } from "@/lib/dbClient";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        console.log("[Auth] REJECTED: No email");
        return false;
      }

      // SECURITY: Only allow @gmail.com — verified server-side
      if (!user.email.endsWith("@gmail.com")) {
        console.log("[Auth] REJECTED non-Gmail:", user.email);
        return `/predicciones?error=not_gmail`;
      }

      // BANNED USER CHECK:
      // Look up the user in the DB; if their `banned` flag is true, reject
      // the sign-in and redirect to the home page with ?error=banned. This
      // is the primary enforcement: if they can't log in, they can't use
      // the site. (If the DB is unreachable, we fail open — let them in —
      // because NextAuth's own account-linking still validates the Google
      // token and we don't want a DB outage to lock out everyone.)
      if (isRawDbAvailable()) {
        try {
          const normalizedEmail = user.email.trim().toLowerCase();
          const dbUser = await rawDb.user.findUniqueByEmail(normalizedEmail);
          if (dbUser?.banned) {
            console.log(
              "[Auth] REJECTED banned user:",
              dbUser.email,
              "— reason:",
              dbUser.bannedReason || "(none)"
            );
            // Returning a string URL tells NextAuth to redirect there instead
            // of completing the sign-in. We send them to the home page with
            // an error flag so the UI can explain why login failed.
            return `/?error=banned`;
          }
        } catch (err) {
          // Don't block login on a transient DB error — just log it.
          console.warn("[Auth] Banned-check DB error (failing open):", err);
        }
      }

      console.log("[Auth] ACCEPTED:", user.email);

      // ─── Auto-register the user in the DB ───
      // This ensures EVERY login (from catalog or /predicciones) creates
      // the user in the DB, so they appear in the admin panel and can
      // sync cart/predictions/discounts across devices.
      // We do this here in the signIn callback (server-side) instead of
      // relying on a client-side redirect page, which was unreliable.
      if (isRawDbAvailable()) {
        try {
          const normalizedEmail = user.email.trim().toLowerCase();
          const existing = await rawDb.user.findUniqueByEmail(normalizedEmail);
          if (!existing) {
            console.log("[Auth] Auto-registering new user:", normalizedEmail);
            await rawDb.user.create({
              email: normalizedEmail,
              name: user.name || normalizedEmail.split("@")[0],
              image: user.image || null,
              emailVerified: new Date(),
              authProvider: "google",
            });
            console.log("[Auth] ✅ User registered:", normalizedEmail);
          } else {
            // Update last login info
            await rawDb.user.update(existing.id, {
              emailVerified: new Date(),
              name: user.name || existing.name,
              image: user.image || existing.image,
            });
          }
        } catch (err) {
          // Don't block login if registration fails (e.g., duplicate email)
          console.warn("[Auth] Auto-register error (non-fatal):", err);
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { email?: string }).email = token.email as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Respect the callbackUrl passed to signIn().
      // If it's a relative URL, prepend baseUrl.
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If it's a same-origin absolute URL, allow it
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // Invalid URL
      }
      // Default: go to the catalog
      return baseUrl;
    },
  },
  pages: {
    signIn: "/predicciones",
    error: "/predicciones",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
