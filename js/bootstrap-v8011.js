// OTG! v8.0.11 — safe bootstrap, preserving known-good startup flow
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v8011.js',{updateViaCache:'none'}).catch(()=>{}));}
