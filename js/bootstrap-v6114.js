// OTG! v6.0.35 — Grand Tour Fix #5: Celebration Settings label/description spacing
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6114.js',{updateViaCache:'none'}).catch(()=>{}));}
