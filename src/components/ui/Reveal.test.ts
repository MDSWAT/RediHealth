import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Reveal } from "./Reveal";

describe("Reveal and CSS design tokens", () => {
  it("renders Reveal children immediately visible without scroll-hiding attributes", () => {
    const html = renderToStaticMarkup(
      createElement(
        Reveal,
        {
          as: "section",
          variant: "rise",
          stagger: "editorial",
          delay: 0.2,
          className: "custom-wrap",
        },
        createElement("p", null, "Visible content"),
      ),
    );

    expect(html).toBe('<section class="custom-wrap"><p>Visible content</p></section>');
    expect(html).not.toContain("data-reveal");
    expect(html).not.toContain("opacity:0");
  });

  it("enforces crisp neutral white tokens and zero hero aura or scroll-reveal CSS in globals.css", () => {
    const css = readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");
    const design = readFileSync(path.resolve(process.cwd(), "DESIGN.md"), "utf8");

    expect(css).toContain("--color-background: #ffffff;");
    expect(css).toContain("--color-paper: #ffffff;");
    expect(css).not.toMatch(/#fcfbf9|#fbfaf6|#f5eee3/i);
    expect(css).not.toContain(".hero-pointer-aura");
    expect(css).not.toContain("data-reveal");

    expect(design).toContain('background: "#ffffff"');
    expect(design).toContain('paper: "#ffffff"');
    expect(design).not.toMatch(/#fcfbf9|#fbfaf6/i);
  });
});
