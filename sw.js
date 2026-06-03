// MundialGo service worker — offline básico (Fase 6 del brief).
// Estrategia: precache del shell + stale-while-revalidate para todo lo demás.
const CACHE = "mundialgo-v1";
const SCOPE_URL = new URL(self.registration.scope);
const SHELL = ["", "index.html", "manifest.webmanifest"].map(
  (p) => new URL(p, SCOPE_URL).toString(),
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || !req.url.startsWith("http")) return;

  // Navegaciones: network-first con fallback al index cacheado (SPA offline).
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(new URL("index.html", SCOPE_URL).toString()).then(
          (r) => r ?? Response.error(),
        ),
      ),
    );
    return;
  }

  // Resto: stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
