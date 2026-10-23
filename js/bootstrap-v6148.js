// OTG! v6.0.148 — SPECIALS persistence + global scroll boundary lock
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6148.js',{updateViaCache:'none'}).catch(()=>{}));}
