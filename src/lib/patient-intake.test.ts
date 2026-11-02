import { describe, expect, it } from "vitest";
import { documentBytes, MAX_DOCUMENT_BYTES, validatePatientIntake } from "./patient-intake";

const pdf = `data:application/pdf;base64,${Buffer.from("%PDF-1.7\nexample").toString("base64")}`;
const document = { id: "doc-1", name: "test.pdf", category: "identity", data_url: pdf };
const intake = { has_documents: true, documents: [document], location: { latitude: 46.77, longitude: 23.59, accuracy: 10 } };

describe("patient intake validation", () => {
  it("accepts optional intake, document declarations without uploads, and coordinates at zero", () => {
    expect(validatePatientIntake(undefined)).toEqual({ ok: true, value: null });
    expect(validatePatientIntake(intake)).toEqual({ ok: true, value: intake });
    expect(validatePatientIntake({ has_documents: true, documents: [], location: null }).ok).toBe(true);
    expect(validatePatientIntake({ ...intake, location: { latitude: 0, longitude: 0, accuracy: 0 } }).ok).toBe(true);
  });

  it("checks actual file signatures rather than trusting the supplied MIME type", () => {
    expect(documentBytes(pdf)).toBe(Buffer.from("%PDF-1.7\nexample").length);
    for (const data of ["data:text/html;base64,PGgxPkhlbGxvPC9oMT4=", "data:application/pdf;base64,PGh0bWw+", "invalid", "data:image/png;base64,AAAA"]) {
      expect(documentBytes(data)).toBeNull();
    }
    for (const [mime, bytes] of [
      ["image/jpeg", "\xff\xd8\xfftest"],
      ["image/png", "\x89PNG\r\n\x1a\ntest"],
      ["image/webp", "RIFF0000WEBPtest"],
    ]) {
      expect(documentBytes(`data:${mime};base64,${Buffer.from(bytes, "latin1").toString("base64")}`)).not.toBeNull();
    }
  });

  it("enforces exact per-file and total size limits", () => {
    const makeFile = (size: number) => {
      const buffer = Buffer.alloc(size);
      buffer.write("%PDF-");
      return `data:application/pdf;base64,${buffer.toString("base64")}`;
    };
    const maxFile = makeFile(MAX_DOCUMENT_BYTES);
    expect(documentBytes(maxFile)).toBe(MAX_DOCUMENT_BYTES);
    expect(documentBytes(makeFile(MAX_DOCUMENT_BYTES + 1))).toBeNull();
    const documents = [0, 1, 2].map((id) => ({ ...document, id: String(id), data_url: maxFile }));
    expect(validatePatientIntake({ ...intake, documents: documents.slice(0, 2) }).ok).toBe(true);
    expect(validatePatientIntake({ ...intake, documents }).ok).toBe(false);
  });

  it("rejects malformed, contradictory, duplicate or excessive documents", () => {
    for (const value of [
      {}, [], { ...intake, has_documents: "yes" }, { ...intake, has_documents: false },
      { ...intake, documents: [document, document] },
      { ...intake, documents: Array.from({ length: 6 }, (_, id) => ({ ...document, id: String(id) })) },
      { ...intake, documents: [{ ...document, category: "other" }] },
    ]) {
      expect(validatePatientIntake(value).ok).toBe(false);
    }
  });

  it("rejects out-of-range and non-finite GPS values", () => {
    for (const location of [
      { latitude: 91, longitude: 0, accuracy: 1 }, { latitude: 0, longitude: -181, accuracy: 1 },
      { latitude: NaN, longitude: 0, accuracy: 1 }, { latitude: 0, longitude: Infinity, accuracy: 1 },
      { latitude: 0, longitude: 0, accuracy: -1 }, { latitude: "0", longitude: 0, accuracy: 1 },
    ]) expect(validatePatientIntake({ ...intake, location }).ok).toBe(false);
  });
});
