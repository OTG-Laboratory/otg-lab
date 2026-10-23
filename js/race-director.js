// OTG! v5.2.15 — Queue Draw Experience
let queueRevealTimer=null;
let queueRevealToken=0;
const directorLines=[
  'Good evening, drivers...',
  'The garage has spoken...',
  'A new challenger approaches...',
  'This should be interesting...',
  'Let’s see what this one can do...',
  'OTG! is taking control...'
];
function directorSpeak(text){
  const el=$('directorLine');
  if(!el)return;
  el.textContent='';
  let i=0;
  const timer=setInterval(()=>{
    el.textContent += text.charAt(i++);
    if(i>=text.length)clearInterval(timer);
  },26);
}
function directorOverlay(html){
  closeDirector();
  document.body.insertAdjacentHTML('beforeend',`<div id="directorOverlay" class="directorOverlay">${html}</div>`);
}
function closeDirector(){
  queueRevealToken++;
  if(queueRevealTimer){clearTimeout(queueRevealTimer);queueRevealTimer=null;}
  const o=$('directorOverlay');
  if(o)o.remove();
}
function skipDirectorToRun(eventId,carId){
  closeDirector();
  selectedRun={eventId,carId};
  currentEventId=eventId;
  state.currentEventId=eventId;
  state.currentCarId=carId;
  save();
  eventTab='add';
  show('event');
}
function randomPickerTone(frequency=520,duration=.08){
  if(state.settings&&state.settings.sound===false)return;
  try{
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    if(!AudioContext)return;
    const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type='sine';osc.frequency.value=frequency;gain.gain.value=.035;
    osc.connect(gain);gain.connect(ctx.destination);osc.start();
    gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
    osc.stop(ctx.currentTime+duration);setTimeout(()=>ctx.close(),Math.ceil(duration*1000)+80);
  }catch(e){}
}
function launchRandomPicker(){
 const picker=randomPickerState();
 if(picker.mode==='single'){beginDirectorShow(true);return;}
 openChampionshipQueue();
}
function openChampionshipQueue(forceNew=false){
 if(!unfinishedCars().length){toast('All cars complete');return;}
 let queue=activeChampionshipQueue();
 const isNew=forceNew||!queue;
 if(isNew)queue=generateChampionshipQueue();
 if(!queue)return;
 directorQueueReveal(isNew);
}
function queueRevealDelay(count){
 if(count>=30)return 120;
 if(count>=20)return 155;
 if(count>=12)return 210;
 return 285;
}
function queueRowHtml(car,i,revealing=false){
 return `<div class="pickerOrderRow ${i===0?'queueCurrent':''} ${revealing?'queueRevealing':''}"><span>${i+1}</span><b>${esc(carName(car))}</b><small>${i===0?'NEXT CAR':esc((nextEventForCar(car.id)||{}).name||'Complete')}</small></div>`;
}
function finishQueueReveal(cars,token){
 if(token!==queueRevealToken)return;
 if(queueRevealTimer){clearTimeout(queueRevealTimer);queueRevealTimer=null;}
 const list=$('queueRevealList'),status=$('queueRevealStatus'),skip=$('queueSkipBtn'),actions=$('queueRevealActions');
 if(list)list.innerHTML=cars.map((car,i)=>queueRowHtml(car,i)).join('');
 if(status)status.innerHTML='🏁 <b>Queue locked in. Time to race!</b>';
 if(skip)skip.remove();
 if(actions)actions.hidden=false;
 randomPickerTone(760,.12);
 if(state.settings&&state.settings.vibrate!==false&&navigator.vibrate)navigator.vibrate([45,35,70]);
}
function skipQueueReveal(){
 const cars=queueCars();
 finishQueueReveal(cars,queueRevealToken);
}
function directorQueueReveal(animate=false){
 const cars=queueCars();
 if(!cars.length){closeDirector();toast('Queue is empty');show('festival');return;}
 const first=cars[0],ev=nextEventForCar(first.id);
 directorOverlay(`${animate?'<button id="queueSkipBtn" class="skipBtn" onclick="skipQueueReveal()">Skip Draw</button>':'<button class="skipBtn" onclick="closeDirector();show(\'festival\')">Close</button>'}<div class="directorCard directorWinner queueDrawCard">
   <div class="directorKicker">${esc(activeChampionshipName())}</div>
   <div class="directorBig">${animate?'Drawing Race Queue...':'Race Night Queue'}</div>
   <p id="queueRevealStatus" class="small">${animate?'🎲 The full queue is already saved safely. Revealing the running order now...':'Saved automatically. Completed cars disappear from every Championship queue without reshuffling the remaining order.'}</p>
   <div id="queueRevealList" class="pickerLineup queueRevealList">${animate?'':cars.map((car,i)=>queueRowHtml(car,i)).join('')}</div>
   <div id="queueRevealActions" class="directorActions" ${animate?'hidden':''}>
    ${ev?`<button class="btn bigStart randomPickerButton" onclick="startQueueCar('${first.id}')">▶ Start Next Car</button>`:''}
    <button class="btn secondary directorUtilityButton" onclick="if(confirm('Replace this queue with a new random order?'))openChampionshipQueue(true)">🎲 Generate New Queue</button>
    <button class="btn secondary directorUtilityButton" onclick="closeDirector();resetChampionshipQueue()">Clear Queue</button>
    <button class="btn secondary" onclick="closeDirector();show('festival')">Back to Dashboard</button>
   </div>
  </div>`);
 const token=queueRevealToken;
 if(!animate)return;
 const list=$('queueRevealList');
 let index=0;
 const delay=queueRevealDelay(cars.length);
 const revealNext=()=>{
   if(token!==queueRevealToken||!list)return;
   if(index>=cars.length){queueRevealTimer=setTimeout(()=>finishQueueReveal(cars,token),260);return;}
   list.insertAdjacentHTML('beforeend',queueRowHtml(cars[index],index,true));
   const row=list.lastElementChild;
   if(row){row.scrollIntoView({block:'nearest',behavior:'smooth'});setTimeout(()=>row.classList.remove('queueRevealing'),Math.max(180,delay-30));}
   randomPickerTone(430+(index%5)*45,.045);
   index++;
   queueRevealTimer=setTimeout(revealNext,delay);
 };
 queueRevealTimer=setTimeout(revealNext,650);
}
function beginDirectorShow(forceNew=false){
  const c=currentCar();
  if(c && !forceNew){continueCurrentCar();return;}
  if(forceNew){state.currentCarId=null;save();}
  const car=chooseRandomCar();
  if(!car){toast('All cars complete');return;}
  const ev=nextEventForCar(car.id);
  if(!ev){toast('Car already complete');return;}
  state.lastCarId=car.id;
  state.currentCarId=car.id;
  state.currentEventId=ev.id;
  save();
  const line=directorLines[Math.floor(Math.random()*directorLines.length)];
  randomPickerTone(820,.12);
  directorOverlay(`<button class="skipBtn" onclick="skipDirectorToRun('${ev.id}','${car.id}')">Skip</button><div class="directorCard">
    <div class="directorDice">🎲</div>
    <div class="directorKicker">RANDOM PICKER</div>
    <div class="directorTitle">OTG!</div>
    <div class="directorLine" id="directorLine">Race Director Initialising...</div>
    <div class="checkList">
      ✓ Garage Connected<br>
      ✓ ${championshipCarCount()} Cars Ready<br>
      ✓ ${state.events.length} Events Loaded<br>
      ✓ Record Database Loaded<br>
      ✓ Race Director Online
    </div>
  </div>`);
  setTimeout(()=>directorSpeak(line),600);
  setTimeout(()=>directorCarSlot(car,ev),2300);
}
function directorCarSlot(car,ev){
  const names=championshipCars().slice(0,80).map(carName);
  directorOverlay(`<button class="skipBtn" onclick="skipDirectorToRun('${ev.id}','${car.id}')">Skip</button><div class="directorCard">
    <div class="directorKicker">RANDOM PICKER</div>
    <div class="directorLine">Tonight's randomly selected car is...</div>
    <div class="slotBox"><div class="slotText" id="slotText">Selecting...</div></div>
    <div class="directorSpinnerDots"><i></i><i></i><i></i></div>
  </div>`);
  let i=0;
  const slot=$('slotText');
  const spin=setInterval(()=>{
    if(slot)slot.textContent=names[Math.floor(Math.random()*names.length)];
    i++;
    if(i>22){
      clearInterval(spin);
      if(slot)slot.textContent=carName(car);
      randomPickerTone(620,.08);
      if(state.settings&&state.settings.vibrate!==false&&navigator.vibrate)navigator.vibrate(60);
      setTimeout(()=>directorEventReveal(car,ev),900);
    }
  },80);
}
function directorEventReveal(car,ev){
  const make=car&&car.make?car.make:'';
  const accent=typeof manufacturerAccent==='function'?manufacturerAccent(make):'#ff9f2f';
  const logo=make&&typeof manufacturerLogoPath==='function'
    ?`<img class="directorManufacturerLogo" src="${manufacturerLogoPath(make)}" alt="" aria-hidden="true" onerror="this.remove()">`
    :'';
  directorOverlay(`<button class="skipBtn" onclick="skipDirectorToRun('${ev.id}','${car.id}')">Skip</button><div class="directorCard directorWinner" style="--director-make:${accent}">
    <div class="directorKicker">YOUR RANDOM PICK</div>
    ${logo}
    <div class="directorBig">${esc(carName(car))}</div>
    <div class="directorEventLabel">OPENING EVENT</div>
    <div class="directorEventName">🏁 ${esc(ev.name)}</div>
    <div class="directorActions">
      <button class="btn bigStart randomPickerButton" onclick="skipDirectorToRun('${ev.id}','${car.id}')">▶ Start Event</button>
      <button class="btn secondary" onclick="closeDirector();launchRandomPicker()">🎲 Pick Again</button>
      <button class="btn secondary" onclick="closeDirector();show('festival')">Back to Dashboard</button>
    </div>
  </div>`);
}
function directorNextEvent(carId,eventId){
  const car=carById(carId), ev=eventById(eventId);
  directorOverlay(`<button class="skipBtn" onclick="skipDirectorToRun('${eventId}','${carId}')">Skip</button><div class="directorCard">
    <div style="font-size:44px">✅</div>
    <div class="directorLine">Result accepted.</div>
    <div class="directorLine">Preparing next challenge...</div>
    <div class="directorBig">🚗 ${esc(carName(car))}</div>
    <div class="directorTitle">🏁 ${esc(ev.name)}</div>
    <div class="directorActions"><button class="btn bigStart" onclick="skipDirectorToRun('${eventId}','${carId}')">▶ Start ${esc(ev.name)}</button></div>
  </div>`);
}

function startRaceNight(){
  const c=currentCar();
  if(c){continueCurrentCar();return;}
  startRaceDirector();
}
function carCompletionStats(carId){
  const rows=state.results.filter(r=>r.carId===carId);
  let records=0,bestFinish=null;
  state.events.forEach(ev=>{
    const board=bestRows(ev.id);
    const pos=board.findIndex(r=>r.carId===carId);
    if(pos===0)records++;
    if(pos>=0 && (bestFinish==null || pos<bestFinish.pos)) bestFinish={pos,event:ev.name};
  });
  return {results:rows.length,records,bestFinish};
}
function formatDirectorChampionshipTime(totalSeconds){
  const total=Math.max(0,Number(totalSeconds)||0);
  const hours=Math.floor(total/3600);
  const minutes=Math.floor((total%3600)/60);
  const seconds=(total%60).toFixed(3).padStart(6,'0');
  return hours>0
    ?`${hours}:${String(minutes).padStart(2,'0')}:${seconds}`
    :`${String(minutes).padStart(2,'0')}:${seconds}`;
}

function formatDirectorChampionshipGap(seconds){
  const gap=Math.max(0,Number(seconds)||0);
  if(gap<60)return `${gap.toFixed(3)} seconds`;
  const mins=Math.floor(gap/60);
  const secs=(gap-mins*60).toFixed(3).padStart(6,'0');
  return `${String(mins).padStart(2,'0')}:${secs}`;
}

function launchDirectorConfetti(){
  if(state.settings && state.settings.confetti===false)return;
  const overlay=document.getElementById('directorOverlay');
  if(!overlay)return;
  const colours=['#ff2bd6','#7b2cff','#34d7ff','#ffd84d','#ff8a00','#ffffff'];
  for(let i=0;i<120;i++){
    const piece=document.createElement('div');
    piece.className='confettiPiece';
    piece.style.left=(Math.random()*100)+'vw';
    piece.style.top=(-20-Math.random()*80)+'px';
    piece.style.background=colours[Math.floor(Math.random()*colours.length)];
    piece.style.animationDelay=(Math.random()*0.45)+'s';
    piece.style.animationDuration=(2+Math.random()*2)+'s';
    piece.style.width=(6+Math.random()*8)+'px';
    piece.style.height=(10+Math.random()*14)+'px';
    piece.style.transform='rotate('+Math.floor(Math.random()*360)+'deg)';
    overlay.appendChild(piece);
  }
}

function directorChampionshipMedal(position){
  return position===1?'🥇':position===2?'🥈':position===3?'🥉':'🏁';
}

function directorChampionshipAccent(position){
  return position===1?'#ffd84d':position===2?'#dce6f2':position===3?'#d99a5e':'#34d7ff';
}

function directorChampionshipPodium(standings,currentCarId){
  const leaders=standings.slice(0,3);
  if(!leaders.length)return '';
  return `<div class="legacyCard" style="text-align:left">
    <div class="small" style="text-align:center;margin-bottom:10px">Current Championship Podium</div>
    ${leaders.map(r=>{
      const podiumCar=carById(r.carId);
      const active=r.carId===currentCarId;
      const accent=directorChampionshipAccent(r.position);
      return `<div style="display:grid;grid-template-columns:38px 1fr auto;gap:10px;align-items:center;padding:9px 4px;${r.position<3?'border-bottom:1px solid rgba(255,255,255,.1);':''}${active?`color:${accent};font-weight:800;`:''}">
        <span style="font-size:22px">${directorChampionshipMedal(r.position)}</span>
        <span>${esc(podiumCar?carName(podiumCar):r.carId)}${active?' <span class="small">(this car)</span>':''}</span>
        <span>${esc(formatDirectorChampionshipTime(r.totalTime))}</span>
      </div>`;
    }).join('')}
  </div>`;
}

function showCarComplete(carId){
  const car=carById(carId), stats=carCompletionStats(carId);
  const best=stats.bestFinish?`${ordinalPosition(stats.bestFinish.pos+1)} in ${stats.bestFinish.event}`:'—';

  const standings=championshipRows();
  const row=standings.find(r=>r.carId===carId)||null;
  const isLeader=!!row&&row.position===1;
  const second=standings[1]||null;
  const lead=isLeader&&second?second.totalTime-row.totalTime:null;
  const positionText=row?`${ordinalPosition(row.position)} of ${standings.length}`:'—';
  const accent=row?directorChampionshipAccent(row.position):'#34d7ff';
  const medal=row?directorChampionshipMedal(row.position):'🏁';
  const qualifiedCount=standings.length;
  const championshipSummary=row
    ?`<div class="legacyCard" style="border-color:${accent};box-shadow:0 0 26px ${row.position===1?'rgba(255,216,77,.24)':'rgba(52,215,255,.14)'}">
        <div class="small">Festival Championship</div>
        <h2 style="color:${accent};margin:.25em 0">${medal} ${positionText}</h2>
        <div class="small">Combined time across all six races</div>
        <div class="recordTime" style="color:${accent}">${esc(formatDirectorChampionshipTime(row.totalTime))}</div>
        ${isLeader
          ?(lead!=null
            ?`<div class="small">Championship lead</div><b style="color:#5cff8d">${esc(formatDirectorChampionshipGap(lead))} ahead</b>`
            :'<div class="small">First car to qualify — the Championship has begun</div>')
          :`<div class="small">Gap to Championship leader</div><b style="color:#ff6b7a">+${esc(formatDirectorChampionshipGap(row.gap))}</b>`}
        <div class="small" style="margin-top:10px">${qualifiedCount} ${qualifiedCount===1?'car has':'cars have'} qualified so far</div>
      </div>`
    :'';

  directorOverlay(`<div class="directorCard" style="max-height:92vh;overflow:auto">
    <div style="font-size:64px">${isLeader?'🏆':'🎉'}</div>
    <div class="directorTitle" style="${isLeader?'color:#ffd84d':'color:#34d7ff'}">
      ${isLeader?'NEW FESTIVAL LEADER!':'RACE NIGHT COMPLETE!'}
    </div>
    <div class="directorBig">🚗 ${esc(carName(car))}</div>
    <p class="small">All ${state.events.length} events complete</p>
    <div class="legacyCard" style="border-color:${isLeader?'#ffd84d':'#34d7ff'};box-shadow:0 0 24px ${isLeader?'rgba(255,216,77,.22)':'rgba(52,215,255,.18)'}">
      <b>${isLeader?'Championship leader':'This car has completed its full Festival programme'}</b>
      <div class="progress completionProgress" style="margin:12px 0 8px">
        <div class="bar" style="width:100%;${isLeader?'background:linear-gradient(90deg,#ff9f2f,#ffd84d);box-shadow:0 0 16px rgba(255,216,77,.8),0 0 28px rgba(255,159,47,.45)':''}"></div>
      </div>
      <span class="small">${state.events.length}/${state.events.length} events complete</span>
    </div>

    ${championshipSummary}
    ${directorChampionshipPodium(standings,carId)}

    <div class="grid">
      <div class="resultBox">
        <div class="legacyBig">${stats.records}</div>
        <div class="small">event ${stats.records===1?'record':'records'} held</div>
      </div>
      <div class="resultBox">
        <div class="legacyBig">${esc(best)}</div>
        <div class="small">best event finish</div>
      </div>
    </div>

    <div class="small" style="margin:12px 0 4px">Championship ties are decided by the highest Long Jump distance.</div>

    <div class="directorActions">
      <button class="btn bigStart" onclick="closeDirector();beginDirectorShow(true)">🎲 Pick Next Random Car</button>
      <button class="btn secondary" onclick="closeDirector();show('festival')">Back to Festival</button>
    </div>
  </div>`);

  try{playRecordSound();}catch(e){}
  try{vibrateRecord();}catch(e){}
  launchDirectorConfetti();
}

