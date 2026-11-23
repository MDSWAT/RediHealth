import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { errors } from "jose";
import { cookies } from "next/headers";
import { decryptEmailCode, emailAuthCookies, isMatchingOneTimeCode } from "@/lib/email-auth";
import { verifyAdminPasswordCredentials } from "@/lib/admin-auth";
import { checkLoginAccess, hasLoginAccess } from "@/lib/login-access";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { DEFAULT_LANG, LOCALE_COOKIE, isSupportedLang, withLangPrefix } from "@/lib/i18n/routing";
import { verifyRecaptcha } from "@/lib/security/recaptcha";
import { AUTH_BASE_PATH } from "@/lib/auth-actions";
import { normalizeOrigin } from "@/lib/site-url";

// Auth.js calls new URL(AUTH_URL) on every request, so a value typed without the scheme
// ("redi.healthcare") would break every sign-in. Keep only a valid origin, or drop it so
// Auth.js falls back to the request's own address.
for (const key of ["AUTH_URL", "NEXTAUTH_URL"] as const) {
  if (process.env[key] !== undefined) {
    const origin = normalizeOrigin(process.env[key]);
    if (origin) process.env[key] = origin;
    else delete process.env[key];
  }
}

const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
);

async function getLocalizedSignInPath(errorCode: string) {
  const cookieLang = (await cookies()).get(LOCALE_COOKIE)?.value;
  const lang = cookieLang && isSupportedLang(cookieLang) ? cookieLang : DEFAULT_LANG;
  return `${withLangPrefix("/sign-in", lang)}?error=${errorCode}`;
}

const devFallbackSecret =
  process.env.NODE_ENV !== "production"
    ? "redihealth-local-dev-only-auth-secret-32chars"
    : undefined;

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || devFallbackSecret,
  providers: [
    ...(googleConfigured ? [Google] : []),
    Credentials({
      id: "email-code",
      name: "Email Code",
      credentials: {
        code: { label: "Code", type: "text" },
        captchaToken: { label: "Bot verification", type: "text" },
      },
      async authorize(credentials, request) {
        const ipLimit = await checkRateLimit(`email-code-verify:ip:${getClientIp(request)}`, {
          limit: 12,
          windowMs: 60_000,
        });
        if (!ipLimit.allowed) {
          console.warn("Email-code sign-in rejected: too many attempts from this client.");
          return null;
        }

        if (await verifyRecaptcha(credentials?.captchaToken, "verify_code")) {
          console.warn("Email-code sign-in rejected: bot verification failed.");
          return null;
        }

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

        // Each issued code only gets a handful of guesses, however many clients replay the cookie.
        const tokenLimit = await checkRateLimit(`email-code-verify:token:${codeToken}`, {
          limit: 6,
          windowMs: 10 * 60_000,
        });
        if (!tokenLimit.allowed) {
          console.warn("Email-code sign-in rejected: too many attempts for this code.");
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

        if (!isMatchingOneTimeCode(stored.code, code)) {
          console.warn("Email-code sign-in rejected: code mismatch. Use the most recently requested code.");
          return null;
        }

        if (!(await hasLoginAccess(stored.email))) {
          console.warn("Email-code sign-in rejected: login access check failed.");
          return null;
        }

        // Enforce single-use OTP consumption server-side across instances so a copied cookie cannot be replayed.
        const consumed = await checkRateLimit(`email-otp-used:${stored.jti}`, {
          limit: 1,
          windowMs: 15 * 60_000,
        });
        if (!consumed.allowed) {
          console.warn("Email-code sign-in rejected: verification code has already been used.");
          cookieStore.delete(emailAuthCookies.otp);
          return null;
        }

        cookieStore.delete(emailAuthCookies.otp);
        return {
          id: stored.email,
          email: stored.email,
        };
      },
    }),
    Credentials({
      id: "admin-password",
      name: "Admin Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        captchaToken: { label: "Bot verification", type: "text" },
      },
      async authorize(credentials, request) {
        const ipLimit = await checkRateLimit(`admin-password:ip:${getClientIp(request)}`, {
          limit: 10,
          windowMs: 15 * 60_000,
        });
        if (!ipLimit.allowed) {
          console.warn("Admin password sign-in rejected: too many attempts from this client.");
          return null;
        }

        if (await verifyRecaptcha(credentials?.captchaToken, "admin_password")) {
          console.warn("Admin password sign-in rejected: bot verification failed.");
          return null;
        }

        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) {
          console.warn("Admin password sign-in rejected: missing credentials.");
          return null;
        }

        const accountLimit = await checkRateLimit(`admin-password:email:${email}`, {
          limit: 6,
          windowMs: 15 * 60_000,
        });
        if (!accountLimit.allowed) {
          console.warn("Admin password sign-in rejected: too many attempts for this account.");
          return null;
        }

        if (!verifyAdminPasswordCredentials(email, password)) {
          console.warn("Admin password sign-in rejected: invalid credentials.");
          return null;
        }

        return {
          id: email,
          email,
          name: "Super Admin",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && profile?.email_verified !== true) {
        console.warn("Google sign-in rejected: email address is not verified.");
        return getLocalizedSignInPath("unauthorized-email");
      }

      const access = await checkLoginAccess(user.email);
      if (access.reason === "database-unavailable") {
        return getLocalizedSignInPath("auth-unavailable");
      }

      return access.allowed || (await getLocalizedSignInPath("unauthorized-email"));
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
    updateAge: 30 * 60,
  },
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV !== "production",
  // Fixed to the route in app/api/auth/[...nextauth]. Without it, Auth.js takes the base path from
  // AUTH_URL's path (e.g. AUTH_URL=https://redi.healthcare/ro), and every sign-in and session
  // request then fails with "UnknownAction: Cannot parse action at /api/auth/...".
  basePath: AUTH_BASE_PATH,
});
