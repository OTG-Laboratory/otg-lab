/* OTG! v6.0.115 — Race Off Stage 3: entrant selection + frozen persistent field */
(()=>{
'use strict';
const escRO=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const labelCar=c=>{try{return carName(c)}catch(_){return [c?.make,c?.model,c?.year].filter(Boolean).join(' ')||'Unknown car'}};
function store(){const s=rhSpace();if(!Array.isArray(s.raceOffs))s.raceOffs=[];return s.raceOffs;}
function categoryCars(type,value){return (rhEligible(type,value)||[]).slice();}
function snapshot(c){return {sourceCarId:c.id,make:String(c.make||''),model:String(c.model||''),year:String(c.year||''),classType:String(c.classType||''),name:labelCar(c)};}
function activeRaceOff(){return store().filter(x=>x&&!['complete','abandoned'].includes(x.status)).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')))[0]||null;}
function redrawLanding(){show('raceoff');}

window.rhRaceOffCataloguePick=function(type,value,name,count){
  const cars=categoryCars(type,value);
  if(cars.length<2)return toast('At least 2 eligible cars are required');
  window.rhRaceOffDraft={type,value,name:String(name||'Race Off'),eligibleIds:cars.map(c=>c.id),selected:new Set(cars.map(c=>c.id)),query:''};
  rhRenderRaceOffEntrants();
};

window.rhRenderRaceOffEntrants=function(){
 const d=window.rhRaceOffDraft;if(!d)return redrawLanding();
 const host=document.getElementById('raceoff');
 const cars=categoryCars(d.type,d.value).filter(c=>d.eligibleIds.includes(c.id));
 const q=String(d.query||'').toLowerCase().trim();
 const filtered=cars.filter(c=>!q||`${c.make} ${c.model} ${c.year} ${c.classType}`.toLowerCase().includes(q));
 const groups=new Map();filtered.sort((a,b)=>String(a.make||'').localeCompare(String(b.make||''))||labelCar(a).localeCompare(labelCar(b))).forEach(c=>{const m=c.make||'Unknown';if(!groups.has(m))groups.set(m,[]);groups.get(m).push(c)});
 const selectedCount=d.selected.size;
 host.innerHTML=`<div class="rhFestivalV1 rhRaceOffV1 rhRaceOffSelectV1">
   <section class="rhFestivalHeroV1 rhRaceOffHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRaceOffDraft=null;rhRenderRaceOff()" aria-label="Back">‹</button><div><h1>RACE OFF</h1><p>SELECT ENTRANTS</p></div></div></section>
   <main class="rhFestivalBodyV1">
    <section class="rhFestivalSectionV1 rhRaceOffSetupIntro"><label>RACE OFF NAME</label><input id="rhRaceOffName" class="rhSearch" value="${escRO(d.name)}" oninput="rhRaceOffDraft.name=this.value">
      <div class="rhRaceOffSelectionHead"><div><h2>SELECT CARS</h2><p>${cars.length} eligible cars</p></div><div class="rhRaceOffSelectionButtons"><button class="chip" onclick="rhRaceOffSelectAll(true)">SELECT ALL</button><button class="chip" onclick="rhRaceOffSelectAll(false)">CLEAR ALL</button></div></div>
      <input class="rhSearch" autocomplete="off" placeholder="Search manufacturer, car, year or class" value="${escRO(d.query)}" oninput="rhRaceOffSearch(this.value)">
    </section>
    <section class="rhFestivalSectionV1 rhRaceOffEntrantGroups">${[...groups.entries()].map(([make,list])=>{const full=categoryCars(d.type,d.value).filter(c=>(c.make||'Unknown')===make);const sel=full.filter(c=>d.selected.has(c.id)).length;const checked=sel===full.length?'checked':'';const mixed=sel>0&&sel<full.length?'data-mixed="1"':'';return `<details class="rhRaceOffMakeSelect" ${q?'open':''}><summary><label class="rhRaceOffMakeCheck" onclick="event.stopPropagation()"><input type="checkbox" ${checked} ${mixed} onchange="rhRaceOffToggleMake('${encodeURIComponent(make)}',this.checked)"><span>${escRO(make)}</span><b>${sel}/${full.length}</b></label><em>⌄</em></summary><div>${list.map(c=>`<label class="rhRaceOffCarPick"><input type="checkbox" ${d.selected.has(c.id)?'checked':''} onchange="rhRaceOffToggleCar('${c.id}',this.checked)"><span><b>${escRO(c.model||c.name||labelCar(c))}</b><small>${[c.year,c.classType].filter(Boolean).map(escRO).join(' • ')}</small></span></label>`).join('')}</div></details>`}).join('')||'<p class="small">No matching cars.</p>'}</section>
    <div class="rhRaceOffStickyLock"><div><b id="rhRaceOffSelectedCount">${selectedCount}</b><span>CARS SELECTED</span></div><button class="btn" ${selectedCount<2?'disabled':''} onclick="rhRaceOffConfirmLock()">LOCK ${selectedCount} ENTR${selectedCount===1?'Y':'IES'} &amp; CONTINUE</button></div>
   </main></div>`;
 document.querySelectorAll('.rhRaceOffMakeCheck input[data-mixed="1"]').forEach(x=>x.indeterminate=true);
 window.scrollTo(0,0);
};
window.rhRaceOffSearch=function(v){const d=window.rhRaceOffDraft;if(!d)return;d.query=v;const pos=document.activeElement?.selectionStart;rhRenderRaceOffEntrants();const input=[...document.querySelectorAll('.rhRaceOffSetupIntro .rhSearch')][1];if(input){input.focus();try{input.setSelectionRange(pos,pos)}catch(_){}}};
window.rhRaceOffSelectAll=function(on){const d=window.rhRaceOffDraft;if(!d)return;d.selected=on?new Set(d.eligibleIds):new Set();rhRenderRaceOffEntrants();};
window.rhRaceOffToggleCar=function(id,on){const d=window.rhRaceOffDraft;if(!d)return;on?d.selected.add(id):d.selected.delete(id);rhRenderRaceOffEntrants();};
window.rhRaceOffToggleMake=function(encoded,on){const d=window.rhRaceOffDraft;if(!d)return;const make=decodeURIComponent(encoded);categoryCars(d.type,d.value).filter(c=>(c.make||'Unknown')===make).forEach(c=>on?d.selected.add(c.id):d.selected.delete(c.id));rhRenderRaceOffEntrants();};
window.rhRaceOffConfirmLock=function(){const d=window.rhRaceOffDraft;if(!d||d.selected.size<2)return toast('Select at least 2 cars');d.name=String(document.getElementById('rhRaceOffName')?.value||d.name||'Race Off').trim()||'Race Off';rhConfirm({title:'LOCK RACE OFF FIELD?',copy:`${d.selected.size} cars will enter ${d.name}. The field cannot be changed once the Race Off is created.`,confirmLabel:'LOCK ENTRIES',onConfirm:'rhRaceOffLockDraft()'});};
window.rhRaceOffLockDraft=function(){const d=window.rhRaceOffDraft;if(!d||d.selected.size<2)return;const now=new Date().toISOString();const eligible=categoryCars(d.type,d.value);const chosen=eligible.filter(c=>d.selected.has(c.id));const ro={id:rhId('raceoff'),name:d.name,type:d.type,value:d.value,status:'prepared',createdAt:now,updatedAt:now,fieldLockedAt:now,entryIds:chosen.map(c=>c.id),entrants:chosen.map(snapshot),rounds:[],currentRoundIndex:0,championCarId:null};store().push(ro);rhSave();window.rhRaceOffDraft=null;window.rhCurrentRaceOffId=ro.id;rhRenderRaceOffLocked(ro.id);};
window.rhRenderRaceOffLocked=function(id){const ro=store().find(x=>x.id===id);if(!ro)return redrawLanding();window.rhCurrentRaceOffId=ro.id;const host=document.getElementById('raceoff');host.innerHTML=`<div class="rhFestivalV1 rhRaceOffV1"><section class="rhFestivalHeroV1 rhRaceOffHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRenderRaceOff()" aria-label="Back">‹</button><div><h1>RACE OFF</h1><p>FIELD LOCKED</p></div></div></section><main class="rhFestivalBodyV1"><section class="rhFestivalSectionV1 rhRaceOffLockedCard"><small>READY FOR ROUND 1 SETUP</small><h2>${escRO(ro.name)}</h2><strong>${ro.entryIds.length} CARS LOCKED</strong><p>The entrant field has been frozen and saved to this OTG! Space. Garage changes will not alter this Race Off.</p><div class="rhRaceOffLockedPreview">${ro.entrants.slice(0,5).map(c=>`<div>${escRO(c.name)}</div>`).join('')}${ro.entrants.length>5?`<div>+ ${ro.entrants.length-5} more</div>`:''}</div><button class="btn" onclick="toast('Round 1 setup arrives in Stage 4')">CONTINUE TO ROUND 1 SETUP</button></section></main></div>`;window.scrollTo(0,0);};

// Add a persistent Continue card to the catalogue landing without changing the Stage 2 catalogue structure.
const baseRender=window.rhRenderRaceOff;
window.rhRenderRaceOff=function(){baseRender();const ro=activeRaceOff();if(!ro)return;const body=document.querySelector('#raceoff .rhFestivalBodyV1');if(!body)return;body.insertAdjacentHTML('afterbegin',`<section class="rhFestivalSectionV1 rhRaceOffContinue"><h2>CONTINUE RACE OFF</h2><button class="rhChampCard" onclick="rhRenderRaceOffLocked('${ro.id}')"><span><b>${escRO(ro.name)}</b><small>${ro.entryIds?.length||ro.entrants?.length||0} cars locked • Ready for Round 1 setup</small></span><em>›</em></button></section>`);};
})();

// v6.0.115 wiring hardening: delegated launcher for every Race Off catalogue card.
document.addEventListener('click',function(e){
  const card=e.target.closest?.('#raceoff .rhRaceOffLaunchCard');
  if(!card)return;
  e.preventDefault();
  e.stopPropagation();
  const type=card.dataset.roType||'';
  const value=card.dataset.roValue||'';
  const name=card.dataset.roName||'Race Off';
  const count=Number(card.dataset.roCount||0);
  window.rhRaceOffCataloguePick(type,value,name,count);
});
