/* OTG! v5.8.34 — Championship in Progress full rebuild */
(function(){
  'use strict';

  function safe(value){
    return typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function fmt(value){
    if(typeof rhFmtTime === 'function') return rhFmtTime(Number(value)||0);
    const n=Number(value)||0, m=Math.floor(n/60), s=(n-m*60).toFixed(3).padStart(6,'0');
    return `${String(m).padStart(2,'0')}:${s}`;
  }
  function carLabel(id){
    const c=typeof carById==='function' ? carById(id) : null;
    return c && typeof carName==='function' ? carName(c) : 'Unknown car';
  }
  function competitionLabel(r){
    const type=r.type||r.championshipType||'festival';
    if(type==='era') return 'ERA CHAMPIONSHIP';
    if(type==='make') return 'MANUFACTURER CHAMPIONSHIP';
    if(type==='favourite') return 'FAVOURITE CHAMPIONSHIP';
    return 'FESTIVAL CHAMPIONSHIP';
  }
  function standingsRows(r){
    const rounds=Array.isArray(r.rounds)?r.rounds:[];
    return (Array.isArray(r.entries)?r.entries:[]).map(id=>{
      const rr=(r.results||[]).filter(x=>x.carId===id);
      return rr.length===rounds.length && rounds.length ? {id,total:rr.reduce((a,b)=>a+Number(b.time||0),0)} : null;
    }).filter(Boolean).sort((a,b)=>a.total-b.total);
  }

  window.rhShowCurrentStandingsV5834=function(id){
    const r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>x.id===id);
    if(!r) return;
    const rows=standingsRows(r), leader=rows[0]?.total||0;
    show('festival');
    $('festival').innerHTML=`<div class="rhStandings33">
      <div class="rhStandings34Header"><button onclick="rhOpenRun('${safe(id)}')" aria-label="Back">‹</button><div><small>CURRENT STANDINGS</small><h1>${safe(r.name)}</h1></div></div>
      <section class="rhStandings33Board">
        <div class="rhStandings33Head"><span>POS</span><span>CAR</span><span>TOTAL TIME</span><span>GAP</span></div>
        <div class="rhStandings33Rows">${rows.length?rows.map((x,i)=>`<div><b>${String(i+1).padStart(2,'0')}</b><span>${safe(carLabel(x.id))}</span><strong>${fmt(x.total)}</strong><em>${i===0?'LEADER':'+'+fmt(x.total-leader)}</em></div>`).join(''):'<p class="rhStandings33Empty">No cars have completed every round yet.</p>'}</div>
      </section>
      <button class="rhStandings33Return" onclick="rhOpenRun('${safe(id)}')">BACK TO CHAMPIONSHIP</button>
    </div>`;
  };

  window.rhOpenRun=function(id){
    const r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>x.id===id);
    if(!r) return;
    if(r.status==='complete'){
      if(typeof window.rhShowLockedFinalLeaderboardV5788==='function') return window.rhShowLockedFinalLeaderboardV5788(id);
      return;
    }
    show('festival');
    const p=rhRunProgress(r), cp=rhRunCarProgress(r), next=rhNextSlot(r);
    const entries=Array.isArray(r.entries)?r.entries:[], rounds=Array.isArray(r.rounds)?r.rounds:[], results=Array.isArray(r.results)?r.results:[];
    const remaining=typeof rhQueueRemaining==='function'?rhQueueRemaining(r):[];
    const currentCar=next?carById(next.carId):null;
    const currentIndex=next?entries.indexOf(next.carId):-1;
    const currentDone=next?results.filter(x=>x.carId===next.carId).length:0;
    const preview=remaining.slice(0,2);
    const remainingAfterPreview=Math.max(0,remaining.length-preview.length);
    const roundName=next?.round?.name||r.rounds?.[0]?.name||'';

    $('festival').innerHTML=`<div class="rhChamp33">
      <div class="rhChamp34Hero">
        <div class="rhChamp34HeroShade"></div>
        <div class="rhChamp34Title"><small>${competitionLabel(r)}</small><h1>${safe(r.name)}</h1>${roundName?`<p>${safe(roundName)}</p>`:''}</div>
      </div>
      <main class="rhChamp33Body">
        <section class="rhChamp33Progress">
          <div class="rhChamp33ProgressTop"><small>CHAMPIONSHIP PROGRESS</small><strong>${cp.pct}%</strong></div>
          <div class="rhChamp33Bar"><i style="width:${p.pct}%"></i></div>
        </section>
        ${next?`<section class="rhChamp33Current">
          <div class="rhChamp33CurrentHead"><div><small>CURRENT CAR</small><h2>${safe(carName(currentCar||{make:'Unknown',model:'Car'}))}</h2></div><strong>${currentIndex+1} OF ${entries.length}</strong></div>
          <div class="rhChamp33Meta"><span><small>CURRENT ROUND</small><b>${safe(next.round.name)}</b></span><span><small>CAR PROGRESS</small><b>${currentDone} OF ${rounds.length} ROUNDS COMPLETE</b></span></div>
          <button class="rhChamp33Continue" onclick="rhEnterResult('${safe(r.id)}','${safe(next.carId)}','${safe(next.round.id)}')"><i>▶</i><span><b>CONTINUE</b><small>ENTER RESULT FOR ${safe(next.round.name).toUpperCase()}</small></span></button>
        </section>`:''}
        <section class="rhChamp33Tools">
          <button onclick="rhRandomPickQueue('${safe(r.id)}')"><i>◆</i><b>RANDOM PICK</b></button>
          <button onclick="rhShuffleQueue('${safe(r.id)}')"><i>⇄</i><b>SHUFFLE QUEUE</b></button>
        </section>
        <section class="rhChamp33Next">
          <div class="rhChamp34NextHead"><h2>NEXT UP</h2><strong>${cp.complete} COMPLETE</strong></div>
          <div class="rhChamp33NextRows">
            <div><i>1</i><b>${safe(preview[0]?carLabel(preview[0]):'No car waiting')}</b></div>
            <div><i>2</i><b>${safe(preview[1]?carLabel(preview[1]):'—')}</b></div>
          </div>
        </section>
        <footer class="rhChamp33Footer">
          <button onclick="rhShowCurrentStandingsV5834('${safe(r.id)}')"><i>🏆</i><b>VIEW CURRENT<br>STANDINGS</b></button>
          <button onclick="rhRenderFestival()"><i>←</i><b>BACK TO<br>FESTIVAL</b></button>
        </footer>
      </main>
    </div>`;
  };
})();
