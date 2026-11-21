/* Only the data-free offline shell, static assets, non-PHI public pages/guides, and zero-PHI offline fallback may enter Cache Storage or respond offline. */
const SHELL_CACHE = "redihealth-offline-shell-v2";
const STATIC_CACHE = "redihealth-static-v2";
const GUIDES_CACHE = "redihealth-guides-v1";
const PAGES_CACHE = "redihealth-pages-v1";
const MEDIA_CACHE = "redihealth-media-v1";

/* Inside GUIDES_CACHE: the list of saved guides (path, title, language only) and the last language seen. */
const SAVED_GUIDES_INDEX = "/__saved-guides.json";
const LAST_LOCALE_KEY = "/__last-locale";
const SAVED_GUIDES_LIMIT = 60;
const PAGES_CACHE_LIMIT = 120;
const MEDIA_CACHE_LIMIT = 200;
const SUPPORTED_LOCALES = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

const CORE_PUBLIC_BARE_PATHS = [
  "",
  "/health-check",
  "/health-information",
  "/health-assistant",
  "/find-help",
  "/stiri",
  "/mediatori",
  "/prescription-review",
  "/ai-assistant",
  "/medic-online",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/accessibility",
];

const CORE_GUIDE_SLUGS = [
  "heart-health",
  "diabetes",
  "healthy-eating",
  "mental-wellbeing",
  "physical-activity",
  "preventive-screening",
  "smoking",
  "womens-health",
];

const CORE_MEDIA_PATHS = [
  "/Icons/Logo.svg",
  "/manifest.webmanifest",
  "/pwa/pwa-192x192.png",
  "/pwa/pwa-512x512.png",
  "/favicon.ico",
  "/icon.svg",
  "/images/hero-care.jpg",
  "/images/hero-consultation.jpg",
  "/images/hero-desk.jpg",
  "/images/health-topics/diabetes.jpg",
  "/images/health-topics/healthy-eating.jpg",
  "/images/health-topics/heart-health.jpg",
  "/images/health-topics/heart-health-care.jpg",
  "/images/health-topics/mental-wellbeing.jpg",
  "/images/health-topics/physical-activity.jpg",
  "/images/health-topics/preventive-screening.jpg",
  "/images/health-topics/smoking.jpg",
  "/images/health-topics/womens-health.jpg",
];

const CORE_MODEL_PATHS = [
  "/models/human-atlas-layers.json",
  "/models/human-atlas-layers.bin",
  "/models/human-atlas-skeleton.json",
  "/models/human-atlas-skeleton.bin",
];

const OFFLINE_FALLBACK_COPY = {
  ro: {
    title: "Ești offline",
    heading: "Ești offline",
    body: "RediHealth are nevoie de internet pentru a încărca această pagină. Verifică conexiunea și încearcă din nou.",
    emergencyNote: "Dacă este o urgență medicală, sună direct la 112.",
    call112: "Sună la 112",
    retry: "Încearcă din nou",
    sectionsHeading: "Disponibile fără internet",
    sectionsBody: "Poți deschide aceste secțiuni offline.",
    savedHeading: "Salvate pe telefon",
    savedBody: "Poți deschide aceste ghiduri fără internet.",
    savedEmpty: "Nu ai încă ghiduri salvate. Când ai internet, deschide un ghid și apasă Salvează pe telefon.",
    sections: {
      home: "Acasă",
      healthCheck: "Verifică simptomele",
      learn: "Învață și testează-te",
      assistant: "Unde să mergi",
      findHelp: "Farmacii și clinici",
      news: "Știri medicale",
    },
  },
  en: {
    title: "You are offline",
    heading: "You are offline",
    body: "RediHealth needs an internet connection to load this page. Check your connection and try again.",
    emergencyNote: "If this is a medical emergency, call 112 directly.",
    call112: "Call 112",
    retry: "Try again",
    sectionsHeading: "Available offline",
    sectionsBody: "You can open these sections without internet.",
    savedHeading: "Saved on this phone",
    savedBody: "You can open these guides without internet.",
    savedEmpty: "No guides saved yet. When you have internet, open a guide and tap Save on this phone.",
    sections: {
      home: "Home",
      healthCheck: "Check symptoms",
      learn: "Learn and test yourself",
      assistant: "Where to go",
      findHelp: "Pharmacies and clinics",
      news: "Medical news",
    },
  },
  sq: {
    title: "Je jashtë linje",
    heading: "Je jashtë linje",
    body: "RediHealth ka nevojë për lidhje interneti për të hapur këtë faqe. Kontrollo lidhjen dhe provo përsëri.",
    emergencyNote: "Nëse është urgjencë mjekësore, telefono direkt 112.",
    call112: "Telefono 112",
    retry: "Provo përsëri",
    sectionsHeading: "Të hapura pa internet",
    sectionsBody: "Mund t'i hapësh këto faqe pa internet.",
    savedHeading: "Ruajtur në telefon",
    savedBody: "Mund t'i hapësh këta udhëzues pa internet.",
    savedEmpty: "Nuk ke ende udhëzues të ruajtur. Kur të kesh internet, hap një udhëzues dhe shtyp Ruaj në telefon.",
    sections: {
      home: "Kreu",
      healthCheck: "Kontrollo simptomat",
      learn: "Mëso dhe testo veten",
      assistant: "Ku të shkosh",
      findHelp: "Farmaci dhe klinika",
      news: "Lajme mjekësore",
    },
  },
  it: {
    title: "Sei offline",
    heading: "Sei offline",
    body: "RediHealth richiede una connessione internet per caricare questa pagina. Controlla la connessione e riprova.",
    emergencyNote: "Se è un'emergenza medica, chiama subito il 112.",
    call112: "Chiama il 112",
    retry: "Riprova",
    sectionsHeading: "Disponibili offline",
    sectionsBody: "Puoi aprire queste sezioni senza internet.",
    savedHeading: "Salvate sul telefono",
    savedBody: "Puoi aprire queste guide senza internet.",
    savedEmpty: "Non hai ancora guide salvate. Quando hai internet, apri una guida e tocca Salva sul telefono.",
    sections: {
      home: "Home",
      healthCheck: "Controlla i sintomi",
      learn: "Impara e mettiti alla prova",
      assistant: "Dove andare",
      findHelp: "Farmacie e cliniche",
      news: "Notizie mediche",
    },
  },
  hr: {
    title: "Izvan mreže si",
    heading: "Izvan mreže si",
    body: "RediHealth treba internetsku vezu za učitavanje ove stranice. Provjeri vezu i pokušaj ponovno.",
    emergencyNote: "Ako je hitan medicinski slučaj, odmah nazovi 112.",
    call112: "Nazovi 112",
    retry: "Pokušaj ponovno",
    sectionsHeading: "Dostupno izvan mreže",
    sectionsBody: "Ove dijelove možeš otvoriti bez interneta.",
    savedHeading: "Spremljeno na mobitelu",
    savedBody: "Ove vodiče možeš otvoriti bez interneta.",
    savedEmpty: "Još nemaš spremljenih vodiča. Kad imaš internet, otvori vodič i dodirni Spremi na mobitel.",
    sections: {
      home: "Početna",
      healthCheck: "Provjeri simptome",
      learn: "Uči i testiraj se",
      assistant: "Kamo ići",
      findHelp: "Ljekarne i klinike",
      news: "Zdravstvene vijesti",
    },
  },
  rom: {
    title: "San bi-internetesko",
    heading: "San bi-internetesko",
    body: "RediHealth mangel interneto te putrel kadi rig. Dikh o interneto thaj zumav palem.",
    emergencyNote: "Te si sastipnaski sigardiari, akhar rigate ko 112.",
    call112: "Akhar ko 112",
    retry: "Zumav palem",
    sectionsHeading: "Putarde bi internetesko",
    sectionsBody: "Shaj putres kadala riga bi internetesko.",
    savedHeading: "Garavde po telefono",
    savedBody: "Shaj putres kadala gidurya bi internetesko.",
    savedEmpty: "Inke nane tut garavde gidurya. Kana si tut interneto, putar jekh gido thaj ker klik po Garav po telefono.",
    sections: {
      home: "Khere",
      healthCheck: "Dikh che simptome",
      learn: "Sikljov thaj proba tu",
      assistant: "Kaj te zhas",
      findHelp: "Farmaciye thaj klinike",
      news: "Sastipnaske nevimata",
    },
  },
  ru: {
    title: "Нет подключения к сети",
    heading: "Нет подключения к сети",
    body: "Для загрузки этой страницы RediHealth требуется подключение к интернету. Проверьте соединение и попробуйте еще раз.",
    emergencyNote: "Если это неотложная медицинская помощь, позвоните 112.",
    call112: "Позвоните 112",
    retry: "Попробуйте еще раз",
    sectionsHeading: "Доступно офлайн",
    sectionsBody: "Эти разделы можно открыть без интернета.",
    savedHeading: "Сохранено на телефоне",
    savedBody: "Эти памятки можно открыть без интернета.",
    savedEmpty: "Сохранённых памяток пока нет. Когда будет интернет, откройте памятку и нажмите Сохранить на телефон.",
    sections: {
      home: "Главная",
      healthCheck: "Проверить симптомы",
      learn: "Обучение и проверка",
      assistant: "Куда обратиться",
      findHelp: "Аптеки и клиники",
      news: "Медицинские новости",
    },
  },
};

function localeInPath(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return SUPPORTED_LOCALES.includes(segment) ? segment : null;
}

function resolveLocaleFromPath(pathname) {
  return localeInPath(pathname) || "en";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtmlText(value) {
  return String(value)
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/* The page title without the site name: the only text kept about a saved guide. */
function guideTitleFromHtml(html) {
  const match = /<title[^>]*>([^<]*)<\/title>/i.exec(html);
  const raw = match ? decodeHtmlText(match[1]).trim() : "";
  return raw.replace(/\s+[-|]\s+RediHealth\s*$/i, "").slice(0, 160);
}

async function readSavedGuides() {
  try {
    const cache = await caches.open(GUIDES_CACHE);
    const stored = await cache.match(SAVED_GUIDES_INDEX);
    if (!stored) return [];
    const list = JSON.parse(await stored.clone().text());
    if (!Array.isArray(list)) return [];
    return list.filter(
      (item) =>
        item &&
        typeof item.path === "string" &&
        typeof item.title === "string" &&
        typeof item.lang === "string" &&
        isHealthGuidePath(item.path),
    );
  } catch {
    return [];
  }
}

/* Newest first. Holds the path, the title and the language of each saved guide, nothing else. */
async function rememberSavedGuide(path, html) {
  const lang = resolveLocaleFromPath(path);
  const title = guideTitleFromHtml(html) || "RediHealth";
  const others = (await readSavedGuides()).filter((item) => item.path !== path);
  const list = [{ path, title, lang }, ...others].slice(0, SAVED_GUIDES_LIMIT);
  const cache = await caches.open(GUIDES_CACHE);
  await cache.put(
    SAVED_GUIDES_INDEX,
    new Response(JSON.stringify(list), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    }),
  );
}

let lastLocaleSeen = null;

async function rememberLocale(locale) {
  if (!locale || locale === lastLocaleSeen) return;
  lastLocaleSeen = locale;
  try {
    const cache = await caches.open(GUIDES_CACHE);
    await cache.put(
      LAST_LOCALE_KEY,
      new Response(locale, { headers: { "Content-Type": "text/plain; charset=utf-8" } }),
    );
  } catch {
    // The language is only a convenience for the offline page.
  }
}

async function readLastLocale() {
  if (lastLocaleSeen) return lastLocaleSeen;
  try {
    const cache = await caches.open(GUIDES_CACHE);
    const stored = await cache.match(LAST_LOCALE_KEY);
    const value = stored ? (await stored.clone().text()).trim() : "";
    return SUPPORTED_LOCALES.includes(value) ? value : null;
  } catch {
    return null;
  }
}

async function readCachedCoreSections(locale) {
  const copy = OFFLINE_FALLBACK_COPY[locale] || OFFLINE_FALLBACK_COPY.en;
  const candidates = [
    { path: `/${locale}`, label: copy.sections.home, cacheName: PAGES_CACHE },
    { path: `/${locale}/health-check`, label: copy.sections.healthCheck, cacheName: PAGES_CACHE },
    { path: `/${locale}/health-information`, label: copy.sections.learn, cacheName: GUIDES_CACHE },
    { path: `/${locale}/health-assistant`, label: copy.sections.assistant, cacheName: PAGES_CACHE },
    { path: `/${locale}/find-help`, label: copy.sections.findHelp, cacheName: PAGES_CACHE },
    { path: `/${locale}/stiri`, label: copy.sections.news, cacheName: PAGES_CACHE },
  ];
  try {
    const [pagesCache, guidesCache] = await Promise.all([
      caches.open(PAGES_CACHE),
      caches.open(GUIDES_CACHE),
    ]);
    const available = [];
    for (const entry of candidates) {
      const cache = entry.cacheName === GUIDES_CACHE ? guidesCache : pagesCache;
      const hit = await cache.match(entry.path);
      if (hit) available.push({ path: entry.path, label: entry.label, lang: locale });
    }
    return available;
  } catch {
    return [];
  }
}

/* The offline page: in the language of the address, else the last language used, else of the newest saved guide. */
async function offlineFallbackFor(pathname) {
  const saved = await readSavedGuides();
  const locale =
    localeInPath(pathname) || (await readLastLocale()) || (saved[0] && saved[0].lang) || "en";
  const inLocale = saved.filter((item) => item.lang === locale);
  const cachedSections = await readCachedCoreSections(locale);
  return buildOfflineFallbackResponse(locale, inLocale.length > 0 ? inLocale : saved, cachedSections);
}

function stripLocalePrefix(pathname) {
  return pathname.replace(/^\/(ro|en|sq|it|hr|rom|ru)(?=\/|$)/, "") || "/";
}

function isSensitivePath(pathname) {
  if (pathname.startsWith("/api/")) return true;
  const stripped = stripLocalePrefix(pathname);
  return (
    stripped === "/panel" ||
    stripped.startsWith("/panel/") ||
    stripped === "/patient-portal" ||
    stripped.startsWith("/patient-portal/") ||
    stripped === "/sign-in" ||
    stripped.startsWith("/sign-in/") ||
    stripped === "/health-check/note" ||
    stripped.startsWith("/health-check/note/") ||
    stripped === "/medic-online/meet" ||
    stripped.startsWith("/medic-online/meet/") ||
    stripped === "/medic-online/asteptare" ||
    stripped.startsWith("/medic-online/asteptare/")
  );
}

function isCacheableResponse(response) {
  if (!response || !response.ok || response.type === "opaque") return false;
  const cc = (response.headers.get("cache-control") || "").toLowerCase();
  if (cc.includes("no-store") || cc.includes("private")) return false;
  return true;
}

function isHealthGuidePath(pathname) {
  if (isSensitivePath(pathname)) return false;
  const stripped = stripLocalePrefix(pathname);
  return stripped === "/health-information" || stripped.startsWith("/health-information/");
}

function isOfflinePublicPath(pathname) {
  if (isSensitivePath(pathname)) return false;
  const stripped = stripLocalePrefix(pathname);
  if (
    stripped === "/" ||
    stripped === "/health-check" ||
    stripped === "/health-assistant" ||
    stripped === "/find-help" ||
    stripped === "/mediatori" ||
    stripped === "/get-help" ||
    stripped === "/prescription-review" ||
    stripped === "/ai-assistant" ||
    stripped === "/medic-online" ||
    stripped === "/about" ||
    stripped === "/contact" ||
    stripped === "/privacy" ||
    stripped === "/terms" ||
    stripped === "/cookies" ||
    stripped === "/accessibility" ||
    stripped === "/report-issue"
  ) {
    return true;
  }
  return (
    stripped === "/health-information" ||
    stripped.startsWith("/health-information/") ||
    stripped === "/stiri" ||
    stripped.startsWith("/stiri/") ||
    stripped === "/news" ||
    stripped.startsWith("/news/") ||
    stripped === "/demo" ||
    stripped.startsWith("/demo/")
  );
}

function sanitizePageResponseForCache(response, html) {
  const headers = new Headers(response.headers);
  headers.delete("set-cookie");
  headers.delete("content-encoding");
  headers.delete("content-length");
  return new Response(html, { status: 200, headers });
}

async function trimCache(cacheName, limit) {
  try {
    const cache = await caches.open(cacheName);
    if (typeof cache.keys !== "function" || typeof cache.delete !== "function") return;
    const keys = await cache.keys();
    if (keys.length <= limit) return;
    const excess = keys.length - limit;
    let removed = 0;
    for (const req of keys) {
      if (removed >= excess) break;
      const reqPath = new URL(req.url, self.location.origin).pathname;
      if (reqPath === SAVED_GUIDES_INDEX || reqPath === LAST_LOCALE_KEY) continue;
      await cache.delete(req);
      removed += 1;
    }
  } catch {
    // Ignore cache trimming errors.
  }
}

const scannedStaticChunks = new Set();

function extractStaticAssetRefsFromText(text) {
  if (!text) return [];
  const refs = [];
  const matches = text.matchAll(
    /(?:\/_next\/)?static\/(?:immutable\/)?(?:chunks|media)\/[A-Za-z0-9._/-]+\.(?:js|css|woff2)/g,
  );
  for (const match of matches) {
    const raw = match[0];
    if (raw.includes("..") || raw.includes("//")) continue;
    const normalized = raw.startsWith("/_next/") ? raw : `/_next/${raw}`;
    try {
      const resolved = new URL(normalized, self.location.origin);
      if (
        resolved.origin === self.location.origin &&
        resolved.pathname.startsWith("/_next/static/")
      ) {
        refs.push(resolved.href);
      }
    } catch {
      // Ignore malformed asset references.
    }
  }
  return refs;
}

async function cacheNextStaticAssets(html, supplied = [], { requireAll = false } = {}) {
  const staticCache = await caches.open(STATIC_CACHE);
  const assets = html
    ? [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)].map(
        (match) => new URL(match[1].replace(/&amp;/g, "&"), self.location.origin).href,
      )
    : [];

  const visited = new Set();
  let frontier = [];
  for (const asset of [...assets, ...supplied]) {
    let assetUrl;
    try {
      assetUrl = new URL(asset, self.location.origin);
    } catch {
      continue;
    }
    if (
      assetUrl.origin !== self.location.origin ||
      !assetUrl.pathname.startsWith("/_next/static/")
    ) {
      continue;
    }
    if (!visited.has(assetUrl.href)) {
      visited.add(assetUrl.href);
      frontier.push(assetUrl.href);
    }
  }

  // Files already kept are not downloaded again: on a slow or paid connection that is most of the cost.
  for (let depth = 0; depth <= 3 && frontier.length > 0; depth += 1) {
    const nextLevel = [];
    for (let i = 0; i < frontier.length; i += 6) {
      const batch = frontier.slice(i, i + 6);
      await Promise.all(
        batch.map(async (href) => {
          let assetResponse = await staticCache.match(href);
          if (!assetResponse) {
            let result = null;
            try {
              result = await fetch(href, { credentials: "omit" });
            } catch {
              if (depth === 0 && requireAll) {
                throw new Error("Offline app asset unavailable.");
              }
              return;
            }
            if (!result.ok) {
              if (depth === 0 && requireAll) {
                throw new Error("Offline app asset unavailable.");
              }
              return;
            }
            if (isCacheableResponse(result)) {
              await staticCache.put(href, result.clone());
              assetResponse = result;
            }
          }

          if (!assetResponse || depth >= 3 || scannedStaticChunks.has(href)) return;
          const pathname = new URL(href, self.location.origin).pathname;
          if (!pathname.endsWith(".js") && !pathname.endsWith(".css")) return;

          scannedStaticChunks.add(href);
          try {
            const body = await assetResponse.clone().text();
            for (const refHref of extractStaticAssetRefsFromText(body)) {
              if (!visited.has(refHref)) {
                visited.add(refHref);
                nextLevel.push(refHref);
              }
            }
          } catch {
            // Ignore unreadable static chunk bodies.
          }
        }),
      );
    }
    frontier = nextLevel;
  }
}

async function cachePublicPathIfMissing(pathname, suppliedAssets = []) {
  if (!isOfflinePublicPath(pathname)) return false;
  const targetCacheName = isHealthGuidePath(pathname) ? GUIDES_CACHE : PAGES_CACHE;
  const cache = await caches.open(targetCacheName);
  const existing = await cache.match(pathname);
  if (existing) {
    const existingHtml = await existing.clone().text().catch(() => "");
    await cacheNextStaticAssets(existingHtml, suppliedAssets, { requireAll: false });
    return false;
  }

  const response = await fetch(pathname, { credentials: "omit", cache: "no-store" });
  if (
    !response.ok ||
    response.type === "opaque" ||
    response.redirected ||
    !response.headers.get("content-type")?.includes("text/html")
  ) {
    return false;
  }
  const html = await response.text();
  await cacheNextStaticAssets(html, suppliedAssets, { requireAll: false });
  await cache.put(pathname, sanitizePageResponseForCache(response, html));
  return true;
}

async function warmMediaAssets(paths) {
  const [mediaCache, staticCache] = await Promise.all([
    caches.open(MEDIA_CACHE),
    caches.open(STATIC_CACHE),
  ]);
  for (let i = 0; i < paths.length; i += 3) {
    const batch = paths.slice(i, i + 3);
    await Promise.all(
      batch.map(async (path) => {
        try {
          const isStaticSlot =
            path.startsWith("/pwa/") ||
            path === "/manifest.webmanifest" ||
            path === "/favicon.ico" ||
            path === "/icon.svg";
          const targetCache = isStaticSlot ? staticCache : mediaCache;
          if (await targetCache.match(path)) return;
          const res = await fetch(path, { credentials: "omit" });
          if (isCacheableResponse(res)) {
            await targetCache.put(path, res);
          }
        } catch {
          // Ignore individual media warm errors so remaining assets still cache.
        }
      }),
    );
  }
}

function buildOfflineFallbackResponse(locale, savedGuides = [], cachedSections = []) {
  const copy = OFFLINE_FALLBACK_COPY[locale] || OFFLINE_FALLBACK_COPY.en;
  const sectionsHtml =
    cachedSections.length > 0
      ? `<section class="saved">
      <h2>${copy.sectionsHeading}</h2>
      <p>${copy.sectionsBody}</p>
      <ul>
        ${cachedSections
          .map(
            (item) =>
              `<li><a href="${escapeHtml(item.path)}" lang="${escapeHtml(item.lang)}">${escapeHtml(item.label)}</a></li>`,
          )
          .join("\n        ")}
      </ul>
    </section>`
      : "";
  const savedSection =
    savedGuides.length > 0
      ? `<section class="saved">
      <h2>${copy.savedHeading}</h2>
      <p>${copy.savedBody}</p>
      <ul>
        ${savedGuides
          .map(
            (item) =>
              `<li><a href="${escapeHtml(item.path)}" lang="${escapeHtml(item.lang)}">${escapeHtml(item.title)}</a></li>`,
          )
          .join("\n        ")}
      </ul>
    </section>`
      : `<p class="saved-empty">${copy.savedEmpty}</p>`;
  const html = `<!doctype html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fcfbf9" />
  <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a1226" />
  <title>${copy.title} - RediHealth</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #fcfbf9;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0b132b;
      --muted: #475569;
      --sapphire: #1d3557;
      --ruby: #c62f3c;
      --ruby-hover: #a8242f;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a1226;
        --surface: #101a33;
        --border: rgba(255, 255, 255, 0.14);
        --text: #fbfaf6;
        --muted: #a9b3c6;
        --sapphire: #2a4d7c;
      }
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100dvh;
      display: grid;
      place-items: center;
      background: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: max(24px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
    }
    main {
      width: 100%;
      max-width: 460px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 28px 24px;
      box-shadow: 0 8px 24px -10px rgba(10, 18, 38, 0.18);
    }
    .brand {
      font-size: 14px;
      font-weight: 700;
      letter-spacing: -0.01em;
      color: var(--text);
      margin: 0 0 12px;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 26px;
      line-height: 1.18;
      letter-spacing: -0.025em;
    }
    p {
      margin: 0 0 14px;
      font-size: 16px;
      line-height: 1.55;
      color: var(--muted);
    }
    .emergency {
      margin: 18px 0 0;
      padding-top: 16px;
      border-top: 1px solid var(--border);
      font-size: 14px;
      line-height: 1.5;
      color: var(--text);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      border: 1px solid transparent;
    }
    .btn-retry {
      background: var(--sapphire);
      color: #ffffff;
    }
    .btn-emergency {
      background: var(--ruby);
      color: #ffffff;
    }
    .btn-emergency:hover {
      background: var(--ruby-hover);
    }
    .btn:focus-visible {
      outline: 2px solid var(--sapphire);
      outline-offset: 2px;
    }
    .saved {
      margin: 20px 0 0;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }
    .saved h2 {
      margin: 0 0 6px;
      font-size: 18px;
      line-height: 1.3;
    }
    .saved p {
      margin: 0 0 6px;
    }
    .saved ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .saved li + li {
      border-top: 1px solid var(--border);
    }
    .saved a {
      display: flex;
      align-items: center;
      min-height: 48px;
      padding: 8px 0;
      font-size: 17px;
      font-weight: 600;
      line-height: 1.35;
      color: var(--text);
      text-decoration: underline;
      text-underline-offset: 4px;
    }
    .saved a:focus-visible {
      outline: 2px solid var(--sapphire);
      outline-offset: 2px;
    }
    .saved-empty {
      margin: 18px 0 0;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <main>
    <p class="brand">RediHealth</p>
    <h1>${copy.heading}</h1>
    <p>${copy.body}</p>
    <div class="actions">
      <button type="button" class="btn btn-retry" onclick="window.location.reload()">${copy.retry}</button>
      <a class="btn btn-emergency" href="tel:112">${copy.call112}</a>
    </div>
    <p class="emergency">${copy.emergencyNote}</p>
    ${sectionsHtml}
    ${savedSection}
  </main>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

let swDetectedOffline = false;

async function setSwOfflineState(nextOffline) {
  const normalized = Boolean(nextOffline);
  if (swDetectedOffline === normalized) return;
  swDetectedOffline = normalized;
  if (!self.clients || typeof self.clients.matchAll !== "function") return;
  try {
    const windowClients = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    });
    for (const client of windowClients) {
      client?.postMessage?.({ type: "OFFLINE_STATUS", offline: normalized });
    }
  } catch {
    // Ignore broadcast failures when no window clients are active
  }
}

self.addEventListener("install", (event) => {
  // First-time install claims control quickly so Chromium enables install prompts immediately;
  // updates wait for explicit user confirmation via SKIP_WAITING.
  if (!self.registration.active) {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("redihealth-") &&
              key !== SHELL_CACHE &&
              key !== STATIC_CACHE &&
              key !== GUIDES_CACHE &&
              key !== PAGES_CACHE &&
              key !== MEDIA_CACHE,
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
    return;
  }

  if (event.data?.type === "CACHE_GUIDE") {
    event.waitUntil(
      (async () => {
        try {
          const targetUrl = new URL(String(event.data.url || ""), self.location.origin);
          if (
            targetUrl.origin !== self.location.origin ||
            !isHealthGuidePath(targetUrl.pathname)
          ) {
            throw new Error("Only non-PHI health guides can be saved offline.");
          }
          const response = await fetch(targetUrl.pathname, {
            credentials: "omit",
            cache: "no-store",
          });
          // Every page of this site is sent with "private, no-store", so that header cannot decide here.
          // What makes this page safe to keep: its address is a public health guide (checked above), it was
          // asked for without cookies, so it holds nothing about the person, and it came back whole from
          // this site, without being sent on to another address.
          if (
            !response.ok ||
            response.type === "opaque" ||
            response.redirected ||
            !response.headers.get("content-type")?.includes("text/html")
          ) {
            throw new Error("Health guide unavailable for offline cache.");
          }
          const html = await response.text();
          const supplied = Array.isArray(event.data.assets) ? event.data.assets : [];
          await cacheNextStaticAssets(html, supplied, { requireAll: false });
          const guidesCache = await caches.open(GUIDES_CACHE);
          await guidesCache.put(targetUrl.pathname, sanitizePageResponseForCache(response, html));
          await rememberSavedGuide(targetUrl.pathname, html);
          event.ports[0]?.postMessage({ ok: true, path: targetUrl.pathname });
        } catch (error) {
          event.ports[0]?.postMessage({
            error: error?.message || "Health guide offline save failed.",
          });
        }
      })(),
    );
    return;
  }

  if (event.data?.type === "CACHE_PUBLIC_PAGE") {
    event.waitUntil(
      (async () => {
        try {
          const targetUrl = new URL(String(event.data.url || ""), self.location.origin);
          if (
            targetUrl.origin !== self.location.origin ||
            !isOfflinePublicPath(targetUrl.pathname)
          ) {
            event.ports[0]?.postMessage({ ok: false });
            return;
          }
          const supplied = Array.isArray(event.data.assets) ? event.data.assets : [];
          const stored = await cachePublicPathIfMissing(targetUrl.pathname, supplied);
          if (stored) {
            await trimCache(PAGES_CACHE, PAGES_CACHE_LIMIT);
          }
          event.ports[0]?.postMessage({ ok: true, path: targetUrl.pathname });
        } catch (error) {
          event.ports[0]?.postMessage({
            error: error?.message || "Public page offline save failed.",
          });
        }
      })(),
    );
    return;
  }

  if (event.data?.type === "WARM_OFFLINE_APP") {
    event.waitUntil(
      (async () => {
        try {
          const locale = SUPPORTED_LOCALES.includes(event.data.lang) ? event.data.lang : "en";
          const includeGuides = event.data.includeGuides !== false;
          const includeModels = event.data.includeModels === true;
          const supplied = Array.isArray(event.data.assets) ? event.data.assets : [];
          const paths = CORE_PUBLIC_BARE_PATHS.map((suffix) => `/${locale}${suffix}`);
          if (includeGuides) {
            for (const slug of CORE_GUIDE_SLUGS) {
              paths.push(`/${locale}/health-information/${slug}`);
            }
          }

          let cachedCount = 0;
          for (let i = 0; i < paths.length; i += 2) {
            const batch = paths.slice(i, i + 2);
            const batchAssets = i === 0 ? supplied : [];
            const results = await Promise.all(
              batch.map((path, idx) =>
                cachePublicPathIfMissing(path, idx === 0 ? batchAssets : []).catch(() => false),
              ),
            );
            cachedCount += results.filter(Boolean).length;
          }

          await warmMediaAssets(
            includeModels ? [...CORE_MEDIA_PATHS, ...CORE_MODEL_PATHS] : CORE_MEDIA_PATHS,
          );
          await rememberLocale(locale);
          await Promise.all([
            trimCache(PAGES_CACHE, PAGES_CACHE_LIMIT),
            trimCache(MEDIA_CACHE, MEDIA_CACHE_LIMIT),
          ]);
          event.ports[0]?.postMessage({
            ok: true,
            cachedCount,
            totalCount: paths.length,
          });
        } catch (error) {
          event.ports[0]?.postMessage({
            error: error?.message || "Offline app warm failed.",
          });
        }
      })(),
    );
    return;
  }

  if (event.data?.type === "GET_OFFLINE_STATUS") {
    event.ports[0]?.postMessage({ offline: swDetectedOffline });
    return;
  }

  if (event.data?.type !== "PREPARE_OFFLINE") return;
  event.waitUntil(
    (async () => {
      try {
        const shellCache = await caches.open(SHELL_CACHE);
        const locale = SUPPORTED_LOCALES.includes(event.data.lang) ? event.data.lang : "en";
        const shell = `/${locale}/offline`;
        const response = await fetch(shell, { credentials: "omit", cache: "no-store" });
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
          throw new Error("Offline shell unavailable.");
        }
        const html = await response.clone().text();
        const supplied = Array.isArray(event.data.assets) ? event.data.assets : [];
        await cacheNextStaticAssets(html, supplied, { requireAll: true });
        await shellCache.put(shell, response);
        event.ports[0]?.postMessage({ ok: true });
      } catch (error) {
        event.ports[0]?.postMessage({
          error: error?.message || "Offline preparation failed.",
        });
      }
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  if (isSensitivePath(url.pathname) && event.request.mode !== "navigate") {
    return;
  }

  // Dev builds reuse the same chunk URLs for changed code, so a cached copy would pin the old UI.
  const isLocalDevHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const matchStatic = async () =>
          (await cache.match(event.request)) ||
          (await cache.match(url.pathname)) ||
          (await cache.match(event.request, { ignoreSearch: true }));

        if (!isLocalDevHost) {
          const cached = await matchStatic();
          if (cached) return cached;
          try {
            const response = await fetch(event.request);
            if (isCacheableResponse(response)) {
              await cache.put(event.request, response.clone());
            }
            return response;
          } catch {
            return new Response("", { status: 504 });
          }
        }
        try {
          const response = await fetch(event.request);
          if (isCacheableResponse(response)) {
            await cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          const cached = await matchStatic();
          return cached || new Response("", { status: 504 });
        }
      })(),
    );
    return;
  }

  if (
    event.request.mode !== "navigate" &&
    (url.pathname.startsWith("/pwa/") ||
      url.pathname === "/manifest.webmanifest" ||
      url.pathname === "/favicon.ico" ||
      url.pathname.startsWith("/favicon-") ||
      url.pathname === "/safari-pinned-tab.svg" ||
      url.pathname.startsWith("/apple-icon") ||
      url.pathname.startsWith("/icon"))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(event.request);
        const revalidate = fetch(event.request)
          .then(async (response) => {
            if (isCacheableResponse(response)) {
              await cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        if (cached) {
          event.waitUntil(revalidate);
          return cached;
        }
        const networkResponse = await revalidate;
        return networkResponse || new Response("", { status: 504 });
      })(),
    );
    return;
  }

  if (
    event.request.mode !== "navigate" &&
    (url.pathname.startsWith("/images/") || url.pathname.startsWith("/Icons/"))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(MEDIA_CACHE);
        const cached = await cache.match(event.request);
        const revalidate = fetch(event.request)
          .then(async (response) => {
            if (isCacheableResponse(response)) {
              await cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => cached);
        if (cached) {
          event.waitUntil(revalidate);
          return cached;
        }
        const networkResponse = await revalidate;
        return networkResponse || new Response("", { status: 504 });
      })(),
    );
    return;
  }

  if (event.request.mode !== "navigate" && url.pathname === "/_next/image") {
    event.respondWith(
      (async () => {
        const mediaCache = await caches.open(MEDIA_CACHE);
        const cached = await mediaCache.match(event.request);
        const revalidate = fetch(event.request)
          .then(async (response) => {
            if (isCacheableResponse(response)) {
              await mediaCache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => null);
        if (cached) {
          event.waitUntil(revalidate);
          return cached;
        }
        const networkResponse = await revalidate;
        if (networkResponse) return networkResponse;

        const rawTarget = url.searchParams.get("url") || "";
        if (
          (rawTarget.startsWith("/images/") ||
            rawTarget.startsWith("/Icons/") ||
            rawTarget.startsWith("/pwa/")) &&
          !rawTarget.includes("..") &&
          !rawTarget.includes("//")
        ) {
          const mediaHit = await mediaCache.match(rawTarget);
          if (mediaHit) return mediaHit;
          const staticCache = await caches.open(STATIC_CACHE);
          const staticHit = await staticCache.match(rawTarget);
          if (staticHit) return staticHit;
        }
        return new Response("", { status: 504 });
      })(),
    );
    return;
  }

  if (
    event.request.mode !== "navigate" &&
    (url.pathname.startsWith("/models/") || url.pathname.startsWith("/audio/health-check/"))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(MEDIA_CACHE);
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (isCacheableResponse(response)) {
            await cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return new Response("", { status: 504 });
        }
      })(),
    );
    return;
  }

  const isRscRequest = event.request.headers?.get?.("RSC") === "1";
  if (event.request.mode !== "navigate" && isRscRequest && isOfflinePublicPath(url.pathname)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          event.waitUntil(setSwOfflineState(false));
          return response;
        } catch {
          event.waitUntil(setSwOfflineState(true));
          return new Response("", { status: 503 });
        }
      })(),
    );
    return;
  }

  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        event.waitUntil(setSwOfflineState(false));
        if (response.ok) {
          event.waitUntil(rememberLocale(localeInPath(url.pathname)));
        }
        const contentType = response.headers.get("content-type") || "";
        if (
          isOfflinePublicPath(url.pathname) &&
          !url.search &&
          response.ok &&
          response.type !== "opaque" &&
          !response.redirected &&
          contentType.includes("text/html")
        ) {
          const htmlClone = response.clone();
          const targetCacheName = isHealthGuidePath(url.pathname) ? GUIDES_CACHE : PAGES_CACHE;
          event.waitUntil(
            (async () => {
              try {
                const html = await htmlClone.text();
                const cache = await caches.open(targetCacheName);
                await cache.put(url.pathname, sanitizePageResponseForCache(response, html));
                if (targetCacheName === PAGES_CACHE) {
                  await trimCache(PAGES_CACHE, PAGES_CACHE_LIMIT);
                }
              } catch {
                // Ignore background cache failures.
              }
            })(),
          );
        }
        return response;
      } catch {
        event.waitUntil(setSwOfflineState(true));
        const panelOrOfflineMatch = /^\/(ro|en|sq|it|hr|rom|ru)\/(panel|offline)(\/|$)/.exec(
          url.pathname,
        );
        if (panelOrOfflineMatch) {
          const lang = panelOrOfflineMatch[1];
          const shellCache = await caches.open(SHELL_CACHE);
          const cached = await shellCache.match(`/${lang}/offline`);
          if (cached) return cached;
        }

        const directLocale = localeInPath(url.pathname);
        let candidatePath = url.pathname;
        if (!directLocale) {
          const fallbackLocale = (await readLastLocale()) || "ro";
          candidatePath =
            url.pathname === "/" ? `/${fallbackLocale}` : `/${fallbackLocale}${url.pathname}`;
        }

        if (isHealthGuidePath(candidatePath)) {
          const guidesCache = await caches.open(GUIDES_CACHE);
          const cachedGuide = await guidesCache.match(candidatePath);
          if (cachedGuide) return cachedGuide;
        }

        if (isOfflinePublicPath(candidatePath)) {
          const pagesCache = await caches.open(PAGES_CACHE);
          const cachedPage = await pagesCache.match(candidatePath);
          if (cachedPage) return cachedPage;
        }

        return offlineFallbackFor(url.pathname);
      }
    })(),
  );
});
