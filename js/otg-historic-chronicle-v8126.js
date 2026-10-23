/* OTG! v8.0.126 — Racing Chronicle / Historic Moments.
   Current-Space-only historical reconstruction from actual saved results. READ-ONLY.
   No saved history flags, pseudo-awards, event mutations, or additional storage. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)>0;
 const at=v=>{const n=Date.parse(v||'');return Number.isFinite(n)&&n>0?n:0};
 const sec=v=>Math.round(Number(v)*1000);
 const gap=v=>(Math.round(v*1000)/1000).toFixed(3)+'s';
 const date=v=>at(v)?new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'DATE NOT RECORDED';
 const current=()=>typeof window.rhSpace==='function'?window.rhSpace():null;
 const keyOf=v=>String(v?.sourceCarId??v?.id??v??'');
 const sorted=(a,b)=>at(b.date)-at(a.date)||String(a.title).localeCompare(String(b.title))||String(a.key).localeCompare(String(b.key));
 const labels=s=>new Map((s?.cars||[]).map(c=>[String(c.id),c]));
 const car=(id,cs)=>{const c=cs.get(String(id));return c?[c.make,c.model,c.year].filter(Boolean).join(' ').trim()||String(c.name):String(id||'Unknown car')};
 const typeName=e=>String(e?.name||e?.title||'Unnamed event');
 const badge={battle:'⚔️',champion:'🏆',rivalry:'🔥',comeback:'🚀',pb:'⏱️',campaign:'😈'};
 const family={all:'ALL MOMENTS',battle:'CLOSE BATTLES',champion:'TITLES & LEGENDS',rivalry:'RIVALRIES',comeback:'COMEBACKS',pb:'PERSONAL BESTS',campaign:'EVIL MILESTONES'};
 let filter='all',query='',visible=24,origin='journey';
 function makeMoment(type,key,date,title,story,evidence,source,carIds=[]){return{type,key:String(key),date:String(date||''),title:String(title),story:String(story),evidence:String(evidence),source:String(source),carIds:carIds.map(String)};}
 function resultRows(s){const out=[],seen=new Set();
  function add(res,src,kind,rd,who,signature){if(!res||res.advancedTiming||!num(res.time))return;
   const id=keyOf(who||res.carId||res.car),route=String(res.track||res.roundName||rd?.name||rd?.trackName||'').trim();if(!id||!route)return;
   const layout=String(res.layout||rd?.layout||'').trim();const stamp=at(res.date||res.savedAt||res.recordedAt||res.createdAt);
   // Only chronologically ordered real timestamps can prove a new personal best.
   if(!stamp)return;
   const uniq=res.id?`id:${res.id}`:`${kind}:${src?.id}:${rd?.id}:${signature}:${id}:${stamp}:${sec(res.time)}`;
   if(seen.has(uniq))return;seen.add(uniq);
   out.push({id,route,layout,stamp,date:new Date(stamp).toISOString(),time:Number(res.time),event:typeName(src),kind,uniq});
  }
  for(const r of s?.runs||[]){const rounds=new Map((r.rounds||[]).map(x=>[String(x.id),x]));for(const x of r.results||[])add(x,r,'Festival',rounds.get(String(x.roundId)),x.carId,'')}
  for(const e of s?.customEvents||[]){const rounds=new Map((e.frozenRounds?.length?e.frozenRounds:e.rounds||[]).map(x=>[String(x.id),x]));for(const x of e.results||[])add(x,e,'Custom',rounds.get(String(x.roundId)),x.carId,'');
   for(const [kind,rdList] of [['Swiss',e.swissCompleted?.rounds||e.customSwiss?.rounds||[]],['Custom Knockout',e.customKO?.rounds||[]]])for(const rd of rdList)for(const m of rd.matches||[]){add(m.resultA,e,kind,rd,m.carA,m.id+':A');add(m.resultB,e,kind,rd,m.carB,m.id+':B')}
  }
  for(const ro of s?.raceOffs||[])for(const rd of ro.rounds||[])for(const m of rd.matches||[]){add(m.resultA,ro,'Race Off',rd,m.carA,m.id+':A');add(m.resultB,ro,'Race Off',rd,m.carB,m.id+':B')}
  return out.sort((a,b)=>a.stamp-b.stamp||a.uniq.localeCompare(b.uniq));
 }
 function archive(s){if(!s)return[];const cs=labels(s),items=[],unique=new Set();
  function push(x){if(!x||unique.has(x.key))return;unique.add(x.key);items.push(x)}
  // The FIRST recorded dated race is documentary fact; not necessarily the player's first race in-game.
  const rows=resultRows(s);if(rows.length){const x=rows[0];push(makeMoment('pb','first:'+x.uniq,x.date,'THE FIRST RECORDED DRIVE',`${car(x.id,cs)} — ${x.route}.`,'Earliest timestamped timed result currently stored in this Space; older undated driving cannot be ruled out.',`${x.kind} · ${x.event}`,[x.id]))}
  // Better PB: same car, same named route AND layout, strictly earlier dated attempt.
  const best=new Map(),improvements=[];
  for(const x of rows){const k=JSON.stringify([x.id,x.route.trim().toLowerCase(),x.layout.trim().toLowerCase()]);const prev=best.get(k);
   if(prev&&sec(x.time)<sec(prev.time)&&x.stamp>prev.stamp){
    improvements.push({x,prev,saved:(sec(prev.time)-sec(x.time))/1000});
   }
   if(!prev||sec(x.time)<sec(prev.time))best.set(k,x);
  }
  // Curate meaningful improvements (rather than hundreds of routine tiny PB changes).
  improvements.sort((a,b)=>b.saved-a.saved||b.x.stamp-a.x.stamp);
  for(const p of improvements.slice(0,25))push(makeMoment('pb','pb:'+p.x.uniq,p.x.date,'A PERSONAL BEST SHATTERED',`${car(p.x.id,cs)} beat its previous ${p.x.route} time by ${gap(p.saved)}.`,`Previous: ${p.prev.time.toFixed(3)}s · New: ${p.x.time.toFixed(3)}s. Same car, route and layout; earlier dated result verified.`,`${p.x.kind} · ${p.x.event}`,[p.x.id]));
  // Completed Festival + completed Custom Championships; existing source only
  // produces verified comparable final timing standings.
  const boards=window.otgBattlesQA8117?.closest?.(s);
  if(boards){const priorGold=new Set();
   const chronological=boards.boards.slice().sort((a,b)=>at(a.date)-at(b.date)||a.event.localeCompare(b.event));
   for(const b of chronological){if(!b.rows?.length||!at(b.date))continue;
    const w=b.rows[0],make=String(cs.get(w.id)?.make||'');
    const eligible=new Set((b.entries?.length?b.entries:b.rows.map(x=>x.id)).map(id=>cs.get(String(id))?.make).filter(Boolean));
    if(eligible.size>1&&make&&!priorGold.has(make)){
     priorGold.add(make);push(makeMoment('champion','firstmake:'+make,b.date,`${make.toUpperCase()} — FIRST RECORDED GOLD`,`${car(w.id,cs)} won ${b.event}.`,'Earliest completed, timed multi-manufacturer championship currently recorded for this winning make. Does not imply first-ever in-game victory.',`${b.kind} · ${b.event}`,[w.id]));
    }
   }
   // A championship final is not a race-off and is only a close battle when the
   // COMPLETE final times of first and second are both known.
   for(const b of boards.finish||[]){if(b.gap>2||!Number.isFinite(b.gap))continue;
    push(makeMoment('battle','finish:'+b.eventId,b.date,'CHAMPIONSHIP DECIDED BY A WHISKER',`${car(b.first.id,cs)} edged ${car(b.second.id,cs)} by ${gap(b.gap)}.`,`Final cumulative times in a completed ${b.kind} championship: 1st versus 2nd.`,b.event,[b.first.id,b.second.id]));
   }
  }
  // Verifiable SAME-ROUTE individual head-to-head margins; one result pair per event/stage.
  const duels=window.otgBattlesQA8117?.timedMatchLists?.(s)?.head2head||[];
  const seenDuels=new Set();
  for(const x of duels){
   if(!Number.isFinite(x.gap)||x.gap>1.5||seenDuels.has(x.id))continue;seenDuels.add(x.id);
   push(makeMoment('battle','duel:'+x.id,x.date,'A BATTLE TO REMEMBER',`${car(x.first.id,cs)} versus ${car(x.second.id,cs)} — only ${gap(x.gap)} apart.`,`Both competitors recorded valid times for the same match and route (${x.track||'route unlabelled'}). Stage: ${x.stage||'head-to-head'}.`,`${x.kind} · ${x.event}`,[x.first.id,x.second.id]));
  }
  // Reuse the tested rivalry-meeting algorithm, which counts multi-route
  // Festival group meetings ONCE, not once for every shared race.
  const rivalryData=window.otgLegendsQA8118?.rivals?.(s)||[];
  for(const r of rivalryData){const dates=r.history.slice().sort((a,b)=>at(a.date)-at(b.date));const second=dates[1];
   push(makeMoment('rivalry','rival:'+r.key,second?.date||'',r.meetings>=3?'A RIVALRY BECOMES LEGENDARY':'A RIVALRY IS BORN',`${car(r.a,cs)} versus ${car(r.b,cs)} — ${r.meetings} distinct meetings.`,`Head-to-head tally: ${r.aWins}–${r.bWins} wins${r.ties?', '+r.ties+' ties':''}. Closest gap: ${gap(r.closest)}. Festival multiple routes within one group count as one meeting.`,`Most recent encounter: ${dates.at(-1)?.event||'recorded competition'}`,[r.a,r.b]));
  }
  for(const [key,fn] of [['festival',window.otgLegendsQA8118?.festivalComebacks],['swiss',window.otgLegendsQA8118?.swissComebacks]]){
   if(typeof fn!=='function')continue;
   for(const r of fn(s)||[]){push(makeMoment('comeback',`${key}:comeback:${r.event}:${r.id}`,r.date,'THE GREAT COMEBACK',`${car(r.id,cs)} climbed ${r.gain} places: ${r.firstRank} → ${r.finalRank}.`,`Verified ${r.rounds}-round ${key.toUpperCase()} standings. Festival uses complete cumulative final; Swiss uses qualifying stage rankings only.`,`${key.toUpperCase()} · ${r.event}`,[r.id]));}
  }
  // Evil Campaign milestones only appear once the exact slot is actually marked DONE.
  // This remains the R1 saved object; we do not hardcode the campaign's total to 1177.
  const done=s.evilCampaignR18098?.done||{};
  for(const n of [13,26,25,50,100,250,500,1000,1177,1219]){const record=done[String(n)];if(!record)continue;
   const special=n===13?'THE LEGENDARY SLOT 13':n===26?'THE FIRST SWISS SLOT':`TOURNAMENT SLOT ${String(n).padStart(4,'0')}`;
   push(makeMoment('campaign','slot:'+n,record.doneAt||record.at||'','THE EVIL TOURNAMENT — '+special,`Slot ${n} completed. Another page in your Evil Tournament history.`,'Confirmed by the saved Evil R1 DONE map, not the number of events created.','The Evil Tournament — sponsored by Dave and Steves Lubrication Fluids'));
  }
  return items.sort(sorted);
 }
 function filtered(s){const q=query.trim().toLocaleLowerCase('en');return archive(s).filter(x=>(filter==='all'||x.type===filter)&&(!q||[x.title,x.story,x.evidence,x.source,...x.carIds.map(id=>car(id,labels(s)))].join(' ').toLocaleLowerCase('en').includes(q)))}
 function counts(s){const all=archive(s),o={all:all.length};for(const x of all)o[x.type]=(o[x.type]||0)+1;return o}
 function page(){const host=$('hall');if(!host)return;
  const s=current(),cs=labels(s),all=archive(s),total={all:all.length};
  for(const x of all)total[x.type]=(total[x.type]||0)+1;
  const q=query.trim().toLocaleLowerCase('en');
  const matched=all.filter(x=>(filter==='all'||x.type===filter)&&(!q||[x.title,x.story,x.evidence,x.source,...x.carIds.map(id=>car(id,cs))].join(' ').toLocaleLowerCase('en').includes(q)));
  const display=matched.slice(0,visible);
  host.innerHTML=`<div class="otgChronicle8126"><header class="otgChronHero8126"><button type="button" onclick="rhChronicleBack8126()">‹ BACK</button><span class="otgChronKicker8126">MY OTG! · ${E(s?.name||'CURRENT SPACE')} · CAREER ARCHIVE</span><h1>HISTORIC<br><em>MOMENTS</em></h1><p>Every great rivalry starts with a race. Every legend leaves evidence.</p><strong>YOUR HARDEST OPPONENT IS YOU.</strong></header>
   <main class="otgChronMain8126"><section class="otgChronSummary8126"><div><b>${total.all||0}</b><small>RECORDED MOMENTS</small></div><div><b>${total.battle||0}</b><small>CLOSE BATTLES</small></div><div><b>${total.champion||0}</b><small>FIRST TITLES</small></div><div><b>${total.campaign||0}</b><small>EVIL LANDMARKS</small></div></section>
   <section class="otgChronNav8126" aria-label="Explore related career records"><button onclick="rhChronicleLegends8126()">⚔️ RACING LEGENDS ›</button><button onclick="rhChronicleBattles8126()">🏁 CLOSEST BATTLES ›</button><button onclick="rhChronicleReports8126()">▤ RACING REPORTS ›</button></section>
   <section class="otgChronFilters8126"><label for="otgChronSearch8126">FIND A STORY</label><input type="search" id="otgChronSearch8126" value="${E(query)}" placeholder="Car, track, rival, championship…" oninput="rhChronicleSearch8126(this.value)"><div class="otgChronChips8126">${Object.entries(family).map(([k,v])=>`<button type="button" data-type="${E(k)}" class="${filter===k?'on':''}" onclick="rhChronicleFilter8126('${k}')">${E(v)} <span>${total[k]||0}</span></button>`).join('')}</div></section>
   <div class="otgChronListHead8126"><h2>THE HISTORY BOOK</h2><span>${matched.length} matching ${matched.length===1?'moment':'moments'}</span></div>
   ${display.length?`<div class="otgChronItems8126">${display.map((x,i)=>`<article class="otgChronMoment8126" data-kind="${E(x.type)}"><div class="otgChronMomentTop8126"><span aria-hidden="true">${badge[x.type]}</span><small>${E(family[x.type])}</small><time>${E(date(x.date))}</time></div><h3>${E(x.title)}</h3><p>${E(x.story)}</p><details><summary>WHY THIS MADE HISTORY <span>⌄</span></summary><div><b>THE EVIDENCE</b><p>${E(x.evidence)}</p><small>${E(x.source)}</small>${x.carIds.length?`<small>${E(x.carIds.map(id=>car(id,cs)).join(' · '))}</small>`:''}</div></details></article>`).join('')}</div>`:`<div class="otgChronEmpty8126"><b>NO MOMENTS IN THIS CATEGORY YET</b><p>${query||filter!=='all'?'Try another filter or search.':'The archive fills itself from real saved racing results. Nothing gets invented to make a prettier trophy cabinet.'}</p></div>`}
   ${matched.length>display.length?`<button class="otgChronMore8126" onclick="rhChronicleMore8126()">SHOW MORE · ${matched.length-display.length} REMAINING</button>`:''}
   <footer>ⓘ All stories are calculated from existing saved results in the selected Space. Close battles require comparable times; comebacks require verified standings; personal bests require earlier dated attempts on the exact same car and route. Undated moments are labelled, not given imaginary dates. No results, records, Spaces, medals or campaign progress are changed.</footer></main></div>`;
  host.scrollTop=0;window.scrollTo(0,0);
 }
 function enter(from='journey'){origin=from==='legends'?'legends':'journey';filter='all';query='';visible=24; if(typeof window.rhShow==='function')window.rhShow('hall');page()}
 window.rhOpenHistoricMoments8126=enter;
 window.rhChronicleBack8126=()=>{if(origin==='legends'){if(typeof window.rhShow==='function')window.rhShow('more');window.rhOpenRacingLegends8118?.()}else window.rhOpenJourneyV7003?.()};
 window.rhChronicleFilter8126=x=>{if(!(x in family))return;filter=x;visible=24;page()};
 window.rhChronicleSearch8126=x=>{query=String(x);visible=24;page();const el=$('otgChronSearch8126');el?.focus();el?.setSelectionRange(query.length,query.length)};
 window.rhChronicleMore8126=()=>{visible+=24;page()};
 window.rhChronicleLegends8126=()=>{if(typeof window.rhShow==='function')window.rhShow('more');window.rhOpenRacingLegends8118?.()};
 window.rhChronicleBattles8126=()=>{if(typeof window.rhShow==='function')window.rhShow('hall');window.rhOpenClosestBattlesV8117?.()};
 window.rhChronicleReports8126=()=>{if(typeof window.rhShow==='function')window.rhShow('hall');window.rhOpenRacingReportsV8113?.()};
 // Add a single entry to Journey after Reports; keep its existing milestones.
 const old=window.rhOpenJourneyV7003;
 if(typeof old==='function')window.rhOpenJourneyV7003=function(...args){const result=old.apply(this,args),host=$('hall');if(!host||host.querySelector('#otgChronTile8126'))return result;
  const tile=document.createElement('button');tile.id='otgChronTile8126';tile.type='button';tile.className='otgChronTile8126';tile.innerHTML='<span aria-hidden="true">🏛️</span><div><b>HISTORIC MOMENTS</b><small>Real battles, comebacks, first titles and your Evil milestones.</small><em>OPEN THE ARCHIVE ›</em></div><i aria-hidden="true">›</i>';
  tile.addEventListener('click',()=>enter('journey'));const anchor=host.querySelector('#otgRacingReportsTile8113')||host.querySelector('.v7JourneyHead');anchor?.insertAdjacentElement('afterend',tile);return result;
 };
 window.otgChronicleQA8126={archive,counts,resultRows,filtered:(s,kind='all',q='')=>archive(s).filter(x=>(kind==='all'||x.type===kind)&&(!q||[x.title,x.story,x.evidence,x.source].join(' ').toLowerCase().includes(q.toLowerCase())))};
})();
