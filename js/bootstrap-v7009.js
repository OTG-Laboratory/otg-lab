// OTG! v7.0.9 — v7 dashboard startup render fix
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7009.js',{updateViaCache:'none'}).catch(()=>{}));}
