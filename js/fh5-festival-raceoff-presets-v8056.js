/* OTG! v8.0.56 — FH5 Festival / Race Off preset rebuild.
   Source: final multi-tab FH5 race-setups workbook (09 Sep 2026).
   No artwork changes. */
(()=>{
'use strict';
const FH5_KEY='fh5-catalogue-v1';
const D={"mexico":{"Buggies":{"discipline":"Dirt","tracks":["Montaña Trail","Bajío Trail","Fuera Del Camino Trail","Desierto Trail","El Pípila Scramble","Mulegé Town Scramble","La Selva Scramble"]},"Unlimited Buggies":{"discipline":"Dirt","tracks":["Barranca Trail","Cordillera Trail","Tapalpa Trail","Baja California Trail","Teotihuacán Scramble","Horizon Baja Scramble"]},"UTVs":{"discipline":"Dirt","tracks":["Cascada Trail","Tulum Trail","River Scramble","San Juan Scramble","Mangrove Scramble","Caldera Scramble"]},"Offroad":{"discipline":"Cross Country","tracks":["Ek' Balam Cross Country","Airfield Cross Country Circuit","Ribera Rocosa Cross Country","Herencia Cross Country Circuit","Festival Cross Country"]},"Unlimited Offroad":{"discipline":"Cross Country","tracks":["Copper Canyon Cross Country","Las Ranas Cross Country","El Descenso Cross Country","Quarry Cross Country Circuit","Desert Dunes Cross Country"]},"Pickups & 4x4":{"discipline":"Cross Country","tracks":["Baja Cross Country Circuit","Urban Cross Country","Restos Cross Country","Tropic Cross Country","Mangrove Cross Country"]},"Trucks":{"discipline":"Cross Country","tracks":["Estadio Cross Country Circuit","Costera Cross Country","Las Dunas Cross Country","Los Jardines Cross Country","Mountain Foot Cross Country"]},"Classic Muscle":{"discipline":"Road / Street","tracks":["Horizon Mexico Circuit","Arch of Mulegé Circuit","Festival Gatecrash"]},"Classic Racers":{"discipline":"Road / Street","tracks":["Playa Azul Circuit","Emerald Circuit","Sierra Verde Sprint"]},"Classic Sports Cars":{"discipline":"Road / Street","tracks":["Reservorio Sprint","Los Jardines Circuit","Las Laderas"]},"Cult Cars":{"discipline":"Road / Street","tracks":["Chihuahua Circuit","Bola Ocho Circuit","Tunnel Run"]},"Drift Cars":{"discipline":"Road / Street","tracks":["Volcan Sprint","Plaza Circuit","Guanajuato Sur"]},"Extreme Track Toys":{"discipline":"Road / Street","tracks":["Copper Canyon Sprint","Playa Azul Circuit","Riviera Sprint"]},"GT Cars":{"discipline":"Road / Street","tracks":["Gran Pantano Sprint","Reservorio Sprint","Coast Run"]},"Hot Hatch":{"discipline":"Road / Street","tracks":["Emerald Circuit","Chihuahua Circuit","Horizon Callejera"]},"Hypercars":{"discipline":"Road / Street","tracks":["Dunas Blancas Sprint","Riviera Sprint","Wetland Charge"]},"Modern Muscle":{"discipline":"Road / Street","tracks":["Bahía de Plano Circuit","Llanuras Sprint","Carretera Chase"]},"Modern Sports Cars":{"discipline":"Road / Street","tracks":["Sierra Verde Sprint","Tierra Próspera Circuit","Cañón Run"]},"Modern Supercars":{"discipline":"Road / Street","tracks":["Copper Canyon Sprint","Panorámica Sprint","Highland Climb"]},"Rare Classics":{"discipline":"Road / Street","tracks":["Arch of Mulegé Circuit","Los Jardines Circuit","Castillo Del Mar"]},"Retro Hot Hatch":{"discipline":"Road / Street","tracks":["Lookout Circuit","Chihuahua Circuit","Las Afueras"]},"Retro Muscle":{"discipline":"Road / Street","tracks":["Estadio Circuit","Descansar Dorado Sprint","Festival Gatecrash"]},"Retro Saloons":{"discipline":"Road / Street","tracks":["Tierra Próspera Circuit","Horizon Mexico Circuit","Granjas de Tapalpa"]},"Retro Sports Cars":{"discipline":"Road / Street","tracks":["Plaza Circuit","Reservorio Sprint","Bosque Del Sur"]},"Retro Super Cars":{"discipline":"Road / Street","tracks":["Dunas Blancas Sprint","Sierra Verde Sprint","Cruce Del Valle"]},"Rods & Customs":{"discipline":"Road / Street","tracks":["Estadio Circuit","Bola Ocho Circuit","Hilltop Descent"]},"Sports Utility Heroes":{"discipline":"Road / Street","tracks":["Gran Pantano Sprint","Descansar Dorado Sprint","El Lago Blanco"]},"Super GT":{"discipline":"Road / Street","tracks":["Riviera Sprint","Llanuras Sprint","Wetland Charge"]},"Super Hot Hatch":{"discipline":"Road / Street","tracks":["Lookout Circuit","Emerald Circuit","Horizon Callejera"]},"Super Saloons":{"discipline":"Road / Street","tracks":["Tierra Próspera Circuit","Panorámica Sprint","Ruta Norte"]},"Track Toys":{"discipline":"Road / Street","tracks":["Playa Azul Circuit","Copper Canyon Sprint","Jungle Descent"]},"Vans & Utility":{"discipline":"Road / Street","tracks":["Arch of Mulegé Circuit","Horizon Mexico Circuit","Costa Rocosa"]},"Vintage Racers":{"discipline":"Road / Street","tracks":["Los Jardines Circuit","Bahía de Plano Circuit","Plaza Circuit"]}},"rally":{"Classic Rally":["Quarry Trail","La Cantera","Forest Trail","Lago Azulado","Valle De Pozas","Palm Forest"],"Retro Rally":["Senda De Montana","Canyon Trail","Three Hills","Tres Colinas","Joya Marron","Reserva Del Carrizo"],"Modern Rally":["Devil's Pass","Arzate Sprint","Cascada Fuerte","Meridian","Tierras Verdes","Switchback Run"],"Rally Monsters":["El Bosque","The Narrows","Desert Scramble","Rugged Dunes","Orogrande","Crateres Secos"]},"hotwheels":{"Extreme Track Toys":["Nexus Speed Circuit","Canyon Racer Speed Sprint","Twin Loop Speed Circuit","Canyon's Edge Speed Sprint"],"Hypercars":["Nexus Speed Sprint","Canyon Loop Speed Sprint","Ram's Head Speed Sprint","Dragon's Fall Speed Circuit"],"Modern Supercars":["Canyon's Edge Speed Sprint","Canyon Racer Speed Sprint","Nexus Speed Circuit","Twin Loop Speed Circuit"],"Track Toys":["Dragon's Fall Speed Circuit","Waterslide Speed Circuit","Canyon Loop Speed Sprint","Nexus Speed Sprint"],"Super GT":["Ram's Head Speed Sprint","Nexus Speed Sprint","Waterslide Speed Circuit","Dragon's Fall Speed Circuit"],"Retro Super Cars":["Waterslide Speed Circuit","Canyon Loop Speed Sprint","Twin Loop Speed Circuit","Ram's Head Speed Sprint"],"Unlimited Offroad":["Canyon's Drop Hazard Sprint","Volcano Pass Hazard Sprint","Lava Loop Hazard Sprint","Forest Falls Hazard Sprint"],"Offroad":["Forest Falls Hazard Sprint","Forest Gorge Hazard Sprint","Ice Canyon Hazard Sprint","Volcano Pass Hazard Sprint"],"Pickups & 4x4":["Canyon's Drop Hazard Sprint","Ice Loop Hazard Sprint","Forest Gorge Hazard Sprint","Snow Fields Hazard Circuit"],"Unlimited Buggies":["Lava Loop Hazard Sprint","Canyon's Drop Hazard Sprint","Ice Loop Hazard Sprint","Snow Fields Hazard Circuit"],"UTVs":["Forest Gorge Hazard Sprint","Ice Canyon Hazard Sprint","Snow Fields Hazard Circuit","Forest Falls Hazard Sprint"]},"drag":{"Classic Muscle":["Teotihuacan Drag Strip"],"Modern Muscle":["Festival Drag Strip"],"Retro Muscle":["Teotihuacan Drag Strip"],"Rods & Customs":["Teotihuacan Drag Strip"],"Hypercars":["Aerodromo Drag Strip"],"Modern Supercars":["Aerodromo Drag Strip"],"Retro Super Cars":["Festival Drag Strip"],"Super GT":["Festival Drag Strip"],"Extreme Track Toys":["Aerodromo Drag Strip"]},"era":{"1920s":["Los Jardines Circuit","Chihuahua Circuit","Arch of Mulegé Circuit"],"1930s":["Los Jardines Circuit","Bahía de Plano Circuit","Plaza Circuit"],"1940s":["Arch of Mulegé Circuit","Horizon Mexico Circuit","Las Laderas"],"1950s":["Emerald Circuit","Horizon Mexico Circuit","Reservorio Sprint"],"1960s":["Playa Azul Circuit","Reservorio Sprint","Festival Gatecrash"],"1970s":["Tierra Próspera Circuit","Sierra Verde Sprint","Granjas de Tapalpa"],"1980s":["Lookout Circuit","Panorámica Sprint","Bosque Del Sur"],"1990s":["Plaza Circuit","Copper Canyon Sprint","Ruta Norte"],"2000s":["Playa Azul Circuit","Riviera Sprint","Wetland Charge"],"2010s":["Copper Canyon Sprint","Llanuras Sprint","Highland Climb"],"2020s":["Riviera Sprint","Dunas Blancas Sprint","Carretera Chase"]},"vintageClassic":{"Vintage Racers":["Los Jardines Circuit","Bahía de Plano Circuit","Plaza Circuit"],"Rare Classics":["Arch of Mulegé Circuit","Los Jardines Circuit","Castillo Del Mar"],"Classic Racers":["Playa Azul Circuit","Emerald Circuit","Sierra Verde Sprint"],"Classic Sports Cars":["Reservorio Sprint","Los Jardines Circuit","Las Laderas"],"Classic Muscle":["Horizon Mexico Circuit","Arch of Mulegé Circuit","Festival Gatecrash"]},"profiles":{"PERFORMANCE":["Copper Canyon Sprint","Riviera Sprint","Wetland Charge"],"SPORTS":["Sierra Verde Sprint","Playa Azul Circuit","Ruta Norte"],"GT":["Gran Pantano Sprint","Reservorio Sprint","Coast Run"],"SALOON / ROAD":["Tierra Próspera Circuit","Panorámica Sprint","Horizon Callejera"],"HOT HATCH / COMPACT":["Emerald Circuit","Chihuahua Circuit","Las Afueras"],"MUSCLE":["Horizon Mexico Circuit","Bahía de Plano Circuit","Festival Gatecrash"],"CLASSIC":["Arch of Mulegé Circuit","Los Jardines Circuit","Las Laderas"],"RALLY":["Montaña Trail","Barranca Trail","Tapalpa Trail"],"OFFROAD":["Ek' Balam Cross Country","Copper Canyon Cross Country","Las Ranas Cross Country"],"TRUCK / UTILITY":["Airfield Cross Country Circuit","Festival Cross Country","Costera Cross Country Circuit"],"MIXED":["Horizon Mexico Circuit","Copper Canyon Sprint","Tapalpa Trail"],"ODDBALL / SMALL FIELD":["Chihuahua Circuit","Emerald Circuit","Horizon Callejera"]},"manufacturerProfile":{"Abarth":"HOT HATCH / COMPACT","Acura":"SPORTS","Alfa Romeo":"SPORTS","Alpine":"SPORTS","Alumicraft":"OFFROAD","Apollo":"PERFORMANCE","Ariel":"SPORTS","Aston Martin":"GT","Audi":"SALOON / ROAD","Bentley":"GT","BMW":"SALOON / ROAD","Bugatti":"PERFORMANCE","Buick":"MUSCLE","Cadillac":"SALOON / ROAD","Chevrolet":"MIXED","Cupra":"SALOON / ROAD","Deberti":"MIXED","Dodge":"MUSCLE","Exomotive":"OFFROAD","Fast and Furious":"MIXED","Ferrari":"PERFORMANCE","Ford":"MIXED","Formula Drift":"SPORTS","Forsberg Racing":"SPORTS","GMC":"TRUCK / UTILITY","Hennessey":"PERFORMANCE","Holden":"MUSCLE","Honda":"SPORTS","Hoonigan":"RALLY","Hot Wheels":"MIXED","HSV":"MUSCLE","Hyundai":"SALOON / ROAD","Italdesign":"PERFORMANCE","Jaguar":"GT","Jeep":"OFFROAD","Jimco":"OFFROAD","Koenigsegg":"PERFORMANCE","KTM":"SPORTS","Lamborghini":"PERFORMANCE","Lancia":"RALLY","Land Rover":"OFFROAD","Lexus":"GT","Lotus":"SPORTS","Lynk & Co":"SALOON / ROAD","Maserati":"GT","Mazda":"SPORTS","McLaren":"PERFORMANCE","Mercedes-AMG":"SALOON / ROAD","Mercedes-Benz":"GT","Meyers":"OFFROAD","MG":"CLASSIC","MINI":"HOT HATCH / COMPACT","Mitsubishi":"RALLY","Morris":"CLASSIC","Mosler":"PERFORMANCE","Nissan":"SPORTS","Pagani":"PERFORMANCE","Peugeot":"RALLY","Plymouth":"MUSCLE","Polaris":"OFFROAD","Pontiac":"MUSCLE","Porsche":"SPORTS","Renault":"HOT HATCH / COMPACT","Rimac":"PERFORMANCE","RJ Anderson":"OFFROAD","Saleen":"PERFORMANCE","Shelby":"MUSCLE","Sierra Cars":"OFFROAD","SUBARU":"RALLY","Toyota":"MIXED","TVR":"SPORTS","Universal Studios":"ODDBALL / SMALL FIELD","Vauxhall":"SALOON / ROAD","Volkswagen":"HOT HATCH / COMPACT","Volvo":"SALOON / ROAD"}};
const q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function norm(v){
  let s=String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
  if(s==='hypercar')s='hypercars';
  if(s==='rodsandcustoms')s='rodscustoms';
  if(s==='universal')s='universalstudios';
  return s;
}
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function lookup(obj,key){const k=norm(key);for(const [name,val] of Object.entries(obj||{}))if(norm(name)===k)return {name,val};return null}
function profileFor(make){const hit=lookup(D.manufacturerProfile,make);return hit?.val||'MIXED'}
const FAV_ALT={
  PERFORMANCE:'GT',SPORTS:'PERFORMANCE',GT:'SPORTS','SALOON / ROAD':'SPORTS',
  'HOT HATCH / COMPACT':'SALOON / ROAD',MUSCLE:'PERFORMANCE',CLASSIC:'SPORTS',
  RALLY:'MIXED',OFFROAD:'TRUCK / UTILITY','TRUCK / UTILITY':'OFFROAD',
  MIXED:'PERFORMANCE','ODDBALL / SMALL FIELD':'MIXED'
};
function profilePreset(profile,source){
  const hit=lookup(D.profiles,profile)||lookup(D.profiles,'MIXED');
  return hit?{family:'manufacturer',profile:hit.name,discipline:hit.name,tracks:[...hit.val],source:source||hit.name}:null;
}
function classPreset(value,family='default'){
  if(family==='rally'){const h=lookup(D.rally,value);return h?{family:'rally',discipline:'Rally Adventure',tracks:[...h.val],source:h.name}:null}
  if(family==='hotwheels'){const h=lookup(D.hotwheels,value);return h?{family:'hotwheels',discipline:'Hot Wheels',tracks:[...h.val],source:h.name}:null}
  if(family==='drag'){const h=lookup(D.drag,value);return h?{family:'drag',discipline:'Drag Racing',tracks:[...h.val],source:h.name}:null}
  const m=lookup(D.mexico,value);
  if(m)return {family:'mexico',discipline:m.val.discipline,tracks:[...m.val.tracks],source:m.name};
  const r=lookup(D.rally,value);
  if(r)return {family:'rally',discipline:'Rally Adventure',tracks:[...r.val],source:r.name};
  return null;
}
function preset(type,value,context='festival'){
  if(!fh5())return null;
  const t=String(type||'');
  if(t==='festival'){
    if(context==='festival')return {family:'all-cars',discipline:'Festival',tracks:['Copper Canyon Sprint'],source:'All Cars Festival',fixed:true};
    return profilePreset('MIXED','Festival Race Off');
  }
  if(t==='fh5-rally')return classPreset(value,'rally');
  if(t==='fh5-hotwheels')return classPreset(value,'hotwheels');
  if(t==='fh5-drag')return classPreset(value,'drag');
  if(t==='classType')return classPreset(value,'default')||profilePreset('MIXED','Class / Type fallback');
  if(t==='era'){
    const label=String(value).replace(/s$/,'')+'s';
    const h=lookup(D.era,label);return h?{family:'era',discipline:'Road / Street',tracks:[...h.val],source:h.name}:profilePreset('MIXED','Era fallback');
  }
  if(t==='vintage'){const h=lookup(D.vintageClassic,'Vintage Racers');return h?{family:'vintage',discipline:'Road / Street',tracks:[...h.val],source:'Vintage Racers'}:null}
  if(t==='classic'){const h=lookup(D.vintageClassic,'Classic Racers');return h?{family:'classic',discipline:'Road / Street',tracks:[...h.val],source:'Classic Racers'}:null}
  if(t==='make')return profilePreset(profileFor(value),String(value||'Manufacturer'));
  if(t==='favourite'){
    const p=profileFor(value),alt=FAV_ALT[p]||'MIXED';
    return profilePreset(alt,`${value} Favourite • alternate to ${p}`);
  }
  return null;
}
function recFormat(n,type,context='festival'){
  n=Math.max(0,Number(n)||0);
  if(context==='festival'&&type==='festival')return 'standard';
  if(context==='festival'&&type==='fh5-drag')return 'standard';
  if(n<=16)return 'standard';
  if(n<=64)return 'groups';
  return 'swiss';
}
function programTracks(p,format,n){
  const pool=[...(p?.tracks||[])].filter(Boolean);if(!pool.length)return [];
  if(p.fixed)return [pool[0]];
  if(format==='standard')return pool;
  if(format==='groups')return pool.slice(0,Math.min(3,pool.length));
  const need=n<=64?3:4,out=[];for(let i=0;i<need;i++)out.push(pool[i%pool.length]);return out;
}
function roundObjs(names){return names.map(name=>({id:rhId('round'),name,layout:''}))}
function applySetupPreset(type,value){
  if(!fh5()||typeof rhSetup==='undefined'||!rhSetup)return null;
  const p=preset(type,value,'festival');if(!p)return null;
  const n=(rhSetup.entries||[]).length,format=recFormat(n,type,'festival'),tracks=programTracks(p,format,n);
  if(!tracks.length)return null;
  rhSetup.rounds=roundObjs(tracks);
  rhSetup.v8GroupMode=format==='groups';
  rhSetup.v8SwissMode=format==='swiss';
  if(format!=='swiss')rhSetup.v8SwissPlan=null;
  if(format!=='groups')rhSetup.v8GroupPlan=null;
  rhSetup.fh5Preset={format,source:p.source,family:p.family,discipline:p.discipline,pool:[...(p.tracks||[])],fixed:!!p.fixed};
  return rhSetup.fh5Preset;
}
function currentCardMeta(type,value,count){
  const p=preset(type,value,'festival');if(!p)return null;
  const f=recFormat(count,type,'festival'),r=programTracks(p,f,count).length;
  return `${f==='groups'?'GROUPS':f.toUpperCase()} • ${r} ROUND${r===1?'':'S'}`;
}

/* Specialist eligibility is Class/Type matching with punctuation aliases normalised. */
const baseEligible=window.rhEligible;
window.rhEligible=function(type,value){
  if(['fh5-rally','fh5-hotwheels','fh5-drag'].includes(String(type))){
    const k=norm(value);return (rhSpace()?.cars||[]).filter(c=>norm(c.classType)===k);
  }
  return baseEligible(type,value);
};
const baseTrophyKey=window.rhTrophyTypeKey;
window.rhTrophyTypeKey=function(type){return ['fh5-rally','fh5-hotwheels','fh5-drag'].includes(String(type))?'class-type':baseTrophyKey(type)};
const baseSetupLabel=window.rhSetupTypeLabel;
window.rhSetupTypeLabel=function(type){
  if(type==='fh5-rally')return 'RALLY ADVENTURE CHAMPIONSHIP';
  if(type==='fh5-hotwheels')return 'HOT WHEELS CHAMPIONSHIP';
  if(type==='fh5-drag')return 'DRAG RACING CHAMPIONSHIP';
  return baseSetupLabel(type);
};

/* New FH5 Championships arrive preconfigured; saved/prepared runs are never overwritten. */
const baseBegin=window.rhBeginSetup;
window.rhBeginSetup=function(type,value,name){
  if(!fh5())return baseBegin(type,value,name);
  const saved=typeof rhMatchingRun==='function'?rhMatchingRun(type,value,'prepared'):null;
  const out=baseBegin(type,value,name);
  if(saved||typeof rhSetup==='undefined'||!rhSetup)return out;
  applySetupPreset(type,value);
  rhRenderSetup();
  return out;
};

/* Show the recommendation directly on fresh Festival cards. */
const baseChampCard=window.rhChampCard;
window.rhChampCard=function(type,value,name,count){
  let html=baseChampCard(type,value,name,count);
  if(!fh5())return html;
  const existing=(typeof rhMatchingRun==='function'&&(rhMatchingRun(type,value,'active')||rhMatchingRun(type,value,'prepared')));
  if(existing)return html;
  const meta=currentCardMeta(type,value,count);if(!meta)return html;
  return html.replace(/<small>(\d+) eligible car(?:s)?<\/small>/,`<small>${count} eligible car${count===1?'':'s'} • ${meta}</small>`);
};

function familyChampHtml(type,title,data){
  const items=Object.keys(data).map(v=>({v,count:rhEligible(type,v).length})).filter(x=>x.count>=RH_CHAMP_MIN_ELIGIBLE);
  return `<details class="rhFestivalSectionV1 rhFestivalDetailsV1 rhFH5Special8056"><summary>${title} <span>${items.length}</span></summary><div class="rhFestivalExpandedV1"><div class="rhFestivalDetailIntroV1"><i aria-hidden="true">◆</i><span>FH5 specialist presets from the OTG! race-setups library.</span><b>FORMAT &amp; ROUNDS PRELOADED • EDIT BEFORE START</b></div>${items.map(x=>rhChampCard(type,x.v,`${x.v} — ${title.replace(' CHAMPIONSHIPS','')}`,x.count)).join('')||'<p class="small">No eligible cars for this specialist family yet.</p>'}</div></details>`;
}
function injectFestivalSpecialists(){
  if(!fh5())return;
  const root=q('festival');if(!root||root.querySelector('.rhFH5Special8056'))return;
  const target=[...root.querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent.includes('MANUFACTURER CHAMPIONSHIPS'));
  if(!target)return;
  target.insertAdjacentHTML('beforebegin',
    familyChampHtml('fh5-rally','RALLY ADVENTURE CHAMPIONSHIPS',D.rally)+
    familyChampHtml('fh5-hotwheels','HOT WHEELS CHAMPIONSHIPS',D.hotwheels)+
    familyChampHtml('fh5-drag','DRAG RACING CHAMPIONSHIPS',D.drag)
  );
}
const baseFestival=window.rhRenderFestival;
window.rhRenderFestival=function(){const out=baseFestival();injectFestivalSpecialists();return out};

/* The FH5 All Cars Festival is a fixed special: Standard / 1 round / Copper Canyon Sprint. */
function isFixedAllCars(){return fh5()&&typeof rhSetup!=='undefined'&&rhSetup?.type==='festival'}
function enforceAllCars(){
  if(!isFixedAllCars())return;
  rhSetup.v8GroupMode=false;rhSetup.v8SwissMode=false;rhSetup.v8SwissPlan=null;rhSetup.v8GroupPlan=null;
  if(rhSetup.rounds?.length!==1||rhSetup.rounds[0]?.name!=='Copper Canyon Sprint')rhSetup.rounds=roundObjs(['Copper Canyon Sprint']);
  rhSetup.fh5Preset={format:'standard',source:'All Cars Festival',family:'all-cars',discipline:'Festival',pool:['Copper Canyon Sprint'],fixed:true};
}
const baseSetFormat=window.rhV8SetFormat;
window.rhV8SetFormat=function(v){if(isFixedAllCars()){enforceAllCars();rhRenderSetup();toast('All Cars Festival is fixed to Standard • Copper Canyon Sprint');return}return baseSetFormat(v)};
const baseSetFestivalFormat=window.rhV8051SetFestivalFormat;
if(typeof baseSetFestivalFormat==='function')window.rhV8051SetFestivalFormat=function(v){if(isFixedAllCars()){enforceAllCars();rhRenderSetup();toast('All Cars Festival is fixed to Standard • Copper Canyon Sprint');return}return baseSetFestivalFormat(v)};
const baseAddRound=window.rhAddRound,baseRemoveRound=window.rhRemoveRound,baseRenameRound=window.rhRenameRound,baseMoveRound=window.rhMoveRound;
window.rhAddRound=function(){if(isFixedAllCars())return toast('All Cars Festival is fixed to one round');return baseAddRound()};
window.rhRemoveRound=function(id){if(isFixedAllCars())return toast('Copper Canyon Sprint is fixed for All Cars Festival');return baseRemoveRound(id)};
window.rhRenameRound=function(id,v){if(isFixedAllCars()){enforceAllCars();return}return baseRenameRound(id,v)};
window.rhMoveRound=function(i,d){if(isFixedAllCars())return;return baseMoveRound(i,d)};

function decorateSetup(){
  if(!fh5()||typeof rhSetup==='undefined'||!rhSetup)return;
  if(isFixedAllCars())enforceAllCars();
  const p=rhSetup.fh5Preset||preset(rhSetup.type,rhSetup.value,'festival');if(!p)return;
  const body=document.querySelector('#festival .rhSetupBodyV1'),roundPanel=[...document.querySelectorAll('#festival .rhSetupPanelV1')].find(x=>x.textContent.includes('CHAMPIONSHIP ROUNDS'));
  if(body&&!document.getElementById('rhFH5Preset8056')){
    const format=isFixedAllCars()?'STANDARD':rhSetup.v8SwissMode?'SWISS':rhSetup.v8GroupMode?'GROUPS':'STANDARD';
    const source=rhSetup.fh5Preset?.source||p.source||'FH5 preset';
    const pool=(rhSetup.fh5Preset?.pool||p.tracks||[]);
    const html=`<section id="rhFH5Preset8056" class="rhSetupPanelV1"><div class="rhSetupPanelHeadV1"><div><b>FH5 SUGGESTED PROGRAMME</b><p>${E(source)} • ${E(p.discipline||'FH5')}</p></div><strong>${format}</strong></div><div class="rhSetupInfoV1"><i>i</i><p><b>${rhSetup.rounds.length} configured round${rhSetup.rounds.length===1?'':'s'}.</b><br>Suggested pool: ${pool.map(E).join(' • ')}</p></div>${isFixedAllCars()?'<p class="small"><b>ALL CARS SPECIAL:</b> This Championship is intentionally fixed to one round at Copper Canyon Sprint. New eligible cars may still be added after the run starts.</p>':'<p class="small">This is the recommended starting setup. You can change format, entries or rounds before starting.</p>'}</section>`;
    (roundPanel||body.firstElementChild)?.insertAdjacentHTML(roundPanel?'beforebegin':'afterend',html);
  }
  if(isFixedAllCars()){
    document.querySelectorAll('#festival .v8FormatChoices button').forEach(b=>b.disabled=true);
    const round=document.querySelector('#festival .rhSetupRoundsV1 input');if(round)round.readOnly=true;
    document.querySelectorAll('#festival .rhSetupRoundsV1 button').forEach(b=>b.disabled=true);
    const add=document.querySelector('#festival .rhSetupAddRoundV1');if(add)add.hidden=true;
    const quick=document.querySelector('#festival .v7SetupQuick');if(quick)quick.hidden=true;
  }
}
const baseSetupRender=window.rhRenderSetup;
window.rhRenderSetup=function(){if(isFixedAllCars())enforceAllCars();const out=baseSetupRender();decorateSetup();return out};
const baseSavePrepared=window.rhSavePrepared;
window.rhSavePrepared=function(){if(isFixedAllCars())enforceAllCars();return baseSavePrepared()};
const baseConfirmStart=window.rhConfirmStart;
window.rhConfirmStart=function(){if(isFixedAllCars())enforceAllCars();return baseConfirmStart()};

/* Race Off catalogue gets Rally / Hot Wheels specialist families. Drag is Festival-only from v8.0.65. */
function raceOffCard(type,value,name,count){
  const trophy=typeof rhTrophy==='function'?rhTrophy(type):'assets/final/trophy-festival.png';
  return `<button class="rhChampCard rhRaceOffLaunchCard" data-ro-type="${E(type)}" data-ro-value="${E(value)}" data-ro-name="${E(name)}" data-ro-count="${Number(count)||0}"><img src="${trophy}" alt=""><span><b>${E(name)}</b><small>${count} eligible car${count===1?'':'s'}</small></span><em>›</em></button>`;
}
function familyRaceOffHtml(type,title,data){
  const items=Object.keys(data).map(v=>({v,count:rhEligible(type,v).length})).filter(x=>x.count>=RH_CHAMP_MIN_ELIGIBLE);
  return `<details class="rhFestivalSectionV1 rhFestivalDetailsV1 rhFH5RaceOffSpecial8056"><summary>${title} <span>${items.length}</span></summary><div class="rhFestivalExpandedV1"><div class="rhFestivalDetailIntroV1"><i aria-hidden="true">◆</i><span>FH5 specialist Race Off presets with suggested tracks round by round.</span><b>TRACK SUGGESTION • EDIT BEFORE DRAW</b></div>${items.map(x=>raceOffCard(type,x.v,`${x.v} — ${title.replace(' RACE OFFS','')}`,x.count)).join('')||'<p class="small">No eligible cars for this specialist family yet.</p>'}</div></details>`;
}
function injectRaceOffSpecialists(){
  if(!fh5())return;const root=q('raceoff');if(!root||root.querySelector('.rhFH5RaceOffSpecial8056'))return;
  const target=[...root.querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent.includes('MANUFACTURER RACE OFFS'));
  if(!target)return;
  target.insertAdjacentHTML('beforebegin',
   familyRaceOffHtml('fh5-rally','RALLY ADVENTURE RACE OFFS',D.rally)+
   familyRaceOffHtml('fh5-hotwheels','HOT WHEELS RACE OFFS',D.hotwheels));
}
const baseRaceOffRender=window.rhRenderRaceOff;
window.rhRenderRaceOff=function(){const out=baseRaceOffRender();injectRaceOffSpecialists();return out};

function raceOffById(id){try{return (rhSpace()?.raceOffs||[]).find(x=>String(x.id)===String(id))||null}catch(_){return null}}
function finalSuggestion(p){
  if(!p)return '';
  if(p.family==='rally')return 'Horizon Badlands Goliath';
  if(p.family==='hotwheels')return 'Hot Wheels Goliath';
  if(p.family==='drag')return 'Aerodromo Drag Strip';
  const d=String(p.discipline||p.profile||'').toLowerCase();
  if(d.includes('dirt')||d.includes('rally'))return 'The Gauntlet';
  if(d.includes('cross')||d.includes('offroad')||d.includes('truck'))return 'The Titan';
  return 'The Goliath';
}
function raceOffTrack(ro,index){
  const p=preset(ro?.type,ro?.value,'raceoff');if(!p?.tracks?.length)return '';
  const r=ro?.rounds?.[index],field=(r?.entryIds?.length||r?.entrants?.length||(index===0?(ro?.entryIds?.length||ro?.entrants?.length):0));
  if(field===2)return finalSuggestion(p)||p.tracks[index%p.tracks.length];
  return p.tracks[index%p.tracks.length];
}
const baseOpenRaceOffRound=window.rhRaceOffOpenRoundSetup;
if(typeof baseOpenRaceOffRound==='function')window.rhRaceOffOpenRoundSetup=function(id){
  const ro=raceOffById(id),index=Number(ro?.currentRoundIndex||0),suggest=raceOffTrack(ro,index);
  const out=baseOpenRaceOffRound(id);
  if(fh5()&&suggest){
    const input=q('rhRaceOffTrack');
    if(input&&!String(input.value||'').trim())input.value=suggest;
    if(input&&!document.getElementById('rhFH5RaceOffSuggestion8056'))input.insertAdjacentHTML('afterend',`<p id="rhFH5RaceOffSuggestion8056" class="small"><b>FH5 SUGGESTED TRACK:</b> ${E(suggest)} — edit it before REVIEW DRAW if you want a different race.</p>`);
  }
  return out;
};

/* Export tiny read-only hooks for QA. */
window.rhFH5Preset8056=(type,value,context='festival')=>preset(type,value,context);
window.rhFH5Program8056=(type,value,count,context='festival')=>{const p=preset(type,value,context),f=recFormat(count,type,context);return p?{format:f,tracks:programTracks(p,f,count),pool:[...p.tracks]}:null};

})();
