// OTG! v5.8.09 — startup + authoritative service worker
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v5835.js',{updateViaCache:'none'}).catch(()=>{}));}
