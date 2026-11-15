import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ASSISTANT_COPY } from "@/components/health-assistant/assistant-copy";
import { PrescriptionStructuredResult } from "@/components/health-assistant/PrescriptionStructuredResult";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations, type Lang } from "@/lib/i18n/translations";

const LANGS = Object.keys(translations) as Lang[];

const { generateTextMock, checkRateLimitMock, verifyRecaptchaMock, notifyOperationalIssueMock } = vi.hoisted(() => ({
  generateTextMock: vi.fn(),
  checkRateLimitMock: vi.fn(async () => ({ allowed: true, retryAfterSeconds: 60 })),
  verifyRecaptchaMock: vi.fn(async () => null),
  notifyOperationalIssueMock: vi.fn(async () => {}),
}));

vi.mock("@/lib/llm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/llm")>();
  return {
    ...actual,
    generateText: generateTextMock,
  };
});

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
  getClientIp: vi.fn(() => "127.0.0.1"),
}));

vi.mock("@/lib/security/recaptcha", () => ({
  verifyRecaptcha: verifyRecaptchaMock,
}));

vi.mock("@/lib/operational-alerts", () => ({
  notifyOperationalIssue: notifyOperationalIssueMock,
}));

import { POST } from "@/app/api/health-assistant/route";
import { LlmError } from "@/lib/llm";

function renderResultHtml(lang: Lang, props: Parameters<typeof PrescriptionStructuredResult>[0]): string {
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang, t: translations[lang], setLang: () => {} } },
      createElement(PrescriptionStructuredResult, props),
    ),
  );
}

describe("PrescriptionStructuredResult box recognition and confidence display", () => {
  it.each(LANGS)("renders 100% accurate medication box output cleanly in %s", (lang: Lang) => {
    const copy = ASSISTANT_COPY[lang].result;
    const html = renderResultHtml(lang, {
      aiMessage: "Clear photo of Nurofen 400 mg tablets carton.",
      prescriptionText: "Nurofen 400 mg coated tablets - Ibuprofen",
      sourceKind: "medication_box",
      confidenceScore: 100,
      confidenceReason: "Every printed letter on the medication carton is crisp.",
      medicines: [
        {
          name: "Nurofen",
          activeIngredient: "Ibuprofen",
          form: "coated tablets",
          strength: "400 mg",
          purpose: "Pain and fever relief",
          confidence: 100,
        },
      ],
    });

    expect(html).toContain(copy.boxMedicinesHeading);
    expect(html).toContain(copy.boxTranscriptHeading);
    expect(html).toContain(copy.confidenceHeading);
    expect(html).toContain(copy.confidenceExact(100));
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuenow="100"');
    expect(html).toContain("Nurofen");
    expect(html).toContain("Ibuprofen");
    expect(html).toContain("400 mg");
    expect(html).toContain(copy.confidenceItemLine(100));
    expect(html).not.toContain("rounded-full");
    expect(html.replace(/class="[^"]*"/g, "")).not.toContain("&amp;");
  });

  it.each(LANGS)("renders calibrated partial confidence and check note when unclear in %s", (lang: Lang) => {
    const copy = ASSISTANT_COPY[lang].result;
    const html = renderResultHtml(lang, {
      aiMessage: "Part of the handwritten evening dose was blurred.",
      prescriptionText: "Augmentin 1 g - 1 - 0 - [unclear]",
      sourceKind: "prescription",
      confidenceScore: 72,
      confidenceReason: "The handwritten dose on the right edge was slightly blurred.",
      medicines: [
        {
          name: "Augmentin",
          strength: "1 g",
          morning: "1",
          evening: "[unclear]",
          unclear: true,
          confidence: 60,
        },
      ],
    });

    expect(html).toContain(copy.confidenceHeading);
    expect(html).toContain(copy.confidencePartial(72));
    expect(html).toContain(copy.confidenceCheckNote);
    expect(html).toContain('aria-valuenow="72"');
    expect(html).toContain(copy.confidenceItemLine(60));
    expect(html).toContain("The handwritten dose on the right edge was slightly blurred.");
    expect(html).not.toContain("rounded-full");
    expect(html.replace(/class="[^"]*"/g, "")).not.toContain("&amp;");
  });
});

describe("/api/health-assistant vision route", () => {
  beforeEach(() => {
    generateTextMock.mockReset();
    checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterSeconds: 60 });
    verifyRecaptchaMock.mockResolvedValue(null);
    notifyOperationalIssueMock.mockResolvedValue(undefined);
  });

  it("uses vision prompts and higher maxTokens for medication box images and returns calibrated score", async () => {
    generateTextMock.mockResolvedValueOnce({
      text: JSON.stringify({
        urgency: "routine",
        careLevel: "routine",
        possibleCause: "Over-the-counter fever reducer carton",
        message: "This carton contains Paracetamol 500 mg tablets.",
        questions: [],
        sourceKind: "medication_box",
        confidenceScore: 100,
        confidenceReason: "Front carton text is crisp and unobstructed.",
        prescriptionText: "Paracetamol 500 mg",
        medicines: [
          {
            name: "Paracetamol",
            activeIngredient: "Paracetamol",
            form: "tablets",
            strength: "500 mg",
            purpose: "Fever and pain relief",
            confidence: 100,
          },
        ],
      }),
      model: "claude-haiku-4-5-20251001",
    });

    const req = new Request("http://localhost:3000/api/health-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: "en",
        prescriptionContext: "Fever",
        prescription: { mimeType: "image/jpeg", data: "YWJj" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data).toMatchObject({
      sourceKind: "medication_box",
      confidenceScore: 100,
    });
    expect(generateTextMock).toHaveBeenCalledWith(
      expect.objectContaining({
        maxTokens: 2048,
        image: { mimeType: "image/jpeg", data: "YWJj" },
      }),
    );
    const callArgs = generateTextMock.mock.calls[0]?.[0] as { system: string; text: string };
    expect(callArgs.system).toContain("medication boxes");
    expect(callArgs.text).toContain("prescription or medication box");
  });

  it("caps returned confidenceScore when the vision model includes [unclear]", async () => {
    generateTextMock.mockResolvedValueOnce({
      text: JSON.stringify({
        urgency: "routine",
        careLevel: "routine",
        possibleCause: "Prescription note",
        message: "The morning dose was readable, strength blurred.",
        questions: [],
        sourceKind: "prescription",
        confidenceScore: 100,
        prescriptionText: "Amoxicillin [unclear]",
        medicines: [{ name: "Amoxicillin", strength: "[unclear]", unclear: true, confidence: 99 }],
      }),
      model: "claude-haiku-4-5-20251001",
    });

    const req = new Request("http://localhost:3000/api/health-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: "en",
        prescription: { mimeType: "image/jpeg", data: "YWJj" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { confidenceScore: number; medicines: Array<{ confidence: number }> };
    expect(data.confidenceScore).toBeLessThanOrEqual(79);
    expect(data.medicines[0]?.confidence).toBeLessThanOrEqual(65);
  });

  it("rejects base64 payloads over 5,000,000 characters with 400 image-too-large", async () => {
    const req = new Request("http://localhost:3000/api/health-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: "en",
        prescription: { mimeType: "image/jpeg", data: "a".repeat(5_000_001) },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "image-too-large" });
    expect(generateTextMock).not.toHaveBeenCalled();
  });

  it("returns 503 not-configured when the AI provider key is missing", async () => {
    generateTextMock.mockRejectedValueOnce(new LlmError("not-configured", "No API key configured"));

    const req = new Request("http://localhost:3000/api/health-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: "en",
        prescription: { mimeType: "image/jpeg", data: "YWJj" },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ code: "not-configured" });
  });

  it("keeps text-only triage requests at maxTokens 900", async () => {
    generateTextMock.mockResolvedValueOnce({
      text: JSON.stringify({
        urgency: "routine",
        careLevel: "routine",
        possibleCause: "Viral cold",
        message: "Rest and hydrate.",
        questions: [],
      }),
      model: "claude-haiku-4-5-20251001",
    });

    const req = new Request("http://localhost:3000/api/health-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lang: "en",
        symptoms: "Mild sore throat for 2 days",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(generateTextMock).toHaveBeenCalledWith(expect.objectContaining({ maxTokens: 900 }));
  });
});
