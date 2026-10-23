// OTG! v6.0.136 — locked GT7 SPECIALS architecture
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6136.js',{updateViaCache:'none'}).catch(()=>{}));}
