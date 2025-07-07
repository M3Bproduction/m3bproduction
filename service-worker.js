const CACHE_NAME = "m3b-production-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/style.css",
  "/manifest.json",
  "/favicon.ico",
  "/m3b-production.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/js/main.js",
  "/m3music/music.html",
  "/m3info/info.html",
  "/contact.html",
  "/apropos.html",
  "/confiden.html",
  "/legale.html"
];

// Installation : mise en cache initiale
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Gestion des requêtes : réseau d'abord, puis cache, puis offline.html pour HTML
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match("/offline.html");
          }
        });
      })
  );
});
