// OTG! v5.1.2 — Championship and Festival Record Celebrations
function playRecordSound(scope='championship'){
  if(!state.settings || !state.settings.sound) return;
  try{
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(scope==='festival'?0.24:0.17, now+0.03);
    master.gain.exponentialRampToValueAtTime(0.0001, now+(scope==='festival'?1.7:1.15));
    master.connect(ctx.destination);

    function tone(freq, start, dur, type='sine'){
      const o=ctx.createOscillator();
      const g=ctx.createGain();
      o.type=type;
      o.frequency.setValueAtTime(freq, now+start);
      g.gain.setValueAtTime(0.0001, now+start);
      g.gain.exponentialRampToValueAtTime(0.85, now+start+0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, now+start+dur);
      o.connect(g); g.connect(master);
      o.start(now+start); o.stop(now+start+dur+0.04);
    }

    if(scope==='festival'){
      tone(261.63,0.00,0.24,'triangle');
      tone(392,0.18,0.24,'triangle');
      tone(523.25,0.38,0.27,'triangle');
      tone(659.25,0.62,0.30,'triangle');
      tone(783.99,0.88,0.34,'sine');
      tone(1046.5,1.16,0.42,'sine');
    }else{
      tone(392,0.00,0.18,'triangle');
      tone(523.25,0.16,0.18,'triangle');
      tone(659.25,0.32,0.22,'triangle');
      tone(783.99,0.54,0.32,'triangle');
      tone(1046.5,0.78,0.34,'sine');
    }
  }catch(e){}
}
function vibrateRecord(scope='championship'){
  if(state.settings && state.settings.vibrate && navigator.vibrate){
    navigator.vibrate(scope==='festival'?[120,45,160,45,220,60,300]:[80,40,120,40,180]);
  }
}

function festivalMilestoneForCount(count,total){
  const milestones=[
    {count:25,icon:'🥉',title:'25 CARS COMPLETE!',line:'The opening milestone is secured.'},
    {count:50,icon:'🥈',title:'50 CARS COMPLETE!',line:'The Festival campaign is gathering pace.'},
    {count:100,icon:'🥇',title:'100 CARS COMPLETE!',line:'A century of cars has crossed the line.'},
    {count:250,icon:'💎',title:'250 CARS COMPLETE!',line:'A quarter-thousand cars conquered.'},
    {count:500,icon:'👑',title:'500 CARS COMPLETE!',line:'Legendary Festival status achieved.'}
  ];
  if(total>0 && count>=total){
    return {count:total,icon:'🏁',title:'FESTIVAL COMPLETE!',line:`All ${total} cars have completed every event.`};
  }
  return milestones.find(m=>m.count===count)||null;
}

function showFestivalMilestone(count,total){
  const milestone=festivalMilestoneForCount(count,total);
  if(!milestone)return;

  state.milestonesShown=Array.isArray(state.milestonesShown)?state.milestonesShown:[];
  const key=String(milestone.count);
  if(state.milestonesShown.includes(key))return;

  state.milestonesShown.push(key);
  save();

  const old=document.getElementById('festivalMilestoneOverlay');
  if(old)old.remove();

  const pct=total?Math.round((count/total)*100):0;
  const html=`<div id="festivalMilestoneOverlay" class="celebrationOverlay">
    <div class="celebrationCard">
      <div style="font-size:64px">${milestone.icon}</div>
      <div class="recordTitle">${esc(milestone.title)}</div>
      <div class="recordCar">${esc(milestone.line)}</div>
      <div class="legacyCard">
        <b>${count} / ${total} cars complete</b>
        <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
        <div class="small">${pct}% of the Festival complete</div>
      </div>
      <button class="btn bigStart" onclick="closeFestivalMilestone()">Continue Racing</button>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend',html);
  playRecordSound();
  vibrateRecord();
  launchConfetti();
}

function closeFestivalMilestone(){
  const overlay=document.getElementById('festivalMilestoneOverlay');
  if(overlay)overlay.remove();
}

function ordinalPosition(n){
  const value=Math.abs(Number(n)||0);
  const mod100=value%100;
  if(mod100>=11&&mod100<=13)return `${value}th`;
  switch(value%10){
    case 1:return `${value}st`;
    case 2:return `${value}nd`;
    case 3:return `${value}rd`;
    default:return `${value}th`;
  }
}

function eventPositionLabel(position,total){
  const medal=position===1?'🥇 ':position===2?'🥈 ':position===3?'🥉 ':'';
  return `${medal}${ordinalPosition(position)} of ${total}`;
}

function formatTimeDifference(seconds){
  const total=Math.max(0,Number(seconds)||0);
  if(total<60)return `${total.toFixed(3)} seconds`;
  const minutes=Math.floor(total/60);
  const remaining=total-(minutes*60);
  return `${minutes} minute${minutes===1?'':'s'} ${remaining.toFixed(3)} seconds`;
}

function eventAverageFeedback(eventId,value,rows){
  const values=rows.map(r=>Number(r.value)).filter(Number.isFinite);
  const count=values.length;
  if(!count)return null;

  const average=values.reduce((sum,n)=>sum+n,0)/count;
  const better=isLong(eventId)?value>average:value<average;
  const equal=Math.abs(value-average)<0.0005;
  const diff=Math.abs(value-average);

  if(equal){
    return {
      count,
      average,
      tone:'neutral',
      headline:'Almost exactly the event average',
      difference:isLong(eventId)?`${diff.toFixed(2)} ft`:formatTimeDifference(diff)
    };
  }

  return {
    count,
    average,
    tone:better?'good':'bad',
    headline:better
      ?(isLong(eventId)?'FARTHER than average':'FASTER than average')
      :(isLong(eventId)?'SHORTER than average':'SLOWER than average'),
    difference:isLong(eventId)?`${diff.toFixed(2)} ft`:formatTimeDifference(diff)
  };
}

function launchConfetti(scope='championship'){
  if(state.settings && state.settings.confetti===false) return;
  const overlay=document.getElementById('celebrationOverlay');
  if(!overlay)return;
  const colors=scope==='festival'
    ?['#ffd84d','#ffb000','#ffffff','#fff1a8','#ff8a00']
    :['#29ff8a','#34d7ff','#ffffff','#8affc1','#7b2cff'];
  for(let i=0;i<140;i++){
    const p=document.createElement('div');
    p.className='confettiPiece';
    p.style.left=(Math.random()*100)+'vw';
    p.style.top=(-20-Math.random()*80)+'px';
    p.style.background=colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDelay=(Math.random()*0.5)+'s';
    p.style.animationDuration=(2.0+Math.random()*2.0)+'s';
    p.style.width=(6+Math.random()*8)+'px';
    p.style.height=(10+Math.random()*14)+'px';
    p.style.transform='rotate('+Math.floor(Math.random()*360)+'deg)';
    overlay.appendChild(p);
  }
}

function daysBetween(a,b){
  if(!a||!b)return null;
  const d1=new Date(a), d2=new Date(b);
  if(isNaN(d1)||isNaN(d2))return null;
  return Math.max(0,Math.floor((d2-d1)/86400000));
}
function daysText(days){
  if(days==null)return '';
  if(days===0)return 'Held for today';
  if(days===1)return 'Held for 1 day';
  if(days<365)return `Held for ${days} days`;
  const y=Math.floor(days/365), rem=days%365, m=Math.floor(rem/30);
  return `Held for ${y} year${y>1?'s':''}${m?`, ${m} month${m>1?'s':''}`:''}`;
}
function improvementText(eventId,newValue,oldValue){
  if(oldValue==null||!isFinite(oldValue))return '';
  const diff=isLong(eventId)?newValue-oldValue:oldValue-newValue;
  if(!isFinite(diff))return '';
  if(isLong(eventId))return `${diff.toFixed(2)} ft farther`;
  return `${diff.toFixed(3)} seconds faster`;
}
function latestRecordForEvent(eventId){
  const hist=(state.recordHistory||[]).filter(h=>h.eventId===eventId);
  return hist.length?hist[hist.length-1]:null;
}
function addRecordHistory(eventId,carId,value,previousRecord){
  state.recordHistory=state.recordHistory||[];
  const now=new Date().toISOString();
  const entry={
    id:'rh'+Date.now(),
    eventId,carId,value,date:now,
    previousCarId:previousRecord?previousRecord.carId:null,
    previousValue:previousRecord?previousRecord.value:null,
    previousDate:previousRecord?previousRecord.date:null,
    daysStood:previousRecord?daysBetween(previousRecord.date,now):null,
    improvement:previousRecord?improvementText(eventId,value,previousRecord.value):''
  };
  state.recordHistory.push(entry);
  return entry;
}
function legendaryRecord(){
  const hist=state.recordHistory||[];
  let best=null;
  hist.forEach(h=>{
    const held = h.daysStood!=null ? h.daysStood : daysBetween(h.date,new Date().toISOString());
    if(held!=null && (!best || held>best.held)) best={...h,held};
  });
  return best;
}


let recordCelebrationQueue=[];
let recordCelebrationFinalAction=null;
let recordCelebrationTimer=null;
let recordCelebrationLastData=null;

function showMiniRecordBanner(data){
  const old=document.getElementById('recordBannerMini');
  if(old)old.remove();
  const isFestival=data.scope==='festival';
  const parts=[isFestival?'👑 Festival Record!':'🏆 Championship Record!'];
  if(data.improvement)parts.push('⚡ '+data.improvement);
  document.body.insertAdjacentHTML('beforeend',`<div id="recordBannerMini" class="recordBannerMini ${isFestival?'festival':'championship'}">${esc(parts.join(' • '))}</div>`);
  setTimeout(()=>{
    const b=document.getElementById('recordBannerMini');
    if(b)b.classList.add('fadeOut');
    setTimeout(()=>{const x=document.getElementById('recordBannerMini'); if(x)x.remove();},550);
  },2200);
}

function recordCelebrationTitle(data){
  if(data.scope==='festival')return data.previous?'FESTIVAL RECORD SHATTERED!':'NEW FESTIVAL RECORD!';
  return data.previous?'CHAMPIONSHIP RECORD SHATTERED!':`NEW ${String(data.championshipName||'CHAMPIONSHIP').toUpperCase()} RECORD!`;
}

function renderRecordCelebration(data){
  const isFestival=data.scope==='festival';
  const previous=data.previous
    ? `<div class="previousRecord"><div class="small">Previous ${isFestival?'Festival':'Championship'} Record</div><b>${esc(data.previousCar)}</b><br>${esc(data.previousValue)}</div>`
    : `<div class="previousRecord"><div class="small">First ${isFestival?'Festival':'Championship'} record for this event</div></div>`;
  const html=`<div id="celebrationOverlay" class="celebrationOverlay ${isFestival?'festivalRecordCelebration':'championshipRecordCelebration'}">
    <div class="celebrationCard">
      <div class="recordCrown">${isFestival?'👑':'🏆'}</div>
      <div class="recordScope">${isFestival?'FESTIVAL RECORD':esc(data.championshipName||'CHAMPIONSHIP RECORD')}</div>
      <div class="recordTitle">${esc(recordCelebrationTitle(data))}</div>
      <div class="small">${esc(data.eventName)}</div>
      <div class="recordCar">${esc(data.carName)}</div>
      <div class="recordTime">${esc(data.value)}</div>
      ${isFestival?'<div class="festivalHistoryLine">Fastest result ever recorded in OTG! · Entered the Hall of Fame</div>':''}
      ${data.improvement?`<div class="legacyCard">⚡ ${esc(data.improvement)}</div>`:''}
      ${data.heldText?`<div class="legacyCard">⏳ ${esc(data.heldText)}</div>`:''}
      ${previous}
      <div class="grid">
        <button class="btn" onclick="advanceRecordCelebration(true)">▶️ ${recordCelebrationQueue.length?'Next Celebration':(data.nextEventName?`Start ${esc(data.nextEventName)}`:'Continue')}</button>
        <button class="btn secondary" onclick="openRecordLeaderboard()">View Leaderboard</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend',html);
  playRecordSound(data.scope);
  vibrateRecord(data.scope);
  launchConfetti(data.scope);
  recordCelebrationTimer=setTimeout(()=>advanceRecordCelebration(false),isFestival?4400:3300);
}

function playRecordCelebrationSequence(items,finalAction){
  recordCelebrationQueue=Array.isArray(items)?items.slice():[];
  recordCelebrationFinalAction=typeof finalAction==='function'?finalAction:null;
  recordCelebrationLastData=null;
  showNextRecordCelebration();
}

function showNextRecordCelebration(){
  if(!recordCelebrationQueue.length)return;
  const data=recordCelebrationQueue.shift();
  recordCelebrationLastData=data;
  renderRecordCelebration(data);
}

function advanceRecordCelebration(navigate){
  if(recordCelebrationTimer){clearTimeout(recordCelebrationTimer);recordCelebrationTimer=null;}
  const overlay=document.getElementById('celebrationOverlay');
  const finish=()=>{
    closeCelebration();
    if(recordCelebrationQueue.length){setTimeout(showNextRecordCelebration,160);return;}
    if(recordCelebrationLastData)showMiniRecordBanner(recordCelebrationLastData);
    const action=recordCelebrationFinalAction;
    recordCelebrationFinalAction=null;
    recordCelebrationLastData=null;
    if(navigate&&action)action();
  };
  if(overlay){overlay.classList.add('fadeOut');setTimeout(finish,560);}else finish();
}

function openRecordLeaderboard(){
  if(recordCelebrationTimer){clearTimeout(recordCelebrationTimer);recordCelebrationTimer=null;}
  recordCelebrationQueue=[];
  recordCelebrationFinalAction=null;
  recordCelebrationLastData=null;
  closeCelebration();
  eventTab='leaderboard';
  renderEvent();
}

function showRecordCelebration(data){
  playRecordCelebrationSequence([data],()=>{
    if(data.continueAction){try{Function(data.continueAction)();}catch(e){}}
  });
}
function closeCelebration(){
  const o=document.getElementById('celebrationOverlay');
  if(o)o.remove();
}

function safeShowRecordCelebration(payload){
  try{showRecordCelebration(payload);}catch(e){
    document.body.insertAdjacentHTML('beforeend', `<div id="celebrationOverlay" class="celebrationOverlay"><div class="celebrationCard"><div style="font-size:54px">🏆</div><div class="recordTitle">${esc(recordCelebrationTitle(payload))}</div><div class="recordCar">${esc(payload.carName)}</div><div class="recordTime">${esc(payload.value)}</div><button class="btn" onclick="closeCelebration()">Continue</button></div></div>`);
  }
}

function saveResult(){
 const ev=eventById(currentEventId), carId=$('carSelect').value, value=parseResult(ev.id,$('resultInput').value);
 if(!carId||!isFinite(value)){toast('Enter a valid result');return;}
 const activeCars=championshipCars();
 const completedBefore=activeCars.filter(c=>carIsComplete(c.id)).length;
 const championshipBefore=championshipEventStats(ev.id).leader;
 const festivalBefore=festivalEventStats(ev.id).leader;
 const separateChampionship=activeChampionship().type!=='open';
 const isChampionshipRecord=separateChampionship && resultBeatsRecord(ev.id,value,championshipBefore);
 const isFestivalRecord=resultBeatsRecord(ev.id,value,festivalBefore);
 const r={id:'r'+Date.now(),eventId:ev.id,carId,value,date:new Date().toISOString()};
 state.results.push(r);
 state.lastCarId=carId;
 state.currentCarId=carId;
 if(carIsComplete(carId)) state.currentCarId=null;
 save();
 const completedAfter=activeCars.filter(c=>carIsComplete(c.id)).length;
 const milestoneReached=completedAfter>completedBefore
   ? festivalMilestoneForCount(completedAfter,activeCars.length)
   : null;
 const car=carById(carId);
 const updatedEventStats=eventStats(ev.id);
 const eventPosition=updatedEventStats.rows.findIndex(row=>row.id===r.id)+1;
 const eventPositionTotal=updatedEventStats.rows.length;
 const eventPositionText=eventPositionLabel(eventPosition,eventPositionTotal);
 const averageFeedback=eventAverageFeedback(ev.id,value,updatedEventStats.rows);
 const nextEv=nextEventForCar(carId);
 const runStats=allPendingRuns();
 let actionButtons='';
 if(nextEv){
   actionButtons += `<button class="btn" onclick="directorNextEvent('${carId}','${nextEv.id}')">➡️ Next Event: ${esc(nextEv.name)}</button>`;
 } else {
   actionButtons += `<button class="btn" onclick="showCarComplete('${carId}')">🏁 Finish This Car</button>`;
 }
 actionButtons += `<button class="btn secondary" onclick="eventTab='leaderboard';renderEvent()">View Leaderboard</button>`;

 let savedResultBox=`<div class="resultBox">✅ Saved<br><b>${esc(carName(car))}</b><br>${esc(ev.name)} — ${esc(fmt(ev.id,value))}</div>`;
 if(isChampionshipRecord&&isFestivalRecord){
   savedResultBox=`<div class="recordBox festivalRecordBox">👑 NEW FESTIVAL RECORD!<br><span class="small darkText">Also a new ${esc(activeChampionshipName())} record</span><br>${esc(carName(car))}<br><span style="font-size:24px">${esc(fmt(ev.id,value))}</span></div>`;
 }else if(isFestivalRecord){
   savedResultBox=`<div class="recordBox festivalRecordBox">👑 ${festivalBefore?'FESTIVAL RECORD SHATTERED!':'NEW FESTIVAL RECORD!'}<br>${esc(carName(car))}<br><span style="font-size:24px">${esc(fmt(ev.id,value))}</span></div>`;
 }else if(isChampionshipRecord){
   savedResultBox=`<div class="recordBox championshipRecordBox">🏆 ${championshipBefore?'CHAMPIONSHIP RECORD SHATTERED!':'NEW CHAMPIONSHIP RECORD!'}<br><span class="small">${esc(activeChampionshipName())}</span><br>${esc(carName(car))}<br><span style="font-size:24px">${esc(fmt(ev.id,value))}</span></div>`;
 }

 $('event').innerHTML=`<div class="card"><h2>Result Saved</h2>
 ${savedResultBox}
 <div class="resultBox"><div class="small">Current event position</div><h2>${esc(eventPositionText)}</h2><span class="small">${esc(ev.name)} leaderboard · ${esc(activeChampionshipName())}</span></div>
 ${averageFeedback?`<div class="resultBox performanceCard ${averageFeedback.tone}"><div class="small">Performance vs event average</div><div class="performanceDifference">${averageFeedback.tone==='good'?'🟢':averageFeedback.tone==='bad'?'🔴':'🟡'} ${esc(averageFeedback.difference)}</div><div class="performanceHeadline">${esc(averageFeedback.headline)}</div><div class="performanceValues"><div class="performanceValue"><span class="small">Your result</span><b>${esc(fmt(ev.id,value))}</b></div><div class="performanceValue"><span class="small">Average (${averageFeedback.count} car${averageFeedback.count===1?'':'s'})</span><b>${esc(fmt(ev.id,averageFeedback.average))}</b></div></div></div>`:''}
 <div class="resultBox"><b>${nextEv?'Same car continues':'Car complete'}</b><br><span class="small">${nextEv?`Next unfinished event for this car is ${esc(nextEv.name)}.`:`All ${state.events.length} events complete for this car.`}</span></div>
 <div class="grid">${actionButtons}</div>
 <button class="btn secondary" onclick="openEvent('${ev.id}','waiting')">Back to Waiting</button>
 <p class="small">${runStats.remaining} total event runs remaining.</p></div>`;

 const celebrations=[];
 if(isChampionshipRecord){
   celebrations.push({
     scope:'championship', championshipName:activeChampionshipName(), eventName:ev.name,
     carName:carName(car), value:fmt(ev.id,value), previous:!!championshipBefore,
     previousCar:championshipBefore?carName(carById(championshipBefore.carId)):'',
     previousValue:championshipBefore?fmt(ev.id,championshipBefore.value):'',
     improvement:championshipBefore?improvementText(ev.id,value,championshipBefore.value):'',
     heldText:'', nextEventName:nextEv?nextEv.name:''
   });
 }
 if(isFestivalRecord){
   const recordEntry=addRecordHistory(ev.id,carId,value,festivalBefore);
   save();
   celebrations.push({
     scope:'festival', eventName:ev.name, carName:carName(car), value:fmt(ev.id,value),
     previous:!!festivalBefore, previousCar:festivalBefore?carName(carById(festivalBefore.carId)):'',
     previousValue:festivalBefore?fmt(ev.id,festivalBefore.value):'',
     improvement:recordEntry.improvement||'',
     heldText:recordEntry.daysStood!=null?daysText(recordEntry.daysStood):'',
     nextEventName:nextEv?nextEv.name:''
   });
 }
 if(celebrations.length){
   setTimeout(()=>playRecordCelebrationSequence(celebrations,()=>{
     if(nextEv)directorNextEvent(carId,nextEv.id);else showCarComplete(carId);
   }),250);
 }

 if(milestoneReached){
   setTimeout(()=>showFestivalMilestone(completedAfter,activeCars.length),celebrations.length?(celebrations.length>1?9000:5200):450);
 }
}

function editResult(id){const r=state.results.find(x=>x.id===id);if(!r)return;const raw=prompt('Edit result',fmt(r.eventId,r.value));if(raw===null)return;const v=parseResult(r.eventId,raw);if(!isFinite(v)){toast('Invalid result');return;}r.value=v;r.date=new Date().toISOString();save();toast('Result updated');renderEvent();}
function deleteResult(id){const r=state.results.find(x=>x.id===id);if(!r)return;if(!confirm('Delete this result?'))return;state.results=state.results.filter(x=>x.id!==id);save();toast('Deleted');renderEvent();}

