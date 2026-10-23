/* OTG! v8.0.103 — R1 active-race averages and Run Order viewport access. */
(()=>{
 'use strict';
 let activeRunId=null, scheduled=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const getRuns=()=>{try{return window.rhCurrentRuns?.()||[]}catch(_){return[]}};
 const getRun=id=>getRuns().find(x=>String(x.id)===String(id)&&x.evilCampaignR1);
 const fmt=n=>typeof window.rhFmtTime==='function'?window.rhFmtTime(Number(n)):String(Number(n).toFixed(3));
 const norm=n=>String(n??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim().replace(/\s+/g,' ').toLowerCase();
 function compare(track,res){
  const name=norm(track);if(!name)return null;
  const current=getRun(activeRunId);
  const values=(current?.results||[]).filter(x=>
   String(x.id)!==String(res?.id)&&!x.advancedTiming&&norm(x.roundName||x.track)===name&&Number.isFinite(Number(x.time))&&Number(x.time)>0);
  if(!values.length)return null;
  const mean=values.reduce((t,x)=>t+Number(x.time),0)/values.length;
  const time=Number(res?.time);
  return {avg:mean,count:values.length,diff:Number.isFinite(time)&&time>0?time-mean:null};
 }
 function tile(track,res){
  const a=compare(track,res),v=a?.diff;
  const d=v==null?'':`<strong class="${v<0?'faster':v>0?'slower':'equal'}">${v<0?'−':v>0?'+':'±'}${esc(fmt(Math.abs(v)))} • ${v<0?'FASTER':v>0?'SLOWER':'EQUAL'}</strong>`;
  return `<section class="rhAverageTime8103" data-track="${esc(track)}"><div><small>AVERAGE TIME</small><b>${a?esc(fmt(a.avg)):'—'}</b><span>${a?`${a.count} previous result${a.count===1?'':'s'} in this event`:'No previous results on this track'}</span></div>${d}</section>`;
 }
 function place(parent,before,track,result){
  if(!parent||!track)return;
  const prev=parent.querySelector(':scope > .rhAverageTime8103');
  if(prev?.dataset.track===String(track)&&prev?.dataset.result===String(result?.id||''))return;
  if(prev)prev.remove();
  const holder=document.createElement('div');holder.innerHTML=tile(track,result);
  const node=holder.firstElementChild;if(!node)return;
  node.dataset.result=String(result?.id||'');
  if(before?.parentNode===parent)parent.insertBefore(node,before);else parent.prepend(node);
 }
 function currentTrack(r){
  const grp=r?.v8Groups?.activeGroup;
  if(grp){const rr=(r.results||[]).filter(x=>String(x.v8GroupId||x.groupId||'')===String(grp.id));
   for(const cid of grp.carIds||[])for(const rd of r.rounds||[])if(!rr.some(x=>String(x.carId)===String(cid)&&String(x.roundId)===String(rd.id)))return rd.name;
  }
  const next=typeof window.rhNextSlot==='function'?window.rhNextSlot(r):null;
  return next?.round?.name||null;
 }
 function paint(){
  const root=document.getElementById('festival');if(!root||root.classList.contains('hidden'))return;
  const r=getRun(activeRunId);if(!r)return;
  const active=root.querySelector('.rhCurrentCarV1');
  if(active&&root.querySelector('.rhOverviewBrandV1')){
   const track=currentTrack(r)||active.querySelector('.rhCurrentCarMetaV1 b')?.textContent;
   place(active,active.querySelector('.rhContinueV1'),track,null);
  }
  const groupResult=root.querySelector('.v8TrackResult');
  if(groupResult){const res=(r.results||[]).at(-1);if(res)place(groupResult,groupResult.querySelector('.v8MiniBoard'),res.roundName,res)}
  const podium=root.querySelector('.rhPodiumBodyV5804');
  if(podium){const res=(r.results||[]).at(-1);if(res){
   const old=podium.querySelector('.rhPodiumAverageV5837');if(old)old.remove();
   place(podium,podium.querySelector('.rhPodiumClassificationV5804'),res.roundName,res);
  }}
  const record=root.querySelector('.rhRecord127Main');
  if(record){const res=(r.results||[]).at(-1);if(res)place(record,record.querySelector('.rhRecord127Stat'),res.roundName,res)}
 }
 function schedule(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;paint()})}
 function wrap(name,before){const base=window[name];if(typeof base!=='function')return;window[name]=function(){if(before)before.apply(this,arguments);const ret=base.apply(this,arguments);schedule();return ret}}
 wrap('rhOpenRun',function(id){activeRunId=getRun(id)?id:null});
 wrap('rhSaveResultFinal',function(id){if(getRun(id))activeRunId=id});
 wrap('rhSaveResult',function(id){if(getRun(id))activeRunId=id});
 wrap('rhResultSummary',function(r){if(r?.evilCampaignR1)activeRunId=r.id});
 wrap('rhV8GroupRecord',function(id){if(getRun(id))activeRunId=id});
 // Result summaries and race panels are constructed by independent legacy and R1 renderers.
 // Re-decorate when their DOM is replaced, without changing results or campaign state.
 const festival=document.getElementById('festival');if(festival)new MutationObserver(schedule).observe(festival,{childList:true,subtree:true});
 window.rhR1AverageQA8103={compare,currentTrack};
})();
