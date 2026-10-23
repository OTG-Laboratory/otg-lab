/* OTG! v8.0.97 — FH5 Evil Campaign Specialist-First R1 PREVIEW.
   Safety rule for this build: read-only preview. No R1 campaign progress, race results,
   Garage ownership, or legacy 708-slot campaign state is written or reset here.
*/
(()=>{
'use strict';
const VERSION='8.0.97';
const FH5_KEY='fh5-catalogue-v1';
const DATA=()=>window.rhEvilSpecialistR18097||{meta:{slots:0,ecosystemCounts:{}},events:{},slots:[],cars:[],setupGuide:[],rules:[],audit:{}};
const LEGACY_OPEN=window.rhOpenEvilCampaign8076;
const LEGACY_RENDER=window.rhRenderEvilCampaign8076;
const E=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const same=(a,b)=>String(a??'')===String(b??'');
function space(){try{return typeof window.rhSpace==='function'?window.rhSpace():null}catch(_){return null}}
function fh5(){return space()?.catalogueKey===FH5_KEY}
function host(){return document.getElementById('evilcampaign')}
function showEvil(){try{window.show?.('evilcampaign')}catch(_){document.querySelectorAll('.screen').forEach(x=>x.classList.add('hidden'));host()?.classList.remove('hidden')}}
function oldDone(){const p=space()?.evilCampaign8076;return p?.done&&typeof p.done==='object'?Object.keys(p.done).length:0}
function phaseGroups(rows=DATA().slots){const out=[];for(const s of rows){let g=out.find(x=>x.name===s.phase);if(!g){g={name:s.phase,rows:[]};out.push(g)}g.rows.push(s)}return out}
function ecoClass(v){return String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function modeLabel(s){return String(s.mode||'').toUpperCase()}
function slotNo(n){return String(Number(n)||0).padStart(4,'0')}
function carFallback(id){return DATA().cars.find(c=>same(c.id,id))||{id,name:id,ecosystem:'',role:''}}
function liveCarMap(){const m=new Map();for(const c of space()?.cars||[])m.set(String(c.id),c);return m}
function liveCarName(c,fallback){try{return typeof window.carName==='function'&&c?window.carName(c):fallback?.name||fallback?.id||'Unknown car'}catch(_){return fallback?.name||fallback?.id||'Unknown car'}}
function eventFor(s){return DATA().events?.[s?.eventId]||null}
function matchedCars(ev){
 const live=liveCarMap();return (ev?.eligibleIds||[]).map(id=>{const f=carFallback(id),c=live.get(String(id));return {id,name:liveCarName(c,f),live:!!c,meta:f}})
}
function toast(msg){try{window.toast?.(msg)}catch(_){} }

function tileHtml(){
 const m=DATA().meta,legacy=oldDone();
 return `<button class="v7DashTile evil8097" onclick="rhOpenEvilCampaignR18097()"><i aria-hidden="true">!</i><span><b>EVIL CAMPAIGN</b><small><span>R1 PREVIEW • ${m.slots} SLOTS</span><span>LEGACY ${legacy}/708 PRESERVED</span></small></span><em aria-hidden="true">›</em></button>`;
}
function injectTile(){
 if(!fh5())return;
 const grid=document.querySelector('#home .v7DashGrid');if(!grid)return;
 grid.querySelectorAll('.v7DashTile.evil8076,.v7DashTile.evil8097').forEach(x=>x.remove());
 const festival=grid.querySelector('.v7DashTile.festival');if(festival)festival.classList.remove('wide');
 if(festival)festival.insertAdjacentHTML('afterend',tileHtml());else grid.insertAdjacentHTML('afterbegin',tileHtml());
}
const baseHome=window.rhRenderHome;
if(typeof baseHome==='function')window.rhRenderHome=function(){const out=baseHome.apply(this,arguments);injectTile();return out};
function repaintHome(){const h=document.getElementById('home');if(h&&!h.classList.contains('hidden')&&typeof window.rhRenderHome==='function')window.rhRenderHome()}

function actionStrip(){
 return `<section class="rhEvilR1Actions8097">
  <button type="button" onclick="rhEvilR1SetupGuide8097()"><span>🔧</span><b>SETUP GUIDE</b><small>Road • Race • Off-Road • Drift • FE • Drag note</small></button>
  <button type="button" onclick="rhEvilR1Cars8097()"><span>🚗</span><b>CAR CLASSIFICATION</b><small>Inspect all 697 specialist assignments</small></button>
  <button type="button" onclick="rhEvilR1Audit8097()"><span>✓</span><b>R1 AUDIT</b><small>Counts, workload caps and rebuild rules</small></button>
  <button type="button" class="legacy" onclick="rhEvilOpenLegacy8097()"><span>↩</span><b>LEGACY 708</b><small>${oldDone()} completed slots preserved</small></button>
 </section>`;
}
function summaryCards(){const c=DATA().meta.ecosystemCounts||{};return `<section class="rhEvilR1Split8097">
 <div class="normal"><b>${c.NORMAL||0}</b><span>NORMAL</span></div>
 <div class="fe"><b>${c['FORZA EDITION']||0}</b><span>FORZA EDITION</span></div>
 <div class="drift"><b>${c.DRIFT||0}</b><span>DRIFT</span></div>
 <div class="race"><b>${c.RACE||0}</b><span>RACE</span></div>
 <div class="offroad"><b>${c['OFF-ROAD / BUGGY']||0}</b><span>OFF-ROAD / BUGGY</span></div>
 </section>`}
function slotRow(s){return `<button class="rhEvilR1Row8097 eco-${ecoClass(s.ecosystem)}" type="button" onclick="rhEvilOpenR1Slot8097(${Number(s.slot)})">
 <i>${slotNo(s.slot)}</i><span><b>${E(s.event)}</b><small>${E(modeLabel(s))} • ${E(s.liveFormat)} • ${E(s.pool)} • VISIT ${E(s.visit)}</small></span><strong>${Number(s.workload)||0}<small>ENTRIES</small></strong><em>›</em>
 </button>`}
function renderList(query=''){
 const target=document.getElementById('rhEvilR1List8097');if(!target)return;
 const q=String(query||'').trim().toLowerCase();
 const all=DATA().slots||[];
 if(q){
   const rows=all.filter(s=>`${s.slot} ${s.phase} ${s.ecosystem} ${s.eventId} ${s.mode} ${s.family} ${s.event} ${s.liveFormat} ${s.pool} ${s.doNow}`.toLowerCase().includes(q));
   target.innerHTML=`<div class="rhEvilR1SearchCount8097"><b>${rows.length}</b> MATCHING SLOT${rows.length===1?'':'S'}</div>${rows.slice(0,250).map(slotRow).join('')}${rows.length>250?`<p class="rhEvilR1Limit8097">Showing first 250 matches. Make the search more specific.</p>`:''}`;return;
 }
 const groups=phaseGroups(all);
 target.innerHTML=groups.map((g,i)=>`<details class="rhEvilR1Phase8097" ${i===0?'open':''}><summary><span><b>${E(g.name)}</b><small>${g.rows.length} SLOT${g.rows.length===1?'':'S'}</small></span><em>⌄</em></summary><div>${g.rows.map(slotRow).join('')}</div></details>`).join('');
}
window.rhEvilR1Search8097=function(v){renderList(v)};

function renderMain(){
 const h=host();if(!h)return;const m=DATA().meta;
 h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="show('home')" aria-label="Back"><span>‹</span><b>BACK</b></button>
 <header class="rhEvilR1Hero8097"><small>ANDY • FH5 • R1</small><h1>EVIL CAMPAIGN</h1><p>SPECIALIST-FIRST REBUILD</p><strong>PREVIEW BUILD</strong></header>
 <main class="rhEvilR1Body8097">
  <section class="rhEvilR1Safety8097"><b>🔒 READ-ONLY QA</b><p>This update does <strong>not</strong> start, reset or overwrite either campaign. Your legacy 708-slot progress is still stored. R1 race launchers stay locked until you approve the list.</p></section>
  <section class="rhEvilR1Stats8097"><div><small>R1 PROGRAMME</small><b>${m.slots}</b><span>SLOTS</span></div><div><small>EVENT CARDS</small><b>${m.eventCards}</b><span>EXACT FIELDS</span></div><div><small>MAX SLOT WORKLOAD</small><b>${m.maxWorkload}</b><span>RESULT ENTRIES</span></div><div><small>RACE OFF CAP</small><b>${m.maxRaceOffPairings}</b><span>PAIRINGS</span></div></section>
  ${summaryCards()}
  ${actionStrip()}
  <section class="rhEvilR1Intro8097"><div><small>THE NEW LIST</small><h2>${m.slots} SLOTS</h2></div><p>More slots, smaller bites. Specialist type is filtered first, so Normal cars never get mugged by FE, drift, race or dedicated off-road machinery.</p></section>
  <section class="rhEvilR1Search8097"><input type="search" placeholder="Search slot, car family, event, format…" oninput="rhEvilR1Search8097(this.value)"></section>
  <div id="rhEvilR1List8097"></div>
 </main></div>`;
 renderList('');window.scrollTo(0,0);
}
window.rhOpenEvilCampaignR18097=function(){if(!fh5()){toast('Evil Campaign is available in the Forza Horizon 5 Space');return}showEvil();renderMain()};
window.rhRenderEvilCampaignR18097=renderMain;

function setupForSlot(s){
 const rows=DATA().setupGuide||[];let key='NORMAL / ROAD';
 if(s.ecosystem==='RACE')key='RACE';else if(s.ecosystem==='OFF-ROAD / BUGGY')key='OFF-ROAD / BUGGY';else if(s.ecosystem==='DRIFT')key='DRIFT';else if(s.ecosystem==='FORZA EDITION')key='FORZA EDITION';
 return rows.find(r=>String(r?.[0])===key)||null;
}
function setupMini(s){const x=setupForSlot(s);if(!x)return'';return `<section class="rhEvilR1SetupMini8097"><small>RECOMMENDED MAIN SETUP</small><h3>${E(x[0])}</h3><div><b>TYRES</b><span>${E(x[1])}</span></div><div><b>CHASSIS</b><span>${E(x[2])}</span></div><div><b>DRIVETRAIN</b><span>${E(x[3])}</span></div>${s.pool==='DRAG'?'<p><strong>DRAG EXCEPTION:</strong> temporary drag tyres/suspension/gearing for this slot, then return the car to its normal ecosystem setup.</p>':''}</section>`}
function eligibleHtml(ev){
 const cars=matchedCars(ev);return `<details class="rhEvilR1Eligible8097"><summary><span><b>EXACT ELIGIBLE FIELD</b><small>${cars.length} CARS • frozen from the v8.0.96 live Garage snapshot</small></span><em>⌄</em></summary><div class="rhEvilR1EligibleList8097">${cars.map((x,i)=>`<div class="${x.live?'':'missing'}"><i>${String(i+1).padStart(3,'0')}</i><span><b>${E(x.name)}</b><small>${E(x.meta.ecosystem)} • ${E(x.meta.role)}${x.live?'':' • NOT FOUND IN CURRENT LIVE GARAGE'}</small></span></div>`).join('')}</div></details>`;
}
window.rhEvilOpenR1Slot8097=function(n){
 const s=(DATA().slots||[]).find(x=>Number(x.slot)===Number(n)),h=host();if(!s||!h)return renderMain();const ev=eventFor(s);
 h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18097()" aria-label="Back"><span>‹</span><b>BACK</b></button>
 <header class="rhEvilR1Hero8097 slot"><small>R1 PREVIEW • ${E(s.ecosystem)}</small><h1>SLOT ${slotNo(s.slot)}</h1><p>${E(modeLabel(s))}</p><strong>${E(s.liveFormat)}</strong></header>
 <main class="rhEvilR1Body8097">
  <section class="rhEvilR1SlotCard8097 eco-${ecoClass(s.ecosystem)}"><small>${E(s.family)} • ${E(s.eventId)}</small><h2>${E(s.event)}</h2><div><span>${s.eligible} CARS</span><span>${E(s.pool)}</span><span>VISIT ${E(s.visit)}</span><span>${s.workload} RESULT ENTRIES</span></div></section>
  <section class="rhEvilR1Instruction8097"><small>DO THIS NOW</small><h3>${E(s.doNow)}</h3><p>${E(s.stopWhen)}</p></section>
  <section class="rhEvilR1Programme8097"><small>PROGRAMME</small><h3>${E(s.programme)}</h3><p>${ev?.protectedFinale?`Protected finale: <strong>${E(ev.protectedFinale)}</strong>. `:''}${E(ev?.eligibilityRule||'')}</p></section>
  ${s.notes?`<section class="rhEvilR1Note8097"><small>CAMPAIGN NOTE</small><p>${E(s.notes)}</p></section>`:''}
  ${setupMini(s)}
  ${ev?eligibleHtml(ev):''}
  <section class="rhEvilR1Locked8097"><b>🔒 PREVIEW ONLY</b><p>The exact field and programme are embedded, but launching is deliberately disabled in v8.0.97 so your existing racing history cannot be mixed with the replacement before QA.</p><button class="btn" type="button" onclick="rhEvilR1PreviewLocked8097()">LAUNCH LOCKED UNTIL APPROVAL</button></section>
 </main></div>`;window.scrollTo(0,0);
};
window.rhEvilR1PreviewLocked8097=function(){toast('R1 is in read-only QA. Approve the list first; activation comes in the next build.')};

window.rhEvilR1SetupGuide8097=function(){
 const h=host();if(!h)return;const rows=DATA().setupGuide||[];
 h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18097()" aria-label="Back"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>R1 REFERENCE</small><h1>SETUP GUIDE</h1><p>BUY ONCE • STOP FAFFING</p></header><main class="rhEvilR1Body8097"><section class="rhEvilR1Safety8097 setup"><b>BASELINE, NOT A COMPULSORY MAX BUILD</b><p>Buy chassis/control parts first and never force a car past an intended class ceiling. Preserve original drivetrain by default. Drag remains the temporary loadout exception.</p></section><div class="rhEvilR1GuideGrid8097">${rows.map(r=>`<section><small>${E(r[0])}</small><h2>${E(r[5]||r[0])}</h2><div><b>TYRES</b><span>${E(r[1])}</span></div><div><b>SUSPENSION / CHASSIS</b><span>${E(r[2])}</span></div><div><b>DRIVETRAIN</b><span>${E(r[3])}</span></div><div><b>POWER / WEIGHT</b><span>${E(r[4])}</span></div></section>`).join('')}</div><section class="rhEvilR1DragNote8097"><b>DRAG — TEMPORARY EXCEPTION</b><p>Use the simple drag loadout for a Drag slot, then put the car back to its normal ecosystem setup afterwards. No need to maintain multiple permanent road/off-road/drift builds for the same car.</p></section></main></div>`;window.scrollTo(0,0);
};

let carFilterEco='ALL';
function renderCars(q=''){
 const box=document.getElementById('rhEvilR1CarsList8097');if(!box)return;const text=String(q||'').trim().toLowerCase();
 const rows=(DATA().cars||[]).filter(c=>(carFilterEco==='ALL'||c.ecosystem===carFilterEco)&&(!text||`${c.name} ${c.make} ${c.model} ${c.year} ${c.classType} ${c.ecosystem} ${c.role}`.toLowerCase().includes(text)));
 box.innerHTML=`<div class="rhEvilR1SearchCount8097"><b>${rows.length}</b> MATCHING CAR${rows.length===1?'':'S'}</div>${rows.map(c=>`<div class="rhEvilR1CarRow8097 eco-${ecoClass(c.ecosystem)}"><span><b>${E(c.name)}</b><small>${E(c.classType)} • ${E(c.role)} • ${E(c.confidence)} CONFIDENCE</small></span><strong>${E(c.ecosystem)}</strong><details><summary>WHY?</summary><p>${E(c.basis)}</p></details></div>`).join('')}`;
}
window.rhEvilR1CarsFilter8097=function(v){renderCars(v)};
window.rhEvilR1CarsEco8097=function(v){carFilterEco=v;document.querySelectorAll('.rhEvilR1EcoTabs8097 button').forEach(b=>b.classList.toggle('active',b.dataset.eco===v));renderCars(document.getElementById('rhEvilR1CarSearch8097')?.value||'')};
window.rhEvilR1Cars8097=function(){
 const h=host();if(!h)return;carFilterEco='ALL';const ecos=['ALL','NORMAL','FORZA EDITION','DRIFT','RACE','OFF-ROAD / BUGGY'];
 h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18097()" aria-label="Back"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>697-CAR AUDIT</small><h1>CAR CLASSIFICATION</h1><p>ONE SPECIALIST HOME PER CAR</p></header><main class="rhEvilR1Body8097"><section class="rhEvilR1Search8097"><input id="rhEvilR1CarSearch8097" type="search" placeholder="Search car, make, class or role…" oninput="rhEvilR1CarsFilter8097(this.value)"></section><div class="rhEvilR1EcoTabs8097">${ecos.map(x=>`<button data-eco="${E(x)}" class="${x==='ALL'?'active':''}" onclick="rhEvilR1CarsEco8097('${E(x)}')">${E(x)}</button>`).join('')}</div><div id="rhEvilR1CarsList8097"></div></main></div>`;renderCars('');window.scrollTo(0,0);
};

window.rhEvilR1Audit8097=function(){
 const h=host();if(!h)return;const a=DATA().audit||{},rules=DATA().rules||[];
 const checks=[['GARAGE CARS',a['Garage cars'],697],['OWNED MATCHED',a['Owned cars matched'],697],['EVENT CARDS',a['Event cards'],228],['CAMPAIGN SLOTS',a['Campaign slots'],1165],['MAX WORKLOAD',a['Max workload entries per slot'],'≤ 24'],['MAX RACE OFF PAIRINGS',a['Max Race Off pairings per slot'],'≤ 5'],['UNCOVERED CARS',a['Uncovered cars'],0],['BAD EVENTS',a['Bad events under 2 entrants'],0],['DUPLICATE EVENT IDS',a['Duplicate event IDs'],0],['SLOT NUMBERING',a['Slot numbering contiguous'],'YES']];
 h.innerHTML=`<div class="rhEvilR18097"><button class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18097()" aria-label="Back"><span>‹</span><b>BACK</b></button><header class="rhEvilR1Hero8097"><small>PRE-RESET QA</small><h1>R1 AUDIT</h1><p>MECHANICAL CHECKS + LOCKED RULES</p></header><main class="rhEvilR1Body8097"><div class="rhEvilR1AuditChecks8097">${checks.map(x=>`<div><span>${E(x[0])}</span><b>${E(x[1])}</b><small>EXPECTED ${E(x[2])}</small></div>`).join('')}</div><section class="rhEvilR1Rules8097"><h2>LOCKED BUILD RULES</h2>${rules.map(r=>`<div><b>${E(r[0])}</b><strong>${E(r[1])}</strong><p>${E(r[2])}</p></div>`).join('')}</section></main></div>`;window.scrollTo(0,0);
};

window.rhEvilOpenLegacy8097=function(){
 if(typeof LEGACY_OPEN!=='function'){toast('Legacy campaign viewer is unavailable');return}
 LEGACY_OPEN();
};

window.rhEvilR1PreviewReport8097=()=>({version:VERSION,readOnly:true,meta:DATA().meta,legacyDone:oldDone(),events:Object.keys(DATA().events||{}).length,slots:(DATA().slots||[]).length,cars:(DATA().cars||[]).length});

repaintHome();
})();
