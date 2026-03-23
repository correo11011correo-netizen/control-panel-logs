const CACHE_NAME = 'monitor-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// --- Background Sync ---
self.addEventListener('sync', event => {
  if (event.tag === 'sync-logs') {
    event.waitUntil(syncLogs());
  }
});

async function syncLogs() {
  console.log('[Service Worker] Sincronizando logs en segundo plano...');
  // Aquí iría la lógica para vaciar una cola de logs offline (IndexedDB)
}

// --- Periodic Background Sync ---
self.addEventListener('periodicsync', event => {
  if (event.tag === 'update-monitor-data') {
    event.waitUntil(updateMonitorData());
  }
});

async function updateMonitorData() {
  console.log('[Service Worker] Sincronización periódica de datos ejecutada.');
  // Aquí podemos hacer pre-fetch de los datos desde Google Apps Script en background
}

// --- Push Notifications ---
self.addEventListener('push', event => {
  let data = { title: 'Alerta del Monitor', body: 'Nuevo evento recibido.', url: './index.html' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './maskable-icon.png',
    data: { url: data.url },
    vibrate: [200, 100, 200, 100, 200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});