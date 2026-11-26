const CACHE = "japanese-daily-489f73cd2dc5";
const FILES = ["./","assets/index-Bzlc3t9N.js","assets/index-BB3ueGdd.css","index.html","icon-180.png","icon-192.png","icon-512.png","icon.svg","manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("japanese-daily-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !request.url.startsWith(self.registration.scope)) return;
  event.respondWith(
    fetch(request).catch(async () => {
      const store = await caches.open(CACHE);
      const saved = await store.match(request, { ignoreSearch: true, ignoreVary: true });
      return saved ?? (request.mode === "navigate" ? await store.match("./") : undefined) ?? Response.error();
    }),
  );
});
