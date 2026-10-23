/* OTG! v6.0.89 — Reset Racing Data action repair.
   Locked v6.0.78 reset artwork/layout remains untouched. */
(()=>{
'use strict';

function resetRacingDataNow(){
  const s=typeof rhSpace==='function'?rhSpace():null;
  if(!s)return;

  s.runs=[];
  s.customEvents=[];
  s.favouriteManufacturer='';
  if(Object.prototype.hasOwnProperty.call(s,'championshipDiscoveries'))s.championshipDiscoveries={};

  try{window.rhPendingChampDiscovery=null}catch(_){}
  try{window.rhSetup=null}catch(_){}

  rhSave();
  try{rhSync()}catch(_){}
  toast('Racing data reset');
  try{rhRenderSettings()}catch(_){ if(typeof show==='function')show('more'); }
}
window.rhResetRacingFinal=resetRacingDataNow;

window.rhResetConfirm=function(){
  if(typeof rhConfirm!=='function')return;
  rhConfirm({
    title:'RESET RACING DATA?',
    copy:'Clear Championships, active/completed runs, results, Records, Hall of Fame and Stats for the current Space.',
    safeguard:'Your Garage, Space name, global Driver Profile and other Spaces will be retained.',
    confirmLabel:'RESET RACING DATA',
    danger:true,
    onConfirm:'rhResetRacingFinal()'
  });
};

/* The locked v6.0.78 screen passes a callback name as text.
   Dispatch that callback directly rather than executing text. */
window.rhRunReset6078=function(code){
  try{
    document.getElementById('rhConfirmOverlay')?.remove();
    document.body.classList.remove('rhReset6078Open');
  }catch(_){}

  const action=String(code||'').trim().replace(/;+\s*$/,'');
  if(action==='rhResetRacingFinal()')return window.rhResetRacingFinal();

  if(action==='rhFullResetFinal()' && typeof window.rhFullResetFinal==='function'){
    return window.rhFullResetFinal();
  }

  const match=action.match(/^([A-Za-z_$][\w$]*)\(\)$/);
  if(match && typeof window[match[1]]==='function'){
    return window[match[1]]();
  }
  console.error('OTG! reset action unavailable:', action);
};
})();