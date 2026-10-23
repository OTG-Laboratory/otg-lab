// OTG! v7.0.7 — locked v7 dashboard + Race Setups integration
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7007.js',{updateViaCache:'none'}).catch(()=>{}));}
