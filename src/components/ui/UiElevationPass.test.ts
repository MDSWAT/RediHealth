import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const readSrc = (relPath: string) => readFileSync(resolve(ROOT, relPath), "utf8");

describe("UI elevation pass (Elements #1-#26)", () => {
  it("defines .calm-collapse, open state, inner wrapper, and reduced-motion overrides in globals.css", () => {
    const css = readSrc("src/app/globals.css");
    expect(css).toContain(".calm-collapse");
    expect(css).toContain('.calm-collapse[data-open="true"]');
    expect(css).toContain(".calm-collapse-inner");
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*\.calm-collapse\s*{\s*transition:\s*none\s*!important;/);
    expect(css).toMatch(/html\[data-calm-motion\]\s*\.calm-collapse\s*{\s*transition:\s*none\s*!important;/);
  });

  it("upgrades Button.tsx with press feedback and secondary dark-mode parity", () => {
    const button = readSrc("src/components/ui/Button.tsx");
    expect(button).toContain("press-solid");
    expect(button).toContain("press-row");
    expect(button).toContain("dark:bg-paper dark:text-ink-950");
    expect(button).toContain("motion-reduce:transition-none");
  });

  it("replaces stone popover border in FilterDropdown.tsx and removes transition-all with aria-current in Header.tsx", () => {
    const filter = readSrc("src/components/ui/FilterDropdown.tsx");
    expect(filter).not.toContain("border-stone-200/90");
    expect(filter).toContain("border-border-control/80");
    expect(filter).toContain("press-row");

    const header = readSrc("src/components/layout/Header.tsx");
    expect(header).not.toContain("transition-all");
    expect(header).toContain("aria-current");
    expect(header).toContain("w-10");
  });

  it("applies calm-collapse and text-page in NewsHub.tsx and fixes Russian singular news count in PlaceNewsModal.tsx", () => {
    const newsHub = readSrc("src/components/news/NewsHub.tsx");
    expect(newsHub).toContain("text-page");
    expect(newsHub).toContain("calm-collapse");
    expect(newsHub).toContain("calm-collapse-inner");

    const placeModal = readSrc("src/components/news/PlaceNewsModal.tsx");
    const ruStart = placeModal.indexOf("  ru: {");
    const roStart = placeModal.indexOf("  ro: {");
    const ruBlock = placeModal.slice(ruStart, roStart);
    expect(ruStart).toBeGreaterThan(-1);
    expect(roStart).toBeGreaterThan(ruStart);
    expect(ruBlock).not.toContain("1 news item");
    expect(ruBlock).toContain("1 новость");
  });

  it("replaces primary outline rings and 40px close button across emergency components", () => {
    const signsModal = readSrc("src/components/emergency/EmergencySignsModal.tsx");
    expect(signsModal).not.toContain("focus-visible:outline-primary");
    expect(signsModal).toContain("focus-visible:ring-ring");

    const desktopCard = readSrc("src/components/emergency/DesktopEmergencyCard.tsx");
    expect(desktopCard).not.toContain("h-10 w-10");
    expect(desktopCard).toContain("h-11 w-11 min-h-11 min-w-11");
    expect(desktopCard).toContain("tabular-nums");

    const dialerGate = readSrc("src/components/emergency/EmergencyDialerGate.tsx");
    expect(dialerGate).toContain("border-border-control");
    expect(dialerGate).toContain("press-row");
    expect(dialerGate).toContain("press-on-dark");
  });

  it("unifies cross-link ring tokens and 48px targets in FindHelpPageContent.tsx", () => {
    const findHelp = readSrc("src/components/find-help/FindHelpPageContent.tsx");
    expect(findHelp).not.toContain("focus-visible:ring-sapphire");
    expect(findHelp.match(/min-h-12/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(findHelp.match(/press-row/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
  });

  it("adds elevation and tabular-nums upgrades across landing, error, auth, report, get-help, and offline surfaces", () => {
    const footer = readSrc("src/components/layout/Footer.tsx");
    expect(footer).toContain("press-on-dark");
    expect(footer.match(/rounded-md px-1\.5/g)?.length ?? 0).toBeGreaterThanOrEqual(2);
    expect(readSrc("src/components/landing/HelpOptions.tsx")).not.toContain("sm:min-h-10");
    expect(readSrc("src/components/landing/TrustSection.tsx")).toContain('tone: "amber"');
    expect(readSrc("src/components/landing/QuizFeedbackCard.tsx")).toContain("fhs-enter");
    expect(readSrc("src/components/landing/QuizFeedbackCard.tsx")).toContain("border-border/90");
    expect(readSrc("src/app/not-found.tsx")).toContain("text-page");
    expect(readSrc("src/app/error.tsx")).toContain("text-page");
    expect(readSrc("src/components/auth/SignInForm.tsx")).toContain("tracking-[0.18em]");
    expect(readSrc("src/components/report-issue/ReportIssuePageContent.tsx")).toContain("trimmedLength >= 10");
    expect(readSrc("src/components/get-help/RequestHelpForm.tsx")).toContain("dark:border-sapphire-border");
    expect(readSrc("src/components/offline/OfflineWorkspace.tsx")).toContain("press-row");
    expect(readSrc("src/components/news/NewsArticleView.tsx")).toContain("tabular-nums");
  });
});
