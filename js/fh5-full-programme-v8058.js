/* OTG! v8.0.58 — FH5 full-programme finale diversification.
   Extends the passed v8.0.57 preset system without changing locked artwork.
   - Groups: event/profile-specific Goliath / Colossus / Marathon finales.
   - Swiss: knockout rounds receive editable FH5 track suggestions through the Final.
   - Race Off: final pairing uses the same event/profile-specific showcase map. */
(()=>{
'use strict';
const FH5_KEY='fh5-catalogue-v1';
const SUSPECT=new Set([
  'Desert Dunes Cross Country','Los Jardines Cross Country','Mangrove Cross Country',
  'Mountain Foot Cross Country','Quarry Cross Country Circuit'
]);
const ROAD_CLASSES=['Classic Muscle','Classic Racers','Classic Sports Cars','Cult Cars','Drift Cars','Extreme Track Toys','GT Cars','Hot Hatch','Hypercars','Modern Muscle','Modern Sports Cars','Modern Supercars','Rare Classics','Retro Hot Hatch','Retro Muscle','Retro Saloons','Retro Sports Cars','Retro Super Cars','Rods & Customs','Sports Utility Heroes','Super GT','Super Hot Hatch','Super Saloons','Track Toys','Vans & Utility','Vintage Racers'];
const DIRT_CLASSES=['Buggies','Unlimited Buggies','UTVs'];
const CROSS_CLASSES=['Offroad','Unlimited Offroad','Pickups & 4x4','Trucks'];
const RALLY_CLASSES=['Classic Rally','Retro Rally','Modern Rally','Rally Monsters'];
const HW_SPEED_CLASSES=['Extreme Track Toys','Hypercars','Modern Supercars','Track Toys','Super GT','Retro Super Cars'];
const HW_HAZARD_CLASSES=['Unlimited Offroad','Offroad','Pickups & 4x4','Unlimited Buggies','UTVs'];
const DRAG_TRACKS=['Teotihuacan Drag Strip','Festival Drag Strip','Aerodromo Drag Strip'];
const ROAD_FINALES={
  'Classic Muscle':'The Marathon','Classic Racers':'The Colossus','Classic Sports Cars':'The Colossus',
  'Cult Cars':'The Marathon','Drift Cars':'The Marathon','Extreme Track Toys':'The Goliath',
  'GT Cars':'The Colossus','Hot Hatch':'The Marathon','Hypercars':'The Goliath',
  'Modern Muscle':'The Marathon','Modern Sports Cars':'The Colossus','Modern Supercars':'The Goliath',
  'Rare Classics':'The Colossus','Retro Hot Hatch':'The Marathon','Retro Muscle':'The Marathon',
  'Retro Saloons':'The Marathon','Retro Sports Cars':'The Colossus','Retro Super Cars':'The Goliath',
  'Rods & Customs':'The Marathon','Sports Utility Heroes':'The Colossus','Super GT':'The Goliath',
  'Super Hot Hatch':'The Marathon','Super Saloons':'The Marathon','Track Toys':'The Goliath',
  'Vans & Utility':'The Marathon','Vintage Racers':'The Colossus'
};
const PROFILE_FINALES={
  'PERFORMANCE':'The Goliath','SPORTS':'The Colossus','GT':'The Colossus','SALOON / ROAD':'The Marathon',
  'HOT HATCH / COMPACT':'The Marathon','MUSCLE':'The Marathon','CLASSIC':'The Colossus',
  'RALLY':'The Gauntlet','OFFROAD':'The Titan','TRUCK / UTILITY':'The Titan','MIXED':'The Goliath',
  'ODDBALL / SMALL FIELD':'The Marathon'
};
const ERA_FINALES={
  '1920s':'The Colossus','1930s':'The Colossus','1940s':'The Colossus','1950s':'The Colossus','1960s':'The Colossus',
  '1970s':'The Marathon','1980s':'The Marathon','1990s':'The Marathon',
  '2000s':'The Goliath','2010s':'The Goliath','2020s':'The Goliath'
};
const q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function preset(type,value,context='festival'){try{return window.rhFH5Preset8056?.(type,value,context)||null}catch(_){return null}}
function uniq(a){const out=[],seen=new Set();for(const x of a||[]){const v=String(x||'').trim();if(v&&!seen.has(v)){seen.add(v);out.push(v)}}return out}
function mergePresets(type,values){return uniq(values.flatMap(v=>preset(type,v,'festival')?.tracks||[])).filter(x=>!SUSPECT.has(x))}
function hash(s){let h=2166136261;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rotate(a,key){if(!a?.length)return [];const n=hash(key)%a.length;return a.slice(n).concat(a.slice(0,n))}
function profileKind(p){
 const d=String(p?.discipline||p?.profile||'').toLowerCase();
 if(p?.family==='rally')return 'rally';
 if(p?.family==='hotwheels')return (p.tracks||[]).some(x=>/hazard/i.test(x))?'hotwheels-hazard':'hotwheels-speed';
 if(p?.family==='drag')return 'drag';
 if(d.includes('mixed'))return 'mixed';
 if(d.includes('dirt')||d==='rally')return 'dirt';
 if(d.includes('cross')||d.includes('offroad')||d.includes('truck'))return 'cross';
 return 'road';
}
function disciplinePool(p,key=''){
 const kind=profileKind(p);
 if(kind==='road')return mergePresets('classType',ROAD_CLASSES);
 if(kind==='dirt')return mergePresets('classType',DIRT_CLASSES);
 if(kind==='cross')return mergePresets('classType',CROSS_CLASSES);
 if(kind==='rally')return mergePresets('fh5-rally',RALLY_CLASSES);
 if(kind==='hotwheels-speed')return mergePresets('fh5-hotwheels',HW_SPEED_CLASSES);
 if(kind==='hotwheels-hazard')return mergePresets('fh5-hotwheels',HW_HAZARD_CLASSES);
 if(kind==='drag')return [...DRAG_TRACKS];
 if(kind==='mixed'){
   const road=rotate(mergePresets('classType',ROAD_CLASSES),key+'|road');
   const dirt=rotate(mergePresets('classType',DIRT_CLASSES),key+'|dirt');
   const cross=rotate(mergePresets('classType',CROSS_CLASSES),key+'|cross');
   const out=[];for(let i=0;i<Math.max(road.length,dirt.length,cross.length);i++){if(road[i])out.push(road[i]);if(dirt[i])out.push(dirt[i]);if(cross[i])out.push(cross[i])}return uniq(out);
 }
 return [];
}
function finaleFor(type,value,p){
 if(!p)return 'The Goliath';
 const kind=profileKind(p),t=String(type||''),v=String(value||'');
 if(p.family==='rally')return 'Horizon Badlands Goliath';
 if(p.family==='hotwheels')return 'Hot Wheels Goliath';
 if(p.family==='drag')return 'Aerodromo Drag Strip';
 if(kind==='dirt')return 'The Gauntlet';
 if(kind==='cross')return 'The Titan';
 if(t==='festival')return 'The Goliath';
 if(t==='classType')return ROAD_FINALES[v]||'The Goliath';
 if(t==='era')return ERA_FINALES[/s$/i.test(v)?v:v+'s']||'The Goliath';
 if(t==='vintage')return 'The Colossus';
 if(t==='classic')return 'The Marathon';
 if(t==='make'||t==='favourite'||p.family==='manufacturer')return PROFILE_FINALES[p.profile||p.discipline]||'The Goliath';
 return 'The Goliath';
}
function fillFresh(base,pool,used,count,key){
 const out=[],seen=new Set((used||[]).map(x=>String(x||'').trim()).filter(Boolean));
 const add=x=>{x=String(x||'').trim();if(!x||SUSPECT.has(x)||out.includes(x)||seen.has(x))return false;out.push(x);return true};
 for(const x of base||[])if(out.length<count)add(x);
 for(const x of rotate(pool||[],key))if(out.length<count)add(x);
 if(out.length<count){for(const x of rotate(uniq([...(base||[]),...(pool||[])]),key+'|repeat')){if(out.length>=count)break;if(!SUSPECT.has(x)&&!out.includes(x))out.push(x)}}
 return out.slice(0,count);
}
function usedTracksFromGroupRun(r){
 const out=[];for(const grp of r?.v8Groups?.completedGroups||[])for(const rd of grp.rounds||[])out.push(rd.name);for(const rd of r?.rounds||[])out.push(rd.name);return uniq(out);
}
function defaultStageNames(rounds){return Array.isArray(rounds)&&rounds.length>0&&rounds.every((rd,i)=>/^Round\s+\d+$/i.test(String(rd?.name||'').trim())||String(rd?.name||'').trim()===`Round ${i+1}`)}
function finalGroupTracks(r,pending){
 const p=preset(r.type,r.value,'festival');if(!p)return [];
 const used=usedTracksFromGroupRun(r),finale=finaleFor(r.type,r.value,p),count=pending?.rounds?.length||3,preCount=Math.max(0,count-1);
 const base=(p.tracks||[]).filter(x=>x!==finale&&!SUSPECT.has(x));const pool=disciplinePool(p,`${r.type}|${r.value}|groups-final`).filter(x=>x!==finale);
 const pre=fillFresh(base,pool,used,preCount,`${r.type}|${r.value}|groups-final|${pending?.stage||0}`);
 while(pre.length<preCount){const x=rotate(uniq([...base,...pool]),`${r.type}|${r.value}|groups-final-repeat`).find(v=>v!==finale&&!pre.includes(v)&&!SUSPECT.has(v));if(!x)break;pre.push(x)}
 return [...pre.slice(0,preCount),finale].slice(0,count);
}
function maybeDiversifyPendingFinal(r){
 const p=r?.v8Groups?.pendingStageSetup;if(!fh5()||!r||!p?.final)return false;
 const current=(p.rounds||[]).map(x=>String(x?.name||'').trim());
 const oldAuto=Array.isArray(p.fh5AutoProgram8057?.suggested)&&p.fh5AutoProgram8057.suggested.length===current.length&&p.fh5AutoProgram8057.suggested.every((x,i)=>String(x||'').trim()===current[i]);
 if(!defaultStageNames(p.rounds)&&!oldAuto)return false; // respect manual edits
 const names=finalGroupTracks(r,p);if(!names.length)return false;
 p.rounds=p.rounds.map((rd,i)=>({...rd,name:names[i]||rd.name}));
 p.fh5AutoProgram8058={phase:'final',source:'FH5 diversified full programme',suggested:[...names]};
 try{rhSave()}catch(_){}
 return true;
}
const baseStageRender=window.rhV8RenderStageSetup;
if(typeof baseStageRender==='function')window.rhV8RenderStageSetup=function(id){
 const r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>String(x.id)===String(id));maybeDiversifyPendingFinal(r);
 const out=baseStageRender.apply(this,arguments);const p=r?.v8Groups?.pendingStageSetup;
 if(fh5()&&p?.fh5AutoProgram8058&&!q('rhFH5StageSuggestion8058')){const intro=document.querySelector('#festival .v8StageSetupIntro');if(intro){const n=document.createElement('div');n.id='rhFH5StageSuggestion8058';n.className='rhFH5StageSuggestion8057';n.innerHTML=`<b>FH5 SUGGESTED FINAL</b><span>${p.rounds.map(x=>E(x.name)).join(' • ')}</span><small>Diversified showcase programme • edit before START if you want different tracks.</small>`;intro.appendChild(n)}}
 return out;
};
function updateGroupsPreview(){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup?.v8GroupMode)return;
 const box=q('rhFH5FullGroups8057');if(!box)return;const p=preset(rhSetup.type,rhSetup.value,'festival');if(!p)return;
 const prelim=uniq((rhSetup.rounds||[]).map(x=>x.name).filter(Boolean)),finale=finaleFor(rhSetup.type,rhSetup.value,p),row=[...box.querySelectorAll('.rhFH5ProgrammeRow8057')].find(x=>x.querySelector('b')?.textContent.trim()==='FINAL');if(!row)return;
 let qualifiers=Number(rhSetup.v8GroupPlan?.qualifiers)||0;try{if(!qualifiers&&typeof rhV8FestivalEnsurePlan==='function')qualifiers=Number(rhV8FestivalEnsurePlan()?.qualifiers)||0}catch(_){ }
 const used=[...prelim];if(qualifiers>10){const old=window.rhFH5FullGroupProgram8057?.(rhSetup.type,rhSetup.value,(rhSetup.entries||[]).length,qualifiers,prelim)?.stage2||[];used.push(...old)}
 const fake={type:rhSetup.type,value:rhSetup.value,rounds:prelim,v8Groups:{completedGroups:[]}},pending={rounds:[{name:'Round 1'},{name:'Round 2'},{name:'Round 3'}],stage:qualifiers>10?3:2,final:true};
 const base=(p.tracks||[]).filter(x=>x!==finale&&!SUSPECT.has(x));const pool=disciplinePool(p,`${rhSetup.type}|${rhSetup.value}|preview`).filter(x=>x!==finale);const pre=fillFresh(base,pool,used,2,`${rhSetup.type}|${rhSetup.value}|preview-final`);
 const names=[...pre,finale];const span=row.querySelector('span');if(span)span.innerHTML=names.map(E).join(' <em>›</em> ');
}
const baseSetupRender=window.rhRenderSetup;
if(typeof baseSetupRender==='function')window.rhRenderSetup=function(){const out=baseSetupRender.apply(this,arguments);updateGroupsPreview();return out};

/* Race Off: replace only the untouched automatic generic final suggestion. */
function raceOffById(id){try{return (rhSpace()?.raceOffs||[]).find(x=>String(x.id)===String(id))||null}catch(_){return null}}
const baseRaceOffOpen=window.rhRaceOffOpenRoundSetup;
if(typeof baseRaceOffOpen==='function')window.rhRaceOffOpenRoundSetup=function(id){
 const ro=raceOffById(id),index=Number(ro?.currentRoundIndex||0),rd=ro?.rounds?.[index],field=(rd?.entryIds?.length||rd?.entrants?.length||(index===0?(ro?.entryIds?.length||ro?.entrants?.length):0)),p=preset(ro?.type,ro?.value,'raceoff'),want=field===2?finaleFor(ro?.type,ro?.value,p):'';
 const out=baseRaceOffOpen.apply(this,arguments);
 if(fh5()&&want){const input=q('rhRaceOffTrack');if(input&&(!String(input.value||'').trim()||String(input.value||'').trim()==='The Goliath'))input.value=want;const note=q('rhFH5RaceOffSuggestion8056');if(note)note.innerHTML=`<b>FH5 SUGGESTED TRACK:</b> ${E(want)} — diversified showcase final • edit before REVIEW DRAW if you want a different race.`}
 return out;
};

/* Swiss knockout: one suggested track per knockout round, Final uses the showcase map. */
function swissUsed(r){const out=[];for(const rd of r?.v8Swiss?.swissRounds||[])if(rd?.trackName)out.push(rd.trackName);for(const rd of r?.v8Swiss?.ko?.rounds||[])if(rd?.trackName)out.push(rd.trackName);return uniq(out)}
function swissSuggestion(r,rd){
 const p=preset(r?.type,r?.value,'festival');if(!p)return '';
 const n=Number(rd?.participantIds?.length)||0,finale=finaleFor(r.type,r.value,p);if(n<=2)return finale;
 if(profileKind(p)==='drag'){if(n>=16)return DRAG_TRACKS[0];if(n>=8)return DRAG_TRACKS[1];return DRAG_TRACKS[0]}
 const used=swissUsed(r),pool=disciplinePool(p,`${r.type}|${r.value}|swiss-ko`);
 return rotate(pool,`${r.type}|${r.value}|swiss-ko|${n}`).find(x=>x&&!SUSPECT.has(x)&&x!==finale&&!used.includes(x))||rotate(pool,`${r.type}|${r.value}|swiss-ko|${n}|repeat`).find(x=>x&&!SUSPECT.has(x)&&x!==finale)||finale;
}
const baseOpenRun=window.rhOpenRun;
if(typeof baseOpenRun==='function')window.rhOpenRun=function(id){
 const r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>String(x.id)===String(id));
 if(fh5()&&r?.format==='swiss'&&r?.v8Swiss?.phase==='ko'){
   const ko=r.v8Swiss.ko,rd=ko?.rounds?.[ko.currentRound];
   if(rd?.status==='setup'&&!String(rd.trackName||'').trim()){
     const s=swissSuggestion(r,rd);if(s){rd.trackName=s;rd.fh5Suggested8058=s;try{rhSave()}catch(_){}}
   }
 }
 const out=baseOpenRun.apply(this,arguments);
 if(fh5()&&r?.format==='swiss'&&r?.v8Swiss?.phase==='ko'){
   const ko=r.v8Swiss.ko,rd=ko?.rounds?.[ko.currentRound],input=q('rhV8051KOTrack');
   if(input&&rd?.fh5Suggested8058&&!q('rhFH5SwissSuggestion8058'))input.insertAdjacentHTML('afterend',`<p id="rhFH5SwissSuggestion8058" class="small"><b>FH5 SUGGESTED TRACK:</b> ${E(rd.trackName)} — edit before START ${E(rd.label)} if you want a different race.</p>`);
 }
 return out;
};

/* Read-only QA hooks. */
window.rhFH5Finale8058=(type,value,context='festival')=>{const p=preset(type,value,context);return p?finaleFor(type,value,p):null};
window.rhFH5SwissKOTrack8058=(type,value,participants=8,used=[])=>{const p=preset(type,value,'festival');if(!p)return null;const fake={type,value,v8Swiss:{swissRounds:(used||[]).map(trackName=>({trackName})),ko:{rounds:[]}}};return swissSuggestion(fake,{participantIds:Array.from({length:Number(participants)||0})})};
})();
