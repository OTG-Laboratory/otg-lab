// OTG! v6.0.133 — GT7 manual/special car preservation + recovery.
(()=>{
  'use strict';
  const GT7_KEY='gt7-catalogue-v1';
  function space(){try{const s=rhSpace();return s&&s.catalogueKey===GT7_KEY?s:null}catch(_){return null}}
  function norm(v){return String(v||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
  function catIds(){try{return new Set((GT7_CATALOGUE||[]).map(c=>String(gt7CarId(c))))}catch(_){return new Set()}}
  function masterById(cid){try{return (GT7_CATALOGUE||[]).find(c=>String(gt7CarId(c))===String(cid))||null}catch(_){return null}}
  function masterFields(row){return {make:row.make||'',model:row.model||'',year:String(row.year||''),classType:row.classType||'',name:row.full||[row.make,row.model,row.year].filter(Boolean).join(' ')}}

  function recoverMergedDior(s){
    let changed=false;
    const additions=[];
    (s.cars||[]).forEach(c=>{
      if(!c?.catalogueId)return;
      const row=masterById(c.catalogueId); if(!row)return;
      const text=norm([c.make,c.model,c.name].join(' '));
      // v6.0.132 could let the deterministic repair absorb a just-added Dior Mangusta
      // into the official Mangusta row before the manual flag was applied. If the
      // underlying linked Garage record still carries the Dior identity, split it back out.
      if(text.includes('dior') && text.includes('mangusta')){
        const special=normaliseCar({
          ...c,
          id:rhId('car'),
          make:'De Tomaso',
          model:c.model||"Mangusta (Christian Dior) '69",
          name:c.name||"De Tomaso Mangusta (Christian Dior) '69",
          year:String(c.year||'1969'),
          manualSpecial:true
        });
        delete special.catalogueId; delete special.catalogueKey;
        additions.push(special);
        Object.assign(c,normaliseCar({...c,...masterFields(row)}));
        c.catalogueId=String(gt7CarId(row)); c.catalogueKey=GT7_KEY;
        changed=true;
      }
    });
    if(additions.length)s.cars.push(...additions);
    return changed;
  }

  function normaliseManuals(s){
    const ids=catIds(); let changed=false;
    (s.cars||[]).forEach(c=>{
      if(!c)return;
      const manual=c.manualSpecial===true || !c.catalogueId || !ids.has(String(c.catalogueId));
      if(!manual)return;
      const text=norm([c.make,c.model,c.name].join(' '));
      if(text.includes('mangusta')&&text.includes('dior')&&c.make!=='De Tomaso'){c.make='De Tomaso';changed=true}
      if(c.manualSpecial!==true){c.manualSpecial=true;changed=true}
      if(c.catalogueId){delete c.catalogueId;changed=true}
      if(c.catalogueKey){delete c.catalogueKey;changed=true}
    });
    return changed;
  }

  function integrate(){
    const s=space(); if(!s)return false;
    let changed=recoverMergedDior(s);
    if(normaliseManuals(s))changed=true;
    if(changed){try{rhSync();rhSave()}catch(_){}}
    return changed;
  }
  window.gt7IntegrateManualCars=integrate;

  const oldSave=window.rhSaveCarFinal;
  window.rhSaveCarFinal=function(id=''){
    const s=space();
    // New cars created from a GT7 catalogue space are explicitly Garage-only specials.
    // Flag them before any render/reconcile can run, so deterministic catalogue repair
    // can never absorb them into an official catalogue row.
    if(s && !id){
      const make=$('rhCarMake')?.value.trim(), model=$('rhCarModel')?.value.trim(), year=$('rhCarYear')?.value.trim()||'';
      if(!make||!model){toast('Manufacturer and Vehicle Name are required');return}
      if(year&&!/^\d{4}$/.test(year)){toast('Enter a four-digit year');return}
      const c=normaliseCar({id:rhId('car'),make,model,year,manualSpecial:true});
      c.manualSpecial=true; delete c.catalogueId; delete c.catalogueKey;
      s.cars.push(c); rhGarageOpenMake=make; rhSync(); rhSave(); $('rhCarEditor')?.remove();
      try{rhRenderGarage()}catch(_){try{gt7RenderCatalogue()}catch(__){}}
      toast('Car added'); return;
    }
    const r=oldSave?.apply(this,arguments); integrate(); return r;
  };
  try{rhSaveCarFinal=window.rhSaveCarFinal}catch(_){}

  // Run after startup scripts have loaded and again just before GT7 catalogue rendering.
  window.addEventListener('load',()=>setTimeout(()=>{integrate();try{gt7RenderCatalogue()}catch(_){}},0));
  const oldRender=window.gt7RenderCatalogue;
  if(typeof oldRender==='function'){
    window.gt7RenderCatalogue=function(){integrate();return oldRender.apply(this,arguments)};
    try{gt7RenderCatalogue=window.gt7RenderCatalogue}catch(_){}
  }
})();
