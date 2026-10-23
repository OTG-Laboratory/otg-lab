// OTG! v5.6.6 — Events guided run checkpoint
const RH_FINAL_STORE='RaceHub_Studio_Final_v5_6';
const RH_BUILD_VERSION='5.7.32';
let rhMoreMode='stats', rhRecordsMode='records', rhFestivalMode='browse', rhSetup=null, rhHelpKey=null, rhGarageOpenMake=null;
const RH_HELP={
 home:['OTG! HQ','This is your OTG! home. Festival creates Championships from cars in this OTG!; Events holds racing you create; Garage, Records and Stats all belong to the selected OTG! Space.'],
 festival:['Festival','OTG! Championships are generated from the cars in this Space. Choose a Championship, set its Rounds and entries, then start. Entries and Rounds are frozen for that run.'],
 events:['Events','Create your own racing programme here. Events are separate from Festival Championships and stay inside the selected OTG! Space.'],
 garage:['Garage','Your Garage belongs to this OTG! Space. Add or correct cars here. Existing Garage data is preserved when upgrading OTG!.'],
 records:['Records','Records are grouped by the run that created them. A Championship Record belongs to that frozen run; All-Time OTG! Records compare results across this Space.'],
 stats:['Stats','Stats are calculated only from the currently selected OTG! Space. Other Spaces keep their own racing history separate.'],
 settings:['Settings','Manage celebrations, Favourite Manufacturer, OTG! Spaces and backups here. Reset Racing Data affects this Space only and keeps its Garage.']
};
function rhId(prefix='id'){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function rhClone(v){return JSON.parse(JSON.stringify(v))}
function rhSpaceTemplate(name='My OTG!',cars=[]){return {id:rhId('space'),name,cars:cars.map(normaliseCar),favouriteManufacturer:'',runs:[],customEvents:[],backups:[],createdAt:new Date().toISOString()}}
function rhMigrateLegacy(raw){
 const cars=Array.isArray(raw?.cars)?raw.cars.map(normaliseCar):[];
 const space=rhSpaceTemplate('My OTG!',cars);
 // Preserve old results as legacy history; new frozen-run model starts clean by design.
 space.legacyResults=Array.isArray(raw?.results)?rhClone(raw.results):[];
 return {schema:2,version:RH_BUILD_VERSION,driverName:'Driver',spaces:[space],activeSpaceId:space.id,settings:Object.assign({sound:true,confetti:true,vibrate:true},raw?.settings||{}),onboarded:true};
}
function rhLoad(){
 try{const x=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');if(x?.schema===2&&Array.isArray(x.spaces)&&x.spaces.length)return x;}catch(e){}
 try{const old=JSON.parse(localStorage.getItem(STORE)||'null');if(old?.cars){const x=rhMigrateLegacy(old);localStorage.setItem(RH_FINAL_STORE,JSON.stringify(x));return x;}}catch(e){}
 const x=rhMigrateLegacy({cars:Array.isArray(SEED?.cars)?SEED.cars:[],settings:{sound:true,confetti:true,vibrate:true}});localStorage.setItem(RH_FINAL_STORE,JSON.stringify(x));return x;
}
function rhSave(){localStorage.setItem(RH_FINAL_STORE,JSON.stringify(state))}
function rhSpace(){return state.spaces.find(s=>s.id===state.activeSpaceId)||state.spaces[0]}
function rhSync(){const s=rhSpace();state.cars=s.cars;state.settings=state.settings||{sound:true,confetti:true,vibrate:true};}
function save(){rhSync();const s=rhSpace();s.cars=state.cars;rhSave()}
function rhShow(screen){currentScreen=screen;rhSync();document.body.dataset.screen=screen;document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$(screen).classList.remove('hidden');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===screen));rhRender(screen);window.scrollTo(0,0)}
function show(screen){rhShow(screen)}
function rhHeader(title,sub,key,back='home'){return `<div class="rhPageHead"><button class="rhBack" onclick="show('${back}')">‹</button><div><h1>${esc(title)}</h1>${sub?`<p>${esc(sub)}</p>`:''}</div><button class="rhHelp" onclick="rhOpenHelp('${key}')">?</button></div>`}
function rhOpenHelp(key){rhHelpKey=key;const h=RH_HELP[key]||['OTG! Help','Contextual help for this screen.'];document.body.insertAdjacentHTML('beforeend',`<div id="rhHelpOverlay" class="rhOverlay" onclick="if(event.target===this)rhCloseHelp()"><div class="rhModal"><button class="rhModalX" onclick="rhCloseHelp()">×</button><div class="rhQuestion">?</div><h2>${esc(h[0])}</h2><p>${esc(h[1])}</p><button class="btn" onclick="rhCloseHelp()">Got it</button></div></div>`)}
function rhCloseHelp(){document.getElementById('rhHelpOverlay')?.remove()}

function rhConfirm({title,copy,confirmLabel='CONFIRM',cancelLabel='CANCEL',danger=false,onConfirm=''}){document.getElementById('rhConfirmOverlay')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhConfirmOverlay" class="rhOverlay"><div class="rhModal rhConfirmModal ${danger?'danger':''}"><button class="rhModalX" onclick="$('rhConfirmOverlay').remove()">×</button><h2>${esc(title)}</h2><p>${esc(copy)}</p><div class="rhModalActions"><button class="btn secondary" onclick="$('rhConfirmOverlay').remove()">${esc(cancelLabel)}</button><button class="btn ${danger?'dangerBtn':''}" onclick="$('rhConfirmOverlay').remove();${onConfirm}">${esc(confirmLabel)}</button></div></div></div>`)}
function rhEmpty(title,copy,action='',fn=''){return `<div class="rhEmpty"><div class="rhEmptyMark">◇</div><h2>${esc(title)}</h2><p>${esc(copy)}</p>${action?`<button class="btn" onclick="${fn}">${esc(action)}</button>`:''}</div>`}
function rhCurrentRuns(){return rhSpace().runs||[]}
function rhActiveRun(){return rhCurrentRuns().find(r=>r.status==='active')||null}
function rhRunProgress(r){const total=(r.entries?.length||0)*(r.rounds?.length||0),done=(r.results||[]).length;return {done,total,pct:total?Math.round(done/total*100):0}}
const RH_CHAMP_MIN_ELIGIBLE=2;
function rhMakeList(){return [...new Set(rhSpace().cars.map(c=>c.make).filter(Boolean))].filter(m=>rhEligible('make',m).length>=RH_CHAMP_MIN_ELIGIBLE).sort((a,b)=>a.localeCompare(b))}
function rhEraList(){return [...new Set(rhSpace().cars.map(c=>Math.floor(Number(c.year)/10)*10).filter(y=>y>=1900&&y<=2030))].filter(e=>rhEligible('era',e).length>=RH_CHAMP_MIN_ELIGIBLE).sort((a,b)=>a-b)}
function rhEligible(type,value){const cars=rhSpace().cars;if(type==='festival')return cars;if(type==='make'||type==='favourite')return cars.filter(c=>c.make===value);if(type==='era')return cars.filter(c=>Math.floor(Number(c.year)/10)*10===Number(value));return cars}
function rhTrophy(type){return `assets/final/trophy-${type}.png`}
function rhRenderHome(){
 const s=rhSpace();
 const row=(cls,onclick,icon,title,sub)=>`
   <button class="rhDashV4Row ${cls}" onclick="${onclick}">
     <i aria-hidden="true">${icon}</i>
     <span><b>${title}</b><small>${sub}</small></span>
     <em aria-hidden="true">›</em>
   </button>`;
 $('home').innerHTML=`<div class="rhHome rhHomeLocked rhHomeV4">
   <section class="rhHomeHero rhHomeHeroV4">
     <div class="rhHomeWelcome rhHomeWelcomeV4"><small>WELCOME TO</small><b>${esc(s.name)}</b></div>
     <img class="rhHomeLogo rhHomeLogoV4" src="assets/brand/otg-mark-painted-wall.svg" alt="OTG! — Drive, Record, Improve">
   </section>
   <main class="rhHomeBody rhHomeBodyV4">
     <div class="rhDashV4List">
       ${row('festival',"show('festival')",'🏁','FESTIVAL','OTG! Championships')}
       ${row('events',"show('events')",'<svg viewBox="0 0 64 64"><rect x="13" y="15" width="38" height="38" rx="5"/><path d="M22 10v10M42 10v10M21 29h8v8h-8zM35 29h8v8h-8zM21 41h8v8h-8zM35 41h8v8h-8z"/></svg>','EVENTS','Your Racing')}
       ${row('garage',"show('garage')",'<svg viewBox="0 0 64 64"><path d="M10 29 32 13l22 16v24H10z"/><path d="M18 51V32h28v19"/><path d="M23 43c0-5 4-9 9-9s9 4 9 9v5H23z"/></svg>','GARAGE','Your Cars')}
       ${row('records',"rhRecordsMode='records';show('hall')",'🏆','RECORDS','Results & Hall of Fame')}
       ${row('stats',"rhMoreMode='stats';show('more')",'<svg viewBox="0 0 64 64"><path d="M13 49h38"/><rect x="17" y="34" width="8" height="15" rx="1"/><rect x="28" y="25" width="8" height="24" rx="1"/><rect x="39" y="15" width="8" height="34" rx="1"/></svg>','STATS','Your Racing Overview')}
       ${row('settings',"rhMoreMode='settings';show('more')",'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="11"/><path d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"/></svg>','SETTINGS','Preferences & Data')}
     </div>
   </main>
 </div>`;
}
function rhChampCard(type,value,name,count){const trophy=type==='make'?rhTrophy('manufacturer'):type==='era'?rhTrophy('era'):type==='favourite'?rhTrophy('favourite'):rhTrophy('festival');return `<button class="rhChampCard" onclick="rhBeginSetup('${type}','${esc(String(value)).replace(/'/g,'&#39;')}','${esc(name).replace(/'/g,'&#39;')}')"><img src="${trophy}"><span><b>${esc(name)}</b><small>${count} eligible car${count===1?'':'s'}</small></span><em>›</em></button>`}
function rhContinueActiveRun(){const active=rhActiveRun();if(!active){toast('No active Championship');rhRenderFestival();return}try{rhOpenRun(active.id)}catch(err){console.error('OTG! continue racing failed',err);toast('Could not open Championship')}}
function rhRenderFestival(){
 const s=rhSpace(),active=rhActiveRun(),makes=rhMakeList(),eras=rhEraList(),fav=s.favouriteManufacturer;
 const progress=active?rhRunProgress(active):null;
 $('festival').innerHTML=`<div class="rhFestivalV1">
   <section class="rhFestivalHeroV1">
     <div class="rhFestivalHeadV1">
       <button class="rhFestivalBackV1" onclick="show('home')" aria-label="Back">‹</button>
       <div><h1>FESTIVAL</h1><p>OTG! Championships</p></div>
     </div>
   </section>
   <main class="rhFestivalBodyV1">
     ${active?`<button class="rhFestivalContinueV1" onclick="rhContinueActiveRun()">
       <i aria-hidden="true">🏁</i>
       <span><b>CONTINUE RACING</b><small>${esc(active.name)}</small></span>
       <strong>${progress.done} / ${progress.total}</strong><em aria-hidden="true">›</em>
     </button>`:''}

     <section class="rhFestivalSectionV1">
       <h2>OTG! CHAMPIONSHIPS</h2>
       ${rhChampCard('festival','all','Festival Championship',s.cars.length)}
     </section>

     <section class="rhFestivalSectionV1 rhFestivalFavouriteV1">
       <h2>FAVOURITE MANUFACTURER CHAMPIONSHIP</h2>
       ${fav&&rhEligible('favourite',fav).length>=RH_CHAMP_MIN_ELIGIBLE?rhChampCard('favourite',fav,`${fav} Championship`,rhEligible('favourite',fav).length):`
         <div class="rhFavouriteUnset">
           <p>${fav?`Add at least ${RH_CHAMP_MIN_ELIGIBLE} ${esc(fav)} cars to unlock its Championship.`:'Choose a Favourite Manufacturer in Settings to unlock its Championship.'}</p>
           ${fav?'':`<button class="btn secondary" onclick="rhMoreMode='settings';show('more')">SET FAVOURITE MANUFACTURER</button>`}
         </div>`}
     </section>

     <details class="rhFestivalSectionV1 rhFestivalDetailsV1">
       <summary>ERA CHAMPIONSHIPS <span>${eras.length}</span></summary>
       <div class="rhFestivalDetailIntroV1"><i aria-hidden="true">◴</i><span>View and start Championships by Era.</span><b>${eras.length} ERA${eras.length===1?'':'S'} AVAILABLE</b></div>
       <div class="rhFestivalExpandedV1">
         ${eras.map(e=>rhChampCard('era',e,`${e}s Championship`,rhEligible('era',e).length)).join('')||'<p class="small">Add cars with years to unlock Era Championships.</p>'}
       </div>
     </details>

     <details class="rhFestivalSectionV1 rhFestivalDetailsV1">
       <summary>MANUFACTURER CHAMPIONSHIPS <span>${makes.length}</span></summary>
       <div class="rhFestivalExpandedV1">
         <input class="rhSearch rhFestivalSearchV1" placeholder="Search manufacturers..." oninput="document.querySelectorAll('.rhMakeChamp').forEach(x=>x.hidden=!x.dataset.name.includes(this.value.toLowerCase()))">
         <div class="rhFestivalDetailIntroV1"><i aria-hidden="true">▰</i><span>View and start Championships by Manufacturer.</span><b>${makes.length} MANUFACTURER${makes.length===1?'':'S'} AVAILABLE</b></div>
         ${makes.map(m=>`<div class="rhMakeChamp" data-name="${esc(m.toLowerCase())}">${rhChampCard('make',m,`${m} Championship`,rhEligible('make',m).length)}</div>`).join('')}
       </div>
     </details>

     <div class="rhFestivalInfoV1">
       <i aria-hidden="true">i</i>
       <p>Championships are generated from the cars in your Garage.<br>Only Eras and Manufacturers with at least 2 eligible cars are shown.<br>Use Expand to view and start available Championships.</p>
     </div>
   </main>
 </div>`;
}
function rhSetupTrophyType(type){return type==='make'?'manufacturer':type==='era'?'era':type==='favourite'?'favourite':'festival'}
function rhSetupTypeLabel(type){return type==='make'?'MANUFACTURER CHAMPIONSHIP':type==='era'?'ERA CHAMPIONSHIP':type==='favourite'?'FAVOURITE MANUFACTURER CHAMPIONSHIP':'FESTIVAL CHAMPIONSHIP'}
function rhBeginSetup(type,value,name){const cars=rhEligible(type,value);if(['make','era','favourite'].includes(type)&&cars.length<RH_CHAMP_MIN_ELIGIBLE){toast(`At least ${RH_CHAMP_MIN_ELIGIBLE} eligible cars are required`);rhRenderFestival();return}rhSetup={type,value,name,entries:cars.map(c=>c.id),rounds:[]};rhRenderSetup()}
function rhRenderSetup(){const x=rhSetup;if(!x)return;const cars=rhEligible(x.type,x.value),included=x.entries.length,rounds=x.rounds.length,trophy=rhSetupTrophyType(x.type);$('festival').innerHTML=`<div class="rhSetupV1">
 <header class="rhSetupHeroV1">
  <button class="rhSetupBackV1" onclick="rhCancelSetup()" aria-label="Back">‹</button>
  <div class="rhSetupTitleV1"><small>FESTIVAL</small><h1>CHAMPIONSHIP SETUP</h1><p>Build your Championship run, then freeze it when you start.</p></div>
  <div class="rhSetupIdentityV1"><img src="${rhTrophy(trophy)}" alt=""><div><span>${esc(rhSetupTypeLabel(x.type))}</span><h2>${esc(x.name)}</h2><small>NOT STARTED • ENTRY LIST &amp; ROUNDS NOT FROZEN</small></div></div>
  <div class="rhSetupStatsV1"><div><b>${cars.length}</b><span>ELIGIBLE CARS</span></div><div><b>${rounds}</b><span>ROUNDS CONFIGURED</span></div></div>
 </header>
 <main class="rhSetupBodyV1">
  <section class="rhSetupPanelV1">
   <div class="rhSetupPanelHeadV1"><div><b>1. ENTRY LIST <span>(ELIGIBLE CARS)</span></b><p>These cars are eligible for this Championship.<br>Remove any you don’t want to include.</p></div><strong>${cars.length} ELIGIBLE</strong></div>
   <div class="rhSetupColumnsV1"><span>INCLUDE</span><span>CAR</span><span>YEAR</span><span></span></div>
   <div id="rhSetupCars" class="rhSetupCarsV1">${cars.map(c=>`<div class="rhSetupCarV1" data-name="${esc(carName(c).toLowerCase())}"><label><input type="checkbox" ${x.entries.includes(c.id)?'checked':''} onchange="rhToggleEntry('${c.id}',this.checked)"><i>✓</i></label><span><b>${esc(carName(c))}</b></span><small>${esc(String(c.year||'—'))}</small><button onclick="rhExcludeEntry('${c.id}')" aria-label="Exclude ${esc(carName(c))}">×</button></div>`).join('')||'<div class="rhSetupEmptyMiniV1">No eligible cars.</div>'}</div>
   <div class="rhSetupEntryFootV1"><div class="rhSetupBulkV1"><button onclick="rhSetAllEntries(false)">× <span>CLEAR ALL</span></button><button onclick="rhSetAllEntries(true)">✓ <span>SELECT ALL</span></button></div><strong id="rhIncludedCount">${included} INCLUDED</strong></div>
   <div class="rhSetupInfoV1"><i>i</i><p>Removing a car here only excludes it from this Championship run.<br><b>The car remains in your Garage.</b></p></div>
  </section>
  <section class="rhSetupPanelV1">
   <div class="rhSetupPanelHeadV1"><div><b>2. CHAMPIONSHIP ROUNDS</b><p>Create the rounds (races/challenges) you want<br>to use for this Championship.</p></div><strong>${rounds} ${rounds===1?'ROUND':'ROUNDS'}</strong></div>
   ${rounds?`<div class="rhSetupRoundLabelV1">ROUND ORDER <span>(USE ARROWS TO REORDER)</span></div><div class="rhSetupRoundsV1">${x.rounds.map((r,i)=>`<div class="rhSetupRoundV1"><i>≡</i><b>${i+1}</b><input value="${esc(r.name)}" onchange="rhRenameRound('${r.id}',this.value)"><button onclick="rhMoveRound(${i},-1)" ${i===0?'disabled':''} aria-label="Move up">↑</button><button onclick="rhMoveRound(${i},1)" ${i===rounds-1?'disabled':''} aria-label="Move down">↓</button><button onclick="rhRemoveRound('${r.id}')" aria-label="Remove round">×</button></div>`).join('')}</div>`:`<div class="rhSetupNoRoundsV1"><i>⚑</i><b>NO ROUNDS CONFIGURED</b><p>Add the races/challenges you want<br>to use for this Championship.</p></div>`}
   <button class="rhSetupAddRoundV1" onclick="rhAddRound()">＋ ADD ROUND</button>
  </section>
  <div class="rhSetupFreezeV1"><i>▣</i><p>When you press <b>START CHAMPIONSHIP</b>,<br>your selected cars and rounds will be frozen for this run.</p></div>
  <div class="rhSetupActionsV1"><button class="rhSetupCancelV1" onclick="rhCancelSetup()">× <span><b>CANCEL</b><small>DISCARD CHANGES</small></span></button><button class="rhSetupStartV1" ${!included||!rounds?'disabled':''} onclick="rhConfirmStart()">▶ <span><b>START CHAMPIONSHIP</b><small>FREEZE ENTRY LIST &amp; ROUNDS AND BEGIN</small></span></button></div>
  <div class="rhSetupRuleV1"><i>i</i><p><b>EVERY SELECTED CAR WILL COMPETE IN EVERY ROUND.</b><br>FINAL STANDINGS ARE BASED ON CUMULATIVE TOTAL TIME. LOWEST TIME WINS.</p></div>
 </main>
 </div>`}
function rhFilterSetupCars(q=''){q=q.toLowerCase().trim();document.querySelectorAll('#rhSetupCars .rhSetupCarV1').forEach(x=>x.hidden=!!q&&!x.dataset.name.includes(q))}
function rhSetAllEntries(on){const cars=rhEligible(rhSetup.type,rhSetup.value);rhSetup.entries=on?cars.map(c=>c.id):[];rhRenderSetup()}
function rhToggleEntry(id,on){if(on&&!rhSetup.entries.includes(id))rhSetup.entries.push(id);if(!on)rhSetup.entries=rhSetup.entries.filter(x=>x!==id);rhRenderSetup()}
function rhExcludeEntry(id){rhSetup.entries=rhSetup.entries.filter(x=>x!==id);rhRenderSetup()}
function rhAddRound(){rhSetup.rounds.push({id:rhId('round'),name:`Round ${rhSetup.rounds.length+1}`});rhRenderSetup()}
function rhRenameRound(id,v){const r=rhSetup.rounds.find(r=>r.id===id);if(r)r.name=v.trim()||'Untitled Round'}
function rhRemoveRound(id){rhSetup.rounds=rhSetup.rounds.filter(r=>r.id!==id);rhRenderSetup()}
function rhMoveRound(i,d){const j=i+d;if(j<0||j>=rhSetup.rounds.length)return;[rhSetup.rounds[i],rhSetup.rounds[j]]=[rhSetup.rounds[j],rhSetup.rounds[i]];rhRenderSetup()}
function rhCancelSetup(){rhSetup=null;rhRenderFestival()}
function rhConfirmStart(){const x=rhSetup;if(!x)return;const s=rhSpace();const run={id:rhId('run'),name:x.name,type:x.type,value:x.value,trophy:x.type==='make'?'manufacturer':x.type==='era'?'era':x.type==='favourite'?'favourite':'festival',createdAt:new Date().toISOString(),status:'active',entries:[...x.entries],rounds:rhClone(x.rounds),results:[]};s.runs.push(run);rhSave();rhSetup=null;rhOpenRun(run.id)}
function rhNextSlot(r){const entries=Array.isArray(r?.entries)?r.entries:[],rounds=Array.isArray(r?.rounds)?r.rounds:[],results=Array.isArray(r?.results)?r.results:[];for(const carId of entries){for(const round of rounds){if(!results.some(x=>x.carId===carId&&x.roundId===round.id))return {carId,round}}}return null}
function rhOpenRun(id){const r=rhCurrentRuns().find(x=>x.id===id);if(!r)return;show('festival');const p=rhRunProgress(r),next=rhNextSlot(r);if(r.status==='complete'){const rows=r.entries.map(id=>{const rr=r.results.filter(x=>x.carId===id);return rr.length===r.rounds.length?{id,total:rr.reduce((a,b)=>a+b.time,0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total),winner=rows[0],typeLabel=rhSetupTypeLabel(r.type||r.championshipType||'festival');$('festival').innerHTML=`<div class="rhFinalBoardV1">
 <header class="rhFinalBoardHeroV1 rhFinalChampHeroV1">
  <button onclick="rhFestival()" aria-label="Back">‹</button>
  <div><small>CHAMPIONSHIP COMPLETE</small><h1>${esc(r.name)}</h1><span>${esc(typeLabel)}</span></div>
 </header>
 <main class="rhFinalBoardBodyV1">
  ${winner?`<section class="rhFinalWinnerV1"><img src="${rhTrophy(r.trophy)}" alt=""><div><small>CHAMPION</small><h2>${esc(carName(carById(winner.id)))}</h2><strong>${rhFmtTime(winner.total)}</strong></div></section>`:''}
  <section class="rhFinalClassificationV1">
   <div class="rhFinalTitleV1"><div><small>OFFICIAL CLASSIFICATION</small><h2>FINAL LEADERBOARD</h2></div><span>${rows.length} CARS</span></div>
   <div class="rhFinalRowsV1">${rows.map((x,i)=>`<div class="rhFinalRowV1 ${i===0?'winner':''}"><b>${i+1}</b><span>${esc(carName(carById(x.id)))}</span><strong>${rhFmtTime(x.total)}</strong></div>`).join('')}</div>
  </section>
  <section class="rhFinalCompleteNoteV1"><b>RUN COMPLETE</b><span>${p.done} of ${p.total} results recorded • Final classification saved to OTG!.</span></section>
  <button class="btn rhPrimaryWide rhFinalReturnV1" onclick="rhFestival()">RETURN TO FESTIVAL</button>
 </main>
</div>`;return}const entries=Array.isArray(r.entries)?r.entries:[],rounds=Array.isArray(r.rounds)?r.rounds:[],results=Array.isArray(r.results)?r.results:[];const currentCar=next?carById(next.carId):null,currentIndex=next?entries.indexOf(next.carId):-1,currentDone=next?results.filter(x=>x.carId===next.carId).length:0;const typeLabel=rhSetupTypeLabel(r.type||r.championshipType||'festival');$('festival').innerHTML=`<div class="rhOverviewV1">
 <header class="rhOverviewHeroV1">
  <button class="rhOverviewBackV1" onclick="rhFestival()" aria-label="Back">‹</button>
  <div class="rhOverviewBrandV1"><small>CHAMPIONSHIP</small><h1>${esc(r.name)}</h1><span>${esc(typeLabel)}</span></div>
  <div class="rhOverviewIdentityV1"><img src="${rhTrophy(r.trophy)}" alt=""><div><b>IN PROGRESS</b><small>Created ${new Date(r.createdAt).toLocaleDateString('en-GB')}</small></div></div>
 </header>
 <main class="rhOverviewBodyV1">
  <section class="rhOverviewProgressV1">
   <div class="rhOverviewProgressTopV1"><div><small>CHAMPIONSHIP PROGRESS</small><b>${p.done} OF ${p.total} RESULTS RECORDED</b></div><strong>${p.pct}%</strong></div>
   <div class="rhOverviewProgressTrackV1"><i style="width:${p.pct}%"></i></div>
   <div class="rhOverviewStatsV1"><div><b>${entries.length}</b><span>FROZEN CARS</span></div><div><b>${rounds.length}</b><span>ROUNDS</span></div><div><b>${p.done}</b><span>RESULTS SAVED</span></div></div>
  </section>
  ${next?`<section class="rhCurrentCarV1">
   <div class="rhCurrentCarHeadV1"><div><small>CURRENT CAR</small><h2>${esc(carName(currentCar||{make:'Unknown',model:'Car'}))}</h2></div><strong>${currentIndex+1} OF ${entries.length}</strong></div>
   <div class="rhCurrentCarMetaV1"><div><span>CURRENT ROUND</span><b>${esc(next.round.name)}</b></div><div><span>CAR PROGRESS</span><b>${currentDone} OF ${rounds.length} ROUNDS COMPLETE</b></div></div>
   <button class="rhContinueV1" onclick="rhEnterResult('${r.id}','${next.carId}','${next.round.id}')"><span>▶</span><div><b>CONTINUE</b><small>ENTER RESULT FOR ${esc(next.round.name).toUpperCase()}</small></div></button>
  </section>`:''}
  <section class="rhLineupV1">
   <div class="rhOverviewSectionHeadV1"><div><small>RACE NIGHT</small><h2>LINE-UP</h2></div><span>FROZEN ORDER</span></div>
   <div class="rhLineupRowsV1">${entries.map((cid,i)=>{const c=carById(cid),done=results.filter(x=>x.carId===cid).length,isCurrent=next&&cid===next.carId,isComplete=done>=rounds.length;return `<div class="rhLineupRowV1 ${isCurrent?'current':''} ${isComplete?'complete':''}"><i>${i+1}</i><div><b>${esc(carName(c||{make:'Unknown',model:'Car'}))}</b><small>${done} / ${rounds.length} rounds complete</small></div><strong>${isComplete?'COMPLETE':isCurrent?'CURRENT':'WAITING'}</strong></div>`}).join('')}</div>
   <button class="rhShuffleV1" onclick="rhShuffleQueue('${r.id}')">↝ SHUFFLE QUEUE</button>
  </section>
  <section class="rhFrozenV1">
   <div class="rhOverviewSectionHeadV1"><div><small>FROZEN RUN</small><h2>ENTRY LIST &amp; ROUNDS</h2></div><span>LOCKED</span></div>
   <div class="rhFrozenGridV1"><div><b>ENTRY LIST</b>${entries.map((cid,i)=>`<p><span>${i+1}</span>${esc(carName(carById(cid)||{make:'Unknown',model:'Car'}))}</p>`).join('')}</div><div><b>ROUNDS</b>${rounds.map((rd,i)=>`<p><span>${i+1}</span>${esc(rd.name)}</p>`).join('')}</div></div>
   <p class="rhFrozenNoteV1">Cars and rounds are frozen for this Championship run.</p>
  </section>
 </main>
</div>`}
function rhEnterResult(runId,carId,roundId){const r=rhCurrentRuns().find(x=>x.id===runId),c=carById(carId),rd=r?.rounds.find(x=>x.id===roundId);if(!r||!c||!rd)return;$('festival').innerHTML=`<div class="rhScene rhChampScene">${rhHeader('ENTER RESULT',rd.name,'festival','festival')}</div><div class="rhContent"><section class="rhSection rhResultEntry"><span>${esc(r.name)}</span><h2>${esc(carName(c))}</h2><label>TIME</label><input id="rhTime" class="rhStopwatch" inputmode="numeric" maxlength="9" placeholder="00:00.000"><label>POSITION</label><select id="rhPos"><option value="">—</option>${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option>${n}</option>`).join('')}</select><button class="btn" onclick="rhSaveResult('${runId}','${carId}','${roundId}')">SAVE RESULT</button></section></div>`}
function rhParseTime(v){v=String(v||'').trim();const m=v.match(/^(\d{1,2}):([0-5]?\d)\.(\d{1,3})$/);if(m)return Number(m[1])*60+Number(m[2])+Number(('0.'+m[3].padEnd(3,'0')));const d=v.replace(/\D/g,'');if(d.length>=4){const ms=d.slice(-3),sec=d.slice(-5,-3)||'0',min=d.slice(0,-5)||'0';return Number(min)*60+Number(sec)+Number(ms)/1000}return NaN}
function rhFmtTime(v){const m=Math.floor(v/60),s=(v-m*60).toFixed(3).padStart(6,'0');return `${String(m).padStart(2,'0')}:${s}`}
function rhSaveResult(runId,carId,roundId){const r=rhCurrentRuns().find(x=>x.id===runId),v=rhParseTime($('rhTime')?.value),pos=Number($('rhPos')?.value)||null;if(!r||!isFinite(v)||v<=0){toast('Enter a valid time');return}const priorAll=rhCurrentRuns().flatMap(x=>x.results||[]).filter(x=>x.roundName===r.rounds.find(q=>q.id===roundId)?.name);const runPrior=r.results.filter(x=>x.roundId===roundId);const championshipRecord=!runPrior.length||v<Math.min(...runPrior.map(x=>x.time));const allTime=!priorAll.length||v<Math.min(...priorAll.map(x=>x.time));r.results.push({id:rhId('result'),carId,roundId,roundName:r.rounds.find(x=>x.id===roundId).name,time:v,position:pos,date:new Date().toISOString(),championshipRecord,allTime});if(!rhNextSlot(r)){r.status='complete';r.completedAt=new Date().toISOString()}rhSave();rhResultSummary(r,r.results.at(-1))}
function rhResultSummary(r,res){const c=carById(res.carId);$('festival').innerHTML=`<div class="rhScene rhChampScene">${rhHeader('RESULT SAVED',res.roundName,'festival','festival')}</div><div class="rhContent"><section class="rhClipboard"><span>OFFICIAL RESULT</span><h2>${esc(carName(c))}</h2><strong>${rhFmtTime(res.time)}</strong>${res.position?`<p>Position ${res.position}</p>`:''}<div class="rhRosettes">${res.championshipRecord?'<b>✹ Championship Record</b>':''}${res.allTime?'<b class="gold">✹ All-Time RH Record</b>':''}</div>${(res.championshipRecord||res.allTime)?'<img class="rhHubs" src="assets/final/hubs.png" alt="Hubs celebrating">':''}<button class="btn" onclick="rhOpenRun('${r.id}')">${r.status==='complete'?'FINAL LEADERBOARD':'CONTINUE'}</button></section></div>`}
function rhLeaderboard(r){const rows=r.entries.map(id=>{const rr=r.results.filter(x=>x.carId===id);return rr.length===r.rounds.length?{id,total:rr.reduce((a,b)=>a+b.time,0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total);return `<section class="rhSection"><h2>Final Leaderboard</h2>${rows.map((x,i)=>`<div class="rhLeaderRow"><b>${i+1}</b><span>${esc(carName(carById(x.id)))}</span><strong>${rhFmtTime(x.total)}</strong></div>`).join('')}</section>`}
function rhRenderEvents(){
 const s=rhSpace(),active=s.customEvents.filter(e=>e.status!=='complete'),done=s.customEvents.filter(e=>e.status==='complete'),hasEvents=active.length+done.length;
 const running=active.find(e=>rhEventIsStarted(e))||null;
 $('events').innerHTML=`<div class="rhEventsV1">
   <section class="rhEventsHeroV1">
     <div class="rhEventsHeadV1">
       <button class="rhEventsBackV1" onclick="show('home')" aria-label="Back">‹</button>
       <div><h1>EVENTS</h1><p>Your Racing</p></div>
     </div>
   </section>
   <main class="rhEventsBodyV1">
     <button class="rhEventsCreateV1" onclick="rhCreateEvent()">
       <i aria-hidden="true">▣</i>
       <span><b>CREATE EVENT</b><small>Set up a new racing event with your own rounds and eligible cars.</small></span>
       <em aria-hidden="true">›</em>
     </button>
     ${running?rhEventProgressCardV1(running):''}
     <section class="rhEventsListV1">
       <h2>YOUR EVENTS</h2>
       ${hasEvents?`${active.length?`<h3>ACTIVE EVENTS</h3>${active.map(rhEventCard).join('')}`:''}${done.length?`<h3 class="rhEventsCompletedLabelV1">COMPLETED EVENTS</h3>${done.map(rhEventCard).join('')}`:''}`:rhEmpty('NO EVENTS YET','Create an Event to build your own racing programme.','Create Event','rhCreateEvent()')}
     </section>
     <div class="rhEventsInfoV1">
       <i aria-hidden="true">i</i>
       <p><b>EVENTS</b>Create your own racing programme with the cars in your Garage.<br>Add and arrange Rounds, choose eligible cars, then record each result as you race.</p>
     </div>
   </main>
 </div>`;
}
function rhEventProgressCardV1(e){
 const p=rhEventProgress(e),rounds=rhEventRounds(e),cars=rhEventCars(e),next=rhEventNextPair(e);
 const roundIndex=next?Math.max(0,rounds.findIndex(r=>r.id===next.round.id)):Math.max(0,rounds.length-1);
 const current=rounds.length?Math.min(rounds.length,roundIndex+1):0;
 return `<section class="rhEventsProgressV1">
   <h2>IN PROGRESS</h2>
   <div class="rhEventsProgressInnerV1">
     <div class="rhEventsRingV1" style="--p:${p.pct}"><b>${current}</b><small>OF ${rounds.length||0}<br>ROUNDS</small></div>
     <span><b>${esc(e.name)}</b><small>Round ${current} of ${rounds.length||0} • ${cars.length} Cars</small>${next?`<small>Next Round: ${esc(next.round.name||'Round '+current)}</small>`:''}</span>
     <button onclick="rhOpenEvent('${e.id}')">CONTINUE <em>›</em></button>
   </div>
 </section>`;
}
function rhEventRacerCount(e){const n=Number(e?.racerCount||0);return Number.isFinite(n)&&n>0?Math.floor(n):Math.max(1,(e?.carIds||[]).length||1)}
function rhEventIsStarted(e){return !!(e?.startedAt||e?.status==='complete'||(e?.results||[]).length)}
function rhEventCars(e){const ids=rhEventIsStarted(e)&&Array.isArray(e.frozenCarIds)?e.frozenCarIds:(e.carIds||[]);return ids.map(id=>rhSpace().cars.find(c=>c.id===id)).filter(Boolean)}
function rhEventRounds(e){return rhEventIsStarted(e)&&Array.isArray(e.frozenRounds)&&e.frozenRounds.length?e.frozenRounds:e.rounds||[]}
function rhEventResultExists(e,carId,roundId){return (e.results||[]).some(x=>x.carId===carId&&x.roundId===roundId)}
function rhEventNextPair(e){for(const c of rhEventCars(e)){for(const r of rhEventRounds(e)){if(!rhEventResultExists(e,c.id,r.id))return {car:c,round:r}}}return null}
function rhEventProgress(e){const total=rhEventCars(e).length*rhEventRounds(e).length,done=(e.results||[]).filter(x=>rhEventCars(e).some(c=>c.id===x.carId)&&rhEventRounds(e).some(r=>r.id===x.roundId)).length;return {done,total,pct:total?Math.round(done/total*100):0}}
function rhEventLeaderboard(e){return rhEventCars(e).map(c=>{const rr=(e.results||[]).filter(x=>x.carId===c.id);return rr.length===rhEventRounds(e).length?{car:c,total:rr.reduce((a,b)=>a+Number(b.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total)}
function rhEventCard(e){
 const racers=rhEventRacerCount(e),started=rhEventIsStarted(e),complete=e.status==='complete',status=complete?'Completed':started?'In Progress':'Setup';
 const rounds=rhEventRounds(e),p=rhEventProgress(e);
 return `<div class="rhEventManageRow rhEventManageRowV1 ${complete?'is-complete':''}">
   <button class="rhEventCard rhEventCardV1" onclick="rhOpenEvent('${e.id}')">
     <i aria-hidden="true">${complete?'⚑':'⚐'}</i>
     <span><b>${esc(e.name)}</b><small>${racers} racer${racers===1?'':'s'} • ${rounds.length} round${rounds.length===1?'':'s'} • ${status}</small></span>
     ${!complete&&started?`<strong>${p.pct}%</strong>`:''}
     <em>›</em>
   </button>
   <button class="rhEventRemoveList" aria-label="Remove ${esc(e.name)}" onclick="event.stopPropagation();rhConfirmRemoveEvent('${e.id}')">✕</button>
 </div>`;
}
function rhCreateEvent(){document.getElementById('rhEventEditor')?.remove();const max=Math.max(1,rhSpace().cars.length);document.body.insertAdjacentHTML('beforeend',`<div id="rhEventEditor" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="$('rhEventEditor').remove()">×</button><h2>Create Event</h2><p>Name your racing programme and choose how many cars will race.</p><label>Event Name</label><input id="rhEventName" class="rhSearch" maxlength="80" placeholder="Event name" autocomplete="off"><label>Number of Racers</label><div class="rhNumberPicker"><button type="button" onclick="rhStepEventRacers(-1)">−</button><input id="rhEventRacers" inputmode="numeric" type="number" min="1" max="${max}" value="1" aria-label="Number of racers"><button type="button" onclick="rhStepEventRacers(1)">＋</button></div><p class="small">You will choose the cars after creating the Event.</p><div class="rhModalActions"><button class="btn secondary" onclick="$('rhEventEditor').remove()">CANCEL</button><button class="btn" onclick="rhSaveNewEvent()">CREATE EVENT</button></div></div></div>`);setTimeout(()=>$('rhEventName')?.focus(),50)}
function rhStepEventRacers(delta){const el=$('rhEventRacers');if(!el)return;const max=Math.max(1,rhSpace().cars.length),v=Math.max(1,Math.min(max,(Number(el.value)||1)+delta));el.value=v}
function rhSaveNewEvent(){const input=$('rhEventName'),name=input?.value?.trim(),max=Math.max(1,rhSpace().cars.length),racers=Math.max(1,Math.min(max,Math.floor(Number($('rhEventRacers')?.value)||1)));if(!name){input?.focus();return toast('Enter an Event name')}const e={id:rhId('event'),name,status:'setup',racerCount:racers,carIds:[],rounds:[{id:rhId('round'),name:'Round 1'}],results:[],createdAt:new Date().toISOString()};rhSpace().customEvents.push(e);rhSave();$('rhEventEditor')?.remove();rhOpenEvent(e.id);setTimeout(()=>rhChooseEventRacers(e.id),100)}
function rhEventChosenCars(e){return (e.carIds||[]).map(id=>rhSpace().cars.find(c=>c.id===id)).filter(Boolean)}
function rhEventSetupHtml(e){const chosen=rhEventChosenCars(e);return `<div class="rhContent"><section class="rhSection"><h2>${esc(e.name)}</h2><p>Your created racing programme.</p></section><section class="rhSection"><div class="rhEventSectionHead"><div><h2>Racers</h2><p class="small">${chosen.length} / ${e.racerCount} selected</p></div><button class="chip" onclick="rhChooseEventRacers('${e.id}')">CHOOSE RACERS</button></div>${chosen.length?`<div class="rhEventRacerList">${chosen.map((c,i)=>`<div class="rhListRow"><span>${i+1}. ${esc(carName(c))}</span></div>`).join('')}</div>`:'<div class="empty">Choose the cars that will race in this Event.</div>'}</section><section class="rhSection"><h2>Rounds</h2><p class="small">Name the Rounds in the order each car will race them.</p>${e.rounds.map((r,i)=>`<div class="rhRound"><b>${i+1}</b><input value="${esc(r.name)}" onchange="rhRenameEventRound('${e.id}','${r.id}',this.value)"></div>`).join('')}<button class="btn secondary" onclick="rhAddEventRound('${e.id}')">＋ ADD ROUND</button></section><button class="btn rhStartEvent" ${chosen.length!==e.racerCount||!e.rounds.length?'disabled':''} onclick="rhStartEvent('${e.id}')">START EVENT</button><p class="small rhStartNote">Starting freezes the selected racers and Rounds for this Event.</p></div>`}
function rhEventActiveHtml(e){const p=rhEventProgress(e),next=rhEventNextPair(e),cars=rhEventCars(e),rounds=rhEventRounds(e);return `<div class="rhContent"><section class="rhSection"><div class="rhEventStatus">CURRENT EVENT</div><h2>${esc(e.name)}</h2><div class="rhEventProgressHead"><b>Progress</b><span>${p.done} / ${p.total}</span></div><div class="rhEventProgressTrack"><i style="width:${p.pct}%"></i></div></section>${next?`<section class="rhSection"><h2>Race Night</h2><div class="rhEventNext"><small>NEXT</small><b>${esc(carName(next.car))}</b><span>${esc(next.round.name)}</span></div><button class="btn" onclick="rhEventResult('${e.id}')">CONTINUE</button></section>`:''}<section class="rhSection"><h2>Frozen Racers</h2>${cars.map(c=>`<div class="rhListRow"><span>${esc(carName(c))}</span></div>`).join('')}</section><section class="rhSection"><h2>Rounds</h2>${rounds.map((r,i)=>`<div class="rhListRow"><span>${i+1} &nbsp; ${esc(r.name)}</span></div>`).join('')}</section>${e.results.length?`<section class="rhSection"><h2>Results</h2>${e.results.map(x=>{const car=rhSpace().cars.find(c=>c.id===x.carId);return `<div class="rhListRow"><span><b>${esc(x.roundName)}</b><small>${car?esc(carName(car)):'Unknown car'}</small></span><strong>${rhFmtTime(x.time)}</strong></div>`}).join('')}</section>`:''}</div>`}
function rhEventCompleteHtml(e){const p=rhEventProgress(e),board=rhEventLeaderboard(e),winner=board[0];return `<div class="rhFinalBoardV1 rhFinalEventBoardV1">
 <main class="rhFinalBoardBodyV1">
  ${winner?`<section class="rhFinalWinnerV1 rhFinalEventWinnerV1"><div class="rhFinalEventFlagV1">✓</div><div><small>EVENT WINNER</small><h2>${esc(carName(winner.car))}</h2><strong>${rhFmtTime(winner.total)}</strong></div></section>`:''}
  <section class="rhFinalClassificationV1">
   <div class="rhFinalTitleV1"><div><small>OFFICIAL CLASSIFICATION</small><h2>FINAL LEADERBOARD</h2></div><span>${board.length} RACERS</span></div>
   <div class="rhFinalRowsV1">${board.map((x,i)=>`<div class="rhFinalRowV1 ${i===0?'winner':''}"><b>${i+1}</b><span>${esc(carName(x.car))}</span><strong>${rhFmtTime(x.total)}</strong></div>`).join('')}</div>
  </section>
  <section class="rhFinalCompleteNoteV1"><b>EVENT COMPLETE</b><span>${p.done} of ${p.total} results recorded • Final classification saved to OTG!.</span></section>
  <button class="btn rhPrimaryWide rhFinalReturnV1" onclick="rhRenderEvents();show('events')">RETURN TO EVENTS</button>
 </main>
</div>`}
function rhOpenEvent(id){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e)return;e.racerCount=rhEventRacerCount(e);e.carIds=Array.isArray(e.carIds)?e.carIds.filter(id=>rhSpace().cars.some(c=>c.id===id)).slice(0,e.racerCount):[];if(e.status!=='complete'&&!e.startedAt&&(e.results||[]).length)e.startedAt=e.results[0]?.date||new Date().toISOString();show('events');$('events').innerHTML=`<div class="rhScene rhEventsScene">${rhHeader(e.status==='complete'?'EVENT COMPLETE':'EVENT',e.name,'events','events')}</div>${e.status==='complete'?rhEventCompleteHtml(e):rhEventIsStarted(e)?rhEventActiveHtml(e):rhEventSetupHtml(e)}`}
function rhChooseEventRacers(id){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||rhEventIsStarted(e))return;const target=rhEventRacerCount(e),selected=new Set((e.carIds||[]).slice(0,target));window.rhEventRacerDraft={id,selected,target};document.getElementById('rhEventRacerOverlay')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhEventRacerOverlay" class="rhOverlay"><div class="rhModal rhFormModal rhTallModal"><button class="rhModalX" onclick="$('rhEventRacerOverlay').remove()">×</button><h2>Choose Racers</h2><p>Select exactly ${target} car${target===1?'':'s'} for ${esc(e.name)}.</p><input id="rhEventRacerSearch" class="rhSearch" placeholder="Search make, model or year" oninput="rhFilterEventRacers(this.value)"><div class="rhPickerCount"><b id="rhEventRacerCount">${selected.size}</b> / ${target} selected</div><div id="rhEventRacerOptions" class="rhEventRacerOptions">${rhEventRacerOptionsHtml('')}</div><div class="rhModalActions"><button class="btn secondary" onclick="$('rhEventRacerOverlay').remove()">CANCEL</button><button class="btn" onclick="rhSaveEventRacers()">SAVE RACERS</button></div></div></div>`)}
function rhEventRacerOptionsHtml(query=''){const d=window.rhEventRacerDraft;if(!d)return'';const q=String(query||'').trim().toLowerCase();const cars=rhSpace().cars.filter(c=>!q||carName(c).toLowerCase().includes(q)).sort((a,b)=>String(a.make||'').localeCompare(String(b.make||''))||carName(a).localeCompare(carName(b)));const groups=new Map();cars.forEach(c=>{const make=c.make||'Unknown';if(!groups.has(make))groups.set(make,[]);groups.get(make).push(c)});return [...groups.entries()].map(([make,list])=>{const selectedCount=list.filter(c=>d.selected.has(c.id)).length;return `<details class="rhEventMake" ${q?'open':''}><summary><span><b>${esc(make)}</b><small>${list.length} car${list.length===1?'':'s'}${selectedCount?` • ${selectedCount} selected`:''}</small></span><em>›</em></summary><div class="rhEventMakeCars">${list.map(c=>`<label class="rhPickerRow"><input type="checkbox" ${d.selected.has(c.id)?'checked':''} onchange="rhToggleEventRacer('${c.id}',this.checked)"><span>${esc(c.model||c.name||carName(c))}${c.year?` <small>${esc(String(c.year))}</small>`:''}</span></label>`).join('')}</div></details>`}).join('')||'<div class="empty">No matching cars.</div>'}
function rhFilterEventRacers(q){const box=$('rhEventRacerOptions');if(box)box.innerHTML=rhEventRacerOptionsHtml(q)}
function rhToggleEventRacer(carId,checked){const d=window.rhEventRacerDraft;if(!d)return;if(checked){if(d.selected.size>=d.target){toast(`Choose ${d.target} racer${d.target===1?'':'s'} only`);rhFilterEventRacers($('rhEventRacerSearch')?.value||'');return}d.selected.add(carId)}else d.selected.delete(carId);const count=$('rhEventRacerCount');if(count)count.textContent=d.selected.size;rhFilterEventRacers($('rhEventRacerSearch')?.value||'')}
function rhSaveEventRacers(){const d=window.rhEventRacerDraft,e=rhSpace().customEvents.find(x=>x.id===d?.id);if(!d||!e)return;if(d.selected.size!==d.target)return toast(`Select exactly ${d.target} racer${d.target===1?'':'s'}`);e.carIds=[...d.selected];rhSave();$('rhEventRacerOverlay')?.remove();rhOpenEvent(e.id)}
function rhConfirmRemoveEvent(id){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e)return;rhConfirm({title:'Remove Event?',copy:`${e.name} and all of its saved results will be removed from this OTG! Space. This cannot be undone.`,confirmLabel:'REMOVE EVENT',danger:true,onConfirm:`rhRemoveEventFinal('${id}')`})}
function rhRemoveEventFinal(id){const s=rhSpace();s.customEvents=s.customEvents.filter(e=>e.id!==id);rhSave();toast('Event removed');rhRenderEvents()}
function rhRenameEventRound(eid,rid,v){const e=rhSpace().customEvents.find(x=>x.id===eid),r=e?.rounds.find(x=>x.id===rid);if(r&&!rhEventIsStarted(e)){r.name=v.trim()||'Untitled Round';rhSave()}}
function rhAddEventRound(id){const e=rhSpace().customEvents.find(x=>x.id===id);if(e&&!rhEventIsStarted(e)){e.rounds.push({id:rhId('round'),name:`Round ${e.rounds.length+1}`});rhSave();rhOpenEvent(id)}}
function rhStartEvent(id){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||rhEventIsStarted(e))return;const cars=rhEventChosenCars(e);if(cars.length!==rhEventRacerCount(e))return toast('Choose all racers first');if(!e.rounds?.length)return toast('Add at least one Round');e.frozenCarIds=[...e.carIds];e.frozenRounds=e.rounds.map(r=>({id:r.id,name:r.name}));e.startedAt=new Date().toISOString();e.status='active';e.results=[];rhSave();toast('Event started');rhOpenEvent(id)}
function rhTimeAutoAdvance(el,nextId,maxLen){el.value=String(el.value||'').replace(/\D/g,'').slice(0,maxLen);if(el.value.length>=maxLen){const next=$(nextId);if(next){next.focus();next.select?.()}}}
function rhEventResult(id){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||e.status!=='active')return;const next=rhEventNextPair(e);if(!next){e.status='complete';e.completedAt=new Date().toISOString();rhSave();return rhOpenEvent(id)}document.getElementById('rhEventResultEditor')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhEventResultEditor" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="$('rhEventResultEditor').remove()">×</button><h2>Enter Result</h2><div class="rhResultContext"><small>${esc(e.name)}</small><b>${esc(carName(next.car))}</b><span>${esc(next.round.name)}</span></div><label>Race Time</label><div class="rhTimeEntry"><input id="rhEventMin" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhEventSec',2)"><span>:</span><input id="rhEventSec" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhEventMs',2)"><span>.</span><input id="rhEventMs" inputmode="numeric" maxlength="3" placeholder="000" oninput="rhTimeAutoAdvance(this,'rhEventSave',3)"></div><div class="rhModalActions"><button class="btn secondary" onclick="$('rhEventResultEditor').remove()">CANCEL</button><button id="rhEventSave" class="btn" onclick="rhSaveEventResult('${id}','${next.car.id}','${next.round.id}')">SAVE RESULT</button></div></div></div>`);setTimeout(()=>$('rhEventMin')?.focus(),50)}
function rhEventCarTransition(id,next){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e)return;document.getElementById('rhEventCarTransition')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhEventCarTransition" class="rhOverlay"><div class="rhModal rhEventTransitionModal"><div class="rhEventStatus">NEXT RACER</div><h2>${esc(carName(next.car))}</h2><p>${esc(next.round.name)} is next.</p><button class="btn" onclick="$('rhEventCarTransition').remove();rhEventResult('${id}')">START NEXT RACER</button></div></div>`)}
function rhSaveEventResult(id,carId,roundId){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||e.status!=='active')return;const car=rhEventCars(e).find(c=>c.id===carId),round=rhEventRounds(e).find(r=>r.id===roundId);const m=Number($('rhEventMin')?.value||0),s=Number($('rhEventSec')?.value||0),ms=Number(($('rhEventMs')?.value||'0').padEnd(3,'0'));if(!car||!round||rhEventResultExists(e,carId,roundId)||!Number.isFinite(m)||!Number.isFinite(s)||!Number.isFinite(ms)||m<0||s<0||s>59||ms<0||ms>999)return toast('Enter a valid race time');const v=m*60+s+(ms/1000);if(v<=0)return toast('Enter a valid race time');e.results.push({id:rhId('result'),carId,roundId:round.id,roundName:round.name,time:v,date:new Date().toISOString()});$('rhEventResultEditor')?.remove();const next=rhEventNextPair(e);if(!next){e.status='complete';e.completedAt=new Date().toISOString();rhSave();toast('Event complete');return rhOpenEvent(id)}rhSave();if(next.car.id===carId){toast('Result saved');return rhEventResult(id)}rhOpenEvent(id);rhEventCarTransition(id,next)}
function rhGarageFilterLive(value){
 garageSearch=value||'';
 const q=garageSearch.trim().toLowerCase();
 document.querySelectorAll('.rhGarageMakeV1').forEach(group=>{
   const make=(group.dataset.make||'').toLowerCase();
   let any=false;
   group.querySelectorAll('.rhGarageCarV1').forEach(row=>{
     const hay=(row.dataset.search||'').toLowerCase();
     const show=!q||hay.includes(q)||make.includes(q);
     row.hidden=!show;
     if(show) any=true;
   });
   const showGroup=!q||any||make.includes(q);
   group.hidden=!showGroup;
   if(q && showGroup){
     group.classList.add('search-open');
     const cars=group.querySelector('.rhGarageCarsV1');
     if(cars) cars.hidden=false;
   }else{
     group.classList.remove('search-open');
     const cars=group.querySelector('.rhGarageCarsV1');
     if(cars) cars.hidden=!group.classList.contains('open');
   }
 });
}
function rhRenderGarage(){
 const s=rhSpace(); garageSearch=garageSearch||'';
 const grouped={};
 s.cars.forEach(c=>(grouped[c.make]||(grouped[c.make]=[])).push(c));
 const makes=Object.keys(grouped).sort((a,b)=>a.localeCompare(b));
 $('garage').innerHTML=`<div class="rhGarageV1">
  <section class="rhGarageHeroV1">
   <div class="rhGarageHeadV1"><button onclick="show('home')" aria-label="Back">‹</button><div><h1>GARAGE</h1><p>Your Collection</p></div></div>
  </section>
  <main class="rhGarageBodyV1">
   <section class="rhGarageSummaryV1"><i>⌂</i><span><b>YOUR GARAGE</b><small>All the cars in your collection.<br>Add new cars, edit details and manage your collection.</small></span><strong>${s.cars.length}<small>CARS</small></strong></section>
   <div class="rhGarageToolsV1"><label><i>⌕</i><input id="garageSearch" placeholder="Search your cars..." value="${esc(garageSearch)}" oninput="rhGarageFilterLive(this.value)"></label><button onclick="rhOpenCarEditor()">⊕ <span>ADD NEW CAR</span></button></div>
   ${makes.length?`<div class="rhGarageMakesV1">${makes.map(make=>{const cars=grouped[make].slice().sort((a,b)=>carName(a).localeCompare(carName(b)));const open=rhGarageOpenMake===make;return `<section class="rhGarageMakeV1 ${open?'open':''}" data-make="${esc(make)}"><button class="rhGarageMakeHeadV1" onclick="rhToggleGarageMake('${esc(make).replace(/'/g,'&#39;')}')"><b>${esc(make)}</b><span>${cars.length} Car${cars.length===1?'':'s'}</span><em>${open?'⌃':'⌄'}</em></button><div class="rhGarageCarsV1" ${open?'':'hidden'}>${cars.map(c=>`<div class="rhGarageCarV1" data-search="${esc(`${c.make} ${c.model} ${c.year||''}`)}"><i>•</i><span><b>${esc(c.model)}</b><small>${esc(c.year||'')}</small></span><button aria-label="Edit ${esc(carName(c))}" onclick="event.stopPropagation();rhOpenCarEditor('${c.id}')">✎</button></div>`).join('')}</div></section>`}).join('')}</div>`:rhEmpty('YOUR GARAGE IS EMPTY','Add cars to start building Championships and recording your racing.','Add Your First Car','rhOpenCarEditor()')}
   <div class="rhGarageInfoV1"><i>i</i><p><b>GARAGE</b>This is your collection of all cars.<br>Add new cars, edit details and manage your collection.<br>Use the options above to add cars to your collection.</p></div>
  </main>
 </div>`;
 if(garageSearch) rhGarageFilterLive(garageSearch);
}
function rhToggleGarageMake(make){
 rhGarageOpenMake=rhGarageOpenMake===make?null:make;
 const group=[...document.querySelectorAll('.rhGarageMakeV1')].find(x=>x.dataset.make===make);
 if(!group){rhRenderGarage();return}
 const open=rhGarageOpenMake===make;
 group.classList.toggle('open',open);
 const cars=group.querySelector('.rhGarageCarsV1');
 if(cars) cars.hidden=!open;
 const em=group.querySelector('.rhGarageMakeHeadV1 em');
 if(em) em.textContent=open?'⌃':'⌄';
}

function rhOpenCarEditor(id=''){
 const c=id?rhSpace().cars.find(x=>x.id===id):null;
 document.body.insertAdjacentHTML('beforeend',`<div id="rhCarEditor" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="$('rhCarEditor').remove()">×</button><h2>${c?'Edit Car':'Add Car'}</h2><p>${c?'Correct this Garage entry.':'Add a car to the current OTG! Space.'}</p><label>Manufacturer</label><input id="rhCarMake" class="rhSearch" value="${esc(c?.make||'')}" placeholder="Manufacturer"><label>Vehicle Name</label><input id="rhCarModel" class="rhSearch" value="${esc(c?.model||'')}" placeholder="Vehicle name"><label>Year</label><input id="rhCarYear" class="rhSearch" inputmode="numeric" value="${esc(c?.year||'')}" placeholder="Year"><p class="small">Era is derived automatically from Year.</p><div class="rhModalActions"><button class="btn secondary" onclick="$('rhCarEditor').remove()">CANCEL</button><button class="btn" onclick="rhSaveCarFinal('${id}')">${c?'SAVE CHANGES':'ADD TO GARAGE'}</button></div>${c?`<button class="btn dangerBtn rhDeleteCar" onclick="rhConfirmDeleteCar('${id}')">DELETE CAR</button>`:''}</div></div>`)
}
function rhSaveCarFinal(id=''){
 const make=$('rhCarMake')?.value.trim(),model=$('rhCarModel')?.value.trim(),year=$('rhCarYear')?.value.trim()||'';
 if(!make||!model){toast('Manufacturer and Vehicle Name are required');return}
 if(year&&!/^\d{4}$/.test(year)){toast('Enter a four-digit year');return}
 const s=rhSpace();
 if(id){const c=s.cars.find(x=>x.id===id);if(!c)return;Object.assign(c,normaliseCar({...c,make,model,year}))}
 else s.cars.push(normaliseCar({id:rhId('car'),make,model,year}));
 rhGarageOpenMake=make;rhSync();rhSave();$('rhCarEditor')?.remove();rhRenderGarage();toast(id?'Car updated':'Car added')
}
function rhConfirmDeleteCar(id){const c=rhSpace().cars.find(x=>x.id===id);if(!c)return;rhConfirm({title:'Delete Car?',copy:`${carName(c)} will be removed from this Garage. This cannot be undone.`,confirmLabel:'DELETE CAR',danger:true,onConfirm:`rhDeleteCarFinal('${id}')`})}
function rhDeleteCarFinal(id){const s=rhSpace();s.cars=s.cars.filter(x=>x.id!==id);rhSync();rhSave();$('rhCarEditor')?.remove();rhRenderGarage();toast('Car deleted')}
function rhAddCarFinal(){rhOpenCarEditor()}
function rhRecordsHeader(hall){
 if(!hall)return `<section class="rhRecordsHeroV1"><div class="rhRecordsHeadV1"><button onclick="show('home')" aria-label="Back">‹</button><div><h1>RECORDS</h1><p>Your Racing History</p></div></div></section>`;
 return `<section class="rhHofHeroV1"><div class="rhRecordsHeadV1"><button onclick="rhRecordsMode='records';rhRenderRecords()" aria-label="Back">‹</button><div><h1>HALL OF FAME</h1><p>Your Championship History</p></div></div></section>`;
}
function rhRecordRoundRow(r,rd){
 const rows=(r.results||[]).filter(x=>x.roundId===rd.id).slice().sort((a,b)=>Number(a.time||0)-Number(b.time||0));
 const best=rows[0],car=best?carById(best.carId):null;
 return `<div class="rhRecordRowV1"><span><b>${esc(rd.name)}</b><small>${best&&car?esc(carName(car)):'No result recorded'}</small></span><strong>${best?rhFmtTime(best.time):'—'}</strong></div>`;
}
function rhRunTrophy(r){
 const t=String(r.trophy||r.type||'festival').toLowerCase();
 if(t==='make'||t==='manufacturer')return rhTrophy('manufacturer');
 if(t==='era')return rhTrophy('era');
 if(t==='favourite')return rhTrophy('favourite');
 return rhTrophy('festival');
}
function rhRenderRecords(){
 const runs=rhCurrentRuns(),completed=runs.filter(r=>r.status==='complete'),hall=rhRecordsMode==='hall';
 $('hall').innerHTML=`<div class="${hall?'rhHofV1':'rhRecordsV1'}">${rhRecordsHeader(hall)}<main class="rhRecordsBodyV1">${hall?rhHallOfFame(completed):`
  <button class="rhHallBannerV1" onclick="rhRecordsMode='hall';rhRenderRecords()"><span>★</span><div><b>HALL OF FAME</b><small>Completed Championships, their winning cars and final times.</small></div><em>VIEW HALL OF FAME ›</em></button>
  <section class="rhRecordsSectionV1"><h2>CHAMPIONSHIP RECORDS</h2>${runs.length?runs.slice().reverse().map(r=>`<details class="rhRecordRunV1"><summary><span><b>${esc(r.name)}</b><small>${r.status==='complete'?'Completed':'Active'} • ${(r.results||[]).length} result${(r.results||[]).length===1?'':'s'}</small></span><em>⌄</em></summary><div>${(r.rounds||[]).map(rd=>rhRecordRoundRow(r,rd)).join('')}</div></details>`).join(''):rhEmpty('NO RECORDS YET','Championship records will appear here after you start recording results.','View Championships',"show('festival')")}</section>
  <div class="rhRecordsInfoV1"><i>i</i><p><b>ABOUT RECORDS</b>Records are grouped by Championship run. Each round shows the best recorded time and the car that set it.</p></div>`}</main></div>`;
}
function rhHallOfFame(completed){
 return `<section class="rhHofSectionV1"><div class="rhHofIntroV1"><i>☆</i><p><b>YOUR HALL OF FAME</b>Completed Championships are honoured here with their trophy, winning car and final time.</p></div>
 ${completed.length?`<div class="rhHallGridV1">${completed.map(r=>{const rows=(r.entries||[]).map(id=>{const rr=(r.results||[]).filter(x=>x.carId===id);return rr.length===(r.rounds||[]).length?{id,total:rr.reduce((a,b)=>a+Number(b.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total),w=rows[0],car=w?carById(w.id):null;return `<article class="rhHallCardV1"><img src="${rhRunTrophy(r)}" alt=""><b>${esc(r.name)}</b><span>${car?esc(carName(car)):'—'}</span><small>WINNING TIME</small><strong>${w?rhFmtTime(w.total):'—'}</strong></article>`}).join('')}</div>`:rhEmpty('HALL OF FAME IS EMPTY','Completed Championships will appear here with their trophy, winning car and final time.','View Championships',"rhRecordsMode='records';rhRenderRecords()")}
 <div class="rhRecordsInfoV1"><i>i</i><p><b>ABOUT HALL OF FAME</b>Only fully completed Championships appear here. Each entry shows the trophy for that Championship, the winning car and the final time.</p></div></section>`;
}
function rhRenderStats(){const s=rhSpace(),runs=s.runs||[],completed=runs.filter(r=>r.status==='complete'),champResults=runs.flatMap(r=>r.results||[]),eventResults=(s.customEvents||[]).flatMap(e=>e.results||[]),results=[...champResults,...eventResults],time=results.reduce((a,b)=>a+Number(b.time||0),0);$('more').innerHTML=`<div class="rhStatsScene"><div class="rhPageHead"><button class="rhBack" onclick="show('home')">‹</button><div><h1>STATS</h1><p>Your OTG! at a glance</p></div></div><div class="rhStatsCockpit"><div class="rhStatsGauge rhStatsGaugeLeft"><span>CHAMPIONSHIPS</span><small>CREATED</small><b>${runs.length}</b></div><div class="rhStatsGauge rhStatsGaugeMain"><span>TOTAL</span><small>RACES</small><b>${results.length}</b></div><div class="rhStatsGauge rhStatsGaugeRight"><span>CHAMPIONSHIPS</span><small>COMPLETED</small><b>${completed.length}</b></div><div class="rhStatsOdometer"><span>TIME DRIVEN</span><b>${rhDurationClock(time)}</b><small>HOURS&nbsp;&nbsp;&nbsp;MINUTES&nbsp;&nbsp;&nbsp;SECONDS</small></div></div></div><div class="rhContent rhStatsInfoWrap"><div class="rhStatsInfo">All statistics are for the current OTG! Space only.</div></div>`}
function rhDurationClock(v){const h=Math.floor(v/3600),m=Math.floor(v%3600/60),s=Math.floor(v%60);return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':')}
function rhRenderSettings(){const s=rhSpace(),makes=rhMakeList();$('more').innerHTML=`<div class="rhScene rhSettingsScene"><div class="rhPageHead"><button class="rhBack" onclick="show('home')">‹</button><div><h1>SETTINGS</h1><p>OTG! Control Centre</p></div></div></div><div class="rhContent"><section class="rhSection"><h2>Celebrations</h2>${['sound','confetti','vibrate'].map(k=>`<label class="rhToggle"><span>${k==='sound'?'Sounds':k==='confetti'?'Confetti':'Vibration'}</span><input type="checkbox" ${state.settings[k]?'checked':''} onchange="state.settings.${k}=this.checked;rhSave()"></label>`).join('')}</section><section class="rhSection"><h2>Garage / Profile</h2><label>Favourite Manufacturer</label><select onchange="rhChangeFavourite(this.value)"><option value="">Not set</option>${makes.map(m=>`<option ${m===s.favouriteManufacturer?'selected':''}>${esc(m)}</option>`).join('')}</select><p class="small">Changing Favourite Manufacturer removes the old Favourite Championship and any progress in its active run.</p></section><section class="rhSection"><h2>OTG! Spaces</h2>${state.spaces.map(x=>`<button class="rhSpaceRow ${x.id===s.id?'active':''}" onclick="rhSwitchSpace('${x.id}')"><span><b>${esc(x.name)}</b><small>${x.cars.length} cars • ${(x.runs||[]).length} Championships</small></span><em>${x.id===s.id?'CURRENT':'›'}</em></button>`).join('')}<button class="btn secondary" onclick="rhCreateSpace()">CREATE NEW SPACE</button><p class="small">Play more than one racing game? Create a separate OTG! for each one. Each OTG! keeps its own Garage, Championships, Records, Hall of Fame and Stats separate.</p></section><section class="rhSection"><h2>Data</h2><button class="rhSettingRow" onclick="rhBackup()"><b>Backup</b><span>Create a OTG!-managed backup ›</span></button><button class="rhSettingRow" onclick="rhRestoreList()"><b>Restore</b><span>Restore this Space from a saved backup ›</span></button></section><section class="rhSection danger"><h2>DANGER ZONE</h2><button class="btn dangerBtn" onclick="rhResetConfirm()">RESET RACING DATA</button><p class="small">Clears racing data for this Space while retaining its Garage, name, global Driver Profile and other Spaces.</p></section><section class="rhSection"><h2>About Out The Garage!</h2><h3>DRIVE • RECORD • IMPROVE</h3><p>Out The Garage! is your personal racing record book. Build your Garage, run Championships, record results and keep your racing history safe.</p><p class="small">Version ${RH_BUILD_VERSION} • Studio Final Build</p></section><button class="btn secondary" onclick="rhMoreMode='stats';rhRenderMore()">BACK TO STATS</button></div>`}
function rhChangeFavourite(v){const s=rhSpace(),old=s.favouriteManufacturer;if(old&&old!==v&&!confirm(`Change Favourite Manufacturer from ${old} to ${v||'Not set'}? Progress in the old Favourite Championship will be deleted.`)){rhRenderSettings();return}s.runs=s.runs.filter(r=>!(r.type==='favourite'&&r.value===old));s.favouriteManufacturer=v;rhSave();rhRenderSettings()}
function rhCreateSpace(){const name=prompt('OTG! Name','');if(!name?.trim())return;const s=rhSpaceTemplate(name.trim(),[]);state.spaces.push(s);state.activeSpaceId=s.id;rhSync();rhSave();rhRenderSettings()}
function rhSwitchSpace(id){state.activeSpaceId=id;rhSync();rhSave();rhRenderSettings()}
function rhBackup(){const s=rhSpace(),b={id:rhId('backup'),spaceName:s.name,date:new Date().toISOString(),counts:{cars:s.cars.length,championships:s.runs.length,results:s.runs.flatMap(r=>r.results||[]).length},data:rhClone({cars:s.cars,favouriteManufacturer:s.favouriteManufacturer,runs:s.runs,customEvents:s.customEvents})};s.backups=s.backups||[];s.backups.push(b);rhSave();toast('Backup created');rhRenderSettings()}
function rhRestoreList(){const s=rhSpace(),bs=s.backups||[];document.body.insertAdjacentHTML('beforeend',`<div id="rhRestore" class="rhOverlay"><div class="rhModal"><button class="rhModalX" onclick="$('rhRestore').remove()">×</button><h2>Restore Backup</h2>${bs.length?bs.slice().reverse().map(b=>`<button class="rhSpaceRow" onclick="rhRestore('${b.id}')"><span><b>${esc(b.spaceName)}</b><small>${new Date(b.date).toLocaleString('en-GB')} • ${b.counts.cars} cars • ${b.counts.championships} Championships</small></span><em>›</em></button>`).join(''):rhEmpty('NO SAVED BACKUPS','Create a backup before making major changes.','Create Backup',"$('rhRestore').remove();rhBackup()")}</div></div>`)}
function rhRestore(id){const s=rhSpace(),b=(s.backups||[]).find(x=>x.id===id);if(!b)return;if(!confirm('Restore this backup? It will replace the current Space only and cannot be undone. Other Spaces are unaffected.'))return;Object.assign(s,rhClone(b.data));s.backups=s.backups||[];rhSync();rhSave();$('rhRestore')?.remove();rhRenderSettings()}
function rhResetConfirm(){if(!confirm('Reset Racing Data? This clears Championships, results, Records, Hall of Fame, Stats and Favourite Manufacturer for the current Space. Your Garage, Space name, global Driver Profile and other Spaces are retained.'))return;const s=rhSpace();s.runs=[];s.customEvents=[];s.favouriteManufacturer='';rhSave();toast('Racing data reset');rhRenderSettings()}
function rhRenderMore(){rhMoreMode==='settings'?rhRenderSettings():rhRenderStats()}
function rhRender(screen){if(screen==='home')rhRenderHome();else if(screen==='festival')rhRenderFestival();else if(screen==='events')rhRenderEvents();else if(screen==='garage')rhRenderGarage();else if(screen==='hall')rhRenderRecords();else if(screen==='more')rhRenderMore();}
// Override legacy edit save so it writes the active Space.
const rhLegacyEditCar=editCar;
editCar=function(id){rhLegacyEditCar(id)};
const rhLegacySaveCarEdit=saveCarEdit;
saveCarEdit=function(id){rhLegacySaveCarEdit(id);rhSpace().cars=state.cars;rhSave();if(currentScreen==='garage')rhRenderGarage()};
load=rhLoad;render=rhRender;


/* OTG! v5.7.20 — fullscreen foundation.
   Installed PWA manifest is the primary fullscreen mechanism.
   This user-gesture fallback requests browser fullscreen only when supported.
   It never blocks navigation or changes OTG! data. */
(function rhFullscreenFoundation(){
  let attempted=false;
  async function request(){
    if(attempted) return;
    attempted=true;
    try{
      if(document.fullscreenElement) return;
      const el=document.documentElement;
      if(el.requestFullscreen){
        await el.requestFullscreen({navigationUI:'hide'});
      }else if(el.webkitRequestFullscreen){
        el.webkitRequestFullscreen();
      }
    }catch(_e){ /* OS/browser may decline; installed PWA fullscreen still applies. */ }
  }
  window.addEventListener('pointerdown',request,{once:true,passive:true});
  window.addEventListener('keydown',request,{once:true,passive:true});
})();
