const CACHE_NAME = 'colouria-offline-v35-rocket1';
const FALLBACK_URL = '/colouria/index.html';

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  const response = await fetch('/offline-assets.json', { cache: 'no-store' });
  const urls = response.ok ? await response.json() : [FALLBACK_URL];
  await Promise.allSettled(
    urls.map(async (url) => {
      const asset = await fetch(url, { cache: 'reload' });
      if (asset.ok) await cache.put(url, asset);
    })
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function navigationCandidates(url) {
  const candidates = [url.pathname, url.pathname + url.search];
  if (url.pathname.endsWith('/')) candidates.push(`${url.pathname}index.html`);
  else if (!url.pathname.includes('.')) candidates.push(`${url.pathname}/index.html`);
  return [...new Set(candidates)];
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const network = await fetch(event.request);
        if (network.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, network.clone());
        }
        return network;
      } catch {
        const cache = await caches.open(CACHE_NAME);
        for (const candidate of navigationCandidates(url)) {
          const hit = await cache.match(candidate);
          if (hit) return hit;
        }
        return (await cache.match(FALLBACK_URL)) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const network = await fetch(event.request);
      if (network.ok) cache.put(event.request, network.clone());
      return network;
    } catch {
      return (await cache.match(event.request, { ignoreSearch: false })) || Response.error();
    }
  })());
});
