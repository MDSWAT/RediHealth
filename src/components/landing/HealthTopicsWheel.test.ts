import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { litProgress, litTopicIndex, WHEEL_ORDER } from "./health-topics-wheel-config";

const readLandingFile = (name: string) => readFileSync(path.resolve(__dirname, name), "utf8");

describe("HealthTopicsWheel static resting state and persistent selection", () => {
  const wheelCss = readLandingFile("HealthTopicsWheel.module.css");
  const spotlightTsx = readLandingFile("HealthTopicsSpotlight.tsx");

  it("renders a static wheel without spin/highlight loops and uses sapphire on hover, focus, and picked nodes", () => {
    expect(wheelCss).not.toContain("@keyframes wheel-spin");
    expect(wheelCss).not.toContain("@keyframes wheel-highlight");
    expect(wheelCss).not.toContain(".lit");
    expect(wheelCss).not.toContain("animation:");
    expect(wheelCss).not.toContain("scale:");

    expect(wheelCss).toContain("--wheel-face-bg: var(--color-sapphire);");
    expect(wheelCss).toContain("var(--color-ring)");
    expect(wheelCss).toMatch(/\.node\[data-picked\]\s*\{[^}]*z-index:\s*1/);
    expect(wheelCss).toMatch(/\.node:hover,\s*\.node:focus-visible\s*\{[^}]*z-index:\s*2/);
  });

  it("persists topic selection via data-picked after pointer leaves or focus shifts inside spotlight", () => {
    expect(spotlightTsx).not.toContain("data-wheel-held");
    expect(spotlightTsx).toContain('node.toggleAttribute("data-picked", node.dataset.topic === slug)');
    expect(spotlightTsx).toContain("onPointerOver={(event) => selectFromWheelTarget(event.target)}");
    expect(spotlightTsx).toContain("onFocus={(event) => selectFromWheelTarget(event.target)}");
    expect(spotlightTsx).toContain("onPointerEnter={() => selectTopic(slug)}");
    expect(spotlightTsx).toContain("onFocus={() => selectTopic(slug)}");
    expect(spotlightTsx).not.toMatch(/selectTopic\(\s*null/);
    expect(spotlightTsx).not.toMatch(/setPicked\(\s*null/);
    expect(spotlightTsx).not.toContain("targeted");
  });

  it("maps each WHEEL_ORDER slot back to its index via litProgress and litTopicIndex", () => {
    WHEEL_ORDER.forEach((slug, index) => {
      const progress = litProgress(index, WHEEL_ORDER.length);
      expect(litTopicIndex(progress, WHEEL_ORDER.length), slug).toBe(index);
    });
  });
});
