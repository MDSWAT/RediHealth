import { describe, expect, it } from "vitest";
import {
  buildEmergencyResponse,
  buildSystemInstruction,
  buildUserText,
  buildVisionSystemInstruction,
  buildVisionUserText,
  normalizeJsonPayload,
  parseAssistantReply,
  urgentPattern,
} from "@/lib/health-assistant";

describe("parseAssistantReply", () => {
  it("accepts JSON wrapped in a code fence and clamps unknown values", () => {
    const reply = parseAssistantReply(
      "```json\n{\"urgency\":\"nonsense\",\"careLevel\":\"urgent\",\"possibleCause\":\"A\",\"message\":\"B\",\"questions\":[\"1\",2,\"3\",\"4\",\"5\"]}\n```",
      "en",
    );

    expect(reply).toMatchObject({
      urgency: "routine",
      careLevel: "urgent",
      possibleCause: "A",
      message: "B",
      questions: ["1", "3", "4"],
    });
  });

  it("falls back to localized defaults for missing fields", () => {
    const reply = parseAssistantReply("{}", "ro");
    expect(reply.careLevel).toBe("routine");
    expect(reply.message).toContain("profesionist medical");
    expect(reply.questions).toEqual([]);
  });

  it("throws when the model returns no JSON at all", () => {
    expect(() => parseAssistantReply("I cannot help with that.", "en")).toThrow();
  });
});

describe("assistant helpers", () => {
  it("extracts the JSON object from surrounding prose", () => {
    expect(normalizeJsonPayload("Sure! {\"a\":1} Hope that helps.")).toBe("{\"a\":1}");
  });

  it("flags emergency wording before calling the model", () => {
    expect(urgentPattern.test("I have chest pain since morning")).toBe(true);
    expect(urgentPattern.test("mild headache")).toBe(false);
    expect(buildEmergencyResponse("it")).toMatchObject({ urgency: "emergency", careLevel: "emergency", questions: [] });
  });

  it("asks the model to answer in the visitor's language", () => {
    expect(buildSystemInstruction("sq")).toContain("in Albanian");
  });

  it("marks missing parts of the request explicitly", () => {
    expect(buildUserText({ symptoms: "", history: [], prescriptionContext: "" })).toBe(
      "Current message: Not provided\nConversation history:\nNot provided\nWhy the prescription was given: Not provided",
    );
  });

  it("instructs vision requests to recognize both prescriptions and medication boxes with confidence scoring", () => {
    const system = buildVisionSystemInstruction("en");
    expect(system).toContain("prescriptions");
    expect(system).toContain("medication boxes");
    expect(system).toContain("confidenceScore");
    expect(system).toContain("activeIngredient");
    expect(system).toContain("form");

    const userText = buildVisionUserText({
      symptoms: "Front of carton",
      history: [],
      prescriptionContext: "Pain or fever",
    });
    expect(userText).toContain("prescription or medication box");
    expect(userText).toContain("Pain or fever");
    expect(userText).toContain("Front of carton");
  });
});

describe("vision recognition confidence calibration", () => {
  it("preserves 100% accuracy and active ingredient metadata for crisp medication box JSON", () => {
    const raw = JSON.stringify({
      urgency: "routine",
      careLevel: "routine",
      possibleCause: "Standard pain relief box",
      message: "This is a clear photo of an ibuprofen carton.",
      questions: [],
      sourceKind: "medication_box",
      confidenceScore: 100,
      confidenceReason: "Every printed letter on the front carton is crisp and legible.",
      prescriptionText: "Nurofen 400 mg coated tablets - Ibuprofen",
      medicines: [
        {
          name: "Nurofen",
          activeIngredient: "Ibuprofen",
          form: "coated tablets",
          strength: "400 mg",
          purpose: "Fever and pain relief",
          confidence: 100,
        },
      ],
    });

    const parsed = parseAssistantReply(raw, "en", { hasImage: true });
    expect(parsed.sourceKind).toBe("medication_box");
    expect(parsed.confidenceScore).toBe(100);
    expect(parsed.confidenceReason).toContain("crisp");
    expect(parsed.medicines?.[0]).toMatchObject({
      name: "Nurofen",
      activeIngredient: "Ibuprofen",
      form: "coated tablets",
      strength: "400 mg",
      confidence: 100,
    });
  });

  it("caps confidenceScore <= 79 and item confidence <= 65 when [unclear] markers are present", () => {
    const raw = JSON.stringify({
      urgency: "routine",
      careLevel: "routine",
      possibleCause: "Prescription note",
      message: "Part of the dose is blurred.",
      questions: [],
      sourceKind: "prescription",
      confidenceScore: 100,
      confidenceReason: "Clear photo.",
      prescriptionText: "Augmentin 1 g - [unclear]",
      medicines: [
        {
          name: "Augmentin",
          strength: "1 g",
          morning: "[unclear]",
          unclear: true,
          confidence: 98,
        },
      ],
    });

    const parsed = parseAssistantReply(raw, "ro", { hasImage: true });
    expect(parsed.confidenceScore).toBeLessThanOrEqual(79);
    expect(parsed.medicines?.[0]?.confidence).toBeLessThanOrEqual(65);
  });

  it("caps confidenceScore <= 79 when Russian [неразборчиво] marker appears", () => {
    const raw = JSON.stringify({
      urgency: "routine",
      careLevel: "routine",
      possibleCause: "Рецепт",
      message: "Часть текста видна.",
      questions: [],
      sourceKind: "prescription",
      confidenceScore: 95,
      prescriptionText: "Амоксициллин 500 мг [неразборчиво]",
      medicines: [{ name: "Амоксициллин", strength: "500 мг", confidence: 90 }],
    });

    const parsed = parseAssistantReply(raw, "ru", { hasImage: true });
    expect(parsed.confidenceScore).toBeLessThanOrEqual(79);
  });

  it("caps confidenceScore <= 20 when unreadable or empty on image requests", () => {
    const unreadable = parseAssistantReply(
      JSON.stringify({
        urgency: "routine",
        careLevel: "routine",
        possibleCause: "Blurry photo",
        message: "Not readable.",
        questions: [],
        sourceKind: "unreadable",
        confidenceScore: 85,
      }),
      "en",
      { hasImage: true },
    );
    expect(unreadable.confidenceScore).toBeLessThanOrEqual(20);

    const emptyImage = parseAssistantReply(
      JSON.stringify({
        urgency: "routine",
        careLevel: "routine",
        possibleCause: "No medicine",
        message: "Nothing detected.",
        questions: [],
        confidenceScore: 70,
        medicines: [],
      }),
      "en",
      { hasImage: true },
    );
    expect(emptyImage.confidenceScore).toBeLessThanOrEqual(20);
  });

  it("computes deterministic fallback confidenceScore when omitted on image requests", () => {
    const averaged = parseAssistantReply(
      JSON.stringify({
        urgency: "routine",
        careLevel: "routine",
        possibleCause: "Medication box",
        message: "Two clear medicines.",
        questions: [],
        sourceKind: "medication_box",
        medicines: [
          { name: "Paracetamol", strength: "500 mg", confidence: 92 },
          { name: "Ibuprofen", strength: "200 mg", confidence: 84 },
        ],
      }),
      "en",
      { hasImage: true },
    );
    expect(averaged.confidenceScore).toBe(88);
  });
});
