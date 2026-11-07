import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi, afterEach, beforeAll } from "vitest";
import { translations, Lang } from "@/lib/i18n/translations";

let currentLang: Lang = "ro";

// Mock language context so we can test multiple locales dynamically
vi.mock("@/lib/i18n/language-context", () => ({
  useLanguage: () => ({
    lang: currentLang,
    t: translations[currentLang],
    setLang: (l: Lang) => {
      currentLang = l;
    },
  }),
}));

import { Hero } from "./Hero";
import { HeroEmergencyNotice } from "./HeroEmergencyNotice";
import { HeroDecisionTree } from "./HeroDecisionTree";
import { HeroPortals } from "./HeroPortals";

// React 19 internals for hook interception during server rendering
type ReactHookDispatcher = {
  useState?: (init: unknown) => unknown;
  __wrappedByHeroStress?: boolean;
  [key: string]: unknown;
};

type ReactInternalsType = {
  H: ReactHookDispatcher | null;
  [key: string]: unknown;
};

const internals = (React as unknown as { __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE: ReactInternalsType }).__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

let currentOverrides: {
  activeBranch?: "learn" | "check" | "symptoms" | "prescription" | "navigation" | null;
  plainLanguage?: boolean;
  riskAnswers?: Record<number, boolean>;
  symptomWarningTriggered?: boolean;
  selectedTopic?: number;
} | null = null;

let hookCallIndex = 0;

beforeAll(() => {
  let currentH = internals.H;
  Object.defineProperty(internals, "H", {
    get() {
      return currentH;
    },
    set(newDisp: ReactHookDispatcher | null) {
      if (newDisp && newDisp.useState && !newDisp.__wrappedByHeroStress) {
        const origUseState = newDisp.useState;
        newDisp.useState = function (init: unknown) {
          hookCallIndex++;
          if (currentOverrides) {
            // 1: activeBranch (default null)
            if (hookCallIndex === 1 && currentOverrides.activeBranch !== undefined) {
              return [currentOverrides.activeBranch, vi.fn()];
            }
            // 2: plainLanguage (default false)
            if (hookCallIndex === 2 && currentOverrides.plainLanguage !== undefined) {
              return [currentOverrides.plainLanguage, vi.fn()];
            }
            // 4: riskAnswers (default {})
            if (hookCallIndex === 4 && currentOverrides.riskAnswers !== undefined) {
              return [currentOverrides.riskAnswers, vi.fn()];
            }
            // 5: symptomWarningTriggered (default false)
            if (hookCallIndex === 5 && currentOverrides.symptomWarningTriggered !== undefined) {
              return [currentOverrides.symptomWarningTriggered, vi.fn()];
            }
            // 7: selectedTopic (default 0)
            if (hookCallIndex === 7 && currentOverrides.selectedTopic !== undefined) {
              return [currentOverrides.selectedTopic, vi.fn()];
            }
          }
          return origUseState.call(this, init);
        };
        newDisp.__wrappedByHeroStress = true;
      }
      currentH = newDisp;
    },
    configurable: true,
  });
});

// Helper to render HeroDecisionTree in a specific branch state
function renderDecisionTreeInState(stateOverrides: {
  activeBranch?: "learn" | "check" | "symptoms" | "prescription" | "navigation" | null;
  plainLanguage?: boolean;
  riskAnswers?: Record<number, boolean>;
  symptomWarningTriggered?: boolean;
  selectedTopic?: number;
}) {
  currentOverrides = stateOverrides;
  hookCallIndex = 0;
  try {
    return renderToStaticMarkup(createElement(HeroDecisionTree));
  } finally {
    currentOverrides = null;
    hookCallIndex = 0;
  }
}

describe("Empirical Stress Testing — Milestone 2 Hero Section Revamp", () => {
  afterEach(() => {
    currentLang = "ro";
    currentOverrides = null;
    hookCallIndex = 0;
    vi.restoreAllMocks();
  });

  describe("1. Decision Tree Pathways — All 5 Branches & Doctor Connection", () => {
    it("Root Level: displays 'Ce te îngrijorează astăzi?' and all 5 initial options", () => {
      const html = renderDecisionTreeInState({ activeBranch: null });
      expect(html).toContain("Ce te îngrijorează astăzi?");
      expect(html).toContain("Pasul 1 din 3");
      expect(html).toContain("1. Vreau să aflu despre sănătate");
      expect(html).toContain("2. Vreau să-mi verific riscul");
      expect(html).toContain("3. Am o problemă de sănătate");
      expect(html).toContain("4. Am o rețetă explicată");
      expect(html).toContain("5. Nu știu unde să merg / medic de familie / CNAS");
    });

    it("Branch 1 ('learn'): renders lesson topics, myth debunk, and mandatory doctor connection prompt", () => {
      const html = renderDecisionTreeInState({ activeBranch: "learn", selectedTopic: 0 });
      // Step transition
      expect(html).toContain("Pasul 2 din 3");
      expect(html).toContain("Înapoi la opțiuni");
      // Content
      expect(html).toContain("Lecții simple și mituri medicale explicate");
      expect(html).toContain("Vaccinuri sigure");
      expect(html).toContain("Tensiune și inimă");
      expect(html).toContain("Sănătatea copilului");
      expect(html).toContain("Gripă și răceală");
      expect(html).toContain("Validat de medici");
      expect(html).toContain("Mit: Vaccinul antigripal provoacă gripă.");
      expect(html).toContain('href="/health-information"');
      // Doctor prompt across branch
      expect(html).toContain("Vrei să vorbești cu un medic");
      expect(html).toContain('href="/get-help?mode=doctor"');
      expect(html).toContain('href="/get-help?mode=duty"');
    });

    it("Branch 2 ('check'): renders 3 risk questions, calculates outcomes, and displays doctor prompt", () => {
      // Test low risk (0 yes)
      const htmlLow = renderDecisionTreeInState({ activeBranch: "check", riskAnswers: {} });
      expect(htmlLow).toContain("Pasul 2 din 3");
      expect(htmlLow).toContain("Verifică riscul tău de sănătate în 90 de secunde");
      expect(htmlLow).toContain("Ai peste 45 de ani sau cazuri de diabet sau tensiune mare în familie?");
      expect(htmlLow).toContain("Simți oboseală neobișnuită, sete permanentă sau amețeală la efort?");
      expect(htmlLow).toContain("Fumezi zilnic sau ai o alimentație bogată în grăsimi și sare?");
      expect(htmlLow).toContain("Risc scăzut: menține stilul de viață sănătos");
      expect(htmlLow).toContain('href="/health-check"');
      expect(htmlLow).toContain("Vrei să vorbești cu un medic");
      expect(htmlLow).toContain('href="/get-help?mode=doctor"');

      // Test moderate risk (1 yes)
      const htmlMod = renderDecisionTreeInState({ activeBranch: "check", riskAnswers: { 0: true } });
      expect(htmlMod).toContain("Risc moderat: adoptă măsuri preventive");

      // Test high risk (2+ yes)
      const htmlHigh = renderDecisionTreeInState({ activeBranch: "check", riskAnswers: { 0: true, 1: true } });
      expect(htmlHigh).toContain("Risc ce necesită atenție: îți recomandăm un consult medical");
    });

    it("Branch 3 ('symptoms'): renders acute red-flag gate, symptom categories, duty status, and doctor prompt", () => {
      const html = renderDecisionTreeInState({ activeBranch: "symptoms" });
      expect(html).toContain("Pasul 2 din 3");
      expect(html).toContain("Verificare siguranță și medic de gardă");
      expect(html).toContain("Atenție: ai dureri puternice în piept, respirație grea bruscă");
      expect(html).toContain("Da, am aceste semne grave");
      expect(html).toContain("Nu, am alte simptome ușoare");
      expect(html).toContain("Febră moderată");
      expect(html).toContain("Durere de cap");
      expect(html).toContain("Medic de gardă disponibil");
      expect(html).toContain("Așteptare: sub 10 min");
      expect(html).toContain('href="/get-help?mode=doctor"');
      // Doctor prompt across branch
      expect(html).toContain("Vrei să vorbești cu un medic");
      expect(html).toContain('href="/get-help?mode=duty"');
    });

    it("Branch 4 ('prescription'): renders dosage schedule, antibiotic safety rule, and doctor prompt", () => {
      const html = renderDecisionTreeInState({ activeBranch: "prescription" });
      expect(html).toContain("Pasul 2 din 3");
      expect(html).toContain("Ghid simplu pentru rețeta ta medicală");
      expect(html).toContain("Dimineața");
      expect(html).toContain("Prânz");
      expect(html).toContain("Seara");
      expect(html).toContain("prescription-scan-line");
      expect(html).toContain("Nu întrerupe tratamentul cu antibiotice");
      expect(html).toContain('href="/health-assistant?tab=prescription"');
      // Doctor prompt across branch
      expect(html).toContain("Vrei să vorbești cu un medic");
      expect(html).toContain('href="/get-help?mode=doctor"');
      expect(html).toContain('href="/get-help?mode=duty"');
    });

    it("Branch 5 ('navigation'): renders administrative rights, CNAS/family doctor steps, and doctor prompt", () => {
      const html = renderDecisionTreeInState({ activeBranch: "navigation" });
      expect(html).toContain("Pasul 2 din 3");
      expect(html).toContain("Drepturi medicale și medic de familie");
      expect(html).toContain("1. Dreptul gratuit la urgență");
      expect(html).toContain("2. Înscriere la medic de familie");
      expect(html).toContain("3. Ajutor de la mediatorul sanitar");
      expect(html).toContain('href="/get-help?mode=mediator"');
      // Doctor prompt across branch
      expect(html).toContain("Vrei să vorbești cu un medic");
      expect(html).toContain('href="/get-help?mode=doctor"');
      expect(html).toContain('href="/get-help?mode=duty"');
    });

    it("Doctor Connection Prompt: verified to render in all 5 branches consistently", () => {
      const branches = ["learn", "check", "symptoms", "prescription", "navigation"] as const;
      for (const branch of branches) {
        const html = renderDecisionTreeInState({ activeBranch: branch });
        expect(html, `Doctor prompt missing in branch: ${branch}`).toContain("Vrei să vorbești cu un medic");
        expect(html, `Doctor schedule CTA missing in branch: ${branch}`).toContain('href="/get-help?mode=doctor"');
        expect(html, `Doctor on-duty CTA missing in branch: ${branch}`).toContain('href="/get-help?mode=duty"');
      }
    });
  });

  describe("2. 112 Emergency Notice & Accessible Warning Signs Modal", () => {
    it("Emergency Ribbon: renders exact legal verbatim notice and dialer in closed state", () => {
      const html = renderToStaticMarkup(createElement(HeroEmergencyNotice, { isOpen: false }));
      // Verbatim string check
      expect(html).toContain("Semnele de alarmă și «Sună tu la 112» — aplicația nu apelează automat");
      expect(html).toContain("Vezi semnele de alarmă");
      expect(html).toContain('href="tel:112"');
      expect(html).toContain("Sună la 112");
      // Modal should NOT be rendered when isOpen is false
      expect(html).not.toContain('role="alertdialog"');
    });

    it("Emergency Modal: renders all 6 cardinal warning symptoms, 112 calling script, and disclaimers when isOpen=true", () => {
      const html = renderToStaticMarkup(createElement(HeroEmergencyNotice, { isOpen: true }));
      // Modal wrapper & ARIA attributes
      expect(html).toContain('role="alertdialog"');
      expect(html).toContain('aria-modal="true"');
      expect(html).toContain('id="emergency-modal-title"');
      expect(html).toContain("Semne de alarmă pentru urgență medicală");

      // 6 Cardinal Life-Threatening Signs
      expect(html).toContain("Dureri puternice în piept");
      expect(html).toContain("Respirație foarte grea");
      expect(html).toContain("Asimetrie facială sau amorțeală");
      expect(html).toContain("Pierdere de conștiență");
      expect(html).toContain("Sângerare masivă");
      expect(html).toContain("Convulsii sau spasme");

      // 112 Calling script guidance
      expect(html).toContain("Cum vorbești cu dispecerul 112 (ghid rapid)");
      expect(html).toContain("Unitate de Primiri Urgențe (UPU)");

      // Primary dialer CTA & fail-safe legal notices
      expect(html).toContain("Sună acum la 112");
      expect(html).toContain('href="tel:112"');
      expect(html).toContain("Aplicația RediHealth nu poate efectua apeluri vocale în mod direct.");
      expect(html).toContain("Aplicația nu apelează automat serviciile de urgență și nu înlocuiește dispeceratul 112.");
    });
  });

  describe("3. Dual Portals & Audience Segregation", () => {
    it("HeroPortals: contains dedicated routes and design tokens for Telemedicine and Mediators", () => {
      const html = renderToStaticMarkup(createElement(HeroPortals));

      // Telemedicine virtual clinic
      expect(html).toContain("Clinica virtuală");
      expect(html).toContain("Consultații medicale online pe înțelesul tău");
      expect(html).toContain('href="/get-help?mode=doctor"');
      expect(html).toContain("Intră în clinica virtuală");
      expect(html).toContain("Medic de gardă activ");
      expect(html).toContain("micro-status-dot");

      // Community Health Mediators portal
      expect(html).toContain("Pentru mediatori sanitari");
      expect(html).toContain("Ești mediator sanitar în comunitate?");
      expect(html).toContain('href="/panel"');
      expect(html).toContain("Deschide panoul mediatorului");
      // Amber Gold color token classes
      expect(html).toContain("border-amber-care-border");
      expect(html).toContain("text-amber-care");
    });

    it("Hero Utility Header: contains quick pill links for both audiences", () => {
      const html = renderToStaticMarkup(createElement(Hero));
      expect(html).toContain('href="/get-help?mode=doctor"');
      expect(html).toContain('href="/panel"');
      expect(html).toContain("Serviciu public gratuit · Construit împreună cu comunitățile");
    });
  });

  describe("4. Multilingual & Internationalization Robustness", () => {
    const supportedLocales: Lang[] = ["ro", "en", "sq", "it"];

    for (const locale of supportedLocales) {
      it(`renders Hero successfully in locale '${locale}' without crash or missing keys`, () => {
        currentLang = locale;
        const html = renderToStaticMarkup(createElement(Hero, { showAssistantCta: true }));
        expect(html).toBeDefined();
        expect(html.length).toBeGreaterThan(500);

        // Verify that emergencyNoticeVerbatim is populated
        const notice = translations[locale].hero.emergencyNoticeVerbatim;
        expect(notice).toBeDefined();
        expect(notice.length).toBeGreaterThan(10);
        // Normalize single quotes for comparison because ReactDOMServer escapes ' as &#x27;
        const normalizedHtml = html.replace(/&#x27;/g, "'");
        expect(normalizedHtml).toContain(notice);

        // Verify that 5 triage options are present in translation
        const opts = translations[locale].hero.triage.options;
        expect(opts).toHaveLength(5);
        for (const opt of opts) {
          expect(opt.title).toBeDefined();
          expect(opt.title.length).toBeGreaterThan(3);
        }

        // Verify doctor prompt is present
        expect(translations[locale].hero.triage.doctorPrompt).toBeDefined();
      });
    }
  });

  describe("5. Strict UI Laws & Design System Compliance", () => {
    it("enforces zero ampersands in prose copy across all components", () => {
      const heroHtml = renderToStaticMarkup(createElement(Hero, { showAssistantCta: true }));
      const portalsHtml = renderToStaticMarkup(createElement(HeroPortals));
      const emergencyHtml = renderToStaticMarkup(createElement(HeroEmergencyNotice, { isOpen: true }));

      // Strip allowed HTML entities (like &quot;) and check for naked & in text
      const cleanHero = heroHtml.replace(/&(?:quot|amp|lt|gt|#x[0-9a-f]+|[0-9]+);/gi, "");
      const cleanPortals = portalsHtml.replace(/&(?:quot|amp|lt|gt|#x[0-9a-f]+|[0-9]+);/gi, "");
      const cleanEmergency = emergencyHtml.replace(/&(?:quot|amp|lt|gt|#x[0-9a-f]+|[0-9]+);/gi, "");

      expect(cleanHero).not.toMatch(/\s&\s/);
      expect(cleanPortals).not.toMatch(/\s&\s/);
      expect(cleanEmergency).not.toMatch(/\s&\s/);
    });

    it("verifies green color is strictly quarantined to micro status indicators", () => {
      const heroHtml = renderToStaticMarkup(createElement(Hero));
      // Shouldn't have raw dominant green utility classes like bg-green-500, bg-emerald-600, etc.
      expect(heroHtml).not.toMatch(/bg-green-[4-9]00/);
      expect(heroHtml).not.toMatch(/bg-emerald-[4-9]00/);
      // Micro status dot class should be used
      expect(heroHtml).toContain("micro-status-dot");
    });
  });
});
