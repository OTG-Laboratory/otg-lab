/* OTG! v6.0.143 — Enter Result targets: TRACK RECORD + YOUR PB.
   Read-only, cross-mode, exact track/layout. Advanced Timing results are excluded. */
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const norm=v=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const key=(track,layout='')=>`${norm(track)}||${norm(layout)}`;
const finiteTime=v=>Number.isFinite(Number(v))&&Number(v)>0;
const eligible=res=>res&&finiteTime(res.time)&&!res.advancedTiming;
const cid=c=>String(c?.sourceCarId||c?.id||c||'');
function fmt(v){
  if(!finiteTime(v))return '—';
  const t=Number(v),m=Math.floor(t/60),s=Math.floor(t%60),ms=Math.round((t-Math.floor(t))*1000);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
}
function add(out,res,track,layout,carId,sourceStatus=''){
  if(!eligible(res)||!norm(track))return;
  out.push({track,layout:layout||'',trackKey:key(track,layout),carId:String(carId??res.carId??''),time:Number(res.time),sourceStatus:String(sourceStatus||'')});
}
function allResults(){
  const out=[],s=typeof rhSpace==='function'?rhSpace():null;
  if(!s)return out;
  for(const run of (s.runs||[])){
    const rounds=Array.isArray(run.rounds)?run.rounds:[];
    for(const res of (run.results||[])){
      const rd=rounds.find(r=>String(r.id)===String(res.roundId));
      add(out,res,rd?.name||res.roundName||'',rd?.layout||res.layout||'',res.carId,run.status);
    }
  }
  for(const e of (s.customEvents||[])){
    const rounds=typeof rhEventRounds==='function'?rhEventRounds(e):(e.frozenRounds?.length?e.frozenRounds:(e.rounds||[]));
    for(const res of (e.results||[])){
      const rd=(rounds||[]).find(r=>String(r.id)===String(res.roundId));
      add(out,res,rd?.name||res.roundName||'',rd?.layout||res.layout||'',res.carId,e.status);
    }
  }
  for(const ro of (s.raceOffs||[])){
    for(const rd of (ro.rounds||[])){
      for(const m of (rd.matches||[])){
        if(m.resultA)add(out,m.resultA,m.resultA.track||rd.name||'',m.resultA.layout||rd.layout||'',m.resultA.carId||cid(m.carA),ro.status);
        if(m.resultB)add(out,m.resultB,m.resultB.track||rd.name||'',m.resultB.layout||rd.layout||'',m.resultB.carId||cid(m.carB),ro.status);
      }
    }
  }
  return out;
}
function targets(track,layout,carId){
  const k=key(track,layout),rows=allResults().filter(x=>x.trackKey===k),car=String(carId??'');
  const trackBest=rows.length?rows.slice().sort((a,b)=>a.time-b.time)[0]:null,trackRecord=trackBest?.time??null;
  const mine=rows.filter(x=>x.carId===car);
  const pbBest=mine.length?mine.slice().sort((a,b)=>a.time-b.time)[0]:null,pb=pbBest?.time??null;
  return {trackRecord,pb,trackAbandoned:trackBest?.sourceStatus==='abandoned',pbAbandoned:pbBest?.sourceStatus==='abandoned'};
}
function card(track,layout,carId){
  const t=targets(track,layout,carId);
  return `<section class="rhTrackTargetsV6143" aria-label="Race targets"><div><small>TRACK RECORD</small><b>${fmt(t.trackRecord)}</b>${t.trackAbandoned?'<em class="rhTrackAbandonedV6150">ABANDONED</em>':''}</div><i></i><div><small>YOUR PB</small><b>${fmt(t.pb)}</b>${t.pbAbandoned?'<em class="rhTrackAbandonedV6150">ABANDONED</em>':''}</div></section>`;
}
function inject(hostId,track,layout,carId){
  const host=Q(hostId),context=host?.querySelector('.rh5801Context');
  if(!context||host.querySelector('.rhTrackTargetsV6143'))return;
  context.insertAdjacentHTML('afterend',card(track,layout,carId));
}
const enter=window.rhEnterResult;
if(typeof enter==='function')window.rhEnterResult=function(runId,carId,roundId){
  const r=typeof rhCurrentRuns==='function'?rhCurrentRuns().find(x=>String(x.id)===String(runId)):null;
  const rd=r?.rounds?.find(x=>String(x.id)===String(roundId));
  const out=enter.apply(this,arguments);inject('festival',rd?.name||'',rd?.layout||'',carId);return out;
};
const eventEnter=window.rhEventResult;
if(typeof eventEnter==='function')window.rhEventResult=function(id){
  const s=typeof rhSpace==='function'?rhSpace():null,e=s?.customEvents?.find(x=>String(x.id)===String(id));
  const next=e&&typeof rhEventNextPair==='function'?rhEventNextPair(e):null;
  const out=eventEnter.apply(this,arguments);
  if(next)inject('event',next.round?.name||'',next.round?.layout||'',next.car?.id||next.car?.sourceCarId||'');
  return out;
};
const raceOffEnter=window.rhRaceOffEnterNext;
if(typeof raceOffEnter==='function')window.rhRaceOffEnterNext=function(id,i=0){
  const s=typeof rhSpace==='function'?rhSpace():null,ro=s?.raceOffs?.find(x=>String(x.id)===String(id)),rd=ro?.rounds?.[Number(i)||0];
  const out=raceOffEnter.apply(this,arguments);
  const ctx=Q('raceoff')?.querySelector('.rh5801Context small')?.textContent||'';
  const match=(rd?.matches||[]).find(m=>m.status!=='complete');
  let carId='';
  if(match){const second=!!match.resultA&&!match.resultB;carId=cid(second?match.carB:match.carA);}
  inject('raceoff',rd?.name||'',rd?.layout||'',carId);return out;
};
window.rhTrackTargetsV6143={targets,allResults};
})();
