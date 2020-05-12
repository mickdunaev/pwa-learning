const staticCacheName = 'site-statics-v5'
const dynamicCache = 'site-dynamic-v7'

//в асетах хранится массив возможных запросов к серверу ответы на которые нужно сохранить в кэше
const assets = [
    '/',
    '/index.html',
    '/js/app.js',
    '/js/ui.js',
    '/js/materialize.min.js',
    '/css/styles.css',
    '/css/materialize.min.css',
    '/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/pages/fallback.html'
];

const cacheLimitSize = async (name, size) => {
    const cache = await caches.open(name)
    const keys = await cache.keys()
    if (keys.length > size) {
        await cache.delete(keys[0])
        cacheLimitSize(name, size)
    }
}

//install event
self.addEventListener('install', evt => {
    //console.log('service worker has been install')
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets')
            cache.addAll(assets)
        }))
})

//activate event 2
self.addEventListener('activate', evt => {
    //console.log('service worker has been activate')
    evt.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys)
            return Promise.all(
                keys
                    .filter(key => key !== staticCacheName && key !== dynamicCache)
                    .map(key => caches.delete(key))
            )
        })
    )
})

//fetch event
self.addEventListener('fetch', evt => {
    if (evt.request.url.indexOf('firestore.googleapis.com') === -1) {

        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCache).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone())
                        //cacheLimitSize(dynamicCache, 3)
                        return fetchRes
                    })
                }).catch(() => {
                    if (evt.request.url.indexOf('html') > -1) {
                        return caches.match('/pages/fallback.html')
                    }
                })
            })
        )
    }
})