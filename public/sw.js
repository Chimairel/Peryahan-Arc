const CACHE_NAME = 'peryahan-v3';

// Pre-cache critical application shell assets immediately upon install
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
];

// Install: pre-cache critical assets + skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching app shell for iOS & Android offline support');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error('[SW] Pre-cache failed:', err))
  );
});

// Activate: clean old caches + claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy for maximum iOS Safari & Android offline reliability
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http(s) and external extension requests
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. If asset or page is already in cache, serve it immediately (works 100% offline on iOS)
      if (cachedResponse) {
        // Optional background update if online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            // Quietly ignore network failures when offline
          });

        return cachedResponse;
      }

      // 2. Not in cache yet — fetch from network and cache for offline use
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          // 3. Network failed & not in cache — fallback to cached root '/' for page navigations
          if (event.request.mode === 'navigate') {
            return caches.match('/') || caches.match('/manifest.json');
          }
          return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
