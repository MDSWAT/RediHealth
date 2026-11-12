import { mkdir, writeFile } from "node:fs/promises";
import { informedHealthAreas, informedHealthSourceUrl } from "../../src/lib/data/informedhealth-directory";

const root = new URL("../../src/content/health-articles/", import.meta.url);
async function main() {
const decode = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n))).replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const topics = new Map<string, { id: string; sourceUrl: string; sourceTitle: string; aliases: string[]; areaIds: string[] }>();
const failures: string[] = [];
let cursor = 0;
await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < informedHealthAreas.length) {
    const area = informedHealthAreas[cursor++];
    const response = await fetch(informedHealthSourceUrl(area.id)!, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) { failures.push(area.id); continue; }
    const html = await response.text();
    // The alphabetical index contains aliases; deduplicate using canonical source URLs.
    const matches = [...html.matchAll(/<a\s+href="(https:\/\/www\.informedhealth\.org\/[^"#]+\.html)"\s+aria-label="More of"[^>]*>([\s\S]*?)<\/a>/g)];
    // One broken topic-area URL is represented by its verified individual article.
    if (!matches.length && !informedHealthSourceUrl(area.id)!.includes("/topic-areas/")) {
      const url = informedHealthSourceUrl(area.id)!;
      const id = new URL(url).pathname.slice(1, -5);
      const item = topics.get(id) ?? { id, sourceUrl: url, sourceTitle: decode(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? area.titles.en), aliases: [], areaIds: [] };
      if (!item.areaIds.includes(area.id)) item.areaIds.push(area.id);
      topics.set(id, item);
    }
    for (const [, url, label] of matches) {
      if (url.includes("/topic-areas/")) continue;
      const title = decode(label);
      const id = new URL(url).pathname.slice(1, -5);
      const item = topics.get(id) ?? { id, sourceUrl: url, sourceTitle: title, aliases: [], areaIds: [] };
      if (!item.aliases.includes(title)) item.aliases.push(title);
      if (!item.areaIds.includes(area.id)) item.areaIds.push(area.id);
      topics.set(id, item);
    }
    console.log(area.id, matches.length);
  }
}));
await mkdir(root, { recursive: true });
await writeFile(new URL("inventory.json", root), JSON.stringify({ checkedOn: "2026-11-10", scope: "Unique individual topics linked from the alphabetical indexes of the 51 topic areas; excludes glossary entries, quizzes, videos and separate learn-more articles.", failedAreas: failures, topics: [...topics.values()].sort((a, b) => a.id.localeCompare(b.id)) }, null, 2) + "\n");
console.log("Unique topics:", topics.size, "Failed areas:", failures);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
