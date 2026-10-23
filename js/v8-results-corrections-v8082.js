/* OTG! v8.0.82 — Festival Results Corrections display/polish patch + save-integrity guard.
   Main-only foundation: standard Festival/Pick My Drive runs. Race Off bracket
   corrections stay separate because changing a winner can invalidate later rounds. */
(()=>{
'use strict';
const V='8.0.81';
const q=id=>document.getElementById(id);
const esc=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const same=(a,b)=>String(a??'')===String(b??'');
const clone=v=>{try{return typeof window.rhClone==='function'?window.rhClone(v):JSON.parse(JSON.stringify(v))}catch(_){return JSON.parse(JSON.stringify(v))}};
const fmt=t=>typeof window.rhFmtTime==='function'?window.rhFmtTime(Number(t)||0):String(t??'—');
const runs=()=>{try{return typeof window.rhCurrentRuns==='function'?(window.rhCurrentRuns()||[]):[]}catch(_){return[]}};
const runById=id=>runs().find(r=>same(r?.id,id))||null;
const carBy=id=>{try{return (currentSpace()?.cars||[]).find(c=>String(c.id)===String(id))||null}catch(_){return null}};
const carText=id=>{const c=carBy(id);if(!c)return 'Unknown car';try{return typeof carName==='function'?carName(c):(c.name||c.model||'Unknown car')}catch(_){return c.name||c.model||'Unknown car'}};
const isSpecialRun=r=>!!(r&&(r.format==='groups-total-time'||r.format==='swiss'||r.v8Groups||r.v8Swiss));
const canCorrect=r=>!!(r&&!isSpecialRun(r)&&Array.isArray(r.entries)&&Array.isArray(r.rounds)&&Array.isArray(r.results));
const resultFor=(r,carId,roundId)=>(r?.results||[]).find(x=>same(x.carId,carId)&&same(x.roundId,roundId))||null;
function expectedSlot(r){
  if(!r)return null;
  for(const carId of (r.entries||[]))for(const round of (r.rounds||[]))if(!resultFor(r,carId,round.id))return {carId,round};
  return null;
}
function duplicateTargets(r){
  const m=new Map(),out=[];
  for(const x of (r?.results||[])){
    const k=`${String(x.carId)}¦${String(x.roundId)}`,n=(m.get(k)||0)+1;m.set(k,n);if(n===2)out.push(k);
  }
  return out;
}
function currentSpace(){try{return typeof window.rhSpace==='function'?window.rhSpace():null}catch(_){return null}}
function save(){if(typeof window.rhSave==='function')window.rhSave();}
function toast(msg){try{window.toast?.(msg)}catch(_){}}
function audit(action,data={}){
  const s=currentSpace();if(!s)return;
  const row={at:new Date().toISOString(),version:V,action,...data};
  if(!Array.isArray(s.resultAudit8080))s.resultAudit8080=[];
  s.resultAudit8080.push(row);if(s.resultAudit8080.length>160)s.resultAudit8080.splice(0,s.resultAudit8080.length-160);
}
function correctionBookId(run,track){return ['book','championship',String(run?.id||run?.name||'').trim(),String(track||'').trim()].join('¦')}
function clearRecordExclusions(run,track){
  const s=currentSpace();if(!s)return;
  const book=correctionBookId(run,track);
  if(Array.isArray(s.recordBookExclusions))s.recordBookExclusions=s.recordBookExclusions.filter(x=>String(x)!==book);
  if(Array.isArray(s.recordExclusions)){
    const prefix=['championship',String(run?.id||run?.name||'').trim(),String(track||'').trim()].join('¦')+'¦';
    s.recordExclusions=s.recordExclusions.filter(x=>!String(x).startsWith(prefix));
  }
}
function recalcFlags(run,res){
  if(!run||!res)return;
  const local=(run.results||[]).filter(x=>!same(x.id,res.id)&&same(x.roundId,res.roundId)&&Number(x.time)>0);
  const global=runs().flatMap(r=>r.results||[]).filter(x=>!same(x.id,res.id)&&String(x.roundName||'')===String(res.roundName||'')&&Number(x.time)>0&&!x.advancedTiming);
  res.championshipRecord=!local.length||Number(res.time)<Math.min(...local.map(x=>Number(x.time)));
  res.allTime=!global.length||Number(res.time)<Math.min(...global.map(x=>Number(x.time)));
}
function runComplete(r){return !!((r?.entries||[]).length&&(r?.rounds||[]).length)&&!expectedSlot(r)}
function refreshRunStatus(r){
  if(runComplete(r)){
    r.status='complete';
    if(!r.completedAt)r.completedAt=new Date().toISOString();
  }else if(r.status==='complete'){
    r.lastCompletedAtBeforeCorrection=r.completedAt||null;
    r.status='active';
    delete r.completedAt;
    r.reopenedForCorrectionAt=new Date().toISOString();
  }
}
function secsParts(value){const total=Math.max(0,Math.round(Number(value||0)*1000)),m=Math.floor(total/60000),s=Math.floor((total%60000)/1000),ms=total%1000;return{m,s,ms}}
function classify(r){
  const n=(r?.rounds||[]).length;if(!n)return [];
  return (r.entries||[]).map(id=>{const rr=(r.results||[]).filter(x=>same(x.carId,id));return rr.length===n?{id,total:rr.reduce((a,x)=>a+Number(x.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total);
}

/* ---------------- Save integrity ---------------- */
const activeSaves=new Set();
const baseEnterResult=window.rhEnterResult;
if(typeof baseEnterResult==='function')window.rhEnterResult=function(runId,carId,roundId){
  const r=runById(runId);
  if(canCorrect(r)){
    const exp=expectedSlot(r);
    if(!exp||!same(exp.carId,carId)||!same(exp.round.id,roundId)){
      audit('blocked-enter-stale-target',{runId:String(runId),requestedCarId:String(carId),requestedRoundId:String(roundId),expectedCarId:String(exp?.carId||''),expectedRoundId:String(exp?.round?.id||'')});save();
      toast('Race target changed — OTG! refreshed the championship instead of opening a stale result');
      window.rhOpenRun?.(runId);return;
    }
    window.rhFestivalEntryContext8080={runId:String(runId),carId:String(carId),roundId:String(roundId),openedAt:new Date().toISOString()};
  }
  return baseEnterResult.apply(this,arguments);
};
function guardSave(name){
  const base=window[name];if(typeof base!=='function')return;
  window[name]=function(runId,carId,roundId){
    const r=runById(runId);if(!canCorrect(r))return base.apply(this,arguments);
    const key=String(runId),exp=expectedSlot(r),ctx=window.rhFestivalEntryContext8080;
    const data={runId:key,requestedCarId:String(carId),requestedRoundId:String(roundId),expectedCarId:String(exp?.carId||''),expectedRoundId:String(exp?.round?.id||''),saveApi:name};
    if(activeSaves.has(key)){audit('blocked-double-save',data);save();toast('Save already in progress — duplicate result blocked');return}
    if(!exp){audit('blocked-save-complete',data);save();toast('Championship already has every result — duplicate save blocked');window.rhOpenRun?.(runId);return}
    if(!same(exp.carId,carId)||!same(exp.round.id,roundId)){
      audit('blocked-save-stale-target',data);save();toast('Result target changed — nothing was saved');window.rhOpenRun?.(runId);return;
    }
    if(ctx&&same(ctx.runId,runId)&&(!same(ctx.carId,carId)||!same(ctx.roundId,roundId))){
      audit('blocked-save-entry-context-mismatch',{...data,contextCarId:ctx.carId,contextRoundId:ctx.roundId});save();toast('Result screen no longer matches the current race — nothing was saved');window.rhOpenRun?.(runId);return;
    }
    if(resultFor(r,carId,roundId)){audit('blocked-save-existing-result',data);save();toast('That car / round already has a result — duplicate blocked');window.rhOpenRun?.(runId);return}
    const before=clone(r.results||[]),beforeIds=new Set(before.map(x=>String(x.id))),oldStatus=r.status,oldCompletedAt=r.completedAt,oldUpdatedAt=r.updatedAt;
    activeSaves.add(key);
    try{
      const out=base.apply(this,arguments);
      const after=r.results||[],created=after.filter(x=>!beforeIds.has(String(x.id)));
      const valid=created.length===1&&same(created[0].carId,carId)&&same(created[0].roundId,roundId);
      if(!valid){
        r.results=before;r.status=oldStatus;
        if(oldCompletedAt!=null)r.completedAt=oldCompletedAt;else delete r.completedAt;
        if(oldUpdatedAt!=null)r.updatedAt=oldUpdatedAt;else delete r.updatedAt;
        audit('rolled-back-invalid-save',{...data,createdCount:created.length,createdTargets:created.map(x=>`${x.carId}/${x.roundId}`)});save();
        toast('OTG! blocked an inconsistent result save and restored the previous data');
        setTimeout(()=>window.rhOpenRun?.(runId),0);return;
      }
      const res=created[0];res.audit8080={savedAt:new Date().toISOString(),version:V,sequence:after.length,requestedCarId:String(carId),requestedRoundId:String(roundId),expectedCarId:String(exp.carId),expectedRoundId:String(exp.round.id)};
      audit('saved-result',{...data,resultId:String(res.id),time:Number(res.time),resultCount:after.length});save();
      window.rhFestivalEntryContext8080=null;
      return out;
    }finally{activeSaves.delete(key)}
  };
}
guardSave('rhSaveResultFinal');
guardSave('rhSaveResult');

/* ---------------- Corrections editor ---------------- */
let editorState={runId:null,query:'',limit:50,focusResultId:null};
function closeEditor(){q('rhCorrections8080')?.remove();document.body.classList.remove('rhCorrectionsOpen8080')}
function clearFinalStandingsContext(){document.body.classList.remove('rhFS28Active');const host=q('final-standings');if(host){host.classList.add('hidden');host.innerHTML=''}}
window.rhCloseResultsCorrectionsV8080=closeEditor;
function savedCars(r){
  const rows=(r.entries||[]).map((id,index)=>{const rs=(r.results||[]).filter(x=>same(x.carId,id));const newest=rs.reduce((v,x)=>Math.max(v,new Date(x.correctedAt||x.date||0).getTime()||0),0);return{id,index,rs,newest,name:carText(id)}}).filter(x=>x.rs.length);
  rows.sort((a,b)=>b.newest-a.newest||b.index-a.index);return rows;
}
function editorRows(r){
  let cars=savedCars(r),query=String(editorState.query||'').trim().toLowerCase();
  if(query)cars=cars.filter(x=>x.name.toLowerCase().includes(query)||x.rs.some(res=>String(res.roundName||'').toLowerCase().includes(query)||fmt(res.time).toLowerCase().includes(query)));
  const total=cars.length,shown=query?cars:cars.slice(0,editorState.limit);
  const focus=String(editorState.focusResultId||'');
  const html=shown.map(row=>{
    const complete=row.rs.length===(r.rounds||[]).length,totalTime=row.rs.reduce((s,x)=>s+Number(x.time||0),0),open=focus&&row.rs.some(x=>same(x.id,focus));
    return `<details class="rhCorrectionCar8080" ${open?'open':''}><summary><span><small>${complete?'COMPLETE':'IN PROGRESS'} • ${row.rs.length}/${(r.rounds||[]).length} RESULTS</small><b>${esc(row.name)}</b></span><strong>${complete?fmt(totalTime):'—'} <i>⌄</i></strong></summary><div class="rhCorrectionRounds8080">${(r.rounds||[]).map((rd,i)=>{const res=resultFor(r,row.id,rd.id);return `<div class="rhCorrectionRound8080 ${res&&same(res.id,focus)?'focus':''}"><span><small>ROUND ${i+1}</small><b>${esc(rd.name||`Round ${i+1}`)}</b></span>${res?`<strong>${fmt(res.time)}</strong><em>${res.position?`P${Number(res.position)}`:'—'}</em><button type="button" onclick="rhEditFestivalResultV8080('${esc(r.id)}','${esc(res.id)}')">EDIT</button>`:`<strong class="missing">MISSING</strong><em>—</em><span class="rhCorrectionMissing8080">NOT SAVED</span>`}</div>`}).join('')}</div></details>`;
  }).join('');
  return {html,total,shown:shown.length,query};
}
function editorStatus(r){
  const exp=expectedSlot(r),dupes=duplicateTargets(r),board=classify(r),leader=board[0];
  return `<section class="rhCorrectionStatus8080 ${dupes.length?'warn':''}"><div><small>CHAMPIONSHIP STATUS</small><b>${r.status==='complete'?'COMPLETE':'IN PROGRESS / REOPENED'}</b></div><div><small>SAVED RESULTS</small><b>${(r.results||[]).length} / ${(r.entries||[]).length*(r.rounds||[]).length}</b></div>${leader?`<div><small>CURRENT LEADER</small><b>${esc(carText(leader.id))}</b><em>${fmt(leader.total)}</em></div>`:''}${exp?`<div><small>NEXT MISSING RESULT</small><b>${esc(carText(exp.carId))}</b><em>${esc(exp.round.name)}</em></div>`:''}${dupes.length?`<p>⚠ OTG! found ${dupes.length} duplicate car/round target${dupes.length===1?'':'s'}. Correct these before continuing.</p>`:''}</section>`;
}
function renderEditor(){
  const host=q('rhCorrections8080'),r=runById(editorState.runId);if(!host||!canCorrect(r)){closeEditor();return}
  const rows=editorRows(r);
  host.innerHTML=`<div class="rhCorrectionsPage8080"><div class="rhCorrectionsHead8080"><button type="button" onclick="rhCloseResultsCorrectionsV8080()">‹ BACK</button><div><small>RESULTS / CORRECTIONS</small><h1>${esc(r.name||'Championship')}</h1><p>Edit a saved time now or reopen one missing race. Corrections replace data; they do not add another race.</p></div></div><main>${editorStatus(r)}<section class="rhCorrectionSearch8080"><input type="search" value="${esc(editorState.query)}" placeholder="Search car or track…" oninput="rhFilterResultsCorrectionsV8080(this.value)"><small>${rows.query?`${rows.total} MATCHING CAR${rows.total===1?'':'S'}`:`SHOWING ${rows.shown} MOST RECENT OF ${rows.total} CAR${rows.total===1?'':'S'} WITH RESULTS`}</small></section><section class="rhCorrectionList8080">${rows.html||'<div class="rhCorrectionEmpty8080">NO SAVED RESULTS YET</div>'}</section>${!rows.query&&rows.shown<rows.total?`<button class="rhCorrectionMore8080" type="button" onclick="rhMoreResultsCorrectionsV8080()">SHOW MORE RESULTS</button>`:''}<aside class="rhCorrectionInfo8080"><b>WHAT CHANGES?</b><p>Standings, Records, PBs, Track Directory usage, Stats and Hall of Fame are derived from the saved results and will recalculate. Evil Campaign progress is not changed by a correction.</p></aside></main></div>`;
  if(editorState.focusResultId)setTimeout(()=>host.querySelector('.rhCorrectionRound8080.focus')?.scrollIntoView({block:'center'}),40);
}
window.rhOpenResultsCorrectionsV8080=function(runId,focusResultId=''){
  const r=runById(runId);if(!canCorrect(r)){toast('Results corrections are not available for this championship format yet');return}
  closeEditor();editorState={runId:String(runId),query:'',limit:50,focusResultId:String(focusResultId||'')};
  const d=document.createElement('div');d.id='rhCorrections8080';d.className='rhCorrectionsOverlay8080';document.body.appendChild(d);document.body.classList.add('rhCorrectionsOpen8080');renderEditor();window.scrollTo(0,0);
};
window.rhFilterResultsCorrectionsV8080=function(value){editorState.query=String(value||'');editorState.limit=50;editorState.focusResultId='';renderEditor()};
window.rhMoreResultsCorrectionsV8080=function(){editorState.limit+=50;renderEditor()};
window.rhEditFestivalResultV8080=function(runId,resultId){
  const r=runById(runId),res=r?.results?.find(x=>same(x.id,resultId));if(!canCorrect(r)||!res)return;
  const p=secsParts(res.time),rd=(r.rounds||[]).find(x=>same(x.id,res.roundId));
  q('rhCorrectionEdit8080')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhCorrectionEdit8080" class="rhCorrectionEditOverlay8080"><div class="rhCorrectionEdit8080"><button class="rhCorrectionEditX8080" type="button" onclick="document.getElementById('rhCorrectionEdit8080')?.remove()">×</button><small>EDIT SAVED RESULT</small><h2>${esc(carText(res.carId))}</h2><p>${esc(rd?.name||res.roundName||'Round')}</p><div class="rhCorrectionTime8080"><label><span>MIN</span><input id="rhCorrectionMin8080" inputmode="numeric" maxlength="2" value="${String(p.m).padStart(2,'0')}"></label><b>:</b><label><span>SEC</span><input id="rhCorrectionSec8080" inputmode="numeric" maxlength="2" value="${String(p.s).padStart(2,'0')}"></label><b>.</b><label><span>MS</span><input id="rhCorrectionMs8080" inputmode="numeric" maxlength="3" value="${String(p.ms).padStart(3,'0')}"></label></div><label class="rhCorrectionPosition8080"><span>FINISHING POSITION</span><input id="rhCorrectionPos8080" inputmode="numeric" maxlength="3" value="${res.position??''}" placeholder="Optional"></label>${res.advancedTiming?'<div class="rhCorrectionAdvanced8080">Changing the total time will clear the saved Advanced Timing lap breakdown for this result.</div>':''}<button class="rhCorrectionSave8080" type="button" onclick="rhSaveFestivalCorrectionV8080('${esc(runId)}','${esc(resultId)}')">SAVE CORRECTION</button><button class="rhCorrectionDelete8080" type="button" onclick="rhDeleteFestivalResultV8080('${esc(runId)}','${esc(resultId)}')">DELETE RESULT & REOPEN RACE</button><button class="rhCorrectionCancel8080" type="button" onclick="document.getElementById('rhCorrectionEdit8080')?.remove()">CANCEL</button></div></div>`);
};
window.rhSaveFestivalCorrectionV8080=function(runId,resultId){
  const r=runById(runId),res=r?.results?.find(x=>same(x.id,resultId));if(!canCorrect(r)||!res)return;
  const m=Number(q('rhCorrectionMin8080')?.value||0),s=Number(q('rhCorrectionSec8080')?.value||0),ms=Number(String(q('rhCorrectionMs8080')?.value||'0').padEnd(3,'0')),posRaw=String(q('rhCorrectionPos8080')?.value||'').trim(),pos=posRaw?Number(posRaw):null;
  if(!Number.isFinite(m)||!Number.isFinite(s)||!Number.isFinite(ms)||m<0||m>99||s<0||s>59||ms<0||ms>999)return toast('Enter a valid corrected race time');
  const time=m*60+s+ms/1000;if(time<=0)return toast('Enter a valid corrected race time');if(posRaw&&(!Number.isFinite(pos)||pos<1))return toast('Enter a valid finishing position');
  const old={time:Number(res.time),position:res.position??null,advancedTiming:!!res.advancedTiming};
  if(!Array.isArray(res.corrections8080))res.corrections8080=[];res.corrections8080.push({at:new Date().toISOString(),version:V,fromTime:old.time,toTime:time,fromPosition:old.position,toPosition:pos});if(res.corrections8080.length>10)res.corrections8080.shift();
  res.time=Number(time.toFixed(3));res.position=pos;res.correctedAt=new Date().toISOString();res.correctedVersion=V;
  if(res.advancedTiming&&Math.abs(Number(res.advancedTiming.totalTime||old.time)-res.time)>0.0005){delete res.advancedTiming;res.advancedTimingClearedByCorrectionAt=res.correctedAt}
  const rd=(r.rounds||[]).find(x=>same(x.id,res.roundId));if(rd?.name)res.roundName=rd.name;
  clearRecordExclusions(r,res.roundName);recalcFlags(r,res);refreshRunStatus(r);r.correctedAt=res.correctedAt;
  audit('corrected-result',{runId:String(r.id),resultId:String(res.id),carId:String(res.carId),roundId:String(res.roundId),roundName:String(res.roundName||''),fromTime:old.time,toTime:res.time});save();
  q('rhCorrectionEdit8080')?.remove();if(r.status==='complete'&&typeof window.rhShowFinalStandingsV5828==='function')window.rhShowFinalStandingsV5828(r.id);editorState.focusResultId=String(res.id);renderEditor();toast('Result corrected — standings and records recalculated');
};
window.rhDeleteFestivalResultV8080=function(runId,resultId){
  const r=runById(runId),res=r?.results?.find(x=>same(x.id,resultId));if(!canCorrect(r)||!res)return;
  const rd=(r.rounds||[]).find(x=>same(x.id,res.roundId)),car=carText(res.carId),track=rd?.name||res.roundName||'this round';
  if(!confirm(`DELETE SAVED RESULT?\n\n${car}\n${track} — ${fmt(res.time)}\n\nOTG! will remove this one result and reopen the championship at the missing race. Other saved results and Evil Campaign progress stay intact.`))return;
  const removed=clone(res);r.results=(r.results||[]).filter(x=>!same(x.id,resultId));clearRecordExclusions(r,track);refreshRunStatus(r);r.correctedAt=new Date().toISOString();
  audit('deleted-result-reopen',{runId:String(r.id),resultId:String(removed.id),carId:String(removed.carId),roundId:String(removed.roundId),roundName:String(track),time:Number(removed.time)});save();
  q('rhCorrectionEdit8080')?.remove();closeEditor();clearFinalStandingsContext();toast(`Result removed — ${car} / ${track} reopened`);window.rhOpenRun?.(r.id);
};

/* ---------------- Entry points into editor ---------------- */
function launchButton(runId,label='RESULTS / CORRECTIONS'){return `<button class="rhCorrectionsLaunch8080" type="button" onclick="rhOpenResultsCorrectionsV8080('${esc(runId)}')"><span>✎</span><div><b>${label}</b><small>REVIEW OR CORRECT SAVED TIMES</small></div></button>`}
function decorateActive(runId){
  const r=runById(runId);if(!canCorrect(r)||(r.results||[]).length<1)return;
  const host=q('festival');if(!host||host.querySelector('.rhCorrectionsLaunch8080'))return;
  const footer=host.querySelector('.rhChamp33Footer'),body=host.querySelector('.rhChamp33Body');if(footer)footer.insertAdjacentHTML('beforebegin',launchButton(runId));else if(body)body.insertAdjacentHTML('beforeend',launchButton(runId));
}
function decorateCurrentStandings(runId){
  const r=runById(runId),host=q('festival');if(!canCorrect(r)||(r.results||[]).length<1||!host||host.querySelector('.rhCorrectionsLaunch8080'))return;
  const ret=host.querySelector('.rhStandings33Return');if(ret)ret.insertAdjacentHTML('beforebegin',launchButton(runId));
}
function decorateFinal(runId){
  const r=runById(runId),host=q('final-standings');if(!canCorrect(r)||!host||host.classList.contains('hidden')||host.querySelector('.rhCorrectionsFinal8080'))return;
  const page=host.querySelector('.rhFS28Page');if(page)page.insertAdjacentHTML('beforeend',`<button class="rhCorrectionsFinal8080" type="button" onclick="rhOpenResultsCorrectionsV8080('${esc(runId)}')"><b>CORRECT RESULTS</b></button>`);
}
const baseOpenRun=window.rhOpenRun;
if(typeof baseOpenRun==='function')window.rhOpenRun=function(id){
  const r=runById(id);
  if(canCorrect(r)&&r.status==='complete'&&typeof window.rhShowFinalStandingsV5828==='function'){
    window.rhShowFinalStandingsV5828(id);requestAnimationFrame(()=>decorateFinal(id));return;
  }
  const out=baseOpenRun.apply(this,arguments);requestAnimationFrame(()=>decorateActive(id));return out;
};
const baseStandings=window.rhShowCurrentStandingsV5834;
if(typeof baseStandings==='function')window.rhShowCurrentStandingsV5834=function(id){const out=baseStandings.apply(this,arguments);requestAnimationFrame(()=>decorateCurrentStandings(id));return out};
const baseFinal=window.rhShowFinalStandingsV5828;
if(typeof baseFinal==='function')window.rhShowFinalStandingsV5828=function(id){const out=baseFinal.apply(this,arguments);requestAnimationFrame(()=>decorateFinal(id));return out};
const baseComplete=window.rhChampionshipCompleteTransition;
if(typeof baseComplete==='function')window.rhChampionshipCompleteTransition=function(id){const out=baseComplete.apply(this,arguments);requestAnimationFrame(()=>decorateFinal(id));return out};
const baseSummary=window.rhResultSummary;
if(typeof baseSummary==='function')window.rhResultSummary=function(r,res){
  const out=baseSummary.apply(this,arguments);if(canCorrect(r)&&res){requestAnimationFrame(()=>{const body=q('festival')?.querySelector('.rhPodiumBodyV5804');if(body&&!body.querySelector('.rhEditLast8080')){const cont=body.querySelector('.rhPodiumContinueV5804');const html=`<button class="rhEditLast8080" type="button" onclick="rhOpenResultsCorrectionsV8080('${esc(r.id)}','${esc(res.id)}')"><span>✎</span><div><b>EDIT / UNDO LAST RESULT</b><small>${esc(carText(res.carId))} • ${esc(res.roundName||'ROUND')}</small></div></button>`;if(cont)cont.insertAdjacentHTML('beforebegin',html);else body.insertAdjacentHTML('beforeend',html)}})}return out;
};

window.rhResultsCorrectionsReportV8080=()=>({version:V,auditEntries:(currentSpace()?.resultAudit8080||[]).length,activeContext:window.rhFestivalEntryContext8080||null});
})();
