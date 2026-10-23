(function(){
'use strict';
const q=id=>document.getElementById(id);
const safe=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):String(v??'—');
const raceKey=name=>String(name||'').trim().toLocaleLowerCase();
const sourceKey=(kind,source)=>`${kind}:${String(source?.id||source?.name||source?.title||'').trim().toLocaleLowerCase()}`;
const recordIdentity=(kind,source,result,raceName)=>[kind,String(source?.id||source?.name||source?.title||'').trim(),String(raceName||'').trim(),String(result?.carId||''),String(Number(result?.time)||0)].join('¦');
const recordBookIdentity=(kind,source,raceName)=>['book',kind,String(source?.id||source?.name||source?.title||'').trim(),String(raceName||'').trim()].join('¦');
function recordExclusions(){const space=typeof rhSpace==='function'?rhSpace():null;return new Set(Array.isArray(space?.recordExclusions)?space.recordExclusions:[]);}
function recordBookExclusions(){const space=typeof rhSpace==='function'?rhSpace():null;return new Set(Array.isArray(space?.recordBookExclusions)?space.recordBookExclusions:[]);}

function collectRecords(){
  const map=new Map();
  const excluded=recordExclusions();
  const bookExcluded=recordBookExclusions();
  const addSource=(source,kind)=>{
    const sourceName=String(source?.name||source?.title|| (kind==='event'?'Event':'Championship')).trim();
    (source?.results||[]).forEach(result=>{
      const raceName=String(result?.roundName||'').trim();
      const time=Number(result?.time);
      if(!raceName||!Number.isFinite(time)||time<=0)return;
      const recordId=recordIdentity(kind,source,result,raceName);
      const bookId=recordBookIdentity(kind,source,raceName);
      if(excluded.has(recordId)||bookExcluded.has(bookId))return;
      const key=raceKey(raceName);
      if(!map.has(key))map.set(key,{name:raceName,all:[],sources:new Map()});
      const race=map.get(key);
      const entry={time,carId:result.carId,date:result.date||'',sourceName,kind,sourceId:String(source?.id||''),sourceStatus:String(source?.status||''),sourceCompletedAt:String(source?.completedAt||''),recordId,bookId};
      race.all.push(entry);
      const sk=sourceKey(kind,source);
      const previous=race.sources.get(sk);
      if(!previous||time<previous.time)race.sources.set(sk,entry);
    });
  };
  (typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).forEach(run=>addSource(run,'championship'));
  const space=typeof rhSpace==='function'?rhSpace():null;
  (space?.customEvents||[]).forEach(event=>addSource(event,'event'));
  (space?.raceOffs||[]).forEach(ro=>{
    const results=[];
    (ro?.rounds||[]).forEach(rd=>(rd?.matches||[]).forEach(match=>{
      [match?.resultA,match?.resultB].forEach(result=>{
        if(!result||result.advancedTiming)return;
        results.push({...result,roundName:String(result.track||rd?.name||'').trim()});
      });
    }));
    addSource({...ro,results},'raceoff');
  });
  return [...map.values()].filter(r=>r.all.length).sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
}

function carLabel(id){
  const car=typeof carById==='function'?carById(id):null;
  return car&&typeof carName==='function'?carName(car):'Unknown car';
}

function sourceTypeLabel(kind){return kind==='event'?'EVENT RECORD':kind==='raceoff'?'RACE OFF RECORD':'CHAMPIONSHIP RECORD';}
function canOpenClassification(entry){return entry?.kind!=='raceoff'&&!!entry?.sourceId&&entry?.sourceStatus==='complete'}
function openClassification(entry){
  if(!canOpenClassification(entry))return;
  if(entry.kind==='event'){
    if(typeof window.rhShowRecordEventFinalStandingsV6034==='function')window.rhShowRecordEventFinalStandingsV6034(entry.sourceId);
    return;
  }
  if(typeof window.rhShowRecordFinalStandingsV6034==='function')window.rhShowRecordFinalStandingsV6034(entry.sourceId);
}
window.rhDeleteRecordV6154=function(bookId,sourceName,raceName,time){
  bookId=decodeURIComponent(String(bookId||''));sourceName=decodeURIComponent(String(sourceName||''));raceName=decodeURIComponent(String(raceName||''));
  if(!bookId)return;
  const label=`${sourceName||'this competition'} — ${raceName||'record'} — ${fmt(Number(time)||0)}`;
  if(!confirm(`DELETE RECORD?

${label}

This removes this competition's Record Book entry for this track. Original race results, event history, stats and progress are kept.`))return;
  const space=typeof rhSpace==='function'?rhSpace():null;if(!space)return;
  if(!Array.isArray(space.recordBookExclusions))space.recordBookExclusions=[];
  if(!space.recordBookExclusions.includes(bookId))space.recordBookExclusions.push(bookId);
  if(typeof rhSave==='function')rhSave();
  if(typeof toast==='function')toast('Competition record deleted from Record Book');
  rhRenderRecords();
};
function sourceRow(entry,isAllTime,raceName){
  const open=canOpenClassification(entry);
  const action=open?` onclick="rhOpenRecordClassificationV6010('${safe(entry.kind)}','${safe(entry.sourceId)}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click()}"`:'';
  return `<article class="rhRaceRecordRowV5830 ${isAllTime?'allTime':''} ${open?'rhRaceRecordHistoryLinkV6010':''}"${action}>
    <span class="rhRaceRecordMedalV5830">${isAllTime?'★':'◆'}</span>
    <div class="rhRaceRecordTextV5830">
      <small>${isAllTime?'ALL-TIME OTG! RECORD':sourceTypeLabel(entry.kind)}</small>
      <b>${safe(entry.sourceName)}${entry.sourceStatus==='abandoned'?'<span class="rhAbandonedTagV6150">ABANDONED</span>':''}</b>
      <em>${safe(carLabel(entry.carId))}</em>
    </div>
    <strong>${fmt(entry.time)}</strong>
    ${open?'<span class="rhRaceRecordOpenFinalV6010">FINAL ›</span>':''}
    ${!isAllTime?`<button class="rhDeleteRecordV6153" type="button" onclick="event.stopPropagation();rhDeleteRecordV6154('${encodeURIComponent(entry.bookId)}','${encodeURIComponent(entry.sourceName)}','${encodeURIComponent(raceName)}',${Number(entry.time)||0})">DELETE RECORD</button>`:''}
  </article>`;
}
window.rhOpenRecordClassificationV6010=function(kind,id){
  const entry={kind,sourceId:String(id||''),sourceStatus:'complete'};
  openClassification(entry);
};

function raceCard(race){
  const allTime=race.all.slice().sort((a,b)=>a.time-b.time)[0];
  const sourceRows=[...race.sources.values()].sort((a,b)=>a.sourceName.localeCompare(b.sourceName,undefined,{sensitivity:'base'}));
  return `<details class="rhRaceRecordCardV5830">
    <summary>
      <span><b>${safe(race.name)}</b><small>${sourceRows.length} ${sourceRows.length===1?'record':'records'}</small></span>
      <strong>${fmt(allTime.time)}</strong><em>⌄</em>
    </summary>
    <div class="rhRaceRecordOpenV5830">
      ${sourceRow(allTime,true,race.name)}
      <div class="rhRaceRecordHistoryHeadV5830"><span>COMPETITION HISTORY</span><small>Every Championship, Event and Race Off on ${safe(race.name)}. Completed classifications can be reopened where available.</small></div>
      <div class="rhRaceRecordHistoryV5830">${sourceRows.map(e=>sourceRow(e,false,race.name)).join('')}</div>
    </div>
  </details>`;
}

window.rhRenderRecords=function(){
  const target=q('hall'); if(!target)return;
  const hall=window.rhRecordsMode==='hall';
  if(hall){
    const completed=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).filter(r=>r.status==='complete');
    target.innerHTML=`<div class="rhHofV1">${rhRecordsHeader(true)}<main class="rhRecordsBodyV1">${rhHallOfFame(completed)}</main></div>`;
    return;
  }
  const races=collectRecords();
  target.innerHTML=`<div class="rhRecordsV1 rhRecordsV5830">
    ${rhRecordsHeader(false)}
    <main class="rhRecordsBodyV1 rhRecordsBodyV5830">
      <button class="rhHallBannerV1" onclick="rhRecordsMode='hall';rhRenderRecords()"><span>★</span><div><b>HALL OF FAME</b><small>Completed Championships, their winning cars and final times.</small></div><em>VIEW HALL OF FAME ›</em></button>
      <section class="rhRecordsSectionV1 rhRaceBookV5830">
        <div class="rhRaceBookTitleV5830"><div><small>YOUR PERSONAL RECORD BOOK</small><h2>RACE & EVENT RECORDS</h2></div><span>${races.length}</span></div>
        ${races.length?races.map(raceCard).join(''):rhEmpty('NO RECORDS YET','Complete your first race and OTG! will begin building your personal record book.','View Championships',"show('festival')")}
      </section>
      <div class="rhRecordsInfoV1"><i>i</i><p><b>ABOUT RECORDS</b>Records are organised by race or event. Each section shows the fastest time ever recorded there, followed by the best time from every Championship or Event that has raced there.</p></div>
    </main>
  </div>`;
};
})();
