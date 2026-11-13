import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { litProgress, litTopicIndex, WHEEL_ORDER } from "./health-topics-wheel-config";

const readLandingFile = (name: string) => readFileSync(path.resolve(__dirname, name), "utf8");

describe("HealthTopicsWheel hover pause and persistent selection", () => {
  const wheelCss = readLandingFile("HealthTopicsWheel.module.css");
  const spotlightTsx = readLandingFile("HealthTopicsSpotlight.tsx");

  it("pauses all animated wheel layers on wheel hover, focus-within, and data-wheel-held", () => {
    const layers = [".outer", ".inner", ".hub", ".face", ".lit"];
    const triggers = [".wheel:hover", ".wheel:focus-within", ":global([data-wheel-held])"];

    for (const trigger of triggers) {
      for (const layer of layers) {
        expect(wheelCss).toContain(`${trigger} ${layer}`);
      }
    }

    expect(wheelCss).toMatch(/\.node\[data-picked\]\s*\{[^}]*z-index:\s*1/);
    expect(wheelCss).toMatch(/\.node:hover,\s*\.node:focus-visible\s*\{[^}]*z-index:\s*2/);
    expect(wheelCss).toContain("animation-play-state: paused;");
  });

  it("persists topic selection via data-picked after pointer leaves or focus shifts inside spotlight", () => {
    expect(spotlightTsx).toContain("data-wheel-held={held ? \"\" : undefined}");
    expect(spotlightTsx).toContain('node.toggleAttribute("data-picked", node.dataset.topic === slug)');
    expect(spotlightTsx).toContain("onPointerOver={(event) => selectFromWheelTarget(event.target)}");
    expect(spotlightTsx).toContain("onFocus={(event) => selectFromWheelTarget(event.target)}");
    expect(spotlightTsx).toContain("onPointerEnter={() => selectTopic(slug, true)}");
    expect(spotlightTsx).toContain("onFocus={() => selectTopic(slug, true)}");
    expect(spotlightTsx).toContain("onPointerLeave={() => setHeld(false)}");
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
