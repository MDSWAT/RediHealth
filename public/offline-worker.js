/* Only the data-free offline shell, static assets, and zero-PHI offline fallback may enter Cache Storage or respond offline. */
const SHELL_CACHE = "redihealth-offline-shell-v2";
const STATIC_CACHE = "redihealth-static-v2";
const SUPPORTED_LOCALES = ["ro", "en", "sq", "it", "hr", "rom", "ru"];

const OFFLINE_FALLBACK_COPY = {
  ro: {
    title: "Ești offline",
    heading: "Ești offline",
    body: "RediHealth are nevoie de internet pentru a încărca această pagină. Verifică conexiunea și încearcă din nou.",
    emergencyNote: "Dacă este o urgență medicală, sună direct la 112.",
    call112: "Sună la 112",
    retry: "Încearcă din nou",
  },
  en: {
    title: "You are offline",
    heading: "You are offline",
    body: "RediHealth needs an internet connection to load this page. Check your connection and try again.",
    emergencyNote: "If this is a medical emergency, call 112 directly.",
    call112: "Call 112",
    retry: "Try again",
  },
  sq: {
    title: "Je jashtë linje",
    heading: "Je jashtë linje",
    body: "RediHealth ka nevojë për lidhje interneti për të hapur këtë faqe. Kontrollo lidhjen dhe provo përsëri.",
    emergencyNote: "Nëse është urgjencë mjekësore, telefono direkt 112.",
    call112: "Telefono 112",
    retry: "Provo përsëri",
  },
  it: {
    title: "Sei offline",
    heading: "Sei offline",
    body: "RediHealth richiede una connessione internet per caricare questa pagina. Controlla la connessione e riprova.",
    emergencyNote: "Se è un'emergenza medica, chiama subito il 112.",
    call112: "Chiama il 112",
    retry: "Riprova",
  },
  hr: {
    title: "Izvan mreže si",
    heading: "Izvan mreže si",
    body: "RediHealth treba internetsku vezu za učitavanje ove stranice. Provjeri vezu i pokušaj ponovno.",
    emergencyNote: "Ako je hitan medicinski slučaj, odmah nazovi 112.",
    call112: "Nazovi 112",
    retry: "Pokušaj ponovno",
  },
  rom: {
    title: "San bi-internetesko",
    heading: "San bi-internetesko",
    body: "RediHealth mangel interneto te putrel kadi rig. Dikh o interneto thaj zumav palem.",
    emergencyNote: "Te si sastipnaski sigardiari, akhar rigate ko 112.",
    call112: "Akhar ko 112",
    retry: "Zumav palem",
  },
  ru: {
    title: "Нет подключения к сети",
    heading: "Нет подключения к сети",
    body: "Для загрузки этой страницы RediHealth требуется подключение к интернету. Проверьте соединение и попробуйте еще раз.",
    emergencyNote: "Если это неотложная медицинская помощь, позвоните 112.",
    call112: "Позвоните 112",
    retry: "Попробуйте еще раз",
  },
};

function resolveLocaleFromPath(pathname) {
  const segment = pathname.split("/").filter(Boolean)[0];
  return SUPPORTED_LOCALES.includes(segment) ? segment : "en";
}

function isSensitivePath(pathname) {
  if (pathname.startsWith("/api/")) return true;
  const stripped = pathname.replace(/^\/(ro|en|sq|it|hr|rom|ru)(?=\/|$)/, "") || "/";
  return (
    stripped === "/panel" ||
    stripped.startsWith("/panel/") ||
    stripped === "/patient-portal" ||
    stripped.startsWith("/patient-portal/") ||
    stripped === "/sign-in" ||
    stripped.startsWith("/sign-in/") ||
    stripped === "/health-check/note" ||
    stripped.startsWith("/health-check/note/")
  );
}

function isCacheableResponse(response) {
  if (!response || !response.ok || response.type === "opaque") return false;
  const cc = (response.headers.get("cache-control") || "").toLowerCase();
  if (cc.includes("no-store") || cc.includes("private")) return false;
  return true;
}

function buildOfflineFallbackResponse(locale) {
  const copy = OFFLINE_FALLBACK_COPY[locale] || OFFLINE_FALLBACK_COPY.en;
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
            (key) => key.startsWith("redihealth-") && key !== SHELL_CACHE && key !== STATIC_CACHE,
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

  if (event.data?.type !== "PREPARE_OFFLINE") return;
  event.waitUntil(
    (async () => {
      try {
        const shellCache = await caches.open(SHELL_CACHE);
        const staticCache = await caches.open(STATIC_CACHE);
        const locale = SUPPORTED_LOCALES.includes(event.data.lang) ? event.data.lang : "en";
        const shell = `/${locale}/offline`;
        const response = await fetch(shell, { credentials: "omit", cache: "no-store" });
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
          throw new Error("Offline shell unavailable.");
        }
        const html = await response.clone().text();
        const assets = [
          ...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g),
        ].map((match) => new URL(match[1].replace(/&amp;/g, "&"), self.location.origin).href);
        const supplied = Array.isArray(event.data.assets) ? event.data.assets : [];
        for (const asset of [...new Set([...assets, ...supplied])]) {
          const url = new URL(asset, self.location.origin);
          if (url.origin !== self.location.origin || !url.pathname.startsWith("/_next/static/")) {
            continue;
          }
          const result = await fetch(url.href, { credentials: "omit" });
          if (!result.ok) throw new Error("Offline app asset unavailable.");
          await staticCache.put(url.href, result);
        }
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

  if (url.pathname.startsWith("/_next/static/") && !isLocalDevHost) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (isCacheableResponse(response)) {
          await cache.put(event.request, response.clone());
        }
        return response;
      })(),
    );
    return;
  }

  if (
    event.request.mode !== "navigate" &&
    (url.pathname.startsWith("/pwa/") ||
      url.pathname === "/favicon.ico" ||
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

  if (event.request.mode !== "navigate") return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        const panelOrOfflineMatch = /^\/(ro|en|sq|it|hr|rom|ru)\/(panel|offline)(\/|$)/.exec(
          url.pathname,
        );
        if (panelOrOfflineMatch) {
          const lang = panelOrOfflineMatch[1];
          const shellCache = await caches.open(SHELL_CACHE);
          const cached = await shellCache.match(`/${lang}/offline`);
          if (cached) return cached;
        }
        return buildOfflineFallbackResponse(resolveLocaleFromPath(url.pathname));
      }
    })(),
  );
});
