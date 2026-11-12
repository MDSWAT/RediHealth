import { describe, expect, it } from "vitest";
import { extractRomaniMessages, validateRomaniCatalog, type RomaniCatalog } from "../../../scripts/lib/romani-catalog";

const example = `
const en = { title: "Choose a doctor", href: "/find-help", id: "doctor", count: (n: number) => \`Found \${n} places\` };
export const copy = { en, ro: {}, sq: {}, it: {} };
`;

function catalog(): RomaniCatalog {
  return {
    format: "redihealth-translations-v1", sourceLanguage: "en", targetLanguage: "rom",
    variety: "Standard written Romani used in Romania",
    messages: extractRomaniMessages("src/example.ts", example),
  };
}

describe("Romani translation handoff", () => {
  it("extracts meaningful messages without translating routes or identifiers", () => {
    expect(catalog().messages.map(message => message.source)).toEqual(["Choose a doctor", "Found {__slot_0} places"]);
    expect(catalog().messages[1].placeholders).toEqual(["{__slot_0}"]);
    expect(catalog().messages.every(message => message.status === "needs_translation" && message.translation === "")).toBe(true);
  });

  it("keeps complete template sentences and source placeholders together", () => {
    const text = 'const copy = { en: { step: (x: number, y: number) => `Step ${x} of ${y}`, loading: "Loading {progress}%" }, ro: {} };';
    const messages = extractRomaniMessages("src/example.ts", text);
    expect(messages.map(message => message.source)).toEqual(["Step {__slot_0} of {__slot_1}", "Loading {progress}%"]);
  });

  it("uses stable identifiers across whitespace and source-line changes", () => {
    const first = catalog().messages.map(message => message.id);
    expect(extractRomaniMessages("src/example.ts", "\n\n" + example).map(message => message.id)).toEqual(first);
  });

  it("does not accept untranslated or unreviewed content as ready", () => {
    const expected = catalog();
    expect(validateRomaniCatalog(expected, expected).filter(error => error.startsWith("Missing translation"))).toHaveLength(2);
    const translated = structuredClone(expected);
    for (const message of translated.messages) { message.translation = message.source; message.status = "translated"; }
    expect(validateRomaniCatalog(expected, translated).filter(error => error.startsWith("Review required"))).toHaveLength(2);
  });

  it("allows placeholder reordering but rejects lost placeholders and changed clinical numbers", () => {
    const expected = catalog();
    const translated = structuredClone(expected);
    for (const message of translated.messages) { message.translation = message.source; message.status = "reviewed"; message.reviewer = "Test reviewer"; }
    expect(validateRomaniCatalog(expected, translated)).toEqual([]);
    translated.messages[1].translation = "Places";
    expect(validateRomaniCatalog(expected, translated)).toContain(`Placeholders changed: ${translated.messages[1].id}`);
    const numerical: RomaniCatalog = { ...expected, messages: extractRomaniMessages("src/example.ts", 'const x = { en: { call: "Call 112" }, ro: {} };') };
    const damaged = structuredClone(numerical);
    damaged.messages[0] = { ...damaged.messages[0], translation: "Call 911", status: "reviewed", reviewer: "Test" };
    expect(validateRomaniCatalog(numerical, damaged)).toContain(`Numbers changed: ${damaged.messages[0].id}`);
  });

  it("rejects missing, duplicate and stale messages and the wrong Romani variety", () => {
    const expected = catalog();
    const candidate = structuredClone(expected);
    candidate.messages = [candidate.messages[0], candidate.messages[0]];
    expect(validateRomaniCatalog(expected, candidate).some(error => error.startsWith("Duplicate message"))).toBe(true);
    expect(validateRomaniCatalog(expected, candidate).some(error => error.startsWith("Missing message"))).toBe(true);
    candidate.messages[0].source = "A changed source";
    expect(validateRomaniCatalog(expected, candidate).some(error => error.startsWith("Source changed"))).toBe(true);
    expect(validateRomaniCatalog(expected, { ...candidate, variety: "Southern Vlax" })).toEqual(["Catalog format, language or Romani variety does not match."]);
  });

  it("preserves links embedded in translated sentences", () => {
    const expected: RomaniCatalog = { ...catalog(), messages: extractRomaniMessages("src/example.ts", 'const x = { en: { help: "Find help: https://redihealth.org/find-help" }, ro: {} };') };
    const damaged = structuredClone(expected);
    damaged.messages[0] = { ...damaged.messages[0], translation: "Help: https://example.org/find-help", status: "reviewed", reviewer: "Test" };
    expect(validateRomaniCatalog(expected, damaged)).toContain(`Links changed: ${damaged.messages[0].id}`);
  });
});
