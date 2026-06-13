/* Service worker — deixa o app funcionar offline.
   Estratégia: cache-first para a "casca" do app; atualiza em segundo plano.
   Ao publicar uma nova versão, troque CACHE_VERSION para forçar atualização. */
var CACHE_VERSION = "copa2026-v29";
/* assets agrupados: HTML/CSS/JS são a "casca" e devem ser coerentes entre si.
   Versionar com ?v= força o navegador a baixar a cópia certa (evita CSS/JS mistos). */
var ASSETS = [
  ".",
  "index.html",
  "style.css",
  "app.js",
  "data/album.js",
  "data/jogos.js",
  "data/i18n.js",
  "jogos-app.js",
  "manifest.json",
  "icons/icon.svg",
  "vendor/lz-string.min.js",
  "vendor/qrcode.min.js"
];

self.addEventListener("install", function (e) {
  // NÃO faz skipWaiting automático: o novo SW fica "esperando" e o app mostra
  // o aviso "nova versão disponível". O skipWaiting só ocorre quando o usuário
  // toca em "Atualizar" (mensagem SKIP_WAITING abaixo).
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // cache-busting na instalação: garante baixar a versão ATUAL de cada arquivo
      var reqs = ASSETS.map(function (u) {
        return new Request(u + (u.indexOf("?") > -1 ? "&" : "?") + "v=" + CACHE_VERSION, { cache: "reload" });
      });
      // addAll é atômico: se um falhar, o cache novo nem é criado (sem versão pela metade)
      return Promise.all(reqs.map(function (req, i) {
        return fetch(req).then(function (resp) {
          if (resp && (resp.ok || resp.type === "opaque")) return cache.put(ASSETS[i], resp);
        });
      }));
    })
  );
});

self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
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
  var req = e.request;
  // NAVEGAÇÃO (o index.html): rede primeiro, cache como reserva.
  // Evita ficar preso num HTML antigo enquanto CSS/JS já atualizaram (tela quebrada).
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (resp) {
        var copy = resp.clone();
        caches.open(CACHE_VERSION).then(function (c) { c.put("index.html", copy); });
        return resp;
      }).catch(function () {
        return caches.match(req).then(function (m) { return m || caches.match("index.html"); });
      })
    );
    return;
  }
  // demais assets: cache primeiro (rápido/offline), atualiza em segundo plano
  e.respondWith(
    caches.match(req).then(function (cached) {
      var net = fetch(req).then(function (resp) {
        if (resp && resp.status === 200 && resp.type === "basic") {
          var copy = resp.clone();
          caches.open(CACHE_VERSION).then(function (c) { c.put(req, copy); });
        }
        return resp;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});
