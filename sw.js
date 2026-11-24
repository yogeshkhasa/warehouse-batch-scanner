const CACHE='batch-scanner-v3';
const FILES=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil((async()=>{
    const c=await caches.open(CACHE);
    await Promise.all(FILES.map(f=>
      fetch(new Request(f,{cache:'reload'}))
        .then(r=>{if(r.ok)return c.put(f,r)})
        .catch(()=>{})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

// Network first, fall back to cache when offline.
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(
    fetch(req,{cache:'no-cache'})
      .then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(req,copy));
        return res;
      })
      .catch(()=>caches.match(req))
  );
});