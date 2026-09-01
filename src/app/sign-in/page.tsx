import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { LockIcon } from "@/components/ui/icons";
import { SignInForm } from "@/components/auth/SignInForm";

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
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <LockIcon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Sign in to RediHealth
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {googleConfigured
                ? "Use your email address to receive a one-time sign-in code, or continue securely with your Google account."
                : "Use your email address to receive a one-time sign-in code."}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-xl">
            <SignInForm
              googleConfigured={googleConfigured}
              initialError={
                isUnauthorizedEmail
                  ? "This Google account is not authorized to access RediHealth."
                  : undefined
              }
            />
            <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
              By continuing, you agree to our Terms and acknowledge our Privacy
              Notice.
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
