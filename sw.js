/* Service worker: permite estudiar sin conexión. Sube VERSION al cambiar archivos. */
const VERSION = 'lcb-v2.1.1';
importScripts('assets/js/signs-official.js');
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'assets/css/app.css',
  'assets/js/questions.js', 'assets/js/signs-official.js', 'assets/js/signs.js', 'assets/js/app.js', 'assets/icon.svg', ...self.OFFICIAL_SIGNS.map(s => s.src)];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Red primero (contenido fresco), caché como respaldo sin conexión.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
