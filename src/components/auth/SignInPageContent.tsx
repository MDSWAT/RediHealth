"use client";

import { Container } from "@/components/ui/Container";
import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";

// The words inside the terms sentence that open the Terms and the Privacy pages, per language.
const TERMS_LINKS: Record<Lang, { terms: string; privacy: string }> = {
  ru: { terms: "Условия", privacy: "Уведомление о конфиденциальности" },

  ro: { terms: "Termenii", privacy: "Politica de confidențialitate" },
  en: { terms: "Terms", privacy: "Privacy Notice" },
  sq: { terms: "Kushtet", privacy: "Njoftimin e Privatësisë" },
  it: { terms: "Termini", privacy: "Informativa sulla privacy" },
  hr: { terms: "uvjete korištenja", privacy: "pravila privatnosti" },
  rom: { terms: "labaripnaske pravila", privacy: "garavipnaske pravila" },
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
    <main id="main-content" className="flex-1 pb-12 sm:pb-16">
      <Container>
        {/* One narrow, centred column: the page has a single job, so nothing sits beside it. */}
        <div className="mx-auto w-full max-w-[30rem] pt-8 sm:pt-14">
          <h1 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] text-foreground text-balance sm:text-[2rem]">
            {page.heroTitle}
          </h1>
          <p className="mt-2.5 text-body leading-relaxed text-muted-foreground text-pretty">
            {googleConfigured ? page.heroParagraphWithGoogle : page.heroParagraphNoGoogle}
          </p>

          <div className="mt-6">
            <SignInForm googleConfigured={googleConfigured} initialError={initialErrorMessage} />
          </div>
          <p className="mt-6 px-2 text-sm leading-relaxed text-muted-foreground text-pretty">
            {termsWithLinks(page.terms, lang)}
          </p>
        </div>
      </Container>
    </main>
  );
}
