import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PatientImageViewer } from "@/components/panel/PatientMedia";
import { LanguageContext } from "@/lib/i18n/language-context";
import { translations } from "@/lib/i18n/translations";

function renderViewer(photo: { id: string; name: string; data_url: string; date: string }) {
  return renderToStaticMarkup(
    createElement(
      LanguageContext.Provider,
      { value: { lang: "en", t: translations.en, setLang: () => {} } },
      createElement(PatientImageViewer, { images: [photo], index: 0, onClose: () => {} }),
    ),
  );
}

describe("PatientMedia SVG and filename hardening", () => {
  it("refuses to render or offer downloads for SVG data URLs", () => {
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from("<svg><script>alert(1)</script></svg>").toString("base64")}`;
    const html = renderViewer({ id: "bad-1", name: "lab.svg", data_url: svgDataUrl, date: "2026-01-01" });
    expect(html).not.toContain("<img");
    expect(html).not.toContain("download=");
    expect(html).not.toContain("data:image/svg+xml");
  });

  it("renders valid PNG photos and forces a safe raster download extension", () => {
    const pngDataUrl = "data:image/png;base64,iVBORw0KGgo=";
    const html = renderViewer({ id: "ok-1", name: "lab.svg", data_url: pngDataUrl, date: "2026-01-01" });
    expect(html).toContain("<img");
    expect(html).toContain('download="lab.png"');
  });
});
