import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { decryptEmailCode, emailAuthCookies } from "@/lib/email-auth";
import { hasLoginAccess } from "@/lib/login-access";

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(googleConfigured ? [Google] : []),
    Credentials({
      id: "email-code",
      name: "Email Code",
      credentials: {
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        const code =
          typeof credentials?.code === "string" ? credentials.code.trim() : "";
        if (!code) return null;

        const cookieStore = await cookies();
        const codeToken = cookieStore.get(emailAuthCookies.otp)?.value;
        if (!codeToken) return null;

        try {
          const stored = await decryptEmailCode(codeToken);
          if (
            stored.code === code &&
            (await hasLoginAccess(stored.email))
          ) {
            cookieStore.delete(emailAuthCookies.otp);
            return {
              id: stored.email,
              email: stored.email,
            };
          }
        } catch {
          return null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return (
        (await hasLoginAccess(user.email)) ||
        "/sign-in?error=unauthorized-email"
      );
    },
  },
  session: { strategy: "jwt" },
  trustHost: true,
});
