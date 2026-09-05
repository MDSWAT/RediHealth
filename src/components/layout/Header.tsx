"use client";

import Link from "next/link";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import {
  ChevronDownIcon,
  CloseIcon,
  GlobeIcon,
  MenuIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { languages, type Lang } from "@/lib/i18n/translations";
import { useLanguage } from "@/lib/i18n/language-context";
import { withLangPrefix } from "@/lib/i18n/routing";

function LanguageSelector({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={cn("relative", className)}>
      <GlobeIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <select
        aria-label="Select language"
        value={lang}
        onChange={(event) => setLang(event.target.value as Lang)}
        className="h-11 cursor-pointer appearance-none rounded-lg border border-border bg-card pl-8 pr-8 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {languages.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const { t, lang } = useLanguage();

  useEffect(() => {
    void getSession().then((session) => setAuthenticated(Boolean(session)));
  }, []);

  const navLinks = [
    { label: t.nav.healthInformation, href: "/health-information" },
    { label: t.nav.healthCheck, href: "/health-check" },
    { label: t.nav.findHelp, href: "/find-help" },
    { label: t.nav.about, href: "/about" },
  ];

  const accountLink = authenticated
    ? { href: "/panel", label: t.account.panel }
    : { href: "/sign-in", label: t.account.signIn };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Logo href={withLangPrefix("/", lang)} />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={withLangPrefix(link.href, lang)}
                    className="inline-flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <Link
              href={withLangPrefix(accountLink.href, lang)}
              className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {accountLink.label}
            </Link>
            <Link
              href={withLangPrefix("/demo", lang)}
              className="inline-flex min-h-[44px] items-center rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {t.header.demo}
            </Link>
            <Button href={withLangPrefix("/get-help", lang)} size="md" className="text-sm">
              {t.header.getHelp}
            </Button>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <CloseIcon className="h-6 w-6" />
            ) : (
              <MenuIcon className="h-6 w-6" />
            )}
          </button>
        </div>
      </Container>

      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        className={cn(
          "grid bg-background transition-[grid-template-rows] duration-300 ease-out lg:hidden",
          mobileOpen ? "grid-rows-[1fr] border-t border-border" : "grid-rows-[0fr]",
        )}
      >
        <div
          className={cn(
            "overflow-hidden transition-opacity duration-200",
            mobileOpen ? "opacity-100 delay-100" : "opacity-0",
          )}
        >
          <Container className="py-4">
            <nav aria-label="Primary (mobile)">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={withLangPrefix(link.href, lang)}
                      className="flex min-h-[48px] items-center rounded-lg px-3 text-base font-medium text-foreground hover:bg-muted"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <LanguageSelector className="w-full [&>select]:w-full" />
              <Link
                href={withLangPrefix(accountLink.href, lang)}
                className="flex min-h-[48px] items-center justify-center rounded-lg border border-border px-4 text-base font-semibold text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {accountLink.label}
              </Link>
              <Link
                href={withLangPrefix("/demo", lang)}
                className="flex min-h-[48px] items-center justify-center rounded-lg border border-border px-4 text-base font-semibold text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {t.header.demo}
              </Link>
              <Button href={withLangPrefix("/get-help", lang)} size="lg" fullWidth onClick={() => setMobileOpen(false)}>
                {t.header.getHelp}
              </Button>
            </div>
          </Container>
        </div>
      </div>
    </header>
  );
}
