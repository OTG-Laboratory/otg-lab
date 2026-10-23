/* OTG! v8.0.108 — FH6 GARAGE-ADAPTIVE FESTIVAL / RACE OFF
 * FH6 only. Read current catalogueOwned + Specialist-First decisions on every view.
 * This is a prelaunch competition selector, not a playable FH6 event engine.
 * No work is added to FH5 or GT7 and no Evil List 2 slots are created.
 */
(()=>{
'use strict';
const KEY='fh6-catalogue-v1', CARS=window.FH6_CATALOGUE||[];
const MODES=['FESTIVAL','RACE OFF'];
const FAMILIES=['ALL','MANUFACTURER','ERA','CLASS','FAVOURITE','SPECIALIST'];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numericYear=c=>{const y=Number(c.year);return Number.isInteger(y)&&y>=1900&&y<=2100?Math.floor(y/10)*10:null;};
function space(){const s=window.fh6Space?.();return s?.catalogueKey===KEY?s:null;}
function active(){const s=space();return !!(s&&typeof rhSpace==='function'&&rhSpace()?.id===s.id);}
function ownedCars(){const owned=space()?.catalogueOwned||{};return CARS.filter(c=>Object.prototype.hasOwnProperty.call(owned,c.id));}
function classification(c){
 const s=space();const d=s?.fh6SpecialistPrep?.decisions?.[c.id];
 const confirmed=!!(d&&window.fh6PrepConfirmed?.(c.id));
 const ecosystem=confirmed?d.ecosystem:window.fh6PrepSuggested?.(c.id)||'UNRESOLVED';
 const role=confirmed?d.role:null;
 return {ecosystem,role,confirmed};
}
const add=(out,id,label,family,ecosystem,pool,cars,extra={})=>{
 if(cars.length<2)return;
 const ordered=[...cars].sort((a,b)=>a.full.localeCompare(b.full)||a.id.localeCompare(b.id));
 out.push({id,label,family,ecosystem,pool,carIds:ordered.map(c=>c.id),cars:ordered,
  confirmedCount:ordered.filter(c=>classification(c).confirmed).length,...extra});
};
const groupBy=(cars,fn)=>{const m=new Map();for(const c of cars){const k=fn(c);if(k==null||k==='')continue;if(!m.has(String(k)))m.set(String(k),[]);m.get(String(k)).push(c);}return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true}));};
function getCompetitions(mode='FESTIVAL'){
 if(!MODES.includes(mode))return [];
 const roster=ownedCars();const normal=roster.filter(c=>classification(c).ecosystem==='NORMAL');
 const entries=[], m=mode==='FESTIVAL'?'Festival':'Race Off';
 add(entries,`ALL-NORMAL-${mode}` ,`All Normal Cars ${m}`,'ALL','NORMAL','ROAD',normal);
 const fav=String(space()?.favouriteManufacturer||'').trim();
 if(fav)add(entries,`FAV-${mode}-${fav}`,`${fav} Favourite ${m}`,'FAVOURITE','NORMAL','ROAD',normal.filter(c=>c.make===fav));
 for(const [label,cars] of groupBy(normal,c=>c.make))add(entries,`MAKE-${mode}-${label}`,`${label} ${m}`,'MANUFACTURER','NORMAL','ROAD',cars);
 for(const [label,cars] of groupBy(normal,c=>numericYear(c)))add(entries,`ERA-${mode}-${label}`,`${label}s ${m}`,'ERA','NORMAL','ROAD',cars);
 for(const [label,cars] of groupBy(normal,c=>c.classType))add(entries,`CLASS-${mode}-${label}`,`${label} ${m}`,'CLASS','NORMAL','ROAD',cars);
 const byEco=e=>roster.filter(c=>classification(c).ecosystem===e);
 const feRoad=byEco('FORZA EDITION').filter(c=>classification(c).role==='ROAD');
 const feOff=byEco('FORZA EDITION').filter(c=>classification(c).role==='OFF-ROAD');
 add(entries,`SPEC-FE-ROAD-${mode}`,`Forza Edition Road ${m}`,'SPECIALIST','FORZA EDITION','ROAD',feRoad);
 add(entries,`SPEC-FE-OFF-${mode}`,`Forza Edition Off-Road ${m}`,'SPECIALIST','FORZA EDITION','OFFROAD',feOff);
 add(entries,`SPEC-DRIFT-${mode}`,`Dedicated Drift ${m}`,'SPECIALIST','DRIFT','DRIFT',byEco('DRIFT'));
 add(entries,`SPEC-RACE-${mode}`,`Dedicated Race Cars ${m}`,'SPECIALIST','RACE','RACE',byEco('RACE'));
 add(entries,`SPEC-OFFROAD-${mode}`,`Off-Road / Buggy ${m}`,'SPECIALIST','OFF-ROAD / BUGGY','OFFROAD',byEco('OFF-ROAD / BUGGY'));
 return entries;
}
const TYPES={ROAD:['ROAD','STREET'],OFFROAD:['DIRT','CROSS_COUNTRY'],DRIFT:['DRIFT_ZONE'],RACE:[]};
function routesFor(pool){return (space()?.fh6TrackPreparation?.routes||[]).filter(r=>r&&TYPES[pool]?.includes(r.type)&&r.name);}
function workload(event,mode){if(!event)return null;const n=event.cars.length;
 return mode==='FESTIVAL'?window.fh6EvilFestivalWorkload?.(n,event.ecosystem==='DRIFT'):
 window.fh6EvilRaceOffWorkload?.(n);
}
// Immutable field helper for the future launch integration. Calling this NEVER starts a race.
function freezeField(competition,mode,trackIds,random=Math.random){
 if(!competition||!MODES.includes(mode)||competition.carIds.length<2)throw Error('Not a valid event field');
 if(competition.confirmedCount!==competition.carIds.length)throw Error('Every entrant must have a confirmed specialist class');
 if(!Array.isArray(trackIds)||trackIds.length<1||trackIds.some(x=>typeof x!=='string'||!x.trim()))throw Error('Verified FH6 routes required');
 const shuffled=[...competition.carIds];for(let i=shuffled.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return Object.freeze({schema:1,mode,eventId:competition.id,name:competition.label,pool:competition.pool,
  frozenCarIds:Object.freeze(shuffled),frozenTrackIds:Object.freeze([...new Set(trackIds)]),rosterCount:shuffled.length});
}
let mode='FESTIVAL',family='ALL',selected='',draw=null,visible=40;
const shuffled=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
function activeView(){const list=getCompetitions(mode);const eligible=list.filter(e=>family==='ALL'||e.family===family);return {list,eligible,selected:eligible.find(e=>e.id===selected)||null};}
function counts(){const roster=ownedCars();return {owned:roster.length,confirmed:roster.filter(c=>classification(c).confirmed).length,
  needsReview:roster.filter(c=>classification(c).ecosystem==='UNRESOLVED').length,
  feNeedsRoute:roster.filter(c=>classification(c).ecosystem==='FORZA EDITION'&&!['ROAD','OFF-ROAD'].includes(classification(c).role)).length};}
function eventDetail(ev){if(!ev)return `<section class="fh6AdaptiveDetail"><p>Choose a competition above. It will update automatically as you tick cars in your FH6 Garage.</p></section>`;
 const ids=draw?.eventId===ev.id&&draw.signature===ev.carIds.join('|')?draw.ids:ev.carIds;
 const byId=new Map(ev.cars.map(c=>[c.id,c]));const w=workload(ev,mode);
 const routeNames=routesFor(ev.pool);const unconfirmed=ev.carIds.length-ev.confirmedCount;
 const visits=w?.visits||[];
 return `<section class="fh6AdaptiveDetail"><div class="fh6AdaptiveDetailTitle"><h2>${esc(ev.label)}</h2><strong>${ev.carIds.length} OWNED CARS</strong></div>
 <p>Roster: ${ev.confirmedCount} confirmed · ${unconfirmed} provisional. Pool: ${esc(ev.pool==='OFFROAD'?'DIRT / CROSS COUNTRY':ev.pool==='ROAD'?'ROAD / STREET':ev.pool==='DRIFT'?'DRIFT ZONES':'RACE ROUTES PENDING')}. ${routeNames.length} verified FH6 route(s) in this pool.</p>
 <div class="fh6AdaptiveWork"><strong>${mode==='FESTIVAL'?'FESTIVAL VISIT PREVIEW':'RACE OFF VISIT PREVIEW'}</strong><p>${visits.length} planned visit(s) · ${mode==='FESTIVAL'?'maximum 24 results per visit':'maximum five pairings per visit'}. ${w?.complete===false?'Only the group stage is calculated; qualifiers and finals are not invented.':''}</p>
 ${visits.slice(0,6).map(v=>`<div><span>${esc(v.stage)}</span><b>${v.entries} results</b></div>`).join('')}${visits.length>6?`<small>…plus ${visits.length-6} further visits.</small>`:''}</div>
 <div class="fh6AdaptiveOrder"><div><b>🎲 RANDOM CAR ORDER · REHEARSAL</b><button type="button" onclick="fh6AdaptiveShuffle()">RANDOMISE</button></div><ol>${ids.slice(0,30).map(id=>`<li>${esc(byId.get(id)?.full||id)}${classification(byId.get(id)).confirmed?'':' <span>· DRAFT</span>'}</li>`).join('')}</ol>${ids.length>30?`<p>Showing first 30 of ${ids.length} entrants.</p>`:''}</div>
 <div class="fh6AdaptiveLock"><b>🔒 START NOT ENABLED — FH6 PRE-LAUNCH</b><p>${unconfirmed?'Confirm the remaining car classifications in the Specialist-First Workshop. ':''}The playable race/result engine and verified routes still need the FH6 game audit. A random preview is never saved as a started competition.</p>
 <button type="button" disabled>START COMPETITION — LOCKED</button><small>When racing is enabled later, START must freeze entrants, running order and selected tracks. New cars must only affect future competitions.</small></div></section>`;
}
function render(){if(!active())return false;
 const c=counts(),v=activeView(),host=document.getElementById(mode==='FESTIVAL'?'festival':'raceoff');if(!host)return false;
 host.innerHTML=`<div class="fh6AdaptivePage"><header class="fh6AdaptiveHead"><button type="button" class="rhBack" onclick="show('home')" aria-label="Back">‹</button><div><small>OTG! / FORZA HORIZON 6</small><h1>${mode==='FESTIVAL'?'FESTIVAL':'RACE OFF'}</h1><p>GARAGE-ADAPTIVE RACING · v8.0.108</p></div></header><main class="fh6AdaptiveBody">
 <section class="fh6AdaptiveIntro"><strong>YOUR GARAGE MAKES THE COMPETITIONS</strong><p>Only your currently owned FH6 cars qualify. More cars unlock more event fields automatically. Specialist-First rules exclude race, drift, FE and off-road cars from normal road competitions.</p><div class="fh6AdaptiveStats"><div><b>${c.owned}</b><small>CARS OWNED</small></div><div><b>${c.confirmed}</b><small>CONFIRMED</small></div><div><b>${v.list.length}</b><small>AVAILABLE ${mode==='FESTIVAL'?'FESTIVALS':'RACE OFFS'}</small></div></div>
 ${c.needsReview||c.feNeedsRoute?`<p class="fh6AdaptiveCaution">${c.needsReview} owned car(s) unresolved · ${c.feNeedsRoute} FE car(s) without a confirmed route role. These are excluded from eligible event pools.</p>`:''}</section>
 <section class="fh6AdaptiveSelect"><div class="fh6AdaptiveMode"><button class="${mode==='FESTIVAL'?'on':''}" onclick="fh6AdaptiveMode('FESTIVAL')">FESTIVAL</button><button class="${mode==='RACE OFF'?'on':''}" onclick="fh6AdaptiveMode('RACE OFF')">RACE OFF</button></div><label>COMPETITION FAMILY<select onchange="fh6AdaptiveFamily(this.value)">${FAMILIES.map(x=>`<option value="${x}" ${family===x?'selected':''}>${x==='ALL'?'ALL OWNED GARAGE COMPETITIONS':x}</option>`).join('')}</select></label>
 <div class="fh6AdaptiveCards">${v.eligible.slice(0,visible).map((e,i)=>`<button type="button" class="${selected===e.id?'chosen':''}" onclick="fh6AdaptiveSelect(${i})"><span><b>${esc(e.label)}</b><small>${esc(e.family)} · ${esc(e.ecosystem)} · ${e.confirmedCount}/${e.carIds.length} classifications confirmed</small></span><strong>${e.carIds.length}</strong></button>`).join('')||`<p class="fh6AdaptiveEmpty">No ${mode==='FESTIVAL'?'Festival':'Race Off'} currently has two eligible owned cars in this category. Tick more FH6 cars in your Garage to unlock events.</p>`}</div>
 ${v.eligible.length>visible?`<button type="button" class="fh6AdaptiveMore" onclick="fh6AdaptiveMore()">SHOW MORE (${v.eligible.length-visible} LEFT)</button>`:''}</section>
 ${eventDetail(v.selected)}
 <section class="fh6AdaptiveEvil"><b>😈 EVIL LIST 2 — RETURN OF THE TWAT!</b><p>Parked until you decide your FH6 Garage is ridiculous enough. The old 715-visit blueprint remains a separate, non-playable rehearsal. There is NO Evil List 2 schedule or ownership target here.</p></section>
 <footer class="fh6AdaptiveFooter"><p>FH6 actual racing, routes and LOCATION clues remain locked until verified. No FH5 tracks are reused. FH5 Evil R1, GT7, Records, Stats and Custom Racing data are unchanged.</p><button onclick="show('garage')">OPEN FH6 GARAGE</button><button onclick="show('garage');fh6PrepOpen()">OPEN CLASSIFICATION WORKSHOP</button></footer></main></div>`;
 return true;
}
function launchFromGarage(){if(!active())return;
 const anchor=document.getElementById('fh6PlannerLaunch')||document.getElementById('fh6EvilLaunch')||document.getElementById('fh6PrepLaunch')||document.querySelector('#garage .fh6Summary');
 if(anchor&&!document.getElementById('fh6AdaptiveLaunch'))anchor.insertAdjacentHTML('afterend',`<div class="fh6AdaptiveLaunch" id="fh6AdaptiveLaunch"><div><b>FH6 GARAGE-ADAPTIVE RACING</b><p>Festival and Race Off fields grow automatically with your owned FH6 cars. Evil List 2 stays parked.</p></div><button onclick="show('festival')">OPEN GARAGE RACING ›</button></div>`);
}
window.fh6AdaptiveCompetitions=getCompetitions;
window.fh6AdaptiveFreezeField=freezeField;
window.fh6AdaptiveOwned=ownedCars;
window.fh6AdaptiveMode=x=>{if(!active())return false;mode=MODES.includes(x)?x:'FESTIVAL';selected='';draw=null;visible=40;if(typeof show==='function'){show(mode==='FESTIVAL'?'festival':'raceoff');return true;}return render();};
window.fh6AdaptiveFamily=x=>{if(!active())return false;family=FAMILIES.includes(x)?x:'ALL';selected='';draw=null;visible=40;return render();};
window.fh6AdaptiveSelect=i=>{if(!active())return false;const ev=activeView().eligible[Number(i)];if(!ev)return false;selected=ev.id;draw=null;render();document.querySelector('.fh6AdaptiveDetail')?.scrollIntoView?.({block:'nearest'});return true;};
window.fh6AdaptiveShuffle=()=>{if(!active())return false;const ev=activeView().selected;if(!ev)return false;draw={eventId:ev.id,signature:ev.carIds.join('|'),ids:shuffled(ev.carIds)};render();return true;};
window.fh6AdaptiveMore=()=>{if(!active())return false;visible+=40;return render();};
const festivalBase=window.rhRenderFestival;
window.rhRenderFestival=function(){if(active()){mode='FESTIVAL';return render();}return festivalBase?.apply(this,arguments);};
const raceOffBase=window.rhRenderRaceOff;
window.rhRenderRaceOff=function(){if(active()){mode='RACE OFF';return render();}return raceOffBase?.apply(this,arguments);};
const garageBase=window.rhRenderGarage;
window.rhRenderGarage=function(){const r=garageBase?.apply(this,arguments);launchFromGarage();return r;};
})();
