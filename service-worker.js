/* Service worker — deixa o app funcionar offline.
   Estratégia: cache-first para a "casca" do app; atualiza em segundo plano.
   Ao publicar uma nova versão, troque CACHE_VERSION para forçar atualização. */
var CACHE_VERSION = "copa2026-v2";
var ASSETS = [
  ".",
  "index.html",
  "style.css",
  "app.js",
  "data/album.js",
  "manifest.json",
  "icons/icon.svg",
  "vendor/lz-string.min.js",
  "vendor/qrcode.min.js"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(ASSETS).catch(function () { /* ignora itens ausentes */ });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE_VERSION) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var net = fetch(e.request).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === "basic") {
          var copy = resp.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(e.request, copy); });
        }
        return resp;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
