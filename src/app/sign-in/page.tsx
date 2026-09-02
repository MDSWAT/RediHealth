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
  const isUnauthorizedEmail = error === "unauthorized-email";

  return (
    <SignInPageContent googleConfigured={googleConfigured} isUnauthorizedEmail={isUnauthorizedEmail} />
  );
}
