/* Diana Fit Coach – service worker. Muda a versão a cada atualização para os telemóveis apanharem a nova. */
var VERSION = "dfc-v8";
var FILES = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(VERSION).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(keys){ return Promise.all(keys.filter(function(k){ return k !== VERSION; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener("fetch", function(e){
  var req = e.request; if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin){
    /* fontes e NoSleep: rede primeiro, cache como reserva */
    e.respondWith(caches.open(VERSION).then(function(c){ return fetch(req).then(function(r){ if (r.ok) c.put(req, r.clone()); return r; }).catch(function(){ return c.match(req); }); }));
    return;
  }
  /* ficheiros da app: rede primeiro (para apanhar versões novas), cache se estiver offline */
  e.respondWith(fetch(req).then(function(r){ var copy = r.clone(); caches.open(VERSION).then(function(c){ c.put(req, copy); }); return r; }).catch(function(){ return caches.match(req).then(function(m){ return m || caches.match("./index.html"); }); }));
});
