/* OTG! v8.0.68 — FH5 Festival track randomiser.
   One race slot at a time. Event category selects the eligible pool automatically.
   Drag and fixed/special programmes remain untouched.
*/
(()=>{
'use strict';
const VERSION='8.0.68';
const FH5_KEY='fh5-catalogue-v1';
const TAX=()=>window.rhFH5TrackTaxonomy8067||null;
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const clean=v=>String(v??'').trim();
const uniq=a=>[...new Set((a||[]).map(clean).filter(Boolean))];
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function runs(){try{return typeof rhCurrentRuns==='function'?rhCurrentRuns():(rhSpace()?.runs||[])}catch(_){return[]}}
function category(type,value){try{return TAX()?.eventCategory(type,value)||null}catch(_){return null}}
function label(cat){return {ROAD:'ROAD / STREET',OFFROAD:'OFF-ROAD',RALLY:'RALLY ADVENTURE',HOT_WHEELS:'HOT WHEELS',MIXED:'MIXED'}[cat]||cat||'TRACK';}
function randIndex(n){
 if(n<=1)return 0;
 try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n}catch(_){return Math.floor(Math.random()*n)}
}
function allRunTrackNames(r){
 const out=[];
 const add=v=>{v=clean(v);if(v)out.push(v)};
 for(const rd of r?.rounds||[])add(rd?.name);
 for(const grp of r?.v8Groups?.completedGroups||[])for(const rd of grp?.rounds||[])add(rd?.name);
 const active=r?.v8Groups?.activeGroup;if(active)for(const rd of active?.rounds||[])add(rd?.name);
 for(const rd of r?.v8Swiss?.swissRounds||[])add(rd?.trackName||rd?.name);
 for(const rd of r?.v8Swiss?.ko?.rounds||[])add(rd?.trackName||rd?.name);
 return uniq(out);
}
function recentTracks(excludeRunId=''){
 const list=runs().filter(r=>String(r?.id||'')!==String(excludeRunId||''));
 const out=[];
 for(let i=list.length-1;i>=0&&out.length<18;i--){for(const n of allRunTrackNames(list[i]))if(!out.includes(n))out.push(n);}
 return out.slice(0,18);
}
function choose(pool,{otherCurrent=[],recent=[],priorInRun=[],current=''}={}){
 pool=uniq(pool);if(!pool.length)return '';
 const blockedNow=new Set(uniq(otherCurrent));
 const soft=new Set(uniq([...recent,...priorInRun]));
 const cur=clean(current);
 let candidates=pool.filter(x=>!blockedNow.has(x)&&!soft.has(x)&&x!==cur);
 if(!candidates.length)candidates=pool.filter(x=>!blockedNow.has(x)&&x!==cur);
 if(!candidates.length)candidates=pool.filter(x=>!blockedNow.has(x));
 if(!candidates.length)candidates=pool.filter(x=>x!==cur);
 if(!candidates.length)candidates=pool;
 return candidates[randIndex(candidates.length)]||'';
}
function setupPool(cat){
 const tax=TAX();if(!tax)return [];
 if(cat==='DRAG'||cat==='SPECIAL')return [];
 return tax.standardPool(cat)||[];
}
function stagePriorTracks(r){
 const out=[];
 for(const rd of r?.rounds||[])out.push(rd?.name);
 for(const grp of r?.v8Groups?.completedGroups||[])for(const rd of grp?.rounds||[])out.push(rd?.name);
 return uniq(out);
}
function toastMsg(msg){try{if(typeof toast==='function')toast(msg)}catch(_){}}

window.rhFH5RandomiseSetupRound8068=function(roundId){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup)return;
 const cat=category(rhSetup.type,rhSetup.value);
 if(cat==='DRAG')return toastMsg('Drag keeps its assigned strip');
 if(cat==='SPECIAL')return toastMsg('This special programme is fixed');
 const rd=(rhSetup.rounds||[]).find(x=>String(x.id)===String(roundId));if(!rd)return;
 const pool=setupPool(cat);if(!pool.length)return toastMsg('No random track pool for this event');
 const others=(rhSetup.rounds||[]).filter(x=>String(x.id)!==String(roundId)).map(x=>x.name);
 const pick=choose(pool,{otherCurrent:others,recent:recentTracks(),current:rd.name});
 if(!pick)return toastMsg('No eligible track available');
 rd.name=pick;rd.layout='';rd.fh5Randomised8068=true;
 rhSetup.fh5Randomiser8068={version:VERSION,category:cat,used:true};
 if(typeof rhRenderSetup==='function')rhRenderSetup();
 toastMsg(`Random track: ${pick}`);
};

window.rhFH5RandomiseStageRound8068=function(runId,roundId){
 if(!fh5())return;
 const r=runs().find(x=>String(x.id)===String(runId)),p=r?.v8Groups?.pendingStageSetup;if(!r||!p)return;
 const cat=category(r.type,r.value);
 if(cat==='DRAG')return toastMsg('Drag keeps its assigned strip');
 if(cat==='SPECIAL')return toastMsg('This special programme is fixed');
 const idx=(p.rounds||[]).findIndex(x=>String(x.id)===String(roundId));if(idx<0)return;
 const rd=p.rounds[idx],finaleSlot=!!p.final&&idx===p.rounds.length-1;
 const tax=TAX();let pool=finaleSlot?(tax?.finalePool(cat)||[]):setupPool(cat);
 if(finaleSlot&&pool.length<=1)return toastMsg(pool.length?`Finale locked: ${pool[0]}`:'No finale pool for this event');
 const others=(p.rounds||[]).filter((_,i)=>i!==idx).map(x=>x.name);
 const prior=stagePriorTracks(r);
 const pick=choose(pool,{otherCurrent:others,recent:recentTracks(r.id),priorInRun:prior,current:rd.name});
 if(!pick)return toastMsg('No eligible track available');
 rd.name=pick;rd.layout='';rd.fh5Randomised8068=true;
 p.fh5Randomiser8068={version:VERSION,category:cat,used:true};
 try{if(typeof rhSave==='function')rhSave()}catch(_){ }
 if(typeof rhV8RenderStageSetup==='function')rhV8RenderStageSetup(r.id);
 toastMsg(`${finaleSlot?'Random finale':'Random track'}: ${pick}`);
};

function makeButton(text,handler,cls=''){
 const b=document.createElement('button');b.type='button';b.className=`rhFH5RandomTrack8068 ${cls}`.trim();b.innerHTML=`<span>🎲</span><b>${E(text)}</b>`;b.onclick=handler;return b;
}
function setupHint(cat){
 let h=document.getElementById('rhFH5RandomHint8068');if(h)return;
 const catBox=document.getElementById('rhFH5RaceCategory8067');if(!catBox)return;
 h=document.createElement('div');h.id='rhFH5RandomHint8068';h.className='rhFH5RandomHint8068';
 h.innerHTML=`<b>🎲 TRACK RANDOMISER</b><span>One race at a time • ${E(label(cat))} pool only • avoids duplicates in this set and prefers tracks not used recently.</span>`;
 catBox.insertAdjacentElement('afterend',h);
}
function decorateSetup(){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup)return;
 const cat=category(rhSetup.type,rhSetup.value);if(!cat||cat==='DRAG'||cat==='SPECIAL')return;
 const rounds=rhSetup.rounds||[],wraps=[...document.querySelectorAll('#festival .rhSetupRoundsV1 .rhSetupRoundWrapV1')];
 wraps.forEach((w,i)=>{
   const rd=rounds[i];if(!rd||w.querySelector('.rhFH5RandomTrack8068'))return;
   const b=makeButton(rd.fh5Randomised8068?'REROLL TRACK':'RANDOM TRACK',()=>window.rhFH5RandomiseSetupRound8068(rd.id));
   const saved=w.querySelector('.rhSavedRaceButtonV1');saved?saved.insertAdjacentElement('beforebegin',b):w.appendChild(b);
 });
 if(wraps.length)setupHint(cat);
}
function decorateStage(runId){
 if(!fh5())return;
 const r=runs().find(x=>String(x.id)===String(runId)),p=r?.v8Groups?.pendingStageSetup;if(!r||!p)return;
 const cat=category(r.type,r.value);if(!cat||cat==='DRAG'||cat==='SPECIAL')return;
 const rounds=p.rounds||[],wraps=[...document.querySelectorAll('#festival .v8StageSetupRounds .rhSetupRoundWrapV1')];
 wraps.forEach((w,i)=>{
   const rd=rounds[i];if(!rd||w.querySelector('.rhFH5RandomTrack8068'))return;
   const finaleSlot=!!p.final&&i===rounds.length-1,finales=finaleSlot?(TAX()?.finalePool(cat)||[]):[];
   if(finaleSlot&&finales.length<=1){
     const lock=document.createElement('div');lock.className='rhFH5RandomLocked8068';lock.innerHTML=`<span>🔒</span><b>${E(finales[0]||'FINALE')} LOCKED</b>`;const saved=w.querySelector('.rhSavedRaceButtonV1');saved?saved.insertAdjacentElement('beforebegin',lock):w.appendChild(lock);return;
   }
   const text=finaleSlot?(rd.fh5Randomised8068?'REROLL FINALE':'RANDOM FINALE'):(rd.fh5Randomised8068?'REROLL TRACK':'RANDOM TRACK');
   const b=makeButton(text,()=>window.rhFH5RandomiseStageRound8068(r.id,rd.id),finaleSlot?'finale':'');
   const saved=w.querySelector('.rhSavedRaceButtonV1');saved?saved.insertAdjacentElement('beforebegin',b):w.appendChild(b);
 });
 const intro=document.querySelector('#festival .v8StageSetupIntro');
 if(intro&&!document.getElementById('rhFH5StageRandomHint8068')){const h=document.createElement('div');h.id='rhFH5StageRandomHint8068';h.className='rhFH5RandomHint8068';h.innerHTML=`<b>🎲 TRACK RANDOMISER</b><span>One race at a time • ${E(label(cat))} pool only${p.final?' • final slot uses the protected finale pool':''}.</span>`;intro.appendChild(h)}
}

const baseSetup=window.rhRenderSetup;
if(typeof baseSetup==='function')window.rhRenderSetup=function(){const out=baseSetup.apply(this,arguments);decorateSetup();return out};
const baseStage=window.rhV8RenderStageSetup;
if(typeof baseStage==='function')window.rhV8RenderStageSetup=function(id){const out=baseStage.apply(this,arguments);decorateStage(id);return out};

window.rhFH5TrackRandomiser8068={version:VERSION,choose,recentTracks,setupPool};
})();
