import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { expiredCopy, PortalLinkExpired } from "@/components/portal/PortalLinkExpired";
import { normalizePortalPhone } from "@/components/portal/SmsPhoneAuthModal";
import type { Lang } from "@/lib/i18n/translations";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/i18n/language-context", () => ({
  useLanguage: () => ({ lang: "ro", t: {}, setLang: () => {} }),
}));

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("expired SMS link page", () => {
  it("has calm phone-first copy in all 7 locales without email or ampersands", () => {
    for (const lang of LANGS) {
      const text = expiredCopy[lang];
      expect(text.title.length, lang).toBeGreaterThan(0);
      for (const s of strings(text)) {
        expect(s, lang).not.toContain("&");
        expect(s.toLowerCase(), lang).not.toMatch(/email address|adresa de email|adresën e emailit|indirizzo email|adresu e-pošte|адрес/);
      }
      expect(text.body, lang).toMatch(/SMS/);
    }
    expect(expiredCopy.ru.action).not.toBe("Get a new link");
    expect(expiredCopy.ru.action).toMatch(/[а-яА-Я]/);
  });

  it("routes to the phone sign-in and mediator help, never staff sign-in", () => {
    const html = renderToStaticMarkup(createElement(PortalLinkExpired));
    expect(html).toContain("/contul-meu");
    expect(html).toContain("/mediatori#solicita");
    expect(html).not.toContain("/sign-in");
    expect(html).toContain("min-h-12");
    expect(html).toContain("whitespace-nowrap");
  });
});

describe("phone normalization", () => {
  it("strips spaces, dots, dashes and parentheses", () => {
    expect(normalizePortalPhone("(0721) 000.000")).toBe("0721000000");
    expect(normalizePortalPhone("  0721-000 000 ")).toBe("0721000000");
  });
});
