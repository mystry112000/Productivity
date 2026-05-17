const CACHE = "flow-v1";
const ASSETS = [
  "index.html",
  "manifest.json",
  "assets/icon_128.png",
  "assets/icon_192.png",
  "assets/icon_256.png",
  "assets/icon_512.png",
  "assets/icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  // Only handle GET requests
  if (e.request.method !== "GET") return;
  // Only handle same-origin
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
      // Cache successful responses
      if (res.ok && res.type === "basic") {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => {
      // Offline fallback: try cache again (in case it's an HTML navigation)
      return caches.match("index.html");
    }))
  );
});
