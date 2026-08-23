const CACHE_NAME = 'f1-tracker-v2';
const ASSETS = ['./index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'NOTIFY') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body, vibrate: [200, 100, 200], tag: e.data.title, renotify: true
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => list.length ? list[0].focus() : clients.openWindow('./index.html')));
});
