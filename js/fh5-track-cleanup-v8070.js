/* OTG! v8.0.70 — FH5 full track cleanup + persistent shuffle bags + Race Off unique routes.
   - Adds every permanent Mexico Road route currently usable by OTG! (Winter Wonderland excluded by design).
   - Keeps Rally Adventure Ambassador races catalogued as SPECIAL / protected, not in the random pool.
   - Festival randomiser uses a persistent per-category shuffle bag. Preview/reroll does not consume a track;
     the final randomised selections are consumed only when the Championship / stage is STARTED.
   - Race Off has its own independent shuffle bags and auto-plans a unique track for every non-final bracket stage.
     Finals remain protected showcase routes. No Race Off random button is added.
   - Fresh Festival default programmes are diversified across the expanded taxonomy without touching saved/prepared runs.
*/
(()=>{
'use strict';
const VERSION='8.0.70';
const FH5_KEY='fh5-catalogue-v1';
const BAG_KEY='fh5TrackBags8070';
const OLD_TAX=window.rhFH5TrackTaxonomy8067||null;
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const clean=v=>String(v??'').trim();
const norm=v=>clean(v).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
const uniq=a=>[...new Set((a||[]).map(clean).filter(Boolean))];
const now=()=>new Date().toISOString();
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function space(){try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}}
function runs(){try{return typeof rhCurrentRuns==='function'?rhCurrentRuns():(space()?.runs||[])}catch(_){return[]}}
function toastMsg(msg){try{if(typeof toast==='function')toast(msg)}catch(_){}}
function randIndex(n){if(n<=1)return 0;try{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%n}catch(_){return Math.floor(Math.random()*n)}}
function shuffle(a){a=[...(a||[])];for(let i=a.length-1;i>0;i--){const j=randIndex(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function hash(s){let h=2166136261;for(const c of String(s||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}

/* ---------- Complete FH5 taxonomy used by OTG! ---------- */
const ADD_ROAD=[
 'Horizon Oval Circuit','Vista Del Mar Sprint','Marigold Sprint','Aeródromo Sprint','Línea Costera Sprint',
 'Cloverleaf Sprint','San Juan Sprint','Valle Del Rio Sprint','Rocosa Sprint','Horizon Stadium Circuit'
];
const RALLY_SPECIAL=['The Apex Run','Raptor Race!','Desafio'];
const DROP=new Set(['Winter Wonderland Circuit']);
const tracks=(OLD_TAX?.tracks||[]).filter(t=>!DROP.has(clean(t?.name))).map(t=>({...t}));
/* Correct the one old Cross Country canonical label while retaining an alias below. */
for(const t of tracks)if(norm(t.name)===norm('Estadio Cross Country'))t.name='Estadio Cross Country Circuit';
for(const name of ADD_ROAD)if(!tracks.some(t=>norm(t.name)===norm(name)))tracks.push({name,world:'Mexico',category:'ROAD',discipline:'Road Racing',standard:true,finale:false,added8070:true});
for(const name of RALLY_SPECIAL)if(!tracks.some(t=>norm(t.name)===norm(name)))tracks.push({name,world:'Sierra Nueva',category:'RALLY',discipline:'Rally Adventure',standard:false,finale:false,special:true,protected:true,added8070:true});
const alias=new Map();
for(const t of tracks)alias.set(norm(t.name),t.name);
const aliases={
 'Aerodromo Sprint':'Aeródromo Sprint','Aerodromo Sprint Pro':'Aeródromo Sprint','Aeródromo Sprint Pro':'Aeródromo Sprint',
 'Linea Costera Sprint':'Línea Costera Sprint','Vista del Mar Sprint':'Vista Del Mar Sprint','Valle del Rio Sprint':'Valle Del Rio Sprint',
 'Estadio Cross Country':'Estadio Cross Country Circuit','Estadio Cross Country Circuit':'Estadio Cross Country Circuit',
 "Ek' Balam Cross Country":"Ek' Balam Cross Country Circuit",'Urban Cross Country':'Urban Cross Country Circuit',
 'Costera Cross Country':'Costera Cross Country Circuit','Tropic Cross Country':'Tropico Cross Country',
 'Desert Dunes Cross Country':'Oasis Cross Country','Los Jardines Cross Country':'Las Granjas Cross Country',
 'Mangrove Cross Country':'Costa Este Cross Country','Mountain Foot Cross Country':'Foto Final Cross Country',
 'Quarry Cross Country Circuit':'Herencia Cross Country Circuit'
};
for(const [from,to] of Object.entries(aliases))alias.set(norm(from),to);
function canonical(name){return alias.get(norm(name))||clean(name)}
function track(name){const c=canonical(name);return tracks.find(t=>norm(t.name)===norm(c))||null}
function standardPool(cat){
 if(cat==='MIXED')return tracks.filter(t=>t.standard&&(t.category==='ROAD'||t.category==='OFFROAD')).map(t=>t.name);
 return tracks.filter(t=>t.standard&&t.category===cat).map(t=>t.name);
}
function finalePool(cat,{includeRoadGauntlet=false}={}){
 let out=tracks.filter(t=>t.finale&&Array.isArray(t.finaleFor)&&t.finaleFor.includes(cat)).map(t=>t.name);
 if(cat==='ROAD'&&includeRoadGauntlet)out.push('The Gauntlet');return uniq(out);
}
function categoryForPreset(p,type,value){
 if(!p)return null;const family=String(p.family||'').toLowerCase(),d=String(p.discipline||p.profile||'').toUpperCase();
 if(family==='all-cars'||(p.fixed&&String(type)==='festival'))return 'SPECIAL';
 if(family==='drag'||d.includes('DRAG'))return 'DRAG';
 if(family==='hotwheels'||d.includes('HOT WHEELS'))return 'HOT_WHEELS';
 if(family==='rally')return 'RALLY';
 if(d==='MIXED'||d.includes('MIXED'))return 'MIXED';
 if(d.includes('DIRT')||d.includes('CROSS')||d.includes('OFFROAD')||d.includes('TRUCK')||d==='RALLY')return 'OFFROAD';
 return 'ROAD';
}
function eventCategory(type,value,context='festival'){
 try{const p=window.rhFH5Preset8056?.(type,value,context);return p?.raceCategory||categoryForPreset(p,type,value)}catch(_){return null}
}
function summary(){return Object.fromEntries(['ROAD','OFFROAD','RALLY','HOT_WHEELS','DRAG'].map(c=>[c,{standard:standardPool(c).length,finales:finalePool(c).length}]))}
const enhancedTax={
 version:VERSION,tracks:tracks.map(x=>({...x})),canonical,track,standardPool,finalePool,categoryForPreset,
 eventCategory:(type,value)=>eventCategory(type,value,'festival'),auditNames:names=>(names||[]).map(input=>({input,canonical:canonical(input),track:track(input),ok:!!track(input)})),summary,
 specialTracks:tracks.filter(t=>t.special).map(t=>t.name),excludedSeasonal:['Winter Wonderland Circuit']
};
window.rhFH5TrackTaxonomy8067=enhancedTax;
window.rhFH5TrackTaxonomy8070=enhancedTax;

/* ---------- Persistent shuffle bags ---------- */
function rootBags(){
 const s=space();if(!s)return null;
 if(!s[BAG_KEY]||typeof s[BAG_KEY]!=='object')s[BAG_KEY]={version:VERSION,festival:{},raceoff:{}};
 const root=s[BAG_KEY];root.version=VERSION;root.festival=root.festival||{};root.raceoff=root.raceoff||{};return root;
}
function bagState(mode,cat,pool){
 const root=rootBags();if(!root)return {remaining:[...pool],knownPool:[...pool],cycle:1};
 const box=root[mode]||(root[mode]={});let b=box[cat];pool=uniq(pool);
 if(!b||typeof b!=='object')b=box[cat]={remaining:[...pool],knownPool:[...pool],cycle:1};
 const known=uniq(b.knownPool||[]),oldRemaining=uniq(b.remaining||[]).filter(x=>pool.includes(canonical(x))).map(canonical);
 const added=pool.filter(x=>!known.map(canonical).includes(canonical(x)));
 b.remaining=uniq([...oldRemaining,...added]);b.knownPool=[...pool];b.cycle=Math.max(1,Number(b.cycle)||1);return b;
}
function bagView(mode,cat,pool){const b=bagState(mode,cat,pool);return {cycle:b.cycle,remaining:b.remaining.length?[...b.remaining]:[...pool],rolling:b.remaining.length===0}}
function consumeBag(mode,cat,pool,selected){
 pool=uniq(pool);selected=uniq((selected||[]).map(canonical).filter(x=>pool.includes(x)));if(!selected.length)return false;
 const b=bagState(mode,cat,pool),old=[...b.remaining];let remaining=[...old];
 const fromCurrent=selected.filter(x=>remaining.includes(x));remaining=remaining.filter(x=>!fromCurrent.includes(x));
 const overflow=selected.filter(x=>!old.includes(x));
 if(overflow.length&&remaining.length===0){b.cycle+=1;remaining=[...pool].filter(x=>!overflow.includes(x));}
 b.remaining=remaining;b.updatedAt=now();return true;
}
function drawSequence(mode,cat,pool,count,{exclude=[]}={}){
 pool=uniq(pool);count=Math.max(0,Number(count)||0);if(!count||!pool.length)return [];
 const view=bagView(mode,cat,pool),blocked=new Set(uniq(exclude).map(canonical));let first=shuffle(view.remaining.filter(x=>!blocked.has(x))),out=[];
 while(out.length<count&&first.length){const x=first.shift();if(!out.includes(x))out.push(x)}
 if(out.length<count){const refill=shuffle(pool.filter(x=>!blocked.has(x)&&!out.includes(x)));while(out.length<count&&refill.length)out.push(refill.shift())}
 return out.slice(0,count);
}
function drawOne(mode,cat,pool,{exclude=[],current=''}={}){
 const cur=canonical(current),blocked=new Set(uniq(exclude).map(canonical));const view=bagView(mode,cat,pool);
 let candidates=view.remaining.filter(x=>!blocked.has(x)&&x!==cur);
 if(!candidates.length)candidates=pool.filter(x=>!blocked.has(x)&&x!==cur);
 if(!candidates.length)candidates=pool.filter(x=>!blocked.has(x));
 if(!candidates.length)candidates=pool.filter(x=>x!==cur);
 if(!candidates.length)candidates=[...pool];return candidates[randIndex(candidates.length)]||'';
}
function label(cat){return {ROAD:'ROAD / STREET',OFFROAD:'OFF-ROAD',RALLY:'RALLY ADVENTURE',HOT_WHEELS:'HOT WHEELS',MIXED:'MIXED'}[cat]||cat||'TRACK'}
function setupPool(cat){if(cat==='DRAG'||cat==='SPECIAL')return [];return standardPool(cat)}
function guardCategory(cat){if(cat==='DRAG'){toastMsg('Drag keeps its assigned strip');return false}if(cat==='SPECIAL'){toastMsg('This special programme is fixed');return false}return !!cat}

/* ---------- Festival randomiser: true shuffle bag ---------- */
window.rhFH5RandomiseSetupRound8069=function(roundId){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup)return;const cat=eventCategory(rhSetup.type,rhSetup.value,'festival');if(!guardCategory(cat))return;
 const rd=(rhSetup.rounds||[]).find(x=>String(x.id)===String(roundId));if(!rd)return;const pool=setupPool(cat);if(!pool.length)return toastMsg('No random track pool for this event');
 const others=(rhSetup.rounds||[]).filter(x=>String(x.id)!==String(roundId)).map(x=>x.name);const pick=drawOne('festival',cat,pool,{exclude:others,current:rd.name});if(!pick)return toastMsg('No eligible track available');
 rd.name=pick;rd.layout='';rd.fh5Randomised8069=true;rd.fh5Randomised8070=true;rhSetup.fh5Randomiser8069={version:VERSION,category:cat,used:true,all:false};rhSetup.fh5Randomiser8070={version:VERSION,category:cat,used:true,all:false};
 if(typeof rhRenderSetup==='function')rhRenderSetup();toastMsg(`Random track: ${pick}`);
};
window.rhFH5RandomiseAllSetup8069=function(){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup)return;const cat=eventCategory(rhSetup.type,rhSetup.value,'festival');if(!guardCategory(cat))return;
 const rounds=rhSetup.rounds||[],pool=setupPool(cat);if(!rounds.length)return toastMsg('No race slots to randomise');if(!pool.length)return toastMsg('No random track pool for this event');
 const picks=drawSequence('festival',cat,pool,rounds.length);rounds.forEach((rd,i)=>{if(!picks[i])return;rd.name=picks[i];rd.layout='';rd.fh5Randomised8069=true;rd.fh5Randomised8070=true});
 rhSetup.fh5Randomiser8069={version:VERSION,category:cat,used:true,all:true};rhSetup.fh5Randomiser8070={version:VERSION,category:cat,used:true,all:true};if(typeof rhRenderSetup==='function')rhRenderSetup();toastMsg(`Randomised ${picks.length} track${picks.length===1?'':'s'} from the shuffle bag`);
};
window.rhFH5RandomiseStageRound8069=function(runId,roundId){
 if(!fh5())return;const r=runs().find(x=>String(x.id)===String(runId)),p=r?.v8Groups?.pendingStageSetup;if(!r||!p)return;const cat=eventCategory(r.type,r.value,'festival');if(!guardCategory(cat))return;
 const idx=(p.rounds||[]).findIndex(x=>String(x.id)===String(roundId));if(idx<0)return;const rd=p.rounds[idx],finaleSlot=!!p.final&&idx===p.rounds.length-1;
 let pool=finaleSlot?finalePool(cat):setupPool(cat);if(finaleSlot&&pool.length<=1)return toastMsg(pool.length?`Finale locked: ${pool[0]}`:'No finale pool for this event');
 const others=(p.rounds||[]).filter((_,i)=>i!==idx).map(x=>x.name);const pick=finaleSlot?drawOne('festival',`FINALE_${cat}`,pool,{exclude:others,current:rd.name}):drawOne('festival',cat,pool,{exclude:others,current:rd.name});if(!pick)return toastMsg('No eligible track available');
 rd.name=pick;rd.layout='';rd.fh5Randomised8069=true;rd.fh5Randomised8070=true;p.fh5Randomiser8069={version:VERSION,category:cat,used:true,all:false};p.fh5Randomiser8070={version:VERSION,category:cat,used:true,all:false};try{rhSave()}catch(_){}if(typeof rhV8RenderStageSetup==='function')rhV8RenderStageSetup(r.id);toastMsg(`${finaleSlot?'Random finale':'Random track'}: ${pick}`);
};
window.rhFH5RandomiseAllStage8069=function(runId){
 if(!fh5())return;const r=runs().find(x=>String(x.id)===String(runId)),p=r?.v8Groups?.pendingStageSetup;if(!r||!p)return;const cat=eventCategory(r.type,r.value,'festival');if(!guardCategory(cat))return;
 const rounds=p.rounds||[];if(!rounds.length)return toastMsg('No race slots to randomise');const finaleLocked=!!p.final&&finalePool(cat).length<=1;const normalCount=rounds.length-(p.final?1:0);const picks=drawSequence('festival',cat,setupPool(cat),normalCount);
 let changed=0;for(let i=0;i<normalCount;i++){if(!picks[i])continue;rounds[i].name=picks[i];rounds[i].layout='';rounds[i].fh5Randomised8069=true;rounds[i].fh5Randomised8070=true;changed++}
 if(p.final&&rounds.length){const i=rounds.length-1,fp=finalePool(cat);if(fp.length===1){rounds[i].name=fp[0]}else if(fp.length>1){const pick=drawOne('festival',`FINALE_${cat}`,fp,{current:rounds[i].name});rounds[i].name=pick;rounds[i].layout='';rounds[i].fh5Randomised8069=true;rounds[i].fh5Randomised8070=true;changed++}}
 p.fh5Randomiser8069={version:VERSION,category:cat,used:true,all:true};p.fh5Randomiser8070={version:VERSION,category:cat,used:true,all:true};try{rhSave()}catch(_){}if(typeof rhV8RenderStageSetup==='function')rhV8RenderStageSetup(r.id);toastMsg(`Randomised ${changed} track${changed===1?'':'s'}${finaleLocked?' • protected finale kept':''}`);
};

/* Consume Festival bag only when START freezes the chosen randomised tracks. */
const baseConfirm8070=window.rhConfirmStart;
if(typeof baseConfirm8070==='function')window.rhConfirmStart=function(){
 const setup=(typeof rhSetup!=='undefined'&&rhSetup)?rhSetup:null,s=space(),before=s?.runs?.length||0;let cat=null,pool=[],chosen=[];
 if(fh5()&&setup){cat=eventCategory(setup.type,setup.value,'festival');pool=setupPool(cat);chosen=(setup.rounds||[]).filter(rd=>rd?.fh5Randomised8070||rd?.fh5Randomised8069).map(rd=>canonical(rd.name)).filter(x=>pool.includes(x));}
 const out=baseConfirm8070.apply(this,arguments);if(s&&s.runs?.length>before&&chosen.length&&consumeBag('festival',cat,pool,chosen)){try{rhSave()}catch(_){}}return out;
};
const baseStartStage8070=window.rhV8StartNextStage;
if(typeof baseStartStage8070==='function')window.rhV8StartNextStage=function(id){
 const r=runs().find(x=>String(x.id)===String(id)),p=r?.v8Groups?.pendingStageSetup,cat=r?eventCategory(r.type,r.value,'festival'):null,pool=setupPool(cat),chosen=(p?.rounds||[]).filter(rd=>rd?.fh5Randomised8070||rd?.fh5Randomised8069).map(rd=>canonical(rd.name)).filter(x=>pool.includes(x));
 const out=baseStartStage8070.apply(this,arguments);if(chosen.length&&consumeBag('festival',cat,pool,chosen)){try{rhSave()}catch(_){}}return out;
};

/* ---------- Fresh Festival defaults: expanded balanced programme ---------- */
function deterministicProgramme(pool,key,count,exclude=[]){
 pool=uniq(pool).filter(x=>!exclude.includes(x));count=Math.min(Math.max(0,Number(count)||0),pool.length);if(!count)return [];
 const start=hash(key)%pool.length,step=11,out=[];for(let i=0;out.length<count&&i<pool.length*2;i++){const x=pool[(start+i*step)%pool.length];if(x&&!out.includes(x))out.push(x)}return out;
}
function applyFreshFestivalDefault(type,value){
 if(!fh5()||typeof rhSetup==='undefined'||!rhSetup||type==='festival'||type==='fh5-drag')return false;
 const cat=eventCategory(type,value,'festival');if(!guardCategory(cat))return false;const pool=setupPool(cat),count=rhSetup.rounds?.length||0;if(!pool.length||!count)return false;
 const names=deterministicProgramme(pool,`${type}|${value}|festival-default`,count);if(!names.length)return false;
 rhSetup.rounds=rhSetup.rounds.map((rd,i)=>({...rd,name:names[i]||rd.name,layout:''}));rhSetup.fh5Preset=rhSetup.fh5Preset||{};rhSetup.fh5Preset.pool=[...names];rhSetup.fh5Preset.source=`${rhSetup.fh5Preset.source||value||'FH5'} • v8.0.70 diversified`;rhSetup.fh5Default8070={version:VERSION,category:cat,tracks:[...names]};return true;
}
const baseBegin8070=window.rhBeginSetup;
if(typeof baseBegin8070==='function')window.rhBeginSetup=function(type,value,name){
 let saved=null;try{saved=fh5()&&typeof rhMatchingRun==='function'?rhMatchingRun(type,value,'prepared'):null}catch(_){}
 const out=baseBegin8070.apply(this,arguments);if(!saved&&applyFreshFestivalDefault(type,value)){try{if(typeof rhRenderSetup==='function')rhRenderSetup()}catch(_){}}return out;
};

/* Re-diversify later GROUPS stage defaults once, but respect any manual user edits after that. */
function defaultStageNames(rounds){return Array.isArray(rounds)&&rounds.length>0&&rounds.every((rd,i)=>/^Round\s+\d+$/i.test(clean(rd?.name))||clean(rd?.name)===`Round ${i+1}`)}
function maybeDiversifyPending8070(r){
 const p=r?.v8Groups?.pendingStageSetup;if(!fh5()||!r||!p||p.fh5AutoProgram8070)return false;
 const oldAuto=!!(p.fh5AutoProgram8057||p.fh5AutoProgram8058);if(!oldAuto&&!defaultStageNames(p.rounds))return false;
 const cat=eventCategory(r.type,r.value,'festival');if(!guardCategory(cat))return false;const count=p.rounds?.length||0,finalCount=p.final?1:0,normal=Math.max(0,count-finalCount),pool=setupPool(cat),used=[];
 for(const rd of r.rounds||[])used.push(canonical(rd.name));for(const g of r.v8Groups?.completedGroups||[])for(const rd of g.rounds||[])used.push(canonical(rd.name));
 let names=deterministicProgramme(pool,`${r.type}|${r.value}|stage|${p.stage}`,normal,uniq(used));if(names.length<normal)names=deterministicProgramme(pool,`${r.type}|${r.value}|stage|${p.stage}|refill`,normal);
 if(p.final){const fin=window.rhFH5Finale8058?.(r.type,r.value,'festival')||finalePool(cat)[0]||'';names.push(fin)}
 p.rounds=p.rounds.map((rd,i)=>({...rd,name:names[i]||rd.name,layout:''}));p.fh5AutoProgram8070={version:VERSION,category:cat,suggested:[...names]};try{rhSave()}catch(_){}return true;
}

/* ---------- Race Off: unique auto-plan + independent shuffle bags ---------- */
function raceOffById(id){try{return (space()?.raceOffs||[]).find(x=>String(x.id)===String(id))||null}catch(_){return null}}
function pow2Floor(n){let p=1;while(p*2<=n)p*=2;return p}
function stageLabel(n){n=Number(n)||0;if(n===2)return'FINAL';if(n===4)return'SEMI-FINALS';if(n===8)return'QUARTER-FINALS';return`ROUND OF ${n}`}
function stagesForCount(count){let field=Math.max(2,Number(count)||2),target=pow2Floor(field),out=[];if(field>target){out.push('PRELIMINARY ROUND');field=target}while(field>=2){out.push(stageLabel(field));if(field===2)break;field=Math.floor(field/2)}return out}
function raceOffCategory(ro){return eventCategory(ro?.type,ro?.value,'raceoff')}
function reservedRaceOffTracks(cat,exceptId=''){
 const out=[];for(const other of space()?.raceOffs||[]){if(!other||String(other.id)===String(exceptId)||['complete','abandoned'].includes(other.status))continue;const p=other.fh5TrackPlan8070;if(p?.version!==VERSION||p?.category!==cat||!Array.isArray(p.tracks))continue;
  const last=Math.max(0,p.tracks.length-1),start=Math.max(0,Number(other.currentRoundIndex||0));for(let i=start;i<last;i++){const rd=other.rounds?.[i];if(!rd?.fh5BagCommitted8070&&p.tracks[i])out.push(canonical(p.tracks[i]))}
 }return uniq(out);
}
function ensureRaceOffPlan(ro){
 if(!fh5()||!ro)return null;const liveCount=Math.max(2,Number(ro.entryIds?.length||ro.entrants?.length||0)),cat=raceOffCategory(ro),pool=setupPool(cat),existing=ro.fh5TrackPlan8070,currentIndex=Math.max(0,Number(ro.currentRoundIndex||0));
 /* Once a Race Off has advanced beyond round 0, its original full route is immutable. The live entrant
    field shrinks every round, so rebuilding from liveCount here would shift every later track one stage early. */
 if(existing?.version===VERSION&&existing.category===cat&&Array.isArray(existing.stages)&&Array.isArray(existing.tracks)&&existing.stages.length===existing.tracks.length&&currentIndex>0)return existing;
 const stages=stagesForCount(liveCount);if(!pool.length||!stages.length)return null;
 if(existing?.version===VERSION&&existing.entryCount===liveCount&&existing.category===cat&&Array.isArray(existing.tracks)&&existing.tracks.length===stages.length)return existing;
 const nonFinal=Math.max(0,stages.length-1),reserved=reservedRaceOffTracks(cat,ro.id);let pre=drawSequence('raceoff',cat,pool,nonFinal,{exclude:reserved});if(pre.length<nonFinal){const extra=drawSequence('raceoff',cat,pool,nonFinal-pre.length,{exclude:pre});pre=uniq([...pre,...extra]).slice(0,nonFinal)}const fin=window.rhFH5Finale8058?.(ro.type,ro.value,'raceoff')||finalePool(cat)[0]||'';const plan={version:VERSION,entryCount:liveCount,category:cat,stages,tracks:[...pre,fin],createdAt:now()};ro.fh5TrackPlan8070=plan;try{rhSave()}catch(_){}return plan;
}
function decorateRaceOff8070(id){
 if(!fh5())return;const ro=raceOffById(id),plan=ensureRaceOffPlan(ro);if(!ro||!plan)return;const i=Number(ro.currentRoundIndex||0),rd=ro.rounds?.[i],want=plan.tracks[i]||'';
 const input=document.getElementById('rhRaceOffTrack');if(input&&want&&!clean(rd?.name))input.value=want;
 const note=document.getElementById('rhFH5RaceOffSuggestion8056');if(note&&want)note.innerHTML=`<b>FH5 AUTO ROUTE:</b> ${E(want)} — unique ${E(label(plan.category))} track for this bracket stage • Final stays protected.`;
 const box=document.getElementById('rhFH5FullRaceOff8060');if(box){[...box.querySelectorAll('[data-ro-stage]')].forEach(row=>{const idx=Number(row.dataset.roStage)||0,span=row.querySelector('span');if(span&&plan.tracks[idx])span.textContent=plan.tracks[idx]});const p=box.querySelector('p.small');if(p)p.textContent='OTG! v8.0.70 unique route: every non-final bracket stage uses a different track. The Final stays on its protected showcase route.'}
}
const baseOpenRaceOff8070=window.rhRaceOffOpenRoundSetup;
if(typeof baseOpenRaceOff8070==='function')window.rhRaceOffOpenRoundSetup=function(id){const ro=raceOffById(id);if(ro)ensureRaceOffPlan(ro);const out=baseOpenRaceOff8070.apply(this,arguments);decorateRaceOff8070(id);return out};
const baseStartDraw8070=window.rhRaceOffStartDraw;
if(typeof baseStartDraw8070==='function')window.rhRaceOffStartDraw=function(id,index=0){
 const ro=raceOffById(id),plan=ensureRaceOffPlan(ro),i=Number(index)||0,rd=ro?.rounds?.[i],before=rd?.status;const out=baseStartDraw8070.apply(this,arguments);
 const after=ro?.rounds?.[i];if(ro&&plan&&after?.status==='drawn'&&before!=='drawn'&&i<plan.tracks.length-1&&!after.fh5BagCommitted8070){const pool=setupPool(plan.category),actual=canonical(after.name);if(pool.includes(actual)&&consumeBag('raceoff',plan.category,pool,[actual])){after.fh5BagCommitted8070=true;after.fh5BagCommittedTrack8070=actual;try{rhSave()}catch(_){}}}
 return out;
};

/* ---------- UI copy / stage default wrapper ---------- */
function refreshHints8070(){
 if(!fh5())return;try{
  if(typeof rhSetup!=='undefined'&&rhSetup){
   const cat=eventCategory(rhSetup.type,rhSetup.value,'festival'),pool=setupPool(cat),h=document.getElementById('rhFH5RandomHint8069');
   if(h&&pool.length){const v=bagView('festival',cat,pool);h.innerHTML=`<b>🎲 TRACK SHUFFLE BAG</b><span>${E(label(cat))} • ${v.remaining.length}/${pool.length} available in this cycle • tracks leave the bag only when you START • no repeats until the bag is exhausted and refilled.</span>`}
   /* v8.0.67's category card was rendered from the old 43-track closure. Refresh its copy and
      recognition count from the live v8.0.70 taxonomy so newly-added permanent routes never look unknown. */
   const box=document.getElementById('rhFH5RaceCategory8067');
   if(box){
    const info=box.querySelector('div span'),strong=box.querySelector('strong'),finales=finalePool(cat).length;
    if(info){let copy=(cat==='SPECIAL')?'Existing fixed special programme — not part of the random pool.':`${pool.length} standard eligible track${pool.length===1?'':'s'} catalogued`;
     if(finales)copy+=` • ${finales} finale${finales===1?'':'s'}`;if(cat==='MIXED')copy+=' across Road + Off-road';info.textContent=copy;}
    if(strong){const suggestions=rhSetup?.fh5Preset?.pool||[],known=suggestions.filter(x=>!!track(x)).length;strong.textContent=`${known}/${suggestions.length} CURRENT SUGGESTIONS RECOGNISED`;}
   }
  }
 }catch(_){}
}
const baseRenderSetup8070=window.rhRenderSetup;
if(typeof baseRenderSetup8070==='function')window.rhRenderSetup=function(){const out=baseRenderSetup8070.apply(this,arguments);refreshHints8070();return out};
const baseRenderStage8070=window.rhV8RenderStageSetup;
if(typeof baseRenderStage8070==='function')window.rhV8RenderStageSetup=function(id){const r=runs().find(x=>String(x.id)===String(id));maybeDiversifyPending8070(r);const out=baseRenderStage8070.apply(this,arguments);const p=r?.v8Groups?.pendingStageSetup,cat=r?eventCategory(r.type,r.value,'festival'):null,pool=setupPool(cat),h=document.getElementById('rhFH5StageRandomHint8069');if(h&&pool.length){const v=bagView('festival',cat,pool);h.innerHTML=`<b>🎲 TRACK SHUFFLE BAG</b><span>${E(label(cat))} • ${v.remaining.length}/${pool.length} available in this cycle • START commits the selected tracks${p?.final?' • protected finale is outside the bag':''}.</span>`}return out};

/* Reset Racing Data / Full Reset also reset the shuffle bags. The legacy reset implementation owns its
   confirmation click, so attach a second one-shot save after the reset button is created. */
function addBagResetListener(){const b=document.getElementById('rhResetConfirm6090');if(!b||b.dataset.rhBagReset8070)return;b.dataset.rhBagReset8070='1';b.addEventListener('click',()=>{const s=space();if(s){delete s[BAG_KEY];try{rhSave()}catch(_){}}},{once:true})}
const baseResetConfirm8070=window.rhResetConfirm;if(typeof baseResetConfirm8070==='function')window.rhResetConfirm=function(){const out=baseResetConfirm8070.apply(this,arguments);addBagResetListener();return out};
const baseFullResetConfirm8070=window.rhFullResetConfirm;if(typeof baseFullResetConfirm8070==='function')window.rhFullResetConfirm=function(){const out=baseFullResetConfirm8070.apply(this,arguments);addBagResetListener();return out};

/* Read-only QA hooks. */
window.rhFH5TrackCleanup8070={
 version:VERSION,summary,canonical,standardPool,finalePool,specialTracks:[...RALLY_SPECIAL],excludedSeasonal:['Winter Wonderland Circuit'],
 bagSnapshot:(mode='festival',cat='ROAD')=>{const pool=setupPool(cat),v=bagView(mode,cat,pool);return {mode,category:cat,total:pool.length,remaining:v.remaining.length,cycle:v.cycle,tracks:[...v.remaining]}},
 stagesForCount,deterministicProgramme,
 raceOffPlan:(type,value,count)=>{const fake={type,value,entryIds:Array.from({length:Math.max(2,Number(count)||2)})};const cat=raceOffCategory(fake),pool=setupPool(cat),stages=stagesForCount(count),pre=drawSequence('raceoff',cat,pool,Math.max(0,stages.length-1)),fin=window.rhFH5Finale8058?.(type,value,'raceoff')||finalePool(cat)[0]||'';return {category:cat,stages,tracks:[...pre,fin]}}
};
})();
