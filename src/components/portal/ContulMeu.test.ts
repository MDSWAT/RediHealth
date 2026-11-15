import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { contulMeuCopy, type ContulMeuCopy } from "@/components/portal/contul-meu-copy";
import { ContulMeuShowcase } from "@/components/portal/ContulMeuShowcase";
import { translations, type Lang } from "@/lib/i18n/translations";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const LANGS: Lang[] = ["ro", "en", "sq", "it", "hr", "rom", "ru"];
const ALLOWED_CAPS = new Set(["SMS", "REDI", "CNAS"]);

function allStrings(copy: ContulMeuCopy): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === "string") out.push(value);
    else if (typeof value === "function") out.push(String(value(1, 2)));
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };
  walk(copy);
  return out;
}

function keyShape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(keyShape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, keyShape(inner)]));
  }
  return typeof value;
}

describe("contul-meu copy", () => {
  it("defines identical keys and non-empty strings in all 7 locales", () => {
    const reference = JSON.stringify(keyShape(contulMeuCopy.ro));
    for (const lang of LANGS) {
      expect(JSON.stringify(keyShape(contulMeuCopy[lang])), lang).toBe(reference);
      for (const text of allStrings(contulMeuCopy[lang])) {
        expect(text.trim(), lang).not.toBe("");
      }
    }
  });

  it("enforces strict sentence case, zero ampersands, and valid acronyms", () => {
    for (const lang of LANGS) {
      for (const text of allStrings(contulMeuCopy[lang])) {
        expect(text, `${lang}: "${text}"`).not.toContain("&");
        for (const word of text.match(/\b[\p{Lu}]{3,}\b/gu) ?? []) {
          expect(ALLOWED_CAPS.has(word), `${lang}: unexpected ALL-CAPS word "${word}" in "${text}"`).toBe(true);
        }
        // Check no unexpected Title Case mid-sentence (words starting with capital letter not preceded by sentence boundary)
        const tokens = text.split(/\s+/);
        tokens.forEach((token, idx) => {
          if (idx === 0) return;
          const prev = tokens[idx - 1];
          const afterSentenceEnd = /[.?!:]$/.test(prev);
          const clean = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");
          if (!clean || ALLOWED_CAPS.has(clean) || afterSentenceEnd) return;
          expect(
            /^\p{Lu}\p{Ll}/u.test(clean),
            `${lang}: unexpected mid-sentence capitalization "${clean}" in "${text}"`,
          ).toBe(false);
        });
      }
    }
  });

  it("uses mediator in Albanian and never ndërmjetës", () => {
    for (const text of allStrings(contulMeuCopy.sq)) {
      expect(text.toLowerCase()).not.toContain("ndërmjetës");
    }
  });
});

describe("ContulMeuShowcase render", () => {
  it("renders single h1, 3 preview features, phone form, mediator fallback, and zero rest bg-primary", () => {
    for (const lang of ["ro", "en", "sq", "it"] as const) {
      const html = renderToStaticMarkup(createElement(ContulMeuShowcase, { initialLang: lang }));
      const h1Matches = html.match(/<h1\b/g) ?? [];
      expect(h1Matches).toHaveLength(1);
      expect(html).toContain(translations[lang].accountAuthPage.title);
      expect(html).toContain('id="authPhone"');
      expect(html).toContain("/mediatori#solicita");
      for (const feature of contulMeuCopy[lang].features) {
        expect(html).toContain(feature.title);
      }
      expect(html).not.toContain("bg-primary ");
      expect(html).not.toContain('bg-primary"');
    }
  });
});
