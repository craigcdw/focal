const CACHE = "focal-v1";
const OFFLINE_URL = "/offline";

const PRECACHE = [
  "/",
  "/offline",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const { request } = event;

  // Skip non-GET and cross-origin requests
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  // Skip Supabase / API calls — always go network-only
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase.co")) return;

  // For navigation requests: network first, fall back to offline page
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(r => r ?? new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // For static assets: cache first, then network
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => cached ?? new Response("", { status: 408 }));
    })
  );
});
