/* OTG! v8.0.51 + v8.0.55 Swiss foundation patch — setup/library consistency, Festival Swiss and final split-times. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):String(v||'—');
const runById=id=>(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(r=>String(r.id)===String(id));
const car=id=>{try{return rhSpace().cars.find(c=>String(c.id)===String(id))}catch(_){return null}};
const carText=id=>{const c=car(id);try{return c?carName(c):'Unknown car'}catch(_){return c?.name||c?.model||'Unknown car'}};
const formatOfSetup=()=>rhSetup?.v8SwissMode?'swiss':rhSetup?.v8GroupMode?'groups':'standard';

/* ---------- Saved Race Names: later-round touch/scroll repair ---------- */
function closeRoundPicker(){
  $('rhRoundNamePicker')?.remove();
  document.body.classList.remove('rh8051RoundPickerOpen');
}
window.rhCloseRoundNamePicker=closeRoundPicker;
window.rhOpenRoundNamePicker=function(kind,ownerId,roundId){
  const names=(typeof rhSavedRoundNames==='function'?rhSavedRoundNames():[]);
  if(!names.length){toast('No saved race names yet');return}
  closeRoundPicker();
  document.activeElement?.blur?.();
  document.querySelectorAll('.rhGlobalSmartBar').forEach(x=>{x.hidden=true;x.innerHTML=''});
  const overlay=document.createElement('div');
  overlay.id='rhRoundNamePicker';overlay.className='rhOverlay rh8051RoundPicker';
  overlay.innerHTML=`<div class="rhModal rhRoundNamePickerModal rh8051RoundNamePickerModal" role="dialog" aria-modal="true"><button class="rhModalX rh8051PickerClose" type="button" aria-label="Close">×</button><small>SAVED RACE NAMES</small><h2>Choose a Race</h2><p>Select a previously used race name, or close this list and type a new one.</p><div class="rhRoundNamePickerList rh8051RoundNamePickerList"></div><button class="btn secondary rh8051PickerNew" type="button">TYPE A NEW NAME</button></div>`;
  const list=overlay.querySelector('.rh8051RoundNamePickerList');
  names.forEach(n=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span>${E(n)}</span><em>›</em>`;b.addEventListener('click',()=>{
    const name=String(n||'').trim();if(!name)return;
    if(kind==='champ'){
      const r=rhSetup?.rounds?.find(x=>String(x.id)===String(roundId));if(!r)return;
      r.name=name;closeRoundPicker();rhRenderSetup();return;
    }
    if(kind==='event'){
      const e=rhSpace().customEvents.find(x=>String(x.id)===String(ownerId)),r=e?.rounds?.find(x=>String(x.id)===String(roundId));if(!r)return;
      r.name=name;rhSave();closeRoundPicker();rhOpenEvent(ownerId);
    }
  });list.appendChild(b)});
  overlay.addEventListener('click',e=>{if(e.target===overlay)closeRoundPicker()});
  overlay.querySelector('.rh8051PickerClose').addEventListener('click',closeRoundPicker);
  overlay.querySelector('.rh8051PickerNew').addEventListener('click',closeRoundPicker);
  document.body.appendChild(overlay);document.body.classList.add('rh8051RoundPickerOpen');
  requestAnimationFrame(()=>{list.scrollTop=0});
};

/* ---------- Festival format parity: Standard / Groups / Swiss ---------- */
const baseSetFormat=window.rhV8SetFormat;
window.rhV8SetFormat=function(v){
  if(!rhSetup||rhSetup.type==='pick-my-drive')return;
  if(v==='swiss')return window.rhV8051SetFestivalFormat('swiss');
  rhSetup.v8SwissMode=false;rhSetup.v8SwissPlan=null;
  return baseSetFormat(v);
};
window.rhV8051SetFestivalFormat=function(v){
  if(!rhSetup||rhSetup.type==='pick-my-drive')return;
  if(v==='swiss'){rhSetup.v8SwissMode=true;rhSetup.v8GroupMode=false;ensureSwissPlan();rhRenderSetup();return}
  rhSetup.v8SwissMode=false;rhSetup.v8SwissPlan=null;baseSetFormat(v==='groups');
};
function swissBasePlan(){const n=rhSetup?.entries?.length||0;return window.rhCustomSwissPlan8040?.(n)||null}
function ensureSwissPlan(){
  if(!rhSetup?.v8SwissMode)return null;
  const p=swissBasePlan();if(!p){rhSetup.v8SwissPlan=null;return null}
  const valid=p.cuts||[];let cut=Number(rhSetup.v8SwissPlan?.knockoutSize||p.recCut);if(!valid.includes(cut))cut=p.recCut;
  rhSetup.v8SwissPlan={knockoutSize:cut};return {p,cut};
}
window.rhV8051SetSwissCut=function(cut){if(!rhSetup?.v8SwissMode)return;const p=swissBasePlan();cut=Number(cut);if(!p?.cuts?.includes(cut))return;rhSetup.v8SwissPlan={knockoutSize:cut};rhRenderSetup()};
function swissPlannerHtml(){
  const n=rhSetup?.entries?.length||0,p=swissBasePlan(),rounds=rhSetup?.rounds?.length||0,sel=ensureSwissPlan();
  if(!p)return `<section class="rhSetupPanelV1 rhSwissPlanner8040 v8051SwissPlanner"><div class="rhEventSectionHead"><div><h2>Swiss Structure</h2><p class="small">Swiss is available for 8+ entrants with no upper field limit.</p></div><span class="rhFormatBadge8025">SWISS</span></div><div class="empty">Choose at least 8 cars to enable Swiss.</div></section>`;
  const rec=p.rec,recCopy=n<=64?'3 rounds for 8–64 entrants':'4 rounds for 65+ entrants';
  return `<section class="rhSetupPanelV1 rhSwissPlanner8040 v8051SwissPlanner"><div class="rhEventSectionHead"><div><h2>Swiss Structure</h2><p class="small">The configured Championship rounds below become the Swiss rounds, in order. OTG! recommends ${recCopy}; add more rounds whenever you want a longer Swiss stage.</p></div><span class="rhFormatBadge8025">SWISS</span></div><div class="rhSwissSummary8040"><div><b>${n}</b><small>ENTRANTS</small></div><div><b>${rounds}</b><small>SWISS ROUNDS</small></div><div><b>${sel?.cut||p.recCut}</b><small>QUALIFY</small></div></div><h3>Knockout Cut</h3><div class="rhSwissChoices8040">${p.cuts.map(c=>`<button type="button" class="rhSwissChoice8040 ${(sel?.cut||p.recCut)===c?'selected':''}" onclick="rhV8051SetSwissCut(${c})">TOP ${c}<small>TO KNOCKOUT</small></button>`).join('')}</div><div class="rhSwissRules8040"><b>HOW OTG! WILL RUN IT</b><span>• ${rounds} configured track${rounds===1?'':'s'} = ${rounds} Swiss round${rounds===1?'':'s'}.</span><span>• Recommended baseline: ${rec} Swiss rounds for this field; more configured rounds are allowed.</span><span>• Pair equal/near-equal records and avoid rematches.</span><span>• Standings: Wins → Opponent Wins → Total Time.</span><span>• ${n%2?'Odd field: one rotating bye each round; no repeat bye until necessary.':'Even field: every car gets an opponent each round.'}</span><span>• Top ${sel?.cut||p.recCut} then enter a normal knockout; knockout tracks are chosen round by round.</span></div></section>`;
}
function decorateFestivalSetup(){
  if(!rhSetup||rhSetup.type==='pick-my-drive')return;
  const panel=document.querySelector('.v8FormatPanel'),choices=panel?.querySelector('.v8FormatChoices');if(!panel||!choices)return;
  if(!choices.querySelector('[data-rh-format="swiss"]')){const b=document.createElement('button');b.type='button';b.dataset.rhFormat='swiss';b.onclick=()=>rhV8051SetFestivalFormat('swiss');b.innerHTML='<b>SWISS</b><small>League-style pairings, then a knockout finish.</small>';choices.appendChild(b)}
  const mode=formatOfSetup();choices.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
  if(mode==='swiss')choices.querySelector('[data-rh-format="swiss"]')?.classList.add('selected');
  else if(mode==='groups')choices.children[1]?.classList.add('selected');else choices.children[0]?.classList.add('selected');
  const strong=panel.querySelector('.rhSetupPanelHeadV1 strong');if(strong)strong.textContent=mode==='swiss'?'SWISS':mode==='groups'?'TOTAL TIME GROUPS':'STANDARD';
  document.querySelector('.v8051SwissPlanner')?.remove();
  if(mode==='swiss'){
    panel.insertAdjacentHTML('afterend',swissPlannerHtml());
    const intro=document.querySelector('.rhSetupTitleV1 p');if(intro)intro.textContent='Build the Swiss Championship, then race the configured rounds before the knockout.';
    const rule=document.querySelector('.rhSetupRuleV1 p');if(rule)rule.innerHTML='<b>SWISS.</b><br>EACH ROUND USES THE CONFIGURED TRACK IN ORDER. WINS, OPPONENT WINS AND TOTAL TIME SET THE LEAGUE TABLE; THE QUALIFIERS THEN ENTER A KNOCKOUT.';
    const start=document.querySelector('.rhSetupStartGreenV1'),p=swissBasePlan(),rounds=rhSetup.rounds?.length||0;if(start)start.disabled=!(p&&rounds>0&&rhSetup.entries?.length);
  }
}
const baseRenderSetup=window.rhRenderSetup;
window.rhRenderSetup=function(){baseRenderSetup();decorateFestivalSetup()};
const baseRefreshSetup=window.rhRefreshSetupEntryUi;
window.rhRefreshSetupEntryUi=function(){baseRefreshSetup();if(rhSetup?.v8SwissMode)decorateFestivalSetup()};
const baseOpenPrepared=window.rhOpenPreparedRun;
window.rhOpenPreparedRun=function(id){const r=runById(id);if(r?.format!=='swiss')return baseOpenPrepared(id);rhSetup={type:r.type||r.championshipType||'festival',value:r.value,name:r.name,entries:[...(r.entries||[])],rounds:rhClone(r.rounds||[]),savedRunId:r.id,v8GroupMode:false,v8SwissMode:true,v8SwissPlan:{knockoutSize:Number(r.v8SwissPlan?.knockoutSize||r.v8Swiss?.knockoutSize)||8}};show('festival');rhRenderSetup()};
const baseSavePrepared=window.rhSavePrepared;
window.rhSavePrepared=function(){
  if(!rhSetup?.v8SwissMode)return baseSavePrepared();
  const x=rhSetup,s=rhSpace();let run=x.savedRunId?s.runs.find(r=>r.id===x.savedRunId&&r.status==='prepared'):null;
  const data={name:x.name,type:x.type,value:x.value,trophy:rhTrophyTypeKey(x.type),entries:[...x.entries],rounds:rhClone(x.rounds),format:'swiss',v8SwissPlan:{knockoutSize:Number(ensureSwissPlan()?.cut||8)},updatedAt:now()};
  if(run)Object.assign(run,data);else{run={id:rhId('run'),createdAt:now(),status:'prepared',results:[],...data};s.runs.push(run)}
  rhSave();rhSetup=null;toast('Championship saved');rhRenderFestival();
};

/* ---------- Festival Swiss race flow ---------- */
const baseConfirmStart=window.rhConfirmStart,baseOpenRun=window.rhOpenRun;
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function swissStats(r){const ids=r.entries||[],s={};ids.forEach(id=>s[id]={id,wins:0,time:0,opps:[],bye:false});(r.v8Swiss?.swissRounds||[]).forEach(rd=>{(rd.matches||[]).forEach(m=>{if(m.resultA)s[m.carA].time+=Number(m.resultA.time)||0;if(m.resultB)s[m.carB].time+=Number(m.resultB.time)||0;if(m.winnerId){s[m.winnerId].wins++;s[m.carA].opps.push(m.carB);s[m.carB].opps.push(m.carA)}});if(rd.byeId&&rd.status==='complete'){s[rd.byeId].wins++;s[rd.byeId].bye=true}});Object.values(s).forEach(x=>x.oppWins=x.opps.reduce((n,id)=>n+(s[id]?.wins||0),0));return s}
function swissStandings(r){return Object.values(swissStats(r)).sort((a,b)=>b.wins-a.wins||b.oppWins-a.oppWins||a.time-b.time||String(a.id).localeCompare(String(b.id)))}
function swissPlayed(r,a,b){return (r.v8Swiss?.swissRounds||[]).some(rd=>(rd.matches||[]).some(m=>(m.carA===a&&m.carB===b)||(m.carA===b&&m.carB===a)))}
function pairSwiss(r,rd){let ids=rd.index===1?shuffle(r.entries||[]):swissStandings(r).map(x=>x.id);let byeId=null;if(ids.length%2){const st=swissStats(r);for(let i=ids.length-1;i>=0;i--){if(!st[ids[i]].bye){byeId=ids.splice(i,1)[0];break}}if(!byeId)byeId=ids.pop()}const pairs=[];while(ids.length){const a=ids.shift();let j=ids.findIndex(b=>!swissPlayed(r,a,b));if(j<0)j=0;const b=ids.splice(j,1)[0];pairs.push({id:rhId('swiss-match'),carA:a,carB:b,resultA:null,resultB:null,winnerId:null})}return{pairs,byeId}}
function swissNextEntry(rd){for(const m of rd.matches||[]){if(!m.resultA)return{m,side:'A',carId:m.carA};if(!m.resultB)return{m,side:'B',carId:m.carB}}return null}
function swissTable(r,limit=999){return swissStandings(r).slice(0,limit).map((s,i)=>`<div class="rhSwissStanding8041"><b>${i+1}</b><span>${E(carText(s.id))}</span><strong>${s.wins} W</strong><small>OPP WINS ${s.oppWins} • TOTAL TIME ${fmt(s.time)} • BYE ${s.bye?'✓':'✕'}</small></div>`).join('')}
window.rhConfirmStart=function(){
  if(!rhSetup?.v8SwissMode)return baseConfirmStart();
  const x=rhSetup,p=swissBasePlan(),rounds=x.rounds?.length||0,cut=ensureSwissPlan()?.cut;if(!p||rounds<1||!cut)return toast('Complete the Swiss setup first');
  const s=rhSpace();let run={id:rhId('run'),name:x.name,type:x.type,value:x.value,trophy:rhTrophyTypeKey(x.type),createdAt:now(),startedAt:now(),status:'active',format:'swiss',rounds:rhClone(x.rounds),results:[],entries:[...x.entries],v8SwissPlan:{knockoutSize:cut}};
  run.v8Swiss={phase:'swiss',knockoutSize:cut,currentRound:0,swissRounds:run.rounds.map((rd,i)=>({id:rd.id,index:i+1,label:`SWISS ROUND ${i+1}`,trackName:rd.name,layout:rd.layout||'',status:i===0?'setup':'pending',matches:null,byeId:null})),ko:null,championId:null,championTotal:null};
  if(x.savedRunId){const i=s.runs.findIndex(r=>r.id===x.savedRunId);if(i>=0){run.id=s.runs[i].id;run.createdAt=s.runs[i].createdAt||run.createdAt;s.runs[i]=run}else s.runs.push(run)}else s.runs.push(run);
  rhSave();rhSetup=null;rhOpenRun(run.id);
};
function swissBack(){rhRenderFestival();show('festival');window.scrollTo(0,0)}window.rhV8051SwissBack=swissBack;
function renderSwissRoundSetup(r,rd){show('festival');$('festival').innerHTML=`<div class="rhContent"><button class="v8GroupVisibleBack" onclick="rhV8051SwissBack()">‹ BACK</button><section class="rhSection"><small>SWISS CHAMPIONSHIP</small><h2>${E(rd.label)}</h2><p>The track is already locked from the Championship setup. Pairings are generated when the round starts.</p></section><section class="rhSection"><h2>${E(rd.trackName)}</h2>${rd.layout?`<p>${E(rd.layout)}</p>`:''}<button class="btn" onclick="rhV8051StartSwissRound('${r.id}')">START ${E(rd.label)}</button></section></div>`;window.scrollTo(0,0)}
window.rhV8051StartSwissRound=function(id){const r=runById(id),rd=r?.v8Swiss?.swissRounds?.[r.v8Swiss.currentRound];if(!r||!rd)return;const p=pairSwiss(r,rd);rd.matches=p.pairs;rd.byeId=p.byeId;rd.status='racing';rd.startedAt=now();rhSave();renderSwissRound(r,rd)};
function renderSwissRound(r,rd){show('festival');const n=swissNextEntry(rd),done=(rd.matches||[]).filter(m=>m.winnerId).length;$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><div class="v8GroupTopRow"><button class="v8GroupVisibleBack" onclick="rhV8051SwissBack()">‹ BACK</button><div class="v8GroupIdentity">${E(rd.label)}</div></div>${n?`<section class="rhCurrentCarV1"><div class="rhCurrentCarHeadV1"><div><small>CURRENT MATCH</small><h2>MATCH ${rd.matches.indexOf(n.m)+1}</h2></div><strong>${done} OF ${rd.matches.length}</strong></div><div class="rhCurrentCarMetaV1"><div><span>${n.side==='A'?'FIRST':'SECOND'} RACER</span><b>${E(carText(n.carId))}</b></div><div><span>TRACK</span><b>${E(rd.trackName)}</b></div></div><button class="rhContinueV1" onclick="rhV8051SwissResult('${r.id}')"><span>▶</span><div><b>CONTINUE</b><small>MATCH ${rd.matches.indexOf(n.m)+1}</small></div></button></section>`:''}<section class="v8TrackBoards"><h2>MATCHES</h2>${(rd.matches||[]).map((m,i)=>`<div class="rhKOMatch8037"><div class="rhKOMatchNo8037">${i+1}</div><div class="rhKOMatchBody8037"><div class="rhKORacer8037 ${m.winnerId===m.carA?'winner':''}"><span>${E(carText(m.carA))}</span><b>${m.resultA?fmt(m.resultA.time):'—'}</b></div><div class="rhKORacer8037 ${m.winnerId===m.carB?'winner':''}"><span>${E(carText(m.carB))}</span><b>${m.resultB?fmt(m.resultB.time):'—'}</b></div>${m.winnerId?`<div class="rhKOWinner8037"><small>WINNER</small><strong>${E(carText(m.winnerId))}</strong></div>`:''}</div><div class="rhKOStatus8037">${m.winnerId?'COMPLETE':'WAITING'}</div></div>`).join('')}</section>${rd.byeId?`<section class="v823Qualified rhSwissBye8044"><div><small>${E(rd.label)}</small><h2>BYE</h2></div><div class="rhSwissByeBody8044"><b>AUTOMATIC WIN</b><span>${E(carText(rd.byeId))}</span></div></section>`:''}</main></div>`;window.scrollTo(0,0)}
const SEG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
function digit(ch){return `<i class="rhSegDigit">${'abcdefg'.split('').map(x=>`<span class="s${x} ${(SEG[ch]||'').includes(x)?'on':''}"></span>`).join('')}</i>`}function group(v,n){return String(v||'').padStart(n,'0').slice(-n).split('').map(digit).join('')}function field(id,n,next){return `<label class="rhStopwatchField"><span id="${id}Display" class="rhStopwatchSegmentDisplay">${group('0',n)}</span><input id="${id}" type="tel" inputmode="numeric" maxlength="${n}" autocomplete="off" onfocus="this.select()" oninput="rhStopwatchInput(this,'rhV8051','${next}',${n})"></label>`}function stopwatch(){return `<div class="rh5801Stopwatch"><div class="rhStopwatchTop"><span class="rhStopwatchReady"><i></i> READY</span><span class="rhStopwatchIcon">◷</span></div><div class="rhStopwatchDisplay"><div class="rhStopwatchDigits">${field('rhV8051Min',2,'rhV8051Sec')}<span>:</span>${field('rhV8051Sec',2,'rhV8051Ms')}<span>.</span>${field('rhV8051Ms',3,'rhV8051Save')}</div><div class="rhStopwatchUnits"><span>MINUTES</span><span>SECONDS</span><span>MILLISECONDS</span></div></div><p>Tap a section and type the race time</p></div>`}
function inputTime(){const mm=Number($('rhV8051Min')?.value||0),ss=Number($('rhV8051Sec')?.value||0),ms=Number(($('rhV8051Ms')?.value||'0').padEnd(3,'0')),time=mm*60+ss+ms/1000;return Number.isFinite(time)&&time>0&&ss<=59&&ms<=999?time:null}
function trackRows(trackName,layout=''){try{const rows=window.rhV7RecordsFoundation?.allRows?.()||[],norm=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase();return rows.filter(x=>norm(x.track)===norm(trackName)&&norm(x.layout||'')===norm(layout||''))}catch(_){return[]}}
function resultFlags(r,trackName,layout,carId,time){const norm=v=>String(v||'').trim().replace(/\s+/g,' ').toLowerCase(),prior=(r.results||[]).filter(x=>!x.advancedTiming&&norm(x.track||x.roundName)===norm(trackName)&&norm(x.layout||'')===norm(layout||'')),all=trackRows(trackName,layout),mine=all.filter(x=>String(x.carId)===String(carId));const pc=prior.length?Math.min(...prior.map(x=>Number(x.time))):null,pa=all.length?Math.min(...all.map(x=>Number(x.time))):null;return{championshipRecord:pc!=null&&time<pc,allTime:pa!=null&&time<pa,personalBest:!!mine.length&&time<Math.min(...mine.map(x=>Number(x.time))),previousChampionshipBest:pc,previousAllTimeBest:pa}}
window.rhV8051SwissResult=function(id){const r=runById(id),rd=r?.v8Swiss?.swissRounds?.[r.v8Swiss.currentRound],n=rd?swissNextEntry(rd):null;if(!r||!rd||!n)return;show('festival');$('festival').innerHTML=`<main class="rh5801Entry"><section class="rh5801Hero"><button class="rh5801Back" onclick="rhOpenRun('${r.id}')">‹</button><div class="rh5801Head"><h1>ENTER RESULT</h1><p>${E(rd.trackName)}</p></div></section><section class="rh5801Context"><small>${E(r.name)} • ${E(rd.label)} • MATCH ${rd.matches.indexOf(n.m)+1}</small><b>${E(carText(n.carId))}</b></section><section class="rh5801Controls">${stopwatch()}<button id="rhV8051Save" class="rh5801Save" onclick="rhV8051SaveSwissResult('${r.id}','${n.m.id}','${n.side}')"><span>🏁</span><b>SAVE RESULT</b></button></section></main>`;window.scrollTo(0,0)};
window.rhV8051SaveSwissResult=function(id,mid,side){const r=runById(id),rd=r?.v8Swiss?.swissRounds?.[r.v8Swiss.currentRound],m=rd?.matches?.find(x=>String(x.id)===String(mid)),time=inputTime();if(!r||!rd||!m)return;if(time==null)return toast('Enter a valid race time');const carId=side==='A'?m.carA:m.carB,flags=resultFlags(r,rd.trackName,rd.layout||'',carId,time),res={id:rhId('result'),carId,roundId:rd.id,roundName:rd.trackName,track:rd.trackName,layout:rd.layout||'',time,date:now(),v8FestivalSwiss:true,matchId:m.id,...flags};if(side==='A')m.resultA=res;else m.resultB=res;r.results.push(res);if(m.resultA&&m.resultB)m.winnerId=Number(m.resultA.time)<=Number(m.resultB.time)?m.carA:m.carB;if(rd.matches.every(x=>x.winnerId)){rd.status='complete';rd.completedAt=now()}rhSave();renderSwissSaved(r,rd,res)};
function renderSwissSaved(r,rd,res){show('festival');const complete=rd.status==='complete',isKo=!!res?.v8FestivalSwissKO;$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><div class="v8GroupTopRow"><button class="v8GroupVisibleBack" onclick="rhOpenRun('${r.id}')">‹ BACK</button><div class="v8GroupIdentity">${E(rd.label)}</div></div><section class="v8TrackResult"><small>RESULT SAVED • ${E(rd.trackName)}</small><h2>${E(carText(res.carId))}</h2><strong>${fmt(res.time)}</strong>${res.championshipRecord||res.allTime?`<div class="v8RecordNotice">${res.championshipRecord?'<b>★ NEW CHAMPIONSHIP RECORD</b>':''}${res.allTime?'<b>★ NEW ALL-TIME OTG! RECORD</b>':''}</div>`:''}<button class="btn" onclick="rhOpenRun('${r.id}')">${complete?'VIEW ROUND STANDINGS':isKo?'CONTINUE KNOCKOUT':'CONTINUE SWISS ROUND'}</button></section></main></div>`;window.scrollTo(0,0)}
function renderSwissComplete(r,rd){const last=rd.index>=r.v8Swiss.swissRounds.length;show('festival');$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><button class="v8GroupVisibleBack" onclick="rhV8051SwissBack()">‹ BACK</button><section class="v8Reveal"><div class="v8GroupIdentity">${E(rd.label)}</div><div class="v8RevealTitle"><small>${last?'SWISS STAGE COMPLETE':'ROUND COMPLETE'}</small><h2>${last?`TOP ${r.v8Swiss.knockoutSize} QUALIFY`:'CURRENT STANDINGS'}</h2></div><div class="rhSwissTable8041">${swissTable(r,last?r.v8Swiss.knockoutSize:999)}</div><button class="btn" onclick="${last?`rhV8051BeginSwissKO('${r.id}')`:`rhV8051NextSwissRound('${r.id}')`}">${last?'BEGIN KNOCKOUT':'START NEXT ROUND'}</button></section></main></div>`;window.scrollTo(0,0)}
window.rhV8051NextSwissRound=function(id){const r=runById(id),s=r?.v8Swiss;if(!r||!s)return;s.currentRound=Math.min(s.swissRounds.length-1,s.currentRound+1);s.swissRounds[s.currentRound].status='setup';rhSave();rhOpenRun(id)};
function koLabel(n){return n===2?'FINAL':n===4?'SEMI-FINAL':n===8?'QUARTER-FINAL':`ROUND OF ${n}`}
window.rhV8051BeginSwissKO=function(id){const r=runById(id),s=r?.v8Swiss;if(!r||!s)return;const ids=swissStandings(r).slice(0,s.knockoutSize).map(x=>x.id);s.swissCompleted={standings:swissStandings(r),rounds:rhClone(s.swissRounds)};s.phase='ko';s.ko={currentRound:0,rounds:[{id:rhId('ko-round'),index:1,label:koLabel(ids.length),participantIds:[...ids],status:'setup',trackName:'',layout:'',matches:null}],championId:null};rhSave();rhOpenRun(id)};
function koRound(r){return r.v8Swiss?.ko?.rounds?.[r.v8Swiss.ko.currentRound]||null}
function koNext(rd){for(const m of rd.matches||[]){if(!m.resultA)return{m,side:'A',carId:m.carA};if(!m.resultB)return{m,side:'B',carId:m.carB}}return null}
function renderKoSetup(r,rd){show('festival');$('festival').innerHTML=`<div class="rhContent"><button class="v8GroupVisibleBack" onclick="rhV8051SwissBack()">‹ BACK</button><section class="rhSection"><small>SWISS • KNOCKOUT</small><h2>${E(rd.label)} SETUP</h2><p>Choose one track for this knockout round.</p></section><section class="rhSection"><h2>Round Track</h2><input id="rhV8051KOTrack" value="${E(rd.trackName||'')}" placeholder="Track / race name"><button class="btn" onclick="rhV8051StartKORound('${r.id}')">START ${E(rd.label)}</button></section></div>`;window.scrollTo(0,0)}
window.rhV8051StartKORound=function(id){const r=runById(id),rd=r?koRound(r):null;if(!r||!rd)return;const track=String($('rhV8051KOTrack')?.value||'').trim();if(!track)return toast('Choose a track first');rd.trackName=track;const ids=shuffle(rd.participantIds);rd.matches=[];for(let i=0;i<ids.length;i+=2)rd.matches.push({id:rhId('ko-match'),carA:ids[i],carB:ids[i+1],resultA:null,resultB:null,winnerId:null});rd.status='racing';rd.startedAt=now();rhSave();renderKoRound(r,rd)};
function renderKoRound(r,rd){show('festival');const n=koNext(rd),done=(rd.matches||[]).filter(m=>m.winnerId).length;$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><div class="v8GroupTopRow"><button class="v8GroupVisibleBack" onclick="rhV8051SwissBack()">‹ BACK</button><div class="v8GroupIdentity">SWISS • ${E(rd.label)}</div></div>${n?`<section class="rhCurrentCarV1"><div class="rhCurrentCarHeadV1"><div><small>CURRENT MATCH</small><h2>MATCH ${rd.matches.indexOf(n.m)+1}</h2></div><strong>${done} OF ${rd.matches.length}</strong></div><div class="rhCurrentCarMetaV1"><div><span>${n.side==='A'?'FIRST':'SECOND'} RACER</span><b>${E(carText(n.carId))}</b></div><div><span>TRACK</span><b>${E(rd.trackName)}</b></div></div><button class="rhContinueV1" onclick="rhV8051KOResult('${r.id}')"><span>▶</span><div><b>CONTINUE</b><small>MATCH ${rd.matches.indexOf(n.m)+1}</small></div></button></section>`:''}<section class="v8TrackBoards"><h2>MATCHES</h2>${(rd.matches||[]).map((m,i)=>`<div class="rhKOMatch8037"><div class="rhKOMatchNo8037">${i+1}</div><div class="rhKOMatchBody8037"><div class="rhKORacer8037 ${m.winnerId===m.carA?'winner':''}"><span>${E(carText(m.carA))}</span><b>${m.resultA?fmt(m.resultA.time):'—'}</b></div><div class="rhKORacer8037 ${m.winnerId===m.carB?'winner':''}"><span>${E(carText(m.carB))}</span><b>${m.resultB?fmt(m.resultB.time):'—'}</b></div>${m.winnerId?`<div class="rhKOWinner8037"><small>WINNER</small><strong>${E(carText(m.winnerId))}</strong></div>`:''}</div><div class="rhKOStatus8037">${m.winnerId?'COMPLETE':'WAITING'}</div></div>`).join('')}</section></main></div>`;window.scrollTo(0,0)}
window.rhV8051KOResult=function(id){const r=runById(id),rd=r?koRound(r):null,n=rd?koNext(rd):null;if(!r||!rd||!n)return;show('festival');$('festival').innerHTML=`<main class="rh5801Entry"><section class="rh5801Hero"><button class="rh5801Back" onclick="rhOpenRun('${r.id}')">‹</button><div class="rh5801Head"><h1>ENTER RESULT</h1><p>${E(rd.trackName)}</p></div></section><section class="rh5801Context"><small>${E(r.name)} • ${E(rd.label)} • MATCH ${rd.matches.indexOf(n.m)+1}</small><b>${E(carText(n.carId))}</b></section><section class="rh5801Controls">${stopwatch()}<button id="rhV8051Save" class="rh5801Save" onclick="rhV8051SaveKOResult('${r.id}','${n.m.id}','${n.side}')"><span>🏁</span><b>SAVE RESULT</b></button></section></main>`;window.scrollTo(0,0)};
window.rhV8051SaveKOResult=function(id,mid,side){const r=runById(id),rd=r?koRound(r):null,m=rd?.matches?.find(x=>String(x.id)===String(mid)),time=inputTime();if(!r||!rd||!m)return;if(time==null)return toast('Enter a valid race time');const carId=side==='A'?m.carA:m.carB,flags=resultFlags(r,rd.trackName,rd.layout||'',carId,time),res={id:rhId('result'),carId,roundId:rd.id,roundName:rd.trackName,track:rd.trackName,layout:rd.layout||'',time,date:now(),v8FestivalSwissKO:true,matchId:m.id,...flags};if(side==='A')m.resultA=res;else m.resultB=res;r.results.push(res);if(m.resultA&&m.resultB)m.winnerId=Number(m.resultA.time)<=Number(m.resultB.time)?m.carA:m.carB;if(rd.matches.every(x=>x.winnerId)){rd.status='complete';rd.completedAt=now()}rhSave();renderSwissSaved(r,rd,res)};
function renderKoComplete(r,rd){const winners=(rd.matches||[]).map(m=>m.winnerId),final=winners.length===1;if(final){const champ=winners[0];r.v8Swiss.championId=champ;r.v8Swiss.ko.championId=champ;r.v8Swiss.championTotal=(r.results||[]).filter(x=>String(x.carId)===String(champ)).reduce((a,b)=>a+Number(b.time||0),0);r.winningTime=r.v8Swiss.championTotal;r.status='complete';r.completedAt=now();rhSave();return renderSwissChampion(r)}show('festival');$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><button class="v8GroupVisibleBack" onclick="rhV8051SwissBack()">‹ BACK</button><section class="v8Reveal"><div class="v8GroupIdentity">${E(rd.label)}</div><div class="v8RevealTitle"><small>ROUND COMPLETE</small><h2>${winners.length} ADVANCE</h2></div>${winners.map((id,i)=>`<div class="v8Standing qualified"><b>${i+1}</b><span>${E(carText(id))}</span><strong>QUALIFIED</strong></div>`).join('')}<button class="btn" onclick="rhV8051NextKORound('${r.id}')">SET UP NEXT ROUND</button></section></main></div>`;window.scrollTo(0,0)}
window.rhV8051NextKORound=function(id){const r=runById(id),ko=r?.v8Swiss?.ko,rd=r?koRound(r):null;if(!r||!ko||!rd)return;const ids=(rd.matches||[]).map(m=>m.winnerId);ko.rounds.push({id:rhId('ko-round'),index:ko.rounds.length+1,label:koLabel(ids.length),participantIds:[...ids],status:'setup',trackName:'',layout:'',matches:null});ko.currentRound=ko.rounds.length-1;rhSave();rhOpenRun(id)};
function renderSwissChampion(r){const champ=r.v8Swiss?.championId;show('festival');$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><section class="v8Reveal"><div class="v8GroupIdentity">SWISS CHAMPIONSHIP FINAL</div><div class="v8RevealTitle"><small>CHAMPIONSHIP COMPLETE</small><h2>CHAMPION DECIDED</h2></div><div class="v8Standing qualified"><b>1</b><span>${E(carText(champ))}</span><strong>${fmt(r.v8Swiss?.championTotal)}</strong><em>CHAMPION</em></div><button class="btn" onclick="rhV8051SwissBack()">RETURN TO FESTIVAL</button></section></main></div>`;window.scrollTo(0,0)}
window.rhOpenRun=function(id){const r=runById(id);if(r?.format!=='swiss')return baseOpenRun(id);if(r.status==='complete')return renderSwissChampion(r);const s=r.v8Swiss;if(!s)return baseOpenRun(id);if(s.phase==='ko'){const rd=koRound(r);if(!rd)return swissBack();if(rd.status==='setup')return renderKoSetup(r,rd);if(rd.status==='complete')return renderKoComplete(r,rd);return renderKoRound(r,rd)}const rd=s.swissRounds?.[s.currentRound];if(!rd)return swissBack();if(rd.status==='setup'||rd.status==='pending')return renderSwissRoundSetup(r,rd);if(rd.status==='complete')return renderSwissComplete(r,rd);return renderSwissRound(r,rd)};

/* ---------- Hall of Fame back + Swiss winner compatibility ---------- */
const baseHall=window.rhHallOfFame;
if(typeof baseHall==='function')window.rhHallOfFame=function(completed){const mapped=(completed||[]).map(r=>r?.format==='swiss'&&r?.v8Swiss?.championId?{...r,format:'groups-total-time',v8Groups:{championId:r.v8Swiss.championId,championTotal:Number(r.v8Swiss.championTotal||r.winningTime)||0}}:r);return baseHall(mapped)};
const baseHeader=window.rhRecordsHeader;
if(typeof baseHeader==='function')window.rhRecordsHeader=function(hall){let out=baseHeader(hall);if(hall)out=out.replace(/onclick="[^"]*"/,'onclick="window.rhRecordsMode=\'records\';rhRecordsMode=\'records\';rhRenderRecords();show(\'hall\')"');return out};
const baseRenderRecords=window.rhRenderRecords;
if(typeof baseRenderRecords==='function')window.rhRenderRecords=function(){baseRenderRecords();const hallBtn=document.querySelector('.v7Hall');if(hallBtn)hallBtn.onclick=()=>{window.rhRecordsMode='hall';try{rhRecordsMode='hall'}catch(_){};window.rhRenderRecords()};const back=document.querySelector('.rhHofV1 .rhRecordsHeadV1 button');if(back)back.onclick=()=>{window.rhRecordsMode='records';try{rhRecordsMode='records'}catch(_){};window.rhRenderRecords();show('hall')}};

/* ---------- Standard Championship final reveal: per-round split times ---------- */
const baseChampComplete=window.rhChampionshipCompleteTransition;
function standardRun(r){return r&&r.status==='complete'&&!['groups-total-time','swiss'].includes(String(r.format||''))}
function addRoundBreakdown(r){const box=document.querySelector('#final-standings .rhFS28Rows');if(!box||!standardRun(r))return;const rounds=r.rounds||[],rows=(r.entries||[]).map(id=>{const rr=(r.results||[]).filter(x=>String(x.carId)===String(id));return rr.length===rounds.length?{id,total:rr.reduce((a,b)=>a+Number(b.time||0),0),rr}:null}).filter(Boolean).sort((a,b)=>a.total-b.total),leader=rows[0]?.total||0;box.innerHTML=rows.map((row,i)=>`<div class="rhFS28Row rh8051FinalRow"><span class="rhFS28Pos">${String(i+1).padStart(2,'0')}</span><span class="rhFS28Car">${E(carText(row.id))}</span><span class="rhFS28Time">${fmt(row.total)}</span><span class="rhFS28Gap">${i===0?'—':'+'+fmt(row.total-leader)}</span><div class="rh8051RoundBreakdown">${rounds.map((rd,j)=>{const x=row.rr.find(y=>String(y.roundId)===String(rd.id))||row.rr.find(y=>String(y.roundName)===String(rd.name));return `<span><small>${j+1}. ${E(rd.name)}</small><b>${x?fmt(x.time):'—'}</b></span>`}).join('')}</div></div>`).join('')}
if(typeof baseChampComplete==='function')window.rhChampionshipCompleteTransition=function(id,...args){const r=runById(id);baseChampComplete(id,...args);if(standardRun(r))setTimeout(()=>addRoundBreakdown(r),0)};

})();
