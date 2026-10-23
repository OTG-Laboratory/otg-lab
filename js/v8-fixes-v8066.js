/* OTG! v8.0.66 — live QA repair bundle.
   Scope:
   1) Car History always has a visible/reachable Back control.
   2) Reset Racing Data clears Race Off data as well as Festival/Event data.
   3) Festival Championship cards/opening are guarded so one malformed persisted run cannot become a dead tile.
*/
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));

/* ---------- Car History: guaranteed escape ---------- */
function closeCarHistory8066(){ Q('rhCarHistoryV7001')?.remove(); }
window.rhCloseCarHistoryV8066=closeCarHistory8066;
function ensureCarHistoryBack8066(){
  const root=Q('rhCarHistoryV7001'); if(!root)return;
  let b=root.querySelector('.rhCarHistoryBackV8066');
  if(!b){
    b=document.createElement('button');
    b.type='button'; b.className='rhCarHistoryBackV8066'; b.setAttribute('aria-label','Back to Garage');
    b.innerHTML='<span aria-hidden="true">‹</span><b>BACK</b>';
    b.addEventListener('click',closeCarHistory8066);
    root.appendChild(b);
  }
  const legacy=root.querySelector('.v7CarHistoryPage > header > button');
  if(legacy){ legacy.classList.add('rhCarHistoryLegacyBackV8066'); legacy.onclick=closeCarHistory8066; }
}
const baseCarHistory8066=window.rhOpenCarHistoryV7001;
if(typeof baseCarHistory8066==='function')window.rhOpenCarHistoryV7001=function(){
  const out=baseCarHistory8066.apply(this,arguments);
  ensureCarHistoryBack8066();
  setTimeout(ensureCarHistoryBack8066,0);
  return out;
};

/* ---------- Reset Racing Data: clear every racing family ---------- */
function resetRacing8066(){
  const s=typeof rhSpace==='function'?rhSpace():null; if(!s)return;
  s.runs=[];
  s.customEvents=[];
  s.raceOffs=[];
  s.favouriteManufacturer='';
  s.championshipDiscoveries={};
  if(Array.isArray(s.recordBookExclusions))s.recordBookExclusions=[];
  try{window.rhPendingChampDiscovery=null}catch(_){ }
  try{window.rhSetup=null}catch(_){ }
  try{window.rhRaceOffDraft=null}catch(_){ }
  try{window.rhRaceOffSetup=null}catch(_){ }
  if(typeof rhSave==='function')rhSave();
  try{typeof rhSync==='function'&&rhSync()}catch(_){ }
  Q('rhConfirmOverlay')?.remove();
  document.body.classList.remove('rhReset6078Open','rhReset6075Open');
  if(typeof toast==='function')toast('Racing data reset');
  try{typeof rhRenderSettings==='function'&&rhRenderSettings()}catch(_){ }
}
window.rhResetRacingFinal=resetRacing8066;

/* reset-functional-v6090 owns the approved confirmation art. It calls the
   function captured inside its own closure, so rebind the confirm button to
   the v8.0.66 reset after that screen is created. */
const baseResetConfirm8066=window.rhResetConfirm;
if(typeof baseResetConfirm8066==='function')window.rhResetConfirm=function(){
  const out=baseResetConfirm8066.apply(this,arguments);
  setTimeout(()=>{
    const b=Q('rhResetConfirm6090'); if(!b||b.dataset.v8066==='1')return;
    const clone=b.cloneNode(true); clone.dataset.v8066='1';
    clone.addEventListener('click',resetRacing8066,{once:true});
    b.replaceWith(clone);
  },0);
  return out;
};

/* ---------- Championship dead-card guard ---------- */
function run8066(id){
  try{return (typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(r=>String(r?.id)===String(id))||null}catch(_){return null}
}
function normaliseRun8066(r){
  if(!r)return false; let changed=false;
  for(const k of ['entries','rounds','results'])if(!Array.isArray(r[k])){r[k]=[];changed=true}
  if(!r.status){r.status='active';changed=true}
  if(!r.type&&!r.championshipType){r.type='festival';changed=true}
  if(!r.name){r.name='Championship';changed=true}
  return changed;
}
function recoveryScreen8066(r,err){
  console.error('OTG! v8.0.66 Championship open failed',err,r);
  try{show('festival')}catch(_){ }
  const root=Q('festival'); if(!root)return;
  root.innerHTML=`<div class="rhFestivalV1 rhChampRecoveryV8066"><section class="rhFestivalHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRenderFestival()" aria-label="Back">‹</button><div><h1>CHAMPIONSHIP</h1><p>Safe recovery</p></div></div></section><main class="rhFestivalBodyV1"><section class="rhChampRecoveryCardV8066"><small>RUN PRESERVED</small><h2>${E(r?.name||'Championship')}</h2><p>OTG! could not open this saved Championship cleanly. No Championship data has been deleted.</p><button class="btn" onclick="rhRenderFestival()">BACK TO FESTIVAL</button></section></main></div>`;
}
window.rhOpenChampionshipSafeV8066=function(id){
  const r=run8066(id); if(!r){ if(typeof toast==='function')toast('Championship not found'); try{rhRenderFestival()}catch(_){ } return; }
  try{return window.rhOpenRun(id)}catch(first){
    const changed=normaliseRun8066(r);
    if(changed){try{rhSave()}catch(_){ }}
    try{return window.rhOpenRun(id)}catch(second){recoveryScreen8066(r,second||first)}
  }
};

const baseChampCard8066=window.rhChampCard;
if(typeof baseChampCard8066==='function')window.rhChampCard=function(type,value,name,count){
  let html;
  try{html=baseChampCard8066.apply(this,arguments)}catch(err){
    console.error('OTG! v8.0.66 Championship card render repaired',err,{type,value,name,count});
    const r=(typeof rhMatchingRun==='function')?(rhMatchingRun(type,value,'active')||rhMatchingRun(type,value,'prepared')):null;
    if(r){
      const meta=r.status==='prepared'?`SAVED • ${Array.isArray(r.entries)?r.entries.length:0} cars`:'IN PROGRESS';
      return `<button class="rhChampCard ${r.status==='prepared'?'rhChampPreparedV1':'rhChampActiveV1'}" onclick="rhOpenChampionshipSafeV8066('${E(r.id)}')"><span><b>${E(name)}</b><small>${meta}</small></span><em>›</em></button>`;
    }
    throw err;
  }
  return String(html).replace(/onclick="rhOpenRun\('([^']+)'\)"/g,'onclick="rhOpenChampionshipSafeV8066(\'$1\')"');
};

/* Existing rendered cards (e.g. Festival already open during hot update) are
   upgraded in-place as well. */
function repairRenderedCards8066(){
  document.querySelectorAll('#festival .rhChampCard[onclick^="rhOpenRun("]').forEach(b=>{
    const m=String(b.getAttribute('onclick')||'').match(/^rhOpenRun\('([^']+)'\)/); if(m)b.setAttribute('onclick',`rhOpenChampionshipSafeV8066('${m[1]}')`);
  });
}
const baseFestival8066=window.rhRenderFestival;
if(typeof baseFestival8066==='function')window.rhRenderFestival=function(){const out=baseFestival8066.apply(this,arguments);repairRenderedCards8066();return out};
repairRenderedCards8066();

window.rhV8066Report=()=>({
  carHistoryBack:!!Q('rhCarHistoryV7001')?.querySelector('.rhCarHistoryBackV8066'),
  runs:(typeof rhSpace==='function'&&rhSpace()?.runs||[]).length,
  raceOffs:(typeof rhSpace==='function'&&rhSpace()?.raceOffs||[]).length,
  customEvents:(typeof rhSpace==='function'&&rhSpace()?.customEvents||[]).length
});
})();
