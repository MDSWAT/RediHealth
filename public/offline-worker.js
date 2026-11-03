/* Only the data-free offline shell and immutable app assets may enter Cache Storage. */
const CACHE = "redihealth-offline-shell-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("message", (event) => {
  if (event.data?.type !== "PREPARE_OFFLINE") return;
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE);
      const locale = ["en", "ro", "sq", "it"].includes(event.data.lang) ? event.data.lang : "en";
      const shell = `/${locale}/offline`;
      const response = await fetch(shell, { credentials: "omit", cache: "no-store" });
      if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Offline shell unavailable.");
      const html = await response.clone().text();
      const assets = [...html.matchAll(/(?:src|href)="([^"]*\/_next\/static\/[^"]+)"/g)].map((match) => new URL(match[1].replace(/&amp;/g, "&"), self.location.origin).href);
      const supplied = Array.isArray(event.data.assets) ? event.data.assets : [];
      for (const asset of [...new Set([...assets, ...supplied])]) {
        const url = new URL(asset, self.location.origin);
        if (url.origin !== self.location.origin || !url.pathname.startsWith("/_next/static/")) continue;
        const result = await fetch(url.href, { credentials: "omit" });
        if (!result.ok) throw new Error("Offline app asset unavailable.");
        await cache.put(url.href, result);
      }
      await cache.put(shell, response);
      event.ports[0]?.postMessage({ ok: true });
    } catch (error) {
      event.ports[0]?.postMessage({ error: error.message || "Offline preparation failed." });
    }
  })());
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET") return;
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    })());
    return;
  }
  if (event.request.mode !== "navigate" || !/^\/(en|ro|sq|it)\/(panel|offline)(\/|$)/.test(url.pathname)) return;
  event.respondWith((async () => {
    try { return await fetch(event.request); }
    catch {
      const lang = url.pathname.split("/")[1];
      const cached = await caches.match(`/${lang}/offline`);
      return cached || new Response("Offline workspace is not prepared on this device. Connect online and enable encrypted offline access first.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
  })());
});
