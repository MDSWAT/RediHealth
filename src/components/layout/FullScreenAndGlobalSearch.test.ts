import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createElement, type ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Container } from "@/components/ui/Container";

const readSrc = (relPath: string) => readFileSync(resolve(process.cwd(), relPath), "utf8");
const TestContainer = Container as unknown as ComponentType<{
  size?: "default" | "wide" | "workspace";
  className?: string;
}>;

describe("Full-screen workspace layout, navigation bar, and global search unification", () => {
  it("renders Container with full-screen max-w-none and skips conflicting max-w classes when custom max-w is passed", () => {
    for (const size of ["default", "wide", "workspace"] as const) {
      const html = renderToStaticMarkup(createElement(TestContainer, { size }, "Content"));
      expect(html).toContain("max-w-none");
    }

    const customHtml = renderToStaticMarkup(
      createElement(TestContainer, { size: "default", className: "max-w-xl" }, "Drawer"),
    );
    expect(customHtml).toContain("max-w-xl");
    expect(customHtml).not.toContain("max-w-none");
  });

  it("keeps desktop Header height constant, container width unified, guidance active, and menus exclusive", () => {
    const header = readSrc("src/components/layout/Header.tsx");
    expect(header).toContain("`${strip + bar}px`");
    expect(header).toContain("h-14 md:h-16");
    expect(header).toContain('containerSize = "workspace"');
    expect(header).toContain("isGuidanceRoute");
    expect(header).toContain("openHeaderMenu");
    expect(header).toContain("whitespace-nowrap");
    expect(header).not.toMatch(/aria-controls=\{startMenuId\}[\s\S]{0,400}rounded-full/);

    const comfort = readSrc("src/components/layout/ComfortMenu.tsx");
    expect(comfort).toContain("whitespace-nowrap");
    expect(comfort).not.toMatch(/h-1\.5 w-1\.5 rounded-full/);
    expect(comfort).not.toMatch(/h-2 w-2 rounded-full/);
  });

  it("includes AssistantNavigation across all four care-tool routes and uses a 2-column PrescriptionReview workspace", () => {
    for (const file of [
      "src/components/health-assistant/HealthAssistant.tsx",
      "src/components/health-check/HealthCheckExplorer.tsx",
      "src/components/health-assistant/PrescriptionReview.tsx",
      "src/components/find-help/FindHelpPageContent.tsx",
    ]) {
      expect(readSrc(file)).toContain("<AssistantNavigation />");
    }

    const rx = readSrc("src/components/health-assistant/PrescriptionReview.tsx");
    expect(rx).toContain("lg:grid-cols-[minmax(0,1fr)_21rem]");
    expect(rx).not.toContain("max-w-3xl");
    expect(rx).not.toContain("rounded-full");
  });

  it("wires all three health-information directory searches to openSmartSearch() with zero local search inputs", () => {
    for (const file of [
      "src/components/health-information/HealthInformationTopicGrid.tsx",
      "src/components/health-information/HealthArticleDirectory.tsx",
      "src/components/health-information/InformedHealthDirectory.tsx",
    ]) {
      const source = readSrc(file);
      expect(source).toContain("openSmartSearch()");
      expect(source).not.toContain('type="search"');
    }
  });
});
