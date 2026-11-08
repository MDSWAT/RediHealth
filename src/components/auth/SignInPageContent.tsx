"use client";

import { Container } from "@/components/ui/Container";
import { LockIcon } from "@/components/ui/icons";
import { SignInForm } from "@/components/auth/SignInForm";
import { useLanguage } from "@/lib/i18n/language-context";

export function SignInPageContent({
  googleConfigured,
  initialError,
}: {
  googleConfigured: boolean;
  initialError?: "unauthorized" | "unavailable";
}) {
  const { t } = useLanguage();
  const page = t.signInPage;
  const initialErrorMessage =
    initialError === "unauthorized"
      ? page.unauthorizedGoogle
      : initialError === "unavailable"
        ? page.authUnavailable
        : undefined;

  return (
    <main id="main-content" className="flex-1">
      <section className="border-b border-border bg-muted/40 py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-xl text-center">
            <LockIcon className="mx-auto h-7 w-7 text-sapphire" />
            <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {page.heroTitle}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {googleConfigured ? page.heroParagraphWithGoogle : page.heroParagraphNoGoogle}
            </p>
          </div>
        </Container>
      </section>

      <section className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-xl">
            <SignInForm
              googleConfigured={googleConfigured}
              initialError={initialErrorMessage}
            />
            <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
              {page.terms}
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
