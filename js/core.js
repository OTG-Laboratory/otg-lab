// OTG! v5.3.1 — Navigation Identity
const STORE='RaceHub_v4_1_director_edition';
let state=null;
let currentScreen='home';
let currentEventId='drag';
let eventTab='waiting';
let garageMake='All';
let garageSearch='';
let selectedRun=null;

function championshipId(type,value){return `${type}:${String(value||'all').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`;}
function openChampionshipDefinition(){return {id:'open:all',name:'Open Festival Championship',type:'open',value:'all',createdAt:null};}
function activeChampionship(){
 const list=Array.isArray(state&&state.championships)?state.championships:[];
 return list.find(c=>c.id===state.activeChampionshipId)||list[0]||openChampionshipDefinition();
}
function championshipCars(champ=activeChampionship()){
 if(!champ||champ.type==='open')return [...state.cars];
 if(champ.type==='era'){
  const decade=Number(champ.value);
  return state.cars.filter(car=>{const year=Number(car.year);return Number.isFinite(year)&&Math.floor(year/10)*10===decade;});
 }
 if(champ.type==='make'){
  const make=String(champ.value||'').trim().toLowerCase();
  return state.cars.filter(car=>String(car.make||'').trim().toLowerCase()===make);
 }
 const ids=new Set(Array.isArray(champ.carIds)?champ.carIds:[]);
 return state.cars.filter(c=>ids.has(c.id));
}
function championshipCarCount(){return championshipCars().length;}
function generatedChampionshipOptions(){
 const options=[{id:'open:all',name:'Open Festival Championship',type:'open',value:'all',cars:[...state.cars]}];
 const decades=new Map();
 const makes=new Map();
 state.cars.forEach(car=>{
  const y=Number(car.year);
  if(Number.isFinite(y)&&y>=1900&&y<=2029){const d=Math.floor(y/10)*10; if(!decades.has(d))decades.set(d,[]); decades.get(d).push(car);}
  const make=String(car.make||'').trim();
  if(make){if(!makes.has(make))makes.set(make,[]); makes.get(make).push(car);}
 });
 [...decades.entries()].sort((a,b)=>a[0]-b[0]).forEach(([d,cars])=>{if(cars.length>=2)options.push({id:championshipId('era',d),name:`${d}s Championship`,type:'era',value:String(d),cars});});
 [...makes.entries()].sort((a,b)=>a[0].localeCompare(b[0])).forEach(([make,cars])=>{if(cars.length>=2)options.push({id:championshipId('make',make),name:`${make} Championship`,type:'make',value:make,cars});});
 return options;
}
function activateChampionshipOption(optionId){
 const option=generatedChampionshipOptions().find(o=>o.id===optionId);
 if(!option){toast('Championship unavailable');return null;}
 state.championships=Array.isArray(state.championships)?state.championships:[];
 let champ=state.championships.find(c=>c.id===option.id);
 if(!champ){champ={id:option.id,name:option.name,type:option.type,value:option.value,createdAt:new Date().toISOString()};state.championships.push(champ);}
 state.activeChampionshipId=champ.id;
 state.currentCarId=null;
 selectedRun=null;
 save();
 return champ;
}
function startChampionship(optionId){
 const champ=activateChampionshipOption(optionId);
 if(!champ)return;
 closeChampionshipHub(); closeChampionshipSelector(); show('festival'); toast(`${champ.name} selected`);
}
function chooseChampionshipCar(optionId,carId){
 const champ=activateChampionshipOption(optionId);
 const car=carById(carId);
 if(!champ||!car)return;
 const eligible=new Set(championshipCars(champ).map(c=>c.id));
 if(!eligible.has(car.id)){toast('Car is not eligible');return;}
 const ev=nextEventForCar(car.id);
 if(!ev){toast('This car has completed every event');return;}
 closeChampionshipHub(); closeChampionshipSelector();
 state.currentCarId=car.id; state.lastCarId=car.id; state.currentEventId=ev.id;
 selectedRun={eventId:ev.id,carId:car.id}; currentEventId=ev.id; eventTab='add'; save(); show('event');
}
function randomChampionshipCar(optionId){
 const champ=activateChampionshipOption(optionId);
 if(!champ)return;
 closeChampionshipHub(); closeChampionshipSelector();
 beginDirectorShow(true);
}

function activeChampionshipName(){return activeChampionship().name||'Championship';}
function activeRecordLabel(){return activeChampionship().type==='open'?'Festival Record':'Championship Record';}
function resultBeatsRecord(eventId,value,record){return !record || (isLong(eventId)?value>record.value:value<record.value);}

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const carName=c=>`${c.make} ${c.model}${c.year?' '+c.year:''}`.replace(/\s+/g,' ').trim();
const eventById=id=>state.events.find(e=>e.id===id)||state.events[0];
const carById=id=>state.cars.find(c=>c.id===id);
const isLong=id=>eventById(id).type==='distance';

function normaliseCar(car){
 const c=Object.assign({},car||{});
 c.id=String(c.id||'').trim();
 c.make=String(c.make||'').trim();
 c.model=String(c.model||'').trim();
 c.year=String(c.year||'').trim();
 c.classType=String(c.classType||'').trim();
 if((!c.make||!c.model) && c.name){
   const text=String(c.name).trim();
   const yearMatch=text.match(/\s(\d{4})$/);
   if(!c.year&&yearMatch)c.year=yearMatch[1];
   const withoutYear=yearMatch?text.slice(0,-5).trim():text;
   if(!c.make){
     const first=withoutYear.split(/\s+/)[0]||'Unknown';
     c.make=first;
   }
   if(!c.model)c.model=withoutYear.slice(c.make.length).trim()||withoutYear;
 }
 c.name=carName(c);
 return c;
}
function migrateState(raw){
 const next=Object.assign({},raw||{});
 next.version='5.3.1';
 next.cars=Array.isArray(next.cars)?next.cars.map(normaliseCar):[...SEED.cars].map(normaliseCar);
 next.events=Array.isArray(next.events)?next.events:[...SEED.events];
 next.results=Array.isArray(next.results)?next.results:[];
 next.history=Array.isArray(next.history)?next.history:[];
 next.recordHistory=Array.isArray(next.recordHistory)?next.recordHistory:[];
 next.settings=Object.assign({sound:true,confetti:true,vibrate:true},next.settings||{});
 next.randomPicker=Object.assign({mode:'single',cycle:[]},next.randomPicker||{});
 if(!['single','queue'].includes(next.randomPicker.mode))next.randomPicker.mode='single';
 next.randomPicker.cycle=Array.isArray(next.randomPicker.cycle)?next.randomPicker.cycle:[];
 next.championshipQueues=(next.championshipQueues&&typeof next.championshipQueues==='object')?next.championshipQueues:{};
 next.championships=Array.isArray(next.championships)?next.championships:[];
 if(!next.championships.some(c=>c.id==='open:all'))next.championships.unshift({id:'open:all',name:'Open Festival Championship',type:'open',value:'all',createdAt:null});
 next.activeChampionshipId=next.activeChampionshipId||'open:all';
 return next;
}
function freshState(){return migrateState({version:'5.3.5',cars:[...SEED.cars],events:[...SEED.events],results:[],history:[],recordHistory:[],lastRun:null,currentEventId:'drag',settings:{sound:true,confetti:true,vibrate:true}})}
function load(){try{const raw=JSON.parse(localStorage.getItem(STORE)||'null');if(raw&&raw.cars&&raw.events)return migrateState(raw);}catch(e){} return freshState();}
function save(){localStorage.setItem(STORE,JSON.stringify(state));}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function show(screen){currentScreen=screen;document.body.classList.toggle('home-active',screen==='home');document.body.classList.toggle('festival-active',screen==='festival');document.body.classList.toggle('events-active',screen==='events');document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));$(screen).classList.remove('hidden');document.querySelectorAll('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.screen===screen));render(screen);window.scrollTo(0,0)}
document.querySelectorAll('.nav button').forEach(b=>b.addEventListener('click',()=>show(b.dataset.screen)));

function parseResult(eventId,raw){
 raw=String(raw||'').trim(); if(!raw)return NaN;
 if(isLong(eventId)) return Number(raw.replace(/[^0-9.]/g,''));
 const ev=eventById(eventId);
 if(ev.name==='Drag'){ if(raw.includes('.'))return Number(raw.replace(/[^0-9.]/g,'')); let d=raw.replace(/\D/g,''); if(d.length>3)return Number(d.slice(0,-3)+'.'+d.slice(-3)); return Number(d); }
 if(raw.includes(':')){let p=raw.split(':'); if(p.length!==2)return NaN; return Number(p[0])*60+Number(p[1]);}
 let d=raw.replace(/\D/g,''); if(d.length<4)return Number(d);
 let ms=d.slice(-3), before=d.slice(0,-3), sec=before.slice(-2), min=before.slice(0,-2)||'0';
 return Number(min)*60+Number(sec+'.'+ms);
}
function fmt(eventId,v){ if(v==null||!isFinite(v))return '—'; if(isLong(eventId))return Number(v).toLocaleString(undefined,{maximumFractionDigits:2})+' ft'; let m=Math.floor(v/60), s=(v-m*60).toFixed(3).padStart(6,'0'); return m>0?String(m).padStart(2,'0')+':'+s:s+'s'; }

function bestRows(eventId){
 const map={};
 state.results.filter(r=>r.eventId===eventId).forEach(r=>{ if(!map[r.carId] || (isLong(eventId)?r.value>map[r.carId].value:r.value<map[r.carId].value)) map[r.carId]=r; });
 return Object.values(map).sort((a,b)=>isLong(eventId)?b.value-a.value:a.value-b.value);
}
function festivalEventStats(eventId){
 const rows=bestRows(eventId), total=state.cars.length;
 return {done:rows.length,total,waiting:Math.max(0,total-rows.length),pct:total?Math.round(rows.length/total*100):0,leader:rows[0]||null,rows};
}
function championshipEventStats(eventId,champ=activeChampionship()){
 const eligible=new Set(championshipCars(champ).map(c=>c.id));
 const rows=bestRows(eventId).filter(r=>eligible.has(r.carId)), total=eligible.size;
 return {done:rows.length,total,waiting:Math.max(0,total-rows.length),pct:total?Math.round(rows.length/total*100):0,leader:rows[0]||null,rows};
}
function eventStats(eventId){return championshipEventStats(eventId);}
function completedSet(eventId){return new Set(bestRows(eventId).map(r=>r.carId));}
function waitingCars(eventId){const done=completedSet(eventId);return championshipCars().filter(c=>!done.has(c.id));}
function carCompletedEvents(carId){
 const set=new Set();
 state.results.forEach(r=>{if(r.carId===carId)set.add(r.eventId)});
 return set;
}
function carIsComplete(carId){return carCompletedEvents(carId).size>=state.events.length}
function unfinishedCars(){return championshipCars().filter(c=>!carIsComplete(c.id))}
function nextEventForCar(carId){
 const done=carCompletedEvents(carId);
 return state.events.find(e=>!done.has(e.id)) || null;
}
function currentCar(){
  if(!state.currentCarId)return null;
  const c=carById(state.currentCarId);
  const eligible=new Set(championshipCars().map(car=>car.id));
  if(!c || !eligible.has(c.id) || carIsComplete(c.id))return null;
  return c;
}
function continueCurrentCar(){
  const c=currentCar();
  if(!c){startRaceDirector();return;}
  const ev=nextEventForCar(c.id);
  if(!ev){startRaceDirector();return;}
  selectedRun={eventId:ev.id,carId:c.id};
  currentEventId=ev.id;
  state.currentEventId=ev.id;
  save();
  eventTab='add';
  show('event');
}

function allPendingRuns(){
 let cars=championshipCars();
 let total=state.events.length*cars.length;
 let done=0;
 cars.forEach(c=>done+=carCompletedEvents(c.id).size);
 return {total,done,remaining:total-done};
}
function randomPickerState(){
 state.randomPicker=Object.assign({mode:'single',cycle:[]},state.randomPicker||{});
 return state.randomPicker;
}
function randomPickerAvailableCars(){return unfinishedCars();}
function randomPickerRemainingCars(){
 const picker=randomPickerState();
 const available=randomPickerAvailableCars();
 const availableIds=new Set(available.map(c=>c.id));
 picker.cycle=picker.cycle.filter(id=>availableIds.has(id));
 let remaining=available.filter(c=>!picker.cycle.includes(c.id));
 if(!remaining.length&&available.length){picker.cycle=[];remaining=[...available];}
 return remaining;
}
function randomPickerRemainingCount(){
 const picker=randomPickerState();
 const available=randomPickerAvailableCars();
 const used=new Set(picker.cycle);
 const count=available.filter(c=>!used.has(c.id)).length;
 return count||available.length;
}
function setRandomPickerMode(mode){
 if(!['single','queue'].includes(mode))return;
 randomPickerState().mode=mode;
 save();
 renderFestival();
}
function resetRandomPickerCycle(showMessage=true){
 randomPickerState().cycle=[];
 save();
 if(showMessage)toast('Random Picker cycle reset');
 if(currentScreen==='festival')renderFestival();
}
function shuffledCars(cars){
 const list=[...cars];
 for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]];}
 return list;
}
function chooseRandomCar(){
 let pool=randomPickerRemainingCars();
 if(!pool.length)return null;
 const last=state.lastCarId||null;
 const withoutLast=pool.filter(c=>c.id!==last);
 if(withoutLast.length)pool=withoutLast;
 const car=pool[Math.floor(Math.random()*pool.length)];
 const picker=randomPickerState();
 if(!picker.cycle.includes(car.id))picker.cycle.push(car.id);
 save();
 return car;
}
function championshipQueueStore(){
 if(!state.championshipQueues||typeof state.championshipQueues!=='object')state.championshipQueues={};
 return state.championshipQueues;
}
function cleanChampionshipQueue(champId=activeChampionship().id){
 const store=championshipQueueStore();
 const queue=store[champId];
 if(!queue||!Array.isArray(queue.order))return null;
 const champ=(state.championships||[]).find(c=>c.id===champId)||generatedChampionshipOptions().find(c=>c.id===champId)||null;
 if(!champ)return null;
 const eligible=new Set(championshipCars(champ).filter(c=>!carIsComplete(c.id)).map(c=>c.id));
 const seen=new Set();
 queue.order=queue.order.filter(id=>eligible.has(id)&&!seen.has(id)&&seen.add(id));
 if(!queue.order.length){delete store[champId];save();return null;}
 return queue;
}
function activeChampionshipQueue(){return cleanChampionshipQueue(activeChampionship().id);}
function generateChampionshipQueue(){
 const champ=activeChampionship();
 const cars=shuffledCars(championshipCars(champ).filter(c=>!carIsComplete(c.id)));
 if(!cars.length){toast('All cars in this Championship are complete');return null;}
 championshipQueueStore()[champ.id]={order:cars.map(c=>c.id),createdAt:new Date().toISOString()};
 save();
 return championshipQueueStore()[champ.id];
}
function resetChampionshipQueue(){
 const champ=activeChampionship();
 const existing=activeChampionshipQueue();
 if(existing&&!confirm(`Reset the saved queue for ${champ.name}?`))return;
 delete championshipQueueStore()[champ.id];
 save();
 toast('Championship queue cleared');
 if(currentScreen==='festival')renderFestival();
}
function queueCars(champId=activeChampionship().id){
 const queue=cleanChampionshipQueue(champId);
 return queue?queue.order.map(carById).filter(Boolean):[];
}
function startQueueCar(carId){
 const car=carById(carId),ev=car&&nextEventForCar(car.id);
 if(!car||!ev){cleanChampionshipQueue();toast('That car is no longer available');if(currentScreen==='festival')renderFestival();return;}
 skipDirectorToRun(ev.id,car.id);
}
function startRaceDirector(){
 const car=chooseRandomCar();
 if(!car){toast('All cars complete');return;}
 const ev=nextEventForCar(car.id);
 if(!ev){toast('Car already complete');return;}
 selectedRun={eventId:ev.id,carId:car.id};
 currentEventId=ev.id;
 state.currentEventId=ev.id;
 state.lastCarId=car.id;
 state.currentCarId=car.id;
 save();
 eventTab='add';
 show('event');
}
function openEvent(eventId,tab='waiting'){currentEventId=eventId;state.currentEventId=eventId;save();eventTab=tab;selectedRun=null;show('event')}

const PAGE_HEADERS={
 festival:{icon:'🏁',eyebrow:'RACE CONTROL',title:'Festival',subtitle:'Run your active championship and continue race night.',accent:'festival'},
 events:{icon:'🗓️',eyebrow:'EVENT CENTRE',title:'Events',subtitle:'Open an event, enter results and review its standings.',accent:'events'},
 garage:{icon:'🚗',eyebrow:'CAR MANAGEMENT',title:'Garage',subtitle:'Browse the collection, manage queues and track progress.',accent:'garage'},
 hall:{icon:'🏆',eyebrow:'WHOLE COLLECTION',title:'Leaderboard',subtitle:'Overall standings, championship honours and the Hall of Fame.',accent:'hall'},
 more:{icon:'📈',eyebrow:'PERFORMANCE CENTRE',title:'Statistics',subtitle:'Explore records, averages and performance across OTG!.',accent:'more'}
};
function ensurePageHeader(screen){
 if(screen==='festival'||screen==='events')return;
 const host=$(screen),meta=PAGE_HEADERS[screen];
 if(!host||!meta)return;
 const existing=host.querySelector(':scope > .pageIdentityHeader');
 if(existing)existing.remove();
 host.insertAdjacentHTML('afterbegin',`<section class="pageIdentityHeader pageIdentity-${meta.accent}"><div class="pageIdentityIcon">${meta.icon}</div><div class="pageIdentityCopy"><div class="pageIdentityEyebrow">${meta.eyebrow}</div><h1>${meta.title}</h1><p>${meta.subtitle}</p></div></section>`);
}
function render(screen){ if(screen==='home')renderHome(); if(screen==='festival')renderFestival(); if(screen==='events')renderEvents(); if(screen==='event')renderEvent(); if(screen==='garage')renderGarage(); if(screen==='hall')renderHallOfFame(); if(screen==='more')renderStats(); ensurePageHeader(screen); }


function currentCarProgress(){
  const c=currentCar();
  if(!c)return null;
  const done=carCompletedEvents(c.id).size;
  const next=nextEventForCar(c.id);
  return {car:c,done,next,complete:done>=state.events.length};
}


function championshipRows(){
  const timedEvents=state.events.filter(e=>e.type!=='distance');
  const distanceEvent=state.events.find(e=>e.type==='distance')||null;

  const bestByEvent={};
  state.events.forEach(ev=>{
    bestByEvent[ev.id]=new Map(bestRows(ev.id).map(r=>[r.carId,r]));
  });

  const rows=championshipCars()
    .filter(car=>carIsComplete(car.id))
    .map(car=>{
      const timedResults=timedEvents.map(ev=>bestByEvent[ev.id].get(car.id)).filter(Boolean);
      if(timedResults.length!==timedEvents.length)return null;

      const totalTime=timedResults.reduce((sum,r)=>sum+Number(r.value),0);
      const jumpResult=distanceEvent?bestByEvent[distanceEvent.id].get(car.id):null;
      const longJump=jumpResult?Number(jumpResult.value):0;

      return {
        carId:car.id,
        car,
        totalTime,
        longJump,
        position:0,
        gap:0
      };
    })
    .filter(Boolean)
    .sort((a,b)=>{
      const timeDiff=a.totalTime-b.totalTime;
      if(Math.abs(timeDiff)>0.0000001)return timeDiff;
      const jumpDiff=b.longJump-a.longJump;
      if(Math.abs(jumpDiff)>0.0000001)return jumpDiff;
      return carName(a.car).localeCompare(carName(b.car));
    });

  const leaderTime=rows.length?rows[0].totalTime:0;
  rows.forEach((row,index)=>{
    row.position=index+1;
    row.gap=row.totalTime-leaderTime;
  });

  return rows;
}


function overallLeaderboardRows(){
  const timedEvents=state.events.filter(e=>e.type!=='distance');
  const distanceEvent=state.events.find(e=>e.type==='distance')||null;
  const bestByEvent={};
  state.events.forEach(ev=>{bestByEvent[ev.id]=new Map(bestRows(ev.id).map(r=>[r.carId,r]));});
  const rows=state.cars.map(car=>{
    const completed=state.events.filter(ev=>bestByEvent[ev.id].has(car.id)).length;
    const timedResults=timedEvents.map(ev=>bestByEvent[ev.id].get(car.id)).filter(Boolean);
    const qualified=completed===state.events.length&&timedResults.length===timedEvents.length;
    const totalTime=qualified?timedResults.reduce((sum,r)=>sum+Number(r.value),0):null;
    const jumpResult=distanceEvent?bestByEvent[distanceEvent.id].get(car.id):null;
    return {carId:car.id,car,completed,qualified,totalTime,longJump:jumpResult?Number(jumpResult.value):0,position:null,gap:null};
  });
  const qualified=rows.filter(r=>r.qualified).sort((a,b)=>{
    const timeDiff=a.totalTime-b.totalTime;
    if(Math.abs(timeDiff)>0.0000001)return timeDiff;
    const jumpDiff=b.longJump-a.longJump;
    if(Math.abs(jumpDiff)>0.0000001)return jumpDiff;
    return carName(a.car).localeCompare(carName(b.car));
  });
  const leaderTime=qualified.length?qualified[0].totalTime:0;
  qualified.forEach((row,index)=>{row.position=index+1;row.gap=row.totalTime-leaderTime;});
  return {qualified,progress:rows.sort((a,b)=>b.completed-a.completed||carName(a.car).localeCompare(carName(b.car)))};
}

function championshipLeader(){
  return championshipRows()[0]||null;
}

function championshipPosition(carId){
  const row=championshipRows().find(r=>r.carId===carId);
  return row?row.position:null;
}

function championshipGap(carId){
  const row=championshipRows().find(r=>r.carId===carId);
  return row?row.gap:null;
}

