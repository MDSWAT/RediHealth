import { describe, expect, it } from "vitest";
import { languages } from "@/lib/i18n/translations";
import { informedHealthCopy } from "@/lib/i18n/informedhealth-translations";
import { AREA_GROUPS, findInformedHealthAreas, informedHealthAreas } from "./informedhealth-directory";

describe("InformedHealth topic links", () => {
  it("contains every named topic area once with an original-source URL", () => {
    expect(informedHealthAreas).toHaveLength(51);
    expect(new Set(informedHealthAreas.map(area => area.id)).size).toBe(51);
    for (const area of informedHealthAreas) {
      const url = new URL(area.url);
      expect(url.origin).toBe("https://www.informedhealth.org");
      expect(url.pathname).toBe(`/topic-areas/${area.id}.html`);
      expect(area.groups.length).toBeGreaterThan(0);
      expect(area.groups.every(group => AREA_GROUPS.includes(group))).toBe(true);
    }
  });

  it.each(languages)("has topic names and directory controls in $code", ({ code }) => {
    for (const area of informedHealthAreas) expect(area.titles[code].trim().length).toBeGreaterThan(0);
    expect(informedHealthCopy[code].languageNote).toBeTruthy();
    expect(informedHealthCopy[code].results(51)).toContain("51");
    expect(Object.keys(informedHealthCopy[code].groups)).toEqual([...AREA_GROUPS]);
  });

  it("searches local names without accents, plus English source names", () => {
    expect(findInformedHealthAreas("ro", "inima").map(area => area.id)).toContain("heart-and-circulation");
    expect(findInformedHealthAreas("ru", "мочевывод").map(area => area.id)).toContain("kidneys-bladder-and-urinary-tract");
    expect(findInformedHealthAreas("sq", "pregnancy").map(area => area.id)).toEqual(["pregnancy-and-birth"]);
    expect(findInformedHealthAreas("it", "nothing matches this phrase")).toEqual([]);
  });

  it("filters by group and preserves topics appearing in multiple source groups", () => {
    for (const group of ["conditions", "body"] as const) {
      expect(findInformedHealthAreas("en", "heart", group).map(area => area.id)).toContain("heart-and-circulation");
    }
    expect(findInformedHealthAreas("en", "heart", "evidence")).toEqual([]);
    expect(findInformedHealthAreas("en", "", "all")).toHaveLength(51);
  });
});
