/* Jaiguru Astroremedy service worker - network-first caching. */
const CACHE = "jaiguru-v2";
const CACHE_EXCLUDE = ["/api/", "/admin"];

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (CACHE_EXCLUDE.some((prefix) => url.pathname.startsWith(prefix))) return;

  // Next.js router RSC payloads must always hit the network - they are
  // never storable (Cache-Control: no-store) and caching them breaks the
  // router's client-side navigation.
  if (url.searchParams.has("_rsc")) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches
            .open(CACHE)
            .then((cache) => cache.put(request, copy).catch(() => {}))
            .catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches
          .match(request)
          .then((cached) => cached || caches.match("/"))
      )
  );
});