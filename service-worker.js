const CACHE_NAME = "nomadic-cards-v1";
const BASE = "/nomadic-cards/"; // your folder name in Live Server
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./cards.json",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(
      (resp) =>
        resp ||
        fetch(e.request).catch(
          () =>
            new Response("You’re offline, but the app is cached.", {
              headers: { "Content-Type": "text/plain" },
            })
        )
    )
  );
});
