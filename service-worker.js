const CACHE_NAME = "m3b-production-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/style.css",
  "/manifest.json",
  "/m3b-production.png",
  "/favicon.ico",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/js/main.js", // ajoute ici tes fichiers JavaScript
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

// Activation : nettoyage des anciens caches
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

// Fetch : réseau d'abord, puis cache
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
          return cached || caches.match("/index.html");
        });
      })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('m3b-production-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/style.css',
        '/m3b-production.png'
        // ajoute d'autres fichiers nécessaires ici
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      // Si échec (ex: offline), et que c’est une requête HTML
      if (event.request.mode === 'navigate') {
        return caches.match('/offline.html');
      }
    })
  );
});
