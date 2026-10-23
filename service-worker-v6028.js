const CACHE_NAME='racehub-v6.0.28-gt7-garage-import-test';
const ASSETS=[
  './','./index.html','./style-v595.css?v=6020','./manifest.webmanifest?v=6000','./favicon.png',
  './js/seed-data.js?v=5799','./js/core.js?v=6020','./js/race-director.js?v=5799','./js/views.js?v=5799',
  './js/celebrations.js?v=5799','./js/garage.js?v=5799','./js/control-centre.js?v=5799',
  './js/studio-final-v5808.js?v=6020','./js/studio-locked-ui-v5780.js?v=5799','./js/studio-polish-v5782.js?v=5799',
  './js/studio-v6-garage-foundation-v600.js?v=6020','./js/studio-release-v595.js?v=6020','./js/studio-enter-result-v5803.js?v=5803','./js/studio-result-summary-v5837.js?v=5837',
  './js/studio-race-flow-v5809.js?v=5829','./js/bootstrap-v600.js?v=6026','./js/studio-race-end-v5837.js?v=5837',
  './js/studio-final-standings-v5828.js?v=5829','./js/studio-records-v5830.js?v=5831','./js/studio-car-complete-v5832.js?v=5832',
  './js/studio-champ-overview-v5835.js?v=5835','./js/studio-beta-feedback-v595.js?v=5918','./js/studio-v6-advanced-timing-v6015.js?v=6020','./js/studio-v6-race-notes-v6017.js?v=6020','./assets/final/championship-in-progress-aerial-v5834.png?v=5834',
  './assets/final/final-standings-face-on-ui-ready-v5828.png?v=5828','./assets/brand/otg-mark-painted-wall.svg',
  './assets/final/hubs-pit-chief-v5829.png?v=5829','./assets/final/enter-result-side-finish-v5803.png','./assets/final/result-summary-podium-v5804.png',
  './assets/final/trophy-festival.png','./assets/final/trophy-manufacturer.png','./assets/final/trophy-era.png','./assets/final/trophy-favourite.png',
  './style-v6020.css?v=6020','./style-v6021.css?v=6021','./style-v6022.css?v=6022','./style-v6023.css?v=6023','./style-v6024.css?v=6024','./style-v6026.css?v=6026','./style-v6028.css?v=6028','./js/studio-v6-league-foundation-v6018.js?v=6020','./js/studio-v6-league-stage9b-v6020.js?v=6020','./js/studio-v6-league-stage9c-v6022.js?v=6022','./js/studio-v6-league-stage9d-v6023.js?v=6023','./js/studio-v6-league-stage9d-polish-v6024.js?v=6024','./js/studio-v6-gt7-import-v6028.js?v=6028','./assets/final/league-organiser-control-room-v6018.png','./icons/icon-v5765-192.png','./icons/icon-v5765-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('racehub-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));return;}e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
