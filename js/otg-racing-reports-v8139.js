/* OTG! MAIN v8.0.139 — Read-only, Space-local Racing Reports for My OTG! Journey.
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
  const prior=new Map();for(const r of rows){const k=`${r.carId}\u0001${r.track.toLowerCase()}\u0001${r.layout.toLowerCase()}`;if(!r.carId||!r.track)continue;const best=prior.get(k);if(best!==undefined&&r.time<best){r._improvedPB=true;if(r._session)r._session.pbs++}if(best===undefined||r.time<best)prior.set(k,r.time)}
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
 const dateKey=t=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 const inc=(map,key)=>map.set(key,(map.get(key)||0)+1);
 const bestOf=map=>[...map.entries()].sort((a,b)=>b[1]-a[1]||String(a[0]).localeCompare(String(b[0])))[0]||null;
 function buildPeriods(s,now=Date.now()){
  // Aggregate the SAME deduplicated timed results as Sessions. Never sum a
  // session's distinct-car count, and never assign a midnight session wholly
  // to its start month/year: each saved result uses its own local calendar date.
  const sessions=build(s,now),months=new Map(),years=new Map();
  function get(map,key){let p=map.get(key);if(!p){p={key,results:0,time:0,cars:new Set(),sessions:new Set(),days:new Set(),carCounts:new Map(),carNames:new Map(),trackCounts:new Map(),dayCounts:new Map(),monthCounts:new Map(),records:0,pbs:0,events:[]};map.set(key,p)}return p}
  function addResult(p,r,g){
   p.results++;p.time+=r.time;p.sessions.add(g);
   const day=dateKey(r.at);p.days.add(day);inc(p.dayCounts,day);inc(p.monthCounts,day.slice(0,7));
   if(r.carId){p.cars.add(r.carId);inc(p.carCounts,r.carId);if(r.car?.name)p.carNames.set(r.carId,String(r.car.name))}
   if(r.track){inc(p.trackCounts,r.track+(r.layout?' · '+r.layout:''))}
   if(r.allTime||r.championshipRecord)p.records++;
   if(r._improvedPB)p.pbs++;
  }
  for(const g of sessions)for(const r of g.rows){
   const day=dateKey(r.at);addResult(get(months,day.slice(0,7)),r,g);addResult(get(years,day.slice(0,4)),r,g);
  }
  // Event completions are REAL finished competitions, not game-AI race positions.
  // Deduplicate by event type and identifier; no invented gold/silver/bronze.
  const finished=new Set();
  for(const [items,kind] of [[s.runs||[],'Festival'],[s.customEvents||[],'Custom Racing'],[s.raceOffs||[],'Race Off']]){
   for(const e of items){if(e?.status!=='complete')continue;
    const at=ms(e.completedAt);if(!Number.isFinite(at))continue;
    const id=String(e.id||'');const key=id?`${kind}|${id}`:`${kind}|${String(e.name||'')}|${at}`;
    if(finished.has(key))continue;finished.add(key);
    const f={at,name:String(e.name||kind),kind};const day=dateKey(at);
    get(months,day.slice(0,7)).events.push(f);get(years,day.slice(0,4)).events.push(f);
   }
  }
  function finalise(map){return [...map.values()].sort((a,b)=>b.key.localeCompare(a.key)).map(p=>{
   p.carsDriven=p.cars.size;p.sessionsTouched=p.sessions.size;p.activeDays=p.days.size;
   p.topCar=bestOf(p.carCounts);p.topTrack=bestOf(p.trackCounts);
   p.busyDay=bestOf(p.dayCounts);p.busyMonth=bestOf(p.monthCounts);
   p.events.sort((a,b)=>b.at-a.at);
   return p;
  })}
  return {months:finalise(months),years:finalise(years)};
 }
 let activeView='sessions';
 function periodTitle(p,view){if(view==='years')return p.key;const [y,m]=p.key.split('-').map(Number);return new Date(y,m-1,1).toLocaleString('en-GB',{month:'long',year:'numeric'}).toUpperCase()}
 function periodCard(p,i,view,carMap){
  const car=p.topCar?carMap.get(String(p.topCar[0]))||p.carNames.get(p.topCar[0])||`Car ID ${p.topCar[0]}`:null;
  const track=p.topTrack?.[0]||null;
  const busy=view==='years'?p.busyMonth:p.busyDay;
  const busyLabel=busy?(view==='years'?new Date(Number(busy[0].slice(0,4)),Number(busy[0].slice(5,7))-1,1).toLocaleString('en-GB',{month:'short',year:'numeric'}):new Date(busy[0]+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short'})):null;
  const highlight=(label,value)=>value?`<div><small>${label}</small><strong>${escape(value)}</strong></div>`:'';
  return `<details class="otgReportCard8113 otgPeriodCard8139" ${i===0?'open':''}><summary><span><small>${view==='years'?'YEARLY REPORT':'MONTHLY REPORT'}</small><strong>${escape(periodTitle(p,view))}</strong><em>${p.activeDays} ACTIVE DAY${p.activeDays===1?'':'S'} · ${p.sessionsTouched} SESSION${p.sessionsTouched===1?'':'S'} TOUCHED</em></span><i aria-hidden="true">⌄</i></summary><div class="otgReportBody8113"><div class="otgReportNumbers8113"><div><b>${p.results}</b><small>TIMED RESULTS</small></div><div><b>${escape(duration(p.time))}</b><small>RECORDED DRIVING</small></div><div><b>${p.carsDriven}</b><small>DIFFERENT CARS</small></div><div><b>${p.events.length}</b><small>EVENTS FINISHED</small></div></div><p class="otgReportFoot8113">${p.pbs} improved repeat car/track time${p.pbs===1?'':'s'} · ${p.records} record-flagged result${p.records===1?'':'s'}</p>${car||track||busy?`<div class="otgPeriodHighlights8139">${highlight('MOST DRIVEN CAR',car&&`${car} · ${p.topCar[1]} result${p.topCar[1]===1?'':'s'}`)}${highlight('MOST RACED COURSE',track&&`${track} · ${p.topTrack[1]} result${p.topTrack[1]===1?'':'s'}`)}${highlight(view==='years'?'BUSIEST MONTH':'BUSIEST DAY',busy&&`${busyLabel} · ${busy[1]} result${busy[1]===1?'':'s'}`)}</div>`:''}${p.events.length?`<details class="otgPeriodFinished8139"><summary>🏁 ${p.events.length} FINISHED EVENT${p.events.length===1?'':'S'} · VIEW</summary><div>${p.events.map(f=>`<div>${escape(f.name)} <small>${escape(f.kind)} · ${escape(new Date(f.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}))}</small></div>`).join('')}</div></details>`:''}</div></details>`;
 }
 function draw(){const host=$('hall');if(!host)return;
  const s=space(),data=activeView==='sessions'?getReports():[],periods=s&&activeView!=='sessions'?buildPeriods(s):null;
  const shown=(activeView==='months'?periods?.months:activeView==='years'?periods?.years:data)||[];
  const latest=data[0],active=latest&&!latest.closed,carMap=new Map((s?.cars||[]).map(c=>[String(c.id),[c.make,c.model,c.year].filter(Boolean).join(' ')]));
  const tabs=`<div class="otgReportTabs8139" role="group" aria-label="Racing report period">${[['sessions','SESSIONS'],['months','MONTHLY'],['years','YEARLY']].map(([id,label])=>`<button type="button" data-report-view="${id}" aria-pressed="${activeView===id}" class="${activeView===id?'selected':''}">${label}</button>`).join('')}</div>`;
  const intro=activeView==='sessions'?'Race results are grouped into sessions automatically. A gap of 3 hours ends a session, even across midnight. Reports use recorded driving times, not real-world playtime.':activeView==='months'?'Monthly summaries follow each result’s local calendar date, including sessions that cross midnight. Different cars are counted once per month, not added from daily sessions.':'Yearly summaries follow recorded results by calendar year, including sessions that cross New Year. Different cars are counted once per year, not added from months.';
  const main=activeView==='sessions'?(data.length?`<div class="otgReportsSummary8113"><b>${data.length}</b><span>RACING SESSION${data.length===1?'':'S'} FOUND</span></div>${data.map((g,i)=>`<details class="otgReportCard8113" ${i===0?'open':''}><summary><span><small>${g.closed?'SESSION COMPLETE':'CURRENT SESSION'}</small><strong>${escape(dateTime(g.start))}</strong><em>${escape(timeOnly(g.start))}–${escape(timeOnly(g.end))} · ${g.results} RESULTS · ${g.cars} CARS</em></span><i aria-hidden="true">⌄</i></summary><div class="otgReportBody8113"><div class="otgReportNumbers8113"><div><b>${g.results}</b><small>RESULTS</small></div><div><b>${g.cars}</b><small>CARS DRIVEN</small></div><div><b>${escape(duration(g.time))}</b><small>RECORDED DRIVING</small></div><div><b>${g.completions.length}</b><small>EVENTS FINISHED</small></div></div><p class="otgReportFoot8113">${g.pbs?`${g.pbs} faster repeat car/track time${g.pbs===1?'':'s'} · `:''}${g.records?`${g.records} record-flagged result${g.records===1?'':'s'}`:'No record flags on these results'}</p>${g.completions.length?`<div class="otgReportHighlights8113"><b>🏁 FINISHED EVENTS</b>${g.completions.map(f=>`<div>${escape(f.name)} <small>${escape(f.kind)}</small></div>`).join('')}</div>`:''}<details class="otgReportCars8113"><summary>VIEW CARS DRIVEN</summary><div>${[...new Set(g.rows.map(r=>r.carId).filter(Boolean))].map(id=>escape(carMap.get(id)||g.rows.find(r=>r.carId===id)?.car?.name||'Car ID '+id)).join('<br>')||'No identified cars'}</div></details>${i===0&&active?`<button class="otgFinishSession8113" type="button" onclick="rhFinishRacingSessionV8113()">✓ FINISH SESSION</button>`:''}</div></details>`).join('')}`:`<div class="v7JourneyEmpty">No timestamped racing results yet. Save your first race result and its report will appear here. Older results without timestamps cannot be reconstructed.</div>`):shown.length?`<div class="otgReportsSummary8113"><b>${shown.length}</b><span>${activeView==='months'?'MONTH':'YEAR'}${shown.length===1?'':'S'} WITH RECORDED ACTIVITY</span></div>${shown.map((p,i)=>periodCard(p,i,activeView,carMap)).join('')}`:`<div class="v7JourneyEmpty">No dated racing results or completed events for a ${activeView==='months'?'monthly':'yearly'} report yet.</div>`;
  host.innerHTML=`<div class="v7Journey otgReports8113"><div class="v7JourneyHead"><button type="button" onclick="rhOpenJourneyV7003()">‹ BACK TO JOURNEY</button><h1>RACING REPORTS</h1><p>My OTG! Journey • Your hardest opponent is you</p></div>${tabs}<section class="otgReportsIntro8113">${escape(intro)}</section>${main}<footer>ⓘ All periods are calculated from this Space's existing saved timestamps. Driving time is recorded race time, not actual playtime. Finished events are not AI race wins. Untimestamped legacy results cannot be dated. No racing data is changed.</footer></div>`;
  host.querySelectorAll('[data-report-view]').forEach(b=>b.addEventListener('click',()=>{activeView=b.dataset.reportView;draw()}));
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
 window.otgRacingReportsTestV8113={build,makeRows,buildPeriods};
})();
