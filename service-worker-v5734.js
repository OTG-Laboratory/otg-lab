const CACHE_NAME='racehub-v5.7.32-championship-setup-conformance';
const ASSETS=['./','./index.html','./style-v5734.css','./manifest.webmanifest','./favicon.png','./js/seed-data.js','./js/core.js','./js/race-director.js','./js/views.js','./js/celebrations.js','./js/garage.js','./js/control-centre.js','./js/studio-final-v5734.js','./js/bootstrap.js','./assets/brand/otg-mark-painted-wall.svg','./assets/final/dashboard-background.png','./assets/final/festival-background.png','./assets/final/events-background.png','./assets/final/settings-background.png','./assets/final/stats-background.png','./assets/final/championship-background.png','./assets/final/hubs.png','./assets/final/trophy-festival.png','./assets/final/trophy-manufacturer.png','./assets/final/trophy-era.png','./assets/final/trophy-favourite.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-192.png','./icons/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting()});self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim()});self.addEventListener('fetch',e=>{
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(
    fetch(e.request,{cache:'no-store'}).then(r=>{
      const copy=r.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request))
  );
});