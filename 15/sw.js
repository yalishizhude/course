const CACHE_NAME = 'ws'
let preloadUrls = []

self.addEventListener('install', function (event) {
  // 预加载
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function (cache) {
      return cache.addAll(preloadUrls);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
    .then(function (response) {
      if (response) {
        return response;
      }
      return caches.open(CACHE_NAME).then(function (cache) {
          const path = event.request.url.replace(self.location.origin, '')
          preloadUrls.push(path)
          return cache.add(path)
        })
        .catch(e => console.error(e))
    })
  );
});