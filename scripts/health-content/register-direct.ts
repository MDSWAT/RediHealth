import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { contentRoot, topics } from "./source";

// Registers directly authored files. No model client, credentials or network calls.
async function main() {
  const ids = process.argv.slice(2);
  if (!ids.length) throw new Error("Supply the completed article ids.");
  const path = new URL("direct-authorship.json", contentRoot);
  const records = existsSync(path) ? JSON.parse(await readFile(path, "utf8")) : {};
  for (const id of ids) {
    if (!topics.some(topic => topic.id === id)) throw new Error(`Unknown topic: ${id}`);
    const contentHashes: Record<string, string> = {};
    let baseline: { intro: string; sections: { paragraphs: string[] }[] } | undefined;
    const text = (value: unknown) => typeof value === "string" && value.trim().length > 3;
    const numbers = (value: unknown) => (JSON.stringify(value).match(/\d+(?:[.,]\d+)?/g) ?? []).map(n => n.replace(",", ".")).sort().join("|");
    for (const lang of ["en", "ro", "sq", "it", "ru", "hr", "rom"]) {
      const raw = await readFile(new URL(`${lang}/${id}.json`, contentRoot), "utf8");
      const a = JSON.parse(raw);
      if (typeof a.title !== "string" || typeof a.intro !== "string" || a.intro.length < 80 || a.sections?.length !== 5 || a.examples?.length !== 2 || a.questions?.length !== 3 || raw.length < 1800) throw new Error(`Incomplete article: ${lang}/${id}`);
      if (a.sections.some((s: { heading: string; paragraphs: string[] }) => typeof s.heading !== "string" || !s.paragraphs?.length || s.paragraphs.some(p => typeof p !== "string" || p.length < 25))) throw new Error(`Invalid section: ${lang}/${id}`);
      if (a.examples.some((example: { title: string; text: string }) => !text(example.title) || !text(example.text)) || a.questions.some((q: unknown) => !text(q))) throw new Error(`Incomplete examples or questions: ${lang}/${id}`);
      if (baseline && a.sections.some((s: { paragraphs: string[] }, i: number) => s.paragraphs.length !== baseline!.sections[i].paragraphs.length)) throw new Error(`Translation structure mismatch: ${lang}/${id}`);
      if (baseline && (a.intro === baseline.intro || numbers(a) !== numbers(baseline))) throw new Error(`Translation mismatch: ${lang}/${id}`);
      if (!baseline) baseline = a;
      contentHashes[lang] = createHash("sha256").update(raw).digest("hex");
    }
    records[id] = { sourceCheckedOn: new Date().toISOString().slice(0, 10), authoringMethod: "direct-assistant", sourceCheckMethod: "assistant-source-comparison", translationCheckMethod: "direct-assistant-comparison", humanClinicalReview: false, contentHashes };
  }
  await writeFile(path, JSON.stringify(records, null, 2) + "\n");
  console.log(`Registered ${ids.length} directly authored articles in seven languages. Independent clinical and language review remains pending.`);
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Registration failed"); process.exitCode = 1; });
