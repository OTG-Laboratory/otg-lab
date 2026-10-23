/* OTG! v6.0.82 — catalogue manufacturer owned/total visual counts. Visual only. */
(function(){
  function countByMake(catalogue, ownedFn){
    const out=new Map();
    (catalogue||[]).forEach(c=>{const m=String(c.make||c.manufacturer||'Unknown').trim()||'Unknown';const v=out.get(m)||{owned:0,total:0};v.total++;if(ownedFn(c))v.owned++;out.set(m,v)});
    return out;
  }
  function optionLabel(make,counts){if(make==='All')return 'All manufacturers';const v=counts.get(make)||{owned:0,total:0};return `${make} — ${v.owned}/${v.total}`}
  function refreshSelect(selectId,catalogue,ownedFn,current){
    const sel=document.getElementById(selectId);if(!sel)return;
    const counts=countByMake(catalogue,ownedFn);
    [...sel.options].forEach(o=>{o.textContent=optionLabel(o.value,counts)});
    sel.value=current||'All';
  }
  if(typeof window.fh5RenderCatalogue==='function'){
    const base=window.fh5RenderCatalogue;
    window.fh5RenderCatalogue=function(){const r=base.apply(this,arguments);try{const sel=document.querySelector('.fh5Tools select');if(sel){const counts=countByMake(window.FH5_CATALOGUE||FH5_CATALOGUE,window.fh5Owned||fh5Owned);[...sel.options].forEach(o=>o.textContent=optionLabel(o.value,counts));sel.value=window.fh5CatalogueMake||fh5CatalogueMake||'All'}}catch(_){}return r}
  }
  if(typeof window.gt7RenderCatalogue==='function'){
    const base=window.gt7RenderCatalogue;
    window.gt7RenderCatalogue=function(){const r=base.apply(this,arguments);try{const sel=document.querySelector('.gt7Tools select');if(sel){const counts=countByMake(window.GT7_CATALOGUE||GT7_CATALOGUE,window.gt7Owned||gt7Owned);[...sel.options].forEach(o=>o.textContent=optionLabel(o.value,counts));sel.value=window.gt7CatalogueMake||gt7CatalogueMake||'All'}}catch(_){}return r}
  }
})();
