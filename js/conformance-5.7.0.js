
/* OTG! v5.7.0 — Studio Final Conformance Candidate
   Presentation/state restoration layer over protected v5.6.13 logic. */
(()=>{
const q=id=>document.getElementById(id);
const safe=s=>esc(String(s??''));
const resultScreen=(host,title,subtitle,body)=>{host.innerHTML=`<div class="rhScene rhChampScene">${rhHeader(title,subtitle,'festival','festival')}</div><div class="rhContent rhConformance">${body}</div>`};

window.rhConfirm=function({title,copy,detail='',safeguard='',confirmLabel='CONFIRM',cancelLabel='CANCEL',danger=false,severity='',onConfirm=''}) {
  q('rhConfirmOverlay')?.remove();
  const sev=severity||(danger?'destructive':'cyan');
  document.body.insertAdjacentHTML('beforeend',`<div id="rhConfirmOverlay" class="rhOverlay"><div class="rhModal rhConfirmModal rhConfirmFinal ${sev}">
    <button class="rhModalX" onclick="$('rhConfirmOverlay').remove()">×</button><div class="rhConfirmIcon">${sev==='destructive'?'!':sev==='purple'?'★':sev==='caution'?'!':'↻'}</div>
    <h2>${safe(title)}</h2><p>${safe(copy)}</p>${detail?`<div class="rhConfirmDetail">${safe(detail)}</div>`:''}${safeguard?`<div class="rhSafeguard">◇ ${safe(safeguard)}</div>`:''}
    <div class="rhModalActions"><button class="btn secondary" onclick="$('rhConfirmOverlay').remove()">${safe(cancelLabel)}</button><button class="btn ${danger?'dangerBtn':''}" onclick="$('rhConfirmOverlay').remove();${onConfirm}">${safe(confirmLabel)}</button></div>
  </div></div>`);
};

window.rhEmpty=function(title,copy,action='',fn=''){
 const purple=/HALL OF FAME/i.test(title);
 return `<div class="rhEmpty rhEmptyFinal ${purple?'purple':''}"><div class="rhEmptyMark">${purple?'☆':'◇'}</div><h2>${safe(title)}</h2><div class="rhEmptyLine"></div><p>${safe(copy)}</p>${action?`<button class="btn" onclick="${fn}">${safe(action)}</button>`:''}</div>`;
};

window.rhEnterResult=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>x.id===runId),c=carById(carId),rd=r?.rounds.find(x=>x.id===roundId); if(!r||!c||!rd)return;
 resultScreen(q('festival'),'ENTER RESULT',rd.name,`<section class="rhResultEntry rhGlassHero"><div class="rhEyebrow">${safe(r.name)}</div><h2>${safe(rd.name)}</h2><div class="rhResultCar"><small>YOUR CAR</small><b>${safe(carName(c))}</b></div>
 <label>TOTAL RACE TIME</label><div class="rhTimeEntry rhTimeEntryLarge"><input id="rhMin" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhSec',2)"><span>:</span><input id="rhSec" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhMs',2)"><span>.</span><input id="rhMs" inputmode="numeric" maxlength="3" placeholder="000"></div>
 <label>FINISHING POSITION</label><div class="rhPositionGrid">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button type="button" onclick="document.querySelectorAll('.rhPositionGrid button').forEach(b=>b.classList.remove('selected'));this.classList.add('selected');this.parentElement.dataset.pos='${n}'">${n}</button>`).join('')}</div>
 <button class="btn rhPrimaryWide" onclick="rhSaveResultFinal('${runId}','${carId}','${roundId}')">SAVE RESULT</button></section>`);
 setTimeout(()=>q('rhMin')?.focus(),50);
};
window.rhSaveResultFinal=function(runId,carId,roundId){
 const r=rhCurrentRuns().find(x=>x.id===runId); if(!r)return;
 const m=Number(q('rhMin')?.value||0),s=Number(q('rhSec')?.value||0),ms=Number((q('rhMs')?.value||'0').padEnd(3,'0'));
 const v=m*60+s+ms/1000,pos=Number(document.querySelector('.rhPositionGrid')?.dataset.pos)||null;
 if(!isFinite(v)||v<=0||s>59||ms>999)return toast('Enter a valid race time');
 const rd=r.rounds.find(x=>x.id===roundId), priorAll=rhCurrentRuns().flatMap(x=>x.results||[]).filter(x=>x.roundName===rd?.name),runPrior=r.results.filter(x=>x.roundId===roundId);
 const championshipRecord=!!runPrior.length&&v<Math.min(...runPrior.map(x=>x.time)),allTime=!!priorAll.length&&v<Math.min(...priorAll.map(x=>x.time));
 const res={id:rhId('result'),carId,roundId,roundName:rd.name,time:v,position:pos,date:new Date().toISOString(),championshipRecord,allTime};
 r.results.push(res); if(!rhNextSlot(r)){r.status='complete';r.completedAt=new Date().toISOString()} rhSave(); rhResultAccepted(r,res,'festival');
};
window.rhResultAccepted=function(owner,res,kind='festival'){
 const host=q(kind==='events'?'event':'festival'); if(!host)return;
 host.innerHTML=`<div class="rhAccepted"><div class="rhAcceptedTick">✓</div><h1>RESULT ACCEPTED</h1><p>Your result has been recorded.</p></div>`;
 setTimeout(()=>kind==='events'?rhEventResultSummary(owner,res):rhResultSummary(owner,res),650);
};
window.rhResultSummary=function(r,res){
 const c=carById(res.carId),p=rhRunProgress(r),records=res.championshipRecord||res.allTime;
 resultScreen(q('festival'),'RESULTS SUMMARY',res.roundName,`<section class="rhResultsSummary">
 <div class="rhAcceptedMini"><span>✓</span><b>RESULT ACCEPTED</b><small>Great driving!</small></div>
 <div class="rhSummaryCard"><small>EVENT</small><b>${safe(res.roundName)}</b><span>${safe(r.name)}</span></div>
 <div class="rhSummaryCard"><small>CAR</small><b>${safe(carName(c))}</b></div>
 <div class="rhResultHero"><div><small>FINISHING POSITION</small><strong>${res.position?safe(res.position):'—'}</strong></div><div><small>TOTAL RACE TIME</small><strong>${rhFmtTime(res.time)}</strong></div></div>
 ${records?`<div class="rhRecordCelebration"><div class="rhRosettes">${res.championshipRecord?'<b>✹ CHAMPIONSHIP RECORD</b>':''}${res.allTime?'<b class="gold">✹ ALL-TIME OTG! RECORD</b>':''}</div><img src="assets/final/hubs.png" alt="Hubs"><p>Incredible driving,<br><b>well done!</b></p></div>`:''}
 <div class="rhProgressCard"><small>CHAMPIONSHIP PROGRESS</small><b>${safe(r.name)}</b><span>${p.done} of ${p.total} results completed • ${p.pct}%</span><div class="progress"><div class="bar" style="width:${p.pct}%"></div></div></div>
 <button class="btn rhPrimaryWide" onclick="rhOpenRun('${r.id}')">${r.status==='complete'?'FINAL LEADERBOARD':'NEXT RACE'}</button></section>`);
};

window.rhEventResult=function(id){
 const e=rhSpace().customEvents.find(x=>x.id===id);if(!e||e.status!=='active')return;const next=rhEventNextPair(e);
 if(!next){e.status='complete';e.completedAt=new Date().toISOString();rhSave();return rhOpenEvent(id)}
 q('rhEventResultEditor')?.remove();show('event');
 resultScreen(q('event'),'ENTER RESULT',next.round.name,`<section class="rhResultEntry rhGlassHero"><div class="rhEyebrow">${safe(e.name)}</div><h2>${safe(next.round.name)}</h2><div class="rhResultCar"><small>YOUR CAR</small><b>${safe(carName(next.car))}</b></div>
 <label>TOTAL RACE TIME</label><div class="rhTimeEntry rhTimeEntryLarge"><input id="rhEventMin" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhEventSec',2)"><span>:</span><input id="rhEventSec" inputmode="numeric" maxlength="2" placeholder="00" oninput="rhTimeAutoAdvance(this,'rhEventMs',2)"><span>.</span><input id="rhEventMs" inputmode="numeric" maxlength="3" placeholder="000"></div>
 <label>FINISHING POSITION</label><div class="rhPositionGrid" id="rhEventPos">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button onclick="document.querySelectorAll('#rhEventPos button').forEach(b=>b.classList.remove('selected'));this.classList.add('selected');this.parentElement.dataset.pos='${n}'">${n}</button>`).join('')}</div>
 <button class="btn rhPrimaryWide" onclick="rhSaveEventResultFinal('${id}','${next.car.id}','${next.round.id}')">SAVE RESULT</button></section>`);
};
window.rhSaveEventResultFinal=function(id,carId,roundId){
 const e=rhSpace().customEvents.find(x=>x.id===id),car=rhEventCars(e).find(c=>c.id===carId),round=rhEventRounds(e).find(r=>r.id===roundId);if(!e||!car||!round)return;
 const m=Number(q('rhEventMin')?.value||0),s=Number(q('rhEventSec')?.value||0),ms=Number((q('rhEventMs')?.value||'0').padEnd(3,'0')),v=m*60+s+ms/1000,pos=Number(q('rhEventPos')?.dataset.pos)||null;
 if(v<=0||s>59||ms>999)return toast('Enter a valid race time');
 const prior=(e.results||[]).filter(x=>x.roundId===roundId),championshipRecord=!!prior.length&&v<Math.min(...prior.map(x=>x.time));
 const allPrior=rhSpace().customEvents.flatMap(x=>x.results||[]).filter(x=>x.roundName===round.name),allTime=!!allPrior.length&&v<Math.min(...allPrior.map(x=>x.time));
 const res={id:rhId('result'),carId,roundId,roundName:round.name,time:v,position:pos,date:new Date().toISOString(),championshipRecord,allTime};e.results.push(res);
 if(!rhEventNextPair(e)){e.status='complete';e.completedAt=new Date().toISOString()}rhSave();rhResultAccepted(e,res,'events');
};
window.rhEventResultSummary=function(e,res){
 const car=rhEventCars(e).find(c=>c.id===res.carId),next=rhEventNextPair(e),records=res.championshipRecord||res.allTime;show('event');
 resultScreen(q('event'),'RESULTS SUMMARY',res.roundName,`<section class="rhResultsSummary"><div class="rhAcceptedMini"><span>✓</span><b>RESULT ACCEPTED</b><small>Great driving!</small></div>
 <div class="rhSummaryCard"><small>EVENT</small><b>${safe(res.roundName)}</b><span>${safe(e.name)}</span></div><div class="rhSummaryCard"><small>CAR</small><b>${safe(carName(car))}</b></div>
 <div class="rhResultHero"><div><small>FINISHING POSITION</small><strong>${res.position||'—'}</strong></div><div><small>TOTAL RACE TIME</small><strong>${rhFmtTime(res.time)}</strong></div></div>
 ${records?`<div class="rhRecordCelebration"><div class="rhRosettes">${res.championshipRecord?'<b>✹ EVENT RECORD</b>':''}${res.allTime?'<b class="gold">✹ ALL-TIME OTG! RECORD</b>':''}</div><img src="assets/final/hubs.png"><p>Incredible driving,<br><b>well done!</b></p></div>`:''}
 <button class="btn rhPrimaryWide" onclick="${e.status==='complete'?`rhOpenEvent('${e.id}')`:`rhEventResult('${e.id}')`}">${e.status==='complete'?'FINAL LEADERBOARD':'NEXT RACE'}</button></section>`);
};

window.rhOpenQueue=function(id){
 const r=rhCurrentRuns().find(x=>x.id===id);if(!r)return;show('festival');const next=rhNextSlot(r),remaining=[...new Set(r.entries.filter(cid=>!r.results.some(x=>x.carId===cid&&r.rounds.every(rd=>r.results.some(z=>z.carId===cid&&z.roundId===rd.id)))) )];
 resultScreen(q('festival'),'CAR QUEUE',r.name,`<section class="rhQueue"><div class="rhQueueNext"><small>NEXT CAR</small><b>${next?safe(carName(carById(next.carId))):'—'}</b><span>${next?safe(next.round.name):'Championship complete'}</span></div>
 <div class="rhQueueActions"><button class="btn" onclick="rhShuffleQueue('${r.id}');rhOpenQueue('${r.id}')">SHUFFLE QUEUE</button><button class="btn secondary" onclick="rhRandomQueue('${r.id}')">RANDOM PICK</button></div>
 <h2>QUEUE ORDER</h2>${r.entries.map((cid,i)=>`<div class="rhQueueRow"><span>${i+1}</span><b>${safe(carName(carById(cid)))}</b><button onclick="rhRemoveQueueCar('${r.id}','${cid}')">REMOVE</button></div>`).join('')}
 <p class="small">Only cars from this Championship's frozen eligible pool can appear here.</p>${next?`<button class="btn rhPrimaryWide" onclick="rhEnterResult('${r.id}','${next.carId}','${next.round.id}')">START NEXT CAR</button>`:''}<button class="btn secondary rhPrimaryWide" onclick="rhOpenRun('${r.id}')">DONE</button></section>`);
};
window.rhRandomQueue=function(id){const r=rhCurrentRuns().find(x=>x.id===id);if(!r)return;const slot=rhNextSlot(r);if(!slot)return;const pending=r.entries.filter(cid=>!r.results.some(x=>x.carId===cid&&x.roundId===slot.round.id));if(!pending.length)return;const pick=pending[Math.floor(Math.random()*pending.length)],idx=r.entries.indexOf(pick);r.entries.splice(idx,1);r.entries.unshift(pick);rhSave();rhOpenQueue(id)};
window.rhRemoveQueueCar=function(id,cid){const r=rhCurrentRuns().find(x=>x.id===id);if(!r)return;rhConfirm({title:'REMOVE THIS CAR?',copy:'Remove this car from the remaining queue for this Championship run?',detail:carName(carById(cid)),safeguard:'Recorded results are not deleted.',confirmLabel:'REMOVE',severity:'caution',onConfirm:`rhRemoveQueueCarFinal('${id}','${cid}')`})};
window.rhRemoveQueueCarFinal=function(id,cid){const r=rhCurrentRuns().find(x=>x.id===id);if(!r)return;r.entries=r.entries.filter(x=>x!==cid);rhSave();rhOpenQueue(id)};

const oldOpenRun=window.rhOpenRun;
window.rhOpenRun=function(id){oldOpenRun(id);setTimeout(()=>{const btn=[...document.querySelectorAll('#festival button')].find(b=>/Shuffle Queue/i.test(b.textContent));if(btn){btn.textContent='CAR QUEUE';btn.setAttribute('onclick',`rhOpenQueue('${id}')`) }},0)};

window.rhDataBackups=function(){
 const s=rhSpace(),bs=(s.backups||[]).slice().reverse();show('more');q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('DATA / BACKUPS','Protect your OTG! data','settings','more')}</div><div class="rhContent rhConformance"><div class="rhDataActions"><button class="btn" onclick="rhBackupFinal()">CREATE BACKUP<small>Save current data</small></button></div><h2 class="rhSectionTitle">SAVED BACKUPS</h2>${bs.length?bs.map((b,i)=>`<section class="rhBackupCard"><div><small>${i===0?'MOST RECENT':''}</small><h2>${safe(b.spaceName)}</h2><p>${new Date(b.date).toLocaleString('en-GB')}</p><div class="rhBackupCounts"><span>${b.counts.cars}<small>Cars</small></span><span>${b.counts.championships}<small>Championships</small></span><span>${b.counts.results}<small>Results</small></span></div></div><button class="btn" onclick="rhRestoreDetail('${b.id}')">RESTORE</button></section>`).join(''):rhEmpty('NO SAVED BACKUPS','Create a backup to protect your OTG! data.','CREATE BACKUP','rhBackupFinal()')}</div>`;
};
window.rhBackupFinal=function(){const s=rhSpace(),b={id:rhId('backup'),spaceName:s.name,date:new Date().toISOString(),counts:{cars:s.cars.length,championships:s.runs.length,results:s.runs.flatMap(r=>r.results||[]).length},data:rhClone({cars:s.cars,favouriteManufacturer:s.favouriteManufacturer,runs:s.runs,customEvents:s.customEvents})};s.backups=s.backups||[];s.backups.push(b);rhSave();toast('Backup created');rhDataBackups()};
window.rhBackup=window.rhBackupFinal;
window.rhRestoreList=window.rhDataBackups;
window.rhRestoreDetail=function(id){const s=rhSpace(),b=(s.backups||[]).find(x=>x.id===id);if(!b)return;show('more');q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('RESTORE BACKUP','Current Space only','settings','more')}</div><div class="rhContent rhConformance"><section class="rhRestoreCard"><h2>${safe(b.spaceName)}</h2><p>${new Date(b.date).toLocaleString('en-GB')}</p><div class="rhBackupCounts"><span>${b.counts.cars}<small>Cars</small></span><span>${b.counts.championships}<small>Championships</small></span><span>${b.counts.results}<small>Results</small></span></div></section><section class="rhWarning"><h2>IMPORTANT</h2><p>Restoring this backup will replace the current data in <b>${safe(s.name)}</b>.</p><b>This cannot be undone.</b><p>Your other OTG! Spaces are not affected.</p></section><div class="rhModalActions"><button class="btn secondary" onclick="rhDataBackups()">CANCEL</button><button class="btn dangerBtn" onclick="rhRestoreConfirmFinal('${id}')">RESTORE BACKUP</button></div></div>`};
window.rhRestoreConfirmFinal=function(id){const b=(rhSpace().backups||[]).find(x=>x.id===id);if(!b)return;rhConfirm({title:'RESTORE THIS BACKUP?',copy:'This will replace all data in the current OTG! Space with the selected backup.',detail:`${b.spaceName} • ${b.counts.cars} Cars • ${b.counts.championships} Championships • ${b.counts.results} Results`,safeguard:'Your other OTG! Spaces will not be affected.',confirmLabel:'RESTORE',severity:'cyan',onConfirm:`rhRestoreFinal('${id}')`})};
window.rhRestoreFinal=function(id){const s=rhSpace(),b=(s.backups||[]).find(x=>x.id===id);if(!b)return;Object.assign(s,rhClone(b.data));s.backups=s.backups||[];rhSave();toast('Backup restored');rhRenderSettings()};

window.rhAbout=function(){const s=rhSpace();show('more');q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('ABOUT OUT THE GARAGE!','DRIVE • RECORD • IMPROVE','settings','more')}</div><div class="rhContent rhConformance"><section class="rhAboutIntro"><h1>ABOUT OUT THE GARAGE!</h1><h3>DRIVE • RECORD • IMPROVE</h3><p>Out The Garage! is your personal racing record book — built to organise your Garage, create Championships, record results and preserve your racing history your way.</p><p>Whether you race for fun, for competition, or just for the love of driving, Out The Garage! keeps your racing history safe.</p></section><section class="rhSection"><h2>OTG! INFORMATION</h2><div class="rhInfoRow"><span>App Version</span><b>v5.7.0</b></div><div class="rhInfoRow"><span>Data / Backup Version</span><b>v1.0.0</b></div><div class="rhInfoRow"><span>Current OTG! Space</span><b>${safe(s.name)}</b></div><div class="rhInfoRow"><span>Driver Profile (Global)</span><b>${safe(state.driverName||'Driver')}</b></div></section><section class="rhSection"><h2>CREATED BY</h2><p>Andy Jones & ChatGPT</p><p class="small">Designed together from the ground up to make racing data personal, useful and enjoyable.</p></section><section class="rhSection"><h2>LEGAL</h2><p>© 2026 OTG!. All rights reserved.</p><p class="small">OTG! is an independent product and is not affiliated with or endorsed by any vehicle manufacturer.</p></section></div>`};

window.rhManageSpaces=function(){const s=rhSpace();show('more');q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('OTG! SPACES','Manage your racing spaces','settings','more')}</div><div class="rhContent rhConformance">${state.spaces.map(x=>`<section class="rhSpaceManage ${x.id===s.id?'active':''}"><div><b>${safe(x.name)}</b><small>${x.cars.length} cars • ${(x.runs||[]).length} Championships ${x.id===s.id?'• CURRENT':''}</small></div><div><button class="btn secondary" onclick="rhRenameSpacePrompt('${x.id}')">RENAME</button>${state.spaces.length>1?`<button class="btn dangerBtn" onclick="rhDeleteSpaceConfirm('${x.id}')">DELETE</button>`:''}</div></section>`).join('')}<button class="btn rhPrimaryWide" onclick="rhCreateSpaceFinal()">CREATE NEW SPACE</button><p class="small">Play more than one racing game? Create a separate OTG! for each one. Each OTG! keeps its own Garage, Championships, Records, Hall of Fame and Stats separate.</p></div>`};
window.rhCreateSpace=function(){rhCreateSpaceFinal()};
window.rhCreateSpaceFinal=function(){q('rhSpaceCreate')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhSpaceCreate" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="$('rhSpaceCreate').remove()">×</button><h2>CREATE OTG! SPACE</h2><label>OTG! Name</label><input id="rhNewSpaceName" placeholder="Enter game name"><div class="rhModalActions"><button class="btn secondary" onclick="$('rhSpaceCreate').remove()">CANCEL</button><button class="btn" onclick="rhCreateSpaceSave()">CREATE SPACE</button></div></div></div>`)};
window.rhCreateSpaceSave=function(){const name=q('rhNewSpaceName')?.value.trim();if(!name)return toast('Enter a OTG! name');const s=rhSpaceTemplate(name,[]);state.spaces.push(s);state.activeSpaceId=s.id;rhSync();rhSave();q('rhSpaceCreate')?.remove();rhManageSpaces()};
window.rhRenameSpacePrompt=function(id){const x=state.spaces.find(s=>s.id===id);if(!x)return;q('rhSpaceRename')?.remove();document.body.insertAdjacentHTML('beforeend',`<div id="rhSpaceRename" class="rhOverlay"><div class="rhModal rhFormModal"><h2>RENAME OTG! SPACE</h2><input id="rhRenameSpaceName" value="${safe(x.name)}"><div class="rhModalActions"><button class="btn secondary" onclick="$('rhSpaceRename').remove()">CANCEL</button><button class="btn" onclick="rhRenameSpaceSave('${id}')">SAVE</button></div></div></div>`)};
window.rhRenameSpaceSave=function(id){const x=state.spaces.find(s=>s.id===id),name=q('rhRenameSpaceName')?.value.trim();if(!x||!name)return;x.name=name;rhSave();q('rhSpaceRename')?.remove();rhManageSpaces()};
window.rhDeleteSpaceConfirm=function(id){const x=state.spaces.find(s=>s.id===id);if(!x||state.spaces.length<=1)return toast('At least one OTG! Space must remain');rhConfirm({title:'DELETE THIS OTG! SPACE?',copy:'This permanently deletes this Space and all of its racing data.',detail:x.name,safeguard:'Your global Driver Profile and other OTG! Spaces will not be affected.',confirmLabel:'DELETE SPACE',danger:true,onConfirm:`rhDeleteSpaceFinal('${id}')`})};
window.rhDeleteSpaceFinal=function(id){if(state.spaces.length<=1)return;state.spaces=state.spaces.filter(x=>x.id!==id);if(state.activeSpaceId===id)state.activeSpaceId=state.spaces[0].id;rhSync();rhSave();rhManageSpaces()};

window.rhChangeFavourite=function(value){const s=rhSpace(),old=s.favouriteManufacturer;if(value===old)return;rhConfirm({title:'CHANGE FAVOURITE MANUFACTURER?',copy:'Changing your Favourite Manufacturer will delete the current Favourite Manufacturer Championship and its progress.',detail:`${old||'Not set'} → ${value||'Not set'}`,safeguard:'Your other Championships and Garage will not be affected.',confirmLabel:'CHANGE FAVOURITE',severity:'purple',onConfirm:`rhChangeFavouriteFinal(${JSON.stringify(value)})`});rhRenderSettings()};
window.rhChangeFavouriteFinal=function(value){const s=rhSpace();s.runs=(s.runs||[]).filter(r=>r.type!=='favourite');s.favouriteManufacturer=value;rhSave();rhRenderSettings()};

window.rhResetConfirm=function(){rhConfirm({title:'RESET RACING DATA?',copy:'Clear Championships, active/completed runs, results, Records, Hall of Fame and Stats for the current Space.',safeguard:'Your Garage, Space name, global Driver Profile and other Spaces will be retained.',confirmLabel:'RESET RACING DATA',danger:true,onConfirm:'rhResetRacingFinal()'})};
window.rhResetRacingFinal=function(){const s=rhSpace();s.runs=[];s.customEvents=[];rhSave();toast('Racing data reset');rhRenderSettings()};
window.rhFullResetConfirm=function(){const s=rhSpace();rhConfirm({title:'FULL RESET OTG!?',copy:'Clear everything in this OTG! Space including Garage, Championships, results, Records, Hall of Fame, Stats and Favourite Manufacturer.',detail:s.name,safeguard:'The Space itself, its name, your global Driver Profile and other Spaces will be retained.',confirmLabel:'FULL RESET',danger:true,onConfirm:'rhFullResetFinal()'})};
window.rhFullResetFinal=function(){const s=rhSpace();s.cars=[];s.favouriteManufacturer='';s.runs=[];s.customEvents=[];s.backups=[];rhSave();toast('OTG! Space reset');rhRenderSettings()};

window.rhRenderSettings=function(){const s=rhSpace(),makes=rhMakeList();q('more').innerHTML=`<div class="rhScene rhSettingsScene">${rhHeader('SETTINGS','OTG! Control Centre','settings')}</div><div class="rhContent rhConformance">
<section class="rhSection rhSettingPanel"><h2>CELEBRATIONS</h2>${['sound','confetti','vibrate'].map(k=>`<label class="rhToggle"><span><b>${k==='sound'?'Sounds':k==='confetti'?'Confetti':'Vibration'}</b><small>${k==='sound'?'Play sounds for celebrations':k==='confetti'?'Show confetti on new records and milestones':'Vibrate when you get a new record'}</small></span><input type="checkbox" ${state.settings[k]?'checked':''} onchange="state.settings.${k}=this.checked;rhSave()"></label>`).join('')}</section>
<section class="rhSection rhSettingPanel"><h2>GARAGE / PROFILE</h2><label>Favourite Manufacturer</label><select onchange="rhChangeFavourite(this.value)"><option value="">Not set</option>${makes.map(m=>`<option ${m===s.favouriteManufacturer?'selected':''}>${safe(m)}</option>`).join('')}</select><p class="rhCaution">Changing your Favourite Manufacturer deletes its current Championship and progress.</p></section>
<section class="rhSection rhSettingPanel"><h2>OTG! SPACES</h2><button class="rhSettingRow" onclick="rhManageSpaces()"><b>Manage OTG! Spaces</b><span>Current Space: ${safe(s.name)} ›</span></button></section>
<section class="rhSection rhSettingPanel"><h2>DATA</h2><button class="rhSettingRow" onclick="rhDataBackups()"><b>Backup / Restore</b><span>Manage saved backups ›</span></button></section>
<section class="rhDangerFinal"><h2>⚠ DANGER ZONE</h2><p>These actions affect the current OTG! Space only.</p><div class="rhDangerAction"><div><b>RESET RACING DATA</b><span>Clear Championships, runs, results, Records, Hall of Fame and Stats.</span><em>Garage will be retained.</em></div><button class="btn dangerBtn" onclick="rhResetConfirm()">RESET RACING DATA</button></div><div class="rhDangerAction"><div><b>FULL RESET OTG!</b><span>Clear everything in this Space including Garage and Favourite Manufacturer.</span><em>The Space, its name and global Driver Profile are retained.</em></div><button class="btn dangerBtn" onclick="rhFullResetConfirm()">FULL RESET</button></div></section>
<section class="rhSection rhSettingPanel"><button class="rhSettingRow" onclick="rhAbout()"><b>ABOUT OUT THE GARAGE!</b><span>OTG! v5.7.0 • ›</span></button></section></div>`};

const oldRecords=window.rhRenderRecords;
window.rhRenderRecords=function(){oldRecords();setTimeout(()=>document.querySelectorAll('.rhRecordRun,.rhHallCard,.rhHallBanner').forEach(x=>x.classList.add('rhGlassUpgrade')),0)};

})();
