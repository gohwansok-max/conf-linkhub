const CACHE = 'conf-linkhub-v10';
const ASSETS = [
  './', './index.html', './style.css?v=20261128', './experience.css?v=20261128',
  './script.js?v=20261128', './experience.js?v=20261128', './install.js',
  './data/links.csv', './data/products.json', './assets/qr.svg',
  './assets/resource-ad.jpg', './assets/potion-coffee-poster.jpg',
  './assets/potion-ginger-poster.jpg', './assets/potion-jujube-poster.jpg',
  './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('conf-linkhub-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // 동영상 부분 응답(206)을 전체 파일처럼 저장하지 않는다.
  if (request.headers.has('range') || /\.mp4(?:\?|$)/.test(request.url)) return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.status === 200) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
    }
    return response;
  }).catch(() => caches.match(request).then(cached => cached || (
    request.mode === 'navigate' ? caches.match('./index.html') : Response.error()
  ))));
});
