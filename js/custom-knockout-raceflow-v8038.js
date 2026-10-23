/* OTG! v8.0.38 — Custom Knockout Records/PB wiring. */
(()=>{
'use strict';
const baseSetup=window.rhEventSetupHtml, baseStart=window.rhStartEvent, baseOpen=window.rhOpenEvent, baseResult=window.rhEventResult;
const event=id=>rhSpace().customEvents.find(x=>String(x.id)===String(id));
const car=id=>rhSpace().cars.find(c=>String(c.id)===String(id));
const escx=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
const now=()=>new Date().toISOString();
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):String(v||'');
function isKO(e){return e?.competitionFormat==='knockout'}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function plan(e){return window.rhCustomKOPlan8034?.(rhEventRacerCount(e))||null}
function roundLabel(size){return size===2?'FINAL':size===4?'SEMI-FINAL':size===8?'QUARTER-FINAL':`ROUND OF ${size}`}
function activeRound(e){return e.customKO?.rounds?.[e.customKO.currentRound]||null}
function matchDone(m){return !!m?.winnerId}
function nextEntry(e,r){if(!r?.matches)return null;for(const m of r.matches){if(!m.resultA)return {m,side:'A',carId:m.carA};if(!m.resultB)return {m,side:'B',carId:m.carB};}return null}
function allRoundDone(r){return !!r?.matches?.length&&r.matches.every(matchDone)}
function koBack(){if(typeof rhRenderEvents==='function')rhRenderEvents();if(typeof show==='function')show('events');window.scrollTo(0,0)}
window.rhCustomKOBack8037=koBack;

window.rhEventSetupHtml=function(e){
 let html=baseSetup(e);if(!isKO(e))return html;
 const p=plan(e), ready=!!p&&p.entrants<=64&&rhEventChosenCars(e).length===rhEventRacerCount(e);
 html=html.replace(/<button class="btn rhStartEvent" disabled>START KNOCKOUT EVENT<\/button><p class="small rhStartNote">[\s\S]*?<\/p>/,`<button class="btn rhStartEvent" ${ready?'':'disabled'} onclick="rhStartEvent('${e.id}')">START KNOCKOUT EVENT</button><p class="small rhStartNote">${ready?'Starting freezes racers and the Knockout bracket. Tracks are chosen one round at a time.':'Choose the full entrant field before START.'}</p>`);
 return html;
};

window.rhStartEvent=function(id){
 const e=event(id);if(!isKO(e))return baseStart(id);if(rhEventIsStarted(e))return;
 const chosen=rhEventChosenCars(e),p=plan(e);if(!p||chosen.length!==rhEventRacerCount(e))return toast('Choose all racers first');if(p.entrants>64)return toast('Custom Knockout supports up to 64 racers');
 const ids=shuffle(chosen.map(c=>c.id));
 e.frozenCarIds=[...ids];e.startedAt=now();e.status='active';e.results=[];
 e.customKO={plan:p,currentRound:0,rounds:[],championId:null,completed:false};
 if(p.prelimMatches>0){
   const racers=ids.slice(0,p.prelimMatches*2),straight=ids.slice(p.prelimMatches*2);
   e.customKO.rounds.push({id:rhId('ko-round'),index:1,label:'PRELIMINARY ROUND',participantIds:[...ids],straightThroughIds:straight,matchCount:p.prelimMatches,status:'setup',trackName:'',matches:null});
 }else{
   e.customKO.rounds.push({id:rhId('ko-round'),index:1,label:roundLabel(p.main),participantIds:[...ids],straightThroughIds:[],matchCount:p.main/2,status:'setup',trackName:'',matches:null});
 }
 rhSave();rhOpenEvent(id);
};

function renderSetup(e,r){show('event');const ko=e.customKO;document.getElementById('event').innerHTML=`<div class="rhContent"><button class="v8GroupVisibleBack" onclick="rhCustomKOBack8037()">‹ BACK</button><section class="rhSection"><small>CUSTOM KNOCKOUT</small><h2>${escx(r.label)} SETUP</h2><p>${r.matchCount} match${r.matchCount===1?'':'es'}${r.straightThroughIds?.length?` • ${r.straightThroughIds.length} straight through`:''}. Choose one track for this round.</p></section><section class="rhSection"><h2>Round Track</h2><input id="rhKOTrack8037" value="${escx(r.trackName||'')}" placeholder="Track / race name"><button class="btn" onclick="rhCustomKOStartRound8037('${e.id}')">START ${escx(r.label)}</button></section></div>`;window.scrollTo(0,0)}

window.rhCustomKOStartRound8037=function(id){const e=event(id),r=activeRound(e);if(!e||!r)return;const track=String(document.getElementById('rhKOTrack8037')?.value||'').trim();if(!track)return toast('Choose a track first');r.trackName=track;let ids;
 if(r.label==='PRELIMINARY ROUND')ids=shuffle(r.participantIds.filter(id=>!r.straightThroughIds.includes(id)));else ids=shuffle(r.participantIds);
 r.matches=[];for(let i=0;i<ids.length;i+=2)r.matches.push({id:rhId('ko-match'),label:`MATCH ${r.matches.length+1}`,carA:ids[i],carB:ids[i+1],resultA:null,resultB:null,winnerId:null});r.status='racing';r.startedAt=now();rhSave();renderRound(e,r)};

function renderRound(e,r){show('event');const n=nextEntry(e,r),completed=r.matches?.filter(matchDone).length||0;document.getElementById('event').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><header class="rhOverviewHeroV1"><button class="rhOverviewBackV1" onclick="rhCustomKOBack8037()">‹</button><div class="rhOverviewBrandV1"><small>CUSTOM KNOCKOUT • ${escx(r.label)}</small><h1>${escx(e.name)}</h1><span>${escx(r.trackName)} • ${completed}/${r.matchCount} MATCHES COMPLETE</span></div></header><main class="rhOverviewBodyV1"><div class="v8GroupTopRow"><button class="v8GroupVisibleBack" onclick="rhCustomKOBack8037()">‹ BACK</button><div class="v8GroupIdentity">${escx(r.label)}</div></div>${n?`<section class="rhCurrentCarV1"><div class="rhCurrentCarHeadV1"><div><small>CURRENT MATCH</small><h2>${escx(n.m.label)}</h2></div><strong>${r.matches.indexOf(n.m)+1} OF ${r.matchCount}</strong></div><div class="rhCurrentCarMetaV1"><div><span>${n.side==='A'?'FIRST':'SECOND'} RACER</span><b>${escx(carName(car(n.carId)))}</b></div><div><span>TRACK</span><b>${escx(r.trackName)}</b></div></div><button class="rhContinueV1" onclick="rhEventResult('${e.id}')"><span>▶</span><div><b>CONTINUE</b><small>${escx(n.m.label)}</small></div></button></section>`:''}<section class="v8TrackBoards"><h2>MATCHES</h2>${(r.matches||[]).map((m,i)=>{const done=!!m.winnerId;return `<div class="rhKOMatch8037 ${done?'complete':'waiting'}"><div class="rhKOMatchNo8037">${i+1}</div><div class="rhKOMatchBody8037"><div class="rhKORacer8037 ${done&&m.winnerId===m.carA?'winner':''}"><span>${escx(carName(car(m.carA)))}</span><b>${m.resultA?fmt(m.resultA.time):'—'}</b></div><div class="rhKORacer8037 ${done&&m.winnerId===m.carB?'winner':''}"><span>${escx(carName(car(m.carB)))}</span><b>${m.resultB?fmt(m.resultB.time):'—'}</b></div>${done?`<div class="rhKOWinner8037"><small>WINNER</small><strong>${escx(carName(car(m.winnerId)))}</strong></div>`:''}</div><div class="rhKOStatus8037">${done?'COMPLETE':'WAITING'}</div></div>`}).join('')}</section>${r.straightThroughIds?.length?`<section class="v823Qualified"><div><small>${escx(r.label)}</small><h2>STRAIGHT THROUGH</h2></div><div class="v823QualifiedGrid">${r.straightThroughIds.map((id,i)=>`<span><b>${i+1}</b>${escx(carName(car(id)))}</span>`).join('')}</div></section>`:''}</main></div>`;window.scrollTo(0,0)}

window.rhOpenEvent=function(id){const e=event(id);if(!isKO(e)||!e.customKO)return baseOpen(id);if(e.status==='complete')return renderChampion(e);const r=activeRound(e);if(!r)return baseOpen(id);if(r.status==='setup')return renderSetup(e,r);if(r.status==='complete')return renderRoundComplete(e,r);return renderRound(e,r)};

const SEG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
function segDigit(ch){return `<i class="rhSegDigit">${'abcdefg'.split('').map(x=>`<span class="s${x} ${(SEG[ch]||'').includes(x)?'on':''}"></span>`).join('')}</i>`}
function segGroup(v,n){return String(v||'').padStart(n,'0').slice(-n).split('').map(segDigit).join('')}
function segField(id,n,next,label){return `<label class="rhStopwatchField" aria-label="${label}"><span id="${id}Display" class="rhStopwatchSegmentDisplay">${segGroup('0',n)}</span><input id="${id}" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="${n}" autocomplete="off" enterkeyhint="next" aria-label="${label}" onfocus="this.select()" oninput="rhStopwatchInput(this,'rhKO','${next}',${n})"></label>`}
function stopwatch(){return `<div class="rh5801Stopwatch"><div class="rhStopwatchTop"><span class="rhStopwatchReady"><i></i> READY</span><span class="rhStopwatchIcon">◷</span></div><div class="rhStopwatchDisplay"><div class="rhStopwatchDigits">${segField('rhKOMin',2,'rhKOSec','Minutes')}<span>:</span>${segField('rhKOSec',2,'rhKOMs','Seconds')}<span>.</span>${segField('rhKOMs',3,'rhKOSave','Milliseconds')}</div><div class="rhStopwatchUnits"><span>MINUTES</span><span>SECONDS</span><span>MILLISECONDS</span></div></div><p>Tap a section and type the race time</p></div>`}
window.rhEventResult=function(id){const e=event(id);if(!isKO(e)||!e.customKO)return baseResult(id);const r=activeRound(e),n=nextEntry(e,r);if(!n)return renderRound(e,r);show('event');document.getElementById('event').innerHTML=`<main class="rh5801Entry"><section class="rh5801Hero"><button class="rh5801Back" onclick="rhOpenEvent('${e.id}')">‹</button><div class="rh5801Head"><h1>ENTER RESULT</h1><p>${escx(r.trackName)}</p></div></section><section class="rh5801Context"><small>${escx(e.name)} • ${escx(r.label)} • ${escx(n.m.label)} • ${n.side==='A'?'FIRST RACER':'SECOND RACER'}</small><b>${escx(carName(car(n.carId)))}</b></section><section class="rh5801Controls">${stopwatch()}<button id="rhKOSave" class="rh5801Save" onclick="rhSaveCustomKOResult8037('${e.id}','${r.id}','${n.m.id}','${n.side}')"><span>🏁</span><b>SAVE RESULT</b></button></section></main>`;window.scrollTo(0,0);setTimeout(()=>document.getElementById('rhKOMin')?.focus(),80)};

function rhCustomKOTrackRows8038(trackName,layout=''){try{const rows=window.rhV7RecordsFoundation?.allRows?.()||[];const norm=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase();return rows.filter(x=>norm(x.track)===norm(trackName)&&norm(x.layout||'')===norm(layout||''));}catch(_){return[]}}
const KORECSEG8038={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
function rhCustomKORecDigit8038(ch){const on=KORECSEG8038[ch]||'';return `<i class="rhSegDigit" aria-hidden="true">${'abcdefg'.split('').map(x=>`<span class="s${x} ${on.includes(x)?'on':''}"></span>`).join('')}</i>`}
function rhCustomKOSegTime8038(value){const t=fmt(value),m=t.slice(0,2),sec=t.slice(3,5),ms=t.slice(6),group=v=>v.split('').map(rhCustomKORecDigit8038).join('');return `<span class="rhSegTime rhRecordGoldSeg" aria-label="${t}">${group(m)}<em>:</em>${group(sec)}<em>.</em>${group(ms)}</span>`}
function rhCustomKORecordNotice8038(e,r,res,after){
 const records=res.championshipRecord||res.allTime;if(!records)return after();
 const previous=res.allTime?res.previousAllTimeBest:res.previousChampionshipBest;
 const improvement=Number.isFinite(Number(previous))?Math.max(0,Number(previous)-Number(res.time||0)):null;
 show('event');
 document.getElementById('event').innerHTML=`<div class="rhRecord127Page">
  <div class="rhRecord127Hero"><img src="assets/final/record-celebration-hero-v6127.png?v=6127" alt="OTG! record celebration"><button class="rhRecord127Back" id="rhCustomKORecordBack8038" aria-label="Back"></button>${!res.allTime?'<span class="rhRecord127HideGold"></span>':''}</div>
  <main class="rhRecord127Main">
   <section class="rhRecord127Best"><b>YOUR NEW BEST TIME</b><div>${rhCustomKOSegTime8038(res.time)}</div></section>
   ${Number.isFinite(Number(previous))?`<section class="rhRecord127Stat previous"><span class="rhRecord127Icon">◷</span><div><small>PREVIOUS BEST</small><b>${fmt(previous)}</b></div></section><section class="rhRecord127Stat improvement"><span class="rhRecord127Icon">↗</span><div><small>IMPROVEMENT</small><b>−${fmt(improvement)}</b></div></section>`:''}
  </main>
  <footer class="rhRecord127Actions"><button id="rhCustomKORecordStandings8038"><span>🏆</span><b>VIEW CURRENT<br>STANDINGS</b></button><button id="rhCustomKORecordContinue8038"><span>🏁</span><b>CONTINUE EVENT</b></button></footer>
 </div>`;
 const view=()=>renderRound(e,r);
 setTimeout(()=>{document.getElementById('rhCustomKORecordBack8038')?.addEventListener('click',view);document.getElementById('rhCustomKORecordStandings8038')?.addEventListener('click',view);document.getElementById('rhCustomKORecordContinue8038')?.addEventListener('click',after)},0);
 window.scrollTo(0,0)
}
window.rhSaveCustomKOResult8037=function(id,rid,mid,side){const e=event(id),r=activeRound(e),m=r?.matches?.find(x=>String(x.id)===String(mid));if(!e||!r||!m)return;const mm=Number(document.getElementById('rhKOMin')?.value||0),ss=Number(document.getElementById('rhKOSec')?.value||0),ms=Number((document.getElementById('rhKOMs')?.value||'0').padEnd(3,'0')),time=mm*60+ss+ms/1000;if(!Number.isFinite(time)||time<=0||ss>59||ms>999)return toast('Enter a valid race time');const carId=side==='A'?m.carA:m.carB;const norm=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase(),eventPrior=(e.results||[]).filter(x=>!x.advancedTiming&&norm(x.track||x.roundName)===norm(r.trackName)),trackPrior=rhCustomKOTrackRows8038(r.trackName,''),minePrior=trackPrior.filter(x=>String(x.carId)===String(carId)),previousChampionshipBest=eventPrior.length?Math.min(...eventPrior.map(x=>Number(x.time))):null,previousAllTimeBest=trackPrior.length?Math.min(...trackPrior.map(x=>Number(x.time))):null;const res={id:rhId('result'),carId,roundId:r.id,roundName:r.trackName,track:r.trackName,layout:'',time,date:now(),championshipRecord:previousChampionshipBest!=null&&time<previousChampionshipBest,allTime:previousAllTimeBest!=null&&time<previousAllTimeBest,personalBest:!!minePrior.length&&time<Math.min(...minePrior.map(x=>Number(x.time))),previousChampionshipBest,previousAllTimeBest,v8CustomKO:true,matchId:m.id};if(side==='A')m.resultA=res;else m.resultB=res;e.results=e.results||[];e.results.push(res);if(m.resultA&&m.resultB){m.winnerId=Number(m.resultA.time)<=Number(m.resultB.time)?m.carA:m.carB;m.completedAt=now()}if(allRoundDone(r)){r.status='complete';r.completedAt=now()}rhSave();const after=()=>rhOpenEvent(id);rhCustomKORecordNotice8038(e,r,res,after)};

function renderRoundComplete(e,r){show('event');const winners=r.matches.map(m=>m.winnerId),nextIds=r.label==='PRELIMINARY ROUND'?[...r.straightThroughIds,...winners]:winners;const isFinal=nextIds.length===1;if(isFinal){e.customKO.championId=nextIds[0];e.winnerCarId=nextIds[0];e.status='complete';e.completedAt=now();rhSave();return renderChampion(e)}document.getElementById('event').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><button class="v8GroupVisibleBack" onclick="rhCustomKOBack8037()">‹ BACK</button><section class="v8Reveal"><div class="v8GroupIdentity">${escx(r.label)}</div><div class="v8RevealTitle"><small>ROUND COMPLETE</small><h2>${nextIds.length} ADVANCE</h2></div>${r.matches.map((m,i)=>`<div class="v8Standing"><b>${i+1}</b><span>${escx(carName(car(m.winnerId)))}</span><strong>QUALIFIED</strong></div>`).join('')}${r.straightThroughIds?.length?`<p>${r.straightThroughIds.length} straight-through cars join the winners in the next round.</p>`:''}<button class="btn" onclick="rhCustomKONextRound8037('${e.id}')">SET UP NEXT ROUND</button></section></main></div>`;window.scrollTo(0,0)}

window.rhCustomKONextRound8037=function(id){const e=event(id),ko=e?.customKO,r=activeRound(e);if(!e||!ko||!r)return;const winners=r.matches.map(m=>m.winnerId),ids=r.label==='PRELIMINARY ROUND'?[...r.straightThroughIds,...winners]:winners;const nr={id:rhId('ko-round'),index:ko.rounds.length+1,label:roundLabel(ids.length),participantIds:[...ids],straightThroughIds:[],matchCount:ids.length/2,status:'setup',trackName:'',matches:null};ko.rounds.push(nr);ko.currentRound=ko.rounds.length-1;rhSave();rhOpenEvent(id)};

function renderChampion(e){show('event');const id=e.customKO?.championId||e.winnerCarId;document.getElementById('event').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><section class="v8Reveal"><div class="v8GroupIdentity">CUSTOM KNOCKOUT FINAL</div><div class="v8RevealTitle"><small>EVENT COMPLETE</small><h2>CHAMPION DECIDED</h2></div><div class="v8Standing qualified"><b>1</b><span>${escx(carName(car(id)))}</span><strong>CHAMPION</strong></div><button class="btn" onclick="rhCustomKOBack8037()">RETURN TO CUSTOM RACING</button></section></main></div>`;window.scrollTo(0,0)}
})();
