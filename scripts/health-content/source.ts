import { mkdir, readFile, writeFile } from "node:fs/promises";
import inventory from "../../src/content/health-articles/inventory.json";

export const contentRoot = new URL("../../src/content/health-articles/", import.meta.url);
export const cacheRoot = new URL("../../.health-content-cache/", import.meta.url);
export type Topic = typeof inventory.topics[number];
export const topics = inventory.topics;
export function plainText(html: string) {
  return html.replace(/<(script|style|figure|nav|aside)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(?:p|h[1-6]|li|article|section|br)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .replace(/\$CMS_[\s\S]*?\$CMS_END_IF\$/g, "").replace(/Informationen about[^\n]*/g, "")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n/g, "\n").trim();
}
export async function sourceFor(topic: Topic): Promise<{ title: string; text: string; url: string }> {
  const path = new URL(`${topic.id}.source.json`, cacheRoot);
  try { return JSON.parse(await readFile(path, "utf8")); } catch { /* Fetch only uncached public pages. */ }
  const response = await fetch(topic.sourceUrl, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}: ${topic.id}`);
  const html = await response.text();
  const title = plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? topic.sourceTitle);
  const main = html.indexOf('<div class="topic__main">');
  const start = main >= 0 ? main : html.indexOf("<main");
  if (start < 0) throw new Error(`No source main: ${topic.id}`);
  const body = html.slice(start).split(/Comment on this page|<div class="feedback|<footer/i)[0];
  const data = { title, text: plainText(body).slice(0, 34_000), url: response.url };
  if (data.text.length < 100) throw new Error(`Empty source: ${topic.id}`);
  await mkdir(cacheRoot, { recursive: true });
  await writeFile(path, JSON.stringify(data));
  return data;
}

export function parseObject(text: string): Record<string, unknown> {
  const start = text.indexOf("{");
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i >= 0 && i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (escaped) escaped = false; else if (c === "\\") escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return JSON.parse(text.slice(start, i + 1));
  }
  throw new Error("Incomplete JSON object");
}
