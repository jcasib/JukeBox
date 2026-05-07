const CACHE_NAME = 'jukebox-v1'
const STATIC_ASSETS = [
    '/',
    '/index.html',
]

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    )
    self.skipWaiting()
})

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    )
    self.clients.claim()
})

self.addEventListener('fetch', event => {
    // Solo cachear peticiones GET, nunca las del backend
    if (event.request.method !== 'GET') return
    if (event.request.url.includes('/api/')) return

    event.respondWith(
        fetch(event.request)
            .then(response => {
                const clone = response.clone()
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
                return response
            })
            .catch(() => caches.match(event.request))
    )
})

self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {}
    const title = data.title || "Jukebox"
    const body = data.body || "Tienes peticiones pendientes"

    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [200, 100, 200],
            data: { url: "/mod" }
        })
    )
})

self.addEventListener('notificationclick', event => {
    event.notification.close()
    event.waitUntil(
        clients.openWindow(event.notification.data.url || "/mod")
    )
})