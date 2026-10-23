/* OTG! MAIN v8.0.113 — Read-only, Space-local Racing Reports for My OTG! Journey.
 * Reports are rebuilt from already-saved timestamped results; no racing-result writes.
 * The only stored metadata is optional manual session end boundaries in the active Space.
 */
(()=>{
 'use strict';
 const INACTIVITY=3*60*60*1000;
 const $=id=>document.getElementById(id);
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const ms=v=>{if(!v)return NaN;const n=Date.parse(v);return Number.isFinite(n)&&n>0?n:NaN};
 const duration=secs=>{secs=Math.max(0,Number(secs)||0);const h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=Math.round(secs%60);return h?`${h}h ${String(m).padStart(2,'0')}m`:m?`${m}m ${String(s).padStart(2,'0')}s`:`${s}s`};
 const dateTime=t=>new Date(t).toLocaleString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
 const timeOnly=t=>new Date(t).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false});
 const space=()=>typeof window.rhSpace==='function'?window.rhSpace():null;
 function makeRows(s){
  const out=[],seen=new Set();
  function add(r,src,kind,round,carFallback){
   if(!r)return;
   const at=ms(r.date||r.savedAt||r.recordedAt||r.createdAt);
   const seconds=Number(r.time);
   if(!Number.isFinite(at)||!Number.isFinite(seconds)||seconds<=0||r.advancedTiming)return;
   const carId=String(r.carId||carFallback||r.car?.sourceCarId||r.car?.id||'');
   // Race Off match results can also appear in attempts/history: count each official result once.
   const key=r.id?`id:${r.id}`:`${kind}|${src?.id}|${round?.id}|${carId}|${at}|${seconds}`;
   if(seen.has(key))return;seen.add(key);
   out.push({at,time:seconds,carId,track:String(r.track||round?.name||r.roundName||'').trim(),layout:String(r.layout||round?.layout||'').trim(),name:String(src?.name||src?.title||kind).trim(),kind,allTime:!!r.allTime,championshipRecord:!!r.championshipRecord,car:r.car||null});
  }
  for(const r of s.runs||[]){const rounds=new Map((r.rounds||[]).map(rd=>[String(rd.id),rd]));for(const x of r.results||[])add(x,r,'Festival',rounds.get(String(x.roundId)))}
  for(const r of s.customEvents||[]){const rounds=new Map((r.frozenRounds?.length?r.frozenRounds:r.rounds||[]).map(rd=>[String(rd.id),rd]));for(const x of r.results||[])add(x,r,'Custom Racing',rounds.get(String(x.roundId)))}
  for(const ro of s.raceOffs||[])for(const rd of ro.rounds||[])for(const m of rd.matches||[]){
   add(m.resultA,ro,'Race Off',rd,m.carA?.sourceCarId||m.carA?.id);
   add(m.resultB,ro,'Race Off',rd,m.carB?.sourceCarId||m.carB?.id);
  }
  return out.sort((a,b)=>a.at-b.at);
 }
 function build(s,now=Date.now()){
  const rows=makeRows(s),breaks=(Array.isArray(s.otgReportBreaksV8113)?s.otgReportBreaksV8113:[]).map(Number).filter(Number.isFinite).sort((a,b)=>a-b),sessions=[];
  let current=null;
  for(const r of rows){
   const split=current&&(r.at-current.end>INACTIVITY||breaks.some(t=>current.end<=t&&t<r.at));
   if(!current||split){current={start:r.at,end:r.at,rows:[],results:0,time:0,carIds:new Set(),completions:[],records:0,pbs:0};sessions.push(current)}
   current.rows.push(r);r._session=current;current.end=r.at;current.results++;current.time+=r.time;
   if(r.carId)current.carIds.add(r.carId);
   // Track firsts count as records elsewhere, but are not falsely labelled "PBs broken" here.
   if(r.allTime||r.championshipRecord)current.records++;
  }
  // A genuine improved personal time requires an earlier entry for the SAME car / track / layout.
  const prior=new Map();for(const r of rows){const k=`${r.carId}\u0001${r.track.toLowerCase()}\u0001${r.layout.toLowerCase()}`;if(!r.carId||!r.track)continue;const best=prior.get(k);if(best!==undefined&&r.time<best){if(r._session)r._session.pbs++}if(best===undefined||r.time<best)prior.set(k,r.time)}
  const finishes=[];
  for(const [items,kind] of [[s.runs||[],'Festival'],[s.customEvents||[],'Custom Racing'],[s.raceOffs||[],'Race Off']]){
   for(const e of items){if(e.status!=='complete')continue;const at=ms(e.completedAt);if(!Number.isFinite(at))continue;
    finishes.push({at,name:String(e.name||kind),kind,id:String(e.id||'')});
   }
  }
  finishes.sort((a,b)=>a.at-b.at);
  for(const f of finishes){const session=sessions.slice().reverse().find(g=>f.at>=g.start&&f.at<=g.end+INACTIVITY);if(session&&!session.completions.some(x=>x.id===f.id&&x.kind===f.kind))session.completions.push(f)}
  for(const g of sessions){g.closed=g.end<=now-INACTIVITY||breaks.some(t=>t>=g.end&&t<=now);g.cars=g.carIds.size;g.completions.sort((a,b)=>a.at-b.at)}
  return sessions.reverse();
 }
 const getReports=()=>{const s=space();return s?build(s):[]};
 function draw(){const host=$('hall');if(!host)return;
  const data=getReports(),latest=data[0],active=latest&&!latest.closed,carMap=new Map((space()?.cars||[]).map(c=>[String(c.id),[c.make,c.model,c.year].filter(Boolean).join(' ')]));
  host.innerHTML=`<div class="v7Journey otgReports8113"><div class="v7JourneyHead"><button type="button" onclick="rhOpenJourneyV7003()">‹ BACK TO JOURNEY</button><h1>RACING REPORTS</h1><p>My OTG! Journey • Your racing nights</p></div><section class="otgReportsIntro8113">Race results are grouped into sessions automatically. A gap of 3 hours ends a session, even across midnight. Reports use recorded driving times, not real-world playtime.</section>${data.length?`<div class="otgReportsSummary8113"><b>${data.length}</b><span>RACING SESSION${data.length===1?'':'S'} FOUND</span></div>${data.map((g,i)=>`<details class="otgReportCard8113" ${i===0?'open':''}><summary><span><small>${g.closed?'SESSION COMPLETE':'CURRENT SESSION'}</small><strong>${escape(dateTime(g.start))}</strong><em>${escape(timeOnly(g.start))}–${escape(timeOnly(g.end))} · ${g.results} RESULTS · ${g.cars} CARS</em></span><i aria-hidden="true">⌄</i></summary><div class="otgReportBody8113"><div class="otgReportNumbers8113"><div><b>${g.results}</b><small>RESULTS</small></div><div><b>${g.cars}</b><small>CARS DRIVEN</small></div><div><b>${escape(duration(g.time))}</b><small>RECORDED DRIVING</small></div><div><b>${g.completions.length}</b><small>EVENTS FINISHED</small></div></div><p class="otgReportFoot8113">${g.pbs?`${g.pbs} faster repeat car/track time${g.pbs===1?'':'s'} · `:''}${g.records?`${g.records} record-flagged result${g.records===1?'':'s'}`:'No record flags on these results'}</p>${g.completions.length?`<div class="otgReportHighlights8113"><b>🏁 FINISHED EVENTS</b>${g.completions.map(f=>`<div>${escape(f.name)} <small>${escape(f.kind)}</small></div>`).join('')}</div>`:''}<details class="otgReportCars8113"><summary>VIEW CARS DRIVEN</summary><div>${[...new Set(g.rows.map(r=>r.carId).filter(Boolean))].map(id=>escape(carMap.get(id)||g.rows.find(r=>r.carId===id)?.car?.name||'Car ID '+id)).join('<br>')||'No identified cars'}</div></details>${i===0&&active?`<button class="otgFinishSession8113" type="button" onclick="rhFinishRacingSessionV8113()">✓ FINISH SESSION</button>`:''}</div></details>`).join('')}`:`<div class="v7JourneyEmpty">No timestamped racing results yet. Save your first race result and its report will appear here. Older results without timestamps cannot be reconstructed.</div>`}<footer>ⓘ Reports are calculated from this Space's saved timed results. No extra race entry is required. Drift Zone scores without result timestamps are not included.</footer></div>`;
  host.scrollTop=0;window.scrollTo(0,0);
 }
 window.rhOpenRacingReportsV8113=draw;
 window.rhFinishRacingSessionV8113=function(){const s=space(),latest=getReports()[0];if(!s||!latest||latest.closed)return;
  s.otgReportBreaksV8113=Array.isArray(s.otgReportBreaksV8113)?s.otgReportBreaksV8113:[];
  const stamp=Date.now();s.otgReportBreaksV8113.push(stamp);
  try{window.rhSave();}catch(e){s.otgReportBreaksV8113.pop();try{window.toast?.('Unable to save session end')}catch(_){};return}
  draw();
 };
 // Add one Reports entrance AT THE TOP of Journey, without changing its timeline.
 const old=window.rhOpenJourneyV7003;
 if(typeof old==='function')window.rhOpenJourneyV7003=function(...args){const result=old.apply(this,args),head=$('hall')?.querySelector('.v7JourneyHead');if(head&&!$('otgRacingReportsTile8113')){const tile=document.createElement('button');tile.id='otgRacingReportsTile8113';tile.type='button';tile.className='otgReportsTile8113';tile.innerHTML='<i aria-hidden="true">▤</i><span><b>RACING REPORTS</b><small>Your racing nights, automatically recorded</small><em>VIEW REPORTS ›</em></span><strong aria-hidden="true">›</strong>';tile.addEventListener('click',draw);head.insertAdjacentElement('afterend',tile)}return result};
 window.otgRacingReportsTestV8113={build,makeRows};
})();
