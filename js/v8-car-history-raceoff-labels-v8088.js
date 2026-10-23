/* OTG! v8.0.88 — Race Off variant-safe labels + Car History championship career.
   Main-only presentation/derived-data patch. No rh-guide changes. */
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const same=(a,b)=>String(a??'')===String(b??'');
const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
const space=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
const liveCar=id=>{const s=space();return (s?.cars||[]).find(c=>same(c?.id,id))||null};
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):'—';
const date=v=>{try{return v?new Date(v).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}).toUpperCase():'—'}catch(_){return'—'}};
const ordinal=n=>{n=Number(n)||0;const v=n%100;if(v>=11&&v<=13)return `${n}th`;return `${n}${n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}`};

/* ---------- Race Off: resolve frozen snapshots back to their catalogue identity ---------- */
function catalogueCandidates(id){
 const s=space();if(!s||s.catalogueKey!=='fh5-catalogue-v1'||typeof FH5_CATALOGUE==='undefined'||typeof fh5CarId!=='function')return [];
 const keys=new Set();const sid=String(id||'');if(sid)keys.add(sid);
 for(const [key,value] of Object.entries(s.catalogueOwned||{}))if(same(value,sid))keys.add(String(key));
 const out=[];for(const c of FH5_CATALOGUE){let k='';try{k=String(fh5CarId(c)||'')}catch(_){continue}if(keys.has(k))out.push(c)}return out;
}
function catalogueForSnapshot(c){
 const id=String(c?.sourceCarId||c?.id||'');const rows=catalogueCandidates(id);if(!rows.length)return null;if(rows.length===1)return rows[0];
 const cls=String(c?.classType||'').trim().toLowerCase();if(cls){const x=rows.find(r=>String(r?.classType||'').trim().toLowerCase()===cls);if(x)return x}
 const text=String(c?.name||'').toLowerCase();if(/forza edition|\bfe\b/.test(text)){const x=rows.find(r=>/forza edition/i.test(String(r?.model||r?.full||'')));if(x)return x}
 return rows[0];
}
function cleanVariantLabel(full,year){
 let text=String(full||'').trim(),tag='';
 const variants=[[/\s+Forza Edition\b/i,'FORZA EDITION'],[/\s+['‘’]?Welcome Pack['‘’]?\b/i,'WELCOME PACK'],[/\s+Anniversary Edition\b/i,'ANNIVERSARY EDITION']];
 for(const [rx,label] of variants){if(rx.test(text)){text=text.replace(rx,'').trim();tag=label;break}}
 const y=String(year||'').trim();const base=[text,y].filter(Boolean).join(' ');return tag?`${base} • ${tag}`:base;
}
function raceOffLabel(c){
 if(!c)return 'Unknown car';const id=String(c.sourceCarId||c.id||'');const cat=catalogueForSnapshot(c);if(cat)return cleanVariantLabel(cat.full||[cat.make,cat.model].filter(Boolean).join(' '),cat.year);
 const live=liveCar(id);if(live){const raw=[live.make,live.model,live.year].filter(Boolean).join(' ').replace(/\s+/g,' ').trim();if(/Forza Edition/i.test(raw))return cleanVariantLabel(raw.replace(/\s+\d{4}$/,''),live.year);return raw}
 const raw=String(c.name||[c.make,c.model,c.year].filter(Boolean).join(' ')||'Unknown car').replace(/\s+/g,' ').trim();return raw;
}
function repairSnapshot(c){if(!c||typeof c!=='object')return false;const next=raceOffLabel(c);if(!next||next===c.name)return false;c.name=next;return true}
function repairRaceOff(ro){
 if(!ro)return false;let changed=false;const hit=c=>{if(repairSnapshot(c))changed=true};
 (ro.entrants||[]).forEach(hit);hit(ro.champion);
 for(const rd of (ro.rounds||[])){
  (rd.entrants||[]).forEach(hit);(rd.straightThrough||[]).forEach(hit);
  for(const m of (rd.matches||[])){hit(m.carA);hit(m.carB);hit(m.resultA?.car);hit(m.resultB?.car);for(const a of (m.attempts||[]))hit(a?.car)}
 }
 return changed;
}
function repairAllRaceOffs(){const s=space();for(const ro of (s?.raceOffs||[]))repairRaceOff(ro)}
window.rhV8088RaceOffLabel=raceOffLabel;
window.rhV8088RepairRaceOff=repairRaceOff;

/* Repair before every relevant Race Off screen; old saved brackets benefit without a destructive migration. */
const roFns=['rhRenderRaceOff','rhRenderRaceOffLocked','rhRaceOffOpenRoundSetup','rhRaceOffRenderDrawReview','rhRaceOffRenderDrawComplete','rhRaceOffStartRound','rhRaceOffEnterNext','rhRaceOffCarTransition','rhRaceOffRenderRoundProgress','rhRaceOffRenderChampion','rhRaceOffRenderHistory'];
for(const name of roFns){const base=window[name];if(typeof base!=='function')continue;window[name]=function(){repairAllRaceOffs();return base.apply(this,arguments)}}
const baseLock=window.rhRaceOffLockDraft;
if(typeof baseLock==='function')window.rhRaceOffLockDraft=function(){const out=baseLock.apply(this,arguments);repairAllRaceOffs();return out};
repairAllRaceOffs();

/* ---------- Car History: dynamic championship career ---------- */
function carText(id){const c=liveCar(id);if(!c)return 'Unknown car';try{return typeof carName==='function'?carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ')}catch(_){return c.name||c.model||'Unknown car'}}
function runType(run){
 if(run?.pickMyDrive)return 'PICK MY DRIVE';const t=String(run?.type||run?.championshipType||'festival').toLowerCase();
 if(t==='make')return 'MANUFACTURER';if(t==='era')return 'ERA';if(t==='favourite')return 'FAVOURITE';if(t==='classtype'||t==='class')return 'CLASS';if(t==='fh5-rally')return 'RALLY ADVENTURE';if(t==='fh5-hotwheels')return 'HOT WHEELS';if(t==='fh5-drag')return 'DRAG';return 'FESTIVAL';
}
function formatLabel(run){if(run?.format==='groups-total-time'||run?.v8Groups)return 'GROUPS';if(run?.format==='swiss'||run?.v8Swiss)return 'SWISS';return 'STANDARD'}
function evilSlot(run){const n=Number(run?.evilCampaign8076?.slot);return n?`EVIL SLOT ${String(n).padStart(3,'0')}`:''}
function resultFor(run,carId,roundId){return (run?.results||[]).find(r=>same(r.carId,carId)&&same(r.roundId,roundId))||null}
function standardBoard(run){
 const rounds=run?.rounds||[],n=rounds.length;if(!n)return [];
 return (run.entries||[]).map((id,index)=>{const rr=rounds.map(rd=>resultFor(run,id,rd.id)).filter(Boolean);return rr.length===n&&rr.every(x=>finite(x.time))?{id:String(id),index,total:rr.reduce((a,x)=>a+Number(x.time),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total||a.index-b.index);
}
function bestRoundFinish(run,carId){
 let best=null;for(const rd of (run.rounds||[])){const rows=(run.entries||[]).map((id,index)=>{const r=resultFor(run,id,rd.id);return r&&finite(r.time)?{id:String(id),time:Number(r.time),index}:null}).filter(Boolean).sort((a,b)=>a.time-b.time||a.index-b.index);const i=rows.findIndex(x=>same(x.id,carId));if(i>=0&&(best==null||i+1<best))best=i+1}return best;
}
function standardCareer(run,carId){
 const field=(run.entries||[]).length,rounds=(run.rounds||[]).length,done=(run.results||[]).filter(r=>same(r.carId,carId)&&finite(r.time)).length,board=standardBoard(run),idx=board.findIndex(x=>same(x.id,carId)),row=idx>=0?board[idx]:null;
 return {kind:'standard',status:String(run.status||''),position:idx>=0?idx+1:null,field,rounds,done,total:row?.total||0,bestRound:bestRoundFinish(run,carId),resultText:run.status==='complete'&&idx>=0?`${ordinal(idx+1)} / ${field}`:run.status==='abandoned'?'ABANDONED':'IN PROGRESS'};
}
function groupsCareer(run,carId){
 const groups=run?.v8Groups?.completedGroups||[],final=[...groups].reverse().find(g=>g?.final),field=(run.entries||[]).length;
 if(final){const st=final.standings||[],i=st.findIndex(x=>same(x.id,carId));if(i>=0)return {kind:'groups',status:run.status,position:i+1,field,rounds:(final.rounds||run.rounds||[]).length,done:(final.rounds||run.rounds||[]).length,total:Number(st[i]?.total)||0,bestRound:null,resultText:`FINAL • ${ordinal(i+1)} / ${st.length}`}}
 const last=[...groups].reverse().find(g=>(g.carIds||[]).some(id=>same(id,carId)));if(last){const st=last.standings||[],i=st.findIndex(x=>same(x.id,carId));return {kind:'groups',status:run.status,position:null,field,rounds:(last.rounds||[]).length,done:(last.rounds||[]).length,total:Number(st[i]?.total)||0,bestRound:null,resultText:`STAGE ${last.stage||'?'} • GROUP ${last.index||'?'} • ${i>=0?ordinal(i+1):'COMPLETE'}`}}
 return {kind:'groups',status:run.status,position:null,field,rounds:0,done:0,total:0,bestRound:null,resultText:run.status==='complete'?'COMPLETED':'IN PROGRESS'};
}
function swissCareer(run,carId){
 const ko=run?.v8Swiss?.ko?.rounds||[],field=(run.entries||[]).length,champ=String(run?.v8Swiss?.championId||run?.winnerCarId||'');if(same(champ,carId))return {kind:'swiss',status:run.status,position:1,field,rounds:ko.length,done:ko.length,total:Number(run?.v8Swiss?.championTotal||run?.winningTime)||0,bestRound:null,resultText:'1st / CHAMPION'};
 for(let x=ko.length-1;x>=0;x--){const rd=ko[x],m=(rd.matches||[]).find(m=>same(m.carA,carId)||same(m.carB,carId));if(!m)continue;const loser=m.winnerId&&!same(m.winnerId,carId);if(loser){const label=String(rd.label||'KNOCKOUT').toUpperCase();const pos=/FINAL/.test(label)?2:null;return {kind:'swiss',status:run.status,position:pos,field,rounds:ko.length,done:x+1,total:0,bestRound:null,resultText:pos?'2nd / FINALIST':label.replace(/S$/,'')}}}
 return {kind:'swiss',status:run.status,position:null,field,rounds:(run.v8Swiss?.swissRounds||[]).length,done:0,total:0,bestRound:null,resultText:run.status==='complete'?'SWISS COMPLETE':'IN PROGRESS'};
}
function careerRow(run,carId){
 const base=(run?.format==='groups-total-time'||run?.v8Groups)?groupsCareer(run,carId):(run?.format==='swiss'||run?.v8Swiss)?swissCareer(run,carId):standardCareer(run,carId);
 return {...base,id:String(run.id||''),name:String(run.name||'Championship'),type:runType(run),format:formatLabel(run),evil:evilSlot(run),date:run.completedAt||run.updatedAt||run.startedAt||run.createdAt||'',complete:run.status==='complete'};
}
function championshipCareer(carId){
 const s=space(),runs=(s?.runs||[]).filter(r=>(r.entries||[]).some(id=>same(id,carId)));return runs.map(r=>careerRow(r,carId)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
}
window.rhV8088ChampionshipCareer=championshipCareer;
function careerStats(rows){const completed=rows.filter(r=>r.complete),numeric=completed.filter(r=>Number(r.position)>0),wins=numeric.filter(r=>r.position===1).length,podiums=numeric.filter(r=>r.position<=3).length,best=numeric.length?Math.min(...numeric.map(r=>r.position)):null;return{entered:rows.length,completed:completed.length,wins,podiums,best}}
function careerMeta(r){const bits=[r.type,r.format];if(r.evil)bits.push(r.evil);if(r.complete)bits.push(date(r.date));return bits.filter(Boolean).join(' • ')}
function careerSub(r){
 if(r.kind==='standard'){const bits=[`${r.rounds} ROUND${r.rounds===1?'':'S'}`];if(r.bestRound)bits.push(`BEST ROUND ${ordinal(r.bestRound)}`);if(r.total)bits.push(fmt(r.total));return bits.join(' • ')}
 if(r.total)return `${r.resultText} • ${fmt(r.total)}`;return r.resultText;
}
function careerHtml(rows){
 const stats=careerStats(rows);return `<section class="v7HistoryCard v8088Career"><h2>🏁 <span>CHAMPIONSHIP CAREER</span></h2><div class="v8088CareerStats"><div><b>${stats.entered}</b><small>ENTERED</small></div><div><b>${stats.completed}</b><small>COMPLETE</small></div><div><b>${stats.wins}</b><small>WINS</small></div><div><b>${stats.podiums}</b><small>PODIUMS</small></div></div>${stats.best?`<div class="v8088CareerBest"><small>BEST CHAMPIONSHIP FINISH</small><b>${ordinal(stats.best)}</b></div>`:''}${rows.length?rows.map(r=>`<div class="v8088CareerRow ${r.position===1?'winner':''} ${!r.complete?'active':''}"><span><small>${E(careerMeta(r))}</small><b>${E(r.name)}</b><em>${E(careerSub(r))}</em></span><strong>${E(r.resultText)}</strong></div>`).join(''):'<div class="v7None">No championships entered yet.</div>'}</section>`;
}
window.rhOpenCarHistoryV7001=function(carId){
 const c=liveCar(carId);if(!c)return typeof toast==='function'?toast('Car history unavailable'):null;const base=window.rhV7RecordsFoundation||{},rows=typeof base.allRows==='function'?base.allRows().filter(r=>same(r.carId,carId)):[],hs=typeof base.honours==='function'?base.honours(carId):[],ps=typeof base.pbs==='function'?base.pbs(carId):[],career=championshipCareer(carId);
 Q('rhCarHistoryV7001')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhCarHistoryV7001" class="v7CarHistory"><div class="v7CarHistoryPage"><header><button onclick="document.getElementById('rhCarHistoryV7001').remove()">BACK</button><div><small>${E(carText(carId))}</small><h1>CAR HISTORY</h1></div></header><section class="v7Races"><span>🏁</span><b>${rows.length}</b><small>RACES ENTERED</small></section>${careerHtml(career)}<section class="v7HistoryCard"><h2>🏆 <span>HONOURS</span></h2>${hs.length?hs.map(h=>`<div class="v7Honour"><i>${h.icon}</i><span><b>${E(h.title)}</b><small>${E(h.sub)}</small></span><strong>${E(date(h.date))}</strong></div>`).join(''):'<div class="v7None">No honours yet.</div>'}</section><section class="v7HistoryCard"><h2>⏱ <span>PERSONAL BESTS</span></h2>${ps.length?ps.map(r=>`<div class="v7PB"><span><b>${E(r.track)}</b><small>${r.layout?E(r.layout):''}</small></span><strong>${fmt(r.time)} ${r.isTrackRecord?'<em>★</em>':''}</strong></div>`).join(''):'<div class="v7None">No personal bests yet.</div>'}</section></div></div>`);window.scrollTo(0,0);
};
})();
