/* OTG! v5.8.29 — authoritative race-end flow with standalone Hubs celebration. */
(()=>{
  'use strict';
  const VERSION='5.8.31';
  const byId=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=t=>typeof rhFmtTime==='function'?rhFmtTime(Number(t||0)):String(t??'—');
  const currentSpace=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
  const allCars=()=>currentSpace()?.cars||[];
  const getCar=id=>allCars().find(c=>String(c.id)===String(id))||null;
  const getName=id=>{const c=getCar(id);try{return c&&typeof carName==='function'?carName(c):(c?.name||c?.model||'Unknown car')}catch(_){return c?.name||c?.model||'Unknown car'}};
  const typeLabel=t=>t==='make'?'MANUFACTURER CHAMPIONSHIP':t==='era'?'ERA CHAMPIONSHIP':t==='favourite'?'FAVOURITE MANUFACTURER CHAMPIONSHIP':'FESTIVAL CHAMPIONSHIP';

  function partialRunRows(run){
    return (run.entries||[]).map(id=>{
      const rr=(run.results||[]).filter(x=>String(x.carId)===String(id));
      return rr.length?{id,total:rr.reduce((s,x)=>s+Number(x.time||0),0),count:rr.length}:null;
    }).filter(Boolean).sort((a,b)=>a.total-b.total);
  }
  function eventCars(event){try{return typeof rhEventCars==='function'?(rhEventCars(event)||[]):[]}catch(_){return []}}
  function partialEventRows(event){
    return eventCars(event).map(c=>{const rr=(event.results||[]).filter(x=>String(x.carId)===String(c.id));return rr.length?{id:c.id,total:rr.reduce((s,x)=>s+Number(x.time||0),0),count:rr.length}:null}).filter(Boolean).sort((a,b)=>a.total-b.total);
  }
  function context(rows,id){
    if(!rows.length)return [];
    let at=rows.findIndex(x=>String(x.id)===String(id)); if(at<0)at=0;
    const start=Math.max(0,Math.min(at-2,Math.max(0,rows.length-5)));
    return rows.slice(start,start+5).map((x,i)=>({...x,pos:start+i+1}));
  }
  function board(rows,id){
    const leader=rows[0]?.total||0;
    return `<section class="rhPodiumClassificationV5804"><div class="rhPodiumClassHeadV5804"><b>CURRENT CLASSIFICATION</b></div><div class="rhPodiumColsV5804"><span>POS</span><span>CAR</span><span>TOTAL TIME</span><span>GAP</span></div><div class="rhPodiumRowsV5804">${context(rows,id).map(x=>`<div class="rhPodiumRowV5804 ${String(x.id)===String(id)?'current':''}"><b>${String(x.pos).padStart(2,'0')}</b><span>${esc(getName(x.id))}</span><strong>${fmt(x.total)}</strong><em>${x.pos===1?'—':'+'+fmt(x.total-leader)}</em></div>`).join('')||'<div class="rhPodiumRowV5804 current"><b>01</b><span>Result recorded</span><strong>—</strong><em>—</em></div>'}</div></section>`;
  }
  function summaryHtml(o){
    return `<div class="rhPodiumSummaryV5804"><section class="rhPodiumHeroV5804"><div class="rhPodiumHeaderV5804"><button aria-label="Back" id="rhSummaryBack">‹</button><div><h1>RESULT SUMMARY</h1><p>${esc(o.roundName)}</p></div></div></section><main class="rhPodiumBodyV5804"><section class="rhPodiumMetaV5804"><small>${esc(o.title)}</small><b>${esc(o.carLine)}</b></section>${board(o.rows,o.carId)}<button class="rhPodiumContinueV5804" id="rhSummaryContinue"><b>${esc(o.label)}</b><small>${esc(o.sub)}</small></button></main></div>`;
  }
  function mountSummary(hostId,o){
    if(typeof show==='function')show(hostId);
    const host=byId(hostId); if(!host)return;
    host.innerHTML=summaryHtml(o);
    byId('rhSummaryBack')?.addEventListener('click',o.back);
    byId('rhSummaryContinue')?.addEventListener('click',o.next);
    window.scrollTo(0,0);
  }

  function previousBest(owner,res,kind,scope){
    let pool=[];
    if(kind==='event'){
      if(scope==='local') pool=(owner.results||[]);
      else pool=(currentSpace()?.customEvents||[]).flatMap(x=>x.results||[]);
    }else{
      if(scope==='local') pool=(owner.results||[]);
      else pool=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).flatMap(x=>x.results||[]);
    }
    const prior=pool.filter(x=>String(x.id)!==String(res.id) && String(x.roundName)===String(res.roundName) && Number(x.time||0)>0);
    if(!prior.length)return null;
    return Math.min(...prior.map(x=>Number(x.time||0)));
  }
  function hubsCopy(res){
    if(res.allTime&&res.championshipRecord)return 'That was a seriously quick drive. You have reset both benchmarks.';
    if(res.allTime)return 'That was a seriously quick drive. You have set the standard for the whole OTG!.';
    return 'Excellent work. That is the quickest time in this Championship.';
  }
  function recordCards(res,kind){
    const localLabel=kind==='event'?'EVENT RECORD':'CHAMPIONSHIP RECORD';
    return `${res.championshipRecord?`<article class="rhHubs29Record"><span class="rhHubs29Rosette silver">★</span><div><small>NEW ${localLabel}!</small><b>${localLabel}</b><em>NEW BEST TIME</em></div></article>`:''}${res.allTime?`<article class="rhHubs29Record"><span class="rhHubs29Rosette gold">★</span><div><small>NEW ALL-TIME RECORD!</small><b>ALL-TIME OTG! RECORD</b><em>NEW BEST TIME</em></div></article>`:''}`;
  }
  function showHubs(kind,owner,res,viewStandings,continueAction){
    const hostId=kind==='event'?'event':'festival';
    if(typeof show==='function')show(hostId);
    const host=byId(hostId); if(!host)return;
    const localPrev=previousBest(owner,res,kind,'local');
    const allPrev=previousBest(owner,res,kind,'all');
    const previous=res.allTime?allPrev:localPrev;
    const improvement=previous!=null?Math.max(0,previous-Number(res.time||0)):null;
    host.innerHTML=`<div class="rhHubs29Page">
      <button class="rhHubs29Back" id="rhHubs29Back" aria-label="Back">‹</button>
      <header class="rhHubs29Header"><h1>HOLD ON...</h1><p>HUBS HAS SOME NEWS</p></header>
      <main class="rhHubs29Main">
        <section class="rhHubs29Character"><img src="assets/final/hubs-pit-chief-v5829.png?v=5829" alt="Hubs, OTG! Pit Chief"></section>
        <section class="rhHubs29Details">
          ${recordCards(res,kind)}
          <div class="rhHubs29Times"><small>YOUR NEW BEST TIME</small><strong>${fmt(res.time)}</strong>${previous!=null?`<small>PREVIOUS BEST</small><b>${fmt(previous)}</b><small>IMPROVEMENT</small><em>−${fmt(improvement)}</em>`:''}</div>
        </section>
        <blockquote class="rhHubs29Quote">“${esc(hubsCopy(res))}”<cite>— HUBS<br><small>PIT CHIEF</small></cite></blockquote>
      </main>
      <footer class="rhHubs29Actions"><button id="rhHubs29Standings"><span>🏆</span><b>VIEW CURRENT STANDINGS</b></button><button id="rhHubs29Continue"><span>🏁</span><b>${owner.status==='complete'?'FINAL STANDINGS':kind==='event'?'CONTINUE EVENT':'CONTINUE CHAMPIONSHIP'}</b></button></footer>
    </div>`;
    byId('rhHubs29Back')?.addEventListener('click',viewStandings);
    byId('rhHubs29Standings')?.addEventListener('click',viewStandings);
    byId('rhHubs29Continue')?.addEventListener('click',continueAction);
    window.scrollTo(0,0);
  }

  function runSummary(run,res){
    const rows=partialRunRows(run);
    const done=run.status==='complete';
    let label='CONTINUE',sub='RETURN TO CHAMPIONSHIP',directNext=()=>rhOpenRun(run.id);
    if(done){label='FINAL STANDINGS';sub='VIEW OFFICIAL CLASSIFICATION';directNext=()=>window.rhChampionshipCompleteTransition?.(run.id,res.carId)}
    else {try{const n=rhNextSlot(run),carDone=rhRunCarIsComplete(run,res.carId);if(carDone&&n&&String(n.carId)!==String(res.carId)){label='CAR COMPLETE';sub='VIEW TOTAL & NEXT CAR';directNext=()=>rhRunCarCompleteTransition(run.id,res.carId)}}catch(_){}}
    const viewStandings=()=>rhOpenRun(run.id);
    const next=(res.championshipRecord||res.allTime)?()=>showHubs('championship',run,res,viewStandings,directNext):directNext;
    mountSummary('festival',{roundName:res.roundName,title:typeLabel(run.type||run.championshipType),carLine:`${getName(res.carId)} • ${fmt(res.time)}`,rows,carId:res.carId,label,sub,back:viewStandings,next});
  }
  function eventSummary(event,res){
    const done=event.status==='complete';
    const viewStandings=()=>rhOpenEvent(event.id);
    const directNext=done?()=>window.rhEventCompleteTransition?.(event.id,res.carId):viewStandings;
    const next=(res.championshipRecord||res.allTime)?()=>showHubs('event',event,res,viewStandings,directNext):directNext;
    mountSummary('event',{roundName:res.roundName,title:event.name,carLine:`${getName(res.carId)} • ${fmt(res.time)}`,rows:partialEventRows(event),carId:res.carId,label:done?'FINAL STANDINGS':'CONTINUE EVENT',sub:done?'VIEW OFFICIAL CLASSIFICATION':'RETURN TO EVENT',back:viewStandings,next});
  }
  function accepted(owner,res,kind='festival'){
    const hostId=kind==='events'?'event':'festival';
    const host=byId(hostId); if(!host)return;
    const text=owner.status==='complete'?(kind==='events'?'EVENT COMPLETE':'CHAMPIONSHIP COMPLETE'):'RESULT RECORDED';
    host.innerHTML=`<div class="rhAccepted ${kind==='events'?'rhAcceptedEvents':'rhAcceptedChamp'} rhAcceptedFinal"><div class="rhAcceptedShadeFinal"></div><div class="rhAcceptedGlass rhAcceptedGlassFinal"><div class="rhAcceptedTick">✓</div><h1>RESULT SAVED</h1><p>${text}</p><small>${esc(res.roundName)} complete</small></div></div>`;
    setTimeout(()=>{try{kind==='events'?eventSummary(owner,res):runSummary(owner,res)}catch(err){console.error('OTG! result summary failed',err);kind==='events'?rhOpenEvent(owner.id):rhOpenRun(owner.id)}},750);
  }

  window.rhResultAccepted=accepted;
  window.rhResultSummary=runSummary;
  window.rhEventResultSummary=eventSummary;
  window.RACEHUB_VERSION=VERSION;
})();
