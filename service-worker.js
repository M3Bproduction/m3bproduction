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
  "/m3music/music.html",
  "/m3music/music.css",
  "/m3music/albums.html",
  "/m3music/artistes.html",
  "/m3music/classique.jpg",
  "/m3music/rap.png",
  "/m3music/NAS BLK/nasblk.html",
  "/m3music/NAS BLK/nasblk.jpg",
  "/m3music/NAS BLK/tsola.jpg",
  "/m3music/SLK/slk.html",
  "/m3music/SLK/slk.jpg",
  "/m3music/SLK/ndezeanla.html",
  "/m3music/SLK/NDEZE ANLA/1. SLK - ZE-ANLA.mp3"
  "/m3music/SLK/NDEZE ANLA/ndezeanla.jpg",
  "/m3music/SLK/NGAM NENO/ngamneno.jpg",
  "/m3music/Victorious Awax/awax.html",
  "/m3music/Victorious Awax/awax.jpg",
  "/m3music/Victorious Awax/NI YENSHI/niyenshi.jpg",
  "/m3music/Victorious Awax/ROHO/roho.jpg",
  "/m3music/Victorious Awax/TafaUti/tafauti.jpg",
  "/m3info/info.html",
  "/m3info/info.css",
  "/m3info/programmation.html",
  "/m3info/programation/html.html",
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
