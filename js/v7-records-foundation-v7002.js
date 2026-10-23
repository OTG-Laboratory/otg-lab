/* OTG! v7.0.2 — Records foundation maintenance: restore Main-only Delete Record in Track Records. */
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const norm=v=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const key=(track,layout='')=>`${norm(track)}||${norm(layout)}`;
const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
const cid=c=>String(c?.sourceCarId||c?.id||c||'');
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):'—';
const date=v=>{try{return v?new Date(v).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase():'—'}catch(_){return'—'}};
const recordBookIdentity=(kind,source,raceName)=>['book',kind,String(source?.id||source?.name||source?.title||'').trim(),String(raceName||'').trim()].join('¦');
function recordBookExclusions(){const s=typeof rhSpace==='function'?rhSpace():null;return new Set(Array.isArray(s?.recordBookExclusions)?s.recordBookExclusions:[])}
function car(id){return (typeof rhSpace==='function'?rhSpace()?.cars:[])?.find(c=>String(c.id)===String(id))||null}
function carText(id){const c=car(id);return c?(typeof carName==='function'?carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ')):'Unknown car'}
function typeTag(kind,source){
  if(source?.pickMyDrive)return 'PICK MY DRIVE';
  if(kind==='raceoff')return 'RACE OFF';
  if(kind==='event')return 'CUSTOM';
  const t=String(source?.type||source?.championshipType||'festival').toLowerCase();
  if(t==='make')return 'MANUFACTURER'; if(t==='era')return 'ERA'; if(t==='favourite')return 'FAVOURITE';
  if(t==='classtype'||t==='class')return 'CLASS'; return 'FESTIVAL';
}
function add(out,res,source,kind,round){
  if(!res||res.advancedTiming||!finite(res.time))return;
  const track=String(round?.name||res.track||res.roundName||'').trim(); if(!track)return;
  const layout=String(round?.layout||res.layout||'').trim();
  const bookId=recordBookIdentity(kind,source,track);if(recordBookExclusions().has(bookId))return;
  out.push({track,layout,k:key(track,layout),time:Number(res.time),carId:String(res.carId||''),date:res.date||source?.completedAt||source?.updatedAt||'',kind,tag:typeTag(kind,source),sourceName:String(source?.name||source?.title||'').trim(),sourceStatus:String(source?.status||''),sourceId:String(source?.id||''),bookId});
}
function allRows(){
  const out=[],s=typeof rhSpace==='function'?rhSpace():null;if(!s)return out;
  for(const run of (s.runs||[])){for(const res of (run.results||[])){const rd=(run.rounds||[]).find(r=>String(r.id)===String(res.roundId));add(out,res,run,'championship',rd)}}
  for(const ev of (s.customEvents||[])){const rounds=typeof rhEventRounds==='function'?rhEventRounds(ev):(ev.frozenRounds?.length?ev.frozenRounds:(ev.rounds||[]));for(const res of (ev.results||[])){const rd=(rounds||[]).find(r=>String(r.id)===String(res.roundId));add(out,res,ev,'event',rd)}}
  for(const ro of (s.raceOffs||[])){for(const rd of (ro.rounds||[])){for(const m of (rd.matches||[])){if(m.resultA)add(out,{...m.resultA,carId:m.resultA.carId||cid(m.carA)},ro,'raceoff',rd);if(m.resultB)add(out,{...m.resultB,carId:m.resultB.carId||cid(m.carB)},ro,'raceoff',rd)}}}
  return out;
}
function tracks(){
  const map=new Map();
  for(const r of allRows()){
    const tk=norm(r.track);if(!map.has(tk))map.set(tk,{name:r.track,layouts:new Map()});const t=map.get(tk),lk=norm(r.layout)||'__default__';
    if(!t.layouts.has(lk))t.layouts.set(lk,{name:r.layout||'',rows:[]});t.layouts.get(lk).rows.push(r);
  }
  return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{sensitivity:'base'}));
}
function recordRows(rows){
  const best=rows.slice().sort((a,b)=>a.time-b.time)[0];
  const comp=new Map();for(const r of rows){const k=`${r.kind}|${r.sourceId||r.sourceName}`;const p=comp.get(k);if(!p||r.time<p.time)comp.set(k,r)}
  const history=[...comp.values()].sort((a,b)=>a.time-b.time);
  return `<div class="v7RecordDetail"><div class="v7TrackBest"><span><small>TRACK RECORD</small><b>${E(carText(best.carId))}</b><em>${E(best.tag)}</em></span><strong>${fmt(best.time)}</strong></div><div class="v7CompHistory">${history.map(r=>`<div class="v7CompRecord"><span><small>${E(r.tag)} RECORD</small><b>${E(r.sourceName||r.tag)}</b><em>${E(carText(r.carId))}${r.sourceStatus==='abandoned'?' • ABANDONED':''}</em></span><strong>${fmt(r.time)}</strong><button class="rhDeleteRecordV6153 v7DeleteRecord" type="button" onclick="event.stopPropagation();rhDeleteRecordV6154('${encodeURIComponent(r.bookId)}','${encodeURIComponent(r.sourceName||r.tag)}','${encodeURIComponent(r.track)}',${Number(r.time)||0})">DELETE RECORD</button></div>`).join('')}</div></div>`;
}
function layoutBlock(layout){return `<details class="v7Layout"><summary><span><b>${E(layout.name||'DEFAULT LAYOUT')}</b><small>RECORDED LAYOUT</small></span><strong>${fmt(layout.rows.slice().sort((a,b)=>a.time-b.time)[0]?.time)}</strong><em>⌄</em></summary>${recordRows(layout.rows)}</details>`}
function trackBlock(t){
  const layouts=[...t.layouts.values()];
  if(layouts.length===1)return `<details class="v7Track"><summary><span><b>${E(t.name)}</b><small>1 LAYOUT</small></span><em>›</em></summary>${recordRows(layouts[0].rows)}</details>`;
  return `<details class="v7Track"><summary><span><b>${E(t.name)}</b><small>${layouts.length} LAYOUTS</small></span><em>⌄</em></summary><div class="v7Layouts">${layouts.map(layoutBlock).join('')}</div></details>`;
}
function hallBanner(){return `<button class="v7Hall" onclick="rhRecordsMode='hall';rhRenderRecords()"><span>★</span><div><b>HALL OF FAME</b><small>Completed Championships, their winning cars and final times.</small><em>VIEW HALL OF FAME ›</em></div><i>›</i></button>`}
window.rhRenderRecords=function(){
  const target=Q('hall');if(!target)return;
  if(window.rhRecordsMode==='hall'){
    const completed=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).filter(r=>r.status==='complete');
    target.innerHTML=`<div class="rhHofV1">${typeof rhRecordsHeader==='function'?rhRecordsHeader(true):''}<main class="rhRecordsBodyV1">${typeof rhHallOfFame==='function'?rhHallOfFame(completed):''}</main></div>`;return;
  }
  const ts=tracks();
  target.innerHTML=`<div class="v7Records">${typeof rhRecordsHeader==='function'?rhRecordsHeader(false):''}<main>${hallBanner()}<section class="v7TrackShell"><header><span>🏁</span><div><h2>TRACK RECORDS</h2><p>Tracks and layouts with records you have set.</p></div><b>${ts.length}</b></header>${ts.length?ts.map(trackBlock).join(''):`<div class="v7Empty"><b>NO TRACK RECORDS YET</b><p>Complete your first single-run race and OTG! will start your Track Records.</p></div>`}</section><section class="v7About"><i>i</i><p><b>ABOUT RECORDS</b>Each track shows your fastest time ever recorded there, followed by the best times from every Championship, Custom race or Race Off that has raced there.</p></section></main></div>`;
};
function championshipWinner(run){
  const n=(run.rounds||[]).length;if(!n)return null;return (run.entries||[]).map(id=>{const rs=(run.results||[]).filter(r=>String(r.carId)===String(id)&&!r.advancedTiming&&finite(r.time));return rs.length===n?{id:String(id),total:rs.reduce((a,r)=>a+Number(r.time),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total)[0]||null;
}
function honours(carId){
  const s=typeof rhSpace==='function'?rhSpace():null,out=[];if(!s)return out;
  for(const run of (s.runs||[])){if(run.status!=='complete')continue;const w=championshipWinner(run);if(!w||String(w.id)!==String(carId))continue;const t=typeTag('championship',run);out.push({title:t==='FESTIVAL'?'FESTIVAL CHAMPIONSHIP':`${t} CHAMPIONSHIP`,sub:run.name||run.value||t,date:run.completedAt||run.updatedAt||'',icon:'🏆'});}
  for(const ro of (s.raceOffs||[])){if(ro.status==='complete'&&String(ro.championCarId||ro.champion?.sourceCarId||ro.champion?.id||'')===String(carId))out.push({title:'RACE OFF TOURNAMENT WINNER',sub:ro.name||'Race Off',date:ro.completedAt||'',icon:'🏆'});}
  return out.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
function pbs(carId){
  const rows=allRows().filter(r=>String(r.carId)===String(carId)),map=new Map();for(const r of rows){const p=map.get(r.k);if(!p||r.time<p.time)map.set(r.k,r)}
  const all=allRows();return [...map.values()].sort((a,b)=>a.track.localeCompare(b.track)).map(r=>{const tr=all.filter(x=>x.k===r.k).sort((a,b)=>a.time-b.time)[0];return {...r,isTrackRecord:tr&&tr.time===r.time}});
}
window.rhOpenCarHistoryV7001=function(carId){
  const c=car(carId);if(!c)return typeof toast==='function'?toast('Car history unavailable'):null;const rows=allRows().filter(r=>String(r.carId)===String(carId)),hs=honours(carId),ps=pbs(carId);
  Q('rhCarHistoryV7001')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhCarHistoryV7001" class="v7CarHistory"><div class="v7CarHistoryPage"><header><button onclick="document.getElementById('rhCarHistoryV7001').remove()">BACK</button><div><small>${E(carText(carId))}</small><h1>CAR HISTORY</h1></div></header><section class="v7Races"><span>🏁</span><b>${rows.length}</b><small>RACES ENTERED</small></section><section class="v7HistoryCard"><h2>🏆 <span>HONOURS</span></h2>${hs.length?hs.map(h=>`<div class="v7Honour"><i>${h.icon}</i><span><b>${E(h.title)}</b><small>${E(h.sub)}</small></span><strong>${E(date(h.date))}</strong></div>`).join(''):'<div class="v7None">No honours yet.</div>'}</section><section class="v7HistoryCard"><h2>⏱ <span>PERSONAL BESTS</span></h2>${ps.length?ps.map(r=>`<div class="v7PB"><span><b>${E(r.track)}</b><small>${r.layout?E(r.layout):''}</small></span><strong>${fmt(r.time)} ${r.isTrackRecord?'<em>★</em>':''}</strong></div>`).join(''):'<div class="v7None">No personal bests yet.</div>'}</section></div></div>`);window.scrollTo(0,0);
};
function decorateGarage(){
  document.querySelectorAll('#garage .rhGarageCarV1').forEach(row=>{if(row.querySelector('.v7HistoryBtn'))return;const edit=row.querySelector('button');const id=(edit?.getAttribute('onclick')||'').match(/rhOpenCarEditor\('([^']+)'\)/)?.[1];if(!id)return;edit.insertAdjacentHTML('beforebegin',`<button class="v7HistoryBtn" title="Car History" aria-label="Open Car History" onclick="event.stopPropagation();rhOpenCarHistoryV7001('${E(id)}')">▤</button>`)});
  document.querySelectorAll('#garage .rhCatalogueGarageCar').forEach(row=>{if(row.querySelector('.v7HistoryBtn'))return;const id=row.dataset.catalogueId;if(!id)return;const s=typeof rhSpace==='function'?rhSpace():null;const c=(s?.cars||[]).find(x=>String(x.catalogueId||'')===String(id));if(!c)return;row.insertAdjacentHTML('beforeend',`<button type="button" class="v7HistoryBtn" title="Car History" aria-label="Open Car History" onclick="event.preventDefault();event.stopPropagation();rhOpenCarHistoryV7001('${E(c.id)}')">▤</button>`)});
}
const oldGarage=window.rhRenderGarage;if(typeof oldGarage==='function')window.rhRenderGarage=function(){const out=oldGarage.apply(this,arguments);setTimeout(decorateGarage,0);return out};
const oldCatalogue=window.otgRenderCatalogueGarage;if(typeof oldCatalogue==='function')window.otgRenderCatalogueGarage=function(){const out=oldCatalogue.apply(this,arguments);setTimeout(decorateGarage,0);return out};
const observer=new MutationObserver(()=>{if(Q('garage')&&!Q('garage').classList.contains('hidden'))decorateGarage()});observer.observe(document.body,{childList:true,subtree:true});
window.rhV7RecordsFoundation={allRows,tracks,pbs,honours};
})();
