import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { errors } from "jose";
import { cookies } from "next/headers";
import { decryptEmailCode, emailAuthCookies } from "@/lib/email-auth";
import { checkLoginAccess, hasLoginAccess } from "@/lib/login-access";
import { DEFAULT_LANG, LOCALE_COOKIE, isSupportedLang, withLangPrefix } from "@/lib/i18n/routing";

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

async function getLocalizedSignInPath(errorCode: string) {
  const cookieLang = (await cookies()).get(LOCALE_COOKIE)?.value;
  const lang = cookieLang && isSupportedLang(cookieLang) ? cookieLang : DEFAULT_LANG;
  return `${withLangPrefix("/sign-in", lang)}?error=${errorCode}`;
}

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
        if (!code) {
          console.warn("Email-code sign-in rejected: missing code.");
          return null;
        }

        const cookieStore = await cookies();
        const codeToken = cookieStore.get(emailAuthCookies.otp)?.value;
        if (!codeToken) {
          console.warn("Email-code sign-in rejected: missing verification cookie. Request a new code on the same host and protocol.");
          return null;
        }

        let stored: Awaited<ReturnType<typeof decryptEmailCode>>;
        try {
          stored = await decryptEmailCode(codeToken);
        } catch (error) {
          if (error instanceof errors.JOSEError) {
            console.warn("Email-code sign-in rejected: verification token validation failed.", error.code);
            return null;
          }
          throw error;
        }

        if (stored.code !== code) {
          console.warn("Email-code sign-in rejected: code mismatch. Use the most recently requested code.");
          return null;
        }

        if (!(await hasLoginAccess(stored.email))) {
          console.warn("Email-code sign-in rejected: login access check failed.");
          return null;
        }

        cookieStore.delete(emailAuthCookies.otp);
        return {
          id: stored.email,
          email: stored.email,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const access = await checkLoginAccess(user.email);
      if (access.reason === "database-unavailable") {
        return getLocalizedSignInPath("auth-unavailable");
      }

      return access.allowed || (await getLocalizedSignInPath("unauthorized-email"));
    },
  },
  session: { strategy: "jwt" },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV !== "production",
});
