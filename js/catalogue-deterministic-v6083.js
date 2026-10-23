/* OTG! v6.0.83 — deterministic catalogue identity + one-to-one ownership repair (FH5 + GT7). */
(()=>{
'use strict';
const FH5_KEY='fh5-catalogue-v1', GT7_KEY='gt7-catalogue-v1', REPAIR_VERSION='6.0.83';
function pad(n){return String(n+1).padStart(4,'0')}
function legacyFh5(c){return 'fh5-'+fh5Slug(c.full+'-'+c.year)}
function legacyGt7(c){return 'gt7-'+gt7Slug(c.make+'-'+c.model+'-'+c.year)}
function installIds(list,prefix){(list||[]).forEach((c,i)=>{const id=`${prefix}-v1-${pad(i)}`;try{Object.defineProperty(c,'catalogueId',{value:id,enumerable:true,writable:false,configurable:false})}catch(_){c.catalogueId=id}})}
installIds(typeof FH5_CATALOGUE!=='undefined'?FH5_CATALOGUE:[], 'fh5');
installIds(typeof GT7_CATALOGUE!=='undefined'?GT7_CATALOGUE:[], 'gt7');
function exactNorm(v){return String(v||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function def(s){
 if(!s)return null;
 if(s.catalogueKey===FH5_KEY&&typeof FH5_CATALOGUE!=='undefined')return {key:FH5_KEY,title:'Forza Horizon 5',list:FH5_CATALOGUE,newId:c=>c.catalogueId,oldId:legacyFh5,target:null};
 if(s.catalogueKey===GT7_KEY&&typeof GT7_CATALOGUE!=='undefined')return {key:GT7_KEY,title:'Gran Turismo 7',list:GT7_CATALOGUE,newId:c=>c.catalogueId,oldId:legacyGt7,target:null};
 return null
}
function rowFromAnyId(d,id){id=String(id||'');return d.list.find(c=>d.newId(c)===id||d.oldId(c)===id)||null}
function exactRow(d,car){
 if(!car)return null;
 let hit=rowFromAnyId(d,car.catalogueId)||rowFromAnyId(d,car.id);if(hit)return hit;
 const make=exactNorm(car.make||car.manufacturer), model=exactNorm(car.model), name=exactNorm(car.name), year=String(car.year||'').trim();
 const matches=d.list.filter(c=>exactNorm(c.make)===make&&String(c.year||'').trim()===year&&(exactNorm(c.model)===model||exactNorm(c.full)===name));
 return matches.length===1?matches[0]:null
}
// Ownership matching is now exact only. No contains/token/similarity/alias fallback is allowed.
window.fh5CarId=c=>c?.catalogueId||legacyFh5(c);
window.gt7CarId=c=>c?.catalogueId||legacyGt7(c);
window.fh5FindCatalogueMatch=car=>exactRow({list:FH5_CATALOGUE,newId:c=>c.catalogueId,oldId:legacyFh5},car);
window.gt7FindCatalogueMatch=car=>exactRow({list:GT7_CATALOGUE,newId:c=>c.catalogueId,oldId:legacyGt7},car);
function referencedIds(s){const out=new Set();(s.runs||[]).forEach(r=>{(r.entries||[]).forEach(x=>out.add(String(x)));(r.results||[]).forEach(x=>x?.carId!=null&&out.add(String(x.carId)))});(s.customEvents||[]).forEach(e=>{(e.carIds||[]).forEach(x=>out.add(String(x)));(e.results||[]).forEach(x=>x?.carId!=null&&out.add(String(x.carId)))});return out}
function masterFields(c){return {make:c.make||'',model:c.model||'',year:String(c.year||''),classType:c.classType||'',name:c.full||[c.make,c.model,c.year].filter(Boolean).join(' ')}}
function freshCar(d,row){const cid=d.newId(row),f=normaliseCar({id:cid,...masterFields(row),catalogueId:cid,catalogueKey:d.key});f.catalogueId=cid;f.catalogueKey=d.key;return f}
function repairSpace(s){
 const d=def(s);if(!d)return null;
 const refs=referencedIds(s), oldOwned=s.catalogueOwned&&typeof s.catalogueOwned==='object'?s.catalogueOwned:{}, ownedRows=new Map();
 Object.keys(oldOwned).forEach(k=>{const row=rowFromAnyId(d,k);if(row)ownedRows.set(d.newId(row),row)});
 // Exact identity on an already-linked Garage record is authoritative; never infer ownership from fuzzy text.
 (s.cars||[]).forEach(car=>{const row=rowFromAnyId(d,car.catalogueId);if(row&&Object.prototype.hasOwnProperty.call(oldOwned,car.catalogueId))ownedRows.set(d.newId(row),row)});
 const byCid=new Map();
 (s.cars||[]).forEach(car=>{const row=exactRow(d,car);if(!row)return;const cid=d.newId(row);if(!byCid.has(cid))byCid.set(cid,[]);byCid.get(cid).push(car)});
 // v6.0.106: ownership is user-authored state. Never trim FH5 to a historical count.
 // A fixed target caused a newly ticked valid car to be discarded on the next reconciliation.
 const keepCars=[],newOwned={};let removedDuplicates=0,created=0;
 // Keep non-catalogue records untouched only if they cannot be exactly identified as a catalogue row.
 (s.cars||[]).forEach(car=>{if(!exactRow(d,car))keepCars.push(car)});
 ownedRows.forEach((row,cid)=>{
   const old=d.oldId(row),candidates=byCid.get(cid)||[];
   candidates.sort((a,b)=>{const ar=refs.has(String(a.id))?1:0,br=refs.has(String(b.id))?1:0;if(ar!==br)return br-ar;const al=(String(a.id)!==cid&&String(a.id)!==old)?1:0,bl=(String(b.id)!==cid&&String(b.id)!==old)?1:0;if(al!==bl)return bl-al;return String(a.id).localeCompare(String(b.id))});
   let car=candidates[0];if(!car){car=freshCar(d,row);created++}
   removedDuplicates+=Math.max(0,candidates.length-1);car.catalogueId=cid;car.catalogueKey=d.key;keepCars.push(car);newOwned[cid]=car.id;
 });
 s.cars=keepCars;s.catalogueOwned=newOwned;s.catalogueLibrary={key:d.key,title:d.title,version:'2',total:d.list.length,protected:true,identity:'immutable-row-id'};s.catalogueIdentityVersion=2;s.catalogueRepairVersion=REPAIR_VERSION;delete s.catalogueReconcileSignature;
 // FH5 Festival was explicitly allowed to restart. Remove only Festival runs, leaving Events and other data alone.
 if(d.key===FH5_KEY){s.runs=(s.runs||[]).filter(r=>String(r?.type||r?.championshipType||'').toLowerCase()!=='festival')}
 return {title:d.title,owned:Object.keys(newOwned).length,garage:s.cars.length,duplicatesRemoved:removedDuplicates,created}
}
function repairAll(){const active=state.activeSpaceId,report=[];(state.spaces||[]).forEach(s=>{const r=repairSpace(s);if(r)report.push(r)});state.activeSpaceId=active;try{fh5OwnedSet=null}catch(_){};rhSync();rhSave();return report}
window.rhCatalogueDeterministicRepair=repairAll;
const report=repairAll();
// Replace old reconcilers so future renders/space opens cannot recreate fuzzy or duplicate ownership.
window.fh5ReconcileExistingCars=function(s){const r=repairSpace(s);try{fh5OwnedSet=new Set(Object.keys(s.catalogueOwned||{}))}catch(_){};return r?.owned||0};
window.gt7ReconcileExistingCars=function(s){const r=repairSpace(s);return r?.owned||0};
// Exact toggle: one immutable catalogue ID -> one editable Garage copy.
function toggle(kind,cid){const s=kind==='fh5'?fh5EnsureSpace(true,true):gt7EnsureSpace(true),d=def(s),row=rowFromAnyId(d,cid);if(!s||!d||!row)return;cid=d.newId(row);const ref=s.catalogueOwned?.[cid],adding=!ref,before=adding?(kind==='fh5'?fh5FestivalUnlocks():gt7FestivalUnlocks()):null;if(!s.catalogueOwned)s.catalogueOwned={};if(!adding){delete s.catalogueOwned[cid];s.cars=(s.cars||[]).filter(c=>c.catalogueId!==cid&&String(c.id)!==String(ref))}else{let car=(s.cars||[]).find(c=>c.catalogueId===cid);if(!car){car=freshCar(d,row);s.cars.push(car)}car.catalogueId=cid;car.catalogueKey=d.key;s.catalogueOwned[cid]=car.id}try{fh5OwnedSet=null}catch(_){};rhSync();rhSave();rhRenderGarage();if(adding)(kind==='fh5'?fh5AnnounceFestivalUnlocks(before):gt7AnnounceFestivalUnlocks(before))}
window.fh5Toggle=cid=>toggle('fh5',cid);window.gt7Toggle=cid=>toggle('gt7',cid);
// Make owned checks depend only on the exact immutable ID.
window.fh5Owned=c=>{const s=fh5Space();return !!(s?.catalogueOwned&&Object.prototype.hasOwnProperty.call(s.catalogueOwned,fh5CarId(c)))};
window.gt7Owned=c=>{const s=gt7Space();return !!(s?.catalogueOwned&&Object.prototype.hasOwnProperty.call(s.catalogueOwned,gt7CarId(c)))};
})();
