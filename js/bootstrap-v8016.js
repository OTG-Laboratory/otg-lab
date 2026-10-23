// OTG! v8.0.16 — gated service-worker lifecycle
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',async()=>{
  try{
    const reg=await navigator.serviceWorker.register('./otg-service-worker.js',{updateViaCache:'none'});
    window.rhBindWaitingUpdateV8016?.(reg);
    await reg.update().catch(()=>{});
    window.rhBindWaitingUpdateV8016?.(reg);
  }catch(_){ }
});}
