// OTG! v6.0.131 — GT7 catalogue v2 / 574 official collection
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6131.js',{updateViaCache:'none'}).catch(()=>{}));}
