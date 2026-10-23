// OTG! v6.0.132 — GT7 manual/special Garage car integration.
(()=>{
  'use strict';
  const GT7_KEY='gt7-catalogue-v1';
  function currentGt7Space(){
    try{const s=rhSpace();return s&&s.catalogueKey===GT7_KEY?s:null}catch(_){return null}
  }
  function catalogueIds(){
    try{return new Set((GT7_CATALOGUE||[]).map(c=>String(gt7CarId(c))))}catch(_){return new Set()}
  }
  function integrate(){
    const s=currentGt7Space();if(!s)return false;
    const ids=catalogueIds();let changed=false;
    (s.cars||[]).forEach(c=>{
      const isManual=!c.catalogueId||!ids.has(String(c.catalogueId));
      if(!isManual)return;
      const text=[c.make,c.model,c.name].join(' ').toLowerCase();
      // Preserve the already-added Dior Mangusta and ensure it joins the normal De Tomaso Garage/manufacturer grouping.
      if(text.includes('mangusta')&&text.includes('dior')&&c.make!=='De Tomaso'){c.make='De Tomaso';changed=true}
      if(c.manualSpecial!==true){c.manualSpecial=true;changed=true}
      if(c.catalogueKey===GT7_KEY){delete c.catalogueKey;changed=true}
    });
    if(changed){try{rhSync();rhSave()}catch(_){}}
    return changed;
  }
  window.gt7IntegrateManualCars=integrate;
  const oldSave=window.rhSaveCarFinal;
  if(typeof oldSave==='function'){
    window.rhSaveCarFinal=function(){
      const result=oldSave.apply(this,arguments);
      integrate();
      return result;
    };
    try{rhSaveCarFinal=window.rhSaveCarFinal}catch(_){}
  }
  window.addEventListener('load',()=>setTimeout(integrate,0));
})();
