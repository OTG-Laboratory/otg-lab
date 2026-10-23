/* OTG! v8.0.142 — read-only Lifetime Career on the EXISTING Stats screen.
 * All Spaces are inspected independently. No state or schema mutations; no
 * game-AI positions, drift points, or cross-game records become career honours.
 */
(()=>{
 'use strict';
 const esc=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const arr=v=>Array.isArray(v)?v:[];
 const id=v=>String(v??'');
 const validTime=r=>r&&!r.advancedTiming&&Number.isFinite(Number(r.time))&&Number(r.time)>0;
 const same=(a,b)=>id(a)===id(b);
 const nonTie=(a,b)=>Math.abs(a-b)>=0.0005;
 const stamp=()=>typeof state!=='undefined'&&Array.isArray(state?.spaces)?state:null;
 const fmtInt=v=>Number(v||0).toLocaleString('en-GB');
 function clock(seconds){
  const total=Math.max(0,Math.round(Number(seconds)||0)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),s=total%60;
  return `${fmtInt(h)}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
 }
 // Festival medals must come from the actual final standings, never the user's
 // optional AI finishing position. Only rank a valid fully completed final.
 function festivalPodium(run){
  if(run?.status!=='complete')return [];
  let board=[];
  if(run.v8Groups){
   const final=arr(run.v8Groups.completedGroups).filter(g=>g?.final).at(-1);
   if(!final)return [];
   board=arr(final.standings).filter(x=>x?.id!=null&&Number.isFinite(Number(x.total))&&Number(x.total)>0)
    .map(x=>({id:id(x.id),time:Number(x.total)}));
  }else{
   const rounds=arr(run.rounds),roundIds=new Set(rounds.map(r=>id(r.id)));
   if(!roundIds.size)return [];
   board=arr(run.entries).map(cid=>{
    const saved=arr(run.results).filter(r=>same(r?.carId,cid)&&roundIds.has(id(r?.roundId))&&validTime(r));
    if(saved.length!==roundIds.size||new Set(saved.map(r=>id(r.roundId))).size!==roundIds.size)return null;
    return {id:id(cid),time:saved.reduce((t,r)=>t+Number(r.time),0)};
   }).filter(Boolean);
  }
  // Unique competitors and unambiguous podium places. A tie for any podium
  // place means no medal inferred for the affected/next place.
  board=board.filter(x=>x.id).sort((a,b)=>a.time-b.time);
  if(board.length<2||new Set(board.map(x=>x.id)).size!==board.length||!nonTie(board[0].time,board[1].time))return [];
  const medals=[board[0].id];
  if(board[2]&&!nonTie(board[1].time,board[2].time))return medals;
  medals.push(board[1].id);
  if(board[2]){
   if(board[3]&&!nonTie(board[2].time,board[3].time))return medals;
   medals.push(board[2].id);
  }
  return medals;
 }
 function raceOffPodium(ro){
  if(ro?.status!=='complete')return [];
  const final=arr(ro.rounds).at(-1),matches=arr(final?.matches);
  if(matches.length!==1||matches[0]?.status!=='complete')return [];
  const match=matches[0],winner=id(ro.championCarId||ro.champion?.sourceCarId||ro.champion?.id),w=id(match.winnerCarId),l=id(match.loserCarId);
  if(!winner||!w||!l||w!==winner||w===l)return [];
  const med={gold:1,silver:1,bronze:0};
  const semi=arr(ro.rounds).at(-2),semis=arr(semi?.matches);
  if(semis.length===2&&semis.every(m=>m?.status==='complete'&&m.loserCarId)){
   const losers=semis.map(m=>id(m.loserCarId));
   if(new Set([winner,l,...losers]).size===4)med.bronze=2;
  }
  return med;
 }
 function inspectSpace(space){
  const s=space||{},finished={festival:0,raceoff:0,custom:0},medals={gold:0,silver:0,bronze:0};
  let races=0,seconds=0;const cars=new Set(),used=new Set(),seenObjects=new WeakSet();
  const add=(r,kind,src,round,fallback)=>{
   if(!validTime(r))return;
   if(typeof r==='object'){if(seenObjects.has(r))return;seenObjects.add(r)}
   const carId=id(r.carId||fallback||r.car?.sourceCarId||r.car?.id);
   // Canonical collections only. This fallback prevents an accidentally repeated
   // official result from inflating totals; separate rounds are distinct.
   const key=`${kind}|${id(src?.id||src?.name)}|${id(round?.id||round?.name)}|${id(r.id||`${carId}|${r.time}|${r.date||r.savedAt||r.createdAt||''}`)}`;
   if(used.has(key))return;used.add(key);
   races++;seconds+=Number(r.time);if(carId)cars.add(carId);
  };
  function eachSource(items,kind){
   const unique=new Set();
   for(const item of arr(items)){
    if(!item||typeof item!=='object')continue;
    const key=id(item.id||'');const identity=key||item;
    if(unique.has(identity))continue;unique.add(identity);
    if(item.status==='complete')finished[kind]++;
    if(kind==='festival'){
     const rd=new Map(arr(item.rounds).map(r=>[id(r.id),r]));
     for(const r of arr(item.results))add(r,kind,item,rd.get(id(r?.roundId))||{id:r?.roundId});
     const podium=festivalPodium(item);
     if(podium[0])medals.gold++;if(podium[1])medals.silver++;if(podium[2])medals.bronze++;
    }else if(kind==='custom'){
     const rr=arr(item.frozenRounds).length?item.frozenRounds:arr(item.rounds);
     const rd=new Map(rr.map(r=>[id(r.id),r]));
     for(const r of arr(item.results))add(r,kind,item,rd.get(id(r?.roundId))||{id:r?.roundId});
     // Custom event formats differ: do NOT guess medals from AI positions.
    }else if(kind==='raceoff'){
     for(const round of arr(item.rounds))for(const match of arr(round.matches)){
      add(match?.resultA,kind,item,round,match?.carA?.sourceCarId||match?.carA?.id);
      add(match?.resultB,kind,item,round,match?.carB?.sourceCarId||match?.carB?.id);
     }
     const podium=raceOffPodium(item);
     if(podium.gold){medals.gold+=podium.gold;medals.silver+=podium.silver;medals.bronze+=podium.bronze}
    }
   }
  }
  eachSource(s.runs,'festival');eachSource(s.raceOffs,'raceoff');eachSource(s.customEvents,'custom');
  return {id:id(s.id),name:id(s.name||'Unnamed Space'),races,seconds,cars:cars.size,finished,medals,competitions:finished.festival+finished.raceoff+finished.custom};
 }
 function lifetime(root){
  const spaces=arr(root?.spaces).map(inspectSpace);
  const all={races:0,seconds:0,cars:0,finished:{festival:0,raceoff:0,custom:0},medals:{gold:0,silver:0,bronze:0},competitions:0};
  for(const s of spaces){
   for(const key of ['races','seconds','cars','competitions'])all[key]+=s[key];
   for(const key of ['festival','raceoff','custom'])all.finished[key]+=s.finished[key];
   for(const key of ['gold','silver','bronze'])all.medals[key]+=s.medals[key];
  }
  return {spaces,all,activeSpaceId:id(root?.activeSpaceId)};
 }
 const num=(label,value)=>`<div class="otgLifetimeStat8142"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;
 function markup(report){
  const a=report.all,sections=report.spaces.map(s=>{
   const active=s.id===report.activeSpaceId;
   return `<details class="otgLifetimeSpace8142" ${active?'open':''}><summary><span><b>${esc(s.name)}</b><small>${active?'CURRENT SPACE · ':''}${fmtInt(s.races)} TIMED RESULT${s.races===1?'':'S'} · ${fmtInt(s.competitions)} FINISHED</small></span><i aria-hidden="true">⌄</i></summary><div class="otgLifetimeSpaceBody8142">${num('Timed results',fmtInt(s.races))}${num('Recorded driving',clock(s.seconds))}${num('Cars raced',fmtInt(s.cars))}${num('Finished competitions',fmtInt(s.competitions))}<p>Festival ${fmtInt(s.finished.festival)} · Race Off ${fmtInt(s.finished.raceoff)} · Custom ${fmtInt(s.finished.custom)}<br>Verified podiums: 🥇 ${fmtInt(s.medals.gold)} · 🥈 ${fmtInt(s.medals.silver)} · 🥉 ${fmtInt(s.medals.bronze)}</p></div></details>`;
  }).join('');
  return `<section id="otgLifetimeCareer8142" class="otgLifetime8142" aria-label="Lifetime career across OTG Spaces"><header><div><small>ONE DRIVER · ALL SPACES</small><h2>LIFETIME CAREER</h2><p>Combined compatible achievements. Every game keeps its own Garage, records and results.</p></div><span>${report.spaces.length} SPACE${report.spaces.length===1?'':'S'}</span></header><div class="otgLifetimeGrid8142">${num('Timed results',fmtInt(a.races))}${num('Recorded driving',clock(a.seconds))}${num('Finished competitions',fmtInt(a.competitions))}${num('Cars raced · per Space',fmtInt(a.cars))}</div><div class="otgLifetimeHonours8142"><h3>🏆 VERIFIED COMPETITION PODIUMS</h3><div><span>🥇 <b>${fmtInt(a.medals.gold)}</b> GOLD</span><span>🥈 <b>${fmtInt(a.medals.silver)}</b> SILVER</span><span>🥉 <b>${fmtInt(a.medals.bronze)}</b> BRONZE</span></div><small>From completed Festival standings and confirmed Race Off finals only. Never from game-AI finishing positions.</small></div><div class="otgLifetimeBreakdown8142"><span>FESTIVAL <b>${fmtInt(a.finished.festival)}</b></span><span>RACE OFF <b>${fmtInt(a.finished.raceoff)}</b></span><span>CUSTOM <b>${fmtInt(a.finished.custom)}</b></span></div><h3 class="otgLifetimeSub8142">YOUR GAME SPACES</h3>${sections||'<div class="otgLifetimeEmpty8142">No Spaces available yet.</div>'}<footer>ⓘ Read-only totals from existing official timed results, including undated saves. Each car is distinct within its own Space; the same car in two games counts twice. Time means summed recorded race times, not hours spent playing. Drift scores, undated-only session assumptions and cross-game lap/PB records are not combined. Incomplete competitions earn no podiums. Custom competitions count as finished, without invented medals.</footer></section>`;
 }
 function decorate(){
  const host=document.getElementById('more');if(!host||host.querySelector('#otgLifetimeCareer8142'))return;
  const target=host.querySelector('.v7StatsCardsStage5,.v7StatsCards');if(!target)return;
  const snapshot=stamp();if(!snapshot)return;
  target.insertAdjacentHTML('afterend',markup(lifetime(snapshot)));
 }
 const originalMore=window.rhRenderMore;
 if(typeof originalMore==='function')window.rhRenderMore=function(...args){const result=originalMore.apply(this,args);try{if(typeof rhMoreMode!=='undefined'&&rhMoreMode==='stats')decorate()}catch(e){console.warn('Lifetime Career display skipped',e)}return result};
 const originalStats=window.rhRenderStats;
 if(typeof originalStats==='function')window.rhRenderStats=function(...args){const result=originalStats.apply(this,args);try{decorate()}catch(e){console.warn('Lifetime Career display skipped',e)}return result};
 window.otgLifetimeCareerQA8142={inspectSpace,lifetime,festivalPodium,raceOffPodium,markup};
})();
