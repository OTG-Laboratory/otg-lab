/* OTG! v6.0.149 — Race Off maintenance: live entrants until START + first-round draw hardening. */
(()=>{
'use strict';
const esc149=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
function ros(){const s=rhSpace();if(!Array.isArray(s.raceOffs))s.raceOffs=[];return s.raceOffs;}
function find(id){return ros().find(x=>String(x.id)===String(id));}
function eligible(ro){try{return (rhEligible(ro.type,ro.value)||[]).slice()}catch(_){return[]}}
function snap(c){return {sourceCarId:String(c.id||c.sourceCarId||''),make:String(c.make||''),model:String(c.model||''),year:String(c.year||''),classType:String(c.classType||''),name:typeof carName==='function'?carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ')}};
function liveChosen(ro){const ids=new Set((ro.entryIds||[]).map(String));return eligible(ro).filter(c=>ids.has(String(c.id)));}

// Stage 3 now saves a prepared Race Off, but does not freeze its entrant snapshots.
window.rhRaceOffConfirmLock=function(){const d=window.rhRaceOffDraft;if(!d||d.selected.size<2)return toast('Select at least 2 cars');d.name=String(document.getElementById('rhRaceOffName')?.value||d.name||'Race Off').trim()||'Race Off';return window.rhRaceOffLockDraft();};
window.rhRaceOffLockDraft=function(){const d=window.rhRaceOffDraft;if(!d||d.selected.size<2)return;const now=new Date().toISOString();const chosen=eligible({type:d.type,value:d.value}).filter(c=>d.selected.has(c.id));const ro={id:rhId('raceoff'),name:d.name,type:d.type,value:d.value,status:'prepared',createdAt:now,updatedAt:now,entryIds:chosen.map(c=>c.id),entrants:[],rounds:[],currentRoundIndex:0,championCarId:null};ros().push(ro);rhSave();window.rhRaceOffDraft=null;window.rhCurrentRaceOffId=ro.id;rhRaceOffOpenRoundSetup(ro.id);};

window.rhRaceOffEditEntrants149=function(id){const ro=find(id);if(!ro||ro.fieldLockedAt)return;const cars=eligible(ro),ids=new Set((ro.entryIds||[]).map(String));window.rhRaceOffDraft={type:ro.type,value:ro.value,name:ro.name,eligibleIds:cars.map(c=>c.id),selected:new Set(cars.filter(c=>ids.has(String(c.id))).map(c=>c.id)),query:'',editingRaceOffId:ro.id};rhRenderRaceOffEntrants();};
const baseEntrants=window.rhRenderRaceOffEntrants;
window.rhRenderRaceOffEntrants=function(){baseEntrants();const d=window.rhRaceOffDraft;if(!d?.editingRaceOffId)return;const btn=[...document.querySelectorAll('#raceoff .rhRaceOffStickyLock .btn')][0];if(btn){btn.textContent=`SAVE ${d.selected.size} ENTR${d.selected.size===1?'Y':'IES'} & CONTINUE`;btn.onclick=()=>{if(d.selected.size<2)return toast('Select at least 2 cars');const ro=find(d.editingRaceOffId);if(!ro)return;ro.name=String(document.getElementById('rhRaceOffName')?.value||d.name||ro.name).trim()||ro.name;ro.entryIds=[...d.selected];ro.updatedAt=new Date().toISOString();rhSave();window.rhRaceOffDraft=null;rhRaceOffOpenRoundSetup(ro.id);};} };

// Keep an Edit Entrants route visible on first-round setup/review until the draw actually starts.
const baseSetup=window.rhRaceOffOpenRoundSetup;
window.rhRaceOffOpenRoundSetup=function(id){const ro=find(id);baseSetup(id);if(!ro||ro.fieldLockedAt||Number(ro.currentRoundIndex||0)!==0)return;const first=document.querySelector('#raceoff .rhRaceOffRoundSetupV6116 .rhSection');if(first&&!document.getElementById('rhEditEntrants149'))first.insertAdjacentHTML('beforeend',`<button id="rhEditEntrants149" class="btn secondary" onclick="rhRaceOffEditEntrants149('${ro.id}')">EDIT ENTRANTS</button>`);};
const baseReview=window.rhRaceOffRenderDrawReview;
window.rhRaceOffRenderDrawReview=function(id,index=0){const ro=find(id);baseReview(id,index);if(!ro)return;const start=[...document.querySelectorAll('#raceoff button.btn')].find(b=>b.textContent.trim()==='START DRAW');if(start){start.removeAttribute('onclick');start.onclick=()=>rhRaceOffStartDraw(id,index);}if(!ro.fieldLockedAt&&Number(index)===0){const edit=[...document.querySelectorAll('#raceoff button.btn.secondary')].find(b=>b.textContent.includes('EDIT ROUND'));if(edit&&!document.getElementById('rhEditEntrantsReview149'))edit.insertAdjacentHTML('beforebegin',`<button id="rhEditEntrantsReview149" class="btn secondary" onclick="rhRaceOffEditEntrants149('${ro.id}')">EDIT ENTRANTS</button>`);}};

// Final wrapper around the proven Stage 5 engine: snapshot the current live selection only when START DRAW is pressed.
const stage5Start=window.rhRaceOffStartDraw;
window.rhRaceOffStartDraw=function(id,index=0){const ro=find(id);if(!ro)return;if(Number(index)===0&&!ro.fieldLockedAt){const chosen=liveChosen(ro);if(chosen.length<2)return toast('Select at least 2 available cars');ro.entryIds=chosen.map(c=>c.id);ro.entrants=chosen.map(snap);ro.fieldLockedAt=new Date().toISOString();ro.updatedAt=ro.fieldLockedAt;rhSave();}return stage5Start(id,index);};
})();
