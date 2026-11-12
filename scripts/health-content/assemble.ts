import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { cacheRoot, contentRoot, topics } from "./source";

async function main() {
  const langs = ["en", "ro", "sq", "it", "ru", "hr", "rom"] as const;
  const baseLangs = langs.slice(0, 5);
  const index = [];
  const statusPath = new URL("editorial-status.json", contentRoot);
  const previous = existsSync(statusPath) ? JSON.parse(await readFile(statusPath, "utf8")) : {};
  const directPath = new URL("direct-authorship.json", contentRoot);
  const direct = existsSync(directPath) ? JSON.parse(await readFile(directPath, "utf8")) : {};
  const status: Record<string, unknown> = {};
  const missing: string[] = [];
  const unavailableTopics: string[] = [];
  const availableByLanguage = Object.fromEntries(langs.map(lang => [lang, 0]));
  const missingByLanguage: Record<string, string[]> = Object.fromEntries(langs.map(lang => [lang, []]));
  for (const topic of topics) {
    const titles: Record<string, string> = {};
    const hashes: Record<string, string> = {};
    const retained = previous[topic.id];
    const authored = direct[topic.id];
    const reviewPath = new URL(`${topic.id}.review.json`, cacheRoot);
    const auditPath = new URL(`${topic.id}.translation-audit.json`, cacheRoot);
    const review = existsSync(reviewPath) ? JSON.parse(await readFile(reviewPath, "utf8")) : undefined;
    const audit = existsSync(auditPath) ? JSON.parse(await readFile(auditPath, "utf8")) : undefined;
    for (const lang of langs) {
      const path = new URL(`${lang}/${topic.id}.json`, contentRoot);
      if (!existsSync(path)) continue;
      const raw = await readFile(path, "utf8");
      const hash = createHash("sha256").update(raw).digest("hex");
      const directMatch = authored?.authoringMethod === "direct-assistant" && authored.contentHashes?.[lang] === hash;
      const retainedMatch = retained?.processVersion === 2 && retained.contentHashes?.[lang] === hash;
      const auditedMatch = (review?.processVersion === 2 || topic.id === "dust-mite-allergies") && audit?.contentHashes?.[lang] === hash
        && (lang !== "en" || review?.englishHash === hash);
      if (!directMatch && !retainedMatch && !auditedMatch) continue;
      titles[lang] = JSON.parse(raw).title;
      hashes[lang] = hash;
    }
    const availableLanguages = langs.filter(lang => Object.hasOwn(hashes, lang));
    const available = baseLangs.every(lang => availableLanguages.includes(lang));
    for (const lang of langs) {
      if (available && availableLanguages.includes(lang)) availableByLanguage[lang]++;
      else missingByLanguage[lang].push(topic.id);
    }
    if (!available || availableLanguages.length !== langs.length) missing.push(topic.id);
    if (!available) { unavailableTopics.push(topic.id); continue; }
    const directlyAuthored = availableLanguages.every(lang => authored?.authoringMethod === "direct-assistant" && authored.contentHashes?.[lang] === hashes[lang]);
    status[topic.id] = { processVersion: 2, sourceCheckedOn: authored?.sourceCheckedOn ?? retained?.sourceCheckedOn ?? review?.checkedOn,
      independentlyAuthored: true, authoringMethod: directlyAuthored ? "direct-assistant" : retained?.authoringMethod ?? "provider-assisted",
      sourceCheckMethod: directlyAuthored ? authored.sourceCheckMethod : retained?.sourceCheckMethod ?? "provider-assisted",
      translationCheckMethod: directlyAuthored ? authored.translationCheckMethod : retained?.translationCheckMethod ?? "provider-assisted",
      automatedSourceCheck: !directlyAuthored, automatedTranslationCheck: !directlyAuthored, humanClinicalReview: false, contentHashes: hashes };
    index.push({ id: topic.id, areaIds: topic.areaIds, titles, sourceUrl: topic.sourceUrl, availableLanguages });
  }
  const completedTopics = topics.length - missing.length;
  console.log(`Assembled ${index.length} available drafts; ${completedTopics}/${topics.length} complete in all ${langs.length} languages.`);
  if (missing.length && !process.argv.includes("--allow-partial")) {
    console.error("Seven-language coverage is incomplete; preview manifests retained. Use --allow-partial to update the editorial preview.");
    process.exitCode = 1; return;
  }
  await writeFile(new URL("index.json", contentRoot), JSON.stringify(index, null, 2) + "\n");
  await writeFile(statusPath, JSON.stringify(status, null, 2) + "\n");
  await writeFile(new URL("coverage.json", contentRoot), JSON.stringify({ checkedOn: new Date().toISOString().slice(0, 10), indexedTopics: topics.length,
    completedTopics, availableTopics: index.length, languages: langs, availableByLanguage, missingByLanguage, missing, unavailableTopics,
    humanClinicalReview: false, scope: "Unique individual entries in the alphabetical indexes of all 51 topic areas. Separate learn-more pages, glossary entries, media and personal stories are not replicated." }, null, 2) + "\n");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
