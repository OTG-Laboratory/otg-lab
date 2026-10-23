const CACHE_NAME='racehub-v5.8.36-final-qa';
const ASSETS=[
  './','./index.html','./style-v5836.css?v=5836','./manifest.webmanifest?v=5829','./favicon.png',
  './js/seed-data.js?v=5799','./js/core.js?v=5799','./js/race-director.js?v=5799','./js/views.js?v=5799',
  './js/celebrations.js?v=5799','./js/garage.js?v=5799','./js/control-centre.js?v=5799',
  './js/studio-final-v5808.js?v=5808','./js/studio-locked-ui-v5780.js?v=5799','./js/studio-polish-v5782.js?v=5799',
  './js/studio-release-v5836.js?v=5836','./js/studio-enter-result-v5803.js?v=5803','./js/studio-result-summary-v5836.js?v=5836',
  './js/studio-race-flow-v5809.js?v=5829','./js/bootstrap-v5836.js?v=5836','./js/studio-race-end-v5829.js?v=5829',
  './js/studio-final-standings-v5828.js?v=5829','./js/studio-records-v5830.js?v=5831','./js/studio-car-complete-v5832.js?v=5832',
  './js/studio-champ-overview-v5835.js?v=5835','./assets/final/championship-in-progress-aerial-v5834.png?v=5834',
  './assets/final/final-standings-face-on-ui-ready-v5828.png?v=5828','./assets/brand/otg-mark-painted-wall.svg',
  './assets/final/hubs-pit-chief-v5829.png?v=5829','./assets/final/enter-result-side-finish-v5803.png','./assets/final/result-summary-podium-v5804.png',
  './assets/final/trophy-festival.png','./assets/final/trophy-manufacturer.png','./assets/final/trophy-era.png','./assets/final/trophy-favourite.png',
  './icons/icon-v5765-192.png','./icons/icon-v5765-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('racehub-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));return;}e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
