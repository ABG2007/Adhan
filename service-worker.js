/**
 * Service Worker for AdhanApp
 * Provides offline functionality and caching for the PWA
 */

// Cache name (update version when making changes to the app)
const CACHE_NAME = 'adhan-app-v6';

// Files to cache for offline use
const FILES_TO_CACHE = [
  // Core App Shell for index.html
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/script.js',
  '/js/prayer-times.js',
  '/js/api-handler.js',
  '/js/translations.js',

  // Additional CSS for index.html
  '/css/header-rtl-fix.css',
  '/css/logo-image.css',
  '/css/keyboard-nav.css',
  '/css/location-style.css',
  '/css/header-mobile-fix.css',
  '/css/header-icons-fix.css',
  '/css/theme-colors.css',
  '/css/about-modal.css',
  '/css/arabic-font.css',

  // Core App Shell for mosques.html
  '/mosques.html',
  '/css/mosques-page.css',
  '/js/mosques-page.js',

  // Shared Assets (Audio, Images)
  '/assets/audio/adhan.mp3',
  '/assets/audio/adhan_makkah.mp3',
  '/assets/audio/adhan_fajr.mp3',
  '/assets/audio/reminder.mp3',
  '/assets/images/icon-192x192.png',
  '/assets/images/icon-512x512.png',
  '/assets/images/icon-48x48.png',
  '/assets/images/settings-icon.png',

  // External Libraries - Réactivées
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet-geosearch@3.11.0/dist/geosearch.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-geosearch@3.11.0/dist/geosearch.umd.js'
];

// Install event - Cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');

  // Wait until caching is complete
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell with addAll...');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        // Force activation after install
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch(error => {
        // Cet erreur globale se déclenchera si l'un des cache.add() échoue
        console.error('[Service Worker] Caching failed during install:', error);
        // Il est important de relancer l'erreur pour que l'installation du SW échoue correctement
        throw error;
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');

  // Remove old caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  // Ensure service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - Serve cached content when offline
self.addEventListener('fetch', (event) => {
  console.log('[Service Worker v6] Fetch event for:', event.request.url);
  const reqUrl = event.request.url;

  // Strategy 1: Network-first for specific external APIs we want to cache
  if (
    reqUrl.includes('api.aladhan.com') ||
    reqUrl.includes('ipapi.co') ||
    reqUrl.includes('nominatim.openstreetmap.org') || // For location search in mosques.html
    reqUrl.includes('api.bigdatacloud.net') // For reverse geocoding
  ) {
    console.log('[Service Worker] Handling API request (Network-First):', reqUrl);
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            let responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
              console.log('[Service Worker] API response cached:', reqUrl);
            });
          }
          return response;
        })
        .catch(() => {
          console.log('[Service Worker] Network request failed for API, trying cache for:', reqUrl);
          return caches.match(event.request);
        })
    );
  }
  // Strategy 2: Cache-first for local assets and whitelisted CDNs
  else if (
    reqUrl.startsWith(self.location.origin) ||
    reqUrl.startsWith('https://cdnjs.cloudflare.com') ||
    reqUrl.startsWith('https://unpkg.com')
  ) {
    // console.log('[Service Worker] Handling static asset (Cache-First):', reqUrl); // Optional debug
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                let responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return networkResponse;
            })
            .catch((err) => {
              console.error('[Service Worker] Fetch error for static asset:', reqUrl, err);
              // Special handling for HTML requests - show offline page
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
  // Other requests (e.g., browser extensions) will pass through normally.
});

// Push event - Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');

  const title = 'AdhanApp';
  const options = {
    body: 'Il est temps de prier!',
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/icon-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event - Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click');

  event.notification.close();

  // Open the app when clicking on the notification
  event.waitUntil(
    clients.openWindow('/')
  );
});
