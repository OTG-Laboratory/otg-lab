/* OTG! v8.0.106 — FH6 EVIL CAMPAIGN / PRE-LAUNCH BLUEPRINT
 * Read-only planning. No FH6 track directory, draw assignment, racing result,
 * playlist, slot progress, or favourite-manufacturer freeze is created here.
 * Previous accepted FH6 catalogue and specialist decisions are authoritative.
 */
(()=>{
'use strict';
const KEY='fh6-catalogue-v1', CARS=window.FH6_CATALOGUE||[];
const ECO=['NORMAL','FORZA EDITION','DRIFT','RACE','OFF-ROAD / BUGGY'];
const POOLS={NORMAL:'ROAD / STREET · TO VERIFY','FORZA EDITION':'ROAD OR OFF-ROAD · TO VERIFY',DRIFT:'DRIFT ZONES · TO VERIFY',RACE:'RACE ROUTES · TO VERIFY','OFF-ROAD / BUGGY':'DIRT / CROSS COUNTRY · TO VERIFY'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=x=>String(x||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const own=Object.prototype.hasOwnProperty;
const ecoFor=c=>{
 const d=space()?.fh6SpecialistPrep?.decisions?.[c.id];
 if(d&&window.fh6PrepConfirmed?.(c.id))return {eco:d.ecosystem,role:d.role||null,verified:true};
 return {eco:window.fh6PrepSuggested?.(c.id)||'UNRESOLVED',role:null,verified:false};
};
function space(){const s=window.fh6Space?.();return s&&s.catalogueKey===KEY?s:null;}
function active(){return !!(space()&&typeof rhSpace==='function'&&rhSpace()?.id===space().id);}
const category=c=>{const x=ecoFor(c);return x.eco==='UNRESOLVED'?null:x;};
const favMake=()=>String(space()?.favouriteManufacturer||'').trim();
const ordered=arr=>[...arr].sort((a,b)=>a.make.localeCompare(b.make)||a.full.localeCompare(b.full)||a.id.localeCompare(b.id));
const groupBy=(cars,keyFn)=>{const m=new Map();for(const car of cars){const k=keyFn(car);if(k&&!m.has(k))m.set(k,[]);if(k)m.get(k).push(car);}return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0],undefined,{numeric:true}));};
function stageForSize(n){if(n<=2)return 'FINAL';if(n<=4)return 'SEMI-FINAL';if(n<=8)return 'QUARTER-FINAL';if(n<=16)return 'ROUND OF 16';if(n<=32)return 'ROUND OF 32';if(n<=64)return 'ROUND OF 64';if(n<=128)return 'ROUND OF 128';return `ROUND OF ${n}`;}
/* Planning workload only; unlike a real bracket, no opponents or winners are assigned. */
function raceOffWorkload(n){
 if(!Number.isInteger(n)||n<2)return {format:'KNOCKOUT',visits:[],totalPairings:0,totalVisits:0};
 let size=2;while(size*2<=n)size*=2;
 const rounds=[];if(n>size)rounds.push({name:'PRELIMINARY',pairs:n-size});
 for(let sizeNow=size;sizeNow>=2;sizeNow/=2)rounds.push({name:stageForSize(sizeNow),pairs:sizeNow/2});
 const visits=[];
 for(const stage of rounds){
  for(let start=0;start<stage.pairs;start+=5){const count=Math.min(5,stage.pairs-start);visits.push({stage:stage.name,roundPairs:stage.pairs,offset:start,pairs:count,entries:2*count});}
 }
 return {format:'KNOCKOUT',rounds,visits,totalPairings:n-1,totalVisits:visits.length};
}
function festivalWorkload(n,drift=false){
 if(!Number.isInteger(n)||n<2)return {format:'FESTIVAL',visits:[],totalVisits:0,complete:false};
 if(n>24){
  const groupCount=Math.ceil(n/8),base=Math.floor(n/groupCount),extra=n%groupCount;
  const visits=Array.from({length:groupCount},(_,i)=>{const cars=base+(i<extra?1:0);return {stage:`GROUP ${i+1}/${groupCount}`,cars,rounds:2,entries:cars*2,draws:2};});
  return {format:drift?'DRIFT GROUPS':'GROUPS',visits,totalVisits:visits.length,complete:false,explanation:'Group stage only; subsequent advancement and finals not scheduled.'};
 }
 const rounds=4,perVisit=Math.min(4,Math.floor(24/n)),visits=[];
 for(let start=0;start<rounds;start+=perVisit){const count=Math.min(rounds-start,perVisit);visits.push({stage:`ROUNDS ${start+1}–${start+count}`,cars:n,rounds:count,entries:n*count,draws:count});}
 return {format:drift?'DRIFT SCORE':'STANDARD',visits,totalVisits:visits.length,complete:true};
}
function sourceCars(mode){return ordered(CARS.filter(c=>{const x=category(c);return x&&(mode==='PROVISIONAL'||x.verified);}));}
const makeEvent=(id,name,family,eco,mode,cars,opts={})=>({id,name,family,eco,mode,ids:cars.map(c=>c.id),cars,route:opts.route||POOLS[eco],finals:!!opts.finals,slot:opts.slot||'',note:opts.note||'',blocked:!!opts.blocked});
function build(mode='PROVISIONAL'){
 const roster=sourceCars(mode),normal=roster.filter(c=>category(c)?.eco==='NORMAL');
 const specialist=(e,r)=>roster.filter(c=>{const x=category(c);return x?.eco===e&&(r==null||x.role===r);});
 const events=[],add=(...args)=>events.push(makeEvent(...args));
 const editions=(name,kind,eco,cars,family,route)=>{
  if(cars.length<2)return;
  add(`${kind}-F`,`${name} Championship`,family,eco,'FESTIVAL',cars,{route});
  add(`${kind}-R`,`${name} Race Off`,family,eco,'RACE OFF',cars,{route});
 };
 for(const [name,cars] of groupBy(normal,c=>c.make))editions(`${name} Normal`,`MAKE-${name}`,'NORMAL',cars,'MANUFACTURER',POOLS.NORMAL);
 for(const [name,cars] of groupBy(normal,c=>{
  const y=Number(c.year);return y>=1900&&y<2100?`${Math.floor(y/10)*10}s`:null;
 }))editions(`${name} Normal`,`ERA-${name}`,'NORMAL',cars,'ERA',POOLS.NORMAL);
 for(const [name,cars] of groupBy(normal,c=>c.classType))editions(`${name} Normal`,`CLASS-${name}`,'NORMAL',cars,'CLASS',POOLS.NORMAL);
 const specs=[
  ['FE-ROAD','Forza Edition Road','FORZA EDITION','ROAD','ROAD / STREET · TO VERIFY'],
  ['FE-OFFROAD','Forza Edition Off-Road','FORZA EDITION','OFF-ROAD','DIRT / CROSS COUNTRY · TO VERIFY'],
  ['DRIFT','Dedicated Drift','DRIFT',null,POOLS.DRIFT],
  ['RACE','Dedicated Race Cars','RACE',null,POOLS.RACE],
  ['OFFROAD','Off-Road / Buggy','OFF-ROAD / BUGGY',null,POOLS['OFF-ROAD / BUGGY']]
 ];
 for(const [k,n,e,r,route] of specs)editions(n,k,e,specialist(e,r),'SPECIALIST',route);
 // Preview-only Finals arrangement. The favourite is NEVER frozen or launched here.
 const fav=favMake(),favCars=fav?normal.filter(c=>c.make===fav):[];
 const favNote=fav?'Favourite remains changeable until the actual playable event first opens.':'Choose a Favourite Manufacturer in FH6 before planning entrants.';
 add('FINAL-FAV-F',fav?`${fav} Favourite Manufacturer Festival`:'Favourite Manufacturer Festival','FINALS','NORMAL','FESTIVAL',favCars,{finals:true,slot:'02',note:favNote,blocked:favCars.length<2});
 // Night 03: Forza Edition only; road and off-road entries are not merged.
 for(const [k,n,e,r,route] of specs.filter(x=>x[2]==='FORZA EDITION')){
  const cars=specialist(e,r);if(cars.length>=2)add(`FINAL-${k}`,`${n} Finals Night`,'FINALS',e,'RACE OFF',cars,{finals:true,slot:'03',route});
 }
 // Night 04: Drift Zones and score-based knockout, never circuit lap times.
 {const [k,n,e,r,route]=specs.find(x=>x[2]==='DRIFT');const cars=specialist(e,r);if(cars.length>=2)add(`FINAL-${k}`,`${n} Finals Night`,'FINALS',e,'RACE OFF',cars,{finals:true,slot:'04',route});}
 // Night 05: Favourite Race Off is not consecutive with Favourite Festival.
 add('FINAL-FAV-R',fav?`${fav} Favourite Manufacturer Race Off`:'Favourite Manufacturer Race Off','FINALS','NORMAL','RACE OFF',favCars,{finals:true,slot:'05',note:'Other Finals Nights intervene; the favourite is not frozen in this preview.',blocked:favCars.length<2});
 // Nights 06/07: other specialist finales, separate from the normal finale.
 for(const key of ['OFFROAD','RACE']){
  const [k,n,e,r,route]=specs.find(x=>x[0]===key),cars=specialist(e,r);
  if(cars.length>=2)add(`FINAL-${k}`,`${n} Finals Night`,'FINALS',e,'RACE OFF',cars,{finals:true,slot:key==='OFFROAD'?'06':'07',route});
 }
 if(normal.length>=2){add('FINAL-NORMAL-F','All Normal Cars Festival','FINALS','NORMAL','FESTIVAL',normal,{finals:true,slot:'08'});add('FINAL-NORMAL-R','All Normal Cars Race Off','FINALS','NORMAL','RACE OFF',normal,{finals:true,slot:'09'});}
 const unresolved=CARS.filter(c=>ecoFor(c).eco==='UNRESOLVED').length;
 const blockedFe=CARS.filter(c=>{const x=ecoFor(c);return x.eco==='FORZA EDITION'&&!['ROAD','OFF-ROAD'].includes(x.role);}).length;
 return {mode,events,rosterCount:roster.length,normalCount:normal.length,unresolved,blockedFe,selectedFavourite:fav,nonFinal:events.filter(e=>!e.finals).length,finals:events.filter(e=>e.finals).length};
}
const FINALS_NIGHTS=[
 ['01','Normal Era / Class Masters','Normal-car foundation; no specialists'],
 ['02','Favourite Manufacturer Festival','Frozen only when the eventual playable event is first opened'],
 ['03','Forza Edition Specialist Night','Road and off-road competition roles kept separate'],
 ['04','Drift Specialist Night','Score-based Drift Zones; never FH5 circuit times'],
 ['05','Favourite Manufacturer Race Off','Separated from Favourite Festival by two other nights'],
 ['06','Off-Road / Buggy Finale','Dedicated Dirt / Cross Country routes'],
 ['07','Dedicated Race Cars Finale','Verified competition routes only'],
 ['08','All Normal Cars Festival','Normal ecosystem only'],
 ['09','All Normal Cars Race Off','Final normal knockout; progression split at five pairs per visit']
];
/* Fisher-Yates: visual rehearsal ONLY. The original event roster is never modified. */
function shuffle(ids,random=Math.random){const a=[...ids];for(let i=a.length-1;i>0;i--){const j=Math.max(0,Math.min(i,Math.floor(random()*(i+1))));[a[i],a[j]]=[a[j],a[i]];}return a;}
/* Engine-ready pure helper, not connected to any game. Caller must supply VERIFIED FH6 routes. */
function nextNoRepeat(verifiedIds,bags,key,random=Math.random){
 if(!Array.isArray(verifiedIds)||!verifiedIds.length)return null;
 const pool=[...new Set(verifiedIds.map(String))];
 if(!bags||typeof bags!=='object')return null;
 let remaining=Array.isArray(bags[key])?bags[key].filter(x=>pool.includes(x)):[];
 if(!remaining.length)remaining=shuffle(pool,random);
 const choice=remaining.pop();bags[key]=remaining;return choice;
}
let mode='PROVISIONAL',focus='MANUFACTURER',search='',limit=30,selected='',currentDraw=null;
let stateView=null;
function workload(ev){return ev.mode==='FESTIVAL'?festivalWorkload(ev.cars.length,ev.eco==='DRIFT'):raceOffWorkload(ev.cars.length);}
function headline(ev){const w=workload(ev);if(ev.cars.length<2)return 'Not stageable (fewer than 2 eligible cars)';if(ev.mode==='FESTIVAL'&&!w.complete)return `GROUP STAGE · ${w.totalVisits} group visits minimum · final stage TBD`;if(ev.mode==='FESTIVAL')return `${w.totalVisits} visits · 4 planned rounds`;return `${w.totalVisits} visits · ${w.totalPairings} total pairings`;}
function labelMode(m){return m==='PROVISIONAL'?'DRAFT ROSTER (UNVERIFIED)':'CONFIRMED CLASSIFICATIONS ONLY';}
function renderWorkload(ev){
 const w=workload(ev),cap=ev.mode==='FESTIVAL'?'24 RESULT ENTRIES':'5 PAIRINGS';
 if(ev.cars.length<2)return `<div class="fh6EvilAlert">Not enough eligible cars in this preview. No session is created.</div>`;
 const shown=w.visits.slice(0,10);
 return `<div class="fh6EvilCalc"><b>PER-VISIT WORKLOAD · MAX ${cap}</b><div class="fh6EvilVisitRows">${shown.map((x,i)=>`<div><strong>${esc(x.stage)}${x.pairs?` · ${x.offset+1}–${x.offset+x.pairs}`:''}</strong><span>${x.pairs?`${x.pairs} pairs · ${x.entries} results`:`${x.cars} cars × ${x.rounds} round(s) = ${x.entries} results`}</span></div>`).join('')}</div>${w.visits.length>shown.length?`<small>…plus ${w.visits.length-shown.length} more equally capped visits.</small>`:''}<p>${w.complete===false?'Group stage only. Advancement, later elimination rounds and exact total await the verified FH6 race engine.':'Illustrative stage sizing, not a scheduled campaign slot or actual race.'}</p></div>`;
}
function detail(ev){
 let ids=currentDraw&&currentDraw.eventId===ev.id?currentDraw.ids:null;
 const drawn=ids&&ids.length===ev.ids.length?ids:ev.ids;
 const nameMap=new Map(ev.cars.map(c=>[c.id,c.full]));
 return `<section class="fh6EvilDetail"><div class="fh6EvilDetailHead"><div><strong>${esc(ev.name)}</strong><p>${esc(ev.route)} · ${ev.mode==='FESTIVAL'&&ev.eco==='DRIFT'?'DRIFT SCORE':esc(ev.mode)}</p></div><span>${ev.cars.length} CARS</span></div>
 ${ev.note?`<p class="fh6EvilNote">${esc(ev.note)}</p>`:''}
 <p class="fh6EvilSafety">PREVIEW ONLY · no track chosen, no results, no real draw or progress saved.</p>
 ${renderWorkload(ev)}
 <div class="fh6EvilDraw"><b>RANDOM CAR ORDER REHEARSAL</b><p>Randomise the visible sequence without changing the Garage or committing a starting grid. Tracks remain disabled until verified.</p><button type="button" onclick="fh6EvilShuffle()" ${ev.cars.length<2?'disabled':''}>🎲 RANDOMISE PREVIEW ORDER</button><ol>${drawn.slice(0,12).map(id=>`<li>${esc(nameMap.get(id)||id)}</li>`).join('')||'<li>No eligible cars yet</li>'}</ol>${drawn.length>12?`<small>First 12 of ${drawn.length}; all IDs retained uniquely.</small>`:''}</div>
 </section>`;
}
function render(){if(!active())return;
 const p=build(mode);stateView=p;
 const selectable=p.events.filter(ev=>focus==='ALL'||ev.family===focus).filter(ev=>!search||norm([ev.name,ev.eco,ev.family,ev.mode].join(' ')).includes(norm(search)));
 const list=selectable.slice(0,limit);
 const chosen=p.events.find(x=>x.id===selected)||null;
 const summary=window.fh6PrepSummary?.()||{confirmed:0,total:CARS.length,owned:0};
 const target=document.getElementById('garage');if(!target)return;
 target.innerHTML=`<div class="fh6EvilPage"><header class="fh6EvilHead"><button type="button" onclick="fh6EvilBack()" aria-label="Back to FH6 Garage">‹</button><div><small>OTG! / FORZA HORIZON 6</small><h1>EVIL BLUEPRINT</h1><p>V8.0.106 · PRE-LAUNCH PLANNING ONLY</p></div></header>
 <main class="fh6EvilBody"><section class="fh6EvilLocked"><b>🔒 NO FH6 EVIL RACES ENABLED</b><p>Track pools, Drift Zones and LOCATION clues are not verified. This is a read-only campaign programme rehearsal—not a playable event or a final slot list.</p></section>
 <section class="fh6EvilSummary"><div><strong>${p.nonFinal}</strong><span>CORE EVENT PREVIEWS</span></div><div><strong>${p.finals}</strong><span>FINALS PREVIEWS</span></div><div><strong>${p.rosterCount}</strong><span>${mode==='PROVISIONAL'?'DRAFT-CANDIDATE CARS':'CONFIRMED CARS'}</span></div></section>
 <p class="fh6EvilStatus">${summary.confirmed} / ${summary.total} confirmed · ${p.unresolved} unresolved · ${p.blockedFe} FE cars need route assignment · ${summary.owned} owned</p>
 <div class="fh6EvilSwitch"><label>PREVIEW SOURCE<select onchange="fh6EvilMode(this.value)"><option value="PROVISIONAL" ${mode==='PROVISIONAL'?'selected':''}>DRAFT — including unconfirmed hints</option><option value="CONFIRMED" ${mode==='CONFIRMED'?'selected':''}>CONFIRMED classifications only</option></select></label><p>${labelMode(mode)}. Unresolved cars never enter normal races; tentative specialists never become confirmed just by appearing here.</p></div>
 <details class="fh6EvilRules"><summary>WHAT THE EVIL CAMPAIGN WILL USE ▾</summary><p><b>Five exclusive ecosystems:</b> NORMAL, FORZA EDITION, DRIFT, RACE, OFF-ROAD / BUGGY. The specialist flag wins over Manufacturer, Era and Class.</p><p><b>Festival:</b> ≤24 results per visit. Larger fields use balanced groups of up to 8 cars, two separate route draws and a future advancement stage. <b>Race Off:</b> ≤5 knockout pairings (10 results) per visit, never crossing knockout round boundaries.</p><p><b>Random all the way:</b> car order shuffled, track/Drift Zone pool drawn without repeats within its bag; no unverified track names assigned. Drift competitions will be scored, not timed.</p><p><b>Not yet designed:</b> FH6-specific track pools, exact LOCATION clues, eligible theme definitions, exact Finals draw, final playlist sequence and slot count.</p></details>
 <section class="fh6EvilNights"><h2>FINALS NIGHTS · SEPARATED</h2>${FINALS_NIGHTS.map(([n,name,desc])=>`<div><b>${esc(n)}</b><section><strong>${esc(name)}</strong><small>${esc(desc)}</small></section></div>`).join('')}<p>Proposed night order only. The two Favourite Manufacturer events are never consecutive and will lock the current favourite only on their actual first opening, after FH6 launch.</p></section>
 <section class="fh6EvilProgramme"><h2>PROGRAMME EVENT PREVIEWS</h2><p>Manufacturer, Era and Class events are generated from the FH6 roster; proposed specialist and Finals events appear separately. These are examples, <b>not saved championship cards</b>.</p><div class="fh6EvilControls"><select aria-label="Event family" onchange="fh6EvilFamily(this.value)">${[['MANUFACTURER','MANUFACTURERS'],['ERA','ERAS'],['CLASS','CLASSES'],['SPECIALIST','SPECIALISTS'],['FINALS','FINALS'],['ALL','ALL']].map(([v,t])=>`<option value="${v}" ${focus===v?'selected':''}>${t}</option>`).join('')}</select><input type="search" placeholder="Find manufacturer, class or event" value="${esc(search)}" oninput="fh6EvilSearch(this.value)" aria-label="Search blueprint events"></div>
 <small class="fh6EvilShowing">Showing ${list.length} of ${selectable.length} matching event previews · ${labelMode(mode)}</small><div class="fh6EvilList">${list.map(ev=>`<button type="button" class="fh6EvilEvent ${selected===ev.id?'fh6EvilSelected':''}" onclick="fh6EvilSelect(${p.events.indexOf(ev)})"><span><b>${esc(ev.name)}</b><small>${esc(ev.eco)} · ${esc(ev.mode)} · ${ev.cars.length} cars</small><small>${esc(headline(ev))}</small></span><strong>VIEW ›</strong></button>`).join('')||'<p class="fh6EvilEmpty">No eligible events in this filter yet. Confirm cars in Specialist-First to populate the verified preview.</p>'}</div>
 ${selectable.length>limit?`<button type="button" class="fh6EvilMore" onclick="fh6EvilMore()">SHOW NEXT ${Math.min(30,selectable.length-limit)} EVENT PREVIEWS ▼</button>`:''}</section>
 ${chosen?detail(chosen):''}
 <div class="fh6EvilBottom"><b>NOT A PLAYABLE CAMPAIGN</b><p>All stages and nights are estimates. Real FH6 Evil R1 will be constructed only after routes, classes and Specialist-First eligibility have been verified. FH5 and GT7 remain separate.</p><button onclick="fh6EvilBack()">RETURN TO FH6 GARAGE</button></div></main></div>`;
}
function inject(){if(!active())return;
 const ref=document.querySelector('#garage #fh6PrepLaunch');
 const existing=document.getElementById('fh6EvilLaunch');
 if(ref&&!existing)ref.insertAdjacentHTML('afterend',`<div class="fh6EvilLaunch" id="fh6EvilLaunch"><div><b>FH6 EVIL CAMPAIGN BLUEPRINT</b><p>Preview the specialist-first programme, separated Finals Nights and workload caps. No FH6 race can start.</p></div><button type="button" onclick="fh6EvilOpen()">OPEN EVIL BLUEPRINT ›</button></div>`);
}
window.fh6EvilOpen=()=>{if(!active())return false;mode='PROVISIONAL';focus='MANUFACTURER';search='';limit=30;selected='';currentDraw=null;render();return true;};
window.fh6EvilBack=()=>{if(!active())return;window.rhRenderGarage?.();};
window.fh6EvilMode=x=>{mode=x==='CONFIRMED'?'CONFIRMED':'PROVISIONAL';selected='';currentDraw=null;limit=30;render();};
window.fh6EvilFamily=x=>{focus=['MANUFACTURER','ERA','CLASS','SPECIALIST','FINALS','ALL'].includes(x)?x:'MANUFACTURER';selected='';currentDraw=null;limit=30;render();};
window.fh6EvilSearch=x=>{search=String(x||'');selected='';currentDraw=null;limit=30;render();document.querySelector('.fh6EvilControls input')?.focus();};
window.fh6EvilMore=()=>{limit+=30;render();};
window.fh6EvilSelect=x=>{const match=stateView?.events[Number(x)];if(!match)return;selected=match.id;currentDraw=null;render();document.querySelector('.fh6EvilDetail')?.scrollIntoView?.({block:'nearest'});};
window.fh6EvilShuffle=()=>{const ev=stateView?.events.find(e=>e.id===selected);if(!ev||ev.cars.length<2)return;currentDraw={eventId:ev.id,ids:shuffle(ev.ids)};render();document.querySelector('.fh6EvilDetail')?.scrollIntoView?.({block:'nearest'});};
window.fh6EvilPreview=(previewMode='PROVISIONAL')=>build(previewMode==='CONFIRMED'?'CONFIRMED':'PROVISIONAL');
window.fh6EvilFestivalWorkload=festivalWorkload;
window.fh6EvilRaceOffWorkload=raceOffWorkload;
window.fh6EvilDrawBag=nextNoRepeat;
window.fh6EvilShuffleIds=shuffle;
const previousRender=window.rhRenderGarage;
window.rhRenderGarage=function(){const result=previousRender?.apply(this,arguments);inject();return result;};
})();
