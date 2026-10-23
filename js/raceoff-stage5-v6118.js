/* OTG! v6.0.118 — Race Off Stage 5: persistent random draw engine + preliminary rounds */
(()=>{
'use strict';
const esc5=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
function list5(){const s=rhSpace();if(!Array.isArray(s.raceOffs))s.raceOffs=[];return s.raceOffs;}
function find5(id){return list5().find(x=>String(x.id)===String(id));}
function round5(ro,index=0){ro.rounds=Array.isArray(ro.rounds)?ro.rounds:[];if(!ro.rounds[index])ro.rounds[index]={id:rhId('raceoff-round'),number:index+1,name:'',layout:'',notes:'',status:'setup',createdAt:new Date().toISOString()};return ro.rounds[index];}
function count5(ro){return ro.entrants?.length||ro.entryIds?.length||0;}
function pow2Floor(n){let p=1;while(p*2<=n)p*=2;return p;}
function mainStageLabel(n,number=1){if(n===32)return 'ROUND OF 32';if(n===16)return 'ROUND OF 16';if(n===8)return 'QUARTER-FINALS';if(n===4)return 'SEMI-FINALS';if(n===2)return 'FINAL';return `ROUND ${number}`;}
function plan5(n){n=Math.max(2,Math.floor(Number(n)||2));const target=pow2Floor(n);if(n>target){const matches=n-target,straight=(2*target)-n;return{kind:'preliminary',field:n,matches,straight,advance:target,label:'PRELIMINARY ROUND',nextLabel:mainStageLabel(target,1)};}return{kind:'main',field:n,matches:Math.floor(n/2),straight:0,advance:Math.floor(n/2),label:mainStageLabel(n,1),nextLabel:mainStageLabel(Math.floor(n/2),2)};}
function randomInt(max){if(max<=1)return 0;try{const a=new Uint32Array(1),lim=Math.floor(0x100000000/max)*max;let x;do{crypto.getRandomValues(a);x=a[0];}while(x>=lim);return x%max;}catch(_){return Math.floor(Math.random()*max);}}
function shuffle5(items){const a=items.slice();for(let i=a.length-1;i>0;i--){const j=randomInt(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function snap5(c){return {sourceCarId:String(c.sourceCarId||c.id||''),make:String(c.make||''),model:String(c.model||''),year:String(c.year||''),classType:String(c.classType||''),name:String(c.name||[c.make,c.model,c.year].filter(Boolean).join(' ')||'Unknown car')};}
function matchCard5(m){return `<div class="rhRaceOffDrawMatchV6118"><small>${esc5(m.label)}</small><b>${esc5(m.carA.name)}</b><span>VS</span><b>${esc5(m.carB.name)}</b></div>`;}
function straightCard5(c,i){return `<div class="rhRaceOffStraightV6118"><small>${String(i+1).padStart(3,'0')}</small><b>${esc5(c.name)}</b><span>STRAIGHT THROUGH</span></div>`;}
function stageHeading5(ro,index=0){const r=round5(ro,index);return r.drawPlan?.label||plan5(count5(ro)).label;}

window.rhRaceOffStage5Plan=plan5;

// Stage 4 review, updated to the locked Preliminary Round / Straight Through language.
window.rhRaceOffRenderDrawReview=function(id,index=0){
 const ro=find5(id);if(!ro)return rhRenderRaceOff();const r=round5(ro,index),remaining=count5(ro),p=plan5(remaining),host=document.getElementById('raceoff');
 const statClass=p.kind==='preliminary'?'':' rhRaceOffDrawStatsTwoV6118';
 host.innerHTML=`<div class="rhFestivalV1 rhRaceOffV1 rhRaceOffDrawSceneV6118"><section class="rhFestivalHeroV1 rhRaceOffHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRaceOffOpenRoundSetup('${ro.id}')" aria-label="Back">‹</button><div><h1>${esc5(ro.name)}</h1><p>${esc5(p.label)} DRAW</p></div></div></section><main class="rhFestivalBodyV1">
 <section class="rhFestivalSectionV1 rhRaceOffDrawReviewV6118"><strong class="rhRaceOffRemainV6116">${remaining} CARS REMAIN</strong><h2>THIS ROUND</h2><div class="rhListRow"><span>TRACK / RACE</span><strong>${esc5(r.name)}</strong></div>${r.layout?`<div class="rhListRow"><span>LAYOUT</span><strong>${esc5(r.layout)}</strong></div>`:''}${r.notes?`<p class="small rhRaceOffReviewNotesV6116">${esc5(r.notes)}</p>`:''}</section>
 <section class="rhFestivalSectionV1 rhRaceOffDrawStatsV6116${statClass}"><div><b>${p.matches}</b><span>${p.kind==='preliminary'?'PRELIM MATCHES':'MATCHES'}</span></div>${p.kind==='preliminary'?`<div><b>${p.straight}</b><span>STRAIGHT THROUGH</span></div>`:''}<div><b>${p.advance}</b><span>ADVANCE TO ${esc5(p.nextLabel)}</span></div></section>
 <section class="rhFestivalSectionV1"><p>${p.kind==='preliminary'?`${p.matches*2} cars will be drawn into the Preliminary Round. ${p.straight} cars will go straight through to ${esc5(p.nextLabel)}.`:'All pairings will be selected completely at random.'} Once the draw starts, it cannot be changed.</p><button class="btn secondary" onclick="rhRaceOffOpenRoundSetup('${ro.id}')">EDIT ROUND</button><button class="btn" onclick="rhRaceOffStartDraw('${ro.id}',${index})">START DRAW</button></section>
 </main></div>`;window.scrollTo(0,0);
};

window.rhRaceOffStartDraw=function(id,index=0){
 const ro=find5(id);if(!ro)return rhRenderRaceOff();const r=round5(ro,index);
 if(r.status==='drawn'&&Array.isArray(r.matches))return rhRaceOffRenderDrawComplete(id,index);
 const entrants=(ro.entrants||[]).map(snap5);if(entrants.length<2)return toast('At least 2 cars are required');
 const p=plan5(entrants.length),shuffled=shuffle5(entrants),now=new Date().toISOString();let raceCars,straight=[];
 if(p.kind==='preliminary'){raceCars=shuffled.slice(0,p.matches*2);straight=shuffled.slice(p.matches*2);}else{raceCars=shuffled;}
 const matches=[];for(let i=0;i<raceCars.length;i+=2){const n=(i/2)+1;matches.push({id:rhId('raceoff-match'),order:n,label:p.kind==='preliminary'?`PRELIM ${String(n).padStart(3,'0')}`:`MATCH ${String(n).padStart(3,'0')}`,carA:snap5(raceCars[i]),carB:snap5(raceCars[i+1]),attempts:[],status:'pending',winnerCarId:null,loserCarId:null});}
 r.drawPlan={...p};r.matches=matches;r.straightThrough=straight.map(snap5);r.drawOrder=shuffled.map(c=>String(c.sourceCarId||''));r.status='drawn';r.drawLockedAt=now;r.updatedAt=now;ro.status='drawn';ro.updatedAt=now;rhSave();
 rhRaceOffRenderDrawComplete(id,index);
};

window.rhRaceOffDrawTab=function(id,index,tab){window.rhRaceOffDrawTabState=tab;rhRaceOffRenderDrawComplete(id,index);};
window.rhRaceOffRenderDrawComplete=function(id,index=0){
 const ro=find5(id);if(!ro)return rhRenderRaceOff();const r=round5(ro,index);if(r.status!=='drawn'||!Array.isArray(r.matches))return rhRaceOffRenderDrawReview(id,index);
 const p=r.drawPlan||plan5(count5(ro)),tab=(window.rhRaceOffDrawTabState==='straight'&&r.straightThrough?.length)?'straight':'matches',host=document.getElementById('raceoff');
 const listHtml=tab==='matches'?r.matches.map(matchCard5).join(''):(r.straightThrough||[]).map(straightCard5).join('');
 host.innerHTML=`<div class="rhFestivalV1 rhRaceOffV1 rhRaceOffDrawSceneV6118"><section class="rhFestivalHeroV1 rhRaceOffHeroV1"><div class="rhFestivalHeadV1"><button class="rhFestivalBackV1" onclick="rhRenderRaceOff()" aria-label="Back">‹</button><div><h1>${esc5(ro.name)}</h1><p>${esc5(p.label)} DRAW COMPLETE</p></div></div></section><main class="rhFestivalBodyV1">
 <section class="rhFestivalSectionV1 rhRaceOffDrawCompleteHeadV6118"><strong>${r.matches.length} ${p.kind==='preliminary'?'PRELIMINARY ':''}MATCH${r.matches.length===1?'':'ES'}</strong>${r.straightThrough?.length?`<span> • ${r.straightThrough.length} STRAIGHT THROUGH TO ${esc5(p.nextLabel)}</span>`:''}<p class="small">Draw saved ${new Date(r.drawLockedAt).toLocaleString()}</p></section>
 <section class="rhFestivalSectionV1 rhRaceOffDrawListShellV6118"><div class="rhRaceOffDrawTabsV6118"><button class="${tab==='matches'?'active':''}" onclick="rhRaceOffDrawTab('${ro.id}',${index},'matches')">MATCHES</button>${r.straightThrough?.length?`<button class="${tab==='straight'?'active':''}" onclick="rhRaceOffDrawTab('${ro.id}',${index},'straight')">STRAIGHT THROUGH (${r.straightThrough.length})</button>`:''}</div><div class="rhRaceOffDrawScrollV6118">${listHtml}</div></section>
 <section class="rhFestivalSectionV1"><p>The draw is final and cannot be changed.</p><button class="btn" onclick="toast('Strict match racing arrives in Stage 6')">START ${esc5(p.label)}</button></section>
 </main></div>`;window.scrollTo(0,0);
};

// Resume a saved draw rather than dropping back to the field-locked checkpoint.
const prevLocked5=window.rhRenderRaceOffLocked;
window.rhRenderRaceOffLocked=function(id){const ro=find5(id),i=Number(ro?.currentRoundIndex||0),r=ro&&ro.rounds?.[i];if(ro&&r?.status==='drawn')return rhRaceOffRenderDrawComplete(id,i);return prevLocked5(id);};

// Make the setup heading use Preliminary Round when the initial field is not a clean power of two.
const prevSetup5=window.rhRaceOffOpenRoundSetup;
window.rhRaceOffOpenRoundSetup=function(id){prevSetup5(id);const ro=find5(id);if(!ro)return;const p=plan5(count5(ro));const host=document.getElementById('raceoff');host.querySelector('.rhEventStatus')?.replaceChildren(document.createTextNode(p.label+' SETUP'));const head=host.querySelector('.rhScene .title, .rhScene h1');/* existing shared header stays otherwise unchanged */};

// Landing-card status follows persisted draw state.
const prevLanding5=window.rhRenderRaceOff;
window.rhRenderRaceOff=function(){prevLanding5();const ro=list5().filter(x=>x&&x.status!=='complete').sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')))[0];if(!ro)return;const card=document.querySelector('#raceoff .rhRaceOffContinue .rhChampCard');if(!card)return;const i=Number(ro.currentRoundIndex||0),r=ro.rounds?.[i],small=card.querySelector('small');if(r?.status==='drawn'&&small){const p=r.drawPlan||plan5(count5(ro));small.textContent=`${count5(ro)} cars locked • ${p.label} draw complete`;}};
})();
