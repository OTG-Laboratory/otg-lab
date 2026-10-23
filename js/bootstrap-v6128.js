// OTG! v6.0.128 — cache/version bootstrap; record lower-panel fit only
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6128.js',{updateViaCache:'none'}).catch(()=>{}));}
