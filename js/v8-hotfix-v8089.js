/* OTG! v8.0.89 — live QA hotfix.
   1) Repair old Race Off snapshots whose sourceCarId no longer maps after catalogue identity migrations.
      Variant identity may be recovered from the frozen make/year/classType/model snapshot.
   2) Restore the v8.0.66 guaranteed fixed BACK control after v8.0.88 replaced the Car History opener.
   Main only. No rh-guide changes. */
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const same=(a,b)=>String(a??'')===String(b??'');
const norm=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const space=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
const cat=()=>Array.isArray(window.FH5_CATALOGUE)?window.FH5_CATALOGUE:[];
const catId=c=>{try{return typeof window.fh5CarId==='function'?String(window.fh5CarId(c)||''):String(c?.catalogueId||'')}catch(_){return String(c?.catalogueId||'')}};
const stripVariant=v=>norm(v).replace(/\b(forza edition|welcome pack|anniversary edition)\b/g,'').replace(/\s+/g,' ').trim();

function rowFromId(id){
 const s=space(),sid=String(id||'');if(!s||!sid)return null;
 const keys=new Set([sid]);
 for(const [k,v] of Object.entries(s.catalogueOwned||{}))if(same(v,sid))keys.add(String(k));
 const live=(s.cars||[]).find(c=>same(c?.id,sid));
 if(live?.catalogueId)keys.add(String(live.catalogueId));
 for(const row of cat())if(keys.has(catId(row)))return row;
 if(live&&typeof window.fh5FindCatalogueMatch==='function'){
   try{const row=window.fh5FindCatalogueMatch(live);if(row)return row}catch(_){ }
 }
 return null;
}
function rowFromFrozen(c){
 if(!c)return null;
 const direct=rowFromId(c.sourceCarId||c.id);if(direct)return direct;
 const all=cat();if(!all.length)return null;
 const make=norm(c.make),year=String(c.year||'').trim(),cls=norm(c.classType),model=norm(c.model),name=norm(c.name);
 let pool=all.filter(r=>(!make||norm(r.make)===make)&&(!year||String(r.year||'').trim()===year));
 if(!pool.length)return null;
 // Old Race Off saves can have a stale ID and an already-collapsed display name, but classType was frozen too.
 // Exact class + make + year is authoritative when it identifies one catalogue row (the Morris FE case).
 if(cls){const byClass=pool.filter(r=>norm(r.classType)===cls);if(byClass.length===1)return byClass[0];if(byClass.length)pool=byClass}
 if(model){const exact=pool.filter(r=>norm(r.model)===model);if(exact.length===1)return exact[0]}
 if(name){const exact=pool.filter(r=>norm(r.full)===name||norm(`${r.full} ${r.year}`)===name);if(exact.length===1)return exact[0]}
 const base=stripVariant(model||name);
 if(base){const baseHits=pool.filter(r=>stripVariant(r.model||r.full)===base);if(baseHits.length===1)return baseHits[0]}
 return pool.length===1?pool[0]:null;
}
function label(row,c){
 if(!row)return String(c?.name||[c?.make,c?.model,c?.year].filter(Boolean).join(' ')||'Unknown car');
 let full=String(row.full||[row.make,row.model].filter(Boolean).join(' ')).trim(),tag='';
 const variants=[[/\s+Forza Edition\b/i,'FORZA EDITION'],[/\s+['‘’]?Welcome Pack['‘’]?\b/i,'WELCOME PACK'],[/\s+Anniversary Edition\b/i,'ANNIVERSARY EDITION']];
 for(const [rx,t] of variants)if(rx.test(full)){full=full.replace(rx,'').trim();tag=t;break}
 const base=[full,String(row.year||c?.year||'').trim()].filter(Boolean).join(' ');
 return tag?`${base} • ${tag}`:base;
}
function repairCar(c){if(!c||typeof c!=='object')return false;const row=rowFromFrozen(c);if(!row)return false;const next=label(row,c);if(!next||next===c.name)return false;c.name=next;return true}
function repairRaceOff(ro){
 if(!ro)return false;let changed=false;const hit=c=>{if(repairCar(c))changed=true};
 (ro.entrants||[]).forEach(hit);hit(ro.champion);
 for(const rd of (ro.rounds||[])){
   (rd.entrants||[]).forEach(hit);(rd.straightThrough||[]).forEach(hit);
   for(const m of (rd.matches||[])){hit(m.carA);hit(m.carB);hit(m.resultA?.car);hit(m.resultB?.car);for(const a of (m.attempts||[]))hit(a?.car)}
 }
 return changed;
}
function repairAll(){const s=space();let changed=false;for(const ro of (s?.raceOffs||[]))if(repairRaceOff(ro))changed=true;if(changed){try{typeof rhSave==='function'&&rhSave()}catch(_){ }}return changed}
window.rhV8089RepairRaceOff=repairRaceOff;
window.rhV8089RepairAllRaceOffs=repairAll;

// Run before every Race Off view which can expose frozen names, then let the existing v8.0.88/base renderer run.
const roFns=['rhRenderRaceOff','rhRenderRaceOffLocked','rhRaceOffOpenRoundSetup','rhRaceOffRenderDrawReview','rhRaceOffRenderDrawComplete','rhRaceOffStartRound','rhRaceOffEnterNext','rhRaceOffCarTransition','rhRaceOffRenderRoundProgress','rhRaceOffRenderChampion','rhRaceOffRenderHistory'];
for(const name of roFns){const base=window[name];if(typeof base!=='function')continue;window[name]=function(){repairAll();return base.apply(this,arguments)}}
repairAll();

// v8.0.88 replaced rhOpenCarHistoryV7001 after v8.0.66 had wrapped it, bypassing the guaranteed fixed Back button.
function closeHistory(){const root=Q('rhCarHistoryV7001');if(root)root.remove()}
function ensureHistoryBack(){
 const root=Q('rhCarHistoryV7001');if(!root)return;
 let b=root.querySelector('.rhCarHistoryBackV8066');
 if(!b){
   b=document.createElement('button');b.type='button';b.className='rhCarHistoryBackV8066';b.setAttribute('aria-label','Back to Garage');
   b.innerHTML='<span aria-hidden="true">‹</span><b>BACK</b>';b.addEventListener('click',closeHistory);root.appendChild(b);
 }
 const legacy=root.querySelector('.v7CarHistoryPage > header > button');
 if(legacy){legacy.classList.add('rhCarHistoryLegacyBackV8066');legacy.onclick=closeHistory}
}
window.rhCloseCarHistoryV8089=closeHistory;
const baseHistory=window.rhOpenCarHistoryV7001;
if(typeof baseHistory==='function')window.rhOpenCarHistoryV7001=function(){const out=baseHistory.apply(this,arguments);ensureHistoryBack();setTimeout(ensureHistoryBack,0);return out};

window.rhV8089Report=()=>({
 raceOffRepairReady:typeof window.rhV8089RepairRaceOff==='function',
 historyBack:!!Q('rhCarHistoryV7001')?.querySelector('.rhCarHistoryBackV8066')
});
})();
