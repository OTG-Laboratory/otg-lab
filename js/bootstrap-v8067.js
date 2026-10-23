// OTG! v8.0.67 — Safety-gated, version-pinned worker bootstrap.
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{
  try{
    const gated=await window.rhStartupUpdateGate8062?.();
    if(gated)return;
    await navigator.serviceWorker.register('./otg-service-worker-v8067.js',{scope:'./',updateViaCache:'none'});
    try{localStorage.setItem('otgUpdateAcceptedVersion','8.0.67')}catch(_){ }
    setTimeout(()=>window.rhAutoCheckForUpdateV8021?.(),250);
  }catch(_){ window.rhAutoCheckForUpdateV8021?.(); }
});}
