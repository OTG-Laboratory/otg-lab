/* OTG! v5.8.09 — self-contained podium Result Summary */
(()=>{
  const q=id=>document.getElementById(id);
  const esc=v=>typeof safe==='function'?safe(v):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const totalOf=x=>Number(x?.total||0);
  const fmt=t=>typeof window.rhFmtTime==='function'?window.rhFmtTime(Number(t||0)):String(t??'—');
  function runBoard(r){
    return (r?.entries||[]).map(id=>{
      const rr=(r?.results||[]).filter(x=>String(x.carId)===String(id));
      return rr.length===(r?.rounds||[]).length?{id,total:rr.reduce((sum,x)=>sum+Number(x.time||0),0)}:null;
    }).filter(Boolean).sort((a,b)=>a.total-b.total);
  }
  function eventBoard(e){
    const cars=typeof window.rhEventCars==='function'?(window.rhEventCars(e)||[]):[];
    const rounds=typeof window.rhEventRounds==='function'?(window.rhEventRounds(e)||[]):(e?.rounds||[]);
    return cars.map(car=>{
      const rr=(e?.results||[]).filter(x=>String(x.carId)===String(car.id));
      return rr.length===rounds.length?{id:car.id,car,total:rr.reduce((sum,x)=>sum+Number(x.time||0),0)}:null;
    }).filter(Boolean).sort((a,b)=>a.total-b.total);
  }
  function contextRows(rows,highlightId){
    const at=Math.max(0,rows.findIndex(x=>(x.id||x.car?.id)===highlightId));
    const start=Math.max(0,Math.min(at-2,Math.max(0,rows.length-5)));
    return rows.slice(start,start+5).map((x,i)=>({x,pos:start+i+1}));
  }
  function summaryBoard(rows,highlightId){
    const leader=totalOf(rows[0]);
    return `<section class="rhPodiumClassificationV5804">
      <div class="rhPodiumClassHeadV5804"><b>CURRENT CLASSIFICATION</b></div>
      <div class="rhPodiumColsV5804"><span>POS</span><span>CAR</span><span>TOTAL TIME</span><span>GAP</span></div>
      <div class="rhPodiumRowsV5804">${contextRows(rows,highlightId).map(({x,pos})=>{
        const id=x.id||x.car?.id;
        const name=x.car?carName(x.car):carName(carById(id));
        const gap=pos===1?'—':`+${fmt(totalOf(x)-leader)}`;
        return `<div class="rhPodiumRowV5804 ${id===highlightId?'current':''}"><b>${String(pos).padStart(2,'0')}</b><span>${esc(name)}</span><strong>${fmt(totalOf(x))}</strong><em>${gap}</em></div>`;
      }).join('')}</div>
    </section>`;
  }
  function summaryShell({backAction,roundName,title,carLine,rows,highlightId,buttonLabel,buttonSub,buttonAction}){
    return `<div class="rhPodiumSummaryV5804">
      <section class="rhPodiumHeroV5804">
        <div class="rhPodiumHeaderV5804"><button aria-label="Back" onclick="${backAction}">‹</button><div><h1>RESULT SUMMARY</h1><p>${esc(roundName||'')}</p></div></div>
      </section>
      <main class="rhPodiumBodyV5804">
        <section class="rhPodiumMetaV5804"><small>${esc(title)}</small><b>${esc(carLine)}</b></section>
        ${summaryBoard(rows,highlightId)}
        <button class="rhPodiumContinueV5804" onclick="${buttonAction}"><b>${esc(buttonLabel)}</b><small>${esc(buttonSub)}</small></button>
      </main>
    </div>`;
  }
  window.rhResultSummary=function(r,res){
    const c=carById(res.carId),rows=runBoard(r),next=rhNextSlot(r),carDone=rhRunCarIsComplete(r,res.carId),nextDifferent=!!(next&&next.carId!==res.carId);
    let label='CONTINUE',sub='RETURN TO CHAMPIONSHIP',action=`rhOpenRun('${r.id}')`;
    if(r.status==='complete'){label='FINAL STANDINGS';sub='VIEW CHAMPIONSHIP RESULT';action=`rhChampionshipCompleteTransition('${r.id}')`;}
    else if(carDone&&nextDifferent){label='CAR COMPLETE';sub='VIEW TOTAL & NEXT CAR';action=`rhRunCarCompleteTransition('${r.id}','${res.carId}')`;}
    show('festival');
    q('festival').innerHTML=summaryShell({
      backAction:`rhOpenRun('${r.id}')`,roundName:res.roundName,title:rhSetupTypeLabel(r.type||r.championshipType||'festival'),
      carLine:`${carName(c)} • ${fmt(res.time)}`,rows,highlightId:res.carId,buttonLabel:label,buttonSub:sub,buttonAction:action
    });
  };
  window.rhEventResultSummary=function(e,res){
    const car=rhEventCars(e).find(c=>c.id===res.carId),rows=eventBoard(e),complete=e.status==='complete';
    show('event');
    q('event').innerHTML=summaryShell({
      backAction:`rhOpenEvent('${e.id}')`,roundName:res.roundName,title:e.name,carLine:`${carName(car)} • ${fmt(res.time)}`,
      rows,highlightId:res.carId,buttonLabel:complete?'FINAL STANDINGS':'CONTINUE EVENT',buttonSub:complete?'VIEW EVENT RESULT':'RETURN TO EVENT',
      buttonAction:complete?`rhEventCompleteTransition('${e.id}')`:`rhOpenEvent('${e.id}')`
    });
  };
})();
