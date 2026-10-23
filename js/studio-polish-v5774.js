/* OTG! v5.7.75 — Stopwatch + Timing Board polish layer.
   Visual-only overrides over the v5.7.73 tested functional baseline. */
(()=>{
const q=id=>document.getElementById(id);
const safe=s=>esc(String(s??''));
const fmt=n=>rhFmtTime(Number(n||0));
const SEGMENTS={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg','-':'g'};
function segDigit(ch){const on=SEGMENTS[ch]||'';return `<i class="rhSegDigit" aria-hidden="true">${'abcdefg'.split('').map(x=>`<span class="s${x} ${on.includes(x)?'on':''}"></span>`).join('')}</i>`}
function segGroup(value,len){return String(value??'').padStart(len,'0').slice(-len).split('').map(segDigit).join('')}
function segTime(value){const t=fmt(value),m=t.slice(0,2),sec=t.slice(3,5),ms=t.slice(6);return `<span class="rhSegTime" aria-label="${t}">${segGroup(m,2)}<em>:</em>${segGroup(sec,2)}<em>.</em>${segGroup(ms,3)}</span>`}
window.rhRefreshStopwatch=function(prefix){const vals=[['Min',2],['Sec',2],['Ms',3]];vals.forEach(([suffix,len])=>{const input=q(prefix+suffix),display=q(prefix+suffix+'Display');if(!input||!display)return;input.value=String(input.value||'').replace(/\D/g,'').slice(0,len);display.innerHTML=segGroup(input.value||'0',len);display.classList.toggle('filled',!!input.value)})};
window.rhStopwatchInput=function(el,prefix,nextId,maxLen){el.value=String(el.value||'').replace(/\D/g,'').slice(0,maxLen);rhRefreshStopwatch(prefix);if(el.value.length>=maxLen&&nextId){const next=q(nextId);next?.focus();next?.select?.()}};

function stopwatchFields(prefix,nextSaveId=''){
  const min=prefix+'Min',sec=prefix+'Sec',ms=prefix+'Ms';
  const field=(id,suffix,len,next,label)=>`<label class="rhStopwatchField" aria-label="${label}"><span id="${id}Display" class="rhStopwatchSegmentDisplay">${segGroup('0',len)}</span><input id="${id}" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="${len}" autocomplete="off" enterkeyhint="next" aria-label="${label}" onfocus="this.select()" oninput="rhStopwatchInput(this,'${prefix}','${next}',${len})"></label>`;
  return `<div class="rhStopwatchConsole" aria-label="Digital stopwatch time entry">
    <div class="rhStopwatchTop"><span class="rhStopwatchReady"><i></i> READY</span><span class="rhStopwatchIcon">◷</span></div>
    <div class="rhStopwatchDisplay">
      <div class="rhStopwatchDigits">${field(min,'Min',2,sec,'Minutes')}<span>:</span>${field(sec,'Sec',2,ms,'Seconds')}<span>.</span>${field(ms,'Ms',3,nextSaveId,'Milliseconds')}</div>
      <div class="rhStopwatchUnits"><span>MINUTES</span><span>SECONDS</span><span>MILLISECONDS</span></div>
    </div>
    <p>Tap a section and type the race time</p>
  </div>`;
}
function boardRows(rows,highlightId=null,limitContext=false){
  let display=rows;
  if(limitContext&&highlightId){
    const at=rows.findIndex(x=>(x.id||x.car?.id)===highlightId);
    if(at>=0)display=rows.slice(Math.max(0,at-2),Math.min(rows.length,at+3));
  }
  return `<div class="rhTimingBoardRows">${display.map((x,idx)=>{
    const id=x.id||x.car?.id,globalPos=rows.indexOf(x)+1,name=x.car?carName(x.car):carName(carById(x.id)),on=id===highlightId;
    return `<div class="rhTimingBoardRow ${on?'current':''} ${globalPos===1?'leader':''}"><b>${globalPos}</b><span class="rhTimingCarName">${safe(name)}</span><strong>${segTime(x.total)}</strong></div>`;
  }).join('')}</div>`;
}
function timingBoard(title,subtitle,rows,highlightId=null,context=false){
 return `<section class="rhTimingBoard ${highlightId?'hasCurrent':''}">
   <div class="rhTimingBoardHead"><div><small>OFFICIAL CLASSIFICATION</small><h2>${safe(title)}</h2>${subtitle?`<p>${safe(subtitle)}</p>`:''}</div><span>${rows.length} ${rows.length===1?'CAR':'CARS'}</span></div>
   <div class="rhTimingBoardCols"><b>POS</b><b>CAR</b><b>TOTAL TIME</b></div>
   ${rows.length?boardRows(rows,highlightId,context):'<div class="rhTimingBoardEmpty">No classified cars yet</div>'}
   ${highlightId?'<p class="rhTimingBoardHint">Your latest result is highlighted</p>':''}
 </section>`;
}
function runBoard(r){return (r.entries||[]).map(id=>{const rr=(r.results||[]).filter(x=>x.carId===id);return rr.length===(r.rounds||[]).length?{id,total:rr.reduce((a,b)=>a+Number(b.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total)}

window.rhEnterResult=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>x.id===runId),c=carById(carId),rd=r?.rounds.find(x=>x.id===roundId);if(!r||!c||!rd)return;
 const submit=rhSubmissionState(r.entries||[],r.rounds||[],r.results||[],carId,roundId,'CHAMPIONSHIP');
 show('festival');q('festival').innerHTML=`<div class="rhScene rhChampScene rhResultSceneFinal">${rhHeader('ENTER RESULT',rd.name,'festival','festival')}</div><div class="rhContent rhConformance rhResultContentFinal"><section class="rhResultEntry rhGlassHero rhResultEntryFinal rhStopwatchEntryFinal">
  <div class="rhEyebrow">${safe(r.name)}</div><h2>${safe(rd.name)}</h2><div class="rhResultCar"><small>CURRENT CAR</small><b>${safe(carName(c))}</b></div>
  ${stopwatchFields('rh')}
  <div class="rhPositionTitleFinal"><label>FINISHING POSITION</label><span id="rhPositionGridStatus">SELECT ONE</span></div>
  <div class="rhPositionGrid rhPositionGridFinal" id="rhPositionGrid">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" data-pos="${n}" aria-pressed="false" onclick="rhSelectResultPosition('rhPositionGrid',${n})">${n}</button>`).join('')}</div>
  <p class="rhSubmitWarningV1">${safe(submit.copy)}</p><button id="rhStopwatchSave" class="btn rhPrimaryWide rhSaveResultFinalBtn" onclick="rhSaveResultFinal('${runId}','${carId}','${roundId}')">${safe(submit.label)}<small>RECORD THIS RACE</small></button>
 </section></div>`;
 setTimeout(()=>q('rhMin')?.focus(),50);
};

const baseEventSave=window.rhSaveEventResult;
window.rhEventResult=function(id){
 const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||e.status!=='active')return;const next=rhEventNextPair(e);if(!next){e.status='complete';e.completedAt=new Date().toISOString();rhSave();return rhOpenEvent(id)}
 q('rhEventResultEditor')?.remove();show('event');
 q('event').innerHTML=`<div class="rhScene rhEventsScene rhResultSceneFinal">${rhHeader('ENTER RESULT',next.round.name,'events','event')}</div><div class="rhContent rhConformance rhResultContentFinal"><section class="rhResultEntry rhGlassHero rhResultEntryFinal rhStopwatchEntryFinal"><div class="rhEyebrow">${safe(e.name)}</div><h2>${safe(next.round.name)}</h2><div class="rhResultCar"><small>CURRENT CAR</small><b>${safe(carName(next.car))}</b></div>${stopwatchFields('rhEvent','rhEventSave')}<button id="rhEventSave" class="btn rhPrimaryWide rhSaveResultFinalBtn" onclick="rhSaveEventResult('${id}','${next.car.id}','${next.round.id}')">SAVE RESULT<small>RECORD THIS RACE</small></button></section></div>`;
 setTimeout(()=>q('rhEventMin')?.focus(),50);
};

window.rhResultSummary=function(r,res){
 const c=carById(res.carId),records=res.championshipRecord||res.allTime,next=rhNextSlot(r),hist=rhHistoricalTrackAverage(r,res),roundCount=(r.rounds||[]).length,carRoundDone=(r.results||[]).filter(x=>x.carId===res.carId&&(r.rounds||[]).some(rd=>rd.id===x.roundId)).length,carPct=roundCount?Math.round(carRoundDone/roundCount*100):0;
 const carDone=rhRunCarIsComplete(r,res.carId),nextDifferent=!!(next&&next.carId!==res.carId);let label='NEXT RACE',sub='CONTINUE CHAMPIONSHIP',action=`rhOpenRun('${r.id}')`;
 if(r.status==='complete'){label='CHAMPIONSHIP COMPLETE';sub='VIEW COMPLETION';action=`rhChampionshipCompleteTransition('${r.id}')`}else if(carDone&&nextDifferent){label='CAR COMPLETE';sub='VIEW TOTAL & NEXT CAR';action=`rhRunCarCompleteTransition('${r.id}','${res.carId}')`}
 const rows=runBoard(r);
 show('festival');q('festival').innerHTML=`<div class="rhScene rhChampScene rhResultSceneFinal">${rhHeader('RESULT ACCEPTED',res.roundName,'festival','festival')}</div><div class="rhContent rhConformance rhResultContentFinal"><section class="rhResultsSummary rhResultsSummaryFinal">
  <div class="rhSummaryAcceptedFinal"><span>✓</span><div><small>RESULT ACCEPTED</small><b>${safe(carName(c))} • ${fmt(res.time)}</b></div></div>
  ${timingBoard('CURRENT STANDINGS',r.name,rows,res.carId,true)}
  ${rhAverageCompareHtml(hist)}${records?`<div class="rhRecordCelebration rhRecordCelebrationFinal"><div class="rhRosettes">${res.championshipRecord?'<b>✹ CHAMPIONSHIP RECORD</b>':''}${res.allTime?'<b class="gold">✹ ALL-TIME OTG! RECORD</b>':''}</div><img src="assets/final/hubs.png" alt="Hubs"><p>Incredible driving,<br><b>well done!</b></p></div>`:''}
  <div class="rhProgressCard"><small>CHAMPIONSHIP PROGRESS</small><b>${carRoundDone} OF ${roundCount} ROUNDS COMPLETE</b><span>${carPct}%</span><div class="progress"><div class="bar" style="width:${carPct}%"></div></div></div>
  <button class="btn rhPrimaryWide rhResultContinueFinal" onclick="${action}"><b>${label}</b><small>${sub}</small></button>
 </section></div>`;
};

window.rhEventResultSummary=function(e,res){
 const car=rhEventCars(e).find(c=>c.id===res.carId),board=rhEventLeaderboard(e),next=rhEventNextPair(e),complete=e.status==='complete';
 show('event');q('event').innerHTML=`<div class="rhScene rhEventsScene rhResultSceneFinal">${rhHeader('RESULT ACCEPTED',res.roundName,'events','event')}</div><div class="rhContent rhConformance rhResultContentFinal"><section class="rhResultsSummary rhResultsSummaryFinal"><div class="rhSummaryAcceptedFinal"><span>✓</span><div><small>RESULT ACCEPTED</small><b>${safe(carName(car))} • ${fmt(res.time)}</b></div></div>${timingBoard('CURRENT STANDINGS',e.name,board,res.carId,true)}<button class="btn rhPrimaryWide rhResultContinueFinal" onclick="${complete?`rhEventCompleteTransition('${e.id}')`:`rhOpenEvent('${e.id}')`}"><b>${complete?'EVENT COMPLETE':'CONTINUE EVENT'}</b><small>${complete?'VIEW COMPLETION':'RETURN TO EVENT'}</small></button></section></div>`;
};

window.rhRunCarCompleteTransition=function(runId,carId){
 const r=rhCurrentRuns().find(x=>x.id===runId),c=carById(carId);if(!r||!c)return;
 const done=r.entries.filter(cid=>rhRunCarIsComplete(r,cid)).map(cid=>({id:cid,total:rhRunCarTotal(r,cid)})).sort((a,b)=>a.total-b.total);
 show('festival');q('festival').innerHTML=`<div class="rhScene rhChampScene rhResultSceneFinal">${rhHeader('CAR COMPLETE',r.name,'festival','festival')}</div><div class="rhContent rhConformance rhResultContentFinal"><section class="rhCarComplete rhCarCompleteFinal rhCarCompleteBoardFinal">
  <div class="rhCompleteMark">✓</div><small>ALL ROUNDS COMPLETE</small><h2>${safe(carName(c))}</h2>
  <div class="rhTotalTime rhTotalTimeFinal"><span>CUMULATIVE TOTAL TIME</span><strong>${segTime(rhRunCarTotal(r,carId))}</strong></div>
  ${timingBoard('FINAL CLASSIFICATION',r.name,done,carId,false)}
  <button class="btn rhPrimaryWide" onclick="rhOpenRun('${r.id}')">RETURN TO CHAMPIONSHIP</button>
 </section></div>`;
};

function decorateBoards(root=document){
 root.querySelectorAll('.rhFinalClassificationV1').forEach(section=>section.classList.add('rhTimingBoard','rhTimingBoardFinal'));
 root.querySelectorAll('.rhFinalRowsV1').forEach(rows=>rows.classList.add('rhTimingBoardRows'));
 root.querySelectorAll('.rhFinalRowV1,.rhMiniLeaderFinal').forEach(row=>{
   row.classList.add('rhTimingBoardRow');
   const name=row.querySelector('span');if(name)name.classList.add('rhTimingCarName');
   const time=row.querySelector('strong');if(time&&!time.querySelector('.rhSegTime')){const text=time.textContent.trim(),m=text.match(/^(\d{1,2}):(\d{2})\.(\d{3})$/);if(m)time.innerHTML=`<span class="rhSegTime" aria-label="${text}">${segGroup(m[1],2)}<em>:</em>${segGroup(m[2],2)}<em>.</em>${segGroup(m[3],3)}</span>`}
 });
 const queue=root.querySelector('.rhQueueWindowV1');
 if(queue){const rows=[...queue.querySelectorAll('.rhLineupRowV1')].filter(x=>!x.classList.contains('complete'));rows.forEach((row,i)=>{const n=row.querySelector('i');if(n)n.textContent=String(i+1)});queue.innerHTML='';rows.forEach(r=>queue.appendChild(r));queue.classList.add('rhQueueNextOnlyV575');}
}
const originalOpenRun=window.rhOpenRun;
if(originalOpenRun)window.rhOpenRun=function(id){const out=originalOpenRun(id);decorateBoards(q('festival'));return out};
const originalCompletedEvent=window.rhShowCompletedEventLeaderboard;
if(originalCompletedEvent)window.rhShowCompletedEventLeaderboard=function(id){const out=originalCompletedEvent(id);decorateBoards(q('event'));return out};
const originalRunCarComplete=window.rhRunCarCompleteTransition;
if(originalRunCarComplete)window.rhRunCarCompleteTransition=function(...args){const out=originalRunCarComplete(...args);decorateBoards(q('festival'));return out};
const originalEventCarComplete=window.rhEventCarCompleteTransition;
if(originalEventCarComplete)window.rhEventCarCompleteTransition=function(...args){const out=originalEventCarComplete(...args);decorateBoards(q('event'));return out};

const originalRenderOnboarding=window.rhRenderOnboarding;
if(originalRenderOnboarding)window.rhRenderOnboarding=function(step){const out=originalRenderOnboarding(step);if(step===3){const panel=document.querySelector('.rhOnboardingCard,.rhOnboardingPanel,.rhOnboarding');if(panel){panel.querySelectorAll('p').forEach((p,i)=>{if(i===0)p.textContent='Build your Garage, create Championships or Events, record each race result and watch your racing history grow.';if(i===1)p.textContent='Each OTG! Space keeps its own Garage, Championships, Records, Hall of Fame and Stats separate, so every racing game stays organised.'})}}return out};

document.addEventListener('DOMContentLoaded',()=>decorateBoards(document));
})();
