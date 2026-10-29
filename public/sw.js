const C='lift-v2'
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{
const r=await fetch('./index.html',{cache:'reload'});const h=await r.clone().text();await c.put('./index.html',r.clone());await c.put('./',r)
const a=[...h.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map(m=>m[1])
await c.addAll(['./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png',...a])}));self.skipWaiting()})
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())))
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return
e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put(r,cp));return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))))})
