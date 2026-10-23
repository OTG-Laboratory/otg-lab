/* OTG! v8.0.137 — factual post-race highlights on EXISTING result screens.
 * Read-only: no new view, result field, score, level, save call or navigation change.
 * Always recalculate from the currently selected Space; never modify a stored result.
 */
(()=>{
 'use strict';
 const q=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const norm=v=>String(v??'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
 const same=(a,b)=>String(a)===String(b);
 const stamp=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:null;};
 const valid=v=>Number.isFinite(Number(v))&&Number(v)>0;
 const fmt=v=>typeof window.rhFmtTime==='function'?window.rhFmtTime(v):`${String(Math.floor(v/60)).padStart(2,'0')}:${String(Math.floor(v%60)).padStart(2,'0')}.${String(Math.round((v%1)*1000)).padStart(3,'0')}`;
 const space=()=>{try{return window.rhSpace?.()||null}catch(_){return null}};
 const trackKey=x=>`${norm(x.track)}\u0001${norm(x.layout)}`;
 const threshold=n=>[3,5,10,25,50,100,250,500,1000,2500,5000,10000].includes(n);
 const ordinal=n=>`${n}${n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}`;
 function rows(s){
  const out=[],seen=new Set();
  function add(r,src,kind,track,layout,car){
   if(!r||!valid(r.time)||r.advancedTiming)return;
   const id=r.id==null?'':String(r.id),key=id?`${kind}|${id}`:`${kind}|${src?.id}|${r.carId}|${r.date}|${r.time}`;
   if(seen.has(key))return;seen.add(key);
   out.push({id,kind,ownerId:String(src?.id??''),carId:String(r.carId??car??r.car?.sourceCarId??r.car?.id??''),track:String(r.track||r.roundName||track||'').trim(),layout:String(r.layout||layout||'').trim(),time:Number(r.time),position:Number(r.position)||null,date:stamp(r.date||r.recordedAt||r.savedAt),raw:r});
  }
  for(const run of s.runs||[]){const rounds=new Map((run.rounds||[]).map(x=>[String(x.id),x]));for(const r of run.results||[]){const rd=rounds.get(String(r.roundId));add(r,run,'festival',rd?.name,rd?.layout)}}
  for(const event of s.customEvents||[]){const rr=event.frozenRounds?.length?event.frozenRounds:event.rounds||[],rounds=new Map(rr.map(x=>[String(x.id),x]));for(const r of event.results||[]){const rd=rounds.get(String(r.roundId));add(r,event,'event',rd?.name,rd?.layout)}}
  for(const ro of s.raceOffs||[])for(const rd of ro.rounds||[])for(const m of rd.matches||[]){add(m.resultA,ro,'raceoff',rd.name,rd.layout,m.carA?.sourceCarId||m.carA?.id);add(m.resultB,ro,'raceoff',rd.name,rd.layout,m.carB?.sourceCarId||m.carB?.id)}
  return out;
 }
 function highlights(s,target){
  const all=rows(s),mine=all.find(x=>x.raw===target.raw&&x.kind===target.kind&&x.ownerId===target.ownerId);
  if(!mine||!mine.carId)return [];
  // Evil uses car-versus-car time classifications. AI finishing positions are not honours.
  // Competition honours are presented only on the completed event screen.
  if(((mine.kind==='festival'&&(s.runs||[]).some(r=>String(r.id)===mine.ownerId&&(r.evilCampaignR1||r.evilCampaign8076)))||(mine.kind==='raceoff'&&(s.raceOffs||[]).some(r=>String(r.id)===mine.ownerId&&(r.evilCampaignR1||r.evilCampaign8076)))))return [];
  // Do not compare results recorded after this one. Dates can be absent in legacy
  // imports, so current-save comparisons exclude the current object by identity.
  const earlier=all.filter(x=>x!==mine&&(mine.date==null||x.date==null||x.date<=mine.date));
  const car=earlier.filter(x=>same(x.carId,mine.carId)),out=[];
  if(mine.track){
   const track=car.filter(x=>x.track&&trackKey(x)===trackKey(mine));
   if(track.length){const best=Math.min(...track.map(x=>x.time));if(mine.time<best-0.0005)out.push({icon:'↗',label:'NEW CAR / TRACK PERSONAL BEST',detail:`${esc(fmt(best-mine.time))} faster than your previous ${esc(fmt(best))}`});}
  }
  // Race finish is the position actually entered, not a championship medal.
  if(mine.position===1){const victories=car.filter(x=>x.position===1).length+1;if(victories===1||[5,10,25,50,100].includes(victories))out.push({icon:'🏁',label:victories===1?'FIRST RECORDED RACE WIN':`${ordinal(victories).toUpperCase()} RECORDED RACE WIN`,detail:'For this car • based on entered finishing positions'});}
  if(mine.position>=1&&mine.position<=3){const podiums=car.filter(x=>x.position>=1&&x.position<=3).length+1;if([3,10,25,50,100].includes(podiums))out.push({icon:'🏆',label:`${ordinal(podiums).toUpperCase()} RECORDED PODIUM`,detail:'For this car • individual race finishes'});}
  const careerForCar=car.length+1;if([10,25,50,100,250,500].includes(careerForCar))out.push({icon:'🚗',label:`${careerForCar} RACES RECORDED`,detail:'Career milestone for this car'});
  const careerTotal=earlier.length+1;if([25,100,250,500,1000,2500,5000].includes(careerTotal))out.push({icon:'★',label:`${careerTotal} RACES IN THIS SPACE`,detail:'Racing career milestone'});
  return out.slice(0,3);
 }
 function snapshot(kind,ownerId){
  const s=space();if(!s)return null;
  const owner=(kind==='festival'?s.runs:kind==='event'?s.customEvents:s.raceOffs||[])?.find(x=>same(x.id,ownerId));if(!owner)return null;
  if(kind==='raceoff'){
   const list=[];for(const rd of owner.rounds||[])for(const m of rd.matches||[])for(const x of [m.resultA,m.resultB])if(x)list.push(x);
   return {spaceId:String(s.id),owner,ids:new Set(list.map(x=>String(x.id)))};
  }
  return {spaceId:String(s.id),owner,ids:new Set((owner.results||[]).map(x=>String(x.id)))};
 }
 function newResult(kind,owner,before){
  const s=space();if(!s||!before||String(s.id)!==before.spaceId)return null;
  let added=[];
  if(kind==='raceoff'){for(const rd of owner.rounds||[])for(const m of rd.matches||[])for(const x of [m.resultA,m.resultB])if(x&&!before.ids.has(String(x.id)))added.push(x)}
  else added=(owner.results||[]).filter(x=>!before.ids.has(String(x.id)));
  const raw=added.at(-1);if(!raw)return null;
  return {kind,ownerId:String(owner.id),raw};
 }
 let pending=null,scheduled=false;
 function activeScreen(id){const h=q(id);return h&&!h.classList.contains('hidden')?h:null}
 function locate(kind){
  const root=kind==='event'?activeScreen('event'):kind==='raceoff'?activeScreen('raceoff'):activeScreen('festival');
  if(!root)return null;
  // Never paint entry forms or main championship listings: only already existing
  // result/record/transition containers. Record pages can be full-screen overlays.
  if(kind==='raceoff'){
   const overlay=q('rhRaceOffRecordV6155');if(overlay)return {host:overlay.querySelector('.rhRecord127Main'),reference:overlay.querySelector('.rhRecord127Main .rhRecord127Stat'),record:true};
   const transition=q('rhRaceOffTransitionV6119');if(transition)return {host:transition.querySelector('.rhModal'),reference:transition.querySelector('button'),record:false};
   const progress=root.querySelector('.rhRaceOffDrawCompleteHeadV6118');if(progress)return {host:progress,reference:null,record:false};
   return null;
  }
  const group=root.querySelector('.v8TrackResult');if(group)return {host:group,reference:group.querySelector('.v8MiniBoard')||group.querySelector('button'),record:false};
  const podium=root.querySelector('.rhPodiumBodyV5804');if(podium)return {host:podium,reference:podium.querySelector('.rhPodiumClassificationV5804')||podium.querySelector('button'),record:false};
  const approved=root.querySelector('.rhRecord127Main');if(approved)return {host:approved,reference:approved.querySelector('.rhRecord127Stat'),record:true};
  const clipboard=root.querySelector('.rhClipboard');if(clipboard&&/RESULT SAVED/i.test(clipboard.textContent||''))return {host:clipboard,reference:clipboard.querySelector('button'),record:false};
  return null;
 }
 function paint(){
  if(!pending)return;
  const s=space();if(!s||String(s.id)!==pending.spaceId){pending=null;return;}
  const p=pending,where=locate(p.target.kind);if(!where?.host)return;
  const els=p.items.filter(x=>!(where.record&&x.label==='NEW CAR / TRACK PERSONAL BEST'));
  if(!els.length)return;
  if(where.host.querySelector(`[data-otg-result-highlights="${CSS.escape(p.resultId)}"]`))return;
  // If the previous result card is still present, do not append another result's
  // highlights to it; normal result navigation replaces the entire card.
  const old=where.host.querySelector('.otgAfterRace8135');if(old)old.remove();
  const node=document.createElement('section');node.className='otgAfterRace8135';node.dataset.otgResultHighlights=p.resultId;
  node.setAttribute('aria-label','Race highlights');
  node.innerHTML=`<h3>RACE HIGHLIGHTS</h3>${els.map(x=>`<div class="otgAfterRaceItem8135"><span aria-hidden="true">${x.icon}</span><div><b>${esc(x.label)}</b><small>${x.detail}</small></div></div>`).join('')}`;
  if(where.reference?.parentNode===where.host)where.host.insertBefore(node,where.reference);else where.host.appendChild(node);
 }
 function schedule(){if(scheduled||!pending)return;scheduled=true;queueMicrotask(()=>{scheduled=false;try{paint()}catch(err){console.warn('OTG! after-race highlight UI unavailable',err)}})}
 function recordNew(kind,id,prior){
  const found=newResult(kind,prior?.owner,prior);if(!found)return;
  const s=space();if(!s)return;
  const items=highlights(s,found);
  // Routine races should not acquire extra UI just to say the result was saved.
  pending=items.length?{target:found,items,spaceId:String(s.id),resultId:String(found.raw.id)}:null;
  if(pending){schedule();setTimeout(()=>{if(pending?.resultId===String(found.raw.id))pending=null},12000)}
 }
 function wrap(name,kind){const base=window[name];if(typeof base!=='function')return;window[name]=function(id){const before=snapshot(kind,id),result=base.apply(this,arguments);recordNew(kind,id,before);return result};}
 for(const name of ['rhSaveResultFinal','rhSaveResult'])wrap(name,'festival');
 for(const name of ['rhSaveEventResultV5801','rhSaveCustomGroupResult8027','rhSaveCustomKOResult8037','rhSaveCustomSwissResult8045'])wrap(name,'event');
 wrap('rhRaceOffSaveMatchResult','raceoff');
 // The live draw, approved record page and 750ms result-summary transition all
 // replace DOM later. Decorating after those renders avoids altering save logic.
 for(const id of ['festival','event','raceoff']){const host=q(id);if(host)new MutationObserver(schedule).observe(host,{childList:true,subtree:true})}
 new MutationObserver(schedule).observe(document.body,{childList:true});
 window.otgAfterRaceQA8135={rows,highlights,version:'8.0.135'};
})();
