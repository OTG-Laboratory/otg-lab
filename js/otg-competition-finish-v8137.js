/* OTG! v8.0.137 — factual completion highlights in EXISTING competition results.
 * No saved data modifications, no separate screen and no extra result fields.
 * Group finals use their actual frozen final-group standings (not preliminary totals).
 * Race Off uses the confirmed champion and final match, not AI positions.
 */
(()=>{
 'use strict';
 const q=id=>document.getElementById(id);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const same=(a,b)=>String(a??'')===String(b??'');
 const s=()=>{try{return window.rhSpace?.()}catch(_){return null}};
 const fmt=t=>typeof window.rhFmtTime==='function'?window.rhFmtTime(t):`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}.${String(Math.round((t%1)*1000)).padStart(3,'0')}`;
 const car=id=>(s()?.cars||[]).find(c=>same(c.id,id));
 const carNameFor=id=>{const c=car(id);try{return c?(window.carName?.(c)||c.name||c.model||'Car'):'Car'}catch(_){return c?.name||c?.model||'Car'}};
 const validTime=x=>Number.isFinite(Number(x))&&Number(x)>0;
 const before=(a,b)=>{if(!b?.completedAt||!a?.completedAt)return false;return String(a.completedAt)<String(b.completedAt)};
 function festivalRows(run){
  const g=run?.v8Groups;
  if(g){const last=(g.completedGroups||[]).filter(x=>x.final).at(-1);
    return last?(last.standings||[]).filter(x=>validTime(x.total)).map(x=>({id:String(x.id),time:Number(x.total)})).sort((a,b)=>a.time-b.time):[];
  }
  const rounds=run.rounds||[];if(!rounds.length)return [];
  const ids=new Set(rounds.map(x=>String(x.id)));
  return (run.entries||[]).map(id=>{
   const rr=(run.results||[]).filter(x=>same(x.carId,id)&&ids.has(String(x.roundId))&&validTime(x.time));
   return rr.length===ids.size&&new Set(rr.map(x=>String(x.roundId))).size===ids.size?{id:String(id),time:rr.reduce((acc,x)=>acc+Number(x.time),0)}:null;
  }).filter(Boolean).sort((a,b)=>a.time-b.time);
 }
 function festivalChampion(run){return run?.status==='complete'?festivalRows(run)[0]?.id||null:null}
 function festivalData(run){
  if(!run||run.status!=='complete')return null;
  const board=festivalRows(run);if(!board.length)return null;
  // Never claim a unique winner where two cars are exactly tied on the saved times.
  if(board[1]&&Math.abs(board[1].time-board[0].time)<.0005)return null;
  const winner=board[0], prior=(s()?.runs||[]).filter(x=>x!==run&&x.status==='complete'&&before(x,run)&&same(festivalChampion(x),winner.id)).length;
  const labels=board.slice(0,3).map((x,i)=>({icon:['🥇','🥈','🥉'][i],label:['CHAMPION','RUNNER-UP','THIRD PLACE'][i],detail:carNameFor(x.id)}));
  if(prior===0)labels.push({icon:'🏆',label:'FIRST RECORDED FESTIVAL TITLE',detail:carNameFor(winner.id)});
  else if([2,4,9,24,49,99].includes(prior))labels.push({icon:'🏆',label:`${prior+1} FESTIVAL TITLES`,detail:carNameFor(winner.id)});
  if(board[1]&&board[1].time>winner.time)labels.push({icon:'⏱',label:'WINNING MARGIN',detail:`${fmt(board[1].time-winner.time)} over second place`});
  return {title:'CHAMPIONSHIP HIGHLIGHTS',rows:labels};
 }
 function cid(c){return String(c?.sourceCarId||c?.id||'')}
 function raceOffData(ro){
  if(!ro||ro.status!=='complete')return null;
  const winner=String(ro.championCarId||cid(ro.champion));if(!winner)return null;
  const last=(ro.rounds||[]).at(-1),match=last?.matches?.[0];
  const matches=last?.matches||[];
  if(matches.length!==1||match?.status!=='complete')return null;
  const w=String(match.winnerCarId||''),l=String(match.loserCarId||'');
  if(!same(w,winner)||!l||same(w,l))return null;
  const name=x=>{if(same(cid(match.carA),x))return match.carA?.name||carNameFor(x);if(same(cid(match.carB),x))return match.carB?.name||carNameFor(x);return carNameFor(x)};
  const earlier=(s()?.raceOffs||[]).filter(x=>x!==ro&&x.status==='complete'&&before(x,ro)&&same(x.championCarId||cid(x.champion),winner)).length;
  const rows=[{icon:'🥇',label:'RACE OFF CHAMPION',detail:name(winner)},{icon:'🥈',label:'FINAL RUNNER-UP',detail:name(l)}];
  const semis=(ro.rounds||[]).at(-2)?.matches||[];
  if(semis.length===2&&semis.every(m=>m.status==='complete'&&m.loserCarId)){
   const losers=semis.map(m=>({id:String(m.loserCarId),label:same(cid(m.carA),m.loserCarId)?m.carA?.name:m.carB?.name}));
   if(new Set(losers.map(x=>x.id)).size===2&&losers.every(x=>x.id!==winner&&x.id!==l))rows.push({icon:'🥉',label:'SEMI-FINALISTS',detail:losers.map(x=>x.label||carNameFor(x.id)).join(' • ')});
  }
  if(earlier===0)rows.push({icon:'🏆',label:'FIRST RECORDED RACE OFF TITLE',detail:name(winner)});
  else if([2,4,9,24,49,99].includes(earlier))rows.push({icon:'🏆',label:`${earlier+1} RACE OFF TITLES`,detail:name(winner)});
  const wa=same(cid(match.carA),winner)?match.resultA:match.resultB,lo=same(cid(match.carA),winner)?match.resultB:match.resultA;
  if(validTime(wa?.time)&&validTime(lo?.time)&&Number(lo.time)>Number(wa.time))rows.push({icon:'⏱',label:'FINAL WINNING MARGIN',detail:fmt(Number(lo.time)-Number(wa.time))});
  return {title:'RACE OFF HIGHLIGHTS',rows};
 }
 function reportHtml(data){return `<section class="otgFinish8137" aria-label="${esc(data.title)}"><h3>${esc(data.title)}</h3>${data.rows.map(x=>`<div class="otgFinishRow8137"><span aria-hidden="true">${x.icon}</span><div><b>${esc(x.label)}</b><small>${esc(x.detail)}</small></div></div>`).join('')}</section>`}
 function showGroup(id,groupId){
  const run=(s()?.runs||[]).find(x=>same(x.id,id)),group=run?.v8Groups?.completedGroups?.find(x=>same(x.id,groupId));
  if(!group?.final)return;
  const data=festivalData(run),place=q('festival')?.querySelector('.v8Reveal');if(!data||!place||place.querySelector('.otgFinish8137'))return;
  const target=place.querySelector('button');if(target)target.insertAdjacentHTML('beforebegin',reportHtml(data));else place.insertAdjacentHTML('beforeend',reportHtml(data));
 }
 function showRaceOff(id){
  const ro=(s()?.raceOffs||[]).find(x=>same(x.id,id)),data=raceOffData(ro);
  const place=q('raceoff')?.querySelector('.rhRaceOffChampionBodyV6123');if(!data||!place||place.querySelector('.otgFinish8137'))return;
  const target=place.querySelector('.rhRaceOffChampionActionsV6123');if(target)target.insertAdjacentHTML('beforebegin',reportHtml(data));else place.insertAdjacentHTML('beforeend',reportHtml(data));
 }
 function showFestivalFinal(id){
  const run=(s()?.runs||[]).find(x=>same(x.id,id));if(run?.v8Groups)return;const data=festivalData(run);
  const place=q('final-standings')?.querySelector('.rhFS28Stage');if(!data||!place||place.querySelector('.otgFinishTrigger8137'))return;
  const button=document.createElement('button');button.type='button';button.className='otgFinishTrigger8137';button.textContent='🏆  CHAMPIONSHIP HIGHLIGHTS';
  const panel=document.createElement('div');panel.className='otgFinishPanel8137';panel.hidden=true;
  panel.innerHTML=`<button type="button" class="otgFinishClose8137" aria-label="Close highlights">×</button>${reportHtml(data)}`;
  button.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('.otgFinishClose8137')?.focus()});
  panel.querySelector('.otgFinishClose8137')?.addEventListener('click',()=>{panel.hidden=true;button.focus()});
  place.append(button,panel);
 }
 function wrap(name,fn){const base=window[name];if(typeof base!=='function')return;window[name]=function(){const out=base.apply(this,arguments);try{fn.apply(this,arguments)}catch(e){console.warn('OTG! completion highlights skipped',e)}return out}}
 wrap('rhV8GroupReveal',showGroup);
 wrap('rhRaceOffRenderChampion',showRaceOff);
 wrap('rhShowFinalStandingsV5828',showFestivalFinal);
 wrap('rhChampionshipCompleteTransition',showFestivalFinal);
 window.otgCompletionQA8137={festivalData,raceOffData,festivalRows};
})();
