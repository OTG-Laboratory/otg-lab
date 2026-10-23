// OTG! v5.7.76 — Bootstrap / cache recovery

state=rhLoad();rhSync();if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v5776.js',{updateViaCache:'none'}).catch(()=>{}));}
