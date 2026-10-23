/* OTG! v6.0.88 — catalogue stability repair.
   Source of truth in dedicated catalogue spaces:
   protected master + exact immutable catalogueOwned IDs + one editable Garage copy per owned ID.
   Festival stays lazy: no eligibility/discovery scan on tick; existing Festival renderer derives
   availability from the repaired current Garage only when Festival is opened. */
(()=>{
'use strict';

const FH5_KEY='fh5-catalogue-v1', GT7_KEY='gt7-catalogue-v1';

function defForSpace(s){
  if(!s)return null;
  if(s.catalogueKey===FH5_KEY && typeof FH5_CATALOGUE!=='undefined')
    return {kind:'fh5',key:FH5_KEY,list:FH5_CATALOGUE,id:fh5CarId,total:FH5_CATALOGUE.length};
  if(s.catalogueKey===GT7_KEY && typeof GT7_CATALOGUE!=='undefined')
    return {kind:'gt7',key:GT7_KEY,list:GT7_CATALOGUE,id:gt7CarId,total:GT7_CATALOGUE.length};
  return null;
}
function rowMap(d){ return new Map(d.list.map(row=>[d.id(row),row])); }
function fresh(d,row,cid){
  const car=normaliseCar({
    id:cid,catalogueId:cid,catalogueKey:d.key,
    make:row.make||'',model:row.model||'',year:String(row.year||''),
    classType:row.classType||'',
    name:row.full||[row.make,row.model,row.year].filter(Boolean).join(' ')
  });
  car.catalogueId=cid; car.catalogueKey=d.key;
  return car;
}
function repairSpaceExact(s){
  const d=defForSpace(s); if(!d)return null;
  const rows=rowMap(d);
  const owned=(s.catalogueOwned && typeof s.catalogueOwned==='object')?s.catalogueOwned:{};

  // Existing editable copies are preserved only by exact immutable catalogueId.
  const existing=new Map();
  (s.cars||[]).forEach(car=>{
    const cid=String(car?.catalogueId||'');
    if(cid && rows.has(cid) && !existing.has(cid)) existing.set(cid,car);
  });

  // v6.0.138: SPECIALS are deliberately outside catalogueOwned but remain real Garage cars.
  // Preserve them through exact catalogue repair so Festival / Era / Class / Race Off / Custom Racing
  // continue to see them. Official catalogue counts remain catalogueOwned-only.
  const specials=(s.cars||[]).filter(car=>car?.manualSpecial===true);
  const next=[...specials], nextOwned={};
  Object.keys(owned).forEach(cid=>{
    const row=rows.get(cid); if(!row)return;
    let car=existing.get(cid);
    if(!car) car=fresh(d,row,cid);
    car.catalogueId=cid; car.catalogueKey=d.key;
    // Preserve editable fields, filling only missing values from the protected master.
    if(!String(car.make||'').trim())car.make=row.make||'';
    if(!String(car.model||'').trim())car.model=row.model||'';
    if(!String(car.year||'').trim())car.year=String(row.year||'');
    if(!String(car.classType||'').trim())car.classType=row.classType||'';
    next.push(car);
    nextOwned[cid]=car.id;
  });

  s.cars=next;
  s.catalogueOwned=nextOwned;
  s.catalogueLibrary={key:d.key,title:d.kind==='fh5'?'Forza Horizon 5':'Gran Turismo 7',
    version:'2',total:d.total,protected:true,identity:'immutable-row-id'};
  s.catalogueIdentityVersion=2;
  return {d,owned:next.length};
}
function repairAll(){
  let changed=false;
  (state.spaces||[]).forEach(s=>{
    const before=Array.isArray(s.cars)?s.cars.length:0;
    const r=repairSpaceExact(s);
    if(r && before!==r.owned)changed=true;
  });
  try{fh5OwnedSet=null}catch(_){}
  rhSync();
  if(changed)rhSave();
}
window.rhCatalogueExactStabilityRepair=repairAll;

// One exact ID toggle. No Festival scan, no auto-created Championship, no full catalogue redraw.
function patchVisible(d,row,cid,adding,s){
  const host=$('garage'); if(!host)return;
  const el=[...host.querySelectorAll('.rhCatalogueGarageCar')].find(x=>x.dataset.catalogueId===cid);
  if(el){
    el.classList.toggle('owned',adding); el.classList.toggle('unowned',!adding);
    const box=el.querySelector('input[type="checkbox"]'); if(box)box.checked=adding;
  }
  const totalEl=host.querySelector('#rhCatalogueOwnedTotal');
  if(totalEl)totalEl.innerHTML=`${Object.keys(s.catalogueOwned||{}).length}<small>/ ${d.total} OWNED</small>`;
  const mc=[...host.querySelectorAll('.rhCatalogueMakeCount')].find(x=>x.dataset.make===row.make);
  if(mc){
    const total=d.list.filter(c=>c.make===row.make).length;
    const owned=d.list.filter(c=>c.make===row.make &&
      Object.prototype.hasOwnProperty.call(s.catalogueOwned||{},d.id(c))).length;
    mc.textContent=`${owned}/${total}`;
  }
}
function toggle(kind,cid){
  const s=kind==='fh5'?fh5EnsureSpace(true,true):gt7EnsureSpace(true);
  const d=defForSpace(s); if(!s||!d)return;
  const rows=rowMap(d),row=rows.get(cid); if(!row)return;
  if(!s.catalogueOwned||typeof s.catalogueOwned!=='object')s.catalogueOwned={};
  const ref=s.catalogueOwned[cid], adding=!ref;

  if(adding){
    let car=(s.cars||[]).find(c=>c.catalogueId===cid);
    if(!car){car=fresh(d,row,cid);(s.cars||(s.cars=[])).push(car);}
    car.catalogueId=cid;car.catalogueKey=d.key;s.catalogueOwned[cid]=car.id;
  }else{
    delete s.catalogueOwned[cid];
    s.cars=(s.cars||[]).filter(c=>c.catalogueId!==cid);
  }
  try{fh5OwnedSet=null}catch(_){}
  rhSync();rhSave();patchVisible(d,row,cid,adding,s);
}
window.fh5Toggle=cid=>toggle('fh5',cid);
window.gt7Toggle=cid=>toggle('gt7',cid);

// Festival is lazy, but before it renders we guarantee one editable Garage copy per exact owned ID.
// This removes stale/duplicate old catalogue copies without creating any Championship/run.
const festivalBase=window.rhRenderFestival;
if(typeof festivalBase==='function'){
  window.rhRenderFestival=function(){
    const s=rhSpace();
    if(defForSpace(s)){repairSpaceExact(s);rhSync();}
    return festivalBase.apply(this,arguments);
  };
  try{rhRenderFestival=window.rhRenderFestival}catch(_){}
}

// Restore the locked Reset Racing Data action wiring without changing the locked v6.0.78 artwork.
window.rhResetRacingFinal=function(){
  const s=rhSpace(); if(!s)return;
  s.runs=[]; s.customEvents=[]; s.favouriteManufacturer='';
  rhSave(); toast('Racing data reset'); rhRenderSettings();
};
window.rhResetConfirm=function(){
  rhConfirm({
    title:'RESET RACING DATA?',
    copy:'Clear Championships, active/completed runs, results, Records, Hall of Fame and Stats for the current Space.',
    safeguard:'Your Garage, Space name, global Driver Profile and other Spaces will be retained.',
    confirmLabel:'RESET RACING DATA',
    danger:true,
    onConfirm:'rhResetRacingFinal()'
  });
};

repairAll();
})();