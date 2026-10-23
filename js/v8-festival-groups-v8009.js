/* OTG! V8.0.9 — Festival Total Time Groups — per-stage track setup */
(()=>{
const oldConfirm=window.rhConfirmStart, oldOpenRun=window.rhOpenRun, oldSaveResult=window.rhSaveResult, oldSaveResultFinal=window.rhSaveResultFinal;
const now=()=>new Date().toISOString();
function isGroupSetup(){return !!rhSetup?.v8GroupMode}
function isGroupRun(r){return r?.format==='groups-total-time'}
function groupEligible(setup){try{return rhEligible(setup.type,setup.value)}catch{return []}}
function fmt(v){return rhFmtTime(Number(v)||0)}
function newGroupRun(x){
 const eligible=groupEligible(x), selected=new Set(x.entries), excluded=eligible.filter(c=>!selected.has(c.id)).map(c=>c.id);
 return {id:rhId('run'),name:x.name,type:x.type,value:x.value,trophy:rhTrophyTypeKey(x.type),createdAt:now(),startedAt:now(),status:'active',format:'groups-total-time',rounds:rhClone(x.rounds),results:[],entries:[...x.entries],v8Groups:{stage:1,stage1Closed:false,excludedStage1:excluded,knownStage1Eligible:eligible.map(c=>c.id),pool:[...x.entries],qualifiers:[],completedGroups:[],activeGroup:null,final:false,championId:null}};
}
window.rhConfirmStart=function(){
 const x=rhSetup;if(!isGroupSetup())return oldConfirm();
 if(!x.entries.length||!x.rounds.length)return;
 const s=rhSpace();let run=newGroupRun(x);
 if(x.savedRunId){const i=s.runs.findIndex(r=>r.id===x.savedRunId);if(i>=0){run.id=s.runs[i].id;run.createdAt=s.runs[i].createdAt||run.createdAt;s.runs[i]=run}else s.runs.push(run)}else s.runs.push(run);
 rhSave();rhSetup=null;rhOpenRun(run.id);
};
function activePool(r){const g=r.v8Groups;if(g.stage===1&&!g.stage1Closed){const eligible=groupEligible(r),known=new Set(g.knownStage1Eligible||[]),excluded=new Set(g.excludedStage1||[]),used=new Set([...(g.completedGroups||[]).filter(x=>x.stage===1).flatMap(x=>x.carIds),...(g.activeGroup?.stage===1?g.activeGroup.carIds:[])]);for(const c of eligible){if(!known.has(c.id)){known.add(c.id);if(!excluded.has(c.id)&&!used.has(c.id)&&!g.pool.includes(c.id))g.pool.push(c.id)}}g.knownStage1Eligible=[...known]}
 return g.pool;
}
function drawSize(n){if(n<=10)return n;if(n<16)return Math.ceil(n/2);return 8}
window.rhV8DrawNextGroup=function(id){const r=rhCurrentRuns().find(x=>x.id===id);if(!isGroupRun(r))return;const g=r.v8Groups;if(g.activeGroup)return;const pool=activePool(r);if(!pool.length)return rhV8AdvanceStage(id);const size=drawSize(pool.length);const ids=[];while(ids.length<size&&pool.length){const i=Math.floor(Math.random()*pool.length);ids.push(pool.splice(i,1)[0])}if(g.stage===1&&pool.length===0)g.stage1Closed=true;g.activeGroup={id:rhId('group'),stage:g.stage,index:(g.completedGroups||[]).filter(x=>x.stage===g.stage).length+1,carIds:ids,startedAt:now()};rhSave();rhOpenRun(id)};
function groupResults(r,grp){
 // v8.0.5 recovery: v8.0.4's live Enter Result handler saved ordinary Festival
 // results without group metadata. Adopt only matching results in the currently
 // active group so an in-progress test/run continues instead of restarting.
 let changed=false;
 for(const x of (r.results||[])){
  if(x.v8GroupId||!grp?.carIds?.includes(x.carId))continue;
  if(!r.rounds.some(rd=>String(rd.id)===String(x.roundId)))continue;
  const already=(r.results||[]).some(y=>y!==x&&y.v8GroupId===grp.id&&String(y.carId)===String(x.carId)&&String(y.roundId)===String(x.roundId));
  if(!already){x.v8GroupId=grp.id;x.v8Stage=grp.stage;changed=true}
 }
 if(changed)rhSave();
 return (r.results||[]).filter(x=>x.v8GroupId===grp.id)
}
function groupComplete(r,grp){return groupResults(r,grp).length>=grp.carIds.length*r.rounds.length}
function standings(r,grp){return grp.carIds.map(id=>{const rr=groupResults(r,grp).filter(x=>x.carId===id);return {id,done:rr.length,total:rr.reduce((a,b)=>a+Number(b.time),0)}}).filter(x=>x.done===r.rounds.length).sort((a,b)=>a.total-b.total)}
function nextSlot(r,grp){const rr=groupResults(r,grp);for(const id of grp.carIds)for(const rd of r.rounds)if(!rr.some(x=>x.carId===id&&x.roundId===rd.id))return {carId:id,round:rd};return null}
function trackBoard(r,grp,rd){return groupResults(r,grp).filter(x=>x.roundId===rd.id).sort((a,b)=>a.time-b.time)}
function freshStageRounds(count=3){return Array.from({length:Math.max(1,count)},(_,i)=>({id:rhId('round'),name:`Round ${i+1}`,layout:''}))}
function stageSetupTitle(p){return p.final?'FINAL SETUP':`STAGE ${p.stage} SETUP`}
window.rhV8PrepareNextStage=function(id){
 const r=rhCurrentRuns().find(x=>x.id===id);if(!isGroupRun(r))return;
 const g=r.v8Groups;if(g.activeGroup)return;
 activePool(r);if(g.pool.length)return rhOpenRun(id);
 const qs=[...(g.qualifiers||[])];if(!qs.length)return rhOpenRun(id);
 if(!g.pendingStageSetup){g.pendingStageSetup={stage:g.stage+1,final:qs.length<=10,carIds:qs,rounds:freshStageRounds(3)};rhSave()}
 rhV8RenderStageSetup(id);
};
window.rhV8StageRoundName=function(runId,roundId,value){const r=rhCurrentRuns().find(x=>x.id===runId),p=r?.v8Groups?.pendingStageSetup,rd=p?.rounds?.find(x=>x.id===roundId);if(rd){rd.name=String(value||'').trim()||'Untitled Round';rhSave()}};
window.rhV8StageRoundLayout=function(runId,roundId,value){const r=rhCurrentRuns().find(x=>x.id===runId),p=r?.v8Groups?.pendingStageSetup,rd=p?.rounds?.find(x=>x.id===roundId);if(rd){rd.layout=String(value||'').trim();rhSave()}};
window.rhV8AddStageRound=function(runId){const r=rhCurrentRuns().find(x=>x.id===runId),p=r?.v8Groups?.pendingStageSetup;if(!p)return;p.rounds.push({id:rhId('round'),name:`Round ${p.rounds.length+1}`,layout:''});rhSave();rhV8RenderStageSetup(runId)};
window.rhV8RemoveStageRound=function(runId,roundId){const r=rhCurrentRuns().find(x=>x.id===runId),p=r?.v8Groups?.pendingStageSetup;if(!p||p.rounds.length<=1)return;p.rounds=p.rounds.filter(x=>x.id!==roundId);rhSave();rhV8RenderStageSetup(runId)};
window.rhV8ChooseSavedStageRound=function(runId,roundId){
 const names=rhSavedRoundNames();if(!names.length){toast('No saved race names yet');return}
 document.getElementById('rhRoundNamePicker')?.remove();
 document.body.insertAdjacentHTML('beforeend',`<div id="rhRoundNamePicker" class="rhOverlay" onclick="if(event.target===this)rhCloseRoundNamePicker()"><div class="rhModal rhRoundNamePickerModal"><button class="rhModalX" onclick="rhCloseRoundNamePicker()">×</button><small>SAVED RACE NAMES</small><h2>Choose a Race</h2><p>Select a previously used race name, or close this list and type a new one.</p><div class="rhRoundNamePickerList">${names.map(n=>`<button onclick="rhV8ApplySavedStageRound('${runId}','${roundId}',decodeURIComponent('${encodeURIComponent(n)}'))"><span>${esc(n)}</span><em>›</em></button>`).join('')}</div><button class="btn secondary" onclick="rhCloseRoundNamePicker()">TYPE A NEW NAME</button></div></div>`)
};
window.rhV8ApplySavedStageRound=function(runId,roundId,name){const r=rhCurrentRuns().find(x=>x.id===runId),p=r?.v8Groups?.pendingStageSetup,rd=p?.rounds?.find(x=>x.id===roundId);if(!rd)return;rd.name=String(name||'').trim()||rd.name;rhSave();rhCloseRoundNamePicker();rhV8RenderStageSetup(runId)};
window.rhV8RenderStageSetup=function(id){
 const r=rhCurrentRuns().find(x=>x.id===id),p=r?.v8Groups?.pendingStageSetup;if(!r||!p)return rhOpenRun(id);
 $('festival').innerHTML=`<div class="rhSetupV1 v8StageSetupPage"><header class="rhSetupHeroV1"><button class="rhSetupBackV1" onclick="rhRenderFestival()" aria-label="Back">‹</button><div class="rhSetupTitleV1"><small>TOTAL TIME GROUPS</small><h1>${stageSetupTitle(p)}</h1><p>Choose a fresh set of tracks before the qualified cars continue.</p></div><div class="rhSetupIdentityV1"><div><span>${p.final?'FINAL':'STAGE '+p.stage}</span><h2>${esc(r.name)}</h2><small>${p.carIds.length} QUALIFIED CARS • ENTRY LIST LOCKED</small></div></div><div class="rhSetupStatsV1"><div><b>${p.carIds.length}</b><span>QUALIFIED CARS</span></div><div><b>${p.rounds.length}</b><span>TRACKS CONFIGURED</span></div></div></header><main class="rhSetupBodyV1"><section class="rhSetupPanelV1 v8StageSetupIntro"><div class="rhSetupPanelHeadV1"><div><b>${p.final?'FINAL':'STAGE '+p.stage} TRACKS</b><p>These tracks apply only to ${p.final?'the Final':'Stage '+p.stage}. Previous stage results stay locked.</p></div><strong>RUN BY CAR</strong></div><div class="v8GroupRule"><b>GROUP RULES</b><span>${p.carIds.length} qualified cars • ${p.rounds.length} tracks • ${p.final?'Lowest total wins':'Top 2 per group advance'}</span><small>Use different tracks to test the cars across a fresh mix of circuits.</small></div></section><section class="rhSetupPanelV1 v8StageSetupRounds"><div class="rhSetupPanelHeadV1"><div><b>TRACK ORDER</b><p>Create the races/challenges for this stage.</p></div><strong>${p.rounds.length} ${p.rounds.length===1?'TRACK':'TRACKS'}</strong></div><div class="rhSetupRoundsV1">${p.rounds.map((rd,i)=>`<div class="rhSetupRoundWrapV1"><div class="rhSetupRoundV1"><i>≡</i><b>${i+1}</b><input value="${esc(rd.name)}" onchange="rhV8StageRoundName('${id}','${rd.id}',this.value)"><button onclick="rhV8RemoveStageRound('${id}','${rd.id}')" ${p.rounds.length<=1?'disabled':''} aria-label="Remove track">×</button></div><label class="rhRoundLayoutV6116"><span>LAYOUT (OPTIONAL)</span><input value="${esc(rd.layout||'')}" placeholder="e.g. Nordschleife" onchange="rhV8StageRoundLayout('${id}','${rd.id}',this.value)"></label><button type="button" class="rhSavedRaceButtonV1" onclick="rhV8ChooseSavedStageRound('${id}','${rd.id}')">▾ CHOOSE SAVED RACE NAME</button></div>`).join('')}</div><button class="rhSetupAddRoundV1" onclick="rhV8AddStageRound('${id}')">＋ ADD TRACK</button></section><div class="rhSetupActionsV1"><button class="rhSetupStartV1 rhSetupStartGreenV1 v8StageStartBtn" onclick="rhV8StartNextStage('${id}')">▶ <span><b>${p.final?'START FINAL':'START STAGE '+p.stage}</b><small>FREEZE THESE TRACKS AND BEGIN</small></span></button></div></main></div>`;
 window.scrollTo(0,0);
};
window.rhV8StartNextStage=function(id){
 const r=rhCurrentRuns().find(x=>x.id===id),g=r?.v8Groups,p=g?.pendingStageSetup;if(!r||!g||!p)return;
 const rounds=(p.rounds||[]).map((rd,i)=>({id:rd.id||rhId('round'),name:String(rd.name||'').trim()||`Round ${i+1}`,layout:String(rd.layout||'').trim()}));if(!rounds.length)return toast('Add at least one track');
 r.rounds=rounds;g.stage=p.stage;g.final=!!p.final;g.qualifiers=[];
 if(p.final){g.pool=[];g.activeGroup={id:rhId('group'),stage:g.stage,index:1,carIds:[...p.carIds],startedAt:now(),final:true}}else{g.pool=[...p.carIds];g.activeGroup=null}
 g.pendingStageSetup=null;rhSave();rhOpenRun(id)
};
window.rhV8AdvanceStage=function(id){return rhV8PrepareNextStage(id)};
window.rhV8FinishGroup=function(id){const r=rhCurrentRuns().find(x=>x.id===id);if(!isGroupRun(r))return;const g=r.v8Groups,grp=g.activeGroup;if(!grp||!groupComplete(r,grp))return;const st=standings(r,grp);grp.completedAt=now();grp.standings=st;grp.rounds=rhClone(r.rounds);g.completedGroups.push(grp);g.activeGroup=null;if(grp.final){r.status='complete';r.completedAt=now();g.championId=st[0]?.id||null;g.championTotal=Number(st[0]?.total)||0;r.winnerCarId=g.championId;r.winningTime=g.championTotal}else g.qualifiers.push(...st.slice(0,2).map(x=>x.id));rhSave();rhV8GroupReveal(id,grp.id)};
window.rhV8CompleteChampionship=function(id){
 const r=rhCurrentRuns().find(x=>String(x.id)===String(id));if(!isGroupRun(r)||r.status!=='complete')return rhRenderFestival();
 const g=r.v8Groups||{},finalGrp=[...(g.completedGroups||[])].reverse().find(x=>x.final),winner=finalGrp?.standings?.[0];
 if(winner){g.championId=winner.id;g.championTotal=Number(winner.total)||0;r.winnerCarId=winner.id;r.winningTime=Number(winner.total)||0}
 r.completedAt=r.completedAt||now();rhSave();
 rhRenderFestival();show('festival');window.scrollTo(0,0);
};
window.rhV8GroupReveal=function(id,groupId){const r=rhCurrentRuns().find(x=>x.id===id),grp=r?.v8Groups?.completedGroups?.find(x=>x.id===groupId);if(!r||!grp)return;const st=grp.standings||standings(r,grp);$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><header class="rhOverviewHeroV1"><div class="rhOverviewBrandV1"><small>${grp.final?'FINAL':'STAGE '+grp.stage+' • GROUP '+grp.index}</small><h1>${grp.final?'FINAL STANDINGS':'GROUP STANDINGS'}</h1><span>${esc(r.name)}</span></div></header><main class="rhOverviewBodyV1"><section class="v8Reveal"><div class="v8GroupIdentity">${grp.final?'FINAL':'STAGE '+grp.stage+' • GROUP '+grp.index}</div><div class="v8RevealTitle"><small>${grp.final?'CHAMPIONSHIP COMPLETE':'GROUP COMPLETE'}</small><h2>${grp.final?'CHAMPION DECIDED':'TOP 2 ADVANCE'}</h2></div>${st.map((x,i)=>`<div class="v8Standing ${!grp.final&&i===1?'qualLine':''} ${i<2&&!grp.final?'qualified':''}"><b>${i+1}</b><span>${esc(carName(carById(x.id)))}</span><strong>${fmt(x.total)}</strong>${!grp.final&&i<2?'<em>QUALIFIED</em>':''}${grp.final&&i===0?'<em>CHAMPION</em>':''}</div>`).join('')}<button class="btn" onclick="${grp.final?`rhV8CompleteChampionship('${id}')`:`rhOpenRun('${id}')`}">${grp.final?'CHAMPIONSHIP COMPLETE':'CONTINUE CHAMPIONSHIP'}</button></section></main></div>`};
function renderGroups(r){const g=r.v8Groups,grp=g.activeGroup,pool=activePool(r);if(r.status==='complete'){const last=[...(g.completedGroups||[])].reverse().find(x=>x.final)||g.completedGroups.at(-1);return rhV8GroupReveal(r.id,last?.id)}if(g.pendingStageSetup)return rhV8RenderStageSetup(r.id);if(!grp){const done=(g.completedGroups||[]).filter(x=>x.stage===g.stage).length;const q=g.qualifiers.length;const stageDone=!pool.length&&q>0,nextFinal=q<=10;$('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><header class="rhOverviewHeroV1"><button class="rhOverviewBackV1" onclick="rhRenderFestival()">‹</button><div class="rhOverviewBrandV1"><small>TOTAL TIME GROUPS</small><h1>${esc(r.name)}</h1><span>STAGE ${g.stage}</span></div></header><main class="rhOverviewBodyV1"><section class="v8StageCard"><small>STAGE ${g.stage}</small><h2>${g.final?'FINAL READY':'NEXT GROUP READY'}</h2><div class="v8StageStats"><div><b>${done}</b><span>GROUPS COMPLETE</span></div><div><b>${q}</b><span>QUALIFIERS</span></div><div><b>${pool.length}</b><span>${g.stage===1&&!g.stage1Closed?'CARS IN LIVE DRAW':'CARS TO DRAW'}</span></div></div>${g.stage===1&&!g.stage1Closed?'<p>New eligible Garage cars can still join this Stage 1 draw. Entries close when the final Stage 1 group is drawn.</p>':''}${stageDone?`<p class="v8StageTransitionNote">Stage ${g.stage} is complete. Choose a fresh set of tracks before ${nextFinal?'the Final':'Stage '+(g.stage+1)} begins.</p><button class="btn" onclick="rhV8PrepareNextStage('${r.id}')">${nextFinal?'SET UP FINAL':'SET UP STAGE '+(g.stage+1)}</button>`:`<button class="btn" onclick="rhV8DrawNextGroup('${r.id}')">DRAW NEXT GROUP</button>`}</section></main></div>`;return}
 const next=nextSlot(r,grp),rr=groupResults(r,grp),car=next?carById(next.carId):null,carIdx=next?grp.carIds.indexOf(next.carId):-1; $('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><header class="rhOverviewHeroV1"><button class="rhOverviewBackV1" onclick="rhRenderFestival()">‹</button><div class="rhOverviewBrandV1"><small>${grp.final?'FINAL':'STAGE '+grp.stage+' • GROUP '+grp.index}</small><h1>${esc(r.name)}</h1><span>${grp.carIds.length} CARS • ${r.rounds.length} TRACKS • ${grp.final?'LOWEST TOTAL WINS':'TOP 2 ADVANCE'}</span></div></header><main class="rhOverviewBodyV1"><div class="v8GroupTopRow"><button class="v8GroupVisibleBack" onclick="rhRenderFestival()">‹ BACK</button><div class="v8GroupIdentity">${grp.final?'FINAL':'STAGE '+grp.stage+' • GROUP '+grp.index}</div></div>${next?`<section class="rhCurrentCarV1"><div class="rhCurrentCarHeadV1"><div><small>CURRENT CAR</small><h2>${esc(carName(car))}</h2></div><strong>${carIdx+1} OF ${grp.carIds.length}</strong></div><div class="rhCurrentCarMetaV1"><div><span>NEXT TRACK</span><b>${esc(next.round.name)}</b></div><div><span>CAR PROGRESS</span><b>${rr.filter(x=>x.carId===next.carId).length} OF ${r.rounds.length}</b></div></div><button class="rhContinueV1" onclick="rhEnterResult('${r.id}','${next.carId}','${next.round.id}')"><span>▶</span><div><b>CONTINUE</b><small>${esc(next.round.name).toUpperCase()}</small></div></button></section>`:''}<section class="v8TrackBoards"><h2>TRACK LEADERBOARDS</h2>${r.rounds.map(rd=>{const b=trackBoard(r,grp,rd);return `<details ${next?.round.id===rd.id?'open':''}><summary>${esc(rd.name)} <span>${b.length}/${grp.carIds.length}</span></summary>${b.length?b.map((x,i)=>`<div><b>${i+1}</b><span>${esc(carName(carById(x.carId)))}</span><strong>${fmt(x.time)}</strong></div>`).join(''):'<p>No times yet.</p>'}</details>`}).join('')}</section><section class="rhLineupV1"><div class="rhOverviewSectionHeadV1"><div><small>${grp.final?'FINAL':'CURRENT GROUP'}</small><h2>RUN ORDER</h2></div></div><div class="rhQueueWindowV1">${grp.carIds.map((id,i)=>{const d=rr.filter(x=>x.carId===id).length;return `<div class="rhLineupRowV1 ${next?.carId===id?'current':''} ${d===r.rounds.length?'complete':''}"><i>${i+1}</i><div><b>${esc(carName(carById(id)))}</b><small>${d} / ${r.rounds.length} tracks complete</small></div><strong>${d===r.rounds.length?'COMPLETE':next?.carId===id?'NEXT':'WAITING'}</strong></div>`}).join('')}</div></section><section class="rhAbandonZoneV6150 v8GroupAbandon"><small>DANGER ZONE</small><button type="button" onclick="rhAskAbandonV6150('championship','${r.id}')"><span>⚠</span><div><b>ABANDON CHAMPIONSHIP</b><em>Permanently close this active championship</em></div><strong>›</strong></button></section></main></div>`}
window.rhOpenRun=function(id){const r=rhCurrentRuns().find(x=>x.id===id);if(isGroupRun(r))return renderGroups(r);return oldOpenRun(id)};
window.rhSaveResult=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>String(x.id)===String(runId));
 if(!isGroupRun(r))return oldSaveResult(runId,carId,roundId);
 // Legacy/simple result form fallback. The live V7/V8 UI uses rhSaveResultFinal.
 const grp=r.v8Groups.activeGroup,v=rhParseTime($('rhTime')?.value),pos=Number($('rhPos')?.value)||null;
 if(!grp||!isFinite(v)||v<=0){toast('Enter a valid time');return}
 return saveGroupResult(r,grp,carId,roundId,v,pos)
};
function saveGroupResult(r,grp,carId,roundId,v,pos){
 const rd=r.rounds.find(q=>String(q.id)===String(roundId));
 if(!rd||!grp.carIds.some(id=>String(id)===String(carId)))return;
 if(groupResults(r,grp).some(x=>String(x.carId)===String(carId)&&String(x.roundId)===String(roundId))){toast('Result already saved');return rhOpenRun(r.id)}
 const priorAll=rhCurrentRuns().flatMap(x=>x.results||[]).filter(x=>x.roundName===rd.name),runPrior=(r.results||[]).filter(x=>String(x.roundId)===String(roundId));
 const championshipRecord=!runPrior.length||v<Math.min(...runPrior.map(x=>x.time)),allTime=!priorAll.length||v<Math.min(...priorAll.map(x=>x.time));
 const res={id:rhId('result'),carId,roundId,roundName:rd.name,time:v,position:pos,date:now(),championshipRecord,allTime,v8GroupId:grp.id,v8Stage:grp.stage};
 r.results.push(res);rhSave();
 const complete=groupComplete(r,grp);
 const c=carById(carId),board=trackBoard(r,grp,rd),next=nextSlot(r,grp),hasRecord=!!(res.championshipRecord||res.allTime);
 const continueAction=hasRecord?`rhV8GroupRecord('${r.id}','${res.id}')`:(complete?`rhV8FinishGroup('${r.id}')`:`rhOpenRun('${r.id}')`);
 const continueLabel=hasRecord?'VIEW NEW RECORD':complete?'COMPLETE GROUP':(next?.carId===carId?'NEXT TRACK':'NEXT CAR');
 $('festival').innerHTML=`<div class="rhOverviewV1 v8GroupPage"><main class="rhOverviewBodyV1"><div class="v8GroupTopRow"><button class="v8GroupVisibleBack" onclick="rhOpenRun('${r.id}')">‹ BACK</button><div class="v8GroupIdentity">${grp.final?'FINAL':'STAGE '+grp.stage+' • GROUP '+grp.index}</div></div><section class="v8TrackResult"><small>RESULT SAVED • ${esc(rd.name)}</small><h2>${esc(carName(c))}</h2><strong>${fmt(v)}</strong>${hasRecord?`<div class="v8RecordNotice">${res.championshipRecord?'<b>★ NEW CHAMPIONSHIP RECORD</b>':''}${res.allTime?'<b>★ NEW ALL-TIME OTG! RECORD</b>':''}</div>`:''}<div class="v8MiniBoard"><small>${esc(rd.name)} LEADERBOARD</small>${board.map((x,i)=>`<div><b>${i+1}</b><span>${esc(carName(carById(x.carId)))}</span><strong>${fmt(x.time)}</strong></div>`).join('')}</div><button class="btn" onclick="${continueAction}">${continueLabel}</button></section></main></div>`;
}
function priorBestForGroup(r,res,scope){
 const pool=scope==='local'?(r.results||[]):rhCurrentRuns().flatMap(x=>x.results||[]);
 const prior=pool.filter(x=>String(x.id)!==String(res.id)&&!x.advancedTiming&&String(x.roundName)===String(res.roundName)&&Number(x.time)>0);
 return prior.length?Math.min(...prior.map(x=>Number(x.time))):null;
}
function segRecordTime(value){
 const DIG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
 const digit=ch=>`<i class="rhSegDigit" aria-hidden="true">${'abcdefg'.split('').map(x=>`<span class="s${x} ${(DIG[ch]||'').includes(x)?'on':''}"></span>`).join('')}</i>`;
 const t=fmt(value),m=t.slice(0,2),sec=t.slice(3,5),ms=t.slice(6),part=v=>v.split('').map(digit).join('');
 return `<span class="rhSegTime rhRecordGoldSeg" aria-label="${t}">${part(m)}<em>:</em>${part(sec)}<em>.</em>${part(ms)}</span>`;
}
window.rhV8GroupRecord=function(runId,resultId){
 const r=rhCurrentRuns().find(x=>String(x.id)===String(runId)),res=r?.results?.find(x=>String(x.id)===String(resultId)),grp=r?.v8Groups?.activeGroup;
 if(!r||!res||!grp)return r?rhOpenRun(r.id):rhRenderFestival();
 const localPrev=priorBestForGroup(r,res,'local'),allPrev=priorBestForGroup(r,res,'all'),previous=res.allTime?allPrev:localPrev,improvement=previous!=null?Math.max(0,previous-Number(res.time||0)):null;
 const complete=groupComplete(r,grp);
 $('festival').innerHTML=`<div class="rhRecord127Page"><div class="rhRecord127Hero"><img src="assets/final/record-celebration-hero-v6127.png?v=6127" alt="OTG! record celebration"><button class="rhRecord127Back" id="v8GroupRecordBack" aria-label="Back"></button>${!res.allTime?'<span class="rhRecord127HideGold"></span>':''}</div><main class="rhRecord127Main"><section class="rhRecord127Best"><b>YOUR NEW BEST TIME</b><div>${segRecordTime(res.time)}</div></section>${previous!=null?`<section class="rhRecord127Stat previous"><span class="rhRecord127Icon">◷</span><div><small>PREVIOUS BEST</small><b>${fmt(previous)}</b></div></section><section class="rhRecord127Stat improvement"><span class="rhRecord127Icon">↗</span><div><small>IMPROVEMENT</small><b>−${fmt(improvement)}</b></div></section>`:''}</main><footer class="rhRecord127Actions"><button id="v8GroupRecordBoard"><span>🏁</span><b>TRACK<br>LEADERBOARD</b></button><button id="v8GroupRecordContinue"><span>▶</span><b>${complete?'COMPLETE GROUP':'CONTINUE GROUP'}</b></button></footer></div>`;
 const back=()=>rhOpenRun(r.id),cont=()=>complete?rhV8FinishGroup(r.id):rhOpenRun(r.id);
 document.getElementById('v8GroupRecordBack')?.addEventListener('click',back);document.getElementById('v8GroupRecordBoard')?.addEventListener('click',back);document.getElementById('v8GroupRecordContinue')?.addEventListener('click',cont);window.scrollTo(0,0);
};
window.rhSaveResultFinal=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>String(x.id)===String(runId));
 if(!isGroupRun(r))return oldSaveResultFinal(runId,carId,roundId);
 const grp=r.v8Groups?.activeGroup;if(!grp)return rhOpenRun(runId);
 const q=id=>document.getElementById(id),m=Number(q('rhMin')?.value||0),s=Number(q('rhSec')?.value||0),ms=Number((q('rhMs')?.value||'0').padEnd(3,'0')),v=m*60+s+ms/1000,pos=Number(q('rhPosition')?.value)||null;
 if(!Number.isFinite(v)||v<=0||s>59||ms>999)return toast('Enter a valid race time');
 if(!pos||pos<1)return toast('Enter a valid finishing position');
 return saveGroupResult(r,grp,carId,roundId,v,pos)
};
})();
