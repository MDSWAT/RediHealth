import { describe, expect, it } from "vitest";
import { classifyInstituteOwnership } from "./institute-ownership";

describe("classifyInstituteOwnership", () => {
  it("reads state hospitals and services from their administrative names", () => {
    expect(classifyInstituteOwnership("Spitalul Clinic Județean de Urgență Cluj", "hospital", "RO")).toBe("public");
    expect(classifyInstituteOwnership("Spitalul Orăşenesc Urlați", "hospital", "RO")).toBe("public");
    expect(classifyInstituteOwnership("Dispensar Medical Glodeanu Sărat", "clinic", "RO")).toBe("public");
    expect(classifyInstituteOwnership("Policlinica de Copii", "clinic", "RO")).toBe("public");
    expect(classifyInstituteOwnership("Centrul Medicilor de Familie nr. 6", "clinic", "MD")).toBe("public");
    expect(classifyInstituteOwnership("Casa della Salute di Sant'Ilario d'Enza", "clinic", "IT")).toBe("public");
    expect(classifyInstituteOwnership("Farmacia Comunale Palestro", "pharmacy", "IT")).toBe("public");
    expect(classifyInstituteOwnership("Dom zdravlja Čakovec", "gp", "HR")).toBe("public");
    expect(classifyInstituteOwnership("Gradska ljekarna Zagreb", "pharmacy", "HR")).toBe("public");
    expect(classifyInstituteOwnership("Qendra Shëndetësore Nr. 2", "clinic", "AL")).toBe("public");
  });

  it("reads private networks and company forms, even when the name also says clinic or hospital", () => {
    expect(classifyInstituteOwnership("Policlinica Regina Maria", "clinic", "RO")).toBe("private");
    expect(classifyInstituteOwnership("Spitalul MedLife Genesys Arad", "hospital", "RO")).toBe("private");
    expect(classifyInstituteOwnership("Monza Metropolitan Hospital", "hospital", "RO")).toBe("private");
    expect(classifyInstituteOwnership("Psiho Conseil SRL", "gp", "RO")).toBe("private");
    expect(classifyInstituteOwnership("Casa di cura Villa Igea", "hospital", "IT")).toBe("private");
    expect(classifyInstituteOwnership("Poliklinika Analiza", "gp", "HR")).toBe("private");
    expect(classifyInstituteOwnership("Spitali Amerikan Durrës", "hospital", "AL")).toBe("private");
  });

  it("uses a type default only where one side is overwhelmingly true", () => {
    expect(classifyInstituteOwnership("Spitalul Videle", "hospital", "RO")).toBe("public");
    expect(classifyInstituteOwnership("Catena", "pharmacy", "RO")).toBe("private");
    expect(classifyInstituteOwnership("Cabinet stomatologic Dr Alexa Cristina", "dentist", "RO")).toBe("private");
    // Family doctors and unbranded clinics are not guessed.
    expect(classifyInstituteOwnership("Dr. Selistean Mariana", "gp", "RO")).toBeNull();
    expect(classifyInstituteOwnership("Studio Medico Mazzini", "gp", "IT")).toBeNull();
    expect(classifyInstituteOwnership("Medical On Group", "clinic", "RO")).toBeNull();
  });

  it("does not read the import's placeholder name or Moldovan hospitals as private brands", () => {
    expect(classifyInstituteOwnership("Hospital", "hospital", "MD")).toBe("public");
    expect(classifyInstituteOwnership("Hospital", "hospital", "RO")).toBe("public");
    expect(classifyInstituteOwnership("Hospital Cociulia", "hospital", "MD")).toBe("public");
  });
});
