/* OTG! v6.0.23 — Stage 9D League Standings + permanent Event history.
   Additive over passed v6.0.22. Confirmed Event results remain the only scoring source. */
(function(){
  const safe=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const q=id=>document.getElementById(id);
  const leagues=()=>{const s=rhSpace();if(!Array.isArray(s.leagues))s.leagues=[];return s.leagues};
  const league=id=>leagues().find(x=>x.id===id);
  const event=(l,id)=>l?.events?.find(x=>x.id===id);
  const page=h=>{q('events').innerHTML=h;window.scrollTo(0,0)};
  const pad=n=>String(n).padStart(2,'0');
  const confirmed=e=>!!e?.resultsConfirmed;
  const confirmedEvents=l=>(l?.events||[]).filter(confirmed);
  const hero=(title,sub,back)=>`<section class="rhLeagueHeroV6018 compact"><button class="rhBack rhLeagueBackV6018" onclick="${back}">BACK</button><div class="rhLeagueTitleV6018"><small>LEAGUE</small><h1>${safe(title)}</h1><p>${safe(sub)}</p></div></section>`;
  function formatMs(ms){ms=Number(ms)||0;if(ms<=0)return '00:00.000';const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),x=Math.floor(ms%1000);return `${pad(m)}:${pad(s)}.${String(x).padStart(3,'0')}`;}
  function allDrivers(l){return (l.drivers||[]).map((d,i)=>({id:d.id,name:d.name,active:d.active!==false,order:i}));}
  function statsFor(l){
    const rows=allDrivers(l).map(d=>({...d,points:0,finishes:0,totalMs:0,wins:0,dnf:0,dns:0,eventsRecorded:0}));
    const map=new Map(rows.map(r=>[r.id,r]));
    confirmedEvents(l).forEach(e=>(e.results||[]).forEach(r=>{
      let s=map.get(r.driverId);
      if(!s){s={id:r.driverId,name:r.driverName||'Driver',active:false,order:rows.length,points:0,finishes:0,totalMs:0,wins:0,dnf:0,dns:0,eventsRecorded:0};rows.push(s);map.set(s.id,s);}
      s.eventsRecorded++;
      if(r.status==='finish'){
        s.finishes++;
        if(Number(r.position)===1)s.wins++;
        if(Number.isFinite(Number(r.timeMs))&&Number(r.timeMs)>0)s.totalMs+=Number(r.timeMs);
        if(l.scoringMode==='points')s.points+=Number(r.points||0);
      }else if(r.status==='dnf')s.dnf++;else if(r.status==='dns')s.dns++;
    }));
    if(l.scoringMode==='points') rows.sort((a,b)=>(b.points-a.points)||a.name.localeCompare(b.name));
    else rows.sort((a,b)=>(b.finishes-a.finishes)||(a.totalMs-b.totalMs)||a.name.localeCompare(b.name));
    let prevKey=null,prevPos=0;
    rows.forEach((r,i)=>{const key=l.scoringMode==='points'?`${r.points}`:`${r.finishes}|${r.totalMs}`;if(key===prevKey)r.rank=prevPos;else{r.rank=i+1;prevPos=r.rank;prevKey=key;}});
    return rows;
  }
  function updateLeagueStatus(l){
    const done=confirmedEvents(l).length;
    const all=(l.events||[]).length>0&&done===(l.events||[]).length;
    if(all)l.status='complete'; else if(done>0&&l.status==='setup')l.status='started';
    return {done,all};
  }
  function eventButton(l,e){
    const isDone=confirmed(e);
    return `<button class="rhLeagueEventV6018 rhLeagueEventBtnV6019 ${isDone?'rhLeagueEventCompleteV6023':''}" onclick="${isDone?`rhViewLeagueEventHistoryV6021('${l.id}','${e.id}')`:`rhEditLeagueEventV6019('${l.id}','${e.id}')`}"><i>${pad(e.number)}</i><span><b>${safe(e.name)}</b><small>${e.raceName?safe(e.raceName):'TBC'}${e.carClassRules?' • '+safe(e.carClassRules):''}</small></span><em>${isDone?'CONFIRMED':String(e.status||'planned').toUpperCase()}</em><strong>›</strong></button>`;
  }

  window.rhViewLeagueStandingsV6023=function(lid){
    const l=league(lid);if(!l)return rhOpenLeagueHubV6018();
    const state=updateLeagueStatus(l),rows=statsFor(l),mode=l.scoringMode==='points'?'POINTS':'TOTAL TIME';
    const body=rows.map(r=>`<div class="rhLeagueStandingRowV6023 ${r.active?'':'inactive'}"><i>${r.rank}</i><span><b>${safe(r.name)}</b><small>${r.finishes} classified finish${r.finishes===1?'':'es'}${r.active?'':' • INACTIVE'}${r.dnf?` • ${r.dnf} DNF`:''}${r.dns?` • ${r.dns} DNS`:''}</small></span>${l.scoringMode==='points'?`<strong>${r.points} PTS</strong>`:`<strong>${r.finishes?formatMs(r.totalMs):'—'}</strong>`}</div>`).join('');
    page(`<div class="rhLeaguePageV6018">${hero(l.name,state.all?'FINAL STANDINGS':`${state.done} OF ${l.events.length} EVENTS CONFIRMED`,`rhOpenLeagueV6018('${lid}')`)}<main class="rhLeagueBodyV6018"><section class="rhLeagueSectionV6018"><div class="rhLeagueStandingsHeadV6023"><div><small>SCORING</small><b>${mode}</b></div><div><small>EVENTS</small><b>${state.done} / ${l.events.length}</b></div></div><h2>${state.all?'FINAL STANDINGS':'CURRENT STANDINGS'}</h2><div class="rhLeagueStandingsListV6023">${body||'<p class="rhLeagueNoStandingsV6023">No confirmed results yet.</p>'}</div><div class="rhLeagueStandingsRuleV6023"><b>${mode}</b><p>${l.scoringMode==='points'?'Confirmed Event points are added exactly as defined by the frozen League points table. DNF and DNS score 0. Equal totals remain tied.':'Drivers are ranked by classified finishes first, then lowest cumulative time. DNF and DNS add no time. Equal finish-count and time totals remain tied.'}</p></div></section></main></div>`);
  };

  window.rhOpenLeagueV6018=function(id){
    const l=league(id);if(!l)return rhOpenLeagueHubV6018();
    const state=updateLeagueStatus(l),mode=l.scoringMode==='points'?'POINTS':'TOTAL TIME',active=(l.drivers||[]).filter(d=>d.active!==false).length;
    page(`<div class="rhLeaguePageV6018">${hero(l.name,`${mode} • ${active} active drivers`,`rhOpenLeagueHubV6018()`)}<main class="rhLeagueBodyV6018"><section class="rhLeagueSummaryV6018"><div><small>MODE</small><b>${mode}</b></div><div><small>CONFIRMED</small><b>${state.done}/${l.events.length}</b></div><div><small>STATUS</small><b>${state.all?'COMPLETE':state.done?'IN PROGRESS':'SETUP'}</b></div></section><div class="rhLeagueHubActionsV6023"><button onclick="rhViewLeagueStandingsV6023('${l.id}')"><b>${state.all?'FINAL STANDINGS':'STANDINGS'}</b><small>${state.done?'Calculated from confirmed Events':'Waiting for first confirmed Event'}</small></button><button onclick="rhManageLeagueDriversV6019('${l.id}')"><b>DRIVERS</b><small>Manage active/inactive roster</small></button></div><section class="rhLeagueSectionV6018"><h2>EVENTS</h2>${(l.events||[]).map(e=>eventButton(l,e)).join('')}</section>${state.all?'<div class="rhLeagueCompleteV6023"><b>LEAGUE COMPLETE</b><p>Every official Event is confirmed. The Event classifications and Final Standings are now permanent League history.</p></div>':''}</main></div>`);
  };

  window.rhViewLeagueEventHistoryV6021=function(lid,eid){
    const l=league(lid),e=event(l,eid);if(!l||!e)return;const rows=Array.isArray(e.results)?e.results:[];
    page(`<div class="rhLeaguePageV6018">${hero(`EVENT ${pad(e.number)}`,'CONFIRMED • Permanent League history.',`rhOpenLeagueV6018('${lid}')`)}<main class="rhLeagueBodyV6018"><section class="rhLeagueSectionV6018"><h2>${safe(e.name)}</h2><div class="rhLeagueEventContextV6021"><b>${safe(e.raceName||'Official Event')}</b>${e.carClassRules?`<span>${safe(e.carClassRules)}</span>`:''}${e.notes?`<span>${safe(e.notes)}</span>`:''}</div><div class="rhLeagueReviewListV6021">${rows.map(r=>`<div class="rhLeagueReviewRowV6021 ${r.status!=='finish'?'nonfinish':''}"><i>${r.status==='finish'?r.position:'—'}</i><span><b>${safe(r.driverName)}</b><small>${r.status==='finish'?(r.timeText||'NO RACE TIME'):String(r.status).toUpperCase()}</small></span>${l.scoringMode==='points'?`<strong>${Number(r.points||0)} PTS</strong>`:(r.status==='finish'?`<strong>${r.timeText||'—'}</strong>`:'<strong>0 TIME</strong>')}</div>`).join('')}</div><div class="rhLeagueConfirmWarningV6021 locked"><b>RESULTS CONFIRMED</b><p>This classification is locked into permanent League history.</p></div><div class="rhLeagueHistoryActionsV6023"><button onclick="rhOpenLeagueV6018('${lid}')">LEAGUE EVENTS</button><button class="primary" onclick="rhViewLeagueStandingsV6023('${lid}')">VIEW STANDINGS</button></div></section></main></div>`);
  };

  // Keep the newly calculated standings immediately available after final confirmation.
  const confirm9c=window.rhConfirmLeagueResultsV6021;
  if(typeof confirm9c==='function')window.rhConfirmLeagueResultsV6021=function(lid,eid){confirm9c(lid,eid);const l=league(lid);if(l)updateLeagueStatus(l);};
})();
