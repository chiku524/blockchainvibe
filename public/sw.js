// Service Worker for BlockchainVibe PWA
// Provides offline support and caching

const CACHE_NAME = 'blockchainvibe-v3';
const RUNTIME_CACHE = 'blockchainvibe-runtime-v3';

// Only cache non-document assets on install (don't cache / or index.html so refresh gets latest)
const STATIC_ASSETS = [
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache install failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - network-first for document so normal refresh gets latest build; cache-first for hashed assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Navigation/document: always fetch from network with no-store so browser never serves stale HTML
  const isDocument = request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html';
  if (isDocument) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then((response) => response)
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  // API: network-only (do not cache) so news and other dynamic data are never stale
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(
          JSON.stringify({ error: 'Offline', message: 'You are currently offline. Please check your connection.' }),
          { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // Static assets (hashed JS/CSS, images): cache-first for speed
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache));
        return response;
      });
    })
  );
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-activity') {
    event.waitUntil(
      // Sync user activity when back online
      syncActivity()
    );
  }
});

async function syncActivity() {
  // Get pending activities from IndexedDB or localStorage
  // and sync them with the server
  try {
    // Implementation would go here
    console.log('[Service Worker] Syncing activity data');
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Push notification handler (if needed in future)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'BlockchainVibe';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

