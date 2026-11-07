import { translations, type Lang } from "../src/lib/i18n/translations";
import * as fs from "fs";
import * as path from "path";

interface Issue {
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  location: string;
  description: string;
  evidence: string;
}

const issues: Issue[] = [];

console.log("=== STARTING CHALLENGER 2 EMPIRICAL AUDIT ===");

// -------------------------------------------------------------
// AUDIT 1: Bare ampersands (&) in translation strings across ro, en, sq, it
// -------------------------------------------------------------
const langs: Lang[] = ["ro", "en", "sq", "it"];

function checkAmpersands(obj: unknown, pathStr: string, lang: string) {
  if (typeof obj === "string") {
    // Check for bare ampersand: not an HTML entity like &quot; or &amp;
    // Specifically looking for " & " or words joined by "&"
    if (/[^\w]&[^\w]|^\s*&\s*|\s&\s/.test(obj) || (obj.includes("&") && !obj.includes("&quot;") && !obj.includes("&amp;") && !obj.includes("&#"))) {
      issues.push({
        category: "Ampersand in Prose",
        severity: "CRITICAL",
        location: `${lang}.${pathStr}`,
        description: `Found ampersand (&) in prose text for language '${lang}'`,
        evidence: obj,
      });
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => checkAmpersands(item, `${pathStr}[${index}]`, lang));
  } else if (typeof obj === "object" && obj !== null) {
    const record = obj as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      checkAmpersands(record[key], `${pathStr}.${key}`, lang);
    }
  }
}

for (const lang of langs) {
  const heroObj = translations[lang]?.hero;
  if (!heroObj) {
    issues.push({
      category: "Missing Translation",
      severity: "CRITICAL",
      location: `translations.${lang}.hero`,
      description: `Missing hero translation block for '${lang}'`,
      evidence: "undefined",
    });
    continue;
  }
  checkAmpersands(heroObj, "hero", lang);
}

// -------------------------------------------------------------
// AUDIT 2: Hardcoded strings and ampersands in Hero components
// -------------------------------------------------------------
const componentFiles = [
  "src/components/landing/Hero.tsx",
  "src/components/landing/HeroEmergencyNotice.tsx",
  "src/components/landing/HeroDecisionTree.tsx",
  "src/components/landing/HeroPortals.tsx",
];

for (const relPath of componentFiles) {
  const fullPath = path.resolve(relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // Check for bare ampersands in JSX text or string literals (excluding boolean logic &&)
    // Match single ampersand not followed by & and not preceded by &
    const bareAmpMatch = line.match(/(?<![&|])&(?![&|#\w]+;)/);
    // Ignore lines that are comments or import statements or URLs or queries (?mode=...)
    if (bareAmpMatch && !line.trim().startsWith("//") && !line.includes("http") && !line.includes("mode=") && !line.includes("tab=")) {
      // Check if it's within JSX text or quotes
      if (/["'`][^"'`]*&[^"'`]*["'`]|>[^<]*&[^<]*</.test(line)) {
        issues.push({
          category: "Ampersand in Component",
          severity: "HIGH",
          location: `${relPath}:${idx + 1}`,
          description: "Potential bare ampersand in component prose or JSX",
          evidence: line.trim(),
        });
      }
    }

    // Check for unauthorized ALL CAPS or CSS 'uppercase'
    if (line.includes("uppercase")) {
      issues.push({
        category: "Sentence Casing Violation (CSS uppercase)",
        severity: "HIGH",
        location: `${relPath}:${idx + 1}`,
        description: "Found CSS class 'uppercase' which forces text into ALL CAPS, violating strict sentence casing rules",
        evidence: line.trim(),
      });
    }
  });
}

// -------------------------------------------------------------
// AUDIT 3: Sentence casing heuristics on titles, headings, badges, buttons
// -------------------------------------------------------------
const allowedAcronyms = new Set([
  "REDI", "CNAS", "FAST", "UPU", "112", "SMS", "CTA", "ID", "UI", "UX", "RO", "EN", "SQ", "IT"
]);

function checkSentenceCasing(text: string, pathStr: string, lang: string) {
  if (typeof text !== "string") return;
  const clean = text.trim();
  if (!clean) return;

  // Split by sentence delimiters or bullet points
  const segments = clean.split(/[.·!?—–\n:]/).map(s => s.trim()).filter(Boolean);

  for (const segment of segments) {
    // If the segment starts with a quotation mark or bracket, strip it
    const words = segment
      .replace(/^[«"'({\[]+/, "")
      .replace(/[»"')}\]]+$/, "")
      .split(/\s+/)
      .map(w => w.replace(/[^\p{L}\p{N}-]/gu, ""))
      .filter(w => w.length > 0);

    if (words.length <= 1) continue;

    // Check words after the first word
    const capitalizedNonFirstWords: string[] = [];
    for (let i = 1; i < words.length; i++) {
      const w = words[i];
      // Check if word starts with uppercase
      const firstChar = w[0];
      const isUpper = firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
      if (isUpper && !allowedAcronyms.has(w)) {
        // Exclude legitimate proper nouns like 'Roma', 'Romanian', etc. if reasonable
        if (["Roma", "Rom", "Rome"].includes(w)) continue;
        capitalizedNonFirstWords.push(w);
      }
    }

    // If 2 or more non-first words are capitalized, it's likely Title Case!
    if (capitalizedNonFirstWords.length >= 2 || (words.length >= 3 && capitalizedNonFirstWords.length >= 1 && capitalizedNonFirstWords.length / words.length > 0.4)) {
      issues.push({
        category: "Sentence Casing Violation (Title Case)",
        severity: "HIGH",
        location: `${lang}.${pathStr}`,
        description: `Potential Title Case detected instead of sentence casing (capitalized non-first words: ${capitalizedNonFirstWords.join(", ")})`,
        evidence: segment,
      });
    }

    // Check if the whole segment is ALL CAPS
    const isAllUpper = words.every(w => w === w.toUpperCase() && w.length > 1 && !allowedAcronyms.has(w));
    if (isAllUpper && words.length > 1) {
      issues.push({
        category: "Sentence Casing Violation (ALL CAPS)",
        severity: "CRITICAL",
        location: `${lang}.${pathStr}`,
        description: "Entire text segment appears to be in ALL CAPS",
        evidence: segment,
      });
    }
  }
}

for (const lang of langs) {
  const h = translations[lang].hero;
  if (!h) continue;

  checkSentenceCasing(h.trustBadge, "trustBadge", lang);
  checkSentenceCasing(h.titleLine1, "titleLine1", lang);
  checkSentenceCasing(h.titleLine2, "titleLine2", lang);
  checkSentenceCasing(h.titleLine3, "titleLine3", lang);
  checkSentenceCasing(h.cta, "cta", lang);
  checkSentenceCasing(h.assistantCta, "assistantCta", lang);
  checkSentenceCasing(h.mediatorPill, "mediatorPill", lang);
  checkSentenceCasing(h.telemedicinePill, "telemedicinePill", lang);
  checkSentenceCasing(h.emergencyNoticeVerbatim, "emergencyNoticeVerbatim", lang);

  checkSentenceCasing(h.triage.badge, "triage.badge", lang);
  checkSentenceCasing(h.triage.question, "triage.question", lang);
  checkSentenceCasing(h.triage.subQuestion, "triage.subQuestion", lang);
  checkSentenceCasing(h.triage.doctorPrompt, "triage.doctorPrompt", lang);
  checkSentenceCasing(h.triage.doctorScheduleCta, "triage.doctorScheduleCta", lang);
  checkSentenceCasing(h.triage.doctorOnDutyCta, "triage.doctorOnDutyCta", lang);
  checkSentenceCasing(h.triage.backButton, "triage.backButton", lang);
  checkSentenceCasing(h.triage.reassurance, "triage.reassurance", lang);

  h.triage.options.forEach((opt, idx) => {
    checkSentenceCasing(opt.title, `triage.options[${idx}].title`, lang);
    checkSentenceCasing(opt.desc, `triage.options[${idx}].desc`, lang);
    checkSentenceCasing(opt.actionLabel, `triage.options[${idx}].actionLabel`, lang);
  });
}

// Check hardcoded texts in components
for (const relPath of componentFiles) {
  const fullPath = path.resolve(relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  // Match text in JSX tags: >Some Text<
  const matches = content.matchAll(/>([^<>{}\n]+)</g);
  for (const m of matches) {
    const raw = m[1].trim();
    if (raw.length > 3) {
      checkSentenceCasing(raw, relPath, "component-hardcoded");
    }
  }
}

// -------------------------------------------------------------
// AUDIT 4: Design Token Verification in globals.css
// -------------------------------------------------------------
const globalsCssPath = path.resolve("src/app/globals.css");
const globalsCss = fs.readFileSync(globalsCssPath, "utf-8");

const requiredTokens = [
  { name: "--color-obsidian-navy", expected: "#0b132b", label: "Obsidian Navy" },
  { name: "--color-primary", expected: "#e63946", label: "Clinical Ruby" },
  { name: "--color-sapphire", expected: "#1d3557", label: "Deep Sapphire" },
  { name: "--color-background", expected: "#fcfbf9", label: "Warm Alabaster / Background" },
  { name: "--color-amber-care", expected: "#d97706", label: "Amber Gold" },
];

for (const token of requiredTokens) {
  const regex = new RegExp(`${token.name}:\\s*([^;]+);`, "i");
  const match = globalsCss.match(regex);
  if (!match) {
    issues.push({
      category: "Design Token Missing",
      severity: "CRITICAL",
      location: "src/app/globals.css",
      description: `Required token '${token.name}' (${token.label}) is not defined in @theme`,
      evidence: "Not found",
    });
  } else {
    const actual = match[1].trim().toLowerCase();
    if (actual !== token.expected.toLowerCase()) {
      issues.push({
        category: "Design Token Value Discrepancy",
        severity: "MEDIUM",
        location: "src/app/globals.css",
        description: `Token '${token.name}' is defined as '${actual}', expected '${token.expected}'`,
        evidence: `${token.name}: ${actual}`,
      });
    }
  }
}

// Check if Warm Alabaster (#f8f9fa or #fcfbf9) is defined
if (!globalsCss.includes("#f8f9fa") && !globalsCss.includes("#fcfbf9")) {
  issues.push({
    category: "Design Token Missing",
    severity: "HIGH",
    location: "src/app/globals.css",
    description: "Warm Alabaster (#f8f9fa or #fcfbf9) is missing from globals.css",
    evidence: "Neither #f8f9fa nor #fcfbf9 found in globals.css",
  });
}

// Check green quarantine:
// Verify green is strictly restricted to micro status indicators
// Search for green-related classes in componentFiles:
// e.g. bg-green-, text-green-, border-green-, emerald, etc.
const greenClassRegex = /\b(?:bg|text|border)-(?:green|emerald|teal)-[0-9]{2,3}\b/g;

for (const relPath of componentFiles) {
  const fullPath = path.resolve(relPath);
  const content = fs.readFileSync(fullPath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    const greenMatches = line.match(greenClassRegex);
    if (greenMatches) {
      // Check if it's on a micro indicator (like h-2 w-2, micro-status-dot) or a large element
      const isMicro = /h-1|h-2|h-2\.5|w-1|w-2|w-2\.5|micro-status/.test(line);
      issues.push({
        category: "Green Quarantine Violation",
        severity: isMicro ? "LOW" : "CRITICAL",
        location: `${relPath}:${idx + 1}`,
        description: `Found green Tailwind utility classes: ${greenMatches.join(", ")}. Green must be strictly quarantined to micro status indicators.`,
        evidence: line.trim(),
      });
    }
  });
}

// Output summary
console.log(`\nAudit completed. Total issues found: ${issues.length}\n`);
issues.forEach((iss, i) => {
  console.log(`[#${i + 1}] [${iss.severity}] [${iss.category}] in ${iss.location}`);
  console.log(`    Description: ${iss.description}`);
  console.log(`    Evidence: ${iss.evidence}\n`);
});

fs.writeFileSync(
  path.resolve(".agents/teamwork/challenger_m2_2/audit-results.json"),
  JSON.stringify(issues, null, 2)
);
console.log("Results written to .agents/teamwork/challenger_m2_2/audit-results.json");
