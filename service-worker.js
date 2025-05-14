/**
 * Service Worker for AdhanApp
 * Provides offline functionality and caching for the PWA
 */

// Cache name (update version when making changes to the app)
const CACHE_NAME = 'adhan-app-v1';

// Files to cache for offline use
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/js/prayer-times.js',
  '/js/api-handler.js',
  '/manifest.json',
  '/assets/audio/adhan.mp3',
  '/assets/audio/adhan_makkah.mp3',
  '/assets/audio/adhan_fajr.mp3',
  '/assets/images/icon-192x192.png',
  '/assets/images/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - Cache all static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  
  // Wait until caching is complete
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        // Force activation after install
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
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
  console.log('[Service Worker] Fetch', event.request.url);
  
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    
    // Network-first strategy for API requests
    if (event.request.url.includes('api.aladhan.com') || 
        event.request.url.includes('nominatim.openstreetmap.org') ||
        event.request.url.includes('ipapi.co')) {
      
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // If the response is valid, clone it and store it in the cache
            if (response && response.status === 200) {
              let responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return response;
          })
          .catch(() => {
            // If the network request fails, try to get it from the cache
            return caches.match(event.request);
          })
      );
    } 
    // Cache-first strategy for static assets
    else {
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            // Return the cached response if found
            if (response) {
              return response;
            }
            
            // If not in cache, fetch from network
            return fetch(event.request)
              .then((response) => {
                // If the response is valid, clone it and store it in the cache
                if (response && response.status === 200) {
                  let responseClone = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
                return response;
              })
              .catch((err) => {
                console.log('[Service Worker] Fetch error:', err);
                // Special handling for HTML requests - show offline page
                if (event.request.headers.get('accept').includes('text/html')) {
                  return caches.match('/index.html');
                }
              });
          })
      );
    }
  }
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
