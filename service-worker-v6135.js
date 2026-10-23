const CACHE_NAME='racehub-v6.0.135-gt7-specials';
const ASSETS=['./style-v6111.css?v=6111','./style-v6112.css?v=6112','./style-v6113.css?v=6114','./assets/brand/otg-approved-painted-mark-v6052.png?v=6052','./style-reset-v6078.css?v=6078','./js/reset-screens-v6078.js?v=6078','./js/catalogue-library-v6079.js?v=6082','./js/catalogue-diagnostics-v6081.js?v=6082','./style-v6081.css?v=6082','./js/catalogue-deterministic-v6110.js?v=6110','./js/catalogue-manufacturer-counts-v6082.js?v=6083','./js/gt7-specials-v6135.js?v=6135','./js/fh5-catalogue-v6069-main.js?v=6069','./js/gt7-catalogue-v6066-main.js?v=6066',
  './assets/final/raceoff-general-background-v6113.png?v=6113','./assets/final/hubs.png?v=6060',
  './assets/final/hubs-reset-approved-v6040.png?v=6060',
  './assets/final/hubs-pit-chief-v5829.png?v=6060',
  './assets/final/hall-of-fame-background-otg-v6059.png',
  './assets/final/festival-approved-scene-v6058-neutral.png',
  './assets/final/dashboard-otg-neutral-v6056.png',
  './assets/brand/otg-approved-painted-mark-v6052.png',
  './style-v6059.css?v=6059',
  './','./index.html','./style-v6093.css','./js/grand-tour-polish-v6093.js','./js/grand-tour-final-fixes-v6094.js','./style-v6095.css?v=6095','./js/grand-tour-complete-v6095.js?v=6095','./js/raceoff-catalogue-v6113.js?v=6113','./js/raceoff-stage3-v6115.js?v=6115','./js/raceoff-stage4-v6116.js?v=6116','./js/raceoff-stage5-v6118.js?v=6118','./js/raceoff-stage6-v6121.js?v=6121','./js/raceoff-stage7-v6122.js?v=6122','./js/raceoff-stage8-v6123.js?v=6123','./js/raceoff-trophy-v6124.js?v=6124','./assets/final/raceoff-draw-room-v6118.png?v=6118','./assets/final/raceoff-champion-v6123.png?v=6123','./style-v6123.css?v=6128','./style-v6124.css?v=6124','./js/update-wire-v6124.js?v=6124','./style-v6100.css?v=6100','./js/gt-cleanup-v6101.js?v=6101','./style-v595.css?v=6020','./manifest.webmanifest?v=6000','./favicon.png',
  './js/seed-data.js?v=5799','./js/core.js?v=6020','./js/race-director.js?v=5799','./js/views.js?v=5799',
  './js/celebrations.js?v=5799','./js/garage.js?v=5799','./js/control-centre.js?v=5799',
  './js/studio-final-v6112.js?v=6112','./js/studio-locked-ui-v5780.js?v=5799','./js/studio-grand-tour-v6043.js?v=6044','./js/studio-polish-v5782.js?v=5799',
  './js/studio-v6-garage-foundation-v600.js?v=6020','./js/studio-release-v595.js?v=6020','./js/studio-enter-result-v5803.js?v=5803','./js/studio-result-summary-v5837.js?v=5837',
  './js/studio-race-flow-v5809.js?v=5829','./js/bootstrap-v6135.js?v=6135','./js/studio-race-end-v5837.js?v=5837',
  './js/studio-final-standings-v5828.js?v=6035','./js/studio-records-v5830.js?v=6035','./js/studio-car-complete-v5832.js?v=5832',
  './js/studio-champ-overview-v5835.js?v=5835','./js/studio-beta-feedback-v595.js?v=5918','./js/studio-v6-advanced-timing-v6015.js?v=6020','./js/studio-v6-race-notes-v6017.js?v=6020','./assets/final/championship-in-progress-aerial-v5834.png?v=5834',
  './assets/final/final-standings-face-on-ui-ready-v5828.png?v=5828','./assets/brand/otg-mark-painted-wall.svg',
  './assets/final/hubs-pit-chief-v5829.png?v=5829','./assets/final/hubs-reset-approved-v6040.png','./assets/final/enter-result-side-finish-v5803.png','./assets/final/result-summary-podium-v5804.png','./assets/final/record-celebration-hero-v6127.png?v=6127',
  './assets/final/trophy-festival.png','./assets/final/trophy-manufacturer.png','./assets/final/trophy-era.png','./assets/final/trophy-favourite.png',
  './style-v6020.css?v=6020','./style-v6031.css?v=6031','./style-v6021.css?v=6021','./style-v6022.css?v=6032','./style-v6023.css?v=6023','./style-v6024.css?v=6024','./style-v6026.css?v=6026','./style-v6033.css?v=6033','./style-v6035.css?v=6035','./style-v6040.css?v=6040','./js/studio-v6-league-foundation-v6018.js?v=6020','./js/studio-v6-league-stage9b-v6020.js?v=6020','./js/studio-v6-league-stage9c-v6022.js?v=6022','./js/studio-v6-league-stage9d-v6023.js?v=6023','./js/studio-v6-league-stage9d-polish-v6024.js?v=6024','./assets/final/league-organiser-control-room-v6018.png','./icons/icon-v5765-192.png','./icons/icon-v5765-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('racehub-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));return;}e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
