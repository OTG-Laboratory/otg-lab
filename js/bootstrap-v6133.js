// OTG! v6.0.133 — GT7 manual/special Garage integration
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6133.js',{updateViaCache:'none'}).catch(()=>{}));}
