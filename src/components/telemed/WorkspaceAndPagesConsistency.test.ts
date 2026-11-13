import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("Workspace and pages design consistency", () => {
  it("uses full-screen Container and two-column sticky workspace in OnCallQueueLauncher", () => {
    const src = read("components/telemed/OnCallQueueLauncher.tsx");
    expect(src).toContain("<Container>");
    expect(src).not.toContain("mx-auto max-w-2xl");
    expect(src).toContain("lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]");
    expect(src).toContain("lg:sticky lg:top-[calc(var(--chrome-h,0px)+1.5rem)]");
    expect(src).toContain("border-border-control");
    expect(src).toContain("text-page");
    expect(src).toContain("text-title");
    expect(src).not.toContain("rounded-full");
  });

  it("aligns AppointmentBookingPage, AppointmentBookingCalendar, and BookingSmsConfirmation to Container", () => {
    const pageSrc = read("app/medic-online/programare/page.tsx");
    expect(pageSrc).toContain("<Container>");
    expect(pageSrc).toContain("text-balance text-page text-foreground");
    expect(pageSrc).not.toContain("mx-auto max-w-2xl");

    const calSrc = read("components/telemed/AppointmentBookingCalendar.tsx");
    expect(calSrc).toContain('<Container className="py-8 sm:py-10">');
    expect(calSrc).toContain("max-w-3xl");
    expect(calSrc).toContain("border-border-control");
    expect(calSrc).not.toContain("mx-auto max-w-2xl");
    expect(calSrc).not.toContain("rounded-full");

    const smsSrc = read("components/telemed/BookingSmsConfirmation.tsx");
    expect(smsSrc).toContain("max-w-2xl");
    expect(smsSrc).not.toContain("mx-auto max-w-xl");
    expect(smsSrc).toContain("border-border-control");
    expect(smsSrc).toContain("press-row");
  });

  it("removes false-affordance hover lift and scale-105 on static cards in MedicOnlineHero and MedicOnlinePage", () => {
    const heroSrc = read("components/telemed/MedicOnlineHero.tsx");
    expect(heroSrc).not.toContain("hover:-translate-y-");
    expect(heroSrc).not.toContain("group-hover:scale-105");
    expect(heroSrc).not.toContain("group-hover:text-sapphire");
    expect(heroSrc).not.toContain("rounded-full");
    expect(heroSrc).toContain("min-h-12");
    expect(heroSrc).toContain("whitespace-nowrap");

    const pageSrc = read("app/medic-online/page.tsx");
    expect(pageSrc).not.toContain("hover:-translate-y-");
    expect(pageSrc).not.toContain("group-hover:scale-105");
    expect(pageSrc).not.toContain("group-hover:text-sapphire");
  });

  it("uses full-screen Container in PatientPortalView and OfflineWorkspace", () => {
    const portalSrc = read("components/portal/PatientPortalView.tsx");
    expect(portalSrc).toContain("<Container>");
    expect(portalSrc).not.toContain("mx-auto w-full max-w-4xl");
    expect(portalSrc).toContain("text-page");
    expect(portalSrc).toContain("border-border-control");

    const offlineSrc = read("components/offline/OfflineWorkspace.tsx");
    expect(offlineSrc).toContain("<Container>");
    expect(offlineSrc).not.toContain("mx-auto w-full max-w-xl");
    expect(offlineSrc).not.toContain("max-w-7xl");
    expect(offlineSrc).toContain("border-border-control");
    expect(offlineSrc).toContain('variant="action"');
    expect(offlineSrc).toContain("text-page");
  });

  it("aligns SignIn and ReportIssue pages flush-left with border-border-control and action buttons", () => {
    const signInPageSrc = read("components/auth/SignInPageContent.tsx");
    expect(signInPageSrc).toContain("<Container>");
    expect(signInPageSrc).toContain("text-balance text-page text-foreground");
    expect(signInPageSrc).not.toContain("mx-auto max-w-xl");
    expect(signInPageSrc).not.toContain("text-center");

    const signInFormSrc = read("components/auth/SignInForm.tsx");
    expect(signInFormSrc).toContain("border-border-control");
    expect(signInFormSrc).toContain('variant="action"');

    const reportSrc = read("components/report-issue/ReportIssuePageContent.tsx");
    expect(reportSrc).toContain('titleClassName="text-page"');
    expect(reportSrc).not.toContain("mx-auto max-w-2xl");
    expect(reportSrc).toContain("border-border-control");
    expect(reportSrc).toContain('variant="action"');
  });

  it("uses text-page, text-title, and focus-visible rings across legal and info pages", () => {
    for (const rel of [
      "app/about/page.tsx",
      "app/contact/page.tsx",
      "app/privacy/page.tsx",
      "app/terms/page.tsx",
      "app/accessibility/page.tsx",
    ]) {
      const src = read(rel);
      expect(src, rel).toContain('titleClassName="text-page"');
      expect(src, rel).not.toContain("text-base font-semibold text-foreground");
    }

    for (const rel of ["app/contact/page.tsx", "app/privacy/page.tsx", "app/terms/page.tsx"]) {
      expect(read(rel), rel).toContain("text-title text-foreground");
    }

    for (const rel of ["app/contact/page.tsx", "app/privacy/page.tsx", "app/accessibility/page.tsx"]) {
      expect(read(rel), rel).toContain("focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring");
    }
  });
});
