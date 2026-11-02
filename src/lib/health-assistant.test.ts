import { describe, expect, it } from "vitest";
import {
  buildEmergencyResponse,
  buildSystemInstruction,
  buildUserText,
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
});
