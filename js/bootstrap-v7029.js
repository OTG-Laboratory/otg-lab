// OTG! v7.0.29 — safe bootstrap, preserving known-good startup flow
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7029.js',{updateViaCache:'none'}).catch(()=>{}));}
