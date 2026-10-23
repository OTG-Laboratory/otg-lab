/* OTG! v8.0.57 — FH5 Groups full-programme continuation.
   Completes the FH5 preset from Preliminary through any Stage 2 and the Final.
   Later-stage suggestions remain editable. No artwork changes. */
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
function finaleFor(p){
 const kind=profileKind(p);
 if(kind==='rally')return 'Horizon Badlands Goliath';
 if(kind==='hotwheels-speed'||kind==='hotwheels-hazard')return 'Hot Wheels Goliath';
 if(kind==='drag')return 'Aerodromo Drag Strip';
 if(kind==='dirt')return 'The Gauntlet';
 if(kind==='cross')return 'The Titan';
 return 'The Goliath';
}
function fillFresh(base,pool,used,count,key,allowUsed=false){
 const out=[];const seen=new Set(used||[]);
 const add=x=>{x=String(x||'').trim();if(!x||SUSPECT.has(x)||out.includes(x))return false;if(!allowUsed&&seen.has(x))return false;out.push(x);return true};
 for(const x of base||[])if(out.length<count)add(x);
 for(const x of rotate(pool||[],key))if(out.length<count)add(x);
 if(out.length<count){for(const x of rotate(uniq([...(base||[]),...(pool||[])]),key+'|repeat')){if(out.length>=count)break;if(!SUSPECT.has(x)&&!out.includes(x))out.push(x)}}
 return out.slice(0,count);
}
function suggestedTracks(type,value,phase,usedInput=[],count=3,seed=''){
 const p=preset(type,value,'festival');if(!p)return [];
 const used=new Set((usedInput||[]).map(x=>String(x||'').trim()).filter(Boolean));
 const base=(p.tracks||[]).filter(x=>!SUSPECT.has(x));
 const pool=disciplinePool(p,`${type}|${value}|${seed}`);
 if(phase==='final'){
   const finale=finaleFor(p),preCount=Math.max(0,count-1);
   const pre=fillFresh(base.filter(x=>x!==finale),pool.filter(x=>x!==finale),used,preCount,`${type}|${value}|final|${seed}`);
   while(pre.length<preCount){const fallback=rotate(uniq([...base,...pool]),`${seed}|final-repeat`);const x=fallback.find(v=>v!==finale&&!pre.includes(v));if(!x)break;pre.push(x)}
   if(count===1)return [finale];
   return [...pre.slice(0,preCount),finale].slice(0,count);
 }
 if(profileKind(p)==='drag'){
   const order=phase==='stage2'?[DRAG_TRACKS[1],DRAG_TRACKS[2],DRAG_TRACKS[0]]:DRAG_TRACKS;
   return Array.from({length:count},(_,i)=>order[i%order.length]);
 }
 return fillFresh(base,pool,used,count,`${type}|${value}|${phase}|${seed}`);
}
function usedTracksFromRun(r){
 const out=[];
 for(const grp of r?.v8Groups?.completedGroups||[])for(const rd of grp.rounds||[])out.push(rd.name);
 for(const rd of r?.rounds||[])out.push(rd.name);
 return uniq(out);
}
function defaultStageNames(rounds){return Array.isArray(rounds)&&rounds.length>0&&rounds.every((rd,i)=>/^Round\s+\d+$/i.test(String(rd?.name||'').trim())||String(rd?.name||'').trim()===`Round ${i+1}`)}
function ensurePendingSuggestion(r){
 const p=r?.v8Groups?.pendingStageSetup;if(!fh5()||!r||!p||p.fh5AutoProgram8057||!defaultStageNames(p.rounds))return false;
 const phase=p.final?'final':'stage2',used=usedTracksFromRun(r),names=suggestedTracks(r.type,r.value,phase,used,p.rounds.length,`stage${p.stage}`);
 if(!names.length)return false;
 p.rounds=p.rounds.map((rd,i)=>({...rd,name:names[i]||rd.name}));
 p.fh5AutoProgram8057={phase,source:'FH5 full Groups programme',suggested:[...names]};
 return true;
}
function actualPlanPreview(setup){
 if(!fh5()||!setup?.v8GroupMode)return null;
 const p=preset(setup.type,setup.value,'festival');if(!p)return null;
 const prelim=uniq((setup.rounds||[]).map(x=>x.name).filter(Boolean));if(!prelim.length)return null;
 let qualifiers=Number(setup.v8GroupPlan?.qualifiers)||0;
 try{if(!qualifiers&&typeof rhV8FestivalEnsurePlan==='function')qualifiers=Number(rhV8FestivalEnsurePlan()?.qualifiers)||0}catch(_){ }
 const used=[...prelim],out={preliminary:prelim,stage2:null,final:null};
 if(qualifiers>10){out.stage2=suggestedTracks(setup.type,setup.value,'stage2',used,3,'stage2');used.push(...out.stage2)}
 out.final=suggestedTracks(setup.type,setup.value,'final',used,3,`stage${qualifiers>10?3:2}`);
 return out;
}
function row(label,tracks){return `<div class="rhFH5ProgrammeRow8057"><b>${E(label)}</b><span>${(tracks||[]).map(E).join(' <em>›</em> ')}</span></div>`}
function decorateInitialSetup(){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup?.v8GroupMode)return;
 const plan=actualPlanPreview(rhSetup);if(!plan||q('rhFH5FullGroups8057'))return;
 const anchor=q('rhFH5Preset8056')||document.querySelector('#festival .v8FormatPanel');if(!anchor)return;
 const sec=document.createElement('section');sec.id='rhFH5FullGroups8057';sec.className='rhSetupPanelV1 rhFH5FullGroups8057';
 sec.innerHTML=`<div class="rhSetupPanelHeadV1"><div><b>FULL GROUPS PROGRAMME</b><p>OTG! has planned the suggested route from qualification to the Championship Final.</p></div><strong>AUTO-SUGGESTED</strong></div>${row('PRELIMINARY ROUND',plan.preliminary)}${plan.stage2?row('ROUND 1',plan.stage2):''}${row('FINAL',plan.final)}<p class="small">Later-stage tracks are filled automatically when you reach them. Every suggestion remains editable before that stage starts.</p>`;
 anchor.insertAdjacentElement('afterend',sec);
}
const baseSetupRender=window.rhRenderSetup;
if(typeof baseSetupRender==='function')window.rhRenderSetup=function(){const out=baseSetupRender.apply(this,arguments);decorateInitialSetup();return out};
const baseStageRender=window.rhV8RenderStageSetup;
if(typeof baseStageRender==='function')window.rhV8RenderStageSetup=function(id){
 const r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>String(x.id)===String(id));
 if(ensurePendingSuggestion(r)&&typeof rhSave==='function')rhSave();
 const out=baseStageRender.apply(this,arguments);const p=r?.v8Groups?.pendingStageSetup;
 if(fh5()&&p?.fh5AutoProgram8057&&!q('rhFH5StageSuggestion8057')){
   const intro=document.querySelector('#festival .v8StageSetupIntro');if(intro){const n=document.createElement('div');n.id='rhFH5StageSuggestion8057';n.className='rhFH5StageSuggestion8057';n.innerHTML=`<b>FH5 SUGGESTED ${p.final?'FINAL':'ROUND '+(p.stage-1)}</b><span>${p.rounds.map(x=>E(x.name)).join(' • ')}</span><small>Preloaded from the full Championship programme • edit before START if you want different tracks.</small>`;intro.appendChild(n)}
 }
 return out;
};
/* QA / inspection hook — read-only. */
window.rhFH5FullGroupProgram8057=function(type,value,count=38,qualifiers=12,stage1Override){
 const p=preset(type,value,'festival');if(!p)return null;
 const initial=Array.isArray(stage1Override)&&stage1Override.length?stage1Override:(window.rhFH5Program8056?.(type,value,count,'festival')?.tracks||[]);
 const used=[...initial],stage2=qualifiers>10?suggestedTracks(type,value,'stage2',used,3,'stage2'):null;if(stage2)used.push(...stage2);
 return {preliminary:[...initial],stage2,final:suggestedTracks(type,value,'final',used,3,`stage${qualifiers>10?3:2}`),finale:finaleFor(p),kind:profileKind(p)};
};
})();
