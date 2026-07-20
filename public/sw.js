const CACHE_NAME = 'peryahan-v2';

// Minimal pre-cache list — the rest gets cached dynamically on first visit
const PRECACHE_ASSETS = [
  '/manifest.json',
  '/icon.svg',
];

// Install: pre-cache critical assets + skip waiting immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
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

// Fetch: Network-first for navigations, Cache-first for assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip caching for non-http(s) requests and browser extension resources
  if (!url.protocol.startsWith('http')) return;

  // Page navigation requests (HTML pages) — Network first, fall back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache a copy of the successful page response
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline: serve the cached page (or the cached root '/' as fallback)
          return caches.match(event.request)
            .then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) — Cache first, fall back to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        // Serve from cache immediately, update in background
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
            }
          })
          .catch(() => {});
        return cached;
      }

      // Not in cache yet — fetch from network and cache it
      return fetch(event.request)
        .then((response) => {
          // Only cache valid same-origin responses
          if (!response || response.status !== 200) {
            return response;
          }
          // Cache the response for offline use
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Asset unavailable offline — return nothing
          return new Response('', { status: 408, statusText: 'Offline' });
        });
    })
  );
});
