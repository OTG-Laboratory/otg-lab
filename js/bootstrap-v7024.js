// OTG! v7.0.25 — safe bootstrap, preserving known-good startup flow
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v7024.js',{updateViaCache:'none'}).catch(()=>{}));}
