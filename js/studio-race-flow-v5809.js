/* OTG! v5.8.09 — rebuilt result/completion flow authority. */
(()=>{
  const q=id=>document.getElementById(id);
  const esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function accepted(owner,res,kind='festival'){
    const isEvent=kind==='events';
    const host=q(isEvent?'event':'festival');
    if(!host)return;
    const next=isEvent?rhEventNextPair(owner):rhNextSlot(owner);
    const carDone=isEvent?rhEventCarIsComplete(owner,res.carId):rhRunCarIsComplete(owner,res.carId);
    const nextId=next?.car?.id||next?.carId;
    const transition=owner.status==='complete'?(isEvent?'EVENT COMPLETE':'CHAMPIONSHIP COMPLETE'):(carDone&&next&&String(nextId)!==String(res.carId)?'CAR COMPLETE':`NEXT — ${esc(next?.round?.name||'CONTINUE')}`);
    host.innerHTML=`<div class="rhAccepted ${isEvent?'rhAcceptedEvents':'rhAcceptedChamp'} rhAcceptedFinal"><div class="rhAcceptedShadeFinal"></div><div class="rhAcceptedGlass rhAcceptedGlassFinal"><div class="rhAcceptedTick">✓</div><h1>RESULT SAVED</h1><p>${transition}</p><small>${esc(res.roundName)} complete</small></div></div>`;
    window.setTimeout(()=>{
      if(isEvent) window.rhEventResultSummary(owner,res);
      else window.rhResultSummary(owner,res);
    },900);
  }
  window.rhResultAccepted=accepted;

  // Completion actions always resolve to the proven official-classification route.
  window.rhChampionshipCompleteTransition=function(id){
    if(typeof window.rhShowFinalStandingsV5799==='function') return window.rhShowFinalStandingsV5799(id);
    return window.rhOpenRun(id);
  };
  window.rhEventCompleteTransition=function(id){
    if(typeof window.rhShowEventFinalStandingsV5799==='function') return window.rhShowEventFinalStandingsV5799(id);
    return window.rhOpenEvent(id);
  };
})();
