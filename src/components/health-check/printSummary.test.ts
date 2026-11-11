import { describe, expect, it } from "vitest";
import { renderClinicalQrSvgData } from "./clinical-qr-svg";
import { buildPainAreaDiagramSvg } from "./pain-area-diagram";
import { buildPrintSummaryHtml } from "./printSummary";

describe("buildPrintSummaryHtml", () => {
  it("renders the crisp vector SVG QR handoff block inside the printable PDF HTML", () => {
    const payload = [
      "Rezumatul simptomelor, RediHealth (10 noiembrie 2026)",
      "Zona: Pelvis și partea de jos a burții",
      "Simptomul: Usturime la urinare",
      "Nu a fost ales niciun semn de urgență.",
    ].join("\n");
    const qrSvg = renderClinicalQrSvgData(payload, 2);

    const html = buildPrintSummaryHtml(
      {
        lang: "ro",
        meta: "Pentru medic · 10 noiembrie 2026",
        title: "Simptomele pacientului",
        rows: [
          { label: "Zona", value: "Pelvis și partea de jos a burții" },
          { label: "Simptomul", value: "Usturime la urinare" },
        ],
        notes: ["Mergi la medicul de familie în câteva zile"],
        status: "Nu a fost ales niciun semn de urgență.",
        urgent: false,
        qr: {
          size: qrSvg.size,
          path: qrSvg.path,
          title: "Scanează codul QR pentru a deschide rezultatul",
          detail: "Recomandare oferită: Mergi la medicul de familie în câteva zile",
          hint: "Deschide direct această evaluare pe telefon sau pe ecranul medicului, cu zona dureroasă și pașii recomandați.",
        },
        footer: "Acesta nu este un diagnostic.",
        fileName: "Simptomele pacientului - 2026-11-10",
      },
      "https://redihealth.org/logo.svg",
    );

    expect(html).toContain('class="qr-handoff"');
    expect(html).toContain(`viewBox="0 0 ${qrSvg.size} ${qrSvg.size}"`);
    expect(html).toContain('shape-rendering="crispEdges"');
    expect(html).toContain(`d="${qrSvg.path}" fill="#0b132b"`);
    expect(html).toContain("Scanează codul QR pentru a deschide rezultatul");
    expect(html).toContain('class="qr-detail"');
    expect(html).toContain("Recomandare oferită: Mergi la medicul de familie în câteva zile");
  });

  it("embeds the anatomical pain area diagram alongside the clinical summary in the generated PDF", () => {
    const diagramSvg = buildPainAreaDiagramSvg({
      part: "head",
      subRegion: "neck",
      side: "Right",
      lang: "en",
    });
    const qrSvg = renderClinicalQrSvgData("https://redihealth.org/en/health-check?qr=1&p=head&sr=neck", 2);

    const html = buildPrintSummaryHtml(
      {
        lang: "en",
        meta: "For the doctor · 11 November 2026",
        title: "Symptom summary",
        rows: [
          { label: "Body area", value: "Head and neck" },
          { label: "Exact spot", value: "Neck · Right side" },
          { label: "Symptom", value: "Neck pain or stiff neck" },
        ],
        painDiagram: {
          svg: diagramSvg,
          heading: "Pain location on the body",
          primaryLocation: "Head and neck",
          secondaryLocation: "Neck · Right side",
        },
        notes: ["Recommendation given: See your family doctor within a few days"],
        status: "No emergency sign selected.",
        urgent: false,
        qr: {
          size: qrSvg.size,
          path: qrSvg.path,
          title: "Scan QR to reproduce this result",
          detail: "Recommendation given: See your family doctor within a few days",
          hint: "Opens this exact check on any phone or clinic screen with the pain area and guidance.",
        },
        footer: "This is not a medical diagnosis.",
        fileName: "Symptom summary - 2026-11-11",
      },
      "https://redihealth.org/logo.svg",
    );

    expect(html).toContain('class="clinical-grid"');
    expect(html).toContain('class="pain-map"');
    expect(html).toContain("Pain location on the body");
    expect(html).toContain("Neck · Right side");
    expect(html).toContain("Recommendation given: See your family doctor within a few days");
    expect(html).toContain("<svg");
  });
});
