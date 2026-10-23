/* OTG! v8.0.103 — active racing/navigation fixes + separate Favourite Manufacturer Finals Nights.
   - R1 is the live Evil Campaign; the Legacy 708 UI is retired in this build.
   - Exact frozen entrant IDs from the accepted R1 manifest.
   - Standard/Groups Festival, Race Off, Drag, Drift Festival and Drift Race Off are playable.
   - Slot completion is explicit and is gated by the workload actually completed.
*/
(()=>{
'use strict';
const VERSION='8.0.103';
const FH5_KEY='fh5-catalogue-v1';
const STATE_KEY='evilCampaignR18098';
const CAMPAIGN_ID='evil-specialist-r1-20261014';
const TYPE='evil-r1';
const DATA=()=>window.rhEvilSpecialistR18097||{meta:{slots:0,ecosystemCounts:{}},events:{},slots:[],cars:[],setupGuide:[],rules:[],audit:{}};
const LEGACY_OPEN=window.rhOpenEvilCampaign8076;
const E=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const same=(a,b)=>String(a??'')===String(b??'');
const now=()=>new Date().toISOString();
const clone=x=>JSON.parse(JSON.stringify(x));
function space(){try{return typeof window.rhSpace==='function'?window.rhSpace():null}catch(_){return null}}
function fh5(){return space()?.catalogueKey===FH5_KEY}
function save(){try{window.rhSave?.()}catch(_){try{rhSave()}catch(__){}}}
function toast(msg){try{window.toast?.(msg)}catch(_){} }
function host(){return document.getElementById('evilcampaign')}
function showEvil(){try{window.show?.('evilcampaign')}catch(_){document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden'));host()?.classList.remove('hidden')}}
function eventFor(s){return eventById(s?.eventId)}
function eventById(id){return favEvents()[id]||DATA().events?.[id]||null}
function slots(){return favSlots()}
function slotByNo(n){return slots().find(x=>Number(x.slot)===Number(n))||null}
function slotsForEvent(eventId){return slots().filter(x=>same(x.eventId,eventId)).sort((a,b)=>Number(a.slot)-Number(b.slot))}
function slotNo(n){return String(Number(n)||0).padStart(4,'0')}
function ecoClass(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function modeLabel(s){return String(s?.mode||'').toUpperCase()}
function oldDone(){const p=space()?.evilCampaign8076;return p?.done&&typeof p.done==='object'?Object.keys(p.done).length:0}
function liveCarMap(){const m=new Map();for(const c of space()?.cars||[])m.set(String(c.id),c);return m}
function carFallback(id){return DATA().cars.find(c=>same(c.id,id))||{id,name:id,ecosystem:'',role:''}}
function liveCarName(c,fallback){try{return typeof window.carName==='function'&&c?window.carName(c):fallback?.name||fallback?.id||'Unknown car'}catch(_){return fallback?.name||fallback?.id||'Unknown car'}}
function matchedCars(ev){const live=liveCarMap();return (ev?.eligibleIds||[]).map(id=>{const f=carFallback(id),c=live.get(String(id));return {id,name:liveCarName(c,f),live:!!c,meta:f,car:c}})}
function currentRuns(){try{return typeof rhCurrentRuns==='function'?rhCurrentRuns():(space()?.runs||[])}catch(_){return space()?.runs||[]}}
function raceOffs(){const s=space();if(s&&!Array.isArray(s.raceOffs))s.raceOffs=[];return s?.raceOffs||[]}
function rhid(prefix){try{return rhId(prefix)}catch(_){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}}
function trophy(){try{return rhTrophyTypeKey('festival')}catch(_){return 'festival'}}

function state(){
 const s=space();if(!s)return {campaignId:CAMPAIGN_ID,done:{},driftEvents:{},trackBags:{},driftBag:{remaining:[],cycle:0}};
 let p=s[STATE_KEY];
 if(!p||p.campaignId!==CAMPAIGN_ID){p={campaignId:CAMPAIGN_ID,createdAt:now(),updatedAt:now(),done:{},driftEvents:{},trackBags:{},driftBag:{remaining:[],cycle:0}};s[STATE_KEY]=p;save()}
 p.done=p.done&&typeof p.done==='object'?p.done:{};
 p.driftEvents=p.driftEvents&&typeof p.driftEvents==='object'?p.driftEvents:{};
 p.trackBags=p.trackBags&&typeof p.trackBags==='object'?p.trackBags:{};
 p.driftBag=p.driftBag&&typeof p.driftBag==='object'?p.driftBag:{remaining:[],cycle:0};
 return p;
}
/* ---------- 8.0.103: paired, separated Favourite Manufacturer Finals Nights ----------
   Build the visit schedule from the Specialist-First NORMAL audit, not broad make eligibility.
   The two events share an immutable manufacturer/entrant snapshot from their first launch.
   Every visit obeys the 24-result Festival / five-pairing Race Off caps.
   Existing 1–1148 slots keep their identifiers; R1 data and the Garage are never reset.
*/
const FAV_F='N-FAV-FINALS-F',FAV_R='N-FAV-FINALS-R';
let favCache={key:null,slots:null,events:{}};
function favSnapshot(freeze=false){
 const p=state(),sf=space(),saved=p.favouriteFinals8103;
 if(saved?.make&&Array.isArray(saved.ids))return saved;
 const make=String(sf?.favouriteManufacturer||'').trim();
 const live=new Set((sf?.cars||[]).map(c=>String(c.id)));
 const ids=make?(DATA().cars||[]).filter(c=>c.ecosystem==='NORMAL'&&String(c.make).toLocaleLowerCase()===make.toLocaleLowerCase()&&live.has(String(c.id))).map(c=>String(c.id)):[];
 if(freeze&&ids.length>=2){p.favouriteFinals8103={make,ids:[...ids],frozenAt:now(),source:'FH5 NORMAL Specialist-First snapshot'};save();favCache.key=null;return p.favouriteFinals8103}
 return {make,ids};
}
function powerOf2(n){let v=1;while(v*2<=n)v*=2;return v}
function favVisits(kind,n){
 if(n<2)return [{workload:0,liveFormat:kind==='F'?'STANDARD':'KNOCKOUT',doNow:'SELECT A FAVOURITE MANUFACTURER IN SETTINGS',stopWhen:'Select a manufacturer with at least two eligible NORMAL cars, then return here.'}];
 if(kind==='F'){
  if(n<=24){const rounds=n<=12?2:1;return [{workload:n*rounds,liveFormat:'STANDARD',doNow:`RUN ${rounds} ROAD / STREET ROUND${rounds===1?'':'S'} • ${n} NORMAL CARS`,stopWhen:`Bank ${n*rounds} results, then crown the Festival champion.`}]}
  const result=[];let field=n,stage=1;
  while(field>10){const g=Math.ceil(field/8),q=Math.floor(field/g),rem=field%g;
   for(let i=0;i<g;i++){const k=q+(i<rem?1:0);result.push({workload:2*k,liveFormat:'GROUPS',doNow:`DRAW & RUN STAGE ${stage} GROUP ${i+1}/${g} • 2 TRACKS`,stopWhen:'Run this one complete group over two random routes, bank the Top 2, then PARK IT.'})}
   field=g*2;stage++;
  }
  result.push({workload:field*2,liveFormat:'GROUPS',doNow:'RUN THE FINAL • 2 TRACKS',stopWhen:'Run the final over two Road / Street tracks and crown the Favourite Manufacturer Festival champion.'});return result;
 }
 const result=[];let remaining=n,stage=0;
 while(remaining>1){const target=powerOf2(remaining),matches=remaining===target?remaining/2:remaining-target;
  const label=remaining===2?'FINAL':remaining===4?'SEMI-FINAL':remaining===8?'QUARTER-FINAL':stage===0&&remaining!==target?'PRELIMINARY':`ROUND OF ${remaining}`;
  for(let i=0;i<matches;i+=5){const batch=Math.min(5,matches-i);result.push({workload:batch*2,liveFormat:'KNOCKOUT',doNow:`${label} • PAIRINGS ${i+1}–${i+batch} OF ${matches}`,stopWhen:`Run ${batch} pairings on the app-assigned route, then PARK IT.`})}
  remaining=remaining===target?remaining/2:target;stage++;
 }
 return result;
}
function favSlots(){
 const raw=DATA().slots||[],snap=favSnapshot(),k=`${space()?.id||''}|${snap.make}|${snap.ids.join('|')}`;
 if(favCache.key===k&&favCache.slots)return favCache.slots;
 const fvs=favVisits('F',snap.ids.length),rvs=favVisits('R',snap.ids.length);
 const mk=(kind,visits)=>visits.map((v,i)=>({
  slot:0,phase:kind==='F'?'06A • FAVOURITE MANUFACTURER FESTIVAL NIGHT':'06C • FAVOURITE MANUFACTURER RACE OFF NIGHT',
  ecosystem:'NORMAL',eventId:kind==='F'?FAV_F:FAV_R,mode:kind==='F'?'Festival':'Race Off',family:'Favourite Manufacturer',
  event:`${snap.make||'Favourite Manufacturer'} • ${kind==='F'?'Festival Night':'Race Off Night'}`,eligible:snap.ids.length,
  liveFormat:v.liveFormat,visit:`${i+1}/${visits.length}`,doNow:v.doNow,stopWhen:v.stopWhen,
  programme:kind==='F'?'RANDOMISE ALL':'AUTO ROUTE',pool:'ROAD / STREET',workload:v.workload,
  notes:'Finals Night • NORMAL cars only • selection and entrants freeze at the first Favourite event launch.'}));
 const a=raw.findIndex(x=>Number(x.slot)===1149),b=raw.findIndex(x=>Number(x.slot)===1157);
 const merged=[...raw.slice(0,a),...mk('F',fvs),...raw.slice(a,b),...mk('R',rvs),...raw.slice(b)];
 merged.forEach((s,i)=>{if(Number(s.slot)!==i+1)s={...s};merged[i]={...s,slot:i+1}});
 const make=snap.make||'Choose a manufacturer';const details='All eligible NORMAL cars only; specialist ecosystems excluded. Entrants freeze at first Favourite Finals Night launch.';
 favCache={key:k,slots:merged,events:{
  [FAV_F]:{id:FAV_F,ecosystem:'NORMAL',mode:'Festival',family:'Favourite Manufacturer',event:`${make} • Festival Night`,pool:'ROAD / STREET',formatRule:'AUTO',protectedFinale:'The Goliath',eligibilityRule:details,eligible:snap.ids.length,eligibleIds:[...snap.ids]},
  [FAV_R]:{id:FAV_R,ecosystem:'NORMAL',mode:'Race Off',family:'Favourite Manufacturer',event:`${make} • Race Off Night`,pool:'ROAD / STREET',formatRule:'KNOCKOUT',protectedFinale:'The Goliath',eligibilityRule:details,eligible:snap.ids.length,eligibleIds:[...snap.ids]}
 }};
 return merged;
}
function favEvents(){favSlots();return favCache.events}
function freezeFavouriteIfLaunch(s){
 if(![FAV_F,FAV_R].includes(s.eventId))return s;
 const x=favSnapshot();if(x.ids.length<2){toast('Choose a Favourite Manufacturer with at least two NORMAL cars in Settings.');return null}
 const old=favSnapshot(true);if(!old.make||old.ids.length<2)return null;
 return slotByNo(s.slot);
}
function done(s){return !!state().done?.[String(s.slot)]}
function counts(){const all=slots(),p=state();let n=0;for(const s of all)if(p.done?.[String(s.slot)])n++;return {done:n,total:all.length}}
function current(){return slots().find(s=>!done(s))||null}
function phaseGroups(rows=slots()){const out=[];for(const s of rows){let g=out.find(x=>x.name===s.phase);if(!g){g={name:s.phase,rows:[]};out.push(g)}g.rows.push(s)}return out}
function phaseStats(rows){let n=0;for(const s of rows)if(done(s))n++;return {done:n,total:rows.length}}
function cumulativeWorkload(s){return slotsForEvent(s.eventId).filter(x=>Number(x.slot)<=Number(s.slot)).reduce((a,x)=>a+(Number(x.workload)||0),0)}
function previousWorkload(s){return cumulativeWorkload(s)-(Number(s.workload)||0)}
function eventTotalWorkload(eventId){return slotsForEvent(eventId).reduce((a,x)=>a+(Number(x.workload)||0),0)}
function visitIndex(s){return Math.max(1,slotsForEvent(s.eventId).findIndex(x=>Number(x.slot)===Number(s.slot))+1)}
function lastVisit(s){const a=slotsForEvent(s.eventId);return a.length&&Number(a[a.length-1].slot)===Number(s.slot)}

/* ---------- exact eligibility + FH5 route hooks ---------- */
const baseEligible8098=window.rhEligible;
if(typeof baseEligible8098==='function')window.rhEligible=function(type,value){
 if(String(type)===TYPE){const ev=eventById(value),ids=new Set((ev?.eligibleIds||[]).map(String));return (space()?.cars||[]).filter(c=>ids.has(String(c.id)))}
 return baseEligible8098.apply(this,arguments);
};
try{rhEligible=window.rhEligible}catch(_){}
function categoryForEvent(ev){const pool=String(ev?.pool||'');if(pool==='OFF-ROAD')return'OFFROAD';if(pool==='RALLY ADVENTURE')return'RALLY';if(pool==='HOT WHEELS')return'HOT_WHEELS';if(pool==='DRAG')return'DRAG';return'ROAD'}
function trackPool(cat){try{return [...(window.rhFH5TrackTaxonomy8067?.standardPool?.(cat)||[])]}catch(_){return[]}}
const basePreset8098=window.rhFH5Preset8056;
if(typeof basePreset8098==='function')window.rhFH5Preset8056=function(type,value,context='festival'){
 if(String(type)===TYPE){const ev=eventById(value),cat=categoryForEvent(ev),pool=trackPool(cat);return {type,value,context,discipline:ev?.pool||'Road / Street',tracks:[...pool],pool:[...pool],raceCategory:cat,fixed:cat==='DRAG',source:`EVIL R1 • ${ev?.event||value}`}}
 return basePreset8098.apply(this,arguments);
};
const baseFinale8098=window.rhFH5Finale8058;
if(typeof baseFinale8098==='function')window.rhFH5Finale8058=function(type,value,context='festival'){
 if(String(type)===TYPE)return String(eventById(value)?.protectedFinale||'').trim()||null;
 return baseFinale8098.apply(this,arguments);
};

/* ---------- R1 Festival track shuffle bag ---------- */
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function drawTrack(cat,exclude=[]){const pool=trackPool(cat).filter(Boolean),p=state(),key=String(cat||'ROAD'),ex=new Set(exclude.map(String));if(!pool.length)return'Round';let b=p.trackBags[key];if(!b||!Array.isArray(b.remaining))b=p.trackBags[key]={remaining:[],cycle:0};let valid=b.remaining.filter(x=>pool.includes(x));if(!valid.length){valid=shuffle(pool);b.cycle=(Number(b.cycle)||0)+1}let idx=valid.findIndex(x=>!ex.has(String(x)));if(idx<0){valid=shuffle(pool);b.cycle=(Number(b.cycle)||0)+1;idx=valid.findIndex(x=>!ex.has(String(x)));if(idx<0)idx=0}const pick=valid.splice(idx,1)[0];b.remaining=valid;p.updatedAt=now();save();return pick}
function makeRound(name){return {id:rhid('round'),name:String(name||'Round'),layout:''}}
function totalStandardRounds(ev){return Math.max(1,Math.round(eventTotalWorkload(ev.id)/Math.max(1,Number(ev.eligible)||ev.eligibleIds?.length||1)))}
function targetStandardRounds(s,ev){return Math.max(1,Math.round(cumulativeWorkload(s)/Math.max(1,Number(ev.eligible)||ev.eligibleIds?.length||1)))}
function appendR1Rounds(run,s,ev){
 const need=targetStandardRounds(s,ev),total=totalStandardRounds(ev),cat=categoryForEvent(ev);run.rounds=Array.isArray(run.rounds)?run.rounds:[];
 const used=run.rounds.map(x=>x.name);while(run.rounds.length<need){const n=run.rounds.length+1,final=(n===total&&String(ev.protectedFinale||'').trim());const name=final?String(ev.protectedFinale):drawTrack(cat,used);used.push(name);run.rounds.push(makeRound(name))}
 if(run.status==='complete'&&run.results?.length<run.entries.length*run.rounds.length){run.status='active';delete run.completedAt}run.updatedAt=now();save();
}
function runFor(eventId){return [...currentRuns()].reverse().find(r=>String(r.type)===TYPE&&same(r.value,eventId)&&!r.abandonedAt)||null}
function groupCountFromEvent(eventId){const first=slotsForEvent(eventId).find(x=>x.liveFormat==='GROUPS');const m=String(first?.doNow||'').match(/GROUP\s+\d+\/(\d+)/i);return Math.max(1,Number(m?.[1])||Math.ceil((Number(eventById(eventId)?.eligible)||8)/8))}
function initialGroupRun(s,ev){
 const entries=(ev.eligibleIds||[]).filter(id=>liveCarMap().has(String(id))),cat=categoryForEvent(ev),tracks=[drawTrack(cat),drawTrack(cat)],gc=groupCountFromEvent(ev.id),sizes=(()=>{const n=entries.length,q=Math.floor(n/gc),r=n%gc;return Array.from({length:gc},(_,i)=>q+(i<r?1:0))})();
 return {id:rhid('run'),name:ev.event,type:TYPE,value:ev.id,trophy:trophy(),createdAt:now(),startedAt:now(),updatedAt:now(),status:'active',format:'groups-total-time',rounds:tracks.map(makeRound),results:[],entries:[...entries],evilCampaignR1:markerFor(s),v8Groups:{stage:1,stage1Closed:false,groupPlan:{groupCount:gc,sizes,qualifiers:gc*2},excludedStage1:[],knownStage1Eligible:[...entries],pool:[...entries],qualifiers:[],completedGroups:[],activeGroup:null,final:false,championId:null}}
}
function standardRun(s,ev){
 const entries=(ev.eligibleIds||[]).filter(id=>liveCarMap().has(String(id))),run={id:rhid('run'),name:ev.event,type:TYPE,value:ev.id,trophy:trophy(),createdAt:now(),startedAt:now(),updatedAt:now(),status:'active',rounds:[],results:[],entries:[...entries],evilCampaignR1:markerFor(s)};appendR1Rounds(run,s,ev);return run
}
function dragRun(s,ev){const entries=(ev.eligibleIds||[]).filter(id=>liveCarMap().has(String(id)));return {id:rhid('run'),name:ev.event,type:TYPE,value:ev.id,trophy:trophy(),createdAt:now(),startedAt:now(),updatedAt:now(),status:'active',rounds:[makeRound(s.programme||'Festival Drag Strip')],results:[],entries:[...entries],evilCampaignR1:markerFor(s),evilR1Drag:true}}
function ensureFestival(s){const ev=eventFor(s);if(!ev)return null;let r=runFor(ev.id);if(!r){r=s.liveFormat==='GROUPS'?initialGroupRun(s,ev):s.liveFormat==='DRAG SHOOTOUT'?dragRun(s,ev):standardRun(s,ev);space().runs=Array.isArray(space().runs)?space().runs:[];space().runs.push(r);save()}else{r.evilCampaignR1=markerFor(s);if(s.liveFormat==='STANDARD')appendR1Rounds(r,s,ev);save()}return r}

/* Make R1 group stage setups two tracks; the Final is one random track + protected finale. */
const baseStageRender8098=window.rhV8RenderStageSetup;
if(typeof baseStageRender8098==='function')window.rhV8RenderStageSetup=function(id){
 const r=currentRuns().find(x=>same(x.id,id)),p=r?.v8Groups?.pendingStageSetup;if(r?.evilCampaignR1&&p&&!p.evilR1Program8098){const ev=eventById(r.value),cat=categoryForEvent(ev),used=[...(r.rounds||[]),...(r.v8Groups?.completedGroups||[]).flatMap(g=>g.rounds||[])].map(x=>x.name);const names=p.final?[drawTrack(cat,used),String(ev?.protectedFinale||drawTrack(cat,used))]:[drawTrack(cat,used),drawTrack(cat,used)];p.rounds=names.map(makeRound);p.evilR1Program8098={version:VERSION,tracks:[...names]};p.fh5AutoProgram8070={version:'8.0.99-r1',category:cat,suggested:[...names]};p.fh5AutoProgram8058={phase:p.final?'final':'stage',source:'EVIL R1',suggested:[...names]};save()}
 return baseStageRender8098.apply(this,arguments)
};

/* Stamp R1 marker into direct and resumed Festival runs. */
function markerFor(s){return {campaignId:CAMPAIGN_ID,stateKey:STATE_KEY,slotId:`r1-${s.slot}`,slot:Number(s.slot),eventId:s.eventId,ecosystem:s.ecosystem,format:s.liveFormat,pool:s.pool,updatedAt:now()}}
function openFestivalSlot(s){try{const r=ensureFestival(s);if(!r)return toast('Unable to create R1 Festival event');r.evilCampaignR1=markerFor(s);save();try{window.show?.('festival')}catch(_){try{show('festival')}catch(__){}};if(typeof window.rhOpenRun==='function')return window.rhOpenRun(r.id);if(typeof rhOpenRun==='function')return rhOpenRun(r.id);toast('Festival screen is unavailable');}catch(err){console.error('OTG! R1 Festival launch failed',err);toast(`Festival launch failed${err?.message?`: ${err.message}`:''}`)}}

/* ---------- R1 Race Off ---------- */
function snapshotCar(c){return {sourceCarId:c.id,make:String(c.make||''),model:String(c.model||''),year:String(c.year||''),classType:String(c.classType||''),name:liveCarName(c,c)}}
function raceOffFor(eventId){return [...raceOffs()].reverse().find(r=>String(r.type)===TYPE&&same(r.value,eventId)&&r.status!=='abandoned')||null}
function createRaceOff(s,ev){const live=liveCarMap(),cars=(ev.eligibleIds||[]).map(id=>live.get(String(id))).filter(Boolean),t=now(),ro={id:rhid('raceoff'),name:ev.event,type:TYPE,value:ev.id,status:'prepared',createdAt:t,updatedAt:t,fieldLockedAt:t,entryIds:cars.map(c=>c.id),entrants:cars.map(snapshotCar),rounds:[],currentRoundIndex:0,championCarId:null,evilCampaignR1:markerFor(s)};raceOffs().push(ro);save();return ro}
function openRaceOffSlot(s){const ev=eventFor(s);let ro=raceOffFor(s.eventId);if(!ro)ro=createRaceOff(s,ev);ro.evilCampaignR1=markerFor(s);save();try{window.show?.('raceoff')}catch(_){};if(ro.status==='complete'||ro.status==='awaiting-champion'){window.rhRenderRaceOffLocked?.(ro.id);return}const idx=Number(ro.currentRoundIndex||0),rd=ro.rounds?.[idx];if(rd?.status==='drawn'||rd?.status==='racing'||rd?.status==='raced')window.rhRenderRaceOffLocked?.(ro.id);else window.rhRaceOffOpenRoundSetup?.(ro.id)}
function completedRaceOffMatches(ro){let n=0;for(const r of ro?.rounds||[])for(const m of r.matches||[])if(m.status==='complete'||m.winnerCarId)n++;return n}

/* ---------- Drift score engine ---------- */
const DRIFT_ZONES=['Punto Norte','Panorámica','Precipice','Farmland Trail','East Coast','Las Dunas','Cara Este','Esquisto','Costera','Los Campos','Las Curvas','Giro Encorvado','Ranchería','Polytunnels','Trailbreaker','Hillside','Otro Mundo','Reservoir','Arbolada','Camino De Montaña'];
function drawDriftZone(){const p=state(),b=p.driftBag;let a=(b.remaining||[]).filter(x=>DRIFT_ZONES.includes(x));if(!a.length){a=shuffle(DRIFT_ZONES);b.cycle=(Number(b.cycle)||0)+1}const z=a.shift();b.remaining=a;p.updatedAt=now();save();return z}
function driftEvent(ev,kind){const p=state();let d=p.driftEvents[ev.id];if(!d||d.kind!==kind){d=kind==='festival'?{kind,eventId:ev.id,createdAt:now(),rounds:[]}:{kind,eventId:ev.id,createdAt:now(),rounds:[],complete:false,championId:null};p.driftEvents[ev.id]=d;save()}return d}
function driftFestivalTargets(s,ev){const e=Math.max(1,ev.eligibleIds.length),from=Math.floor(previousWorkload(s)/e)+1,to=Math.round(cumulativeWorkload(s)/e);return {from,to}}
function ensureDriftFestivalRounds(s,ev){const d=driftEvent(ev,'festival'),t=driftFestivalTargets(s,ev);while(d.rounds.length<t.to)d.rounds.push({index:d.rounds.length+1,zone:drawDriftZone(),scores:{}});save();return d}
function driftFestivalDoneCount(d,s,ev){const t=driftFestivalTargets(s,ev);let n=0;for(const r of d.rounds||[])if(r.index<=t.to)for(const id of ev.eligibleIds)if(Number.isFinite(Number(r.scores?.[id])))n++;return n}
function nextDriftFestivalEntry(d,s,ev){const t=driftFestivalTargets(s,ev);for(let ri=t.from;ri<=t.to;ri++){const r=d.rounds[ri-1];for(const id of ev.eligibleIds)if(!Number.isFinite(Number(r?.scores?.[id])))return {round:r,carId:id}}return null}
function saveDriftFestivalScore(slotN){const s=slotByNo(slotN),ev=eventFor(s),d=ensureDriftFestivalRounds(s,ev),next=nextDriftFestivalEntry(d,s,ev),v=Math.floor(Number(document.getElementById('rhR1DriftScore8098')?.value));if(!next||!Number.isFinite(v)||v<0)return toast('Enter a valid drift score');next.round.scores[next.carId]=v;state().updatedAt=now();save();renderDriftFestival(s.slot)}
function driftStandings(d,ev){return ev.eligibleIds.map(id=>({id,total:(d.rounds||[]).reduce((a,r)=>a+(Number(r.scores?.[id])||0),0),rounds:(d.rounds||[]).filter(r=>Number.isFinite(Number(r.scores?.[id]))).length})).sort((a,b)=>b.total-a.total)}
function renderDriftFestival(slotN){const s=slotByNo(slotN),ev=eventFor(s),h=host();if(!s||!ev||!h)return;const d=ensureDriftFestivalRounds(s,ev),t=driftFestivalTargets(s,ev),next=nextDriftFestivalEntry(d,s,ev),target=cumulativeWorkload(s),doneN=driftFestivalDoneCount(d,s,ev),standing=driftStandings(d,ev).filter(x=>x.rounds);h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhEvilOpenR1Slot8098(${s.slot})"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097 slot"><small>EVIL R1 • DRIFT FESTIVAL</small><h1>SLOT ${slotNo(s.slot)}</h1><p>HIGHER SCORE WINS</p><strong>ROUND${t.from===t.to?'':'S'} ${t.from}${t.from===t.to?'':`–${t.to}`}</strong></header><main class="rhEvilR1Body8097"><section class="rhEvilR1ProgressCard8098"><b>${Math.min(doneN,target)} / ${target}</b><span>SCORES BANKED THROUGH THIS VISIT</span><i style="width:${Math.min(100,target?doneN/target*100:0)}%"></i></section>${next?`<section class="rhEvilR1DriftEntry8098"><small>ROUND ${next.round.index} • ${E(next.round.zone)}</small><h2>${E(liveCarName(liveCarMap().get(String(next.carId)),carFallback(next.carId)))}</h2><label>DRIFT SCORE</label><input id="rhR1DriftScore8098" inputmode="numeric" type="number" min="0" step="1" placeholder="0"><button class="btn" onclick="rhEvilSaveDriftFestival8098(${s.slot})">SAVE SCORE</button></section>`:`<section class="rhEvilR1Ready8098"><b>✓ VISIT WORKLOAD COMPLETE</b><p>All required Drift Zone scores for this slot are banked. Return to the slot and mark it DONE.</p></section>`}<section class="rhEvilR1DriftRounds8098">${d.rounds.slice(t.from-1,t.to).map(r=>`<div><b>ROUND ${r.index}</b><span>${E(r.zone)}</span><strong>${Object.keys(r.scores||{}).length}/${ev.eligibleIds.length}</strong></div>`).join('')}</section>${standing.length?`<section class="rhEvilR1DriftBoard8098"><h3>LIVE TOTALS</h3>${standing.slice(0,10).map((x,i)=>`<div><b>${i+1}</b><span>${E(liveCarName(liveCarMap().get(String(x.id)),carFallback(x.id)))}</span><strong>${x.total.toLocaleString()}</strong></div>`).join('')}</section>`:''}</main></div>`;window.scrollTo(0,0)}
window.rhEvilSaveDriftFestival8098=saveDriftFestivalScore;

function pow2Floor(n){let p=1;while(p*2<=n)p*=2;return p}
function newDriftRound(field,label){const n=field.length,target=pow2Floor(n),pre=n>target,matches=[],byes=[];if(pre){const pairCount=n-target,sh=shuffle(field);for(let i=0;i<pairCount;i++)matches.push({id:rhid('drift-match'),a:sh[i*2],b:sh[i*2+1],zone:null,scoreA:null,scoreB:null,winnerId:null});byes.push(...sh.slice(pairCount*2));return {index:1,label:'PRELIMINARY',matches,byes,complete:false}}for(let i=0;i<n;i+=2)matches.push({id:rhid('drift-match'),a:field[i],b:field[i+1],zone:null,scoreA:null,scoreB:null,winnerId:null});return {index:1,label:label||`ROUND OF ${n}`,matches,byes,complete:false}}
function driftRoundLabel(n){if(n===2)return'FINAL';if(n===4)return'SEMI-FINALS';if(n===8)return'QUARTER-FINALS';return`ROUND OF ${n}`}
function ensureDriftRaceOff(ev){const d=driftEvent(ev,'raceoff');if(!d.rounds.length)d.rounds.push(newDriftRound(shuffle([...ev.eligibleIds])));save();return d}
function allDriftMatches(d){return (d.rounds||[]).flatMap(r=>r.matches||[])}
function completedDriftMatches(d){return allDriftMatches(d).filter(m=>m.winnerId).length}
function activeDriftMatch(d){for(const r of d.rounds||[]){for(const m of r.matches||[])if(!m.winnerId)return {round:r,match:m}}return null}
function maybeAdvanceDrift(d){let r=d.rounds[d.rounds.length-1];if(!r||r.matches.some(m=>!m.winnerId))return;const field=[...(r.byes||[]),...r.matches.map(m=>m.winnerId)];r.complete=true;if(field.length===1){d.complete=true;d.championId=field[0];save();return}const matches=[];for(let i=0;i<field.length;i+=2)matches.push({id:rhid('drift-match'),a:field[i],b:field[i+1],zone:null,scoreA:null,scoreB:null,winnerId:null});d.rounds.push({index:d.rounds.length+1,label:driftRoundLabel(field.length),matches,byes:[],complete:false});save()}
function saveDriftRaceOffScore(slotN,side){const s=slotByNo(slotN),ev=eventFor(s),d=ensureDriftRaceOff(ev);maybeAdvanceDrift(d);const cur=activeDriftMatch(d);if(!cur)return renderDriftRaceOff(slotN);if(!cur.match.zone){cur.match.zone=drawDriftZone();save()}const v=Math.floor(Number(document.getElementById('rhR1DriftScore8098')?.value));if(!Number.isFinite(v)||v<0)return toast('Enter a valid drift score');if(side==='A')cur.match.scoreA=v;else cur.match.scoreB=v;if(Number.isFinite(cur.match.scoreA)&&Number.isFinite(cur.match.scoreB)){if(Number(cur.match.scoreA)===Number(cur.match.scoreB)){cur.match.scoreA=null;cur.match.scoreB=null;save();toast('Tie — rerun BOTH cars on the same Drift Zone and enter fresh scores.');return renderDriftRaceOff(slotN)}cur.match.winnerId=Number(cur.match.scoreA)>Number(cur.match.scoreB)?cur.match.a:cur.match.b;maybeAdvanceDrift(d)}save();renderDriftRaceOff(slotN)}
function renderDriftRaceOff(slotN){const s=slotByNo(slotN),ev=eventFor(s),h=host();if(!s||!ev||!h)return;const d=ensureDriftRaceOff(ev);maybeAdvanceDrift(d);const cur=activeDriftMatch(d),target=Math.round(cumulativeWorkload(s)/2),doneN=completedDriftMatches(d);if(cur&&!cur.match.zone){cur.match.zone=drawDriftZone();save()}let entry='';if(cur){const side=Number.isFinite(cur.match.scoreA)?'B':'A',cid=side==='A'?cur.match.a:cur.match.b;entry=`<section class="rhEvilR1DriftEntry8098"><small>${E(cur.round.label)} • ${E(cur.match.zone)}</small><h2>${E(liveCarName(liveCarMap().get(String(cid)),carFallback(cid)))}</h2><p>${side==='A'?'FIRST':'SECOND'} CAR • both cars use the same zone</p><label>DRIFT SCORE</label><input id="rhR1DriftScore8098" inputmode="numeric" type="number" min="0" step="1" placeholder="0"><button class="btn" onclick="rhEvilSaveDriftRaceOff8098(${s.slot},'${side}')">SAVE ${side==='A'?'FIRST':'SECOND'} SCORE</button>${Number.isFinite(cur.match.scoreA)?`<div class="rhEvilR1FirstScore8098">FIRST SCORE: <b>${Number(cur.match.scoreA).toLocaleString()}</b></div>`:''}</section>`}else if(d.complete){entry=`<section class="rhEvilR1Ready8098"><b>🏆 DRIFT RACE OFF COMPLETE</b><p>Champion: ${E(liveCarName(liveCarMap().get(String(d.championId)),carFallback(d.championId)))}</p></section>`}h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhEvilOpenR1Slot8098(${s.slot})"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097 slot"><small>EVIL R1 • DRIFT RACE OFF</small><h1>SLOT ${slotNo(s.slot)}</h1><p>HIGHER SCORE ADVANCES</p><strong>${Math.min(doneN,target)} / ${target} PAIRINGS</strong></header><main class="rhEvilR1Body8097"><section class="rhEvilR1ProgressCard8098"><b>${Math.min(doneN,target)} / ${target}</b><span>PAIRINGS COMPLETE THROUGH THIS VISIT</span><i style="width:${Math.min(100,target?doneN/target*100:0)}%"></i></section>${doneN>=target&&!d.complete?`<section class="rhEvilR1Ready8098"><b>✓ VISIT WORKLOAD COMPLETE</b><p>Stop here for this slot. The bracket is saved exactly where it is.</p></section>`:entry}<section class="rhEvilR1DriftRounds8098">${d.rounds.map(r=>`<div><b>${E(r.label)}</b><span>${(r.matches||[]).filter(m=>m.winnerId).length}/${(r.matches||[]).length} pairings</span><strong>${r.complete?'DONE':'LIVE'}</strong></div>`).join('')}</section></main></div>`;window.scrollTo(0,0)}
window.rhEvilSaveDriftRaceOff8098=saveDriftRaceOffScore;

/* ---------- R1 Groups car-order control ---------- */
function activeGroupResultCount(r,grp){
 if(!r||!grp)return 0;
 const roundIds=new Set((r.rounds||[]).map(x=>String(x.id)));
 const carIds=new Set((grp.carIds||[]).map(String));
 return (r.results||[]).filter(x=>same(x.v8GroupId,grp.id)||(carIds.has(String(x.carId))&&roundIds.has(String(x.roundId)))).length;
}
function injectRandomiseCarOrder(runId){
 const root=document.getElementById('festival'),r=currentRuns().find(x=>same(x.id,runId)),grp=r?.v8Groups?.activeGroup;
 if(!root||!r?.evilCampaignR1||r.format!=='groups-total-time'||!grp||activeGroupResultCount(r,grp)>0)return;
 const lineup=root.querySelector('.rhLineupV1');if(!lineup||lineup.querySelector('.rhEvilR1RandomOrder8100'))return;
 const btn=document.createElement('button');btn.type='button';btn.className='btn secondary rhEvilR1RandomOrder8100';btn.innerHTML='<span>↻</span><b>RANDOMISE CAR ORDER</b><small>Same group • same tracks</small>';
 btn.onclick=()=>window.rhEvilRandomiseGroupOrder8100?.(r.id);
 const head=lineup.querySelector('.rhOverviewSectionHeadV1');if(head)head.insertAdjacentElement('afterend',btn);else lineup.prepend(btn);
}
window.rhEvilRandomiseGroupOrder8100=function(runId){
 const r=currentRuns().find(x=>same(x.id,runId)),grp=r?.v8Groups?.activeGroup;if(!r?.evilCampaignR1||r.format!=='groups-total-time'||!grp)return toast('No active R1 group to randomise');
 if(activeGroupResultCount(r,grp)>0)return toast('Car order is locked after the first result is banked.');
 grp.carIds=shuffle(grp.carIds||[]);grp.randomisedAt=now();r.updatedAt=now();save();
 try{window.rhOpenRun?.(r.id)}catch(_){try{rhOpenRun(r.id)}catch(__){}}
};

/* ---------- workload readiness ---------- */
function progressFor(s){const ev=eventFor(s),target=cumulativeWorkload(s);if(ev&&[FAV_F,FAV_R].includes(s.eventId)&&ev.eligibleIds.length<2)return {done:0,target:0,ready:false,label:'ENTRIES'};if(!ev)return {done:0,target,ready:false,label:'ENTRIES'};if(s.liveFormat==='DRIFT SCORE'){const d=state().driftEvents[ev.id];const n=d?driftFestivalDoneCount(d,s,ev):0;return {done:n,target,ready:n>=target,label:'SCORES'}}if(s.liveFormat==='DRIFT KNOCKOUT'){const d=state().driftEvents[ev.id],n=d?completedDriftMatches(d)*2:0;return {done:n,target,ready:n>=target,label:'SCORE ENTRIES'}}if(s.mode==='Race Off'){const ro=raceOffFor(ev.id),n=completedRaceOffMatches(ro)*2;return {done:n,target,ready:n>=target,label:'RESULT ENTRIES'}}const r=runFor(ev.id),n=Array.isArray(r?.results)?r.results.length:0;return {done:n,target,ready:n>=target,label:'RESULT ENTRIES'}}
function actionLabel(s){if(s.liveFormat==='DRIFT SCORE')return state().driftEvents[s.eventId]?'CONTINUE DRIFT FESTIVAL':'START DRIFT FESTIVAL';if(s.liveFormat==='DRIFT KNOCKOUT')return state().driftEvents[s.eventId]?'CONTINUE DRIFT RACE OFF':'START DRIFT RACE OFF';if(s.mode==='Race Off')return raceOffFor(s.eventId)?'CONTINUE RACE OFF':'START RACE OFF';return runFor(s.eventId)?'CONTINUE FESTIVAL':'START FESTIVAL'}
function launchSlot(n){const s=slotByNo(n);if(!s)return;const cur=current();if(!done(s)&&cur&&Number(cur.slot)!==Number(s.slot))return toast(`Finish Slot ${slotNo(cur.slot)} first — R1 unlocks in order.`);const frozen=freezeFavouriteIfLaunch(s);if(!frozen)return;const ev=eventFor(frozen);if(!ev)return toast('R1 event definition not found');if(frozen.liveFormat==='DRIFT SCORE')return renderDriftFestival(n);if(frozen.liveFormat==='DRIFT KNOCKOUT')return renderDriftRaceOff(n);if(frozen.mode==='Race Off')return openRaceOffSlot(frozen);return openFestivalSlot(frozen)}
window.rhEvilLaunchR1Slot8098=launchSlot;
function setStatus(n,want){const s=slotByNo(n);if(!s)return;const p=state();if(want==='done'){const cur=current();if(cur&&Number(cur.slot)!==Number(s.slot))return toast(`Slot ${slotNo(cur.slot)} is the current R1 slot.`);const pr=progressFor(s);if(!pr.ready)return toast(`Finish this slot first — ${Math.min(pr.done,pr.target)} / ${pr.target} ${pr.label.toLowerCase()} are banked.`);p.done[String(s.slot)]={doneAt:now(),eventId:s.eventId,workload:Number(s.workload)||0};p.updatedAt=now();save();repaintHome();return renderNextUp(n)}delete p.done[String(s.slot)];p.updatedAt=now();save();renderSlot(n);repaintHome()}
window.rhEvilSetR1Status8098=setStatus;

/* ---------- R1 UI ---------- */
function tileHtml(){const m=DATA().meta,c=counts(),cur=current();return `<button class="v7DashTile evil8097" onclick="rhOpenEvilCampaignR18098()"><i aria-hidden="true">!</i><span><b>EVIL CAMPAIGN</b><small><span>${c.done} / ${c.total} COMPLETE</span><span>${cur?`NEXT • SLOT ${slotNo(cur.slot)}`:'R1 COMPLETE'}</span></small></span><em aria-hidden="true">›</em></button>`}
function injectTile(){if(!fh5())return;const grid=document.querySelector('#home .v7DashGrid');if(!grid)return;grid.querySelectorAll('.v7DashTile.evil8076,.v7DashTile.evil8097').forEach(x=>x.remove());const festival=grid.querySelector('.v7DashTile.festival');if(festival)festival.classList.remove('wide');if(festival)festival.insertAdjacentHTML('afterend',tileHtml());else grid.insertAdjacentHTML('afterbegin',tileHtml())}
const baseHome8098=window.rhRenderHome;if(typeof baseHome8098==='function')window.rhRenderHome=function(){const out=baseHome8098.apply(this,arguments);injectTile();return out};
function repaintHome(){const h=document.getElementById('home');if(h&&!h.classList.contains('hidden')&&typeof window.rhRenderHome==='function')window.rhRenderHome()}
function summaryCards(){const c=DATA().meta.ecosystemCounts||{};return `<section class="rhEvilR1Split8097"><div class="normal"><b>${c.NORMAL||0}</b><span>NORMAL</span></div><div class="fe"><b>${c['FORZA EDITION']||0}</b><span>FORZA EDITION</span></div><div class="drift"><b>${c.DRIFT||0}</b><span>DRIFT</span></div><div class="race"><b>${c.RACE||0}</b><span>RACE</span></div><div class="offroad"><b>${c['OFF-ROAD / BUGGY']||0}</b><span>OFF-ROAD / BUGGY</span></div></section>`}
function actionStrip(){return `<section class="rhEvilR1Actions8097"><button onclick="rhEvilR1SetupGuide8098()"><span>🔧</span><b>SETUP GUIDE</b><small>Permanent shopping/loadout reference</small></button><button onclick="rhEvilR1Cars8098()"><span>🚗</span><b>CAR CLASSIFICATION</b><small>Inspect all 697 specialist assignments</small></button><button onclick="rhEvilR1Audit8098()"><span>✓</span><b>R1 AUDIT</b><small>Counts, caps and live QA state</small></button></section>`}
function mainNextUp8101(s){if(!s)return `<section class="rhEvilR1MainNext8101 complete"><div><small>CAMPAIGN STATUS</small><h2>R1 COMPLETE</h2><p>All ${counts().total} Specialist-First slots are marked done.</p></div></section>`;const pr=progressFor(s),started=pr.done>0,label=started?'CONTINUE CURRENT EVENT':'GO TO NEXT EVENT';return `<section class="rhEvilR1MainNext8101 eco-${ecoClass(s.ecosystem)}"><div class="rhEvilR1MainNextHead8101"><span><small>NEXT UP • SLOT ${slotNo(s.slot)}</small><h2>${E(s.event)}</h2><p>${E(modeLabel(s))} • ${E(s.liveFormat)} • VISIT ${E(s.visit)} • ${s.workload} RESULT ENTRIES</p></span><strong>${E(s.ecosystem)}</strong></div><div class="rhEvilR1MainNextDo8101"><small>DO THIS ${started?'NOW':'NEXT'}</small><b>${E(s.doNow)}</b>${pr.done?`<span>${Math.min(pr.done,pr.target)} / ${pr.target} ${E(pr.label.toLowerCase())} already banked</span>`:''}</div><div class="rhEvilR1MainNextActions8101"><button class="btn" onclick="rhEvilLaunchR1Slot8098(${Number(s.slot)})">${label}</button><button class="btn secondary" onclick="rhEvilOpenR1Slot8098(${Number(s.slot)})">VIEW SLOT</button></div></section>`}
function slotState(s){if(done(s))return'done';const cur=current();return cur&&Number(cur.slot)===Number(s.slot)?'current':'todo'}
function slotRow(s){const st=slotState(s),pr=progressFor(s);return `<button class="rhEvilR1Row8097 rhEvilR1RowState8098 ${st} eco-${ecoClass(s.ecosystem)}" onclick="rhEvilOpenR1Slot8098(${Number(s.slot)})"><i>${slotNo(s.slot)}</i><span><b>${E(s.event)}</b><small>${E(modeLabel(s))} • ${E(s.liveFormat)} • VISIT ${E(s.visit)}${pr.done?` • ${Math.min(pr.done,pr.target)}/${pr.target} BANKED`:''}</small></span><strong>${st==='done'?'DONE':st==='current'?'NOW':Number(s.workload)||0}<small>${st==='done'?'':st==='current'?'CURRENT':'ENTRIES'}</small></strong><em>›</em></button>`}
function renderList(q=''){const target=document.getElementById('rhEvilR1List8098');if(!target)return;const text=String(q||'').trim().toLowerCase(),all=slots();if(text){const rows=all.filter(s=>`${s.slot} ${s.phase} ${s.ecosystem} ${s.eventId} ${s.mode} ${s.family} ${s.event} ${s.liveFormat} ${s.pool} ${s.doNow}`.toLowerCase().includes(text));target.innerHTML=`<div class="rhEvilR1SearchCount8097"><b>${rows.length}</b> MATCHING SLOTS</div>${rows.slice(0,250).map(slotRow).join('')}`;return}const cur=current();target.innerHTML=phaseGroups(all).map(g=>{const pc=phaseStats(g.rows),open=cur&&g.rows.some(x=>Number(x.slot)===Number(cur.slot))?'open':'';return `<details class="rhEvilR1Phase8097" ${open}><summary><span><b>${E(g.name)}</b><small>${pc.done}/${pc.total} DONE</small></span><em>⌄</em></summary><div>${g.rows.map(slotRow).join('')}</div></details>`}).join('')}
window.rhEvilR1Search8098=v=>renderList(v);
function renderMain(){const h=host();if(!h)return;const m=DATA().meta,c=counts(),cur=current();h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="show('home')"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>ANDY • FH5 • R1</small><h1>EVIL CAMPAIGN</h1><p>SPECIALIST-FIRST REBUILD</p><strong>LIVE R1 • v8.0.103</strong></header><main class="rhEvilR1Body8097"><section class="rhEvilR1Safety8097 setup"><b>R1 IS THE LIVE EVIL CAMPAIGN</b><p>Reset Racing Data now clears R1 progress along with Championships, results, Records, Track counters, Stats and Car History-derived racing data. Garage ownership remains untouched.</p></section><section class="rhEvilR1Stats8097"><div><small>R1 PROGRESS</small><b>${c.done}</b><span>/ ${c.total} DONE</span></div><div><small>NEXT SLOT</small><b>${cur?slotNo(cur.slot):'✓'}</b><span>${cur?'CURRENT':'COMPLETE'}</span></div><div><small>EVENT CARDS</small><b>${m.eventCards+2}</b><span>EXACT FIELDS</span></div><div><small>MAX WORKLOAD</small><b>${m.maxWorkload}</b><span>RESULT ENTRIES</span></div></section>${mainNextUp8101(cur)}${summaryCards()}${actionStrip()}<section class="rhEvilR1Intro8097"><div><small>THE LIST</small><h2>${slots().length} SLOTS</h2></div><p>More slots, smaller bites. Two separated Favourite Manufacturer Finals Nights are added with capped visits; Reset Racing Data returns R1 to Slot 0001 without touching Garage ownership.</p></section><section class="rhEvilR1Search8097"><input type="search" placeholder="Search slot, event, format…" oninput="rhEvilR1Search8098(this.value)"></section><div id="rhEvilR1List8098"></div></main></div>`;renderList('');window.scrollTo(0,0)}
window.rhOpenEvilCampaignR18098=function(){if(!fh5())return toast('Evil Campaign is available in the Forza Horizon 5 Space');showEvil();renderMain()};window.rhRenderEvilCampaignR18098=renderMain;
function setupForSlot(s){let key='NORMAL / ROAD';if(s.ecosystem==='RACE')key='RACE';else if(s.ecosystem==='OFF-ROAD / BUGGY')key='OFF-ROAD / BUGGY';else if(s.ecosystem==='DRIFT')key='DRIFT';else if(s.ecosystem==='FORZA EDITION')key='FORZA EDITION';return (DATA().setupGuide||[]).find(r=>String(r?.[0])===key)||null}
function setupMini(s){const x=setupForSlot(s);if(!x)return'';return `<section class="rhEvilR1SetupMini8097"><small>RECOMMENDED MAIN SETUP</small><h3>${E(x[0])}</h3><div><b>TYRES</b><span>${E(x[1])}</span></div><div><b>CHASSIS</b><span>${E(x[2])}</span></div><div><b>DRIVETRAIN</b><span>${E(x[3])}</span></div>${s.pool==='DRAG'?'<p><strong>DRAG EXCEPTION:</strong> temporary drag loadout for this slot, then return to the main ecosystem setup.</p>':''}</section>`}
function eligibleHtml(ev){const cars=matchedCars(ev);return `<details class="rhEvilR1Eligible8097"><summary><span><b>EXACT ELIGIBLE FIELD</b><small>${cars.length} cars • frozen from your live Garage snapshot</small></span><em>⌄</em></summary><div class="rhEvilR1EligibleList8097">${cars.map((x,i)=>`<div class="${x.live?'':'missing'}"><i>${String(i+1).padStart(3,'0')}</i><span><b>${E(x.name)}</b><small>${E(x.meta.ecosystem)} • ${E(x.meta.role)}${x.live?'':' • NOT IN CURRENT GARAGE'}</small></span></div>`).join('')}</div></details>`}
function renderSlot(n){const s=slotByNo(n),h=host();if(!s||!h)return renderMain();const ev=eventFor(s),st=slotState(s),pr=progressFor(s),pct=Math.min(100,pr.target?pr.done/pr.target*100:0),isDone=done(s);h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097 slot"><small>${st==='done'?'DONE':st==='current'?'CURRENT SLOT':'R1 SLOT'} • ${E(s.ecosystem)}</small><h1>SLOT ${slotNo(s.slot)}</h1><p>${E(modeLabel(s))}</p><strong>${E(s.liveFormat)}</strong></header><main class="rhEvilR1Body8097"><section class="rhEvilR1SlotCard8097 eco-${ecoClass(s.ecosystem)}"><small>${E(s.family)} • ${E(s.eventId)}</small><h2>${E(s.event)}</h2><div><span>${s.eligible} CARS</span><span>${E(s.pool)}</span><span>VISIT ${E(s.visit)}</span><span>${s.workload} RESULT ENTRIES</span></div></section><section class="rhEvilR1Instruction8097"><small>DO THIS NOW</small><h3>${E(s.doNow)}</h3><p>${E(s.stopWhen)}</p></section><section class="rhEvilR1ProgressCard8098"><b>${Math.min(pr.done,pr.target)} / ${pr.target}</b><span>${E(pr.label)} BANKED THROUGH THIS VISIT</span><i style="width:${pct}%"></i></section><section class="rhEvilR1Programme8097"><small>PROGRAMME</small><h3>${E(s.programme)}</h3><p>${ev?.protectedFinale?`Protected finale: <strong>${E(ev.protectedFinale)}</strong>. `:''}${E(ev?.eligibilityRule||'')}</p></section>${[FAV_F,FAV_R].includes(s.eventId)?`<section class="rhEvilR1Note8097"><small>FINALS NIGHT SELECTION</small><p>${E(favSnapshot().make||'Choose Favourite Manufacturer in Settings first')} • ${ev?.eligibleIds?.length||0} eligible NORMAL cars. Festival and Race Off are separate, non-consecutive Finals Nights. Manufacturer and entrants freeze on first launch; every visit respects workload limits.</p></section>`:''}${s.notes?`<section class="rhEvilR1Note8097"><small>CAMPAIGN NOTE</small><p>${E(s.notes)}</p></section>`:''}${setupMini(s)}${ev?eligibleHtml(ev):''}<section class="rhEvilR1LiveActions8098"><button class="btn" onclick="rhEvilLaunchR1Slot8098(${s.slot})">${E(actionLabel(s))}</button>${isDone?`<button class="btn" onclick="rhEvilR1NextUp8100(${s.slot})">NEXT UP</button><button class="btn secondary" onclick="rhEvilSetR1Status8098(${s.slot},'todo')">MARK AS TODO</button>`:`<button class="btn ${pr.ready?'':'secondary'}" ${pr.ready?'': 'disabled'} onclick="rhEvilSetR1Status8098(${s.slot},'done')">${pr.ready?'MARK SLOT DONE':`LOCKED • ${Math.max(0,pr.target-pr.done)} TO GO`}</button>`}</section>${pr.ready&&!isDone?'<section class="rhEvilR1Ready8098"><b>✓ SLOT WORKLOAD COMPLETE</b><p>The required work is banked. Mark the slot DONE when you are happy.</p></section>':''}</main></div>`;window.scrollTo(0,0)}
window.rhEvilOpenR1Slot8098=renderSlot;

/* ---------- NEXT UP handoff ---------- */
function renderNextUp(completedSlotNo){
 const completed=slotByNo(completedSlotNo),h=host();if(!h)return;
 const next=current();showEvil();
 if(!next){h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>R1 SLOT ${slotNo(completedSlotNo)} DONE</small><h1>CAMPAIGN COMPLETE</h1><p>NO NEXT SLOT</p><strong>${counts().done} / ${counts().total} DONE</strong></header><main class="rhEvilR1Body8097"><section class="rhEvilR1Ready8098"><b>✓ EVIL R1 COMPLETE</b><p>There are no unresolved Specialist-First slots left.</p></section><section class="rhEvilR1LiveActions8098"><button class="btn" onclick="rhRenderEvilCampaignR18098()">RETURN TO EVIL CAMPAIGN</button></section></main></div>`;window.scrollTo(0,0);return;}
 const ev=eventFor(next),pr=progressFor(next);
 h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>SLOT ${slotNo(completedSlotNo)} DONE</small><h1>NEXT UP</h1><p>SLOT ${slotNo(next.slot)}</p><strong>${E(modeLabel(next))} • ${E(next.liveFormat)}</strong></header><main class="rhEvilR1Body8097">${completed?`<section class="rhEvilR1Ready8098"><b>✓ SLOT ${slotNo(completed.slot)} BANKED</b><p>${E(completed.event)} is marked DONE. R1 has unlocked the next slot.</p></section>`:''}<section class="rhEvilR1SlotCard8097 eco-${ecoClass(next.ecosystem)}"><small>${E(next.family)} • ${E(next.eventId)}</small><h2>${E(next.event)}</h2><div><span>${next.eligible} CARS</span><span>${E(next.pool)}</span><span>VISIT ${E(next.visit)}</span><span>${next.workload} RESULT ENTRIES</span></div></section><section class="rhEvilR1Instruction8097"><small>DO THIS NEXT</small><h3>${E(next.doNow)}</h3><p>${E(next.stopWhen)}</p></section><section class="rhEvilR1Programme8097"><small>PROGRAMME</small><h3>${E(next.programme)}</h3><p>${ev?.protectedFinale?`Protected finale: <strong>${E(ev.protectedFinale)}</strong>. `:''}${E(ev?.eligibilityRule||'')}</p></section><section class="rhEvilR1LiveActions8098 rhEvilR1NextActions8100"><button class="btn" onclick="rhEvilLaunchR1Slot8098(${next.slot})">GO TO NEXT EVENT</button><button class="btn secondary" onclick="rhEvilOpenR1Slot8098(${next.slot})">VIEW NEXT SLOT</button><button class="btn secondary" onclick="rhRenderEvilCampaignR18098()">BACK TO CAMPAIGN LIST</button></section>${pr.done?`<section class="rhEvilR1Note8097"><small>RESUMABLE</small><p>${Math.min(pr.done,pr.target)} / ${pr.target} ${E(pr.label.toLowerCase())} are already banked for this visit.</p></section>`:''}</main></div>`;window.scrollTo(0,0);
}
window.rhEvilR1NextUp8100=renderNextUp;

/* ---------- reference screens ---------- */
window.rhEvilR1SetupGuide8098=function(){const h=host(),rows=DATA().setupGuide||[];if(!h)return;h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>R1 REFERENCE</small><h1>SETUP GUIDE</h1><p>BUY ONCE • STOP FAFFING</p></header><main class="rhEvilR1Body8097"><section class="rhEvilR1Safety8097 setup"><b>BASELINE, NOT A COMPULSORY MAX BUILD</b><p>Chassis/control first. Preserve original drivetrain by default. Drag is the temporary exception.</p></section><div class="rhEvilR1GuideGrid8097">${rows.map(r=>`<section><small>${E(r[0])}</small><h2>${E(r[5]||r[0])}</h2><div><b>TYRES</b><span>${E(r[1])}</span></div><div><b>SUSPENSION / CHASSIS</b><span>${E(r[2])}</span></div><div><b>DRIVETRAIN</b><span>${E(r[3])}</span></div><div><b>POWER / WEIGHT</b><span>${E(r[4])}</span></div></section>`).join('')}</div></main></div>`;window.scrollTo(0,0)};
let carFilterEco='ALL';function renderCars(q=''){const box=document.getElementById('rhEvilR1CarsList8098');if(!box)return;const text=String(q||'').trim().toLowerCase(),rows=(DATA().cars||[]).filter(c=>(carFilterEco==='ALL'||c.ecosystem===carFilterEco)&&(!text||`${c.name} ${c.make} ${c.model} ${c.year} ${c.classType} ${c.ecosystem} ${c.role}`.toLowerCase().includes(text)));box.innerHTML=`<div class="rhEvilR1SearchCount8097"><b>${rows.length}</b> MATCHING CARS</div>${rows.map(c=>`<div class="rhEvilR1CarRow8097 eco-${ecoClass(c.ecosystem)}"><span><b>${E(c.name)}</b><small>${E(c.classType)} • ${E(c.role)} • ${E(c.confidence)} CONFIDENCE</small></span><strong>${E(c.ecosystem)}</strong><details><summary>WHY?</summary><p>${E(c.basis)}</p></details></div>`).join('')}`}
window.rhEvilR1CarsFilter8098=v=>renderCars(v);window.rhEvilR1CarsEco8098=function(v){carFilterEco=v;document.querySelectorAll('.rhEvilR1EcoTabs8097 button').forEach(b=>b.classList.toggle('active',b.dataset.eco===v));renderCars(document.getElementById('rhEvilR1CarSearch8098')?.value||'')};window.rhEvilR1Cars8098=function(){const h=host();if(!h)return;carFilterEco='ALL';const ecos=['ALL','NORMAL','FORZA EDITION','DRIFT','RACE','OFF-ROAD / BUGGY'];h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>697-CAR AUDIT</small><h1>CAR CLASSIFICATION</h1><p>ONE SPECIALIST HOME PER CAR</p></header><main class="rhEvilR1Body8097"><section class="rhEvilR1Search8097"><input id="rhEvilR1CarSearch8098" type="search" placeholder="Search car, make, class or role…" oninput="rhEvilR1CarsFilter8098(this.value)"></section><div class="rhEvilR1EcoTabs8097">${ecos.map(x=>`<button data-eco="${E(x)}" class="${x==='ALL'?'active':''}" onclick="rhEvilR1CarsEco8098('${E(x)}')">${E(x)}</button>`).join('')}</div><div id="rhEvilR1CarsList8098"></div></main></div>`;renderCars('');window.scrollTo(0,0)};
window.rhEvilR1Audit8098=function(){const h=host(),a=DATA().audit||{},rules=DATA().rules||[];if(!h)return;const checks=[['GARAGE CARS',a['Garage cars'],697],['OWNED MATCHED',a['Owned cars matched'],697],['EVENT CARDS',a['Event cards']+2,230],['CAMPAIGN SLOTS',slots().length,slots().length],['MAX WORKLOAD',a['Max workload entries per slot'],'≤ 24'],['MAX RACE OFF PAIRINGS',a['Max Race Off pairings per slot'],'≤ 5'],['UNCOVERED CARS',a['Uncovered cars'],0],['BAD EVENTS',a['Bad events under 2 entrants'],0],['DUPLICATE EVENT IDS',a['Duplicate event IDs'],0],['SLOT NUMBERING',a['Slot numbering contiguous'],'YES']];h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>PLAYABLE QA</small><h1>R1 AUDIT</h1><p>MECHANICAL CHECKS + LOCKED RULES</p></header><main class="rhEvilR1Body8097"><div class="rhEvilR1AuditChecks8097">${checks.map(x=>`<div><span>${E(x[0])}</span><b>${E(x[1])}</b><small>EXPECTED ${E(x[2])}</small></div>`).join('')}</div><section class="rhEvilR1Rules8097"><h2>LOCKED BUILD RULES</h2>${rules.map(r=>`<div><b>${E(r[0])}</b><strong>${E(r[1])}</strong><p>${E(r[2])}</p></div>`).join('')}</section></main></div>`;window.scrollTo(0,0)};
window.rhEvilOpenLegacy8098=function(){if(typeof LEGACY_OPEN!=='function')return toast('Legacy campaign viewer is unavailable');LEGACY_OPEN()};

/* ---------- Return-to-R1 bridge ---------- */
function injectReturn(screenId,marker){const root=document.getElementById(screenId);if(!root||!marker||root.querySelector('.rhEvilR1Return8098'))return;const b=document.createElement('button');b.className='rhEvilR1Return8098';b.innerHTML=`↩ EVIL R1 • SLOT ${slotNo(marker.slot)}`;b.onclick=()=>{showEvil();renderSlot(marker.slot)};root.appendChild(b)}
const baseOpenRun8098=window.rhOpenRun;if(typeof baseOpenRun8098==='function')window.rhOpenRun=function(id){const out=baseOpenRun8098.apply(this,arguments),r=currentRuns().find(x=>same(x.id,id));if(r?.evilCampaignR1)setTimeout(()=>{injectReturn('festival',r.evilCampaignR1);injectRandomiseCarOrder(id)},0);return out};
for(const name of ['rhRaceOffOpenRoundSetup','rhRaceOffRenderDrawReview','rhRaceOffRenderDrawComplete','rhRaceOffRenderRoundProgress','rhRaceOffEnterNext','rhRenderRaceOffLocked','rhRaceOffRenderChampion']){const base=window[name];if(typeof base==='function')window[name]=function(){const out=base.apply(this,arguments),id=arguments[0],ro=raceOffs().find(x=>same(x.id,id));if(ro?.evilCampaignR1)setTimeout(()=>injectReturn('raceoff',ro.evilCampaignR1),0);return out}}

/* Reset Racing Data / Full Reset: R1 and the retired Legacy campaign are racing data.
   v8.0.102 attaches AFTER v8.0.66 replaces the approved confirmation button; cloneNode does
   not preserve event listeners, which is why the earlier immediate R1 hook was lost. */
function clearEvilCampaignStates8102(){const s=space();if(!s)return;delete s[STATE_KEY];delete s.evilCampaign8076;save()}
function addEvilResetListener8102(){const b=document.getElementById('rhResetConfirm6090');if(!b||b.dataset.rhEvilReset8102)return;b.dataset.rhEvilReset8102='1';b.addEventListener('click',clearEvilCampaignStates8102,{once:true})}
const baseResetConfirm8102=window.rhResetConfirm;if(typeof baseResetConfirm8102==='function')window.rhResetConfirm=function(){const out=baseResetConfirm8102.apply(this,arguments);setTimeout(addEvilResetListener8102,0);return out};
const baseFullResetConfirm8102=window.rhFullResetConfirm;if(typeof baseFullResetConfirm8102==='function')window.rhFullResetConfirm=function(){const out=baseFullResetConfirm8102.apply(this,arguments);setTimeout(addEvilResetListener8102,0);return out};
/* Also cover any direct reset-final invocation that bypasses the approved confirmation screen. */
const baseResetRacingFinal8102=window.rhResetRacingFinal;if(typeof baseResetRacingFinal8102==='function')window.rhResetRacingFinal=function(){const out=baseResetRacingFinal8102.apply(this,arguments);clearEvilCampaignStates8102();return out};
const baseFullResetFinal8102=window.rhFullResetFinal;if(typeof baseFullResetFinal8102==='function')window.rhFullResetFinal=function(){const out=baseFullResetFinal8102.apply(this,arguments);clearEvilCampaignStates8102();return out};
window.rhClearEvilCampaignStates8102=clearEvilCampaignStates8102;

window.rhEvilR1Report8098=()=>({version:VERSION,campaignId:CAMPAIGN_ID,stateKey:STATE_KEY,counts:counts(),legacyDone:oldDone(),events:Object.keys(DATA().events||{}).length,slots:slots().length,cars:(DATA().cars||[]).length,driftZones:DRIFT_ZONES.length});
repaintHome();
window.rhEvilR1QA8103={slots:()=>slots().map(x=>({...x})),events:()=>({...favEvents()}),favourite:()=>({...favSnapshot(),ids:[...favSnapshot().ids]}),readiness:(n)=>progressFor(slotByNo(n))};
})();
