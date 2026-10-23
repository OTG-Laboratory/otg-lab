/* OTG! MAIN 8.0.114 — Closest Battles records + My OTG! Journey historic moments.
   Pure derivation from completed, timed competitions. Never writes racing data. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const activeSpace=()=>typeof window.rhSpace==='function'?window.rhSpace():null;
 const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)>0;
 const same=(a,b)=>String(a??'')===String(b??'');
 const fmt=t=>{const n=Math.max(0,Math.round(Number(t)*1000));const m=Math.floor(n/60000);return `${String(m).padStart(2,'0')}:${String(Math.floor(n%60000/1000)).padStart(2,'0')}.${String(n%1000).padStart(3,'0')}`};
 const gapFmt=t=>`${(Math.round(t*1000)/1000).toFixed(3)}s`;
 const when=v=>{const n=Date.parse(v||'');return Number.isFinite(n)?n:0};
 const day=v=>{if(!when(v))return 'DATE NOT RECORDED';return new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})};
 function carMap(s){return new Map((s.cars||[]).map(c=>[String(c.id),c]));}
 function carLabel(id,m){const c=m.get(String(id));return c?(typeof window.carName==='function'?window.carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ')):String(id||'Unknown car');}
 function totalBoard(ev,kind){
   if(ev.status!=='complete')return null;
   if(kind==='Custom Racing'&&(/swiss|knockout/i.test(String(ev.competitionFormat||ev.format||''))||ev.customSwiss||ev.customKnockout))return null;
   let rows=null;
   if(ev.format==='groups-total-time'){
     const final=(ev.v8Groups?.completedGroups||[]).find(g=>g.final);
     rows=final?.standings;
   }else if(kind==='Custom Racing'&&ev.competitionFormat==='groups'){
     const final=(ev.customGroups?.groups||[]).find(g=>g.final);
     rows=final?.standings;
   }else{
     const rd=ev.frozenRounds?.length&&kind==='Custom Racing'?ev.frozenRounds:ev.rounds||[];
     const ids=(kind==='Custom Racing'?(ev.frozenCarIds||ev.carIds||[]):ev.entries||[]).map(String);
     if(!rd.length||ids.length<2)return null;
     const rounds=new Set(rd.map(x=>String(x.id)));
     const seen=new Map(ids.map(id=>[id,new Map()]));
     for(const x of ev.results||[]){const id=String(x.carId),rid=String(x.roundId);if(!seen.has(id)||!rounds.has(rid)||!finite(x.time))continue;seen.get(id).set(rid,Number(x.time))}
     if([...seen.values()].some(m=>m.size!==rounds.size))return null;
     rows=[...seen].map(([id,rs])=>({id,total:[...rs.values()].reduce((a,b)=>a+b,0)}));
   }
   if(!Array.isArray(rows)||rows.length<2)return null;
   const checked=rows.map(x=>({id:String(x.id),total:Number(x.total)})).filter(x=>finite(x.total));
   if(checked.length!==rows.length||checked.length<2)return null;
   checked.sort((a,b)=>a.total-b.total||a.id.localeCompare(b.id));
   return {id:String(ev.id||''),event:String(ev.name||ev.title||kind),kind,date:ev.completedAt||'',entries:(ev.entries||ev.frozenCarIds||ev.carIds||[]).map(String),rows:checked};
 }
 function boards(s){if(!s)return[];const arr=[];for(const r of s.runs||[]){const b=totalBoard(r,'Festival');if(b)arr.push(b)}for(const r of s.customEvents||[]){const b=totalBoard(r,'Custom Racing');if(b)arr.push(b)}return arr;}
 function closest(s){const b=boards(s),out={finish:[],podium:[],overall:[]};for(const ev of b){
   ev.rows.forEach((r,i)=>{if(i===0)return;const a=ev.rows[i-1],g=Math.round((r.total-a.total)*1000)/1000;
     if(!Number.isFinite(g)||g<0) return;
     const item={event:ev.event,eventId:ev.id,kind:ev.kind,date:ev.date,first:a,second:r,p1:i,p2:i+1,gap:g};
     out.overall.push(item);if(i<=2)out.podium.push(item);if(i===1)out.finish.push(item);
   });
 }for(const k of Object.keys(out))out[k].sort((a,b)=>a.gap-b.gap||when(a.date)-when(b.date)||a.event.localeCompare(b.event));return{boards:b,...out}}
 function historic(s){if(!s)return[];const data=closest(s),cars=carMap(s),hist=[];
   // First gold for each manufacturer in a genuine multi-make timed championship.
   const seen=new Set();for(const b of data.boards.slice().sort((a,b)=>when(a.date)-when(b.date))){
     const makes=new Set((b.entries.length?b.entries:b.rows.map(r=>r.id)).map(id=>cars.get(String(id))?.make).filter(Boolean));
     if(makes.size<2)continue;
     const w=b.rows[0],make=String(cars.get(String(w.id))?.make||'').trim();if(!make||seen.has(make))continue;seen.add(make);
     hist.push({key:'make:'+make,date:b.date,icon:'🥇',title:`${make.toUpperCase()} — FIRST GOLD`,line1:b.event,line2:`Champion: ${carLabel(w.id,cars)}`});
   }
   // A close battle deserves a Journey mention only when exceptionally tight.
   const match=new Set();for(const p of data.overall){if(p.gap>1.5)break;if(match.has(p.eventId+'|'+p.kind))continue;match.add(p.eventId+'|'+p.kind);
     hist.push({key:'battle:'+p.kind+':'+p.eventId,date:p.date,icon:'⚔️',title:'A BATTLE TO REMEMBER',line1:p.event,line2:`${carLabel(p.first.id,cars)} vs ${carLabel(p.second.id,cars)} — ${gapFmt(p.gap)} apart (${p.p1}${p.p1===1?'st':p.p1===2?'nd':p.p1===3?'rd':'th'} & ${p.p2}${p.p2===2?'nd':p.p2===3?'rd':p.p2===4?'th':'th'})`});
   }
   const done=s.evilCampaignR18098?.done||{};
   for(const n of [13,25,50,100,250,500,1177]){const entry=done[String(n)];if(!entry)continue;hist.push({key:'slot:'+n,date:entry.doneAt||'',icon:'🏆',title:n===13?'THE LEGENDARY SLOT 13!':`EVIL R1 — SLOT ${String(n).padStart(4,'0')}`,line1:`${n} campaign slots conquered`,line2:n===13?'The first great celebration. You earned it!':'Another landmark on the road to 1177.'})}
   return hist.sort((a,b)=>when(b.date)-when(a.date)||a.title.localeCompare(b.title));
 }
 function recordsPage(){const host=$('hall');if(!host)return;const s=activeSpace(),cars=carMap(s||{}),r=closest(s),cat=[['finish','CLOSEST CHAMPIONSHIP FINISH','Difference between champion and runner-up'],['podium','CLOSEST PODIUM BATTLES','Adjacent podium positions'],['overall','CLOSEST OVERALL BATTLES','Any adjacent finishing positions']];
   host.innerHTML=`<div class="v7Journey otgBattles8114"><div class="v7JourneyHead"><button type="button" onclick="rhRecordsMode='records';rhRenderRecords()">‹ BACK TO RECORDS</button><h1>CLOSEST BATTLES</h1><p>Historic racing, decided by seconds</p></div><section class="otgBattlesIntro8114">Completed, timed Festival and Custom Racing competitions only. Rankings use the final official overall times. Knockout and score-based competitions are excluded.</section>${cat.map(([key,title,detail])=>`<section class="otgBattlesSection8114"><header><h2>${title}</h2><small>${detail}</small></header>${r[key].length?r[key].slice(0,25).map((x,i)=>`<article class="otgBattleRow8114"><div class="otgBattleTop8114"><b>${String(i+1).padStart(2,'0')}</b><strong>${gapFmt(x.gap)}</strong><small>${E(day(x.date))}</small></div><h3>${E(x.event)}</h3><p><span>${x.p1}. ${E(carLabel(x.first.id,cars))}</span><em>${fmt(x.first.total)}</em></p><p><span>${x.p2}. ${E(carLabel(x.second.id,cars))}</span><em>${fmt(x.second.total)}</em></p><small>${E(x.kind)}</small></article>`).join(''):`<p class="otgBattlesEmpty8114">No completed timed championships with verified standings yet.</p>`}</section>`).join('')}<footer>ⓘ Records are recalculated from the current Space's saved completed competitions. Corrected results are reflected automatically. No racing data is changed.</footer></div>`;host.scrollTop=0;window.scrollTo(0,0);
 }
 window.rhOpenClosestBattlesV8114=recordsPage;
 const oldRecords=window.rhRenderRecords;
 if(typeof oldRecords==='function')window.rhRenderRecords=function(...args){const result=oldRecords.apply(this,args);if(window.rhRecordsMode==='hall')return result;const root=$('hall')?.querySelector('.v7RecordsLanding main');if(root&&!root.querySelector('#otgClosestBattlesTile8114')){
   const tile=document.createElement('button');tile.id='otgClosestBattlesTile8114';tile.className='v7JourneyTile otgClosestBattlesTile8114';tile.type='button';tile.innerHTML='<span aria-hidden="true">⚔️</span><div><b>CLOSEST BATTLES</b><small>Closest finishes, podium fights and historic rivals</small><em>VIEW BATTLES ›</em></div><i aria-hidden="true">›</i>';tile.addEventListener('click',recordsPage);
   const journey=root.querySelector('.v7JourneyTile');(journey||root.firstElementChild)?.insertAdjacentElement('afterend',tile);
 }return result};
 const oldJourney=window.rhOpenJourneyV7003;
 if(typeof oldJourney==='function')window.rhOpenJourneyV7003=function(...args){const result=oldJourney.apply(this,args),host=$('hall'),timeline=host?.querySelector('.v7Timeline');if(!timeline)return result;
   const moments=historic(activeSpace());for(const item of moments){const el=document.createElement('article');el.className='otgJourneyMoment8114';el.innerHTML=`<i>${item.icon}</i><div><time>${E(day(item.date)).toUpperCase()}</time><h2>${E(item.title)}</h2><p>${E(item.line1)}<br>${E(item.line2)}</p></div><strong>${item.icon}</strong>`;timeline.appendChild(el)}
   // Keep historical moments and pre-existing milestone cards in chronological order.
   const nodes=[...timeline.querySelectorAll('article')];if(nodes.length>1){nodes.sort((a,b)=>{
     const parse=n=>{const t=n.querySelector('time')?.textContent||'';return Date.parse(t)||0};return parse(b)-parse(a)});nodes.forEach(n=>timeline.appendChild(n))}
   return result;
 };
 window.otgBattlesQA8114={totalBoard,closest,historic};
})();
