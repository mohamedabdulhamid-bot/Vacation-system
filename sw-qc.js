const CACHE_NAME = 'qc-vacation-v1';
const ASSETS_TO_CACHE = [
  './qc.html',
  './manifest-qc.json',
  './logo.png'
];

self.addEventListener('install', (e) => {
  console.log('[Service Worker QC] Installed');
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          // يمسح فقط الكاش القديم الخاص بالـ QC ولا يمس كاش الإنتاج
          if (key !== CACHE_NAME && key.startsWith('qc-vacation')) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
