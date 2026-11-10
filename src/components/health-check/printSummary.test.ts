import { describe, expect, it } from "vitest";
import { renderClinicalQrSvgData } from "./clinical-qr-svg";
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
          title: "Cod QR offline pentru medic",
          hint: "Medicul sau asistentul de la triaj poate scana codul QR cu camera telefonului ca să preia rezumatul fără internet.",
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
    expect(html).toContain("Cod QR offline pentru medic");
    expect(html).toContain("fără internet.");
  });
});
