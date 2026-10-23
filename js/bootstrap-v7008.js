// OTG! v7.0.8 — locked v7 dashboard + Race Setups integration
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7008.js',{updateViaCache:'none'}).catch(()=>{}));}
