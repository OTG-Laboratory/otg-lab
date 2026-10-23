/* OTG! v8.0.67 — FH5 race-category + track-taxonomy foundation.
   Stage 1 only: categories and pools. NO track randomiser yet.
   Existing configured tracks remain untouched.
*/
(()=>{
'use strict';
const VERSION='8.0.67';
const FH5_KEY='fh5-catalogue-v1';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const norm=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const TRACKS=[];
const ALIAS=new Map();
function add(names,meta){for(const name of names)TRACKS.push({name,...meta});}

/* Mexico — Road / Street. Long finales are tagged separately and excluded from standard pool. */
const ROAD=[
 'Arch of Mulegé Circuit','Bahía De Plano Circuit','Bola Ocho Circuit','Cathedral Circuit','Chihuahua Circuit','Copper Canyon Sprint',
 'Descansar Dorado Sprint','Dunas Blancas Sprint','Emerald Circuit','Estadio Circuit','Gran Pantano Sprint','Horizon Mexico Circuit',
 'Llanuras Sprint','Lookout Circuit','Los Jardines Circuit','Panorámica Sprint','Playa Azul Circuit','Plaza Circuit','Reservorio Sprint',
 'Riviera Sprint','Sierra Verde Sprint','Tierra Próspera Circuit','Volcán Sprint'
];
const STREET=[
 'Bosque Del Sur','Cañón Run','Carretera Chase','Castillo Del Mar','Coast Run','Costa Rocosa','Cruce Del Valle','El Lago Blanco',
 'Festival Gatecrash','Granjas De Tapalpa','Guanajuato Sur','Highland Climb','Hilltop Descent','Horizon Callejera','Jungle Descent',
 'Las Afueras','Las Laderas','Ruta Norte','Tunnel Run','Wetland Charge'
];
add(ROAD,{world:'Mexico',category:'ROAD',discipline:'Road Racing',standard:true,finale:false});
add(STREET,{world:'Mexico',category:'ROAD',discipline:'Street Racing',standard:true,finale:false});
add(['The Goliath','The Colossus'],{world:'Mexico',category:'ROAD',discipline:'Road Racing',standard:false,finale:true,finaleFor:['ROAD']});
add(['The Marathon'],{world:'Mexico',category:'ROAD',discipline:'Street Racing',standard:false,finale:true,finaleFor:['ROAD']});

/* Mexico — Dirt / Cross Country combine into OTG! OFFROAD. */
const DIRT=[
 'Baja California Trail','Bajío Trail','Barranca Trail','Caldera Scramble','Cascada Trail','Cordillera Trail','Desierto Trail',
 'El Pípila Scramble','Fuera Del Camino Trail','Horizon Baja Scramble','La Selva Scramble','Mangrove Scramble','Montaña Trail',
 'Mulegé Town Scramble','River Scramble','San Juan Scramble','Tapalpa Trail','Teotihuacán Scramble','Tulum Trail'
];
const CROSS=[
 'Airfield Cross Country Circuit','Baja Cross Country Circuit','Copper Canyon Cross Country','Costa Este Cross Country',
 'Costera Cross Country Circuit',"Ek' Balam Cross Country Circuit",'El Descenso Cross Country','Estadio Cross Country',
 'Festival Cross Country','Foto Final Cross Country','Herencia Cross Country Circuit','Las Dunas Cross Country','Las Granjas Cross Country',
 'Las Ranas Cross Country','Oasis Cross Country','Restos Cross Country','Ribera Rocosa Cross Country','Tropico Cross Country',
 'Urban Cross Country Circuit'
];
add(DIRT,{world:'Mexico',category:'OFFROAD',discipline:'Dirt Racing',standard:true,finale:false});
add(CROSS,{world:'Mexico',category:'OFFROAD',discipline:'Cross Country',standard:true,finale:false});
add(['The Titan'],{world:'Mexico',category:'OFFROAD',discipline:'Cross Country',standard:false,finale:true,finaleFor:['OFFROAD']});
add(['The Gauntlet'],{world:'Mexico',category:'OFFROAD',discipline:'Dirt Racing',standard:false,finale:true,finaleFor:['OFFROAD'],roadWildcard:true});

/* Rally Adventure — normal pool stays entirely inside Sierra Nueva. */
const RALLY=[
 "Devil's Pass",'El Bosque','Quarry Trail','Arzate Sprint','The Narrows','La Cantera','Canyon Trail','Senda De Montana',
 'Cascada Fuerte','Three Hills','Lago Azulado','Desert Scramble','Meridian','Forest Trail','Rugged Dunes','Tres Colinas',
 'Reserva Del Carrizo','Orogrande','Tierras Verdes','Joya Marron','Crateres Secos','Valle De Pozas','Palm Forest','Switchback Run'
];
add(RALLY,{world:'Sierra Nueva',category:'RALLY',discipline:'Rally Adventure',standard:true,finale:false});
add(['Horizon Badlands Goliath'],{world:'Sierra Nueva',category:'RALLY',discipline:'Rally Adventure',standard:false,finale:true,finaleFor:['RALLY']});

/* Hot Wheels — Speed + Hazard normal pool; Goliath reserved for finale. */
const HW_SPEED=[
 'Canyon Loop Speed Sprint','Canyon Racer Speed Sprint',"Canyon's Edge Speed Sprint","Dragon's Fall Speed Circuit",
 'Nexus Speed Circuit','Nexus Speed Sprint',"Ram's Head Speed Sprint",'Twin Loop Speed Circuit','Waterslide Speed Circuit'
];
const HW_HAZARD=[
 "Canyon's Drop Hazard Sprint",'Forest Falls Hazard Sprint','Forest Gorge Hazard Sprint','Ice Canyon Hazard Sprint',
 'Ice Loop Hazard Sprint','Lava Loop Hazard Sprint','Snow Fields Hazard Circuit','Volcano Pass Hazard Sprint'
];
add(HW_SPEED,{world:'Hot Wheels Park',category:'HOT_WHEELS',discipline:'Speed Racing',standard:true,finale:false});
add(HW_HAZARD,{world:'Hot Wheels Park',category:'HOT_WHEELS',discipline:'Hazard Racing',standard:true,finale:false});
add(['Hot Wheels Goliath'],{world:'Hot Wheels Park',category:'HOT_WHEELS',discipline:'Speed Racing',standard:false,finale:true,finaleFor:['HOT_WHEELS']});

/* Drag remains its own locked specialist family. */
add(['Teotihuacan Drag Strip','Festival Drag Strip','Aerodromo Drag Strip'],{world:'Mexico',category:'DRAG',discipline:'Drag Racing',standard:true,finale:false});

/* Known legacy/source-name aliases. These only resolve names; they do not rewrite saved races. */
const aliases={
 "Ek' Balam Cross Country":"Ek' Balam Cross Country Circuit",
 'Urban Cross Country':'Urban Cross Country Circuit',
 'Costera Cross Country':'Costera Cross Country Circuit',
 'Estadio Cross Country Circuit':'Estadio Cross Country',
 'Tropic Cross Country':'Tropico Cross Country',
 'Desert Dunes Cross Country':'Oasis Cross Country',
 'Los Jardines Cross Country':'Las Granjas Cross Country',
 'Mangrove Cross Country':'Costa Este Cross Country',
 'Mountain Foot Cross Country':'Foto Final Cross Country',
 'Quarry Cross Country Circuit':'Herencia Cross Country Circuit'
};
for(const t of TRACKS)ALIAS.set(norm(t.name),t.name);
for(const [from,to] of Object.entries(aliases))ALIAS.set(norm(from),to);
function canonical(name){const key=norm(name);return ALIAS.get(key)||String(name||'').trim();}
function track(name){const c=canonical(name),k=norm(c);return TRACKS.find(t=>norm(t.name)===k)||null;}

function categoryForPreset(p,type,value){
 if(!p)return null;
 const family=String(p.family||'').toLowerCase(),d=String(p.discipline||p.profile||'').toUpperCase();
 if(family==='all-cars'||p.fixed&&String(type)==='festival')return 'SPECIAL';
 if(family==='drag'||d.includes('DRAG'))return 'DRAG';
 if(family==='hotwheels'||d.includes('HOT WHEELS'))return 'HOT_WHEELS';
 if(family==='rally')return 'RALLY';
 if(d==='MIXED'||d.includes('MIXED'))return 'MIXED';
 if(d.includes('DIRT')||d.includes('CROSS')||d.includes('OFFROAD')||d.includes('TRUCK')||d==='RALLY')return 'OFFROAD';
 return 'ROAD';
}
function eventCategory(type,value){
 try{const p=window.rhFH5Preset8056?.(type,value,'festival');return p?.raceCategory||categoryForPreset(p,type,value)}catch(_){return null}
}
function standardPool(category){
 if(category==='MIXED')return TRACKS.filter(t=>t.standard&&(t.category==='ROAD'||t.category==='OFFROAD')).map(t=>t.name);
 return TRACKS.filter(t=>t.standard&&t.category===category).map(t=>t.name);
}
function finalePool(category,{includeRoadGauntlet=false}={}){
 let out=TRACKS.filter(t=>t.finale&&Array.isArray(t.finaleFor)&&t.finaleFor.includes(category)).map(t=>t.name);
 if(category==='ROAD'&&includeRoadGauntlet)out.push('The Gauntlet');
 return uniq(out);
}
function setupCategory(){
 try{
   if(typeof rhSpace!=='function'||rhSpace()?.catalogueKey!==FH5_KEY||typeof rhSetup==='undefined'||!rhSetup)return null;
   const p=window.rhFH5Preset8056?.(rhSetup.type,rhSetup.value,'festival')||rhSetup.fh5Preset;
   const cat=p?.raceCategory||categoryForPreset(p,rhSetup.type,rhSetup.value);
   if(rhSetup.fh5Preset&&cat)rhSetup.fh5Preset.raceCategory=cat;
   if(cat)rhSetup.fh5RaceCategory=cat;
   return cat;
 }catch(_){return null}
}
function auditNames(names){return (names||[]).map(name=>({input:name,canonical:canonical(name),track:track(name),ok:!!track(name)}));}
function summary(){
 const cats=['ROAD','OFFROAD','RALLY','HOT_WHEELS','DRAG'];
 return Object.fromEntries(cats.map(c=>[c,{standard:standardPool(c).length,finales:finalePool(c).length}]));
}

/* Add explicit raceCategory to the public FH5 preset API. Existing preset behaviour is unchanged. */
const basePreset=window.rhFH5Preset8056;
if(typeof basePreset==='function')window.rhFH5Preset8056=function(type,value,context='festival'){
 const p=basePreset.apply(this,arguments);if(!p)return p;
 return {...p,raceCategory:categoryForPreset(p,type,value)};
};

function categoryCopy(cat){
 const labels={ROAD:'ROAD / STREET',OFFROAD:'OFF-ROAD',RALLY:'RALLY ADVENTURE',HOT_WHEELS:'HOT WHEELS',DRAG:'DRAG',MIXED:'MIXED',SPECIAL:'SPECIAL / FIXED'};
 const n=cat==='SPECIAL'?0:standardPool(cat).length;
 const finale=cat==='ROAD'?finalePool('ROAD').length:finalePool(cat).length;
 let small=cat==='SPECIAL'?'Existing fixed special programme — not part of the future random pool.':`${n} standard eligible track${n===1?'':'s'} catalogued`;
 if(finale)small+=` • ${finale} finale${finale===1?'':'s'}`;
 if(cat==='ROAD')small+=' • The Gauntlet tagged as an optional evil finale wildcard';
 if(cat==='MIXED')small+=' across Road + Off-road';
 return {label:labels[cat]||cat||'UNASSIGNED',small};
}
function decorateSetup(){
 const cat=setupCategory();if(!cat)return;
 const root=document.getElementById('festival'),anchor=root?.querySelector('#rhFH5Preset8056');if(!root||!anchor)return;
 let box=root.querySelector('#rhFH5RaceCategory8067');if(box)box.remove();
 const copy=categoryCopy(cat),pool=rhSetup?.fh5Preset?.pool||[];
 const check=auditNames(pool),known=check.filter(x=>x.ok).length;
 box=document.createElement('div');box.id='rhFH5RaceCategory8067';box.className=`rhFH5RaceCategory8067 cat-${cat.toLowerCase().replace('_','-')}`;
 box.innerHTML=`<div><small>RACE CATEGORY</small><b>${E(copy.label)}</b><span>${E(copy.small)}</span></div><strong>${known}/${pool.length} CURRENT SUGGESTIONS RECOGNISED</strong>`;
 anchor.insertAdjacentElement('afterend',box);
}
const baseRenderSetup=window.rhRenderSetup;
if(typeof baseRenderSetup==='function')window.rhRenderSetup=function(){const out=baseRenderSetup.apply(this,arguments);decorateSetup();return out};

/* Later Groups stage setup: show the event category without changing any tracks. */
const baseStage=window.rhV8RenderStageSetup;
if(typeof baseStage==='function')window.rhV8RenderStageSetup=function(id){
 const out=baseStage.apply(this,arguments);
 try{
   const r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>String(x.id)===String(id));
   const cat=eventCategory(r?.type,r?.value);const host=document.querySelector('#festival .v8StageSetupIntro');
   if(cat&&host&&!document.getElementById('rhFH5StageCategory8067')){const c=categoryCopy(cat),d=document.createElement('div');d.id='rhFH5StageCategory8067';d.className='rhFH5StageCategory8067';d.innerHTML=`<small>RACE CATEGORY</small><b>${E(c.label)}</b>`;host.appendChild(d)}
 }catch(_){ }
 return out;
};

window.rhFH5TrackTaxonomy8067={version:VERSION,tracks:TRACKS.map(x=>({...x})),canonical,track,standardPool,finalePool,categoryForPreset,eventCategory,auditNames,summary};
})();
