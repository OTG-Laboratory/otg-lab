/* OTG! v8.0.90 — Race Off variant catalogue binding hotfix.
   v8.0.89 correctly restored Car History BACK, but its stale-ID fallback looked for
   FH5_CATALOGUE on window. The catalogue is a top-level const, so that lookup was empty.
   This patch uses the real global lexical catalogue and repairs both completed and pending
   frozen Race Off snapshots. Main only. No rh-guide changes. */
(()=>{
'use strict';
const same=(a,b)=>String(a??'')===String(b??'');
const norm=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const space=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
const catalogue=()=>{try{return typeof FH5_CATALOGUE!=='undefined'&&Array.isArray(FH5_CATALOGUE)?FH5_CATALOGUE:[]}catch(_){return []}};
const catalogueId=c=>{try{return typeof fh5CarId==='function'?String(fh5CarId(c)||''):String(c?.catalogueId||'')}catch(_){return String(c?.catalogueId||'')}};
const stripVariant=v=>norm(v).replace(/\b(forza edition|welcome pack|anniversary edition)\b/g,'').replace(/\s+/g,' ').trim();

function rowFromId(id){
 const s=space(),sid=String(id||'');if(!s||!sid)return null;
 const keys=new Set([sid]);
 for(const [k,v] of Object.entries(s.catalogueOwned||{}))if(same(v,sid))keys.add(String(k));
 const live=(s.cars||[]).find(c=>same(c?.id,sid));
 if(live?.catalogueId)keys.add(String(live.catalogueId));
 for(const row of catalogue())if(keys.has(catalogueId(row)))return row;
 if(live&&typeof fh5FindCatalogueMatch==='function'){
   try{const row=fh5FindCatalogueMatch(live);if(row)return row}catch(_){ }
 }
 return null;
}
function rowFromFrozen(c){
 if(!c)return null;
 const direct=rowFromId(c.sourceCarId||c.id);if(direct)return direct;
 const all=catalogue();if(!all.length)return null;
 const make=norm(c.make),year=String(c.year||'').trim(),cls=norm(c.classType),model=norm(c.model),name=norm(c.name);
 let pool=all.filter(r=>(!make||norm(r.make)===make)&&(!year||String(r.year||'').trim()===year));
 if(!pool.length)return null;
 // Frozen classType distinguishes same-year variants such as Morris Minor 1000:
 // Cult Cars = normal; Track Toys = Forza Edition.
 if(cls){const byClass=pool.filter(r=>norm(r.classType)===cls);if(byClass.length===1)return byClass[0];if(byClass.length)pool=byClass}
 if(model){const exact=pool.filter(r=>norm(r.model)===model);if(exact.length===1)return exact[0]}
 if(name){const exact=pool.filter(r=>norm(r.full)===name||norm(`${r.full} ${r.year}`)===name);if(exact.length===1)return exact[0]}
 const base=stripVariant(model||name);
 if(base){const hits=pool.filter(r=>stripVariant(r.model||r.full)===base);if(hits.length===1)return hits[0]}
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
window.rhV8090RepairRaceOff=repairRaceOff;
window.rhV8090RepairAllRaceOffs=repairAll;

// Repair immediately, including already-completed match cards, then before every Race Off screen.
repairAll();
const names=['rhRenderRaceOff','rhRenderRaceOffLocked','rhRaceOffOpenRoundSetup','rhRaceOffRenderDrawReview','rhRaceOffRenderDrawComplete','rhRaceOffStartRound','rhRaceOffEnterNext','rhRaceOffCarTransition','rhRaceOffRenderRoundProgress','rhRaceOffRenderChampion','rhRaceOffRenderHistory'];
for(const name of names){const base=window[name];if(typeof base!=='function')continue;window[name]=function(){repairAll();return base.apply(this,arguments)}}

window.rhV8090Report=()=>({catalogueRows:catalogue().length,repairReady:typeof window.rhV8090RepairRaceOff==='function'});
})();
