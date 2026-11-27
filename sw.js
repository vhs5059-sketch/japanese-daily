const CACHE = "japanese-daily-8b5885162919";
const FILES = ["./","assets/index-DK0iBDUi.js","assets/index-BB3ueGdd.css","index.html","icon-180.png","icon-192.png","icon-512.png","icon.svg","manifest.webmanifest"];

// 브라우저에 잠시 남아 있는 이전 사본이 섞이지 않도록, 저장할 파일은 서버에서 새로 받습니다.
self.addEventListener("install", (event) => {
  const requests = FILES.map((file) => new Request(file, { cache: "reload" }));
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(requests)).then(() => self.skipWaiting()));
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
  // 화면 파일은 열 때마다 서버에 바뀌었는지 확인해서, 업데이트가 바로 보이게 합니다.
  const options = request.mode === "navigate" ? { cache: "no-cache" } : undefined;
  event.respondWith(
    fetch(request, options).catch(async () => {
      const store = await caches.open(CACHE);
      const saved = await store.match(request, { ignoreSearch: true, ignoreVary: true });
      return saved ?? (request.mode === "navigate" ? await store.match("./") : undefined) ?? Response.error();
    }),
  );
});
