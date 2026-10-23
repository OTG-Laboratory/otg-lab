// OTG! v5.7.77 — Production conformance bootstrap

state=rhLoad();rhSync();if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v5778.js',{updateViaCache:'none'}).catch(()=>{}));}
