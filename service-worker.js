const cacheName = 'cache-v1';
const files = [
  '/',
  'index.html',
  'css/style.css',
  'js/checkers.js',
  'js/ui.js',
  'js/ai.js',
  'images/crowns/crown.svg',
  'images/crowns/crown-black.svg',
  'images/crowns/crown-white.svg',
  'fonts/roboto-condensed-regular.woff',
  'fonts/roboto-condensed-bold.woff'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName)
      .then(cache => {
      cache.addAll(files);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== cacheName)
        .map(key => caches.delete(key))
      )
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});