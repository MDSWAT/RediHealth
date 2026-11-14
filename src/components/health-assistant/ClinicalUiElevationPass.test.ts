import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf8");
}

const OWNED_CLINICAL_FILES = [
  "src/components/health-assistant/AssistantNavigation.tsx",
  "src/components/health-assistant/PrescriptionDoctorBridge.tsx",
  "src/components/health-assistant/UniversalDoctorExit.tsx",
  "src/components/health-assistant/TriageInputBar.tsx",
  "src/components/health-assistant/PrescriptionReview.tsx",
  "src/components/health-information/ArticleListenButton.tsx",
  "src/components/health-information/ActionableStepsChecklist.tsx",
  "src/components/health-information/WarningSignsEmergencyCard.tsx",
  "src/components/health-information/GlobalHealthAudioPlayer.tsx",
  "src/components/health-information/SynchronizedSentenceReader.tsx",
  "src/components/health-information/TopicDetailPageContent.tsx",
  "src/components/health-information/RomanianDualRegisterGlossary.tsx",
  "src/components/health-information/ReadingLevelSwitcher.tsx",
  "src/components/health-information/heart-health/HeartAnatomyPanel.tsx",
  "src/components/health-check/AnatomicalViewport3D.tsx",
  "src/components/telemed/MedicOnlineHero.tsx",
  "src/components/telemed/OnCallQueueLauncher.tsx",
  "src/components/telemed/AppointmentBookingCalendar.tsx",
  "src/components/telemed/DoctorRecommendationPublisher.tsx",
  "src/components/telemed/HardwareKitTelemetryPanel.tsx",
  "src/components/portal/PortalLinkExpired.tsx",
  "src/components/portal/SmsPhoneAuthModal.tsx",
  "src/components/portal/ContulMeuShowcase.tsx",
  "src/components/portal/PatientPortalView.tsx",
  "src/components/mediator/MediatorPublicHero.tsx",
  "src/components/mediator/RequestMediatorModal.tsx",
  "src/components/mediator/MobileFieldMediatorDashboard.tsx",
  "src/components/mediator/ProxyPatientIntakeWizard.tsx",
  "src/components/mediator/MediatorDoctorHandoverProtocol.tsx",
];

describe("Clinical UI elevation pass regression tests (#27-#56)", () => {
  it("enforces zero focus-visible:ring-sapphire, zero focus:ring-sapphire, and zero rounded-full across owned clinical files", () => {
    for (const file of OWNED_CLINICAL_FILES) {
      const source = readSrc(file);
      expect(source, `${file} still contains focus-visible:ring-sapphire`).not.toContain(
        "focus-visible:ring-sapphire",
      );
      expect(source, `${file} still contains focus:ring-sapphire`).not.toContain(
        "focus:ring-sapphire",
      );
      expect(source, `${file} still contains rounded-full`).not.toContain("rounded-full");
    }
  });

  it("verifies AssistantNavigation is a capsule menu with press-row, motion-reduce, and focus-visible:ring-ring", () => {
    const source =
      readSrc("src/components/health-assistant/AssistantNavigation.tsx") +
      readSrc("src/components/layout/chrome-capsule.ts");
    expect(source).toContain("press-row");
    expect(source).toContain("className={capsuleTab(isActive)}");
    expect(source).toContain("motion-reduce:transition-none");
    expect(source).toContain("focus-visible:ring-ring");
  });

  it("verifies PrescriptionDoctorBridge buttonText is <= 28 chars across all 7 locales and uses focus-visible:ring-ring", () => {
    const source = readSrc("src/components/health-assistant/PrescriptionDoctorBridge.tsx");
    const buttonTexts = [...source.matchAll(/buttonText:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(buttonTexts).toHaveLength(7);
    for (const label of buttonTexts) {
      expect(label.length, `CTA "${label}" exceeds 28 chars`).toBeLessThanOrEqual(28);
    }
    expect(source).not.toContain("focus-visible:ring-sapphire");
    expect(source).toContain("focus-visible:ring-ring");
    expect(source).toContain("press-solid");
  });

  it("verifies ActionableStepsChecklist fixes dark-mode checkmarks and renders a GPU scaleX progress bar", () => {
    const source = readSrc("src/components/health-information/ActionableStepsChecklist.tsx");
    expect(source).not.toContain("bg-foreground text-white");
    expect(source).toContain("scaleX(");
    expect(source).not.toContain("focus-visible:ring-sapphire");
    expect(source).toContain("border-border-control bg-background");
    expect(source).toContain("press-row");
  });

  it("verifies audio, reader, topic, warning, and heart anatomy components remove focus-visible:ring-sapphire", () => {
    for (const file of [
      "src/components/health-information/GlobalHealthAudioPlayer.tsx",
      "src/components/health-information/SynchronizedSentenceReader.tsx",
      "src/components/health-information/TopicDetailPageContent.tsx",
      "src/components/health-information/WarningSignsEmergencyCard.tsx",
      "src/components/health-information/heart-health/HeartAnatomyPanel.tsx",
    ]) {
      const source = readSrc(file);
      expect(source, `${file} must not use focus-visible:ring-sapphire`).not.toContain(
        "focus-visible:ring-sapphire",
      );
      expect(source, `${file} must use focus-visible:ring-ring`).toContain("focus-visible:ring-ring");
    }

    const heartSource = readSrc("src/components/health-information/heart-health/HeartAnatomyPanel.tsx");
    expect(heartSource).not.toMatch(/(?<![\w-])hidden=\{!open\}/);
    expect(heartSource).toContain("grid-rows-[1fr]");
  });

  it("verifies RomanianDualRegisterGlossary uses plain typographic metadata instead of a bordered pill", () => {
    const source = readSrc("src/components/health-information/RomanianDualRegisterGlossary.tsx");
    expect(source).not.toContain("ring-1 ring-inset ring-sapphire-border");
  });

  it("verifies MobileFieldMediatorDashboard removes live-sage dot, middle dot separator, and sapphire ring", () => {
    const source = readSrc("src/components/mediator/MobileFieldMediatorDashboard.tsx");
    expect(source).not.toContain("rounded-full bg-live-sage");
    expect(source).not.toContain("·");
    expect(source).not.toContain("focus-visible:ring-sapphire");
    expect(source).toContain("focus-visible:ring-ring");
    expect(source).toContain("press-row");
  });

  it("verifies MediatorPublicHero updates Russian copy and uses text-page and canonical focus/press classes", () => {
    const source = readSrc("src/components/mediator/MediatorPublicHero.tsx");
    expect(source).not.toContain("Вход в Медиатор");
    expect(source).toContain("Вход для медиаторов");
    expect(source).toContain("text-page");
    expect(source).toContain("focus-visible:ring-ring");
    expect(source).toContain("press-solid");
    expect(source).toContain("press-row");
  });

  it("verifies portal, telemed, and mediator forms preserve calm press feedback and control tokens", () => {
    expect(readSrc("src/components/portal/ContulMeuShowcase.tsx")).toContain("fhs-enter");
    expect(readSrc("src/components/portal/PortalLinkExpired.tsx")).toContain("Kher andre telefonosa");
    expect(readSrc("src/components/portal/PortalLinkExpired.tsx")).toContain("text-page");
    expect(readSrc("src/components/telemed/MedicOnlineHero.tsx")).toContain("text-page");
    expect(readSrc("src/components/telemed/AppointmentBookingCalendar.tsx")).toContain("fhs-enter");
    expect(readSrc("src/components/mediator/MediatorDoctorHandoverProtocol.tsx")).toContain(
      "h-5 w-5 rounded border-border-control accent-sapphire",
    );
  });
});
