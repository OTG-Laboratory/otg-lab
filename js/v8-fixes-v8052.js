/* OTG! v8.0.52 — Standard Result Summary round-times + Festival Swiss trophy finish. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):String(v??'—');
const runs=()=>typeof rhCurrentRuns==='function'?(rhCurrentRuns()||[]):[];
const runById=id=>runs().find(r=>String(r.id)===String(id));
const carBy=id=>{try{return rhSpace().cars.find(c=>String(c.id)===String(id))||null}catch(_){return null}};
const carText=id=>{const c=carBy(id);if(!c)return 'Unknown car';try{return typeof carName==='function'?carName(c):(c.name||c.model||'Unknown car')}catch(_){return c.name||c.model||'Unknown car'}};
const isStandard=r=>!!r&&String(r.format||'standard')!=='swiss'&&!['groups-total-time','groups'].includes(String(r.format||''))&&!r.v8Groups;

/* ---------- Result Summary: show the current round's individual times, not cumulative Championship totals ---------- */
function roundRows(run,res){
  const same=(run.results||[]).filter(x=>{
    if(res.roundId!=null&&x.roundId!=null)return String(x.roundId)===String(res.roundId);
    return String(x.roundName||'')===String(res.roundName||'');
  });
  const byCar=new Map();
  same.forEach(x=>{if(Number.isFinite(Number(x.time))&&Number(x.time)>0)byCar.set(String(x.carId),x)});
  return [...byCar.values()].map(x=>({id:String(x.carId),time:Number(x.time)})).sort((a,b)=>a.time-b.time);
}
function context(rows,id){
  if(!rows.length)return [];
  let at=rows.findIndex(x=>String(x.id)===String(id));if(at<0)at=0;
  const start=Math.max(0,Math.min(at-2,Math.max(0,rows.length-5)));
  return rows.slice(start,start+5).map((x,i)=>({...x,pos:start+i+1}));
}
function patchRoundSummary(run,res){
  if(!isStandard(run))return false;
  const card=document.querySelector('#festival .rhPodiumClassificationV5804');
  if(!card)return false;
  const rows=roundRows(run,res),leader=rows[0]?.time||0;
  const title=card.querySelector('.rhPodiumClassHeadV5804 b');if(title)title.textContent='ROUND CLASSIFICATION';
  const cols=card.querySelectorAll('.rhPodiumColsV5804 span');if(cols[2])cols[2].textContent='ROUND TIME';
  const host=card.querySelector('.rhPodiumRowsV5804');if(!host)return false;
  host.innerHTML=context(rows,res.carId).map(x=>`<div class="rhPodiumRowV5804 ${String(x.id)===String(res.carId)?'current':''}"><b>${String(x.pos).padStart(2,'0')}</b><span>${E(carText(x.id))}</span><strong>${fmt(x.time)}</strong><em>${x.pos===1?'—':'+'+fmt(x.time-leader)}</em></div>`).join('')||'<div class="rhPodiumRowV5804 current"><b>01</b><span>Result recorded</span><strong>—</strong><em>—</em></div>';
  return true;
}
function patchWhenSummaryAppears(run,res){
  let tries=0;
  const timer=setInterval(()=>{tries++;if(patchRoundSummary(run,res)||tries>=20)clearInterval(timer)},50);
}
const baseAccepted=window.rhResultAccepted;
if(typeof baseAccepted==='function')window.rhResultAccepted=function(owner,res,kind='festival'){
  const out=baseAccepted(owner,res,kind);
  if(kind!=='events'&&isStandard(owner))patchWhenSummaryAppears(owner,res);
  return out;
};
const baseSummary=window.rhResultSummary;
if(typeof baseSummary==='function')window.rhResultSummary=function(run,res){const out=baseSummary(run,res);patchRoundSummary(run,res);return out};

/* ---------- Festival Swiss: finish on the proper locked trophy / final-standings screen ---------- */
function trophy(r){
  const t=String(r?.type||r?.championshipType||r?.trophy||'festival').toLowerCase();
  if(t==='make'||t==='manufacturer')return 'assets/final/trophy-manufacturer.png';
  if(t==='era')return 'assets/final/trophy-era.png';
  if(t==='classtype'||t==='class-type')return 'assets/final/trophy-class-type.png';
  if(t==='vintage')return 'assets/final/trophy-vintage.png';
  if(t==='classic')return 'assets/final/trophy-classic.png';
  if(t==='favourite')return 'assets/final/trophy-favourite.png';
  return 'assets/final/trophy-festival.png';
}
function champLabel(r){
  const t=String(r?.type||r?.championshipType||'festival').toLowerCase();
  if(t==='era')return 'ERA SWISS CHAMPION';
  if(t==='make'||t==='manufacturer')return 'MANUFACTURER SWISS CHAMPION';
  if(t==='classtype'||t==='class-type')return 'CLASS / TYPE SWISS CHAMPION';
  if(t==='vintage')return 'VINTAGE SWISS CHAMPION';
  if(t==='classic')return 'CLASSIC SWISS CHAMPION';
  if(t==='favourite')return 'FAVOURITE SWISS CHAMPION';
  return 'SWISS CHAMPION';
}
function swissFinalRows(r){
  const rounds=r?.v8Swiss?.ko?.rounds||[],last=rounds[rounds.length-1],m=last?.matches?.[0];
  if(!m)return [];
  const a=m.resultA?{id:m.carA,time:Number(m.resultA.time)||0}:null,b=m.resultB?{id:m.carB,time:Number(m.resultB.time)||0}:null;
  return [a,b].filter(Boolean).sort((x,y)=>String(x.id)===String(m.winnerId)?-1:String(y.id)===String(m.winnerId)?1:x.time-y.time);
}
function leaveSwissTrophy(){
  const host=$('final-standings');document.body.classList.remove('rhFS28Active');
  if(host){host.classList.add('hidden');host.innerHTML=''}
  rhRenderFestival();show('festival');window.scrollTo(0,0);
}
function hallFromSwissTrophy(){
  const host=$('final-standings');document.body.classList.remove('rhFS28Active');
  if(host){host.classList.add('hidden');host.innerHTML=''}
  window.rhRecordsMode='hall';try{rhRecordsMode='hall'}catch(_){};rhRenderRecords();show('hall');window.scrollTo(0,0);
}
function renderSwissTrophy(r){
  const host=$('final-standings');if(!host)return;
  const champ=r?.v8Swiss?.championId||r?.winnerCarId,rows=swissFinalRows(r),winnerFinal=rows.find(x=>String(x.id)===String(champ)),leader=winnerFinal?.time||rows[0]?.time||0;
  document.body.classList.add('rhFS28Active');document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));host.classList.remove('hidden');
  host.innerHTML=`<div class="rhFS28Page"><div class="rhFS28Stage">
    <img class="rhFS28Art" src="assets/final/final-standings-face-on-ui-ready-v5828.png?v=5828" alt="">
    <div class="rhFS28Subtitle">${E(r?.name||'Swiss Championship')}</div>
    <div class="rhFS28Rows">${rows.map((x,i)=>`<div class="rhFS28Row"><span class="rhFS28Pos">${String(i+1).padStart(2,'0')}</span><span class="rhFS28Car">${E(carText(x.id))}</span><span class="rhFS28Time">${fmt(x.time)}</span><span class="rhFS28Gap">${i===0?'—':'+'+fmt(x.time-leader)}</span></div>`).join('')}</div>
    <img class="rhFS28Trophy" src="${trophy(r)}" alt="">
    <div class="rhFS28ChampionLabel">${E(champLabel(r))}</div>
    <div class="rhFS28WinnerName">${E(carText(champ))}</div>
    <div class="rhFS28TimeLabel">${winnerFinal?'FINAL WINNING TIME':'CHAMPIONSHIP TIME'}</div>
    <div class="rhFS28WinnerTime">${fmt(winnerFinal?.time||r?.v8Swiss?.championTotal||r?.winningTime)}</div>
    <button id="rh8052SwissTopBack" class="rhFS28Hot rhFS28TopBack" aria-label="Back"></button>
    <button id="rh8052SwissHall" class="rhFS28Hot rhFS28Hall" aria-label="View Hall of Fame"></button>
    <button id="rh8052SwissBack" class="rhFS28Hot rhFS28Back" aria-label="Continue"></button>
  </div></div>`;
  $('rh8052SwissTopBack')?.addEventListener('click',leaveSwissTrophy);$('rh8052SwissBack')?.addEventListener('click',leaveSwissTrophy);$('rh8052SwissHall')?.addEventListener('click',hallFromSwissTrophy);window.scrollTo(0,0);
}
window.rhV8052SwissTrophy=renderSwissTrophy;
const baseOpenRun=window.rhOpenRun;
window.rhOpenRun=function(id){
  let r=runById(id);
  if(r?.format==='swiss'&&r.status==='complete'){renderSwissTrophy(r);return}
  const out=baseOpenRun(id);
  r=runById(id);
  if(r?.format==='swiss'&&r.status==='complete')renderSwissTrophy(r);
  return out;
};

})();
