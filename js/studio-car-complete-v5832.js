/* OTG! v5.8.32 — authoritative Car Complete / Final Classification rebuild. */
(()=>{
  'use strict';
  const VERSION='5.8.32';
  const q=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v||0)):String(v??'—');
  const space=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
  const carBy=id=>(space()?.cars||[]).find(c=>String(c.id)===String(id))||null;
  const carLabel=id=>{const c=carBy(id);try{return c&&typeof carName==='function'?carName(c):(c?.name||c?.model||'Unknown car')}catch(_){return c?.name||c?.model||'Unknown car'}};

  function rowsHtml(rows){
    const leader=Number(rows[0]?.total||0);
    return rows.map((x,i)=>`<div class="rhCarComplete32Row"><b>${String(i+1).padStart(2,'0')}</b><span>${esc(x.name)}</span><strong>${fmt(x.total)}</strong><em>${i===0?'—':'+'+fmt(Number(x.total)-leader)}</em></div>`).join('') || '<div class="rhCarComplete32Empty">No completed cars yet.</div>';
  }
  function page({hostId,title,subtitle,carNameText,total,rows,returnLabel,onReturn}){
    if(typeof show==='function')show(hostId);
    const host=q(hostId); if(!host)return;
    host.innerHTML=`<div class="rhCarComplete32Page">
      <div class="rhCarComplete32Shade"></div>
      <header class="rhCarComplete32Header">
        <button id="rhCarComplete32Back" aria-label="Back">‹</button>
        <div><h1>CAR COMPLETE</h1><p>${esc(subtitle)}</p></div>
      </header>
      <main class="rhCarComplete32Main">
        <section class="rhCarComplete32Car">
          <small>${esc(title)}</small>
          <h2>${esc(carNameText)}</h2>
          <span>CUMULATIVE TOTAL TIME</span>
          <strong>${fmt(total)}</strong>
        </section>
        <section class="rhCarComplete32Board">
          <div class="rhCarComplete32BoardHead"><div><small>FINAL CLASSIFICATION</small><b>${esc(subtitle)}</b></div><span>OFFICIAL</span></div>
          <div class="rhCarComplete32Cols"><span>POS</span><span>CAR</span><span>TOTAL TIME</span><span>GAP</span></div>
          <div class="rhCarComplete32Scroll">${rowsHtml(rows)}</div>
        </section>
        <button class="rhCarComplete32Return" id="rhCarComplete32Return">${esc(returnLabel)}</button>
      </main>
    </div>`;
    q('rhCarComplete32Back')?.addEventListener('click',onReturn);
    q('rhCarComplete32Return')?.addEventListener('click',onReturn);
    window.scrollTo(0,0);
  }

  window.rhRunCarCompleteTransition=function(runId,carId){
    const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>String(x.id)===String(runId));
    if(!run)return;
    const rows=(run.entries||[]).filter(id=>typeof rhRunCarIsComplete==='function'&&rhRunCarIsComplete(run,id)).map(id=>({id,name:carLabel(id),total:Number(typeof rhRunCarTotal==='function'?rhRunCarTotal(run,id):0)})).sort((a,b)=>a.total-b.total);
    page({hostId:'festival',title:'CHAMPIONSHIP CAR',subtitle:run.name||'Championship',carNameText:carLabel(carId),total:Number(typeof rhRunCarTotal==='function'?rhRunCarTotal(run,carId):0),rows,returnLabel:'RETURN TO CHAMPIONSHIP',onReturn:()=>rhOpenRun(run.id)});
  };

  window.rhEventCarCompleteTransition=function(eventId,carId){
    const event=(space()?.customEvents||[]).find(x=>String(x.id)===String(eventId));
    if(!event)return;
    const cars=typeof rhEventCars==='function'?(rhEventCars(event)||[]):[];
    const rows=cars.filter(c=>typeof rhEventCarIsComplete==='function'&&rhEventCarIsComplete(event,c.id)).map(c=>({id:c.id,name:(typeof carName==='function'?carName(c):(c.name||c.model||'Unknown car')),total:Number(typeof rhEventCarTotal==='function'?rhEventCarTotal(event,c.id):0)})).sort((a,b)=>a.total-b.total);
    const current=cars.find(c=>String(c.id)===String(carId));
    page({hostId:'event',title:'EVENT CAR',subtitle:event.name||'Event',carNameText:current?(typeof carName==='function'?carName(current):(current.name||current.model||'Unknown car')):carLabel(carId),total:Number(typeof rhEventCarTotal==='function'?rhEventCarTotal(event,carId):0),rows,returnLabel:'RETURN TO EVENT',onReturn:()=>rhOpenEvent(event.id)});
  };
  window.RACEHUB_VERSION=VERSION;
})();
