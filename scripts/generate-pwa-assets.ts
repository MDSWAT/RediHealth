import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const LOGO_SVG_PATH = path.join(ROOT, "public", "Icons", "Logo.svg");
const OUTPUT_DIR = path.join(ROOT, "public", "pwa");

const TOKENS = {
  background: "#fcfbf9",
  ink950: "#0a1226",
  ink900: "#101a33",
  ink800: "#1b2744",
  foreground: "#0b132b",
  paper: "#fbfaf6",
  mist: "#a9b3c6",
  sapphire: "#1d3557",
  sapphireSoft: "#eff6ff",
  sapphireBorder: "#bfdbfe",
  ruby: "#c62f3c",
  rubySoft: "#fde8ea",
  mutedForeground: "#475569",
  border: "#e2e8f0",
  card: "#ffffff",
} as const;

const FONT_STACK = "system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

function extractLogoMarkInner(svgSource: string): string {
  const styleMatch = svgSource.match(/<style[^>]*>[\s\S]*?<\/style>/i);
  const pathMatches = svgSource.match(/<path\b[^>]*\/?>/gi);
  if (!pathMatches || pathMatches.length === 0) {
    throw new Error(`Could not extract <path> elements from ${LOGO_SVG_PATH}`);
  }
  return `${styleMatch ? styleMatch[0] : ""}\n${pathMatches.join("\n")}`;
}

function buildSquareMarkSvg(logoInner: string, size: number, markSize: number): Buffer {
  const offset = ((size - markSize) / 2).toFixed(2);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${TOKENS.background}" />
  <svg x="${offset}" y="${offset}" width="${markSize}" height="${markSize}" viewBox="4 4 56 56">
    ${logoInner}
  </svg>
</svg>`;
  return Buffer.from(svg, "utf8");
}

async function generateOpaquePngFromSvg(svg: Buffer, outputPath: string): Promise<void> {
  await sharp(svg)
    .flatten({ background: TOKENS.background })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function assertMaskableSafeZone(filePath: string, size: number, safeFraction = 0.66): Promise<void> {
  const { data, info } = await sharp(filePath).raw().toBuffer({ resolveWithObject: true });
  if (info.width !== size || info.height !== size) {
    throw new Error(`Expected ${filePath} to be ${size}x${size}, got ${info.width}x${info.height}`);
  }
  const cx = size / 2;
  const cy = size / 2;
  const maxSafeRadius = (size * safeFraction) / 2;
  // #fcfbf9 = (252, 251, 249)
  const [bgR, bgG, bgB] = [252, 251, 249];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * info.channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const differsFromBg = Math.abs(r - bgR) > 2 || Math.abs(g - bgG) > 2 || Math.abs(b - bgB) > 2;
      if (differsFromBg) {
        const dist = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
        if (dist > maxSafeRadius) {
          throw new Error(
            `Maskable icon ${path.basename(filePath)} has foreground pixel at (${x}, ${y}), radius ${dist.toFixed(1)}px > safe radius ${maxSafeRadius.toFixed(1)}px`,
          );
        }
      }
    }
  }
}

function buildShortcutSvg(glyphInner: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="${TOKENS.background}" />
  <rect x="8" y="8" width="80" height="80" rx="18" fill="${TOKENS.sapphireSoft}" stroke="${TOKENS.sapphireBorder}" stroke-width="1.5" />
  <svg x="26" y="26" width="44" height="44" viewBox="0 0 24 24">
    ${glyphInner}
  </svg>
</svg>`;
  return Buffer.from(svg, "utf8");
}

const SHORTCUT_GLYPHS = {
  symptoms: `<path fill="${TOKENS.sapphire}" d="M16.97 4.757a.999.999 0 0 0-1.918-.073l-3.186 9.554-2.952-6.644a1.002 1.002 0 0 0-1.843.034L5.323 12H2v2h3.323c.823 0 1.552-.494 1.856-1.257l.869-2.172 3.037 6.835c.162.363.521.594.915.594l.048-.001a.998.998 0 0 0 .9-.683l2.914-8.742.979 3.911A1.995 1.995 0 0 0 18.781 14H22v-2h-3.22l-1.81-7.243z" />`,
  assistant: `<circle cx="9.5" cy="9.5" r="1.5" fill="${TOKENS.sapphire}" />
    <circle cx="14.5" cy="9.5" r="1.5" fill="${TOKENS.sapphire}" />
    <path fill="${TOKENS.sapphire}" d="M12 2C6.486 2 2 5.589 2 10c0 2.908 1.897 5.515 5 6.934V22l5.34-4.004C17.697 17.852 22 14.32 22 10c0-4.411-4.486-8-10-8zm0 14h-.333L9 18v-2.417l-.641-.247C5.671 14.301 4 12.256 4 10c0-3.309 3.589-6 8-6s8 2.691 8 6-3.589 6-8 6z" />`,
  clinics: `<path fill="${TOKENS.sapphire}" d="M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.103 0 2 .897 2 2s-.897 2-2 2-2-.897-2-2 .897-2 2-2z" />
    <path fill="${TOKENS.sapphire}" d="M11.42 21.814a.998.998 0 0 0 1.16 0C12.884 21.599 20.029 16.44 20 10c0-4.411-3.589-8-8-8S4 5.589 4 9.995c-.029 6.445 7.116 11.604 7.42 11.819zM12 4c3.309 0 6 2.691 6 6.005.021 4.438-4.388 8.423-6 9.73-1.611-1.308-6.021-5.294-6-9.735 0-3.309 2.691-6 6-6z" />`,
  doctor: `<g fill="none" stroke="${TOKENS.sapphire}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 3H5v5a5 5 0 0 0 10 0V3h-1" />
      <path d="M10 13v2a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="11" r="2" />
    </g>`,
} as const;

function buildMobileScreenshotSvg(logoInner: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="${TOKENS.background}" />
  <rect width="1080" height="1010" fill="${TOKENS.ink950}" />

  <!-- Top bar -->
  <svg x="64" y="64" width="52" height="52" viewBox="4 4 56 56">
    ${logoInner}
  </svg>
  <text x="134" y="102" font-family="${FONT_STACK}" font-size="36" font-weight="700" fill="${TOKENS.paper}">RediHealth</text>

  <!-- Hero title and summary -->
  <text x="64" y="214" font-family="${FONT_STACK}" font-size="64" font-weight="700" fill="${TOKENS.paper}" letter-spacing="-1.5">Clear health guidance</text>
  <text x="64" y="292" font-family="${FONT_STACK}" font-size="64" font-weight="700" fill="${TOKENS.paper}" letter-spacing="-1.5">when you need it</text>
  <text x="64" y="362" font-family="${FONT_STACK}" font-size="30" font-weight="400" fill="${TOKENS.mist}">Free symptom checks, nearby clinics and pharmacies,</text>
  <text x="64" y="406" font-family="${FONT_STACK}" font-size="30" font-weight="400" fill="${TOKENS.mist}">and community health mediator support.</text>

  <!-- Elevated triage preview card -->
  <rect x="64" y="472" width="952" height="480" rx="24" fill="${TOKENS.paper}" />
  <text x="104" y="542" font-family="${FONT_STACK}" font-size="32" font-weight="700" fill="${TOKENS.foreground}">What can we help with today</text>

  <!-- Row 1 -->
  <rect x="104" y="582" width="872" height="102" rx="16" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="124" y="602" width="62" height="62" rx="14" fill="${TOKENS.sapphireSoft}" />
  <svg x="139" y="617" width="32" height="32" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.symptoms}</svg>
  <text x="208" y="628" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Check symptoms</text>
  <text x="208" y="662" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Step-by-step guidance in plain language</text>

  <!-- Row 2 -->
  <rect x="104" y="702" width="872" height="102" rx="16" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="124" y="722" width="62" height="62" rx="14" fill="${TOKENS.sapphireSoft}" />
  <svg x="139" y="737" width="32" height="32" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.assistant}</svg>
  <text x="208" y="748" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Health assistant</text>
  <text x="208" y="782" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Ask questions and prepare for a doctor visit</text>

  <!-- Row 3 -->
  <rect x="104" y="822" width="872" height="102" rx="16" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="124" y="842" width="62" height="62" rx="14" fill="${TOKENS.sapphireSoft}" />
  <svg x="139" y="857" width="32" height="32" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.doctor}</svg>
  <text x="208" y="868" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Online doctor</text>
  <text x="208" y="902" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Request a private medical consultation</text>

  <!-- Lower care finder section -->
  <text x="64" y="1096" font-family="${FONT_STACK}" font-size="44" font-weight="700" fill="${TOKENS.foreground}" letter-spacing="-0.8">Find nearby clinics and pharmacies</text>
  <text x="64" y="1146" font-family="${FONT_STACK}" font-size="26" font-weight="400" fill="${TOKENS.mutedForeground}">Local medical offices, pharmacies, and health mediators.</text>

  <!-- Care finder card -->
  <rect x="64" y="1192" width="952" height="270" rx="24" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="104" y="1232" width="68" height="68" rx="16" fill="${TOKENS.sapphireSoft}" />
  <svg x="120" y="1248" width="36" height="36" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.clinics}</svg>
  <text x="196" y="1264" font-family="${FONT_STACK}" font-size="32" font-weight="700" fill="${TOKENS.foreground}">Clinics and pharmacies near you</text>
  <text x="196" y="1302" font-family="${FONT_STACK}" font-size="24" font-weight="400" fill="${TOKENS.mutedForeground}">Verified locations, directions, and opening hours</text>
  <rect x="104" y="1352" width="320" height="72" rx="14" fill="${TOKENS.sapphire}" />
  <text x="264" y="1397" text-anchor="middle" font-family="${FONT_STACK}" font-size="26" font-weight="600" fill="${TOKENS.card}">Find care nearby</text>

  <!-- Emergency 112 card -->
  <rect x="64" y="1498" width="952" height="248" rx="24" fill="${TOKENS.rubySoft}" stroke="${TOKENS.ruby}" stroke-width="2" />
  <text x="104" y="1564" font-family="${FONT_STACK}" font-size="32" font-weight="700" fill="${TOKENS.foreground}">Emergency help</text>
  <text x="104" y="1608" font-family="${FONT_STACK}" font-size="24" font-weight="400" fill="${TOKENS.foreground}">Call 112 right away for chest pain, trouble breathing,</text>
  <text x="104" y="1642" font-family="${FONT_STACK}" font-size="24" font-weight="400" fill="${TOKENS.foreground}">or sudden weakness.</text>
  <rect x="104" y="1668" width="220" height="54" rx="12" fill="${TOKENS.ruby}" />
  <text x="214" y="1703" text-anchor="middle" font-family="${FONT_STACK}" font-size="24" font-weight="700" fill="${TOKENS.card}">Call 112</text>

  <!-- Footer trust copy -->
  <text x="64" y="1844" font-family="${FONT_STACK}" font-size="24" font-weight="500" fill="${TOKENS.mutedForeground}">Private by design. Works offline for saved guidance.</text>
</svg>`;
  return Buffer.from(svg, "utf8");
}

function buildDesktopScreenshotSvg(logoInner: string): Buffer {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <rect width="1920" height="1080" fill="${TOKENS.ink950}" />

  <!-- Top header -->
  <rect x="0" y="0" width="1920" height="112" fill="${TOKENS.ink900}" />
  <svg x="88" y="30" width="52" height="52" viewBox="4 4 56 56">
    ${logoInner}
  </svg>
  <text x="158" y="68" font-family="${FONT_STACK}" font-size="34" font-weight="700" fill="${TOKENS.paper}">RediHealth</text>

  <text x="520" y="66" font-family="${FONT_STACK}" font-size="24" font-weight="500" fill="${TOKENS.mist}">Check symptoms</text>
  <text x="760" y="66" font-family="${FONT_STACK}" font-size="24" font-weight="500" fill="${TOKENS.mist}">Health information</text>
  <text x="1030" y="66" font-family="${FONT_STACK}" font-size="24" font-weight="500" fill="${TOKENS.mist}">Find care</text>
  <text x="1194" y="66" font-family="${FONT_STACK}" font-size="24" font-weight="500" fill="${TOKENS.mist}">Online doctor</text>

  <rect x="1584" y="28" width="248" height="56" rx="12" fill="${TOKENS.sapphire}" />
  <text x="1708" y="64" text-anchor="middle" font-family="${FONT_STACK}" font-size="22" font-weight="600" fill="${TOKENS.card}">Health assistant</text>

  <!-- Left editorial column -->
  <text x="88" y="264" font-family="${FONT_STACK}" font-size="72" font-weight="700" fill="${TOKENS.paper}" letter-spacing="-1.8">Free, clear health</text>
  <text x="88" y="348" font-family="${FONT_STACK}" font-size="72" font-weight="700" fill="${TOKENS.paper}" letter-spacing="-1.8">information and</text>
  <text x="88" y="432" font-family="${FONT_STACK}" font-size="72" font-weight="700" fill="${TOKENS.paper}" letter-spacing="-1.8">symptom guidance</text>

  <text x="88" y="514" font-family="${FONT_STACK}" font-size="28" font-weight="400" fill="${TOKENS.mist}">Check your symptoms step by step, read plain-language guides,</text>
  <text x="88" y="556" font-family="${FONT_STACK}" font-size="28" font-weight="400" fill="${TOKENS.mist}">find nearby clinics and pharmacies, and reach a health mediator.</text>

  <!-- Primary and secondary actions -->
  <rect x="88" y="636" width="290" height="72" rx="14" fill="${TOKENS.paper}" />
  <text x="233" y="681" text-anchor="middle" font-family="${FONT_STACK}" font-size="26" font-weight="700" fill="${TOKENS.ink950}">Check symptoms</text>

  <rect x="404" y="636" width="380" height="72" rx="14" fill="${TOKENS.ink800}" stroke="${TOKENS.mist}" stroke-width="1.5" />
  <text x="594" y="681" text-anchor="middle" font-family="${FONT_STACK}" font-size="26" font-weight="600" fill="${TOKENS.paper}">Find clinics and pharmacies</text>

  <!-- Trust line -->
  <text x="88" y="788" font-family="${FONT_STACK}" font-size="24" font-weight="500" fill="${TOKENS.mist}">Seven languages supported. Works offline for saved guidance.</text>

  <!-- Emergency strip on dark -->
  <rect x="88" y="852" width="760" height="128" rx="18" fill="${TOKENS.ink900}" stroke="${TOKENS.ruby}" stroke-width="2" />
  <text x="122" y="904" font-family="${FONT_STACK}" font-size="26" font-weight="700" fill="${TOKENS.paper}">Emergency support</text>
  <text x="122" y="944" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mist}">Call 112 right away for severe symptoms or urgent danger.</text>

  <!-- Right clinical directory card -->
  <rect x="944" y="180" width="888" height="800" rx="28" fill="${TOKENS.background}" />
  <text x="1000" y="256" font-family="${FONT_STACK}" font-size="36" font-weight="700" fill="${TOKENS.foreground}">Start with what you need today</text>
  <text x="1000" y="298" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Choose a service for clear next steps and local care options.</text>

  <!-- Card Row 1 -->
  <rect x="1000" y="340" width="776" height="126" rx="18" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="1024" y="366" width="74" height="74" rx="16" fill="${TOKENS.sapphireSoft}" />
  <svg x="1043" y="385" width="36" height="36" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.symptoms}</svg>
  <text x="1124" y="396" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Check symptoms</text>
  <text x="1124" y="434" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Structured symptom guidance with clear red-flag warnings</text>

  <!-- Card Row 2 -->
  <rect x="1000" y="486" width="776" height="126" rx="18" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="1024" y="512" width="74" height="74" rx="16" fill="${TOKENS.sapphireSoft}" />
  <svg x="1043" y="531" width="36" height="36" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.assistant}</svg>
  <text x="1124" y="542" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Health assistant</text>
  <text x="1124" y="580" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Plain-language answers and visit preparation</text>

  <!-- Card Row 3 -->
  <rect x="1000" y="632" width="776" height="126" rx="18" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="1024" y="658" width="74" height="74" rx="16" fill="${TOKENS.sapphireSoft}" />
  <svg x="1043" y="677" width="36" height="36" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.clinics}</svg>
  <text x="1124" y="688" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Find clinics and pharmacies</text>
  <text x="1124" y="726" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Nearby medical offices, pharmacies, and health mediators</text>

  <!-- Card Row 4 -->
  <rect x="1000" y="778" width="776" height="126" rx="18" fill="${TOKENS.card}" stroke="${TOKENS.border}" stroke-width="2" />
  <rect x="1024" y="804" width="74" height="74" rx="16" fill="${TOKENS.sapphireSoft}" />
  <svg x="1043" y="823" width="36" height="36" viewBox="0 0 24 24">${SHORTCUT_GLYPHS.doctor}</svg>
  <text x="1124" y="834" font-family="${FONT_STACK}" font-size="28" font-weight="700" fill="${TOKENS.foreground}">Online doctor</text>
  <text x="1124" y="872" font-family="${FONT_STACK}" font-size="22" font-weight="400" fill="${TOKENS.mutedForeground}">Private video consultation and prescription review</text>
</svg>`;
  return Buffer.from(svg, "utf8");
}

async function main(): Promise<void> {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const logoSvgSource = fs.readFileSync(LOGO_SVG_PATH, "utf8");
  const logoInner = extractLogoMarkInner(logoSvgSource);

  // Standard PWA icons (~78% centered mark on opaque warm paper #fcfbf9)
  await generateOpaquePngFromSvg(
    buildSquareMarkSvg(logoInner, 192, Math.round(192 * 0.78)),
    path.join(OUTPUT_DIR, "pwa-192x192.png"),
  );
  await generateOpaquePngFromSvg(
    buildSquareMarkSvg(logoInner, 512, Math.round(512 * 0.78)),
    path.join(OUTPUT_DIR, "pwa-512x512.png"),
  );

  // Maskable PWA icons (mark strictly inside central 66% safe zone on opaque #fcfbf9)
  const maskable192Path = path.join(OUTPUT_DIR, "pwa-maskable-192x192.png");
  const maskable512Path = path.join(OUTPUT_DIR, "pwa-maskable-512x512.png");
  await generateOpaquePngFromSvg(buildSquareMarkSvg(logoInner, 192, 118), maskable192Path);
  await generateOpaquePngFromSvg(buildSquareMarkSvg(logoInner, 512, 316), maskable512Path);
  await assertMaskableSafeZone(maskable192Path, 192, 0.66);
  await assertMaskableSafeZone(maskable512Path, 512, 0.66);

  // Apple touch icon (180x180 opaque #fcfbf9 matching src/app/apple-icon.png proportions)
  await generateOpaquePngFromSvg(
    buildSquareMarkSvg(logoInner, 180, 112),
    path.join(OUTPUT_DIR, "apple-touch-icon.png"),
  );

  // App-drawer long-press shortcut icons (96x96 on #fcfbf9 with #eff6ff sapphire-soft plate)
  await generateOpaquePngFromSvg(
    buildShortcutSvg(SHORTCUT_GLYPHS.symptoms),
    path.join(OUTPUT_DIR, "shortcut-symptoms-96x96.png"),
  );
  await generateOpaquePngFromSvg(
    buildShortcutSvg(SHORTCUT_GLYPHS.assistant),
    path.join(OUTPUT_DIR, "shortcut-assistant-96x96.png"),
  );
  await generateOpaquePngFromSvg(
    buildShortcutSvg(SHORTCUT_GLYPHS.clinics),
    path.join(OUTPUT_DIR, "shortcut-clinics-96x96.png"),
  );
  await generateOpaquePngFromSvg(
    buildShortcutSvg(SHORTCUT_GLYPHS.doctor),
    path.join(OUTPUT_DIR, "shortcut-doctor-96x96.png"),
  );

  // Editorial install preview screenshots (1080x1920 narrow + 1920x1080 wide)
  await generateOpaquePngFromSvg(
    buildMobileScreenshotSvg(logoInner),
    path.join(OUTPUT_DIR, "screenshot-mobile.png"),
  );
  await generateOpaquePngFromSvg(
    buildDesktopScreenshotSvg(logoInner),
    path.join(OUTPUT_DIR, "screenshot-desktop.png"),
  );

  console.log("Generated all 11 PWA icon and screenshot assets in public/pwa/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
