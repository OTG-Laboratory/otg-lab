// OTG! v5.4.4 — Statistics mobile two-column grid fix
function statsBestResults(){
 const rows=[];
 state.events.forEach(ev=>bestRows(ev.id).forEach(result=>rows.push({...result,event:ev})));
 return rows;
}
function statsChampionshipCounts(){
 if(typeof dashboardChampionshipCounts==='function')return dashboardChampionshipCounts();
 const options=generatedChampionshipOptions().filter(option=>option.type!=='open');
 const completed=options.filter(option=>option.cars.length&&option.cars.every(car=>carIsComplete(car.id))).length;
 const startedIds=new Set((state.championships||[]).filter(champ=>champ.type!=='open').map(champ=>champ.id));
 const active=options.filter(option=>startedIds.has(option.id)&&!option.cars.every(car=>carIsComplete(car.id))).length;
 return {completed,active};
}
function statsDuration(seconds){
 const total=Math.max(0,Number(seconds)||0);
 const hours=Math.floor(total/3600),minutes=Math.floor((total%3600)/60),secs=Math.floor(total%60);
 if(hours)return `${hours}h ${minutes}m`;
 if(minutes)return `${minutes}m ${secs}s`;
 return `${secs}s`;
}
function statsManufacturerRows(){
 const groups=new Map();
 state.cars.forEach(car=>{
  const make=String(car.make||'Unknown').trim()||'Unknown';
  if(!groups.has(make))groups.set(make,{make,owned:0,completed:0});
  const row=groups.get(make); row.owned++; if(carIsComplete(car.id))row.completed++;
 });
 return [...groups.values()].map(row=>({...row,pct:row.owned?Math.round(row.completed/row.owned*100):0}))
  .filter(row=>row.completed>0)
  .sort((a,b)=>b.pct-a.pct||b.completed-a.completed||a.owned-b.owned||a.make.localeCompare(b.make));
}
function statsRecentMilestones(){
 const items=[];
 (state.recordHistory||[]).forEach(entry=>{
  const ev=eventById(entry.eventId),car=carById(entry.carId);
  items.push({date:entry.date||'',icon:'🏆',title:`New ${ev?ev.name:'Festival'} record`,detail:`${fmt(entry.eventId,entry.value)} · ${car?carName(car):entry.carId}`});
 });
 state.cars.filter(car=>carIsComplete(car.id)).forEach(car=>{
  const results=state.results.filter(r=>r.carId===car.id&&r.date).sort((a,b)=>new Date(b.date)-new Date(a.date));
  if(results[0])items.push({date:results[0].date,icon:'✅',title:'Car completed',detail:carName(car)});
 });
 return items.sort((a,b)=>new Date(b.date||0)-new Date(a.date||0)).slice(0,3);
}
function renderStats(){
 const owned=state.cars.length;
 const completed=state.cars.filter(car=>carIsComplete(car.id)).length;
 const completionPct=owned?completed/owned*100:0;
 const champs=statsChampionshipCounts();
 const resultRows=statsBestResults();
 const timedRows=resultRows.filter(row=>row.event.type!=='distance');
 const totalRaceTime=timedRows.reduce((sum,row)=>sum+Number(row.value||0),0);
 const avgRaceTime=timedRows.length?totalRaceTime/timedRows.length:0;
 const completedRuns=resultRows.length;
 const records=state.events.map(ev=>({ev,leader:festivalEventStats(ev.id).leader})).filter(row=>row.leader);
 const manufacturers=statsManufacturerRows().slice(0,5);
 const milestones=statsRecentMilestones();

 const recordCards=records.map(({ev,leader})=>{
  const car=leader?carById(leader.carId):null;
  return `<div class="statsHighlight"><div class="statsHighlightIcon">${ev.type==='distance'?'📏':'⚡'}</div><div><span>${esc(ev.name)}</span><b>${leader?esc(fmt(ev.id,leader.value)):'—'}</b><small>${leader&&car?esc(carName(car)):'No record yet'}</small></div></div>`;
 }).join('');

 const manufacturerHtml=manufacturers.length?manufacturers.map((row,index)=>`<div class="statsManufacturer" style="--stats-make:${manufacturerAccent(row.make)}">
   <div class="statsManufacturerRank">${index+1}</div>
   <div class="statsManufacturerLogo"><img src="${manufacturerLogoPath(row.make)}" alt="" aria-hidden="true" onerror="this.remove()"></div>
   <div class="statsManufacturerMain"><div class="statsManufacturerHead"><b>${esc(row.make)}</b><span>${row.completed}/${row.owned}</span></div><div class="statsMiniTrack"><i style="width:${row.pct}%"></i></div><small>${row.pct}% completed</small></div>
  </div>`).join(''):`<div class="empty">Complete a car to unlock manufacturer rankings.</div>`;

 const milestoneHtml=milestones.length?milestones.map(item=>`<div class="statsMilestone"><div class="statsMilestoneIcon">${item.icon}</div><div><b>${esc(item.title)}</b><span>${esc(item.detail)}</span><small>${esc(dashboardRelativeTime(item.date))}</small></div></div>`).join(''):`<div class="empty">Your latest records and completed cars will appear here.</div>`;

 $('more').innerHTML=`<div class="statsPage">
  <section class="statsHero">
   <div class="statsHeading"><div><div class="statsEyebrow">📊 FESTIVAL STATISTICS</div><h2>Your OTG! Story</h2><p>Progress, performance and recent achievements in one place.</p></div><button class="chip" onclick="renderMore()">Settings</button></div>
   <div class="statsHeadlineGrid">
    <div class="statsHeadline cyan"><span>Cars Owned</span><b>${owned}</b><small>Ready to race</small></div>
    <div class="statsHeadline green"><span>Cars Completed</span><b>${completed}</b><small>${completionPct.toFixed(1)}% complete</small></div>
    <div class="statsHeadline brand"><span>Championships</span><b>${champs.completed}</b><small>${champs.active} currently active</small></div>
    <div class="statsHeadline gold"><span>Festival Records</span><b>${records.length}</b><small>Current records held</small></div>
   </div>
  </section>

  <section class="statsPanel statsProgressPanel">
   <div class="statsSectionTitle"><div><div class="statsEyebrow">GARAGE PROGRESS</div><h3>${completed} of ${owned} cars completed</h3></div><strong>${completionPct.toFixed(1)}%</strong></div>
   <div class="statsProgressTrack"><i style="width:${Math.min(100,completionPct)}%"></i></div>
   <p>${Math.max(0,owned-completed)} cars still waiting for a complete race card.</p>
  </section>

  <section class="statsPanel statsRecordsPanel">
   <div class="statsSectionTitle"><div><div class="statsEyebrow">PERFORMANCE HIGHLIGHTS</div><h3>Festival Records</h3></div><button class="chip" onclick="show('hall')">Hall of Fame</button></div>
   <div class="statsHighlightsGrid">${recordCards||'<div class="empty">Set your first Festival Record to see performance highlights.</div>'}</div>
  </section>

  <section class="statsPanel statsManufacturersPanel">
   <div class="statsSectionTitle"><div><div class="statsEyebrow">TOP MANUFACTURERS</div><h3>Collection Leaders</h3></div></div>
   <div class="statsManufacturerList">${manufacturerHtml}</div>
  </section>

  <section class="statsPanel statsActivityPanel">
   <div class="statsSectionTitle"><div><div class="statsEyebrow">RACING ACTIVITY</div><h3>At a Glance</h3></div></div>
   <div class="statsActivityGrid">
    <div><span>Completed event cards</span><b>${completedRuns}</b></div>
    <div><span>Total best-result time</span><b>${statsDuration(totalRaceTime)}</b></div>
    <div><span>Average timed result</span><b>${timedRows.length?formatChampionshipTime(avgRaceTime):'—'}</b></div>
    <div><span>Record history entries</span><b>${(state.recordHistory||[]).length}</b></div>
   </div>
  </section>

  <section class="statsPanel statsMilestonesPanel">
   <div class="statsSectionTitle"><div><div class="statsEyebrow">RECENT MILESTONES</div><h3>Latest Achievements</h3></div></div>
   <div class="statsMilestoneList">${milestoneHtml}</div>
  </section>
 </div>`;
}

function recordHistoryDateValue(value){
 const time=new Date(value||0).getTime();
 return Number.isFinite(time)?time:0;
}
function recordHistoryRelative(value){
 if(!value)return 'Date unavailable';
 if(typeof dashboardRelativeTime==='function')return dashboardRelativeTime(value);
 const days=Math.floor(Math.max(0,Date.now()-recordHistoryDateValue(value))/86400000);
 if(days===0)return 'Today'; if(days===1)return 'Yesterday'; if(days<7)return `${days} days ago`;
 return new Date(value).toLocaleDateString();
}
function recordHistoryBestForCar(car){
 const rows=state.events.map(ev=>({ev,result:bestRows(ev.id).find(row=>row.carId===car.id)})).filter(row=>row.result);
 const timed=rows.filter(row=>row.ev.type!=='distance');
 const fastest=timed.slice().sort((a,b)=>a.result.value-b.result.value)[0]||null;
 const average=timed.length?timed.reduce((sum,row)=>sum+Number(row.result.value||0),0)/timed.length:0;
 const longJump=rows.find(row=>row.ev.type==='distance')||null;
 return {rows,timed,fastest,average,longJump};
}
function recordHistoryChampionshipRows(option){
 const timedEvents=state.events.filter(ev=>ev.type!=='distance');
 const distanceEvent=state.events.find(ev=>ev.type==='distance')||null;
 const bestByEvent={};
 state.events.forEach(ev=>bestByEvent[ev.id]=new Map(bestRows(ev.id).map(result=>[result.carId,result])));
 const rows=option.cars.map(car=>{
  const timed=timedEvents.map(ev=>bestByEvent[ev.id].get(car.id)).filter(Boolean);
  if(timed.length!==timedEvents.length)return null;
  const jump=distanceEvent?bestByEvent[distanceEvent.id].get(car.id):null;
  return {car,totalTime:timed.reduce((sum,result)=>sum+Number(result.value||0),0),longJump:jump?Number(jump.value):0};
 }).filter(Boolean).sort((a,b)=>a.totalTime-b.totalTime||b.longJump-a.longJump||carName(a.car).localeCompare(carName(b.car)));
 rows.forEach((row,index)=>row.position=index+1);
 return rows;
}
function recordHistoryMetrics(){
 const allBest=statsBestResults();
 const timed=allBest.filter(row=>row.event.type!=='distance');
 const fastest=timed.slice().sort((a,b)=>a.value-b.value)[0]||null;
 const average=timed.length?timed.reduce((sum,row)=>sum+Number(row.value||0),0)/timed.length:0;
 const jumps=allBest.filter(row=>row.event.type==='distance').sort((a,b)=>b.value-a.value);
 const completed=state.cars.filter(car=>carIsComplete(car.id));
 const completeStats=completed.map(car=>({car,...recordHistoryBestForCar(car)})).filter(row=>row.timed.length);
 completeStats.forEach(row=>{
  const values=row.timed.map(item=>Number(item.result.value));
  const mean=values.reduce((sum,value)=>sum+value,0)/values.length;
  row.consistency=Math.sqrt(values.reduce((sum,value)=>sum+Math.pow(value-mean,2),0)/values.length);
 });
 completeStats.sort((a,b)=>a.consistency-b.consistency);
 let above=0,below=0;
 timed.forEach(row=>{
  const eventRows=bestRows(row.event.id);
  const eventAverage=eventRows.length?eventRows.reduce((sum,result)=>sum+Number(result.value||0),0)/eventRows.length:0;
  if(Number(row.value)<=eventAverage)above++;else below++;
 });
 const improvements=(state.recordHistory||[]).map(entry=>Number(String(entry.improvement||'').replace(/[^0-9.]/g,''))).filter(Number.isFinite).filter(value=>value>0);
 return {totalRaces:timed.length,fastest,average,bestJump:jumps[0]||null,completed,consistent:completeStats[0]||null,above,below,bestImprovement:improvements.length?Math.max(...improvements):0};
}
function recordHistoryStory(){
 const items=[];
 const seenRecords=new Set();
 (state.recordHistory||[]).forEach(entry=>{
  const ev=eventById(entry.eventId),car=carById(entry.carId),previous=carById(entry.previousCarId);
  const key=`${entry.eventId}|${entry.carId}|${Number(entry.value)}`;
  seenRecords.add(key);
  items.push({
   id:entry.id||key,type:'records',date:entry.date||'',icon:'⚡',eyebrow:'NEW FESTIVAL RECORD',badge:'NEW RECORD',
   title:ev?ev.name:'Festival Record',value:fmt(entry.eventId,entry.value),car,
   detail:entry.improvement?`Beat the previous record by ${entry.improvement}`:(entry.previousCarId?'Set a new Festival benchmark':'Set the first Festival benchmark'),
   meta:previous?`Previous holder: ${carName(previous)}`:(entry.daysStood!=null?`Previous record ${daysText(entry.daysStood).toLowerCase()}`:'Entered the Hall of Fame'),
   accent:'#2cff92'
  });
 });
 state.events.forEach(ev=>{
  const leader=festivalEventStats(ev.id).leader;
  if(!leader)return;
  const key=`${ev.id}|${leader.carId}|${Number(leader.value)}`;
  if(seenRecords.has(key))return;
  const car=carById(leader.carId);
  items.push({id:`current-${ev.id}`,type:'records',date:leader.date||'',icon:'👑',eyebrow:'CURRENT FESTIVAL RECORD',badge:'RECORD HOLDER',title:ev.name,value:fmt(ev.id,leader.value),car,detail:'Current Festival benchmark',meta:'Recovered from live results',accent:'#ffd84d'});
 });
 state.cars.filter(car=>carIsComplete(car.id)).forEach(car=>{
  const results=state.results.filter(result=>result.carId===car.id&&result.date).sort((a,b)=>recordHistoryDateValue(b.date)-recordHistoryDateValue(a.date));
  if(!results.length)return;
  const stats=recordHistoryBestForCar(car);
  const championship=championshipRows().find(row=>row.carId===car.id);
  items.push({id:`car-${car.id}`,type:'cars',date:results[0].date,icon:'🚗',eyebrow:'COMPLETED CAR',badge:'FULL CARD',title:carName(car),value:`${state.events.length}/${state.events.length} events`,car,
   detail:stats.fastest?`Fastest: ${stats.fastest.ev.name} · ${fmt(stats.fastest.ev.id,stats.fastest.result.value)}`:'Every Festival event completed',
   meta:`Average timed result: ${stats.timed.length?formatChampionshipTime(stats.average):'—'}${championship?` · Overall #${championship.position}`:''}`,
   accent:'#b46cff'});
 });
 generatedChampionshipOptions().filter(option=>option.type!=='open'&&option.cars.length&&option.cars.every(car=>carIsComplete(car.id))).forEach(option=>{
  const ids=new Set(option.cars.map(car=>car.id));
  const dates=state.results.filter(result=>ids.has(result.carId)&&result.date).map(result=>result.date).sort((a,b)=>recordHistoryDateValue(b)-recordHistoryDateValue(a));
  if(!dates.length)return;
  const podium=recordHistoryChampionshipRows(option).slice(0,3);
  items.push({id:`champ-${option.id}`,type:'championships',date:dates[0],icon:'🏆',eyebrow:'CHAMPIONSHIP COMPLETE',badge:'CHAMPIONSHIP',title:option.name,value:podium[0]?carName(podium[0].car):`${option.cars.length} cars`,car:null,
   detail:podium[0]?`Champion · ${formatChampionshipTime(podium[0].totalTime)}`:'Every eligible car completed',
   meta:option.type==='make'?'Manufacturer Championship':'Era Championship',podium,accent:'#ffcb45'});
 });
 return items.sort((a,b)=>recordHistoryDateValue(b.date)-recordHistoryDateValue(a.date));
}
function setRecordHistoryFilter(filter){
 document.querySelectorAll('.historyFilter').forEach(button=>button.classList.toggle('on',button.dataset.filter===filter));
 document.querySelectorAll('.historyStoryItem').forEach(item=>item.classList.toggle('hidden',filter!=='all'&&item.dataset.type!==filter));
 const visible=[...document.querySelectorAll('.historyStoryItem:not(.hidden)')];
 const empty=document.getElementById('historyFilteredEmpty');
 if(empty)empty.classList.toggle('hidden',visible.length>0);
}
function animateRecordHistoryCounters(){
 document.querySelectorAll('[data-history-count]').forEach(element=>{
  const target=Number(element.dataset.historyCount)||0;
  if(!target){element.textContent='0';return;}
  const started=performance.now(),duration=550;
  const tick=now=>{const pct=Math.min(1,(now-started)/duration);element.textContent=Math.round(target*(1-Math.pow(1-pct,3)));if(pct<1)requestAnimationFrame(tick)};
  requestAnimationFrame(tick);
 });
}
function renderRecordHistory(){
 const story=recordHistoryStory();
 const counts={records:story.filter(item=>item.type==='records').length,championships:story.filter(item=>item.type==='championships').length,cars:story.filter(item=>item.type==='cars').length};
 const metrics=recordHistoryMetrics();
 const cards=story.map(item=>{
  const logo=item.car?`<div class="historyMakeLogo"><img src="${manufacturerLogoPath(item.car.make)}" alt="${esc(item.car.make)}" onerror="this.parentElement.textContent='${esc(item.car.make)}'"></div>`:'';
  const podium=item.podium&&item.podium.length?`<div class="historyPodium">${item.podium.map((row,index)=>`<div class="place${index+1}"><span>${['🥇','🥈','🥉'][index]}</span><b>${esc(carName(row.car))}</b><small>${esc(formatChampionshipTime(row.totalTime))}</small></div>`).join('')}</div>`:'';
  return `<article class="historyStoryItem" data-type="${item.type}" style="--history-accent:${item.accent}">
   <div class="historyRail"><span>${item.icon}</span></div>
   <div class="historyStoryCard history-${item.type}">
    <div class="historyCardTop"><div><div class="historyEyebrow">${esc(item.eyebrow)}</div><h3>${esc(item.title)}</h3></div><time>${esc(recordHistoryRelative(item.date))}</time></div>
    <div class="historyBadge">${esc(item.badge||item.eyebrow)}</div>
    <div class="historyCardBody">${logo}<div class="historyCardMain"><div class="historyValue">${esc(item.value)}</div>${item.car?`<div class="historyCarName">${esc(carName(item.car))}</div>`:''}<div class="historyDetail">${esc(item.detail)}</div><div class="historyMeta">${esc(item.meta)}</div></div></div>${podium}
   </div>
  </article>`;
 }).join('');
 const fastestCar=metrics.fastest?carById(metrics.fastest.carId):null;
 const jumpCar=metrics.bestJump?carById(metrics.bestJump.carId):null;
 $('more').innerHTML=`<div class="historyPage historySprint2">
  <section class="historyHero">
   <div class="historyHeroTop"><div><div class="historyKicker">🏁 YOUR RACING STORY</div><h2>Record History</h2><p>Your records, Championships and completed-car milestones.</p></div><button class="chip" onclick="renderStats()">Statistics</button></div>
   <div class="historyDashboard">
    <div class="historyStat cyan"><span>Total Race Results</span><b data-history-count="${metrics.totalRaces}">0</b><small>Timed best results</small></div>
    <div class="historyStat gold"><span>Championships</span><b data-history-count="${counts.championships}">0</b><small>Completed series</small></div>
    <div class="historyStat green"><span>Record Entries</span><b data-history-count="${counts.records}">0</b><small>Festival milestones</small></div>
    <div class="historyStat purple"><span>Cars Completed</span><b data-history-count="${counts.cars}">0</b><small>Full event cards</small></div>
   </div>
   <div class="historyPerformanceGrid">
    <div><span>⚡ Fastest Result</span><b>${metrics.fastest?esc(fmt(metrics.fastest.event.id,metrics.fastest.value)):'—'}</b><small>${fastestCar?esc(carName(fastestCar)):'No timed result yet'}</small></div>
    <div><span>📊 Average Result</span><b>${metrics.average?esc(formatChampionshipTime(metrics.average)):'—'}</b><small>Across timed best results</small></div>
    <div><span>🚀 Best Long Jump</span><b>${metrics.bestJump?esc(fmt(metrics.bestJump.event.id,metrics.bestJump.value)):'—'}</b><small>${jumpCar?esc(carName(jumpCar)):'No jump recorded yet'}</small></div>
   </div>
  </section>
  <section class="historyPerformancePanel">
   <div class="historyPanelTitle"><div><div class="historyKicker">📈 PERFORMANCE</div><h3>At a Glance</h3></div></div>
   <div class="historyPerformanceSummary"><div><span>At or Above Average</span><b>${metrics.above}</b></div><div><span>Below Average</span><b>${metrics.below}</b></div><div><span>Best Record Improvement</span><b>${metrics.bestImprovement?metrics.bestImprovement.toFixed(3)+'s':'—'}</b></div><div><span>Most Consistent Car</span><b>${metrics.consistent?esc(carName(metrics.consistent.car)):'—'}</b></div></div>
  </section>
  <nav class="historyFilters" aria-label="Filter record history"><button class="historyFilter on" data-filter="all" onclick="setRecordHistoryFilter('all')">All <span>${story.length}</span></button><button class="historyFilter" data-filter="records" onclick="setRecordHistoryFilter('records')">Records <span>${counts.records}</span></button><button class="historyFilter" data-filter="championships" onclick="setRecordHistoryFilter('championships')">Championships <span>${counts.championships}</span></button><button class="historyFilter" data-filter="cars" onclick="setRecordHistoryFilter('cars')">Cars <span>${counts.cars}</span></button></nav>
  <section class="historyTimeline">${cards||`<div class="historyEmpty"><div>📜</div><h3>Your racing story starts here.</h3><p>Complete races and Championships to build your OTG! history.</p></div>`}<div id="historyFilteredEmpty" class="historyEmpty hidden"><div>🔎</div><h3>Nothing in this chapter yet.</h3><p>Choose another filter or keep racing to add new achievements.</p></div></section>
 </div>`;
 animateRecordHistoryCounters();
}

function renderMore(){
 const s=state.settings||{sound:true,confetti:true,vibrate:true};
 $('more').innerHTML=`<div class="card"><div class="grid"><button class="btn secondary" onclick="renderStats()">📊 Back to Statistics</button><button class="btn" onclick="renderRecordHistory()">🏛️ Record History</button></div><h2>Settings</h2><h3>Celebrations</h3><div class="resultBox"><label><input type="checkbox" id="setSound" ${s.sound?'checked':''}> 🔊 Celebration sounds</label><label><input type="checkbox" id="setConfetti" ${s.confetti?'checked':''}> 🎉 Confetti</label><label><input type="checkbox" id="setVibrate" ${s.vibrate?'checked':''}> 📳 Vibrate on new record</label><button class="btn" onclick="saveSettings()">Save Settings</button><button class="btn secondary" onclick="testCelebration()">Test Celebration</button></div><h3>Backup</h3><button class="btn secondary" onclick="backup()">Copy Backup</button><label>Restore backup</label><textarea id="restoreBox" rows="7"></textarea><button class="btn" onclick="restore()">Restore</button><button class="btn danger" onclick="clearResults()">Clear All Results</button><section class="racehubAbout" aria-label="About Out The Garage!"><img src="assets/brand/racehub-shield.svg" alt="OTG! RH shield"><div class="racehubAboutName">OTG!</div><div class="racehubAboutTagline">Track • Record • Improve</div><div class="racehubAboutDivider"></div><div class="racehubAboutLabel">Designed &amp; Developed by</div><div class="racehubAboutCreators">Andy Jones <span>&amp;</span> ChatGPT</div><div class="racehubAboutMeta">© 2026 • Version 5.4.11</div></section></div>`;
}
function saveSettings(){state.settings={sound:$('setSound').checked,confetti:$('setConfetti').checked,vibrate:$('setVibrate').checked};save();toast('Settings saved');}
function testCelebration(){saveSettings();showRecordCelebration({scope:'festival',eventName:'Test Event',carName:'OTG! Test Car',value:'09:24.766',previous:true,previousCar:'Previous Record Holder',previousValue:'09:25.114',continueAction:"closeCelebration()"});}
function backup(){const txt=JSON.stringify(state);navigator.clipboard?.writeText(txt);toast('Backup copied if supported');}
function restore(){try{const raw=JSON.parse($('restoreBox').value);if(!raw.cars||!raw.events)throw Error();state=raw;save();toast('Restored');show('festival')}catch(e){toast('Invalid backup')}}
function clearResults(){if(!confirm('Clear all results? Cars will stay.'))return;state.results=[];state.lastRun=null;save();toast('Results cleared');show('festival')}
