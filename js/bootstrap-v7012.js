// OTG! v7.0.12 — Race Setup load + dashboard/back polish
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7012.js',{updateViaCache:'none'}).catch(()=>{}));}
