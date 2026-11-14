import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");

describe("sitewide chrome, footer, feedback, landing widgets, and news shell consistency", () => {
  it("enforces calm motion and semantic amber-care tokens in Header.tsx", () => {
    const header = readSrc("src/components/layout/Header.tsx");

    expect(header).not.toMatch(/\bscale-\d+|\bgroup-hover:scale-|\bhover:-translate-y-|\bactive:scale-/);
    expect(header).toContain("group-hover:text-amber-care dark:group-hover:text-amber-care-border");
    expect(header).toContain("group-hover:text-amber-care");
    expect(header).not.toMatch(/amber-(400|600|700)/);

    const mobileMenu = header.slice(header.indexOf('id="mobile-menu"'), header.indexOf("</header>"));
    expect(mobileMenu).not.toMatch(/\bmin-h-(8|9|10)\b/);
    expect(mobileMenu).toContain("min-h-12 shrink-0 rounded-lg");
    expect(mobileMenu.match(/group inline-flex min-h-11 items-center gap-1\.5/g)).toHaveLength(3);
    expect(mobileMenu).not.toContain("truncate");
    expect(mobileMenu).not.toContain("h-9 w-9");
    expect(mobileMenu).not.toContain("rounded-2xl");
    expect(mobileMenu).not.toContain("rounded-full");

    const button = readSrc("src/components/ui/Button.tsx");
    expect(button).toContain("whitespace-nowrap");
  });

  it("upgrades ComfortMenu, LanguageSelector, Footer, and FeedbackWidget touch targets to min-h-11", () => {
    const comfort = readSrc("src/components/layout/ComfortMenu.tsx");
    expect(comfort).not.toMatch(/\bmin-h-(8|9|10)\b/);
    expect(comfort).toContain("inline-flex min-h-11 w-full items-center justify-center");
    expect(comfort).toContain("grid-rows-[1fr]");
    expect(comfort).toContain("h-11 w-11");
    expect(comfort).not.toContain("rounded-full");
    expect(comfort).not.toContain("h-9 w-9");

    const langSelector = readSrc("src/components/layout/LanguageSelector.tsx");
    expect(langSelector).not.toMatch(/\bmin-h-(8|9|10)\b/);
    expect(langSelector).toContain("mt-2 flex min-h-11 items-center justify-between");
    expect(langSelector).toContain("order-1 min-h-11 rounded-xl border");
    expect(langSelector).toContain("grid-rows-[1fr]");
    expect(langSelector).not.toContain("h-9 w-9");

    const footer = readSrc("src/components/layout/Footer.tsx");
    expect(footer).not.toMatch(/\bmin-h-(8|9|10)\b/);
    expect(footer.match(/inline-flex min-h-11 items-center rounded-\(--radius-control\)/g)).toHaveLength(2);
    expect(footer).not.toContain("·");
    expect(footer).toContain("whitespace-nowrap");

    const banner = readSrc("src/components/layout/UniversalEmergencyBanner.tsx");
    expect(banner).not.toContain("truncate");
    expect(banner).toContain("whitespace-nowrap");

    const feedback = readSrc("src/components/layout/FeedbackWidget.tsx");
    expect(feedback).not.toMatch(/\bmin-h-(8|9|10)\b/);
    expect(feedback).toContain("flex min-h-11 items-center justify-center rounded-lg border border-border-control/80");
    expect(feedback).toContain("inline-flex min-h-11 items-center rounded-lg px-2.5");
    expect(feedback).toContain("inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-sapphire");
    expect(feedback).toContain("max-lg:hidden");
    expect(feedback).not.toContain("rounded-full");
    expect(feedback).not.toContain("h-8 w-8");
  });

  it("uses border-border-control and min-h-11 on ReportIssueWidget and CountyOverrideModal inputs", () => {
    const report = readSrc("src/components/layout/ReportIssueWidget.tsx");
    expect(report).toContain('min-h-11 py-2 pl-9 pr-3 ${error?.field === "email" ? "border-primary" : "border-border-control"}');
    expect(report).toContain('px-3 py-2 ${error?.field === "message" ? "border-primary" : "border-border-control"}');

    const countyModal = readSrc("src/components/news/CountyOverrideModal.tsx");
    expect(countyModal).toContain("min-h-11 w-full rounded-lg border border-border-control bg-background");
  });

  it("upgrades MythCardCarousel controls and progress bar radius while preserving HealthTopicsSpotlight wheel tokens", () => {
    const carousel = readSrc("src/components/landing/MythCardCarousel.tsx");
    expect(carousel).toContain("min-h-11 min-w-11");
    expect(carousel).not.toContain("min-h-10 min-w-10");
    expect(carousel).toContain("overflow-hidden rounded-sm");
    expect(carousel).not.toContain("rounded-full");

    const spotlight = readSrc("src/components/landing/HealthTopicsSpotlight.tsx");
    expect(spotlight).toContain("min-h-11 [@media(max-height:820px)]:min-h-9");
    expect(spotlight).not.toMatch(/\bmin-h-8\b/);
    expect(spotlight).toContain("bg-primary text-white [--wheel-face-bg:var(--color-primary)]");
  });

  it("cleans up NewsHub switcher divider, outlined controls, and RegionalHealthRibbon action target", () => {
    const newsHub = readSrc("src/components/news/NewsHub.tsx");
    expect(newsHub).toContain("press-row inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-control");
    expect(newsHub).toContain("border-l border-border pl-2.5 font-normal text-muted-foreground");
    expect(newsHub).not.toContain('<span aria-hidden="true" className="text-muted-foreground">·</span>');
    expect(newsHub).toContain("press-row inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-border-control");

    const ribbon = readSrc("src/components/news/RegionalHealthRibbon.tsx");
    expect(ribbon).toContain("order-2 inline-flex min-h-11 shrink-0");
    expect(ribbon).not.toMatch(/\b(md:)?min-h-(8|9|10)\b/);
  });
});
