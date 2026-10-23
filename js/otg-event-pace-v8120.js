/* OTG! v8.0.120 — read-only pace targets on Enter Result.
   Festival and multicar groups: Top 3 single-race times for this event + round +
   group only. Race Off / Swiss / knockout: this match's first racer's time.
   Never compare cumulative standings or different routes / rounds.
   No data writes and no overrides of result-save methods.
*/
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const S=()=>{try{return window.rhSpace?.()||null}catch(_){return null}};
const eq=(a,b)=>String(a??'')===String(b??'');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid=x=>x&&!x.advancedTiming&&Number.isFinite(Number(x.time))&&Number(x.time)>0;
function fmt(value){if(!Number.isFinite(Number(value))||Number(value)<=0)return '—';const millis=Math.round(Number(value)*1000),min=Math.floor(millis/60000),sec=Math.floor(millis/1000)%60,ms=millis%1000;return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;}
const carId=c=>String(c?.sourceCarId||c?.id||c||'');
function carLabel(id,inline){if(inline?.name)return String(inline.name);try{const c=(S()?.cars||[]).find(x=>eq(x.id,id))||window.carById?.(id);if(c)return typeof window.carName==='function'?window.carName(c):String(c.name||id)}catch(_){}return String(id||'UNKNOWN CAR');}
function topRows(results,roundId,groupKey,groupId){
  const rows=new Map();
  for(const x of results||[]){
    if(!valid(x)||!x.carId||!eq(x.roundId,roundId))continue;
    if(groupKey&&!eq(x[groupKey],groupId))continue;
    const cid=String(x.carId),prior=rows.get(cid);
    // An amended/re-entered result replaces that car's preceding entry.
    if(!prior||!(Number.isFinite(Date.parse(x.date||''))&&Number.isFinite(Date.parse(prior.date||'')))||Date.parse(x.date)>=Date.parse(prior.date))rows.set(cid,x);
  }
  return [...rows.values()].sort((a,b)=>Number(a.time)-Number(b.time)||String(a.carId).localeCompare(String(b.carId))).slice(0,3).map(x=>({car:carLabel(x.carId),time:Number(x.time)}));
}
function festival(runId,roundId){
  const r=(typeof window.rhCurrentRuns==='function'?rhCurrentRuns():S()?.runs||[]).find(x=>eq(x.id,runId));
  const rd=r?.rounds?.find(x=>eq(x.id,roundId));if(!r||!rd)return null;
  const grp=r.v8Groups?.activeGroup;
  return {host:'festival',track:rd.name,layout:rd.layout||'',kind:'top',rows:topRows(r.results,rd.id,grp?'v8GroupId':null,grp?.id)};
}
function pairing(round){return (round?.matches||[]).find(m=>m&&!m.resultB&&!m.winnerId)||null;}
function matchData(m,track,layout,host){
  if(!m)return null;
  const a=m.resultA,firstCar=m.carA;
  return {host,track:track||'',layout:layout||'',kind:'match',opponent:valid(a)?{car:carLabel(carId(firstCar),firstCar),time:Number(a.time)}:null};
}
function raceoff(id,index){
  const ro=(S()?.raceOffs||[]).find(x=>eq(x.id,id)),rd=ro?.rounds?.[Number(index)||0];
  return rd?matchData(pairing(rd),rd.name,rd.layout||'','raceoff'):null;
}
function eventInfo(id){
  const e=(S()?.customEvents||[]).find(x=>eq(x.id,id));if(!e)return null;
  if(e.competitionFormat==='knockout'&&e.customKO){
    const r=e.customKO.rounds?.[Number(e.customKO.currentRound)||0];
    return matchData(pairing(r),r?.trackName,r?.layout||'','event');
  }
  if(e.competitionFormat==='swiss'&&e.customSwiss){
    const r=e.customSwiss.rounds?.[Number(e.customSwiss.currentRound)||0];
    return matchData(pairing(r),r?.trackName,r?.layout||'','event');
  }
  if(e.competitionFormat==='groups'&&e.customGroups){
    const cg=e.customGroups,g=cg.groups?.[Number(cg.currentGroup)||0],rounds=cg.rounds||e.frozenRounds||e.rounds||[];
    if(!g)return null;
    const done=new Set((e.results||[]).filter(x=>eq(x.v8CustomGroupId,g.id)).map(x=>JSON.stringify([String(x.carId),String(x.roundId)])));
    let rd=null;outer:for(const cid of g.carIds||[])for(const r of rounds){if(!done.has(JSON.stringify([String(cid),String(r.id)]))){rd=r;break outer}}
    return rd?{host:'event',track:rd.name,layout:rd.layout||'',kind:'top',rows:topRows(e.results,rd.id,'v8CustomGroupId',g.id)}:null;
  }
  // Ordinary Custom Racing multi-car Event uses its frozen round identity.
  const next=typeof window.rhEventNextPair==='function'?window.rhEventNextPair(e):null;
  const rd=next?.round;
  return rd?{host:'event',track:rd.name,layout:rd.layout||'',kind:'top',rows:topRows(e.results,rd.id,null,null)}:null;
}
function timeToBeat(info){
  if(info.kind==='match')return `<section class="rh120Pace rh120Pair" aria-label="Current pairing pace"><small>⚔️ CURRENT PAIRING</small>${info.opponent?`<div class="rh120PairRow"><span><b>${esc(info.opponent.car)}</b><em>OPPONENT TO BEAT</em></span><strong>${fmt(info.opponent.time)}</strong></div>`:'<p>FIRST RACER — SET THE PACE!</p>'}</section>`;
  return `<section class="rh120Pace" aria-label="Current race fastest three times"><div class="rh120PaceHead"><small>🏁 CURRENT RACE — TOP 3</small><em>THIS ROUND · THIS COURSE</em></div>${info.rows.length?info.rows.map((r,i)=>`<div class="rh120PaceRow"><span class="rh120Rank">${['🥇','🥈','🥉'][i]}</span><span class="rh120Car">${esc(r.car)}</span><strong>${fmt(r.time)}</strong></div>`).join(''):'<p>SET THE PACE — NO TIMES YET</p>'}</section>`;
}
function trackBest(track,layout){try{return window.rhTrackTargetsV6143?.targets(track,layout,'')?.trackRecord??null}catch(_){return null}}
function paint(info){
  if(!info)return;
  const root=Q(info.host),entry=root?.querySelector('.rh5801Entry');
  if(!entry)return;
  const context=entry.querySelector('.rh5801Context'),controls=entry.querySelector('.rh5801Controls');
  if(!context||!controls)return;
  const old=entry.querySelector('.rhTrackTargetsV6143');if(old)old.remove();
  let actions=context.querySelector('.rh120Actions');
  if(!actions){actions=document.createElement('div');actions.className='rh120Actions';context.append(actions)}
  // Move the existing LOCATION button (with its live track-bound click handler),
  // don't recreate it or change how location clues are resolved.
  let location=context.querySelector('.rhTrackLocationBtn8073');
  // Where the old entry only provided LOCATION on its overview, offer the
  // same FH5 directory clue directly beside the new course-record target.
  if(!location&&S()?.catalogueKey==='fh5-catalogue-v1'&&typeof window.rhOpenTrackLocation8073==='function'){
    const t=window.rhFH5TrackDirectory8087?.meta?.(info.track);
    if(t){location=document.createElement('button');location.type='button';location.className='rhTrackLocationBtn8073 rh120OwnLocation';
      location.innerHTML='<span>⌖</span><b>LOCATION</b>';
      location.onclick=e=>{e.preventDefault();e.stopPropagation();window.rhOpenTrackLocation8073(t.name)};actions.prepend(location)}
  }
  if(location&&location.parentElement!==actions)actions.prepend(location);
  if(!actions.querySelector('.rh120Record')){
    const record=document.createElement('div');record.className='rh120Record';record.innerHTML='<small>🏆 TRACK RECORD</small><strong>—</strong>';actions.append(record);
  }
  actions.querySelector('.rh120Record strong').textContent=fmt(trackBest(info.track,info.layout));
  const oldPace=entry.querySelector('.rh120Pace');if(oldPace)oldPace.remove();
  controls.insertAdjacentHTML('beforebegin',timeToBeat(info));
}
let current=null,scheduled=false,watching=false;
function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;try{paint(current)}catch(e){console.warn('OTG! pace panel:',e)}})}
function wrap(name,get){const base=window[name];if(typeof base!=='function')return;window[name]=function(){const args=Array.from(arguments);const result=base.apply(this,args);try{const info=get(...args);if(info){current=info;paint(info);schedule()}}catch(e){console.warn('OTG! pace context:',e)}return result}}
wrap('rhEnterResult',(runId,carId,roundId)=>festival(runId,roundId));
wrap('rhRaceOffEnterNext',(id,i=0)=>raceoff(id,i));
wrap('rhEventResult',id=>eventInfo(id));
// A late LOCATION decorator can insert its button after the entry renderer.
// Observe only active entry screens; a stable repaint must make no DOM changes.
for(const id of ['festival','raceoff','event']){const root=Q(id);if(!root)continue;new MutationObserver(records=>{if(!current||current.host!==id||root.classList.contains('hidden')||!root.querySelector('.rh5801Entry'))return;if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&((n.matches?.('.rhTrackLocationBtn8073,.rhTrackTargetsV6143'))||n.querySelector?.('.rhTrackLocationBtn8073,.rhTrackTargetsV6143')))))schedule()}).observe(root,{childList:true,subtree:true})}
window.rhEventPaceQA8120={festival,raceoff,eventInfo,topRows,fmt};
})();
