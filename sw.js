const CACHE_NAME = 'bobriakov-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.json'
];

// Instalace service workeru
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Aktivace service workeru
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - offline režim
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Vrátit z cache pokud existuje
        if (response) {
          return response;
        }

        // Pokusit se načíst z internetu
        return fetch(event.request).then(
          response => {
            // Kontrolovat zda je odpověď validní
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Uložit do cache pro budoucí použití
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Offline fallback
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});