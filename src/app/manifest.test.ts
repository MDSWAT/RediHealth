import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { config as proxyConfig } from "@/proxy";

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngDimensions(relativePublicUrl: string): { width: number; height: number } {
  const cleanRel = relativePublicUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", cleanRel);
  expect(fs.existsSync(filePath), `Missing public asset: ${filePath}`).toBe(true);

  const bytes = fs.readFileSync(filePath);
  expect(bytes.subarray(0, 8).equals(PNG_SIGNATURE), `Invalid PNG signature: ${filePath}`).toBe(true);
  expect(bytes.subarray(12, 16).toString("ascii")).toBe("IHDR");

  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function parseSizes(sizes: string | undefined): { width: number; height: number } {
  const match = sizes?.match(/^(\d+)x(\d+)$/);
  if (!match) {
    throw new Error(`Invalid sizes format: ${String(sizes)}`);
  }
  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

function matchesNextRegex(matcherPattern: string, pathname: string): boolean {
  const regex = new RegExp(`^${matcherPattern}$`);
  return regex.test(pathname);
}

describe("PWA web app manifest", () => {
  it("defines required standalone app metadata and copy invariants", () => {
    const data = manifest();

    expect(data.id).toBe("/");
    expect(data.name).toBe("RediHealth");
    expect(data.short_name).toBe("RediHealth");
    expect(data.start_url).toBe("/");
    expect(data.scope).toBe("/");
    expect(data.display).toBe("standalone");
    expect(data.display_override).toEqual(["standalone", "minimal-ui"]);
    expect(data.background_color).toBe("#ffffff");
    expect(data.theme_color).toBe("#ffffff");
    expect(data.categories).toEqual(["health", "medical"]);

    const copyFields = [
      data.name,
      data.short_name,
      data.description,
      ...(data.shortcuts ?? []).flatMap((shortcut) => [
        shortcut.name,
        shortcut.short_name,
        shortcut.description,
      ]),
      ...(data.screenshots ?? []).map((screenshot) => screenshot.label),
    ].filter((value): value is string => Boolean(value));

    for (const value of copyFields) {
      expect(value).not.toContain("&");
      expect(value).not.toContain("\u00b7");
    }
  });

  it("provides separate any and maskable icons matching raster PNG files on disk", () => {
    const data = manifest();
    const icons = data.icons ?? [];

    expect(icons).toHaveLength(4);
    for (const icon of icons) {
      expect(["any", "maskable"]).toContain(icon.purpose);
      expect(icon.purpose).not.toContain(" ");
      expect(icon.type).toBe("image/png");
      const expected = parseSizes(icon.sizes);
      const actual = readPngDimensions(icon.src);
      expect(actual).toEqual(expected);
    }

    expect(icons.filter((i) => i.purpose === "any").map((i) => i.sizes)).toEqual([
      "192x192",
      "512x512",
    ]);
    expect(icons.filter((i) => i.purpose === "maskable").map((i) => i.sizes)).toEqual([
      "192x192",
      "512x512",
    ]);

    expect(readPngDimensions("/pwa/apple-touch-icon.png")).toEqual({
      width: 180,
      height: 180,
    });
  });

  it("defines 3 sentence-cased shortcuts and narrow/wide screenshots with valid PNG assets", () => {
    const data = manifest();
    const shortcuts = data.shortcuts ?? [];

    expect(shortcuts.map((s) => ({ name: s.name, url: s.url }))).toEqual([
      { name: "Check symptoms", url: "/health-check" },
      { name: "Medicine check", url: "/prescription-review" },
      { name: "Find clinics and pharmacies", url: "/find-help" },
    ]);

    for (const shortcut of shortcuts) {
      const icon = shortcut.icons?.[0];
      expect(icon).toBeDefined();
      expect(icon?.type).toBe("image/png");
      expect(icon?.sizes).toBe("96x96");
      expect(readPngDimensions(icon!.src)).toEqual({ width: 96, height: 96 });
    }

    const screenshots = data.screenshots ?? [];
    expect(screenshots).toHaveLength(2);
    expect(screenshots[0]?.form_factor).toBe("narrow");
    expect(screenshots[0]?.sizes).toBe("1080x1920");
    expect(screenshots[1]?.form_factor).toBe("wide");
    expect(screenshots[1]?.sizes).toBe("1920x1080");

    for (const screenshot of screenshots) {
      expect(screenshot.type).toBe("image/png");
      expect(readPngDimensions(screenshot.src)).toEqual(parseSizes(screenshot.sizes));
    }
  });
});

describe("proxy matcher metadata exclusions", () => {
  it("excludes Next.js metadata and PWA endpoints while matching app routes", () => {
    const [matcherPattern] = proxyConfig.matcher;
    expect(matcherPattern).toBeTypeOf("string");

    const excludedPaths = [
      "/icon",
      "/icon.svg",
      "/apple-icon",
      "/apple-icon.png",
      "/manifest.webmanifest",
      "/manifest.json",
      "/favicon.ico",
      "/favicon-16x16.png",
      "/favicon-32x32.png",
      "/favicon-48x48.png",
      "/safari-pinned-tab.svg",
      "/robots.txt",
      "/sitemap.xml",
      "/offline-worker.js",
      "/pwa/pwa-192x192.png",
      "/api/health",
      "/_next/static/chunks/main.js",
      "/_next/image",
    ];
    for (const pathname of excludedPaths) {
      expect(matchesNextRegex(matcherPattern, pathname), `Should exclude ${pathname}`).toBe(false);
    }

    const includedPaths = [
      "/",
      "/health-check",
      "/health-assistant",
      "/find-help",
      "/medic-online",
      "/en",
      "/ro/health-check",
    ];
    for (const pathname of includedPaths) {
      expect(matchesNextRegex(matcherPattern, pathname), `Should match ${pathname}`).toBe(true);
    }
  });

  it("ships synchronous <head> favicon links and valid PNG/SVG icon assets on disk", () => {
    expect(readPngDimensions("/favicon-16x16.png")).toEqual({ width: 16, height: 16 });
    expect(readPngDimensions("/favicon-32x32.png")).toEqual({ width: 32, height: 32 });
    expect(readPngDimensions("/favicon-48x48.png")).toEqual({ width: 48, height: 48 });

    const pinnedSvg = fs.readFileSync(path.join(process.cwd(), "public/safari-pinned-tab.svg"), "utf8");
    expect(pinnedSvg).toContain("<svg");
    expect(pinnedSvg).toContain('fill="#000000"');

    const iconSvg = fs.readFileSync(path.join(process.cwd(), "src/app/icon.svg"), "utf8");
    expect(iconSvg).toContain('fill="#CC3746"');
    expect(iconSvg).toContain('fill="#AC2A39"');

    const layoutSrc = fs.readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
    expect(layoutSrc).toContain("<head>");
    expect(layoutSrc).toContain('/icon.svg?v=3');
    expect(layoutSrc).toContain('/favicon-32x32.png?v=3');
    expect(layoutSrc).toContain('/favicon.ico?v=3');
    expect(layoutSrc).toContain('/safari-pinned-tab.svg?v=3');
  });
});
