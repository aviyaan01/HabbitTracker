// =============================================
// Service Worker — habbittracker-v10
// Network-First with cache fallback
// =============================================

const CACHE_NAME = 'habbittracker-v10';
const ASSETS = [
  './',
  './index.html',
  './login.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/** Install: Pre-cache core assets & activate immediately */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

/** Activate: Delete ALL old caches (including habit-tracker-v7) & claim clients */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) {
            return caches.delete(k);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/** Fetch: Network First strategy — always serve latest changes, fallback to cache */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
