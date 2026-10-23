const CACHE_NAME='racehub-v5.7.99-final-standings-hard-isolation';
const ASSETS=[
  './',
  './index.html',
  './style-v5799.css?v=5799',
  './manifest.webmanifest?v=5799',
  './favicon.png',
  './js/seed-data.js?v=5799',
  './js/core.js?v=5799',
  './js/race-director.js?v=5799',
  './js/views.js?v=5799',
  './js/celebrations.js?v=5799',
  './js/garage.js?v=5799',
  './js/control-centre.js?v=5799',
  './js/studio-final-v5780.js?v=5799',
  './js/studio-locked-ui-v5780.js?v=5799',
  './js/studio-polish-v5782.js?v=5799',
  './js/studio-release-v5789.js?v=5799',
  './js/studio-release-v5787.js?v=5799',
  './js/studio-release-v5788.js?v=5799',
  './js/studio-release-v5790.js?v=5799',
  './js/studio-release-v5791.js?v=5799',
  './js/studio-release-v5799.js?v=5799',
  './js/bootstrap-v5799.js?v=5799',
  './assets/brand/otg-mark-painted-wall.svg',
  './assets/final/post-race-finish-background-v5780.png',
  './assets/final/enter-result-finish-line-hero-v5781.png',
  './assets/final/trophy-festival.png',
  './assets/final/trophy-manufacturer.png',
  './assets/final/trophy-era.png',
  './assets/final/trophy-favourite.png',
  './icons/icon-v5765-192.png',
  './icons/icon-v5765-512.png'
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('racehub-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.mode==='navigate'){e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));return;}e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request)));});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting();});
