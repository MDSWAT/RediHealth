import type { Metadata } from "next";
import { SignInPageContent } from "@/components/auth/SignInPageContent";

export const metadata: Metadata = {
  title: "Sign In — RediHealth",
  description: "Sign in securely to RediHealth with Google or a one-time email code.",
};

type SignInPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const googleConfigured = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const { error } = await searchParams;
  const errorCode = Array.isArray(error) ? error[0] : error;

  const initialError =
    errorCode === "unauthorized-email"
      ? "unauthorized"
      : errorCode === "auth-unavailable"
        ? "unavailable"
        : undefined;

  return (
    <SignInPageContent
      googleConfigured={googleConfigured}
      initialError={initialError}
    />
  );
}
