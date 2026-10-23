/* OTG! v6.0.21 — Stage 9C League Results + Review/Confirmation.
   Additive override built on passed v6.0.20. Confirmed event results become permanent history. */
(function(){
  const q=id=>document.getElementById(id);
  const safe=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const toast=m=>typeof window.toast==='function'?window.toast(m):void 0;
  const persist=()=>{ if(typeof window.rhSave==='function')window.rhSave(); else if(typeof window.save==='function')window.save(); };
  const leagues=()=>{ const s=typeof window.rhSpace==='function'?window.rhSpace():null; return Array.isArray(s?.leagues)?s.leagues:[]; };
  const league=id=>leagues().find(x=>x.id===id);
  const event=(l,id)=>l?.events?.find(x=>x.id===id);
  const page=html=>{const el=q('events'); if(el){el.innerHTML=html;window.scrollTo(0,0);}};
  const hero=(title,sub,back)=>`<section class="rhLeagueHeroV6018 compact"><button class="rhBack rhLeagueBackV6018" onclick="${back}">BACK</button><div class="rhLeagueTitleV6018"><small>LEAGUE EVENT</small><h1>${safe(title)}</h1><p>${safe(sub)}</p></div></section>`;
  const pad=n=>String(n).padStart(2,'0');
  const drafts=new Map();
  const key=(lid,eid)=>`${lid}::${eid}`;
  function formatMs(ms){ if(!Number.isFinite(ms)||ms<=0)return ''; const m=Math.floor(ms/60000),s=Math.floor((ms%60000)/1000),x=ms%1000; return `${pad(m)}:${pad(s)}.${String(x).padStart(3,'0')}`; }
  function parseTime(v){ const s=String(v||'').trim(); if(!s)return null; const m=s.match(/^(\d{1,3}):([0-5]?\d)\.(\d{1,3})$/); if(!m)return NaN; const min=Number(m[1]),sec=Number(m[2]),ms=Number(m[3].padEnd(3,'0')); const total=min*60000+sec*1000+ms; return total>0?total:NaN; }
  function currentDraft(l,e){
    const k=key(l.id,e.id); if(drafts.has(k))return drafts.get(k);
    const rows=(l.drivers||[]).filter(d=>d.active!==false).map(d=>({driverId:d.id,driverName:d.name,status:'finish',position:'',timeText:''}));
    const d={rows}; drafts.set(k,d); return d;
  }
  function syncDraft(lid,eid){
    const l=league(lid),e=event(l,eid),d=l&&e?currentDraft(l,e):null;if(!d)return;
    d.rows.forEach((r,i)=>{r.position=String(q(`rhLPos21_${i}`)?.value||'').trim();r.timeText=String(q(`rhLTime21_${i}`)?.value||'').trim();});
  }
  function statusButton(lid,eid,i,status,label){ const l=league(lid),e=event(l,eid),d=currentDraft(l,e),on=d.rows[i].status===status; return `<button class="${on?'active':''}" onclick="rhSetLeagueResultStatusV6021('${lid}','${eid}',${i},'${status}')">${label}</button>`; }
  function validate(l,e,d){
    const positions=new Set();
    for(let i=0;i<d.rows.length;i++){
      const r=d.rows[i]; if(r.status!=='finish')continue;
      const p=Number(r.position); if(!Number.isInteger(p)||p<1)return `Enter a finishing position for ${r.driverName}`;
      if(positions.has(p))return `Finishing position ${p} is used more than once`;
      positions.add(p);
      const ms=parseTime(r.timeText);
      if(l.scoringMode==='total' && !Number.isFinite(ms))return `Enter a valid race time for ${r.driverName}`;
      if(r.timeText && !Number.isFinite(ms))return `Check the race time for ${r.driverName}`;
    }
    return '';
  }
  function sortedRows(l,d){ return d.rows.map(r=>({...r,timeMs:r.status==='finish'?parseTime(r.timeText):null})).sort((a,b)=>{
    if(a.status==='finish'&&b.status==='finish')return Number(a.position)-Number(b.position);
    if(a.status==='finish')return -1;if(b.status==='finish')return 1;
    return a.status.localeCompare(b.status);
  }); }
  function pointsFor(l,r){ if(l.scoringMode!=='points'||r.status!=='finish')return 0; const idx=Number(r.position)-1; return Number(l.pointsTable?.[idx]||0); }

  window.rhSetLeagueResultStatusV6021=function(lid,eid,i,status){ const l=league(lid),e=event(l,eid); if(!l||!e)return; syncDraft(lid,eid); const d=currentDraft(l,e); d.rows[i].status=status; if(status!=='finish'){d.rows[i].position='';d.rows[i].timeText='';} rhEnterLeagueResultsV6021(lid,eid); };

  window.rhEnterLeagueResultsV6021=function(lid,eid){
    const l=league(lid),e=event(l,eid);if(!l||!e)return;
    if(e.resultsConfirmed){toast('These Event results are already confirmed');return rhViewLeagueEventHistoryV6021(lid,eid);}
    if(!String(e.raceName||'').trim()){toast('Add the Race / Event details before entering results');return rhEditLeagueEventV6019(lid,eid);}
    const d=currentDraft(l,e);
    const rows=d.rows.map((r,i)=>`<div class="rhLeagueResultRowV6021 ${r.status!=='finish'?'nonfinish':''}"><div class="rhLeagueResultDriverV6021"><small>DRIVER ${pad(i+1)}</small><b>${safe(r.driverName)}</b></div><div class="rhLeagueResultStatusV6021">${statusButton(lid,eid,i,'finish','FINISH')}${statusButton(lid,eid,i,'dnf','DNF')}${statusButton(lid,eid,i,'dns','DNS')}</div>${r.status==='finish'?`<div class="rhLeagueResultInputsV6021"><label><small>POSITION</small><input id="rhLPos21_${i}" inputmode="numeric" type="number" min="1" max="99" value="${safe(r.position)}" placeholder="—"></label><label><small>RACE TIME${l.scoringMode==='points'?' · OPTIONAL':''}</small><input id="rhLTime21_${i}" inputmode="decimal" autocomplete="off" value="${safe(r.timeText)}" placeholder="MM:SS.mmm"></label></div>`:`<div class="rhLeagueResultNonFinishV6021">${r.status==='dnf'?'STARTED • DID NOT FINISH':'DID NOT START'} · 0 ${l.scoringMode==='points'?'POINTS':'TIME'}</div>`}</div>`).join('');
    page(`<div class="rhLeaguePageV6018">${hero(`EVENT ${pad(e.number)}`,`${safe(e.raceName)} • Enter every active driver's official result.`,`rhEditLeagueEventV6019('${lid}','${eid}')`)}<main class="rhLeagueBodyV6018"><section class="rhLeagueSectionV6018"><h2>ENTER RESULTS</h2><div class="rhLeagueEventContextV6021"><b>${safe(e.name)}</b>${e.carClassRules?`<span>${safe(e.carClassRules)}</span>`:''}</div>${rows}<p class="rhLeagueHelpV6021">Finished drivers need a unique finishing position. Total Time mode also requires a valid race time. DNF and DNS add 0.</p><button class="rhLeaguePrimaryV6018 save" onclick="rhReviewLeagueResultsV6021('${lid}','${eid}')">REVIEW CLASSIFICATION</button></section></main></div>`);
  };

  window.rhReviewLeagueResultsV6021=function(lid,eid){
    const l=league(lid),e=event(l,eid);if(!l||!e)return;syncDraft(lid,eid);const d=currentDraft(l,e),err=validate(l,e,d);if(err){toast(err);return;}
    const rows=sortedRows(l,d);
    page(`<div class="rhLeaguePageV6018">${hero('REVIEW CLASSIFICATION','Check every result before permanent confirmation.',`rhEnterLeagueResultsV6021('${lid}','${eid}')`)}<main class="rhLeagueBodyV6018"><section class="rhLeagueSectionV6018"><h2>${safe(e.name)} • EVENT ${pad(e.number)}</h2><div class="rhLeagueReviewListV6021">${rows.map((r,i)=>`<div class="rhLeagueReviewRowV6021 ${r.status!=='finish'?'nonfinish':''}"><i>${r.status==='finish'?r.position:'—'}</i><span><b>${safe(r.driverName)}</b><small>${r.status==='finish'?(r.timeMs?formatMs(r.timeMs):'NO RACE TIME'):(r.status==='dnf'?'DNF':'DNS')}</small></span>${l.scoringMode==='points'?`<strong>${pointsFor(l,r)} PTS</strong>`:(r.status==='finish'?`<strong>${r.timeMs?formatMs(r.timeMs):'—'}</strong>`:'<strong>0 TIME</strong>')}</div>`).join('')}</div><div class="rhLeagueConfirmWarningV6021"><b>CHECK BEFORE CONFIRMING</b><p>You can go back and correct anything now. Once confirmed, these official Event results become permanent League history and are no longer casually editable.</p></div><div class="rhLeagueReviewActionsV6021"><button onclick="rhEnterLeagueResultsV6021('${lid}','${eid}')">EDIT RESULTS</button><button class="confirm" onclick="rhConfirmLeagueResultsV6021('${lid}','${eid}')">CONFIRM EVENT RESULTS</button></div></section></main></div>`);
  };

  window.rhConfirmLeagueResultsV6021=function(lid,eid){
    const l=league(lid),e=event(l,eid);if(!l||!e||e.resultsConfirmed)return;const d=currentDraft(l,e),err=validate(l,e,d);if(err){toast(err);return;}
    e.results=sortedRows(l,d).map(r=>({driverId:r.driverId,driverName:r.driverName,status:r.status,position:r.status==='finish'?Number(r.position):null,timeMs:r.status==='finish'&&Number.isFinite(r.timeMs)?r.timeMs:null,timeText:r.status==='finish'&&Number.isFinite(r.timeMs)?formatMs(r.timeMs):'',points:pointsFor(l,r)}));
    e.resultsConfirmed=true;e.confirmedAt=new Date().toISOString();e.status='complete';if(l.status==='setup')l.status='started';persist();drafts.delete(key(lid,eid));toast('Event results confirmed');rhViewLeagueEventHistoryV6021(lid,eid);
  };

  window.rhViewLeagueEventHistoryV6021=function(lid,eid){
    const l=league(lid),e=event(l,eid);if(!l||!e)return;const rows=Array.isArray(e.results)?e.results:[];
    page(`<div class="rhLeaguePageV6018">${hero(`EVENT ${pad(e.number)}`,'CONFIRMED • Permanent League history.',`rhOpenLeagueV6018('${lid}')`)}<main class="rhLeagueBodyV6018"><section class="rhLeagueSectionV6018"><h2>${safe(e.name)}</h2><div class="rhLeagueEventContextV6021"><b>${safe(e.raceName||'Official Event')}</b>${e.carClassRules?`<span>${safe(e.carClassRules)}</span>`:''}</div><div class="rhLeagueReviewListV6021">${rows.map(r=>`<div class="rhLeagueReviewRowV6021 ${r.status!=='finish'?'nonfinish':''}"><i>${r.status==='finish'?r.position:'—'}</i><span><b>${safe(r.driverName)}</b><small>${r.status==='finish'?(r.timeText||'NO RACE TIME'):(String(r.status).toUpperCase())}</small></span>${l.scoringMode==='points'?`<strong>${Number(r.points||0)} PTS</strong>`:(r.status==='finish'?`<strong>${r.timeText||'—'}</strong>`:'<strong>0 TIME</strong>')}</div>`).join('')}</div><div class="rhLeagueConfirmWarningV6021 locked"><b>RESULTS CONFIRMED</b><p>This Event is locked into League history. Stage 9D will use these confirmed results for live standings and permanent League history views.</p></div></section></main></div>`);
  };

  // Override Stage 9B Event editor to add the Results action while preserving all existing editing behaviour.
  const edit9b=window.rhEditLeagueEventV6019;
  window.rhEditLeagueEventV6019=function(lid,eid){
    const l=league(lid),e=event(l,eid);if(!l||!e)return;
    if(e.resultsConfirmed)return rhViewLeagueEventHistoryV6021(lid,eid);
    edit9b(lid,eid);
    const form=document.querySelector('#events .rhLeagueFormV6018');
    if(form&&!form.querySelector('.rhLeagueResultsLaunchV6021')){
      const btn=document.createElement('button');btn.className='rhLeaguePrimaryV6018 rhLeagueResultsLaunchV6021';btn.innerHTML='<span><b>ENTER EVENT RESULTS</b><small>Finish • DNF • DNS • review before confirmation</small></span>';
      btn.addEventListener('click',()=>{ if(typeof window.rhSaveLeagueEventV6019==='function')window.rhSaveLeagueEventV6019(lid,eid,false); setTimeout(()=>window.rhEnterLeagueResultsV6021(lid,eid),0); });
      form.appendChild(btn);
    }
  };
})();
