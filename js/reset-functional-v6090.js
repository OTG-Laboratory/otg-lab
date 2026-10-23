/* OTG! v6.0.90 — functional reset-screen repair.
   Uses real event listeners rather than fragile inline/eval callback wiring. */
(()=>{
'use strict';

function closeReset(){
  document.getElementById('rhConfirmOverlay')?.remove();
  document.body.classList.remove('rhReset6078Open');
}
function resetRacing(){
  const s=rhSpace(); if(!s)return;
  s.runs=[];
  s.customEvents=[];
  s.favouriteManufacturer='';
  s.championshipDiscoveries={};
  try{window.rhPendingChampDiscovery=null}catch(_){}
  try{window.rhSetup=null}catch(_){}
  rhSave();
  try{rhSync()}catch(_){}
  closeReset();
  toast('Racing data reset');
  try{rhRenderSettings()}catch(_){}
}
function fullReset(){
  const s=rhSpace(); if(!s)return;
  const isCatalogue=s.catalogueKey==='fh5-catalogue-v1'||s.catalogueKey==='gt7-catalogue-v1';
  s.cars=[];
  s.runs=[];
  s.customEvents=[];
  s.favouriteManufacturer='';
  s.championshipDiscoveries={};
  if(isCatalogue){
    s.catalogueOwned={};
    delete s.catalogueReconcileSignature;
    try{fh5OwnedSet=null}catch(_){}
  }
  try{window.rhPendingChampDiscovery=null}catch(_){}
  try{window.rhSetup=null}catch(_){}
  rhSave();
  try{rhSync()}catch(_){}
  closeReset();
  toast(isCatalogue?'OTG! Space reset — catalogue retained, 0 cars owned; backups retained':'OTG! Space reset — backups retained');
  try{rhRenderSettings()}catch(_){}
}
window.rhResetRacingFinal=resetRacing;
window.rhFullResetFinal=fullReset;

function showReset(full){
  closeReset();
  document.body.classList.add('rhReset6078Open');
  const image=full?'assets/final/full-reset-otg-v6090.png?v=6090':'assets/final/reset-racing-data-v6078.png?v=6078';
  document.body.insertAdjacentHTML('beforeend',`
    <div id="rhConfirmOverlay" class="rhReset6078 ${full?'full6078':'racing6078'}" role="dialog" aria-modal="true">
      <div class="rhReset6078Stage">
        <img class="rhReset6078Art" src="${image}" alt="">
        <button id="rhResetBack6090" class="rhReset6078Hit rhResetBack6078" type="button" aria-label="Back"></button>
        <button id="rhResetCancel6090" class="rhReset6078Hit rhResetCancel6078" type="button" aria-label="Cancel"></button>
        <button id="rhResetConfirm6090" class="rhReset6078Hit rhResetConfirm6078" type="button" aria-label="${full?'Full Reset':'Reset Racing Data'}"></button>
      </div>
    </div>`);
  const back=document.getElementById('rhResetBack6090');
  const cancel=document.getElementById('rhResetCancel6090');
  const confirm=document.getElementById('rhResetConfirm6090');
  back?.addEventListener('click',closeReset,{once:true});
  cancel?.addEventListener('click',closeReset,{once:true});
  confirm?.addEventListener('click',full?fullReset:resetRacing,{once:true});
}
window.rhResetConfirm=()=>showReset(false);
window.rhFullResetConfirm=()=>showReset(true);

// Final interception: any legacy reset confirmation call is routed to the functional screens.
const priorConfirm=window.rhConfirm;
window.rhConfirm=function(options={}){
  const title=String(options.title||'').trim();
  if(/^RESET RACING DATA\?$/i.test(title))return showReset(false);
  if(/^FULL RESET OTG!\?$/i.test(title))return showReset(true);
  return priorConfirm(options);
};
})();