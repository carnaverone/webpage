// sw.js
const CACHE_NAME = 'static-v1';
const CACHE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './scripts.js',
    './images/logo.png'
];

// Installation du service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_ASSETS);
        })
    );
});

// Activation du service worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName); // Supprime les anciens caches
                    }
                })
            );
        })
    );
});

// Récupération des ressources
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Si la ressource est dans le cache, retourne-la. Sinon, fait une requête réseau.
            return response || fetch(event.request).catch(() => {
                // Gestion des erreurs : retourner une page par défaut ou une image si le réseau échoue.
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html'); // Retourne la page d'accueil si le réseau échoue lors d'une navigation
                }
            });
        })
    );
});
