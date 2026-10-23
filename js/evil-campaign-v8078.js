/* OTG! v8.0.78 — Evil Campaign standalone back-control hotfix.
   Campaign data/state remains v8076-compatible so progress is preserved.

   v8.0.76 foundation:
   - 708-slot R2 campaign is embedded in OTG! and starts clean at 0/708.
   - Regular season is a controlled reshuffle; Finals Week remains fixed.
   - The old opening four source rows are deliberately pushed deeper into the campaign.
   - Progress is stored per FH5 Space and is intentionally reset by Reset Racing Data / Full Reset.
   - Festival launches reuse the live OTG! setup engine and persistent shuffle bags.
   - Race Off launches reuse the live Race Off engine and auto-routes.
   - Slot completion is manual in this foundation build so partial/parked visits remain unambiguous.
*/
(()=>{
'use strict';
const VERSION='8.0.77';
const FH5_KEY='fh5-catalogue-v1';
const DATA=()=>window.rhEvilCampaignData8076||{meta:{slots:0},slots:[]};
const KEY='evilCampaign8076';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v??'').trim();
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function space(){try{return rhSpace()}catch(_){return null}}
function save(){try{rhSave()}catch(_){}}
function slots(){return DATA().slots||[]}
function bySlot(n){return slots().find(x=>Number(x.slot)===Number(n))||null}
function progressState(){
 const s=space();if(!s)return {campaignId:DATA().meta?.campaignId||'evil-8076-r1',done:{}};
 const id=DATA().meta?.campaignId||'evil-8076-r1';
 let p=s[KEY];
 if(!p||p.campaignId!==id){p={campaignId:id,done:{},startedAt:null,updatedAt:null};s[KEY]=p;save()}
 p.done=(p.done&&typeof p.done==='object')?p.done:{};
 return p;
}
function stateOf(slot){const p=progressState();return p.done?.[slot.id]?'done':'todo'}
function counts(){const p=progressState(),all=slots();let done=0;for(const s of all)if(p.done?.[s.id])done++;return{done,total:all.length,resolved:done}}
function current(){const p=progressState();return slots().find(s=>!p.done?.[s.id])||null}
function pct(){const c=counts();return c.total?Math.min(100,(c.done/c.total)*100):0}
function labelMode(s){return s.mode==='Race Off'?'RACE OFF':s.mode==='Garage Mix'?'SPECIAL':'FESTIVAL'}
function poolText(s){
 if(s.track==='RANDOMISE ALL')return `${s.pool||'TRACK'} SHUFFLE BAG`;
 if(s.track==='AUTO ROUTE')return 'LIVE AUTO ROUTE';
 return s.track||s.programme||'—';
}
function trackCategoryFor(s){
 const map={'ROAD / STREET':'ROAD','OFF-ROAD':'OFFROAD','RALLY ADVENTURE':'RALLY','HOT WHEELS':'HOT_WHEELS','MIXED':'MIXED','DRAG':'DRAG'};
 return map[clean(s?.pool)]||'';
}
function protectedFinalFor(s){return clean(s?.protectedFinal).replace(/\s+—\s+[BPGO]$/i,'').trim()}
function markerFor(s){return {campaignId:DATA().meta.campaignId,slotId:s.id,slot:s.slot,sourceSlot:s.sourceSlot,trackCategory:trackCategoryFor(s),protectedFinal:protectedFinalFor(s),fixedTrack:exactFixedTrack(s)}}
function phaseGroups(){const out=[];for(const s of slots()){let g=out.find(x=>x.name===s.phase);if(!g){g={name:s.phase,rows:[]};out.push(g)}g.rows.push(s)}return out}
function phaseStats(rows){let done=0;for(const s of rows)if(stateOf(s)==='done')done++;return{done,total:rows.length}}
function openScreen(){
 if(!fh5()){try{toast('Evil Campaign is available in the Forza Horizon 5 Space')}catch(_){}return}
 try{show('evilcampaign')}catch(_){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById('evilcampaign')?.classList.remove('hidden');
 }
 renderMain();window.scrollTo(0,0);
}
window.rhOpenEvilCampaign8076=openScreen;

function dashTile(){
 if(!fh5())return;
 const grid=document.querySelector('#home .v7DashGrid');if(!grid)return;
 const festival=grid.querySelector('.v7DashTile.festival');
 if(festival)festival.classList.remove('wide');
 if(grid.querySelector('.v7DashTile.evil8076'))return;
 const c=counts(),cur=current();
 const btn=document.createElement('button');btn.className='v7DashTile evil8076';btn.onclick=openScreen;
 const next=cur?`NEXT • SLOT ${String(cur.slot).padStart(3,'0')}`:'CAMPAIGN COMPLETE';
 btn.innerHTML=`<i aria-hidden="true">!</i><span><b>EVIL CAMPAIGN</b><small><span>${c.done} / ${c.total} COMPLETE</span><span>${next}</span></small></span><em aria-hidden="true">›</em>`;
 festival?festival.insertAdjacentElement('afterend',btn):grid.prepend(btn);
}
const baseHome=window.rhRenderHome;
if(typeof baseHome==='function')window.rhRenderHome=function(){const out=baseHome.apply(this,arguments);dashTile();return out};
function repaintHomeIfLive(){const h=document.getElementById('home');if(h&&!h.classList.contains('hidden')&&typeof window.rhRenderHome==='function')window.rhRenderHome()}

function currentCard(s){
 if(!s)return `<section class="rhEvilCurrent8076 complete"><small>CAMPAIGN COMPLETE</small><h2>708 / 708</h2><p>The Evil Campaign has no unresolved slots left.</p></section>`;
 return `<section class="rhEvilCurrent8076"><div class="rhEvilCurrentHead8076"><span><small>CURRENT SLOT</small><strong>${String(s.slot).padStart(3,'0')}</strong></span><em>${E(labelMode(s))}</em></div><h2>${E(s.event)}</h2><p>${E(s.doNow)}</p><div class="rhEvilMeta8076"><span>${E(s.liveFormat)}</span><span>${s.eligible} CARS</span><span>${E(s.pool||poolText(s))}</span></div><button class="btn" onclick="rhEvilOpenSlot8076(${s.slot})">OPEN SLOT ${String(s.slot).padStart(3,'0')}</button></section>`;
}
function slotRow(s,cur){
 const st=stateOf(s),cls=st==='done'?'done':cur?.id===s.id?'current':'todo';
 const status=st==='done'?'DONE':cur?.id===s.id?'CURRENT':'TODO';
 return `<button class="rhEvilRow8076 ${cls}" onclick="rhEvilOpenSlot8076(${s.slot})"><i>${String(s.slot).padStart(3,'0')}</i><span><b>${E(s.event)}</b><small>${E(labelMode(s))} • ${E(s.liveFormat)}${s.pool?` • ${E(s.pool)}`:''}</small></span><strong>${status}</strong><em>›</em></button>`;
}
function renderMain(){
 const host=document.getElementById('evilcampaign');if(!host)return;
 const c=counts(),cur=current(),groups=phaseGroups(),curPhase=cur?.phase;
 host.innerHTML=`<div class="rhEvil8076"><button class="rhEvilBackStandalone8078" onclick="show('home')" aria-label="Back" title="Back"><span>‹</span><b>BACK</b></button><header class="rhEvilHero8076"><div><small>ANDY ONLY</small><h1>EVIL CAMPAIGN</h1><p>ULTIMATE PICK MY DRIVE</p></div></header><main class="rhEvilBody8076"><section class="rhEvilProgress8076"><div><small>CAMPAIGN PROGRESS</small><strong>${c.done} <i>/ ${c.total}</i></strong><span>${(c.total-c.done)} TO DO</span></div><div class="rhEvilBar8076"><i style="width:${pct().toFixed(3)}%"></i></div></section>${currentCard(cur)}<section class="rhEvilListIntro8076"><div><small>THE LIST</small><h2>708 SLOTS</h2></div><p>Blue is waiting. Green is done. The list is fixed for this campaign; only the live Festival track draws and Race Off routes change.</p></section><div class="rhEvilPhases8076">${groups.map(g=>{const pc=phaseStats(g.rows),open=g.name===curPhase?'open':'';return `<details class="rhEvilPhase8076" ${open}><summary><span><b>${E(g.name)}</b><small>${pc.done}/${pc.total} DONE</small></span><em>⌄</em></summary><div>${g.rows.map(s=>slotRow(s,cur)).join('')}</div></details>`}).join('')}</div></main></div>`;
}
window.rhRenderEvilCampaign8076=renderMain;

function slotStatusButtons(s){const st=stateOf(s);if(st==='done')return `<button class="btn secondary rhEvilUndo8076" onclick="rhEvilSetStatus8076(${s.slot},'todo')">MARK AS TODO</button>`;return `<button class="btn rhEvilDone8076" onclick="rhEvilSetStatus8076(${s.slot},'done')">MARK SLOT DONE</button>`}
function actionLabel(s){if(s.mode==='Garage Mix')return'OPEN CUSTOM RACING';const spec=appSpec(s);if(!spec)return'VIEW INSTRUCTIONS';if(s.mode==='Festival'){const r=findFestival(spec);return r?'CONTINUE EVENT':'SET UP EVENT'}if(s.mode==='Race Off'){const r=findRaceOff(spec);return r?'CONTINUE EVENT':'SET UP EVENT'}return'SET UP EVENT'}
function renderSlot(n){
 const s=bySlot(n),host=document.getElementById('evilcampaign');if(!s||!host)return renderMain();const st=stateOf(s),cur=current();
 host.innerHTML=`<div class="rhEvil8076"><button class="rhEvilBackStandalone8078" onclick="rhRenderEvilCampaign8076()" aria-label="Back" title="Back"><span>‹</span><b>BACK</b></button><header class="rhEvilHero8076 rhEvilSlotHero8076"><div><small>${st==='done'?'DONE':cur?.id===s.id?'CURRENT SLOT':'CAMPAIGN SLOT'}</small><h1>SLOT ${String(s.slot).padStart(3,'0')}</h1><p>${E(labelMode(s))}</p></div></header><main class="rhEvilBody8076"><section class="rhEvilSlotCard8076 ${st}"><small>${E(s.family)}</small><h2>${E(s.event)}</h2><div class="rhEvilMeta8076"><span>${s.eligible} CARS</span><span>${E(s.liveFormat)}</span><span>${E(s.pool||'SPECIAL')}</span></div></section><section class="rhEvilInstruction8076"><small>DO THIS NOW</small><h3>${E(s.doNow)}</h3><p>${E(s.stopWhen)}</p></section><section class="rhEvilTrack8076"><small>TRACK PROGRAMME</small><h3>${E(poolText(s))}</h3><p>${s.track==='RANDOMISE ALL'?'OTG! will fill the setup from its existing persistent Festival shuffle bag. Preview and reroll do not consume tracks; START commits them.':s.track==='AUTO ROUTE'?'Race Off remains authoritative. OTG! assigns the live route for each non-final stage; protected Finals stay fixed.':'This slot has a fixed campaign track/programme and OTG! will preserve it.'}</p></section>${s.notes?`<section class="rhEvilNotes8076"><small>CAMPAIGN NOTE</small><p>${E(s.notes)}</p></section>`:''}<section class="rhEvilActions8076"><button class="btn rhEvilLaunch8076" onclick="rhEvilLaunchSlot8076(${s.slot})">${E(actionLabel(s))}</button>${slotStatusButtons(s)}</section><p class="rhEvilResetNote8076">Reset Racing Data also resets Evil Campaign progress to 0 / 708. Your Garage remains untouched.</p></main></div>`;window.scrollTo(0,0);
}
window.rhEvilOpenSlot8076=renderSlot;
window.rhEvilSetStatus8076=function(n,status){const s=bySlot(n);if(!s)return;const p=progressState();delete p.done[s.id];if(status==='done')p.done[s.id]=new Date().toISOString();if(!p.startedAt&&status==='done')p.startedAt=new Date().toISOString();p.updatedAt=new Date().toISOString();save();try{toast(status==='done'?`Slot ${String(s.slot).padStart(3,'0')} complete`:`Slot ${String(s.slot).padStart(3,'0')} restored`)}catch(_){}renderMain();repaintHomeIfLive()};

/* ---------- OTG! engine mapping ---------- */
const CLASS_ALIAS={
 'Classic Sports':'Classic Sports Cars','Hypercar':'Hypercars','Modern Sports Car':'Modern Sports Cars','Modern Supercar':'Modern Supercars','Sports Utility':'Sports Utility Heroes','UTV':"UTV's",'Utility':'Vans & Utility'
};
function baseEvent(s){return clean(s.event).split(' — ')[0].trim()}
function appSpec(s){
 const f=clean(s.family),ev=baseEvent(s);let type='',value='';
 if(f==='Festival'){type='festival';value='all'}
 else if(f==='Manufacturer'){type='make';value=ev}
 else if(f==='Era Championship'){type='era';value=Number((ev.match(/\d{4}/)||['0'])[0])||ev}
 else if(f==='Class / Type'){type='classType';value=CLASS_ALIAS[ev]||ev}
 else if(f==='Vintage & Classic'){if(/^vintage/i.test(ev)){type='vintage';value='vintage'}else{type='classic';value='classic'}}
 else if(f==='Rally Adventure'){type='fh5-rally';value=ev}
 else if(f==='Hot Wheels'){type='fh5-hotwheels';value=ev==='Pickups & 4x4s'?'Pickups & 4x4':ev}
 else if(f==='Drag Racing'){type='fh5-drag';value=ev}
 else if(f==='Favourite Manufacturer'){type='favourite';value=ev}
 else return null;
 let name=clean(s.event);
 if(f==='Manufacturer')name=`${ev} Championship`;
 else if(f==='Era Championship')name=`${ev} Championship`;
 else if(f==='Class / Type')name=`${ev} Championship`;
 else if(f==='Festival')name='All Cars Festival';
 else if(f==='Favourite Manufacturer')name=`${ev} Favourite Championship`;
 return{type,value,name};
}
function same(a,b){return String(a??'')===String(b??'')}
function findFestival(spec){try{return (typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(r=>['active','prepared'].includes(String(r?.status||''))&&same(r.type||r.championshipType,spec.type)&&same(r.value,spec.value))||null}catch(_){return null}}
function findRaceOff(spec){try{return (space()?.raceOffs||[]).filter(r=>r&&!['complete','abandoned'].includes(String(r.status||''))).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||''))).find(r=>same(r.type,spec.type)&&same(r.value,spec.value))||null}catch(_){return null}}
function openExistingRaceOff(ro){try{show('raceoff')}catch(_){}const i=Number(ro?.currentRoundIndex||0),rd=ro?.rounds?.[i];if(rd&&(rd.matches||[]).length&&typeof window.rhRaceOffRenderRoundProgress==='function')return window.rhRaceOffRenderRoundProgress(ro.id,i);if(typeof window.rhRaceOffOpenRoundSetup==='function')return window.rhRaceOffOpenRoundSetup(ro.id);if(typeof window.rhRenderRaceOffLocked==='function')return window.rhRenderRaceOffLocked(ro.id);window.rhRenderRaceOff?.()}
function exactFixedTrack(s){return s.mode==='Festival'&&s.track&&s.track!=='RANDOMISE ALL'&&s.track!=='AUTO ROUTE'&&!s.track.includes('→')?s.track:''}
function launchFestival(s,spec){
 const existing=findFestival(spec);if(existing){existing.evilCampaign8076=markerFor(s);save();try{show('festival')}catch(_){};return window.rhOpenRun?.(existing.id)}
 try{show('festival')}catch(_){}
 if(typeof window.rhBeginSetup!=='function')return toast?.('Festival setup is unavailable');
 window.rhBeginSetup(spec.type,spec.value,spec.name);
 if(typeof rhSetup==='undefined'||!rhSetup)return;
 rhSetup.evilCampaign8076=markerFor(s);
 const fixed=exactFixedTrack(s);
 if(fixed){rhSetup.rounds=[{id:typeof rhId==='function'?rhId('round'):`evil-${Date.now()}`,name:fixed,layout:''}];if(spec.type==='fh5-drag'){rhSetup.v8GroupMode=false;rhSetup.v8SwissMode=false;rhSetup.v8GroupPlan=null;rhSetup.v8SwissPlan=null}}
 if(typeof window.rhRenderSetup==='function')window.rhRenderSetup();
 setTimeout(()=>{
   if(typeof rhSetup==='undefined'||!rhSetup)return;
   const fixed2=exactFixedTrack(s);
   if(fixed2){rhSetup.rounds=[{id:rhSetup.rounds?.[0]?.id||(`evil-${Date.now()}`),name:fixed2,layout:''}];const inp=document.querySelector('#festival .rhSetupRoundsV1 input');if(inp)inp.value=fixed2;}
   else if(s.track==='RANDOMISE ALL'&&typeof window.rhFH5RandomiseAllSetup8069==='function')window.rhFH5RandomiseAllSetup8069();
 },0);
}
function launchRaceOff(s,spec){
 const existing=findRaceOff(spec);if(existing){existing.evilCampaign8076=markerFor(s);save();return openExistingRaceOff(existing)}
 try{show('raceoff')}catch(_){}
 if(typeof window.rhRaceOffCataloguePick!=='function')return toast?.('Race Off setup is unavailable');
 window.rhRaceOffCataloguePick(spec.type,spec.value,spec.name,s.eligible);
 if(window.rhRaceOffDraft)window.rhRaceOffDraft.evilCampaign8076=markerFor(s);
}
window.rhEvilLaunchSlot8076=function(n){const s=bySlot(n);if(!s)return;if(s.mode==='Garage Mix'){try{show('events')}catch(_){};try{toast('Lonely Hearts slot — use the slot instructions for this manual group')}catch(_){}return}const spec=appSpec(s);if(!spec){try{toast('This Evil slot is instructions-only for now')}catch(_){}return}if(s.mode==='Festival')return launchFestival(s,spec);if(s.mode==='Race Off')return launchRaceOff(s,spec)};

/* Make the existing FH5 track engines obey the campaign's explicit pool/final metadata.
   This matters where a Mexico Class/Type Rally field deliberately uses OFF-ROAD rather than Rally Adventure,
   and for protected Race Off Finals such as All Cars at Copper Canyon Sprint. */
function engineMarker(type,value,context='festival'){
 try{
  if(context==='festival'){
   if(typeof rhSetup!=='undefined'&&rhSetup?.evilCampaign8076&&same(rhSetup.type,type)&&same(rhSetup.value,value))return rhSetup.evilCampaign8076;
   const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).filter(r=>r?.evilCampaign8076&&['active','prepared'].includes(String(r.status||''))&&same(r.type||r.championshipType,type)&&same(r.value,value)).sort((a,b)=>String(b.updatedAt||b.startedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.startedAt||a.createdAt||'')))[0];
   return run?.evilCampaign8076||null;
  }
  if(window.rhRaceOffDraft?.evilCampaign8076&&same(window.rhRaceOffDraft.type,type)&&same(window.rhRaceOffDraft.value,value))return window.rhRaceOffDraft.evilCampaign8076;
  const ro=(space()?.raceOffs||[]).filter(r=>r?.evilCampaign8076&&!['complete','abandoned'].includes(String(r.status||''))&&same(r.type,type)&&same(r.value,value)).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')))[0];
  return ro?.evilCampaign8076||null;
 }catch(_){return null}
}
const basePreset8076=window.rhFH5Preset8056;
if(typeof basePreset8076==='function')window.rhFH5Preset8056=function(type,value,context='festival'){
 const p=basePreset8076.apply(this,arguments),m=engineMarker(type,value,context);
 return p&&m?.trackCategory?{...p,raceCategory:m.trackCategory}:p;
};
const baseFinale8076=window.rhFH5Finale8058;
if(typeof baseFinale8076==='function')window.rhFH5Finale8058=function(type,value,context='festival'){
 const m=engineMarker(type,value,context);if(context==='raceoff'&&m?.protectedFinal)return m.protectedFinal;
 return baseFinale8076.apply(this,arguments);
};

/* Attach Evil source metadata to newly frozen runs, and repair an Evil fixed track after legacy Drag guards run. */
const baseConfirm=window.rhConfirmStart;
if(typeof baseConfirm==='function')window.rhConfirmStart=function(){
 const marker=(typeof rhSetup!=='undefined'&&rhSetup?.evilCampaign8076)?JSON.parse(JSON.stringify(rhSetup.evilCampaign8076)):null;
 const type=typeof rhSetup!=='undefined'?rhSetup?.type:null,value=typeof rhSetup!=='undefined'?rhSetup?.value:null;
 const out=baseConfirm.apply(this,arguments);
 if(marker){try{const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).filter(r=>r?.status==='active'&&same(r.type||r.championshipType,type)&&same(r.value,value)).sort((a,b)=>String(b.startedAt||b.createdAt||'').localeCompare(String(a.startedAt||a.createdAt||'')))[0];if(run){run.evilCampaign8076=marker;if(marker.fixedTrack&&Array.isArray(run.rounds)&&run.rounds.length){run.rounds[0].name=marker.fixedTrack;run.rounds[0].layout=''}save();if(marker.fixedTrack&&typeof window.rhOpenRun==='function')window.rhOpenRun(run.id)}}catch(_){}}
 return out;
};
const baseLockRO=window.rhRaceOffLockDraft;
if(typeof baseLockRO==='function')window.rhRaceOffLockDraft=function(){const marker=window.rhRaceOffDraft?.evilCampaign8076?JSON.parse(JSON.stringify(window.rhRaceOffDraft.evilCampaign8076)):null,type=window.rhRaceOffDraft?.type,value=window.rhRaceOffDraft?.value;const out=baseLockRO.apply(this,arguments);if(marker){try{const ro=(space()?.raceOffs||[]).filter(r=>same(r.type,type)&&same(r.value,value)&&!['complete','abandoned'].includes(String(r.status||''))).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))[0];if(ro){ro.evilCampaign8076=marker;save()}}catch(_){}}return out};

/* Reset integration — progress belongs to Racing Data, not Garage/catalogue data. */
function addCampaignResetListener(){const b=document.getElementById('rhResetConfirm6090');if(!b||b.dataset.rhEvilReset8076)return;b.dataset.rhEvilReset8076='1';b.addEventListener('click',()=>{const s=space();if(s){delete s[KEY];try{rhSave()}catch(_){}}},{once:true})}
const baseResetConfirm=window.rhResetConfirm;if(typeof baseResetConfirm==='function')window.rhResetConfirm=function(){const out=baseResetConfirm.apply(this,arguments);/* v8.0.66 replaces the approved Reset button on the next task; attach after that clone exists. */setTimeout(addCampaignResetListener,0);return out};
const baseFullResetConfirm=window.rhFullResetConfirm;if(typeof baseFullResetConfirm==='function')window.rhFullResetConfirm=function(){const out=baseFullResetConfirm.apply(this,arguments);setTimeout(addCampaignResetListener,0);return out};

window.rhEvilCampaignQA8076={
 version:VERSION,meta:()=>DATA().meta,counts,current:()=>current(),slot:n=>bySlot(n),state:n=>{const s=bySlot(n);return s?stateOf(s):null},appSpec:n=>{const s=bySlot(n);return s?appSpec(s):null}
};

repaintHomeIfLive();
})();
