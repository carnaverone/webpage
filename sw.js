// sw.js
const CACHE_NAME = 'static-v1';
const CACHE_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './scripts.js',
    './images/logo.png',
    './images/error.png' // Ajoutez votre image d'erreur ici
];

// Installation du service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache ouvert et ressources ajoutées');
            return cache.addAll(CACHE_ASSETS);
        })
    );
    self.skipWaiting(); // Force le service worker à prendre le contrôle immédiatement
});

// Activation du service worker
self.addEventListener('activate', async event => {
    const cacheKeys = await caches.keys();
    await Promise.all(
        cacheKeys.map(async cacheName => {
            if (cacheName !== CACHE_NAME) {
                console.log(`Cache ${cacheName} supprimé`);
                await caches.delete(cacheName); // Supprime les anciens caches
            }
        })
    );
});

// Récupération des ressources
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(async response => {
            // Si la ressource est dans le cache, retourne-la. Sinon, fait une requête réseau.
            if (response) {
                // Mise à jour du cache en arrière-plan
                fetch(event.request)
                    .then(async networkResponse => {
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return; // Ne mettez pas en cache les erreurs ou les réponses non basiques
                        }
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(event.request, networkResponse.clone());
                    })
                    .catch(error => {
                        console.error(`Erreur lors de la récupération de ${event.request.url}:`, error);
                    });

                return response; // Retourne la réponse du cache
            }

            // Si la ressource n'est pas dans le cache, essayez de la récupérer via le réseau
            return fetch(event.request).then(async networkResponse => {
                // Vérifiez si la réponse est valide et mettez-la en cache
                if (networkResponse && networkResponse.status === 200) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(event.request, networkResponse.clone());
                }
                return networkResponse;
            }).catch(() => {
                // Gestion des erreurs : retourner une page d'erreur ou une image si le réseau échoue.
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html'); // Retourne la page d'accueil si le réseau échoue lors d'une navigation
                }
                // Retournez une page d'erreur personnalisée si disponible
                return caches.match('./images/error.png'); // Remplacez par le chemin de votre image d'erreur
            });
        })
    );
});

// Synchronisation en arrière-plan (optionnel)
// Cette fonctionnalité nécessite un gestionnaire de synchronisation et peut être utilisée pour synchroniser les données
self.addEventListener('sync', event => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Exécutez ici la logique de synchronisation des données
            console.log('Synchronisation des données en arrière-plan...')
        );
    }
});
