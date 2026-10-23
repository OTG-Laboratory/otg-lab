/* OTG! v8.0.65 — taxonomy, History and Drag specialist redesign.
   - Canonicalises Pickups & 4x4 across FH5 live state.
   - Festival and Race Off History move to dedicated top-level screens.
   - Race Off catalogue order mirrors Festival and Drag is removed from Race Off.
   - FH5 Drag Championships become one-round / one-run shootouts; fastest time wins. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):String(v||'—');
const CANON_PICKUPS='Pickups & 4x4';
const pickupKey=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'').replace(/s$/,'');
const isPickups=v=>pickupKey(v)==='pickups4x4';
const carId=c=>String(c?.sourceCarId||c?.id||'');
const currentSpace=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
const versionCmp8065=(a,b)=>{const A=String(a||'').split('.').map(Number),B=String(b||'').split('.').map(Number);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d}return 0};
const migrationsAllowed8065=()=>{try{const accepted=localStorage.getItem('otgUpdateAcceptedVersion');return !accepted||versionCmp8065(accepted,'8.0.65')>=0}catch(_){return true}};
const carById=id=>(currentSpace()?.cars||[]).find(c=>String(c.id)===String(id));
const carText=id=>{const c=carById(id);if(!c)return 'Unknown car';try{return typeof carName==='function'?carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ')}catch(_){return [c.make,c.model,c.year].filter(Boolean).join(' ')}};

/* ---------- Pickups & 4x4 canonicalisation ---------- */
function repairPickups8065(){
 if(!migrationsAllowed8065())return false;
 let changed=false;
 try{
  if(typeof state==='undefined'||!Array.isArray(state?.spaces))return false;
  for(const s of state.spaces){
   for(const c of s.cars||[]){if(isPickups(c?.classType)&&c.classType!==CANON_PICKUPS){c.classType=CANON_PICKUPS;changed=true}}
   for(const r of s.runs||[]){if(['classType','fh5-hotwheels'].includes(String(r?.type||r?.championshipType||''))&&isPickups(r?.value)&&r.value!==CANON_PICKUPS){r.value=CANON_PICKUPS;changed=true}}
   for(const ro of s.raceOffs||[]){
    if(['classType','fh5-hotwheels'].includes(String(ro?.type||''))&&isPickups(ro?.value)&&ro.value!==CANON_PICKUPS){ro.value=CANON_PICKUPS;changed=true}
    for(const c of ro?.entrants||[]){if(isPickups(c?.classType)&&c.classType!==CANON_PICKUPS){c.classType=CANON_PICKUPS;changed=true}}
   }
   for(const e of s.customEvents||[]){for(const c of e?.cars||e?.entrants||[]){if(isPickups(c?.classType)&&c.classType!==CANON_PICKUPS){c.classType=CANON_PICKUPS;changed=true}}}
  }
  if(typeof FH5_CATALOGUE!=='undefined'&&Array.isArray(FH5_CATALOGUE))for(const c of FH5_CATALOGUE){if(isPickups(c?.classType)&&c.classType!==CANON_PICKUPS){c.classType=CANON_PICKUPS;changed=true}}
  if(changed&&typeof rhSave==='function')rhSave();
 }catch(err){console.warn('OTG! v8.0.65 Pickups & 4x4 repair skipped',err)}
 return changed;
}
repairPickups8065();

/* Ensure specialist aliases still match the new canonical Class / Type. */
const baseEligible8065=window.rhEligible;
if(typeof baseEligible8065==='function')window.rhEligible=function(type,value){
 const t=String(type||'');
 if(['classType','fh5-hotwheels'].includes(t)&&isPickups(value))return (currentSpace()?.cars||[]).filter(c=>isPickups(c?.classType));
 return baseEligible8065.apply(this,arguments);
};
const basePreset8065=window.rhFH5Preset8056;
if(typeof basePreset8065==='function')window.rhFH5Preset8056=function(type,value,context='festival'){
 if(isPickups(value))value=CANON_PICKUPS;
 return basePreset8065.call(this,type,value,context);
};

/* ---------- Drag: one strip, one run per car ---------- */
const DRAG_STRIPS={
 'Classic Muscle':'Teotihuacan Drag Strip',
 'Retro Muscle':'Teotihuacan Drag Strip',
 'Rods & Customs':'Teotihuacan Drag Strip',
 'Modern Muscle':'Festival Drag Strip',
 'Retro Super Cars':'Festival Drag Strip',
 'Super GT':'Festival Drag Strip',
 'Hypercars':'Aerodromo Drag Strip',
 'Modern Supercars':'Aerodromo Drag Strip',
 'Extreme Track Toys':'Aerodromo Drag Strip'
};
const dragKey=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
function dragStrip8065(value){const k=dragKey(value);for(const [name,track] of Object.entries(DRAG_STRIPS))if(dragKey(name)===k)return track;return 'Festival Drag Strip'}
function isDragSetup8065(){return typeof rhSetup!=='undefined'&&rhSetup?.type==='fh5-drag'}
function repairDragRuns8065(){
 if(!migrationsAllowed8065())return false;
 let changed=false;
 try{
  if(typeof state==='undefined'||!Array.isArray(state?.spaces))return false;
  for(const s of state.spaces)for(const r of s.runs||[]){
   if(String(r?.type||r?.championshipType||'')!=='fh5-drag'||!['active','prepared'].includes(String(r?.status||''))||(r?.results||[]).length)continue;
   const track=dragStrip8065(r.value);r.rounds=[{id:typeof rhId==='function'?rhId('round'):`drag-${Date.now()}`,name:track,layout:''}];
   delete r.format;delete r.v8Groups;delete r.v8Swiss;delete r.v8GroupPlan;delete r.v8SwissPlan;
   r.dragShootout8065=true;r.fh5Preset={format:'standard',source:`${r.value} Drag Shootout`,family:'drag',discipline:'Drag Racing',pool:[track],fixed:true,singleRun:true};changed=true;
  }
  if(changed&&typeof rhSave==='function')rhSave();
 }catch(err){console.warn('OTG! v8.0.65 Drag run migration skipped',err)}
 return changed;
}
repairDragRuns8065();
function enforceDrag8065(){
 if(!isDragSetup8065())return false;
 const track=dragStrip8065(rhSetup.value);
 rhSetup.v8GroupMode=false;rhSetup.v8SwissMode=false;rhSetup.v8SwissPlan=null;rhSetup.v8GroupPlan=null;
 if(!Array.isArray(rhSetup.rounds)||rhSetup.rounds.length!==1||rhSetup.rounds[0]?.name!==track)rhSetup.rounds=[{id:typeof rhId==='function'?rhId('round'):`drag-${Date.now()}`,name:track,layout:''}];
 rhSetup.fh5Preset={format:'standard',source:`${rhSetup.value} Drag Shootout`,family:'drag',discipline:'Drag Racing',pool:[track],fixed:true,singleRun:true};
 rhSetup.dragShootout8065=true;
 return true;
}
const baseBegin8065=window.rhBeginSetup;
if(typeof baseBegin8065==='function')window.rhBeginSetup=function(type,value,name){
 const out=baseBegin8065.apply(this,arguments);
 if(String(type)==='fh5-drag'&&isDragSetup8065()&&!rhSetup.savedRunId){enforceDrag8065();window.rhRenderSetup?.()}
 return out;
};
const baseRenderSetup8065=window.rhRenderSetup;
if(typeof baseRenderSetup8065==='function')window.rhRenderSetup=function(){if(isDragSetup8065())enforceDrag8065();const out=baseRenderSetup8065.apply(this,arguments);decorateDragSetup8065();return out};
const baseConfirmStart8065=window.rhConfirmStart;
if(typeof baseConfirmStart8065==='function')window.rhConfirmStart=function(){if(isDragSetup8065())enforceDrag8065();return baseConfirmStart8065.apply(this,arguments)};
const baseSavePrepared8065=window.rhSavePrepared;
if(typeof baseSavePrepared8065==='function')window.rhSavePrepared=function(){if(isDragSetup8065())enforceDrag8065();return baseSavePrepared8065.apply(this,arguments)};
function blockDragEdit8065(message){if(isDragSetup8065()){enforceDrag8065();window.rhRenderSetup?.();if(typeof toast==='function')toast(message);return true}return false}
for(const name of ['rhV8SetFormat','rhV8051SetFestivalFormat']){const base=window[name];if(typeof base==='function')window[name]=function(v){if(blockDragEdit8065('Drag Shootouts are fixed to one run per car'))return;return base.apply(this,arguments)}}
for(const [name,msg] of [['rhAddRound','Drag Shootouts use one strip'],['rhRemoveRound','Drag Shootouts use one strip'],['rhRenameRound','The Drag strip is assigned to suit this field'],['rhMoveRound','Drag Shootouts use one strip']]){const base=window[name];if(typeof base==='function')window[name]=function(){if(blockDragEdit8065(msg))return;return base.apply(this,arguments)}}
function decorateDragSetup8065(){
 if(!isDragSetup8065())return;const root=$('festival');if(!root)return;
 const info=root.querySelector('#rhFH5Preset8056');if(info){const head=info.querySelector('.rhSetupPanelHeadV1 strong');if(head)head.textContent='1 RUN';const p=info.querySelector('.small');if(p)p.innerHTML='<b>DRAG SHOOTOUT:</b> Every car gets one timed run on the assigned strip. Fastest overall time wins.'}
 root.querySelectorAll('.v8FormatChoices button').forEach(b=>b.disabled=true);
 root.querySelectorAll('.rhSetupRoundsV1 input').forEach(i=>i.readOnly=true);
 root.querySelectorAll('.rhSetupRoundsV1 button').forEach(b=>b.disabled=true);
 const add=root.querySelector('.rhSetupAddRoundV1');if(add)add.hidden=true;
 const quick=root.querySelector('.v7SetupQuick');if(quick)quick.hidden=true;
}
const baseChampCard8065=window.rhChampCard;
if(typeof baseChampCard8065==='function')window.rhChampCard=function(type,value,name,count){
 let html=baseChampCard8065.apply(this,arguments);if(String(type)!=='fh5-drag')return html;
 const active=typeof rhMatchingRun==='function'&&(rhMatchingRun(type,value,'active')||rhMatchingRun(type,value,'prepared'));if(active)return html;
 const track=dragStrip8065(value);return html.replace(/<small>[^<]*<\/small>/,`<small>${Number(count)||0} eligible car${Number(count)===1?'':'s'} • 1 RUN • ${E(track)}</small>`);
};

/* ---------- Shared History helpers ---------- */
function dateText8065(v){if(!v)return 'Date unavailable';const d=new Date(v);if(Number.isNaN(d.getTime()))return 'Date unavailable';return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}
function festivalWinner8065(r){
 if(r?.format==='swiss'&&r?.v8Swiss?.championId)return{id:String(r.v8Swiss.championId),total:Number(r.v8Swiss.championTotal||r.winningTime||0)};
 if(r?.format==='groups-total-time'){
  const fin=[...(r?.v8Groups?.completedGroups||[])].reverse().find(g=>g?.final),row=fin?.standings?.[0];if(row)return{id:String(row.id),total:Number(row.total||r.winningTime||0)};
  if(r?.v8Groups?.championId)return{id:String(r.v8Groups.championId),total:Number(r.winningTime||0)};
 }
 const rounds=(r?.rounds||[]).length,rows=(r?.entries||[]).map(id=>{const rr=(r?.results||[]).filter(x=>String(x.carId)===String(id));return rr.length===rounds?{id:String(id),total:rr.reduce((a,b)=>a+Number(b.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total);return rows[0]||null;
}
function festivalFormat8065(r){if(r?.type==='fh5-drag'||r?.dragShootout8065)return'DRAG SHOOTOUT';if(r?.format==='swiss')return'SWISS';if(r?.format==='groups-total-time')return'GROUPS';return'STANDARD'}
function completedFestivals8065(){return ((currentSpace()?.runs)||[]).filter(r=>r?.status==='complete').sort((a,b)=>String(b.completedAt||b.updatedAt||'').localeCompare(String(a.completedAt||a.updatedAt||'')))}
function completedRaceOffs8065(){return ((currentSpace()?.raceOffs)||[]).filter(r=>r?.status==='complete').sort((a,b)=>String(b.completedAt||b.updatedAt||'').localeCompare(String(a.completedAt||a.updatedAt||'')))}
function raceOffChampion8065(ro){const id=String(ro?.championCarId||ro?.champion?.sourceCarId||ro?.champion?.id||'');return{id,name:id?carText(id):String(ro?.champion?.name||'Race Off Champion')}}
function raceOffTotal8065(ro,id){let total=0,found=0;for(const rd of ro?.rounds||[])for(const m of rd?.matches||[]){const a=carId(m?.carA)===String(id),b=carId(m?.carB)===String(id),res=a?m?.resultA:b?m?.resultB:null;if(res&&Number(res.time)>0){total+=Number(res.time);found++}}return found?total:0}

function historyTile8065(kind,count){const label=kind==='festival'?'Festival':'Race Off',fn=kind==='festival'?'rhFestivalHistoryV8065()':'rhRaceOffHistoryV8065()';return `<button class="rhHistoryHeroTileV8065" onclick="${fn}" aria-label="Open ${label} History"><span><small>ARCHIVE</small><b>HISTORY</b><em>${count} completed</em></span><strong>›</strong></button>`}
function addFestivalHistoryTile8065(){const hero=$('festival')?.querySelector('.rhFestivalHeroV1');if(!hero||hero.querySelector('.rhHistoryHeroTileV8065'))return;hero.insertAdjacentHTML('beforeend',historyTile8065('festival',completedFestivals8065().length))}
function addRaceOffHistoryTile8065(){const root=$('raceoff'),hero=root?.querySelector('.rhFestivalHeroV1');if(!hero||hero.querySelector('.rhHistoryHeroTileV8065'))return;root.querySelector('.rhRaceOffHistoryV6123')?.remove();hero.insertAdjacentHTML('beforeend',historyTile8065('raceoff',completedRaceOffs8065().length))}

function emptyHistory8065(kind){return `<section class="rhHistoryEmptyV8065"><b>NO ${kind.toUpperCase()} HISTORY YET</b><p>Completed ${kind} runs will be archived here.</p></section>`}
window.rhFestivalHistoryV8065=function(){
 const list=completedFestivals8065();show('festival');$('festival').innerHTML=`<div class="rhFestivalV1 rhHistoryPageV8065"><section class="rhFestivalHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRenderFestival()" aria-label="Back">‹</button><div><h1>FESTIVAL HISTORY</h1><p>Completed Championships</p></div></div></section><main class="rhFestivalBodyV1 rhHistoryBodyV8065">${list.length?list.map(r=>{const w=festivalWinner8065(r),name=w?carText(w.id):'Champion unavailable',entries=(r.entries||[]).length;return `<button class="rhHistoryCardV8065" onclick="rhOpenRun('${E(r.id)}')"><div class="rhHistoryTitleV8065"><small>${E(festivalFormat8065(r))} • ${E(dateText8065(r.completedAt||r.updatedAt))}</small><b>${E(r.name||'Championship')}</b></div><div class="rhHistoryMetaV8065"><span><small>CHAMPION</small><b>${E(name)}</b></span><span><small>ENTRANTS</small><b>${entries}</b></span><span><small>WINNING TIME</small><b>${w?.total?E(fmt(w.total)):'—'}</b></span></div><strong class="rhHistoryArrowV8065">›</strong></button>`}).join(''):emptyHistory8065('Festival')}</main></div>`;window.scrollTo(0,0)
};
window.rhRaceOffHistoryV8065=function(){
 const list=completedRaceOffs8065();show('raceoff');$('raceoff').innerHTML=`<div class="rhFestivalV1 rhRaceOffV1 rhHistoryPageV8065"><section class="rhFestivalHeroV1 rhRaceOffHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRenderRaceOff()" aria-label="Back">‹</button><div><h1>RACE OFF HISTORY</h1><p>Completed Tournaments</p></div></div></section><main class="rhFestivalBodyV1 rhHistoryBodyV8065">${list.length?list.map(ro=>{const c=raceOffChampion8065(ro),entries=ro.entryIds?.length||ro.entrants?.length||0,total=c.id?raceOffTotal8065(ro,c.id):0;return `<button class="rhHistoryCardV8065" onclick="rhRaceOffRenderChampion('${E(ro.id)}')"><div class="rhHistoryTitleV8065"><small>${E(dateText8065(ro.completedAt||ro.updatedAt))}</small><b>${E(ro.name||'Race Off')}</b></div><div class="rhHistoryMetaV8065"><span><small>CHAMPION</small><b>${E(c.name)}</b></span><span><small>ENTRANTS</small><b>${entries}</b></span><span><small>TOTAL RACE TIME</small><b>${total?E(fmt(total)):'—'}</b></span></div><strong class="rhHistoryArrowV8065">›</strong></button>`}).join(''):emptyHistory8065('Race Off')}</main></div>`;window.scrollTo(0,0)
};

/* ---------- Race Off landing parity ---------- */
function cleanRaceOff8065(){
 const root=$('raceoff'),body=root?.querySelector('.rhFestivalBodyV1');if(!body)return;
 // The old bottom archive is replaced by the dedicated History screen.
 root.querySelector('.rhRaceOffHistoryV6123')?.remove();
 // Drag no longer belongs in a knockout catalogue. Completed Drag Race Offs remain in History / Hall of Fame.
 [...body.querySelectorAll('details.rhFH5RaceOffSpecial8056')].filter(d=>/DRAG RACING RACE OFFS/i.test(d.querySelector('summary')?.textContent||'')).forEach(d=>d.remove());
 // Festival -> Favourite -> Lonely Hearts, then the normal catalogue sections.
 const festival=[...body.children].find(x=>x.matches?.('.rhFestivalSectionV1')&&/^OTG! RACE OFFS$/i.test(x.querySelector(':scope > h2')?.textContent?.trim()||''));
 const fav=body.querySelector('.rhRaceOffFavouriteV1'),lonely=body.querySelector('.rhLonelyHeartsRaceOff8062');
 if(festival)body.insertBefore(festival,body.firstElementChild);
 if(fav)body.insertBefore(fav,festival?.nextElementSibling||body.firstElementChild);
 if(lonely)body.insertBefore(lonely,fav?.nextElementSibling||festival?.nextElementSibling||body.firstElementChild);
 addRaceOffHistoryTile8065();
}

/* Run repairs after every landing render so resets/imports in the same session are normalised too. */
const baseFestivalRender8065=window.rhRenderFestival;
if(typeof baseFestivalRender8065==='function')window.rhRenderFestival=function(){repairPickups8065();repairDragRuns8065();const out=baseFestivalRender8065.apply(this,arguments);addFestivalHistoryTile8065();return out};
const baseRaceOffRender8065=window.rhRenderRaceOff;
if(typeof baseRaceOffRender8065==='function')window.rhRenderRaceOff=function(){repairPickups8065();const out=baseRaceOffRender8065.apply(this,arguments);cleanRaceOff8065();return out};

/* ---------- IndexedDB Safety Backup restore bridge ---------- */
const baseRestoreFinal8065=window.rhRestoreFinal;
if(!window.rhIndexedSafetyRestoreBridgeV8065&&typeof baseRestoreFinal8065==='function')window.rhRestoreFinal=async function(id){
 if(String(id)!=='SAFETY')return baseRestoreFinal8065.apply(this,arguments);
 const s=currentSpace(),stub=s?.safetyBackup;
 if(!stub||stub.storage!=='indexeddb')return baseRestoreFinal8065.apply(this,arguments);
 try{
  const rec=await window.rhReadIndexedSafetyBackupV8065?.(String(s.id));
  const b=rec?.backup;
  if(!b||b.id!==stub.id||b.type!=='safety'||(stub.digest&&window.rhSafetyDigestV8013?.(b)!==stub.digest)){if(typeof toast==='function')toast('Safety Backup could not be verified');return}
  const manual=s.backups||[],safety=s.safetyBackup||null;
  Object.assign(s,typeof rhClone==='function'?rhClone(b.data):JSON.parse(JSON.stringify(b.data)));
  s.backups=manual;s.safetyBackup=safety;rhSave();
  if(typeof toast==='function')toast('Backup restored');window.rhRenderSettings?.();
 }catch(err){console.warn('OTG! indexed Safety Backup restore failed',err);if(typeof toast==='function')toast('Safety Backup restore failed')}
};

window.rhRepairPickupsV8065=repairPickups8065;
window.rhDragStripV8065=dragStrip8065;
window.rhEnforceDragV8065=enforceDrag8065;
window.rhCleanRaceOffV8065=cleanRaceOff8065;
window.rhV8065Report=()=>({pickups:(currentSpace()?.cars||[]).filter(c=>isPickups(c?.classType)).length,dragRaceOffCards:[...document.querySelectorAll('#raceoff details')].filter(d=>/DRAG RACING RACE OFFS/i.test(d.textContent||'')).length,festivalHistory:completedFestivals8065().length,raceOffHistory:completedRaceOffs8065().length});
})();
