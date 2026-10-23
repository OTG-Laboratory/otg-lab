
/* OTG! v5.7.9 — Locked Screen Rebuild Candidate
   Authoritative Studio UI controller over protected working OTG! logic. */
(()=>{
const q=id=>document.getElementById(id);
const safe=s=>esc(String(s??''));
const resultScreen=(host,title,subtitle,body)=>{const isEvent=host?.id==='event';host.innerHTML=`<div class="rhScene ${isEvent?'rhEventsScene':'rhChampScene'} rhResultSceneFinal">${rhHeader(title,subtitle,isEvent?'events':'festival',isEvent?'event':'festival')}</div><div class="rhContent rhConformance rhResultContentFinal">${body}</div>`};

window.rhConfirm=function({title,copy,detail='',safeguard='',confirmLabel='CONFIRM',cancelLabel='CANCEL',danger=false,severity='',onConfirm=''}) {
  q('rhConfirmOverlay')?.remove();
  const sev=severity||(danger?'destructive':'cyan');
  document.body.insertAdjacentHTML('beforeend',`<div id="rhConfirmOverlay" class="rhOverlay"><div class="rhModal rhConfirmModal rhConfirmFinal ${sev}">
    <button class="rhModalX" onclick="$('rhConfirmOverlay').remove()">×</button><div class="rhConfirmIcon">${sev==='destructive'?'!':sev==='purple'?'★':sev==='caution'?'!':'↻'}</div>
    <h2>${safe(title)}</h2><p>${safe(copy)}</p>${detail?`<div class="rhConfirmDetail">${safe(detail)}</div>`:''}${safeguard?`<div class="rhSafeguard">◇ ${safe(safeguard)}</div>`:''}
    <div class="rhModalActions"><button class="btn secondary" onclick="$('rhConfirmOverlay').remove()">${safe(cancelLabel)}</button><button class="btn ${danger?'dangerBtn':''}" onclick="$('rhConfirmOverlay').remove();${onConfirm}">${safe(confirmLabel)}</button></div>
  </div></div>`);
};

window.rhEmpty=function(title,copy,action='',fn=''){
 const purple=/HALL OF FAME/i.test(title);
 return `<div class="rhEmpty rhEmptyFinal ${purple?'purple':''}"><div class="rhEmptyMark">${purple?'☆':'◇'}</div><h2>${safe(title)}</h2><div class="rhEmptyLine"></div><p>${safe(copy)}</p>${action?`<button class="btn" onclick="${fn}">${safe(action)}</button>`:''}</div>`;
};

window.rhSelectResultPosition=function(gridId,n){
 const grid=q(gridId);if(!grid)return;
 grid.dataset.pos=String(n);
 grid.querySelectorAll('button').forEach(b=>{const on=Number(b.dataset.pos)===Number(n);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',on?'true':'false')});
 const status=q(gridId+'Status');if(status)status.textContent='POSITION '+n+' SELECTED';
};
window.rhEnterResult=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>x.id===runId),c=carById(carId),rd=r?.rounds.find(x=>x.id===roundId); if(!r||!c||!rd)return;
 resultScreen(q('festival'),'ENTER RESULT',rd.name,`<section class="rhResultEntry rhGlassHero rhResultEntryFinal">
  <div class="rhEyebrow">${safe(r.name)}</div><h2>${safe(rd.name)}</h2>
  <div class="rhResultCar"><small>CURRENT CAR</small><b>${safe(carName(c))}</b></div>
  <label>TOTAL RACE TIME</label>
  <div class="rhTimeEntry rhTimeEntryLarge"><input id="rhMin" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhSec',2)"><span>:</span><input id="rhSec" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhMs',2)"><span>.</span><input id="rhMs" inputmode="numeric" maxlength="3" placeholder="000"></div>
  <small class="rhTimeHintFinal">MIN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SEC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MS</small>
  <div class="rhPositionTitleFinal"><label>FINISHING POSITION</label><span id="rhPositionGridStatus">SELECT ONE</span></div>
  <div class="rhPositionGrid rhPositionGridFinal" id="rhPositionGrid">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" data-pos="${n}" aria-pressed="false" onclick="rhSelectResultPosition('rhPositionGrid',${n})">${n}</button>`).join('')}</div>
  <button class="btn rhPrimaryWide rhSaveResultFinalBtn" onclick="rhSaveResultFinal('${runId}','${carId}','${roundId}')">SAVE RESULT<small>RECORD THIS RACE</small></button>
 </section>`);
 setTimeout(()=>q('rhMin')?.focus(),50);
};
window.rhSaveResultFinal=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>x.id===runId); if(!r)return;
 const m=Number(q('rhMin')?.value||0),s=Number(q('rhSec')?.value||0),ms=Number((q('rhMs')?.value||'0').padEnd(3,'0'));
 const v=m*60+s+ms/1000,pos=Number(document.querySelector('.rhPositionGrid')?.dataset.pos)||null;
 if(!isFinite(v)||v<=0||s>59||ms>999)return toast('Enter a valid race time');
 const rd=r.rounds.find(x=>x.id===roundId), priorAll=rhCurrentRuns().flatMap(x=>x.results||[]).filter(x=>x.roundName===rd?.name),runPrior=r.results.filter(x=>x.roundId===roundId);
 const championshipRecord=!!runPrior.length&&v<Math.min(...runPrior.map(x=>x.time)),allTime=!!priorAll.length&&v<Math.min(...priorAll.map(x=>x.time));
 const res={id:rhId('result'),carId,roundId,roundName:rd.name,time:v,position:pos,date:new Date().toISOString(),championshipRecord,allTime};
 r.results.push(res); if(!rhNextSlot(r)){r.status='complete';r.completedAt=new Date().toISOString()} rhSave(); rhResultAccepted(r,res,'festival');
};
window.rhHistoricalTrackAverage=function(owner,res,kind='festival'){const prior=(owner?.results||[]).filter(y=>y.id!==res.id&&y.roundName===res.roundName&&Number.isFinite(Number(y.time)));if(!prior.length)return null;const avg=prior.reduce((a,b)=>a+Number(b.time),0)/prior.length,diff=Number(res.time)-avg;return {avg,diff,count:prior.length}};
window.rhAverageCompareHtml=function(hist){if(!hist)return'';return `<div class="rhAverageCompareV1 ${hist.diff<0?'good':hist.diff>0?'bad':'even'}"><small>TRACK AVERAGE</small><b>${rhFmtTime(hist.avg)}</b><strong>${hist.diff<0?'−':hist.diff>0?'+':'±'}${rhFmtTime(Math.abs(hist.diff))} ${hist.diff<0?'FASTER':hist.diff>0?'SLOWER':'ON AVERAGE'}</strong><span>Based on ${hist.count} previous result${hist.count===1?'':'s'} for this track</span></div>`};
window.rhResultAccepted=function(owner,res,kind='festival'){
 const host=q(kind==='events'?'event':'festival');if(!host)return;
 const cls=kind==='events'?'rhAcceptedEvents':'rhAcceptedChamp';
 host.innerHTML=`<div class="rhAccepted ${cls} rhAcceptedFinal"><div class="rhAcceptedShadeFinal"></div><div class="rhAcceptedGlass rhAcceptedGlassFinal"><div class="rhAcceptedTick">✓</div><h1>RESULT ACCEPTED</h1><p>Your result has been recorded.</p><small>${safe(res.roundName)}</small></div></div>`;
 setTimeout(()=>kind==='events'?rhEventResultSummary(owner,res):rhResultSummary(owner,res),900);
};
window.rhRunCarIsComplete=function(r,carId){return !!r?.rounds?.length&&r.rounds.every(rd=>(r.results||[]).some(x=>x.carId===carId&&x.roundId===rd.id))};
window.rhRunCarTotal=function(r,carId){return (r.results||[]).filter(x=>x.carId===carId).reduce((a,b)=>a+Number(b.time||0),0)};
window.rhResultSummary=function(r,res){
 const c=carById(res.carId),records=res.championshipRecord||res.allTime,next=rhNextSlot(r),hist=rhHistoricalTrackAverage(r,res,'festival'),roundCount=(r.rounds||[]).length,carRoundDone=(r.results||[]).filter(x=>x.carId===res.carId&&(r.rounds||[]).some(rd=>rd.id===x.roundId)).length,carPct=roundCount?Math.round(carRoundDone/roundCount*100):0;
 const carDone=rhRunCarIsComplete(r,res.carId),nextDifferent=!!(next&&next.carId!==res.carId);
 let label='NEXT RACE',sub='CONTINUE CHAMPIONSHIP',action=`rhOpenRun('${r.id}')`;
 if(r.status==='complete'){label='CHAMPIONSHIP COMPLETE';sub='VIEW COMPLETION';action=`rhChampionshipCompleteTransition('${r.id}')`}
 else if(carDone&&nextDifferent){label='CAR COMPLETE';sub='VIEW TOTAL & NEXT CAR';action=`rhRunCarCompleteTransition('${r.id}','${res.carId}')`}
 resultScreen(q('festival'),'RESULTS SUMMARY',res.roundName,`<section class="rhResultsSummary rhResultsSummaryFinal">
  <div class="rhSummaryAcceptedFinal"><span>✓</span><div><small>RESULT SAVED</small><b>${safe(res.roundName)}</b></div></div>
  <div class="rhSummaryCard"><small>CHAMPIONSHIP</small><b>${safe(r.name)}</b></div>
  <div class="rhSummaryCard"><small>CAR</small><b>${safe(carName(c))}</b></div>
  <div class="rhResultHero rhResultHeroFinal"><div><small>FINISHING POSITION</small><strong>${res.position?safe(res.position):'—'}</strong></div><div><small>TOTAL RACE TIME</small><strong>${rhFmtTime(res.time)}</strong></div></div>
  ${rhAverageCompareHtml(hist)}${records?`<div class="rhRecordCelebration rhRecordCelebrationFinal"><div class="rhRosettes">${res.championshipRecord?'<b>✹ CHAMPIONSHIP RECORD</b>':''}${res.allTime?'<b class="gold">✹ ALL-TIME OTG! RECORD</b>':''}</div><img src="assets/final/hubs.png" alt="Hubs"><p>Incredible driving,<br><b>well done!</b></p></div>`:''}
  <div class="rhProgressCard"><small>CHAMPIONSHIP PROGRESS</small><b>${carRoundDone} OF ${roundCount} ROUNDS COMPLETE</b><span>${carPct}%</span><div class="progress"><div class="bar" style="width:${carPct}%"></div></div></div>
  <button class="btn rhPrimaryWide rhResultContinueFinal" onclick="${action}"><b>${label}</b><small>${sub}</small></button>
 </section>`);
};
window.rhRunCarCompleteTransition=function(runId,carId){
 const r=rhCurrentRuns().find(x=>x.id===runId),c=carById(carId),next=r?rhNextSlot(r):null;if(!r||!c)return;
 const done=r.entries.filter(cid=>rhRunCarIsComplete(r,cid)).map(cid=>({cid,total:rhRunCarTotal(r,cid)})).sort((a,b)=>a.total-b.total);
 resultScreen(q('festival'),'CAR COMPLETE',r.name,`<section class="rhCarComplete rhCarCompleteFinal">
  <div class="rhCompleteMark">✓</div>
  <small>ALL ROUNDS COMPLETE</small>
  <h2>${safe(carName(c))}</h2>
  <div class="rhTotalTime rhTotalTimeFinal"><span>CUMULATIVE TOTAL TIME</span><strong>${rhFmtTime(rhRunCarTotal(r,carId))}</strong></div>
  <h3>CURRENT CLASSIFICATION</h3>
  <div class="rhClassificationFinal">${done.map((x,i)=>`<div class="rhMiniLeader rhMiniLeaderFinal"><b>${i+1}</b><span>${safe(carName(carById(x.cid)))}</span><strong>${rhFmtTime(x.total)}</strong></div>`).join('')}</div>
  <button class="btn rhPrimaryWide" onclick="rhOpenRun('${r.id}')">RETURN TO CHAMPIONSHIP</button>
 </section>`);
};
window.rhChampionshipCompleteTransition=function(runId){
 const r=rhCurrentRuns().find(x=>x.id===runId);if(!r)return;
 resultScreen(q('festival'),'CHAMPIONSHIP COMPLETE',r.name,`<section class="rhCompletionMilestone rhCompletionMilestoneFinal">
  <img src="assets/final/hubs.png" alt="Hubs">
  <div class="rhCompletionCopyFinal"><small>CHAMPIONSHIP COMPLETE</small><h2>${safe(r.name)}</h2><p>Every selected car has completed every Round.</p></div>
  <button class="btn rhPrimaryWide" onclick="rhOpenRun('${r.id}')">VIEW FINAL LEADERBOARD</button>
 </section>`);
};
window.rhEventResult=function(id){
 const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||e.status!=='active')return;const next=rhEventNextPair(e);
 if(!next){e.status='complete';e.completedAt=new Date().toISOString();rhSave();return rhOpenEvent(id)}
 q('rhEventResultEditor')?.remove();show('event');
 resultScreen(q('event'),'ENTER RESULT',next.round.name,`<section class="rhResultEntry rhGlassHero rhResultEntryFinal">
  <div class="rhEyebrow">${safe(e.name)}</div><h2>${safe(next.round.name)}</h2>
  <div class="rhResultCar"><small>CURRENT CAR</small><b>${safe(carName(next.car))}</b></div>
  <label>TOTAL RACE TIME</label>
  <div class="rhTimeEntry rhTimeEntryLarge"><input id="rhEventMin" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhEventSec',2)"><span>:</span><input id="rhEventSec" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhEventMs',2)"><span>.</span><input id="rhEventMs" inputmode="numeric" maxlength="3" placeholder="000"></div>
  <small class="rhTimeHintFinal">MIN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SEC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;MS</small>
  <div class="rhPositionTitleFinal"><label>FINISHING POSITION</label><span id="rhEventPosStatus">SELECT ONE</span></div>
  <div class="rhPositionGrid rhPositionGridFinal" id="rhEventPos">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" data-pos="${n}" aria-pressed="false" onclick="rhSelectResultPosition('rhEventPos',${n})">${n}</button>`).join('')}</div>
  <button class="btn rhPrimaryWide rhSaveResultFinalBtn" onclick="rhSaveEventResultFinal('${id}','${next.car.id}','${next.round.id}')">SAVE RESULT<small>RECORD THIS RACE</small></button>
 </section>`);
 setTimeout(()=>q('rhEventMin')?.focus(),50);
};
window.rhSaveEventResultFinal=function(id,carId,roundId){
 const e=rhSpace().customEvents.find(x=>x.id===id),car=rhEventCars(e).find(c=>c.id===carId),round=rhEventRounds(e).find(r=>r.id===roundId);if(!e||!car||!round)return;
 const m=Number(q('rhEventMin')?.value||0),s=Number(q('rhEventSec')?.value||0),ms=Number((q('rhEventMs')?.value||'0').padEnd(3,'0')),v=m*60+s+ms/1000,pos=Number(q('rhEventPos')?.dataset.pos)||null;
 if(v<=0||s>59||ms>999)return toast('Enter a valid race time');
 const prior=(e.results||[]).filter(x=>x.roundId===roundId),championshipRecord=!!prior.length&&v<Math.min(...prior.map(x=>x.time));
 const allPrior=rhSpace().customEvents.flatMap(x=>x.results||[]).filter(x=>x.roundName===round.name),allTime=!!allPrior.length&&v<Math.min(...allPrior.map(x=>x.time));
 const res={id:rhId('result'),carId,roundId,roundName:round.name,time:v,position:pos,date:new Date().toISOString(),championshipRecord,allTime};e.results.push(res);
 if(!rhEventNextPair(e)){e.status='complete';e.completedAt=new Date().toISOString()}rhSave();rhResultAccepted(e,res,'events');
};
window.rhEventCarIsComplete=function(e,carId){const rounds=rhEventRounds(e);return !!rounds.length&&rounds.every(rd=>(e.results||[]).some(x=>x.carId===carId&&x.roundId===rd.id))};
window.rhEventCarTotal=function(e,carId){return (e.results||[]).filter(x=>x.carId===carId).reduce((a,b)=>a+Number(b.time||0),0)};
window.rhEventResultSummary=function(e,res){
 const car=rhEventCars(e).find(c=>c.id===res.carId),records=res.championshipRecord||res.allTime,next=rhEventNextPair(e),hist=rhHistoricalTrackAverage(e,res,'events'),roundCount=rhEventRounds(e).length,carRoundDone=(e.results||[]).filter(x=>x.carId===res.carId&&rhEventRounds(e).some(rd=>rd.id===x.roundId)).length,carPct=roundCount?Math.round(carRoundDone/roundCount*100):0;
 const carDone=rhEventCarIsComplete(e,res.carId),nextDifferent=!!(next&&next.car.id!==res.carId);
 let label='NEXT RACE',sub='CONTINUE EVENT',action=`rhEventResult('${e.id}')`;
 if(e.status==='complete'){label='EVENT COMPLETE';sub='VIEW COMPLETION';action=`rhEventCompleteTransition('${e.id}')`}
 else if(carDone&&nextDifferent){label='CAR COMPLETE';sub='VIEW TOTAL & NEXT CAR';action=`rhEventCarCompleteTransition('${e.id}','${res.carId}')`}
 show('event');resultScreen(q('event'),'RESULTS SUMMARY',res.roundName,`<section class="rhResultsSummary rhResultsSummaryFinal">
  <div class="rhSummaryAcceptedFinal"><span>✓</span><div><small>RESULT SAVED</small><b>${safe(res.roundName)}</b></div></div>
  <div class="rhSummaryCard"><small>EVENT</small><b>${safe(e.name)}</b></div>
  <div class="rhSummaryCard"><small>CAR</small><b>${safe(carName(car))}</b></div>
  <div class="rhResultHero rhResultHeroFinal"><div><small>FINISHING POSITION</small><strong>${res.position||'—'}</strong></div><div><small>TOTAL RACE TIME</small><strong>${rhFmtTime(res.time)}</strong></div></div>
  ${rhAverageCompareHtml(hist)}${records?`<div class="rhRecordCelebration rhRecordCelebrationFinal"><div class="rhRosettes">${res.championshipRecord?'<b>✹ EVENT RECORD</b>':''}${res.allTime?'<b class="gold">✹ ALL-TIME OTG! RECORD</b>':''}</div><img src="assets/final/hubs.png" alt="Hubs"><p>Incredible driving,<br><b>well done!</b></p></div>`:''}
  <div class="rhProgressCard"><small>EVENT PROGRESS</small><b>${carRoundDone} OF ${roundCount} ROUNDS COMPLETE</b><span>${carPct}%</span><div class="progress"><div class="bar" style="width:${carPct}%"></div></div></div>
  <button class="btn rhPrimaryWide rhResultContinueFinal" onclick="${action}"><b>${label}</b><small>${sub}</small></button>
 </section>`);
};
window.rhEventCarCompleteTransition=function(eventId,carId){
 const e=rhSpace().customEvents.find(x=>x.id===eventId),car=rhEventCars(e).find(c=>c.id===carId),next=e?rhEventNextPair(e):null;if(!e||!car)return;
 const done=rhEventCars(e).filter(c=>rhEventCarIsComplete(e,c.id)).map(c=>({c,total:rhEventCarTotal(e,c.id)})).sort((a,b)=>a.total-b.total);
 show('event');resultScreen(q('event'),'CAR COMPLETE',e.name,`<section class="rhCarComplete rhCarCompleteFinal">
  <div class="rhCompleteMark">✓</div>
  <small>ALL ROUNDS COMPLETE</small>
  <h2>${safe(carName(car))}</h2>
  <div class="rhTotalTime rhTotalTimeFinal"><span>CUMULATIVE TOTAL TIME</span><strong>${rhFmtTime(rhEventCarTotal(e,carId))}</strong></div>
  <h3>CURRENT CLASSIFICATION</h3>
  <div class="rhClassificationFinal">${done.map((x,i)=>`<div class="rhMiniLeader rhMiniLeaderFinal"><b>${i+1}</b><span>${safe(carName(x.c))}</span><strong>${rhFmtTime(x.total)}</strong></div>`).join('')}</div>
  <button class="btn rhPrimaryWide" onclick="rhOpenEvent('${e.id}')">RETURN TO EVENT</button>
 </section>`);
};
window.rhEventCompleteTransition=function(eventId){
 const e=rhSpace().customEvents.find(x=>x.id===eventId);if(!e)return;show('event');
 q('event').innerHTML=`<div class="rhEventFinalStandaloneV1"><section class="rhCompletionMilestone rhCompletionMilestoneFinal">
  <img src="assets/final/hubs.png" alt="Hubs">
  <div class="rhCompletionCopyFinal"><small>EVENT COMPLETE</small><h2>${safe(e.name)}</h2><p>All racers have completed the Event.</p></div>
  <button class="btn rhPrimaryWide" onclick="rhShowCompletedEventLeaderboard('${e.id}')">VIEW FINAL LEADERBOARD</button>
 </section></div>`;
};
window.rhShowCompletedEventLeaderboard=function(eventId){
 const e=rhSpace().customEvents.find(x=>x.id===eventId);if(!e)return;const board=rhEventLeaderboard(e),winner=board[0];show('event');
 q('event').innerHTML=`<div class="rhFinalBoardV1 rhFinalEventBoardV1"><main class="rhFinalBoardBodyV1">
  ${winner?`<section class="rhFinalWinnerV1 rhFinalEventWinnerV1"><div class="rhFinalEventFlagV1">✓</div><div><small>EVENT WINNER</small><h2>${safe(carName(winner.car))}</h2><strong>${rhFmtTime(winner.total)}</strong></div></section>`:''}
  <section class="rhFinalClassificationV1"><div class="rhFinalTitleV1"><div><small>OFFICIAL CLASSIFICATION</small><h2>FINAL LEADERBOARD</h2></div><span>${board.length} RACERS</span></div>
  <div class="rhFinalRowsV1">${board.map((x,i)=>`<div class="rhFinalRowV1 ${i===0?'winner':''}"><b>${i+1}</b><span>${safe(carName(x.car))}</span><strong>${rhFmtTime(x.total)}</strong></div>`).join('')}</div></section>
  <section class="rhFinalCompleteNoteV1"><b>EVENT COMPLETE</b><span>${board.length} racers classified • Final classification saved to OTG!.</span></section>
  <button class="btn rhPrimaryWide rhFinalReturnV1" onclick="rhRenderEvents();show('events')">RETURN TO EVENTS</button>
 </main></div>`;
};
window.rhDataBackups=function(){
 const s=rhSpace(),bs=(s.backups||[]).slice().reverse();show('more');q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('DATA / BACKUPS','Protect your OTG! data','settings','more')}</div><div class="rhContent rhConformance rhBackupsFinal">
 <div class="rhDataActions rhDataActionsFinal"><button class="btn" onclick="rhBackupFinal()"><b>CREATE BACKUP</b><small>Save current data</small></button></div>
 <h2 class="rhSectionTitle rhBackupHeadingFinal">SAVED BACKUPS</h2>
 ${bs.length?bs.map((b,i)=>`<section class="rhBackupCard rhBackupCardFinal">
  <div class="rhBackupTopFinal"><div><small>${i===0?'MOST RECENT':'SAVED BACKUP'}</small><h2>${safe(b.spaceName)}</h2><p>${new Date(b.date).toLocaleString('en-GB')}</p></div></div>
  <div class="rhBackupCounts rhBackupCountsFinal"><span><b>${b.counts.cars}</b><small>Cars</small></span><span><b>${b.counts.championships}</b><small>Championships</small></span><span><b>${b.counts.results}</b><small>Results</small></span></div>
  <button class="btn rhBackupRestoreFinal" onclick="rhRestoreDetail('${b.id}')">RESTORE</button>
 </section>`).join(''):rhEmpty('NO SAVED BACKUPS','Create a backup to protect your OTG! data.','CREATE BACKUP','rhBackupFinal()')}</div>`;
};
window.rhBackupFinal=function(){const s=rhSpace(),b={id:rhId('backup'),spaceName:s.name,date:new Date().toISOString(),counts:{cars:s.cars.length,championships:s.runs.length,results:s.runs.flatMap(r=>r.results||[]).length},data:rhClone({cars:s.cars,favouriteManufacturer:s.favouriteManufacturer,runs:s.runs,customEvents:s.customEvents})};s.backups=s.backups||[];s.backups.push(b);rhSave();toast('Backup created');rhDataBackups()};
window.rhBackup=window.rhBackupFinal;
window.rhRestoreList=window.rhDataBackups;
window.rhRestoreDetail=function(id){const s=rhSpace(),b=(s.backups||[]).find(x=>x.id===id);if(!b)return;show('more');q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('RESTORE BACKUP','Current Space only','settings','more')}</div><div class="rhContent rhConformance"><section class="rhRestoreCard"><h2>${safe(b.spaceName)}</h2><p>${new Date(b.date).toLocaleString('en-GB')}</p><div class="rhBackupCounts"><span>${b.counts.cars}<small>Cars</small></span><span>${b.counts.championships}<small>Championships</small></span><span>${b.counts.results}<small>Results</small></span></div></section><section class="rhWarning"><h2>IMPORTANT</h2><p>Restoring this backup will replace the current data in <b>${safe(s.name)}</b>.</p><b>This cannot be undone.</b><p>Your other OTG! Spaces are not affected.</p></section><div class="rhModalActions"><button class="btn secondary" onclick="rhDataBackups()">CANCEL</button><button class="btn dangerBtn" onclick="rhRestoreConfirmFinal('${id}')">RESTORE BACKUP</button></div></div>`};
window.rhRestoreConfirmFinal=function(id){const b=(rhSpace().backups||[]).find(x=>x.id===id);if(!b)return;rhConfirm({title:'RESTORE THIS BACKUP?',copy:'This will replace all data in the current OTG! Space with the selected backup.',detail:`${b.spaceName} • ${b.counts.cars} Cars • ${b.counts.championships} Championships • ${b.counts.results} Results`,safeguard:'Your other OTG! Spaces will not be affected.',confirmLabel:'RESTORE',severity:'cyan',onConfirm:`rhRestoreFinal('${id}')`})};
window.rhRestoreFinal=function(id){const s=rhSpace(),b=(s.backups||[]).find(x=>x.id===id);if(!b)return;Object.assign(s,rhClone(b.data));s.backups=s.backups||[];rhSave();toast('Backup restored');rhRenderSettings()};

window.rhAbout=function(){
 const s=rhSpace();show('more');q('more').innerHTML=`<div class="rhScene rhAboutScene">${rhHeader('ABOUT OUT THE GARAGE!','DRIVE • RECORD • IMPROVE','settings','more')}</div><div class="rhContent rhConformance">
 <section class="rhAboutIntro"><h1>ABOUT OUT THE GARAGE!</h1><h3>DRIVE • RECORD • IMPROVE</h3><p>Out The Garage! is your personal racing record book — built to organise your Garage, create Championships, record results and preserve your racing history your way.</p><p>Whether you race for fun, for competition, or just for the love of driving, Out The Garage! keeps your racing history safe.</p></section>
 <section class="rhSection"><h2>OTG! INFORMATION</h2><div class="rhInfoRow"><span>App Version</span><b>v5.7.42</b></div><div class="rhInfoRow"><span>Data / Backup Version</span><b>v1.0.0</b></div><div class="rhInfoRow"><span>Current OTG! Space</span><b>${safe(s.name)}</b></div><div class="rhInfoRow"><span>Driver Profile (Global)</span><b>${safe(state.driverName||'Driver')}</b></div></section>
 <section class="rhSection"><h2>CREATED BY</h2><p>Andy Jones & ChatGPT</p><p class="small">Designed together from the ground up to make racing data personal, useful and enjoyable.</p></section>
 <section class="rhSection"><h2>LEGAL</h2><p>© 2026 OTG!. All rights reserved.</p><p class="small">OTG! is an independent product and is not affiliated with or endorsed by any vehicle manufacturer.</p></section></div>`;
};

window.rhManageSpaces=function(){
 const s=rhSpace();show('more');q('more').innerHTML=`<div class="rhScene rhSpaceScene">${rhHeader('OTG! SPACES','Manage your racing spaces','settings','more')}</div><div class="rhContent rhConformance rhSpacesFinal">
 ${state.spaces.map(x=>`<section class="rhSpaceManage ${x.id===s.id?'active':''}">
  <div class="rhSpaceMetaFinal">
   <div><b>${safe(x.name)}</b><small>${x.cars.length} cars • ${(x.runs||[]).length} Championships</small></div>
   ${x.id===s.id?'<em>CURRENT</em>':''}
  </div>
  <div class="rhSpaceActions rhSpaceActionsFinal">
   ${x.id!==s.id?`<button class="btn rhSwitchSpaceBtn" onclick="rhSwitchSpace('${x.id}')">SWITCH TO THIS SPACE</button>`:''}
   <div class="rhSpaceMinorActionsFinal"><button class="btn secondary" onclick="rhRenameSpacePrompt('${x.id}')">RENAME</button>${state.spaces.length>1?`<button class="btn dangerBtn" onclick="rhDeleteSpaceConfirm('${x.id}')">DELETE</button>`:''}</div>
  </div>
 </section>`).join('')}
 <button class="btn rhPrimaryWide rhCreateSpaceFinalBtn" onclick="rhCreateSpaceFinal()">CREATE NEW SPACE</button>
 <p class="small rhSpacesHelpFinal">Play more than one racing game? Create a separate OTG! for each one. Each OTG! keeps its own Garage, Championships, Records, Hall of Fame and Stats separate.</p></div>`;
};
window.rhSwitchSpace=function(id){if(!state.spaces.some(x=>x.id===id))return;state.activeSpaceId=id;rhSync();rhSave();toast('OTG! Space switched');rhManageSpaces()};

window.rhCreateSpace=function(){rhCreateSpaceFinal()};
window.rhCreateSpaceFinal=function(){q('rhSpaceCreate')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhSpaceCreate" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="$('rhSpaceCreate').remove()">×</button><h2>CREATE OTG! SPACE</h2><label>OTG! Name</label><input id="rhNewSpaceName" placeholder="Enter game name"><div class="rhModalActions"><button class="btn secondary" onclick="$('rhSpaceCreate').remove()">CANCEL</button><button class="btn" onclick="rhCreateSpaceSave()">CREATE SPACE</button></div></div></div>`)};
window.rhCreateSpaceSave=function(){const name=q('rhNewSpaceName')?.value.trim();if(!name)return toast('Enter a OTG! name');const s=rhSpaceTemplate(name,[]);state.spaces.push(s);state.activeSpaceId=s.id;rhSync();rhSave();q('rhSpaceCreate')?.remove();rhManageSpaces()};
window.rhRenameSpacePrompt=function(id){const x=state.spaces.find(s=>s.id===id);if(!x)return;q('rhSpaceRename')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhSpaceRename" class="rhOverlay"><div class="rhModal rhFormModal"><h2>RENAME OTG! SPACE</h2><input id="rhRenameSpaceName" value="${safe(x.name)}"><div class="rhModalActions"><button class="btn secondary" onclick="$('rhSpaceRename').remove()">CANCEL</button><button class="btn" onclick="rhRenameSpaceSave('${id}')">SAVE</button></div></div></div>`)};
window.rhRenameSpaceSave=function(id){const x=state.spaces.find(s=>s.id===id),name=q('rhRenameSpaceName')?.value.trim();if(!x||!name)return;x.name=name;rhSave();q('rhSpaceRename')?.remove();rhManageSpaces()};
window.rhDeleteSpaceConfirm=function(id){const x=state.spaces.find(s=>s.id===id);if(!x||state.spaces.length<=1)return toast('At least one OTG! Space must remain');rhConfirm({title:'DELETE THIS OTG! SPACE?',copy:'This permanently deletes this Space and all of its racing data.',detail:x.name,safeguard:'Your global Driver Profile and other OTG! Spaces will not be affected.',confirmLabel:'DELETE SPACE',danger:true,onConfirm:`rhDeleteSpaceFinal('${id}')`})};
window.rhDeleteSpaceFinal=function(id){if(state.spaces.length<=1)return;state.spaces=state.spaces.filter(x=>x.id!==id);if(state.activeSpaceId===id)state.activeSpaceId=state.spaces[0].id;rhSync();rhSave();rhManageSpaces()};

window.rhChangeFavourite=function(value){const s=rhSpace(),old=s.favouriteManufacturer;if(value===old)return;rhConfirm({title:'CHANGE FAVOURITE MANUFACTURER?',copy:'Changing your Favourite Manufacturer will delete the current Favourite Manufacturer Championship and its progress.',detail:`${old||'Not set'} → ${value||'Not set'}`,safeguard:'Your other Championships and Garage will not be affected.',confirmLabel:'CHANGE FAVOURITE',severity:'purple',onConfirm:`rhChangeFavouriteFinal(${JSON.stringify(value)})`});rhRenderSettings()};
window.rhChangeFavouriteFinal=function(value){const s=rhSpace();s.runs=(s.runs||[]).filter(r=>r.type!=='favourite');s.favouriteManufacturer=value;rhSave();rhRenderSettings()};

window.rhResetConfirm=function(){rhConfirm({title:'RESET RACING DATA?',copy:'Clear Championships, active/completed runs, results, Records, Hall of Fame and Stats for the current Space.',safeguard:'Your Garage, Space name, global Driver Profile and other Spaces will be retained.',confirmLabel:'RESET RACING DATA',danger:true,onConfirm:'rhResetRacingFinal()'})};
window.rhResetRacingFinal=function(){const s=rhSpace();s.runs=[];s.customEvents=[];rhSave();toast('Racing data reset');rhRenderSettings()};
window.rhFullResetConfirm=function(){const s=rhSpace();rhConfirm({title:'FULL RESET OTG!?',copy:'Clear everything in this OTG! Space including Garage, Championships, results, Records, Hall of Fame, Stats and Favourite Manufacturer.',detail:s.name,safeguard:'The Space itself, its name, your global Driver Profile and other Spaces will be retained.',confirmLabel:'FULL RESET',danger:true,onConfirm:'rhFullResetFinal()'})};
window.rhFullResetFinal=function(){const s=rhSpace();s.cars=[];s.favouriteManufacturer='';s.runs=[];s.customEvents=[];s.backups=[];rhSave();toast('OTG! Space reset');rhRenderSettings()};

window.rhRenderSettings=function(){const s=rhSpace(),makes=rhMakeList();q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('SETTINGS','OTG! Control Centre','settings')}</div><div class="rhContent rhConformance">
<section class="rhSection rhSettingPanel"><h2>CELEBRATIONS</h2>${['sound','confetti','vibrate'].map(k=>`<label class="rhToggle"><span><b>${k==='sound'?'Sounds':k==='confetti'?'Confetti':'Vibration'}</b><small>${k==='sound'?'Play sounds for celebrations':k==='confetti'?'Show confetti on new records and milestones':'Vibrate when you get a new record'}</small></span><input type="checkbox" ${state.settings[k]?'checked':''} onchange="state.settings.${k}=this.checked;rhSave()"></label>`).join('')}</section>
<section class="rhSection rhSettingPanel"><h2>GARAGE / PROFILE</h2><label>Favourite Manufacturer</label><select onchange="rhChangeFavourite(this.value)"><option value="">Not set</option>${makes.map(m=>`<option ${m===s.favouriteManufacturer?'selected':''}>${safe(m)}</option>`).join('')}</select><p class="rhCaution">Changing your Favourite Manufacturer deletes its current Championship and progress.</p></section>
<section class="rhSection rhSettingPanel"><h2>OTG! SPACES</h2><button class="rhSettingRow" onclick="rhManageSpaces()"><b>Manage OTG! Spaces</b><span>Current Space: ${safe(s.name)} ›</span></button></section>
<section class="rhSection rhSettingPanel"><h2>DATA</h2><button class="rhSettingRow" onclick="rhDataBackups()"><b>Backup / Restore</b><span>Manage saved backups ›</span></button></section>
<section class="rhDangerFinal"><h2>⚠ DANGER ZONE</h2><p>These actions affect the current OTG! Space only.</p><div class="rhDangerAction"><div><b>RESET RACING DATA</b><span>Clear Championships, runs, results, Records, Hall of Fame and Stats.</span><em>Garage will be retained.</em></div><button class="btn dangerBtn" onclick="rhResetConfirm()">RESET RACING DATA</button></div><div class="rhDangerAction"><div><b>FULL RESET OTG!</b><span>Clear everything in this Space including Garage and Favourite Manufacturer.</span><em>The Space, its name and global Driver Profile are retained.</em></div><button class="btn dangerBtn" onclick="rhFullResetConfirm()">FULL RESET</button></div></section>
<section class="rhSection rhSettingPanel"><button class="rhSettingRow" onclick="rhAbout()"><b>ABOUT OUT THE GARAGE!</b><span>OTG! v5.7.9 • ›</span></button></section></div>`};



/* ---- v5.7.9 rebuilt audited components previously spread across older controllers ---- */
window.rhMilestone=function(title,name,copy,callback){
 q('rhMilestone')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhMilestone" class="rhMilestone"><div class="rhMilestoneGlass"><img src="assets/final/hubs.png" alt="Hubs"><div><small>${safe(title)}</small><h2>${safe(name)}</h2><p>${safe(copy)}</p></div></div></div>`);
 setTimeout(()=>{q('rhMilestone')?.remove();if(typeof callback==='function')callback()},2200);
};
window.rhConfirmStart=function(){
 const x=rhSetup;if(!x)return;const s=rhSpace(),run={id:rhId('run'),name:x.name,type:x.type,value:x.value,trophy:x.type==='make'?'manufacturer':x.type==='era'?'era':x.type==='favourite'?'favourite':'festival',createdAt:new Date().toISOString(),status:'active',entries:[...x.entries],rounds:rhClone(x.rounds),results:[]};
 s.runs.push(run);rhSave();rhSetup=null;rhMilestone('CHAMPIONSHIP STARTED',run.name,'Cars and Rounds are now locked.',()=>rhOpenRun(run.id));
};
window.rhEventSetupHtml=function(e){
 const chosen=rhEventChosenCars(e);
 return `<div class="rhContent"><section class="rhSection"><h2>${safe(e.name)}</h2><p>Your created racing programme.</p></section><section class="rhSection"><div class="rhEventSectionHead"><div><h2>Racers</h2><p class="small">${chosen.length} / ${e.racerCount} selected</p></div><button class="chip" onclick="rhChooseEventRacers('${e.id}')">CHOOSE RACERS</button></div>
 ${chosen.length?`<div class="rhEventRacerList">${chosen.map((c,i)=>`<div class="rhListRow"><span>${i+1}. ${safe(carName(c))}</span></div>`).join('')}</div>`:'<div class="empty">Choose the cars that will race in this Event.</div>'}</section>
 <section class="rhSection"><h2>Rounds</h2><p class="small">Name and order the Rounds each car will race.</p>${e.rounds.map((r,i)=>`<div class="rhEventRoundWrapV1"><div class="rhRound rhEventRoundFinal"><b>${i+1}</b><input value="${safe(r.name)}" onchange="rhRenameEventRound('${e.id}','${r.id}',this.value)"><button ${i===0?'disabled':''} onclick="rhMoveEventRound('${e.id}','${r.id}',-1)">↑</button><button ${i===e.rounds.length-1?'disabled':''} onclick="rhMoveEventRound('${e.id}','${r.id}',1)">↓</button><button onclick="rhRemoveEventRound('${e.id}','${r.id}')">×</button></div><button type="button" class="rhSavedRaceButtonV1" onclick="rhOpenRoundNamePicker('event','${e.id}','${r.id}')">▾ CHOOSE SAVED RACE NAME</button></div>`).join('')}<button class="btn secondary" onclick="rhAddEventRound('${e.id}')">＋ ADD ROUND</button></section>
 <button class="btn rhStartEvent" ${chosen.length!==e.racerCount||!e.rounds.length?'disabled':''} onclick="rhStartEvent('${e.id}')">START EVENT</button><p class="small rhStartNote">Starting freezes the selected racers and Rounds for this Event.</p></div>`;
};
window.rhMoveEventRound=function(id,rid,dir){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||rhEventIsStarted(e))return;const i=e.rounds.findIndex(r=>r.id===rid),j=i+dir;if(i<0||j<0||j>=e.rounds.length)return;[e.rounds[i],e.rounds[j]]=[e.rounds[j],e.rounds[i]];rhSave();rhOpenEvent(id)};
window.rhRemoveEventRound=function(id,rid){const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||rhEventIsStarted(e))return;if(e.rounds.length<=1)return toast('An Event needs at least one Round');e.rounds=e.rounds.filter(r=>r.id!==rid);rhSave();rhOpenEvent(id)};
window.rhStartEvent=function(id){
 const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||rhEventIsStarted(e))return;const cars=rhEventChosenCars(e);if(cars.length!==rhEventRacerCount(e))return toast('Choose all racers first');if(!e.rounds?.length)return toast('Add at least one Round');
 e.frozenCarIds=[...e.carIds];e.frozenRounds=e.rounds.map(r=>({id:r.id,name:r.name}));e.startedAt=new Date().toISOString();e.status='active';e.results=[];rhSave();rhMilestone('EVENT STARTED',e.name,'Racers and Rounds are now locked.',()=>rhOpenEvent(id));
};
window.rhRecordBadges=function(best,label='CHAMPIONSHIP'){if(!best)return '';return `<span class="rhRecordBadges">${best.championshipRecord?`<em>${label} RECORD</em>`:''}${best.allTime?'<em class="gold">ALL-TIME OTG! RECORD</em>':''}</span>`};
window.rhRecordImprovement=function(rows){if(rows.length<2)return '';const d=Number(rows[1].time)-Number(rows[0].time);return d>0?`<small class="rhImprovement">↓ ${rhFmtTime(d)} improvement</small>`:''};
window.rhRecordRoundRowFinal=function(r,rd){const rows=(r.results||[]).filter(x=>x.roundId===rd.id).slice().sort((a,b)=>Number(a.time||0)-Number(b.time||0)),best=rows[0],car=best?carById(best.carId):null;return `<div class="rhRecordRow"><div class="rhRecordIdentity"><b>${safe(rd.name)}</b><small>${best&&car?safe(carName(car)):'No result recorded'}</small>${rhRecordImprovement(rows)}${rhRecordBadges(best,'CHAMPIONSHIP')}</div><strong>${best?rhFmtTime(best.time):'—'}</strong></div>`};
window.rhEventRecordRoundRow=function(e,rd){const rows=(e.results||[]).filter(x=>x.roundId===rd.id).slice().sort((a,b)=>Number(a.time||0)-Number(b.time||0)),best=rows[0],car=best?rhEventCars(e).find(c=>c.id===best.carId):null;return `<div class="rhRecordRow"><div class="rhRecordIdentity"><b>${safe(rd.name)}</b><small>${best&&car?safe(carName(car)):'No result recorded'}</small>${rhRecordImprovement(rows)}${rhRecordBadges(best,'EVENT')}</div><strong>${best?rhFmtTime(best.time):'—'}</strong></div>`};
window.rhRenderRecords=function(){
 const runs=rhCurrentRuns(),completed=runs.filter(r=>r.status==='complete'),events=rhSpace().customEvents||[],hall=rhRecordsMode==='hall';
 q('hall').innerHTML=`${rhRecordsHeader(hall)}<div class="rhContent">${hall?rhHallOfFame(completed):`<button class="rhHallBanner" onclick="rhRecordsMode='hall';rhRenderRecords()"><span class="rhHallBannerIcon">🏆</span><span class="rhHallBannerCopy"><b>HALL OF FAME</b><small>Completed Championship winners</small></span><em>›</em></button>
 <section class="rhSection"><h2>Championship Records</h2>${runs.length?runs.slice().reverse().map(r=>`<details class="rhRecordRun"><summary><span><b>${safe(r.name)}</b><small>${r.status==='complete'?'COMPLETED':'ACTIVE'}</small></span></summary><div class="rhRecordRows">${r.rounds.map(rd=>rhRecordRoundRowFinal(r,rd)).join('')}</div></details>`).join(''):rhEmpty('NO RECORDS YET','Championship records will appear here after you start recording results.','View Championships',"show('festival')")}</section>
 ${events.length?`<section class="rhSection"><h2>Event Records</h2>${events.slice().reverse().map(e=>`<details class="rhRecordRun"><summary><span><b>${safe(e.name)}</b><small>${e.status==='complete'?'COMPLETED':rhEventIsStarted(e)?'ACTIVE':'NOT STARTED'}</small></span></summary><div class="rhRecordRows">${rhEventRounds(e).map(rd=>rhEventRecordRoundRow(e,rd)).join('')}</div></details>`).join('')}</section>`:''}`}</div>`;
};

})();
