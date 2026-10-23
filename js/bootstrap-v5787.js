// OTG! v5.7.87 — startup recovery + v5.7.84 post-race experience
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v5787.js',{updateViaCache:'none'}).catch(()=>{}));}
