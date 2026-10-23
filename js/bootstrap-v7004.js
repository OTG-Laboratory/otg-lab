// OTG! v7.0.4 — bootstrap cache bump
// OTG! v6.0.155 — SPECIALS persistence + global scroll boundary lock
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7004.js',{updateViaCache:'none'}).catch(()=>{}));}
