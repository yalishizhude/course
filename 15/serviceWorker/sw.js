const CACHE_NAME = 'ws'
let preloadUrls = ['/index.css']

self.addEventListener('install', function (event) {
  console.log('install')
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function (cache) {
      return cache.addAll(preloadUrls);
    })
    .then(() => {
      throw new Error(1)
    })
  );
});

self.addEventListener('activate', function (event) {
  console.log('activate')
});

self.addEventListener('fetch', function (event) {
  console.log('fetch')
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