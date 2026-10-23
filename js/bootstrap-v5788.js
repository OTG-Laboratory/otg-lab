// OTG! v5.7.88 — startup recovery + v5.7.84 post-race experience
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v5788.js',{updateViaCache:'none'}).catch(()=>{}));}
