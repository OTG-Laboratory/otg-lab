/* OTG! v6.0.79 — protected catalogue master + editable Garage copies (FH5 + GT7). */
(()=>{
'use strict';
const CAT_VERSION='2';
function defForSpace(s){
 if(!s)return null;
 if(s.catalogueKey==='fh5-catalogue-v1'&&typeof FH5_CATALOGUE!=='undefined')return {key:s.catalogueKey,title:'Forza Horizon 5',cars:FH5_CATALOGUE,id:fh5CarId};
 if(s.catalogueKey==='gt7-catalogue-v1'&&typeof GT7_CATALOGUE!=='undefined')return {key:s.catalogueKey,title:'Gran Turismo 7',cars:GT7_CATALOGUE,id:gt7CarId};
 return null;
}
function masterFields(d,c){return {make:c.make||'',model:c.model||'',year:String(c.year||''),classType:c.classType||'',name:c.full||[c.make,c.model,c.year].filter(Boolean).join(' ')}}
function findCarByCatalogueId(s,cid){return (s.cars||[]).find(x=>x&&x.catalogueId===cid)||null}
function migrateSpace(s){
 const d=defForSpace(s);if(!d)return {repaired:0,linked:0};
 s.catalogueLibrary={key:d.key,title:d.title,version:CAT_VERSION,total:d.cars.length,protected:true};
 s.catalogueOwned=s.catalogueOwned&&typeof s.catalogueOwned==='object'?s.catalogueOwned:{};
 let linked=0,repaired=0;
 // Link only by exact immutable catalogue identity; v6.0.83 matchers contain no fuzzy fallback.
 (s.cars||[]).forEach(car=>{
   if(car.catalogueId)return;
   let src=null;
   try{src=d.key.startsWith('fh5')?fh5FindCatalogueMatch(car):gt7FindCatalogueMatch(car)}catch(_){ }
   if(!src)return;
   const cid=d.id(src);car.catalogueId=cid;car.catalogueKey=d.key;
   if(!s.catalogueOwned[cid])s.catalogueOwned[cid]=car.id;linked++;
 });
 // Repair dangling ownership: every owned catalogue ID must have an editable Garage copy.
 Object.keys(s.catalogueOwned).forEach(cid=>{
   let car=findCarByCatalogueId(s,cid);
   const oldRef=s.catalogueOwned[cid];
   if(!car&&oldRef)car=(s.cars||[]).find(x=>String(x.id)===String(oldRef));
   const src=d.cars.find(x=>d.id(x)===cid);
   if(car){car.catalogueId=cid;car.catalogueKey=d.key;s.catalogueOwned[cid]=car.id;return}
   if(!src)return;
   const f=masterFields(d,src);const fresh=normaliseCar({id:cid,...f,catalogueId:cid,catalogueKey:d.key});
   fresh.catalogueId=cid;fresh.catalogueKey=d.key;s.cars.push(fresh);s.catalogueOwned[cid]=fresh.id;repaired++;
 });
 delete s.catalogueReconcileSignature;
 return {repaired,linked};
}
function migrateAll(showToast=false){let repaired=0,linked=0;(state.spaces||[]).forEach(s=>{const r=migrateSpace(s);repaired+=r.repaired;linked+=r.linked});try{fh5OwnedSet=null}catch(_){};rhSync();rhSave();if(showToast)toast(repaired?`Catalogue repaired: ${repaired} missing Garage car${repaired===1?'':'s'} restored`:'Catalogue Library checked — Garage links are complete');return {repaired,linked}}
window.rhCatalogueRepair=()=>{migrateAll(true);rhRenderSettings?.()};
window.rhCatalogueRestoreOriginal=function(){
 const s=rhSpace(),d=defForSpace(s);if(!d)return;
 if(!confirm(`Restore original ${d.title} catalogue names, manufacturers, years and classes? Ownership, notes, racing data and backups are retained.`))return;
 migrateSpace(s);let n=0;
 (s.cars||[]).forEach(car=>{if(!car.catalogueId)return;const src=d.cars.find(x=>d.id(x)===car.catalogueId);if(!src)return;const f=masterFields(d,src);Object.assign(car,normaliseCar({...car,...f}));car.catalogueId=d.id(src);car.catalogueKey=d.key;n++});
 rhSync();rhSave();toast(`${n} Garage cars restored from protected catalogue`);rhRenderSettings?.();
};
// Catalogue delete means un-own, never destroy the protected master.
const oldDelete=window.rhDeleteCarFinal;
window.rhDeleteCarFinal=function(id){const s=rhSpace(),c=(s.cars||[]).find(x=>x.id===id);if(c&&c.catalogueId&&defForSpace(s)){delete s.catalogueOwned[c.catalogueId];s.cars=s.cars.filter(x=>x.id!==id);try{fh5OwnedSet=null}catch(_){};rhSync();rhSave();$('rhCarEditor')?.remove();rhRenderGarage();toast('Car marked unowned — catalogue master retained');return}return oldDelete?.apply(this,arguments)};
// Preserve hidden catalogue identity after normal editing.
const oldSave=window.rhSaveCarFinal;
window.rhSaveCarFinal=function(id=''){const s=rhSpace(),before=id?(s.cars||[]).find(x=>x.id===id):null,cid=before?.catalogueId,ck=before?.catalogueKey;const r=oldSave?.apply(this,arguments);if(id&&cid){const after=(s.cars||[]).find(x=>x.id===id);if(after){after.catalogueId=cid;after.catalogueKey=ck;s.catalogueOwned[cid]=after.id;rhSave()}}return r};
function addEditButtons(kind){
 const s=rhSpace(),d=defForSpace(s);if(!d||!String(d.key).startsWith(kind))return;
 document.querySelectorAll('.gt7Car,.fh5Car').forEach(row=>{
  const cb=row.querySelector('input[type=checkbox]');if(!cb||!cb.checked||row.querySelector('.catEdit6079'))return;
  const m=String(cb.getAttribute('onchange')||'').match(/['"]([^'"]+)['"]/);const cid=m&&m[1];if(!cid)return;
  const car=findCarByCatalogueId(s,cid)||(s.cars||[]).find(x=>String(x.id)===String(s.catalogueOwned[cid]));if(!car)return;
  const b=document.createElement('button');b.type='button';b.className='catEdit6079';b.textContent='EDIT';b.onclick=e=>{e.preventDefault();e.stopPropagation();rhOpenCarEditor(car.id)};row.appendChild(b);
 });
}
function wrapRender(name,kind){const old=window[name];if(!old)return;window[name]=function(){migrateSpace(rhSpace());const r=old.apply(this,arguments);setTimeout(()=>addEditButtons(kind),0);return r}}
wrapRender('fh5RenderCatalogue','fh5');wrapRender('gt7RenderCatalogue','gt7');
const oldSettings=window.rhRenderSettings;
if(oldSettings)window.rhRenderSettings=function(){const r=oldSettings.apply(this,arguments),s=rhSpace(),d=defForSpace(s),host=document.querySelector('#more .rhContent');if(d&&host&&!document.getElementById('rhCatalogueLibrary6079')){migrateSpace(s);const owned=Object.keys(s.catalogueOwned||{}).length;const garage=(s.cars||[]).filter(c=>c.catalogueKey===d.key||c.catalogueId).length;const danger=host.querySelector('.rhDangerFinal');const html=`<section id="rhCatalogueLibrary6079" class="rhSection rhSettingPanel"><h2>DOWNLOADED CATALOGUE</h2><p><b>${esc(d.title)}</b><br>${d.cars.length} master cars • ${owned} owned • ${garage} linked Garage cars</p><p class="small">The downloaded master is protected. Garage names, manufacturers, years and classes are editable without changing catalogue identity.</p><button class="rhSettingRow" onclick="rhCatalogueDeterministicRepair();rhRenderSettings()"><b>CHECK & REPAIR GARAGE LINKS</b><span>Run deterministic exact-ID repair ›</span></button><button class="rhSettingRow" onclick="rhCatalogueRestoreOriginal()"><b>RESTORE ORIGINAL CATALOGUE DATA</b><span>Keep ownership, notes, racing data and backups ›</span></button></section>`;(danger||host.lastElementChild)?.insertAdjacentHTML(danger?'beforebegin':'afterend',html)}return r};
/* v6.0.81: automatic repair disabled while live catalogue mismatch is under diagnosis. */
})();
