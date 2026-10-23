// OTG! v8.0.20 — version-pinned worker; manifest discovers future updates
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{
  try{
    await navigator.serviceWorker.register('./otg-service-worker-v8020.js',{scope:'./',updateViaCache:'none'});
    setTimeout(()=>window.rhAutoCheckForUpdateV8020?.(),250);
  }catch(_){ window.rhAutoCheckForUpdateV8020?.(); }
});}
