// OTG! v7.0.11 — balanced dashboard + current service worker
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7011.js',{updateViaCache:'none'}).catch(()=>{}));}
