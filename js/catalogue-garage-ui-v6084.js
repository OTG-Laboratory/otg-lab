/* OTG! v6.0.84 — restore Garage-style collapsible catalogue UI.
   Ownership/toggle identity remains delegated to v6.0.83 deterministic catalogue functions. */
(()=>{
  const counts=(catalogue,ownedFn)=>{
    const out={};
    catalogue.forEach(c=>{
      const k=c.make||'Unknown';
      if(!out[k])out[k]={owned:0,total:0};
      out[k].total++;
      if(ownedFn(c))out[k].owned++;
    });
    return out;
  };
  const group=(catalogue,q)=>{
    const g={};
    catalogue.forEach(c=>{
      const hay=[c.make,c.model,c.full,c.year,c.classType].join(' ').toLowerCase();
      if(q&&!hay.includes(q))return;
      (g[c.make]||(g[c.make]=[])).push(c);
    });
    return g;
  };
  const carRow=(kind,c,on,id)=>{
    const title=kind==='fh5'?(c.full||[c.make,c.model].filter(Boolean).join(' ')):(c.model||c.full||'');
    const meta=[c.year||'Year unknown',c.classType||'Class unknown'].join(' • ');
    return `<label class="rhGarageCarV1 rhCatalogueGarageCar ${on?'owned':'unowned'}" data-catalogue-id="${esc(id)}" data-search="${esc([c.make,c.model,c.full,c.year,c.classType].join(' '))}">
      <input class="rhCatalogueCheck" type="checkbox" ${on?'checked':''} onchange="${kind}Toggle('${id}')">
      <span class="rhCatalogueTick">✓</span>
      <span><b>${esc(title)}</b><small>${esc(meta)}</small></span>
    </label>`;
  };
  const manualRow=(c)=>{
    const title=c.model||c.name||'Manual car';
    const meta=[c.year||'Year unknown',c.classType||'Special / non-catalogue'].filter(Boolean).join(' • ');
    return `<div class="rhGarageCarV1 rhCatalogueGarageCar rhManualSpecialCar owned" data-search="${esc([c.make,c.model,c.name,c.year,c.classType,'special non-catalogue'].join(' '))}">
      <span class="rhCatalogueTick">＋</span>
      <span><b>${esc(title)}</b><small>${esc(meta)} • SPECIAL</small></span>
      <button class="rhEditIcon" aria-label="Edit ${esc(title)}" onclick="event.stopPropagation();rhOpenCarEditor('${esc(c.id)}')">✎</button>
    </div>`;
  };
  const gt7ManualCars=(s,catalogue,idFn)=>{
    const ids=new Set(catalogue.map(idFn));
    let changed=false;
    const manual=(s?.cars||[]).filter(c=>!c.catalogueId||!ids.has(String(c.catalogueId)));
    manual.forEach(c=>{
      const text=[c.make,c.model,c.name].join(' ').toLowerCase();
      if(text.includes('mangusta')&&text.includes('dior')&&c.make!=='De Tomaso'){c.make='De Tomaso';changed=true}
      if(!c.manualSpecial){c.manualSpecial=true;changed=true}
    });
    if(changed){try{rhSync();rhSave()}catch(_){}}
    return manual;
  };
  window.otgRenderCatalogueGarage=function(kind){
    const fh=kind==='fh5';
    const catalogue=fh?FH5_CATALOGUE:GT7_CATALOGUE;
    const ensure=fh?fh5EnsureSpace:gt7EnsureSpace;
    const ownedFn=fh?fh5Owned:gt7Owned;
    const idFn=fh?fh5CarId:gt7CarId;
    const q=String(fh?fh5CatalogueSearch:gt7CatalogueSearch||'').trim().toLowerCase();
    const s=fh?ensure(true,true):ensure(true);
    const g=group(catalogue,q), cs=counts(catalogue,ownedFn);
    const manual=fh?[]:gt7ManualCars(s,catalogue,idFn);
    const manualFiltered=manual.filter(c=>!q||[c.make,c.model,c.name,c.year,c.classType,'special non-catalogue'].join(' ').toLowerCase().includes(q));
    const makes=Object.keys(g).sort((a,b)=>a.localeCompare(b));
    const owned=catalogue.filter(ownedFn).length;
    const total=catalogue.length;
    const title=fh?'FORZA HORIZON 5':'GRAN TURISMO 7';
    const key=fh?'fh5':'gt7';
    const openVar=fh?'fh5CatalogueMake':'gt7CatalogueMake';
    const current=window[openVar]||'All';
    $('garage').innerHTML=`<div class="rhGarageV1 rhCatalogueGarageV84">
      <section class="rhGarageHeroV1"><div class="rhGarageHeadV1"><button onclick="show('home')" aria-label="Back">‹</button><div><h1>${title}</h1><p>Dedicated Catalogue Space</p></div></div></section>
      <main class="rhGarageBodyV1">
        <section class="rhGarageSummaryV1"><i>⌂</i><span><b>${fh?'FH5':'GT7'} CATALOGUE</b><small>Grey cars are unowned. Tick a car to add it to this Space Garage.</small></span><strong id="rhCatalogueOwnedTotal">${owned}<small>/ ${total} OWNED</small></strong></section>
        <div class="rhGarageToolsV1"><label><i>⌕</i><input autocomplete="off" placeholder="Search manufacturer, car, year or class" value="${esc(fh?fh5CatalogueSearch:gt7CatalogueSearch)}" oninput="otgCatalogueFilterLive('${key}',this)"></label>${!fh?`<button class="chip" onclick="rhOpenCarEditor()">＋ Add Car</button>`:''}</div>${!fh?`<p class="small">Add Car is for GT7 special/non-catalogue cars. Manual cars do not change the ${total}-car catalogue count.</p>`:''}
        ${!fh?`<div class="rhGarageMakesV1 rhGt7SpecialsV6136"><section class="rhGarageMakeV1 ${Boolean(q)||current==='SPECIALS'?'open':''}" data-make="SPECIALS"><div class="rhGarageMakeHeadWrapV1"><button class="rhGarageMakeHeadV1" onclick="otgToggleCatalogueMake('gt7','SPECIALS')"><b>SPECIALS</b><span>${manualFiltered.length}</span><em>${Boolean(q)||current==='SPECIALS'?'⌃':'⌄'}</em></button></div><div class="rhGarageCarsV1" ${Boolean(q)||current==='SPECIALS'?'':'hidden'}>${manualFiltered.length?manualFiltered.slice().sort((a,b)=>String(a.make||'').localeCompare(String(b.make||''))||String(a.model||a.name||'').localeCompare(String(b.model||b.name||''))).map(manualRow).join(''):`<div class="rhEmpty"><p>No special/non-catalogue cars added yet.</p></div>`}</div></section></div>`:''}
        ${makes.length?`<div class="rhGarageMakesV1">${makes.map(make=>{
          const cars=g[make].slice().sort((a,b)=>String(a.full||a.model||'').localeCompare(String(b.full||b.model||'')));
          const open=Boolean(q)||current===make;
          const c=cs[make]||{owned:0,total:cars.length};
          const specialMark='';
          return `<section class="rhGarageMakeV1 ${open?'open':''}" data-make="${esc(make)}">
            <div class="rhGarageMakeHeadWrapV1"><button class="rhGarageMakeHeadV1" onclick="otgToggleCatalogueMake('${key}',decodeURIComponent('${encodeURIComponent(make).replace(/'/g,'%27')}'))"><b>${esc(make)}</b><span class="rhCatalogueMakeCount" data-make="${esc(make)}">${c.owned}/${c.total}${specialMark}</span><em>${open?'⌃':'⌄'}</em></button></div>
            <div class="rhGarageCarsV1" ${open?'':'hidden'}>${cars.map(c=>carRow(key,c,ownedFn(c),idFn(c))).join('')}</div>
          </section>`;
        }).join('')}</div>`:`<div class="rhEmpty"><h2>NO CARS FOUND</h2><p>Try a different manufacturer, car, year or class.</p></div>`}
      </main></div>`;
  };
  window.otgCatalogueFilterLive=function(kind,input){
    const raw=String(input?.value||'');
    const q=raw.trim().toLowerCase();
    try{
      if(kind==='fh5') fh5CatalogueSearch=raw;
      else gt7CatalogueSearch=raw;
    }catch(e){}
    window[kind==='fh5'?'fh5CatalogueSearch':'gt7CatalogueSearch']=raw;
    const root=input?.closest('.rhCatalogueGarageV84');
    if(!root)return;
    root.querySelectorAll('.rhGarageMakeV1').forEach(sec=>{
      const make=String(sec.dataset.make||'').toLowerCase();
      const makeHit=!q||make.includes(q);
      let any=false;
      sec.querySelectorAll('.rhCatalogueGarageCar').forEach(row=>{
        const hit=makeHit||String(row.dataset.search||'').toLowerCase().includes(q);
        row.hidden=!hit;
        if(hit)any=true;
      });
      sec.hidden=!any;
      const cars=sec.querySelector('.rhGarageCarsV1');
      const em=sec.querySelector('.rhGarageMakeHeadV1 em');
      if(q&&any){sec.classList.add('open');if(cars)cars.hidden=false;if(em)em.textContent='⌃'}
      else if(!q){
        const prop=kind==='fh5'?'fh5CatalogueMake':'gt7CatalogueMake';
        const open=window[prop]===sec.dataset.make;
        sec.classList.toggle('open',open);if(cars)cars.hidden=!open;if(em)em.textContent=open?'⌃':'⌄';
      }
    });
  };
  window.otgToggleCatalogueMake=function(kind,make){
    const prop=kind==='fh5'?'fh5CatalogueMake':'gt7CatalogueMake';
    const render=kind==='fh5'?fh5RenderCatalogue:gt7RenderCatalogue;
    window[prop]=(window[prop]===make)?'All':make;
    // lexical globals in original catalogue scripts
    try{ if(kind==='fh5') fh5CatalogueMake=window[prop]; else gt7CatalogueMake=window[prop]; }catch(e){}
    render();
  };
  if(typeof fh5RenderCatalogue==='function'){
    const old=fh5RenderCatalogue;
    window.fh5RenderCatalogue=function(){return otgRenderCatalogueGarage('fh5')};
    try{fh5RenderCatalogue=window.fh5RenderCatalogue}catch(e){}
  }
  if(typeof gt7RenderCatalogue==='function'){
    const old=gt7RenderCatalogue;
    window.gt7RenderCatalogue=function(){return otgRenderCatalogueGarage('gt7')};
    try{gt7RenderCatalogue=window.gt7RenderCatalogue}catch(e){}
  }
})();