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

const navLinks = [
  { label: "Health Information", href: "/health-information" },
  { label: "Find Medical Help", href: "/find-help" },
  { label: "About", href: "/about" },
];

function LanguageSelector({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <GlobeIcon className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <select
        aria-label="Select language"
        defaultValue="en"
        className="h-11 cursor-pointer appearance-none rounded-lg border border-border bg-card pl-8 pr-8 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="en">English</option>
        <option value="ro">Română</option>
      </select>
    </div>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    void getSession().then((session) => setAuthenticated(Boolean(session)));
  }, []);

  const accountLink = authenticated
    ? { href: "/panel", label: "Panel" }
    : { href: "/sign-in", label: "Sign In" };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
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
              href={accountLink.href}
              className="inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              {accountLink.label}
            </Link>
            <Button href="/get-help" size="md" className="text-sm">
              Get Help
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

      {mobileOpen ? (
        <div id="mobile-menu" className="border-t border-border bg-background lg:hidden">
          <Container className="py-4">
            <nav aria-label="Primary (mobile)">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
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
                href={accountLink.href}
                className="flex min-h-[48px] items-center justify-center rounded-lg border border-border px-4 text-base font-semibold text-foreground hover:bg-muted"
                onClick={() => setMobileOpen(false)}
              >
                {accountLink.label}
              </Link>
              <Button href="/get-help" size="lg" fullWidth onClick={() => setMobileOpen(false)}>
                Get Help
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
