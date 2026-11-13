import { NextResponse } from "next/server";
import { normalizeJsonPayload } from "@/lib/health-assistant";
import { DEFAULT_LANG, isSupportedLang } from "@/lib/i18n/routing";
import type { Lang } from "@/lib/i18n/translations";
import { LlmError, generateText } from "@/lib/llm";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  detectEmergencyQuery,
  searchSmartCatalog,
  type SmartSearchReadingLevel,
  type SmartSearchResult,
} from "@/lib/search/smart-search-engine";

export const runtime = "nodejs";

type SmartSearchApiRequest = {
  query?: unknown;
  lang?: unknown;
  pathname?: unknown;
  readingLevel?: unknown;
};

const RESPONSE_LANGUAGE_LABEL: Record<Lang, string> = {
  ro: "Romanian",
  en: "English",
  sq: "Albanian",
  it: "Italian",
  hr: "Croatian",
  rom: "Common Romani (Romanes, Latin script)",
  ru: "Russian",
};

const CONJUNCTION_BY_LANG: Record<Lang, string> = {
  ro: "și",
  en: "and",
  sq: "dhe",
  it: "e",
  hr: "i",
  rom: "thaj",
  ru: "и",
};

function sanitizePlainText(text: string, lang: Lang, maxLength: number): string {
  const conj = CONJUNCTION_BY_LANG[lang] ?? "and";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/[*_`#>]+/g, "")
    .replace(/\s*&\s*/g, ` ${conj} `)
    .replace(/\s*·\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
    .trim();
}

function buildSearchSystemPrompt(lang: Lang, readingLevel: SmartSearchReadingLevel): string {
  const levelHint =
    readingLevel === "simple"
      ? "Use extra-simple everyday words and short sentences."
      : "Use calm, clear, plain everyday language.";

  return [
    `You are RediHealth's grounded search summarizer. Write strictly in ${RESPONSE_LANGUAGE_LABEL[lang]}.`,
    levelHint,
    "Answer in 2 to 3 calm sentences using ONLY the RediHealth catalog entries provided in the user prompt.",
    "Never invent clinics, addresses, phone numbers, prices, diagnoses, or prescriptions.",
    "Never claim that content was checked or verified by doctors.",
    "Use strict sentence case. Never use '&', middle dot '·', markdown formatting, bullet lists, or HTML.",
    ...(lang === "sq" ? ["Never use the Albanian word 'ndërmjetës'; always use 'mediator'."] : []),
    'Return ONLY valid JSON with keys: "answer" (string), "followups" (array of 1 to 3 short query strings in the same language), and "recommendedIds" (array of matching result id strings from the context).',
  ].join(" ");
}

function buildSearchUserPrompt(
  query: string,
  pathname: string,
  topResults: SmartSearchResult[],
): string {
  const contextLines = topResults.map((item, idx) => {
    const steps = item.nextSteps.slice(0, 2).join("; ");
    return `${idx + 1}. id="${item.id}" | kind="${item.kindLabel}" | title="${item.title}" | summary="${item.summary}"${steps ? ` | steps="${steps}"` : ""}`;
  });

  return [
    `User query: ${query}`,
    `Current route: ${pathname}`,
    "Top RediHealth catalog results:",
    ...contextLines,
  ].join("\n");
}

function orderCitations(
  recommendedIds: unknown,
  topResults: SmartSearchResult[],
): SmartSearchResult[] {
  const byId = new Map(topResults.map((item) => [item.id, item]));
  const picked: SmartSearchResult[] = [];
  const seen = new Set<string>();

  if (Array.isArray(recommendedIds)) {
    for (const rawId of recommendedIds) {
      if (typeof rawId !== "string") continue;
      const match = byId.get(rawId);
      if (match && !seen.has(match.id)) {
        picked.push(match);
        seen.add(match.id);
      }
      if (picked.length >= 4) break;
    }
  }

  for (const item of topResults) {
    if (picked.length >= 4) break;
    if (!seen.has(item.id)) {
      picked.push(item);
      seen.add(item.id);
    }
  }

  return picked;
}

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit(`smart-search:${getClientIp(req)}`, {
    limit: 25,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Wait a moment and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

  let body: SmartSearchApiRequest;
  try {
    body = (await req.json()) as SmartSearchApiRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body. Please send valid JSON." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim().slice(0, 300) : "";
  const lang = typeof body.lang === "string" && isSupportedLang(body.lang) ? body.lang : DEFAULT_LANG;
  const pathname = typeof body.pathname === "string" ? body.pathname.slice(0, 200) : "/";
  const readingLevel: SmartSearchReadingLevel =
    body.readingLevel === "simple" ? "simple" : "standard";

  const isEmergency = detectEmergencyQuery(query, lang);
  const local = searchSmartCatalog(query, {
    lang,
    readingLevel,
    pathname,
    limit: 8,
  });

  if (isEmergency || local.isEmergency) {
    return NextResponse.json({
      mode: "emergency",
      isEmergency: true,
      answer: null,
      citations: local.results.slice(0, 3),
      suggestedFollowups: local.suggestedFollowups,
    });
  }

  if (query.length < 3 || local.results.length === 0) {
    return NextResponse.json({
      mode: "local",
      isEmergency: false,
      answer: null,
      citations: local.results.slice(0, 4),
      suggestedFollowups: local.suggestedFollowups,
    });
  }

  const topResults = local.results.slice(0, 6);

  try {
    const generated = await generateText({
      system: buildSearchSystemPrompt(lang, readingLevel),
      text: buildSearchUserPrompt(query, pathname, topResults),
      maxTokens: 320,
    });

    const parsed = JSON.parse(normalizeJsonPayload(generated.text)) as {
      answer?: unknown;
      followups?: unknown;
      recommendedIds?: unknown;
    };

    const answer =
      typeof parsed.answer === "string" ? sanitizePlainText(parsed.answer, lang, 560) : "";
    if (!answer) {
      return NextResponse.json({
        mode: "local",
        isEmergency: false,
        answer: null,
        citations: local.results.slice(0, 4),
        suggestedFollowups: local.suggestedFollowups,
      });
    }

    const followups = Array.isArray(parsed.followups)
      ? parsed.followups
          .filter((item): item is string => typeof item === "string")
          .map((item) => sanitizePlainText(item, lang, 120))
          .filter(Boolean)
          .slice(0, 3)
      : local.suggestedFollowups;

    const citations = orderCitations(parsed.recommendedIds, topResults);

    return NextResponse.json({
      mode: "ai",
      isEmergency: false,
      answer,
      citations,
      suggestedFollowups: followups.length > 0 ? followups : local.suggestedFollowups,
    });
  } catch (error) {
    if (error instanceof LlmError && error.kind !== "not-configured") {
      console.warn("Smart search LLM fallback", error.kind, error.status ?? "");
    }
    return NextResponse.json({
      mode: "local",
      isEmergency: false,
      answer: null,
      citations: local.results.slice(0, 4),
      suggestedFollowups: local.suggestedFollowups,
    });
  }
}
