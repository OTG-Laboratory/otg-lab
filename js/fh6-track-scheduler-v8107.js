/* OTG! v8.0.107 — FH6 route pool + Evil schedule PREVIEW
 * FH6-only, safe by construction: no FH5/GT7 reads or writes, no live race,
 * no route name inferred from FH5 or blueprint placeholders.
 */
(()=>{
'use strict';
const KEY='fh6-catalogue-v1';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const TYPES={ROAD:'Road Racing',STREET:'Street Racing',DIRT:'Dirt Racing',CROSS_COUNTRY:'Cross Country',DRIFT_ZONE:'Drift Zone'};
const GROUPS={ROAD:['ROAD','STREET'],OFFROAD:['DIRT','CROSS_COUNTRY'],DRIFT:['DRIFT_ZONE'],RACE:[]};
const GROUP_LABEL={ROAD:'ROAD / STREET',OFFROAD:'DIRT / CROSS COUNTRY',DRIFT:'DRIFT ZONES',RACE:'SPECIALIST RACE — ROUTE TYPE TO VERIFY'};
const MAX_NAME=100;
function space(){const s=window.fh6Space?.();return s&&s.catalogueKey===KEY?s:null;}
function active(){return !!(space()&&typeof rhSpace==='function'&&rhSpace()?.id===space().id);}
function routes(){const t=space()?.fh6TrackPreparation;return Array.isArray(t?.routes)?t.routes.filter(r=>r&&typeof r==='object'&&TYPES[r.type]&&typeof r.name==='string'):[];}
function seededRandom(seed){let a=(Number(seed)>>>0)||1;return ()=>{a+=0x6d2b79f5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(arr,random=Math.random){const copy=[...arr];for(let i=copy.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
function poolForEvent(ev){
 if(ev.eco==='DRIFT')return 'DRIFT';
 if(ev.eco==='OFF-ROAD / BUGGY')return 'OFFROAD';
 if(ev.eco==='FORZA EDITION'){
  if(ev.id.includes('OFFROAD')||ev.route.toUpperCase().includes('DIRT'))return 'OFFROAD';
  if(ev.id.includes('ROAD')||ev.route.toUpperCase().includes('STREET'))return 'ROAD';
  return null;
 }
 if(ev.eco==='RACE')return 'RACE';
 return ev.eco==='NORMAL'?'ROAD':null;
}
function routeCandidates(group,library=routes()){
 const types=GROUPS[group]||[];return library.filter(r=>types.includes(r.type));
}
/* Fully replayable schedule, with explicit UNRESOLVED dependency barriers. */
function createSchedule(seed=61027,source='PROVISIONAL'){
 const mode=source==='CONFIRMED'?'CONFIRMED':'PROVISIONAL';
 const blueprint=window.fh6EvilPreview?.(mode);
 if(!blueprint)return {core:[],nights:[],coreTotal:0,unplanned:0,rosterCount:0,seed:Number(seed)||61027};
 const random=seededRandom(seed);
 const core=blueprint.events.filter(e=>!e.finals&&e.cars.length>=2);
 const perEvent=core.map(e=>{
  const info=e.mode==='FESTIVAL'?window.fh6EvilFestivalWorkload(e.cars.length,e.eco==='DRIFT'):window.fh6EvilRaceOffWorkload(e.cars.length);
  return {event:e,work:info,visits:info.visits.map((visit,i)=>({
   eventId:e.id,eventName:e.name,mode:e.mode,ecosystem:e.eco,family:e.family,round:visit.stage,visitNumber:i+1,visitTotal:info.visits.length,
   entries:visit.entries,pairs:visit.pairs||0,routeDraws:e.mode==='FESTIVAL'?(visit.draws||visit.rounds):(visit.pairs||0),routePool:poolForEvent(e),
   requiresResults:e.mode==='RACE OFF'?i>0&&visit.stage!==info.visits[0].stage:!info.complete&&false,
   stageIncomplete:e.mode==='FESTIVAL'&&info.complete===false,
   previewOnly:true
  }))};
 });
 // Fair randomised interleave: each championship has at most one visit per wave.
 // Preserve each event's internal round order while spreading group visits over the campaign.
 const all=[],waveCount=Math.max(0,...perEvent.map(x=>x.visits.length));
 for(let wave=0;wave<waveCount;wave++){
  const available=shuffle(perEvent.filter(x=>x.visits.length>wave),random);
  if(all.length&&available.length>1&&available[0].event.id===all[all.length-1].eventId){
   const swap=available.findIndex(x=>x.event.id!==all[all.length-1].eventId);
   if(swap>0)[available[0],available[swap]]=[available[swap],available[0]];
  }
  for(const x of available)all.push({...x.visits[wave],previewNumber:all.length+1});
 }
 // Finals night order is fixed, while core event order/visits are shuffled.
 // Night 01 deliberately remains a placeholder until route and eligibility audit.
 const nights=Array.from({length:9},(_,i)=>{
  const night=String(i+1).padStart(2,'0');
  const events=blueprint.events.filter(e=>e.finals&&e.slot===night);
  const visits=events.flatMap(e=>{
   const w=e.mode==='FESTIVAL'?window.fh6EvilFestivalWorkload(e.cars.length,e.eco==='DRIFT'):window.fh6EvilRaceOffWorkload(e.cars.length);
   return w.visits.map((v,j)=>({eventId:e.id,eventName:e.name,round:v.stage,visitNumber:j+1,visitTotal:w.totalVisits,entries:v.entries,pairs:v.pairs||0,routeDraws:e.mode==='FESTIVAL'?(v.draws||v.rounds):v.pairs,routePool:poolForEvent(e),previewOnly:true}));
  });
  return {night,title:['Normal Era / Class Masters (to plan)','Favourite Manufacturer Festival','Forza Edition Specialist','Drift Specialist','Favourite Manufacturer Race Off','Off-Road / Buggy Finale','Dedicated Race Cars Finale','All Normal Cars Festival','All Normal Cars Race Off'][i],events:events.map(e=>({id:e.id,name:e.name,cars:e.cars.length,mode:e.mode})),visits:visits.length,entries:visits.reduce((s,v)=>s+v.entries,0),blocked:events.some(e=>e.cars.length<2)};
 });
 return {seed:Number(seed)||61027,mode,rosterCount:blueprint.rosterCount,coreEventCount:core.length,coreTotal:all.length,core:all,nights,
  unfinishedGroups:perEvent.filter(x=>x.work.complete===false).length,plannedFinalVisits:nights.reduce((n,x)=>n+x.visits,0),
  caveat:'Illustrative visit order only. Knockout advancement and Festival group finals depend on actual future results; no playable slots are created.'};
}
/* Strict championship shuffle bag. Never cycles within the same championship;
 * once its verified pool is exhausted the draw is blocked, not repeated.
 * Supplying an expanded/changed pool rebuilds its available candidates. */
function drawFromBag(options,bag,key,random=Math.random){
 const pool=[...new Map(options.map(x=>[x.id,x])).values()];
 if(!pool.length)return null;
 const signature=pool.map(x=>x.id).sort().join('|');
 let slot=bag[key];
 if(!slot||slot.signature!==signature){slot={signature,remaining:shuffle(pool.map(x=>x.id),random)};bag[key]=slot;}
 if(!slot.remaining.length)return null;
 const id=slot.remaining.pop();
 return pool.find(x=>x.id===id)||null;
}

let seed=61027,mode='PROVISIONAL',visible=35,tab='SCHEDULE';
let data=null,selectedIndex=-1,bags={},lastDraw=[];
function resetDemo(){bags={};lastDraw=[];selectedIndex=-1;}
function markSave(){if(typeof rhSync==='function')rhSync();if(typeof rhSave==='function')rhSave();}
function render(){if(!active())return false;
 data=createSchedule(seed,mode);
 const garage=document.getElementById('garage');if(!garage)return false;
 const entries=routes();
 const allGroups=Object.entries(GROUPS);
 const shown=data.core.slice(0,visible);
 garage.innerHTML=`<div class="fh6PlannerPage"><header class="fh6PlannerHead"><button onclick="fh6PlannerBack()">‹</button><div><small>OTG! / FH6 / PRE-LAUNCH</small><h1>RANDOM TRACKS & SCHEDULE</h1><p>v8.0.107 · no FH6 racing enabled</p></div></header>
 <main class="fh6PlannerBody"><div class="fh6PlannerWarning"><strong>🔒 BLUEPRINT ONLY — NOT A PLAYABLE CAMPAIGN</strong><p>FH6 routes and Drift Zones are unverified. All route pools start empty; FH5 locations never transfer. No racing results, championship progress, permanent car draw or event start can be created here.</p></div>
 <section class="fh6PlannerMetrics"><div><strong>${data.coreEventCount}</strong><small>CORE EVENTS</small></div><div><strong>${data.coreTotal}</strong><small>PROPOSED CORE VISITS</small></div><div><strong>${entries.length}</strong><small>VERIFIED ROUTES ENTERED</small></div></section>
 <nav class="fh6PlannerTabs"><button class="${tab==='SCHEDULE'?'on':''}" onclick="fh6PlannerTab('SCHEDULE')">CAMPAIGN ORDER</button><button class="${tab==='TRACKS'?'on':''}" onclick="fh6PlannerTab('TRACKS')">TRACK LIBRARY</button></nav>
 ${tab==='SCHEDULE'?`<section class="fh6PlannerPanel"><h2>CAMPAIGN DRAW · PREVIEW</h2><div class="fh6PlannerControls"><label>Roster status<select onchange="fh6PlannerMode(this.value)"><option value="PROVISIONAL" ${mode==='PROVISIONAL'?'selected':''}>DRAFT (unverified)</option><option value="CONFIRMED" ${mode==='CONFIRMED'?'selected':''}>CONFIRMED ONLY</option></select></label><label>Shuffle seed<input aria-label="Campaign shuffle seed" type="number" min="1" max="999999999" step="1" value="${seed}" onchange="fh6PlannerSeed(this.value)"></label></div><button class="fh6PlannerBig" onclick="fh6PlannerReshuffle()">🎲 RANDOMISE CAMPAIGN PREVIEW</button><p class="fh6PlannerHint">Randomise all eligible core event visits; keep every event's visits in their own stage order and separate linked visits. ${data.unfinishedGroups} group-stage championships still require later advancement planning.</p>
 <div class="fh6PlannerQueue">${shown.map((v,i)=>`<div class="fh6PlannerVisit"><div class="fh6PlannerVisitTitle"><b>VISIT ${String(v.previewNumber).padStart(4,'0')} · ${esc(v.eventName)}</b><span>${v.entries} RESULTS</span></div><small>${esc(v.family)} · ${esc(v.mode)} · ${esc(v.round)} (${v.visitNumber}/${v.visitTotal})</small><small>${esc(GROUP_LABEL[v.routePool]||'ROUTE POOL TO VERIFY')} · ${v.routeDraws} random route draw${v.routeDraws===1?'':'s'}</small>${v.requiresResults?'<small class="fh6PlannerDependent">CONDITIONAL — prior knockout results needed</small>':''}<button type="button" onclick="fh6PlannerDemo(${i})" ${!v.routePool||!routeCandidates(v.routePool).length?'disabled':''}>🎲 PREVIEW VERIFIED ROUTE DRAW${v.routeDraws===1?'':'S'}</button></div>`).join('')||'<p>Not enough confirmed eligible cars to plan core visits yet.</p>'}</div>
 ${data.core.length>visible?`<button class="fh6PlannerBig" onclick="fh6PlannerMore()">SHOW ${Math.min(35,data.core.length-visible)} MORE VISITS ▼</button>`:''}
 ${lastDraw.length?`<div class="fh6PlannerDrawResult"><strong>LAST ROUTE DRAW · ${esc(lastDraw[0].eventName)}</strong><ol>${lastDraw.map(x=>`<li>${esc(x.route)}</li>`).join('')}</ol><small>Rehearsal only. Draws are not saved or reserved.</small></div>`:''}</section>
 <section class="fh6PlannerPanel"><h2>FINALS NIGHT SCHEDULING</h2><p>Finals stay in a fixed themed order. Favourite Manufacturer Festival and Race Off are separated by two other Finals Nights, even after reshuffling the core campaign.</p><div class="fh6PlannerNights">${data.nights.map(n=>`<div><b>NIGHT ${n.night}</b><strong>${esc(n.title)}</strong><small>${n.events.length?n.events.map(e=>`${esc(e.name)} (${e.cars} cars)`).join(' · '):'Theme placeholder — no final race invented'} · ${n.visits} preview visits</small></div>`).join('')}</div></section>`:
 `<section class="fh6PlannerPanel"><h2>FH6 TRACK LIBRARY · STARTS EMPTY</h2><p>The five route categories below are just an organising framework. Only manually entered, FH6-verified route names can be drawn. Draws never repeat within one championship, and will stop when the verified pool is exhausted. No FH5, Rally Adventure or Hot Wheels names are imported.</p><div class="fh6PlannerPools">${allGroups.map(([group,types])=>`<div><b>${esc(GROUP_LABEL[group])}</b><small>${types.length?`${routeCandidates(group,entries).length} verified route(s)`:'BLOCKED until FH6 specialist race route type is confirmed'}</small></div>`).join('')}</div><form id="fh6PlannerAddForm" onsubmit="return fh6PlannerAdd(event)"><label>Verified FH6 route type<select name="type" required>${Object.entries(TYPES).map(([value,label])=>`<option value="${value}">${esc(label)}</option>`).join('')}</select></label><label>Exact FH6 route name<input name="name" maxlength="100" required placeholder="Enter only after verifying in FH6"></label><button class="fh6PlannerBig" type="submit">ADD VERIFIED FH6 ROUTE</button></form><p class="fh6PlannerHint">Only add routes you've personally confirmed in FH6. All changes stay inside the FH6 Space and survive switching games; this never unlocks racing.</p><div class="fh6PlannerSaved">${entries.map(x=>`<div><span><strong>${esc(x.name)}</strong><small>${esc(TYPES[x.type])}</small></span><button onclick="fh6PlannerDelete('${esc(x.id)}')" type="button">REMOVE</button></div>`).join('')||'<p>No FH6 tracks verified yet. This is expected before release.</p>'}</div></section>`}
 <section class="fh6PlannerBottom"><strong>SAFETY / NEXT STEPS</strong><p>${esc(data.caveat)} Final route pools, LOCATION clues, specialist eligibility and the full knockout/advancement programme must be verified after you have FH6. Your accepted FH5 Evil R1 and GT7 data stay untouched.</p><button onclick="fh6PlannerBack()">RETURN TO FH6 GARAGE</button></section></main></div>`;
 return true;
}
function inject(){if(!active())return;
 const ref=document.getElementById('fh6EvilLaunch');
 if(ref&&!document.getElementById('fh6PlannerLaunch'))ref.insertAdjacentHTML('afterend',`<div class="fh6PlannerLaunch" id="fh6PlannerLaunch"><div><b>FH6 RANDOM TRACKS & SCHEDULE</b><p>Shuffle proposed visits, inspect Finals Nights and maintain an empty-until-verified FH6 route library.</p></div><button onclick="fh6PlannerOpen()">OPEN TRACK & SCHEDULE PLANNER ›</button></div>`);
}
window.fh6PlannerOpen=()=>{if(!active())return false;tab='SCHEDULE';visible=35;resetDemo();return render();};
window.fh6PlannerBack=()=>{if(!active())return false;window.rhRenderGarage?.();return true;};
window.fh6PlannerTab=x=>{if(!active())return;tab=x==='TRACKS'?'TRACKS':'SCHEDULE';lastDraw=[];render();};
window.fh6PlannerMore=()=>{if(!active())return;visible+=35;render();};
window.fh6PlannerMode=x=>{if(!active())return;mode=x==='CONFIRMED'?'CONFIRMED':'PROVISIONAL';visible=35;resetDemo();render();};
window.fh6PlannerSeed=x=>{if(!active())return;const n=Number(x);if(!Number.isInteger(n)||n<1||n>999999999){window.alert?.('Please enter a seed from 1 to 999999999.');return;}seed=n;resetDemo();render();};
window.fh6PlannerReshuffle=()=>{if(!active())return;seed=seed>=999999999?1:seed+1;resetDemo();render();};
window.fh6PlannerDemo=index=>{
 if(!active()||tab!=='SCHEDULE')return false;
 const visit=data?.core?.[Number(index)];if(!visit||!visit.routePool)return false;
 const pool=routeCandidates(visit.routePool);if(!pool.length)return false;
 const draws=[];for(let i=0;i<visit.routeDraws;i++){
  const picked=drawFromBag(pool,bags,`${visit.eventId}/${visit.routePool}`);draws.push({eventName:visit.eventName,route:picked?picked.name:'BLOCKED — verified route pool exhausted; no repeats allowed'});
 }
 lastDraw=draws;render();return draws;
};
window.fh6PlannerAdd=event=>{
 event?.preventDefault?.();if(!active())return false;
 const form=event?.target||document.getElementById('fh6PlannerAddForm');
 const type=String(form?.elements?.type?.value||'');const name=String(form?.elements?.name?.value||'').trim().replace(/\s+/g,' ');
 if(!TYPES[type]||!name||name.length>MAX_NAME){window.alert?.('Select a category and enter a route name of 1–100 characters.');return false;}
 const s=space(),items=routes();
 if(items.some(r=>norm(r.name)===norm(name))){window.alert?.('That FH6 route is already in your verified library.');return false;}
 const next={id:`fh6-route-${Date.now()}-${Math.floor(Math.random()*1e9)}`,type,name};
 const prev=s.fh6TrackPreparation;
 s.fh6TrackPreparation={schema:1,routes:[...items,next]};
 try{markSave();}catch(err){s.fh6TrackPreparation=prev;window.alert?.('Unable to save FH6 route.');return false;}
 resetDemo();render();return false;
};
window.fh6PlannerDelete=id=>{
 if(!active())return false;
 const s=space(),items=routes();if(!items.some(r=>r.id===id))return false;
 if(typeof window.confirm==='function'&&!window.confirm('Remove this verified FH6 route?'))return false;
 const prev=s.fh6TrackPreparation;
 s.fh6TrackPreparation={schema:1,routes:items.filter(r=>r.id!==id)};
 try{markSave();}catch(err){s.fh6TrackPreparation=prev;window.alert?.('Unable to save the change.');return false;}
 resetDemo();render();return true;
};
window.fh6PlannerSchedulePreview=createSchedule;
window.fh6PlannerDrawFromBag=drawFromBag;
window.fh6PlannerRouteCandidates=routeCandidates;
window.fh6PlannerSeededRandom=seededRandom;
const previousRender=window.rhRenderGarage;
window.rhRenderGarage=function(){const result=previousRender?.apply(this,arguments);inject();return result;};
})();
