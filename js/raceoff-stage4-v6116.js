/* OTG! v6.0.116 — Race Off Stage 4: shared-style Round Setup + optional Layout + Review Draw */
(()=>{
'use strict';
const e4=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
function list(){const s=rhSpace();if(!Array.isArray(s.raceOffs))s.raceOffs=[];return s.raceOffs;}
function find(id){return list().find(x=>String(x.id)===String(id));}
function roundLabel(ro,index=0){const n=index+1;return n===ro.rounds?.length&&false?'FINAL':`ROUND ${n}`;}
function ensureRound(ro,index=0){ro.rounds=Array.isArray(ro.rounds)?ro.rounds:[];if(!ro.rounds[index])ro.rounds[index]={id:rhId('raceoff-round'),number:index+1,name:'',layout:'',notes:'',status:'setup',createdAt:new Date().toISOString()};return ro.rounds[index];}
function savedRaceNames(){try{return rhSavedRoundNames?.()||[]}catch(_){return[];}}
function drawMath(n){n=Math.max(2,Math.floor(Number(n)||2));let target=1;while(target*2<=n)target*=2;if(target===n)return{matches:n/2,byes:0,advance:n/2};return{matches:n-target,byes:(2*target)-n,advance:target};}
window.rhRaceOffOpenRoundSetup=function(id){const ro=find(id);if(!ro)return rhRenderRaceOff();const i=Number(ro.currentRoundIndex||0),r=ensureRound(ro,i);window.rhCurrentRaceOffId=ro.id;const host=document.getElementById('raceoff');const names=savedRaceNames();host.innerHTML=`<div class="rhScene rhEventsScene">${rhHeader('RACE OFF — '+roundLabel(ro,i),ro.name,'raceoff','raceoff')}</div><div class="rhContent rhRaceOffRoundSetupV6116">
 <section class="rhSection"><div class="rhEventStatus">${roundLabel(ro,i)} SETUP</div><h2>${e4(ro.name)}</h2><p>${ro.entrants?.length||ro.entryIds?.length||0} cars remain. Set the race for this round, then review the draw.</p></section>
 <section class="rhSection"><h2>Race Setup</h2><label>Track / Race</label><input id="rhRaceOffTrack" class="rhSearch" autocomplete="off" placeholder="e.g. The Marathon" value="${e4(r.name||'')}">
  ${names.length?`<button type="button" class="rhSavedRaceButtonV1" onclick="rhRaceOffOpenSavedRacePicker('${ro.id}',${i})">▾ CHOOSE SAVED RACE NAME</button>`:''}
  <label>Layout <small>(optional)</small></label><input id="rhRaceOffLayout" class="rhSearch" autocomplete="off" placeholder="e.g. Nordschleife" value="${e4(r.layout||'')}">
  <label>Round Notes <small>(optional)</small></label><textarea id="rhRaceOffNotes" class="rhSearch rhRaceOffNotesV6116" rows="4" placeholder="Any settings or rules you want to remember for this round">${e4(r.notes||'')}</textarea>
 </section>
 <button class="btn rhPrimaryWide" onclick="rhRaceOffReviewDraw('${ro.id}',${i})">REVIEW DRAW</button>
 <p class="small rhStartNote">Nothing is locked by reviewing. The round and previous results lock only when the draw actually starts.</p>
 </div>`;window.scrollTo(0,0);};
window.rhRaceOffOpenSavedRacePicker=function(id,index){const names=savedRaceNames();if(!names.length)return toast('No saved race names yet');document.getElementById('rhRaceOffRacePicker')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhRaceOffRacePicker" class="rhOverlay" onclick="if(event.target===this)this.remove()"><div class="rhModal rhRoundNamePickerModal"><button class="rhModalX" onclick="document.getElementById('rhRaceOffRacePicker').remove()">×</button><small>SAVED RACE NAMES</small><h2>Choose a Race</h2><div class="rhRoundNamePickerList">${names.map(n=>`<button onclick="rhRaceOffChooseSavedRace('${id}',${index},decodeURIComponent('${encodeURIComponent(n)}'))"><span>${e4(n)}</span><em>›</em></button>`).join('')}</div><button class="btn secondary" onclick="document.getElementById('rhRaceOffRacePicker').remove()">TYPE A NEW NAME</button></div></div>`);};
window.rhRaceOffChooseSavedRace=function(id,index,name){const ro=find(id),r=ro&&ensureRound(ro,index);if(!r)return;r.name=String(name||'').trim();rhSave();document.getElementById('rhRaceOffRacePicker')?.remove();rhRaceOffOpenRoundSetup(id);};
window.rhRaceOffReviewDraw=function(id,index){const ro=find(id),r=ro&&ensureRound(ro,index);if(!r)return;const track=String(document.getElementById('rhRaceOffTrack')?.value||'').trim(),layout=String(document.getElementById('rhRaceOffLayout')?.value||'').trim(),notes=String(document.getElementById('rhRaceOffNotes')?.value||'').trim();if(!track){document.getElementById('rhRaceOffTrack')?.focus();return toast('Enter the Track / Race for this round');}r.name=track;r.layout=layout;r.notes=notes;r.status='setup';r.updatedAt=new Date().toISOString();ro.updatedAt=r.updatedAt;rhSave();rhRaceOffRenderDrawReview(id,index);};
window.rhRaceOffRenderDrawReview=function(id,index=0){const ro=find(id);if(!ro)return rhRenderRaceOff();const r=ensureRound(ro,index),remaining=ro.entrants?.length||ro.entryIds?.length||0,m=drawMath(remaining),host=document.getElementById('raceoff');host.innerHTML=`<div class="rhFestivalV1 rhRaceOffV1"><section class="rhFestivalHeroV1 rhRaceOffHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRaceOffOpenRoundSetup('${ro.id}')" aria-label="Back">‹</button><div><h1>${e4(ro.name)}</h1><p>${roundLabel(ro,index)} DRAW</p></div></div></section><main class="rhFestivalBodyV1">
 <section class="rhFestivalSectionV1 rhRaceOffDrawReviewV6116"><strong class="rhRaceOffRemainV6116">${remaining} CARS REMAIN</strong><h2>THIS ROUND</h2><div class="rhListRow"><span>TRACK / RACE</span><strong>${e4(r.name)}</strong></div>${r.layout?`<div class="rhListRow"><span>LAYOUT</span><strong>${e4(r.layout)}</strong></div>`:''}${r.notes?`<p class="small rhRaceOffReviewNotesV6116">${e4(r.notes)}</p>`:''}</section>
 <section class="rhFestivalSectionV1 rhRaceOffDrawStatsV6116"><div><b>${m.matches}</b><span>MATCHES</span></div><div><b>${m.byes}</b><span>BYES</span></div><div><b>${m.advance}</b><span>ADVANCE</span></div></section>
 <section class="rhFestivalSectionV1"><p>Pairings and byes will be selected completely at random. Once the draw starts, it cannot be changed.</p><button class="btn secondary" onclick="rhRaceOffOpenRoundSetup('${ro.id}')">EDIT ROUND</button><button class="btn" onclick="toast('Draw engine arrives in Stage 5')">START DRAW</button></section>
 </main></div>`;window.scrollTo(0,0);};

// Replace the Stage 3 checkpoint action with the real Round Setup entry point.
const oldLocked=window.rhRenderRaceOffLocked;
window.rhRenderRaceOffLocked=function(id){oldLocked(id);const b=[...document.querySelectorAll('#raceoff button')].find(x=>x.textContent.includes('CONTINUE TO ROUND 1 SETUP'));if(b)b.onclick=()=>rhRaceOffOpenRoundSetup(id);};
})();
