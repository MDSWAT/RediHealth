"use client";

import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
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
      <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <LockIcon className="h-6 w-6" />
            </span>
            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {page.heroTitle}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              {googleConfigured ? page.heroParagraphWithGoogle : page.heroParagraphNoGoogle}
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-xl">
            <SignInForm
              googleConfigured={googleConfigured}
              initialError={initialErrorMessage}
            />
            <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
              {page.terms}
            </p>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
