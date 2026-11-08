"use client";

import { Container } from "@/components/ui/Container";
import { LockIcon } from "@/components/ui/icons";
import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

// The words inside the terms sentence that open the Terms and the Privacy pages, per language.
const TERMS_LINKS: Record<Lang, { terms: string; privacy: string }> = {
  ro: { terms: "Termenii", privacy: "Politica de confidențialitate" },
  en: { terms: "Terms", privacy: "Privacy Notice" },
  sq: { terms: "Kushtet", privacy: "Njoftimin e Privatësisë" },
  it: { terms: "Termini", privacy: "Informativa sulla privacy" },
};

const inlineLink =
  "rounded-sm font-medium text-foreground underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out-calm)] hover:text-sapphire dark:hover:text-sapphire-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** The terms sentence with its two documents as real links; plain text if a phrase is not found. */
function termsWithLinks(sentence: string, lang: Lang): ReactNode {
  const words = TERMS_LINKS[lang] ?? TERMS_LINKS.ro;
  const parts: Array<{ phrase: string; href: string }> = [
    { phrase: words.terms, href: withLangPrefix("/terms", lang) },
    { phrase: words.privacy, href: withLangPrefix("/privacy", lang) },
  ];
  const out: ReactNode[] = [];
  let rest = sentence;
  for (const { phrase, href } of parts) {
    const at = rest.indexOf(phrase);
    if (at < 0) continue;
    out.push(rest.slice(0, at));
    out.push(
      <Link key={href} href={href} className={inlineLink}>
        {phrase}
      </Link>,
    );
    rest = rest.slice(at + phrase.length);
  }
  out.push(rest);
  return out;
}

export function SignInPageContent({
  googleConfigured,
  initialError,
}: {
  googleConfigured: boolean;
  initialError?: "unauthorized" | "unavailable";
}) {
  const { t, lang } = useLanguage();
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
              {termsWithLinks(page.terms, lang)}
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
