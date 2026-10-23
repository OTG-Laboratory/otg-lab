/* OTG! MAIN 8.0.115 — Closest Battles records + My OTG! Journey historic moments.
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

 // v8.0.115: an archive of measured gaps, not a separate set of result records.
 const milliseconds=t=>Math.round(Number(t)*1000);
 const sortBattles=arr=>arr.sort((a,b)=>milliseconds(a.gap)-milliseconds(b.gap)||when(a.date)-when(b.date)||a.event.localeCompare(b.event)||a.first.id.localeCompare(b.first.id));
 function paired({id,event,kind,stage,track,date,a,b,origin}){
   if(!a||!b||!finite(a.time)||!finite(b.time)||String(a.id)===String(b.id))return null;
   const gap=Math.abs(milliseconds(a.time)-milliseconds(b.time))/1000;
   if(!Number.isFinite(gap))return null;
   const first=Number(a.time)<=Number(b.time)?a:b,second=first===a?b:a;
   return {id:String(id),event:String(event||kind),kind,stage:String(stage||''),track:String(track||''),date:String(date||''),first:{id:String(first.id),time:Number(first.time)},second:{id:String(second.id),time:Number(second.time)},gap,origin};
 }
 function swissDone(e){
   const sc=e?.swissCompleted;if(sc?.standings?.length)return sc;
   const rounds=e?.customSwiss?.rounds||[];
   if(!rounds.length||rounds.some(r=>r.status!=='complete')||rounds.length!==Number(e.customSwiss?.roundCount))return null;
   const ids=e.frozenCarIds||[];
   const stats=new Map(ids.map(id=>[String(id),{id:String(id),wins:0,oppWins:0,time:0,opps:[]} ]));
   for(const r of rounds){for(const m of r.matches||[]){const a=stats.get(String(m.carA)),b=stats.get(String(m.carB));if(!a||!b||!finite(m.resultA?.time)||!finite(m.resultB?.time))continue;a.time+=Number(m.resultA.time);b.time+=Number(m.resultB.time);a.opps.push(b.id);b.opps.push(a.id);const w=stats.get(String(m.winnerId));if(w)w.wins++}if(r.byeId&&stats.has(String(r.byeId)))stats.get(String(r.byeId)).wins++}
   const rows=[...stats.values()];for(const x of rows)x.oppWins=x.opps.reduce((sum,id)=>sum+(stats.get(id)?.wins||0),0);
   rows.sort((a,b)=>b.wins-a.wins||b.oppWins-a.oppWins||a.time-b.time);
   return {standings:rows,rounds};
 }
 function trackType(track,s){
   // FH5 track taxonomy is authoritative. Unknown / other-game routes remain unclassified.
   if(String(s?.catalogueKey)!=='fh5-catalogue-v1')return '';
   const t=(window.rhFH5TrackTaxonomy8070||window.rhFH5TrackTaxonomy8067)?.track?.(track);
   if(!t)return '';
   if(t.category==='ROAD')return 'road';
   if(t.category==='OFFROAD')return 'offroad';
   if(t.category==='RALLY')return 'rally';
   if(t.category==='HOT_WHEELS')return 'hotwheels';
   if(t.category==='DRAG')return 'drag';
   return '';
 }
 function timedMatchLists(s){
   const head2head=[],individual=[],seen=new Set();
   const add=(b)=>{if(!b||seen.has(b.id))return;seen.add(b.id);head2head.push(b);individual.push(b)};
   for(const ro of s?.raceOffs||[]){
     for(const rd of ro?.rounds||[]){for(let i=0;i<(rd.matches||[]).length;i++){
       const m=rd.matches[i];if(!m?.resultA||!m?.resultB)continue;
       const track=String(rd.name||m.resultA.track||m.resultB.track||'');
       if(m.resultA.track&&m.resultB.track&&String(m.resultA.track)!==String(m.resultB.track))continue;
       add(paired({id:`raceoff:${ro.id}:${rd.id||rd.number||''}:${m.id||i}`,event:ro.name,kind:'Race Off',stage:rd.stageLabel||rd.drawPlan?.label||`ROUND ${rd.number||''}`,track,date:m.resultB.date||m.resultA.date||rd.completedAt||ro.completedAt,a:{id:m.carA?.id||m.carA,time:m.resultA.time},b:{id:m.carB?.id||m.carB,time:m.resultB.time},origin:'raceoff'}));
     }}
   }
   for(const e of s?.customEvents||[]){
     const stages=[['Custom Knockout',e.customKO?.rounds||[],'raceoff'],['Swiss',e.swissCompleted?.rounds||e.customSwiss?.rounds||[],'swiss']];
     for(const [kind,rounds,origin] of stages)for(const rd of rounds){for(let i=0;i<(rd.matches||[]).length;i++){
       const m=rd.matches[i];if(!m?.resultA||!m?.resultB)continue;
       const track=String(rd.trackName||rd.name||m.resultA.track||m.resultB.track||'');
       if(m.resultA.track&&m.resultB.track&&String(m.resultA.track)!==String(m.resultB.track))continue;
       add(paired({id:`${origin}:${e.id}:${rd.id||rd.index||''}:${m.id||i}`,event:e.name,kind,stage:rd.label||`ROUND ${rd.index||''}`,track,date:m.resultB.date||m.resultA.date||rd.completedAt||e.completedAt,a:{id:m.carA,time:m.resultA.time},b:{id:m.carB,time:m.resultB.time},origin}));
     }}
   }
   // Same-run, same-route Festival results are eligible for discipline-specific tight finishes.
   // Never compare times from different tracks or separate groups, even if the event uses 2 tracks.
   for(const r of s?.runs||[]){const groups=new Map();
     for(const x of r.results||[]){if(!finite(x.time)||!x.carId)continue;
       const track=String(x.roundName||x.track||'').trim();if(!track)continue;
       const grp=String(x.groupId||'main');const rid=String(x.roundId||track);
       const key=JSON.stringify([grp,rid,track.toLowerCase()]);if(!groups.has(key))groups.set(key,{track,grp,rid,entries:new Map()});
       const g=groups.get(key),id=String(x.carId),prior=g.entries.get(id);
       if(!prior||when(x.date)>=when(prior.date))g.entries.set(id,x);
     }
     for(const [key,g] of groups){const rows=[...g.entries.values()].sort((a,b)=>Number(a.time)-Number(b.time)||String(a.carId).localeCompare(String(b.carId)));
       for(let i=1;i<rows.length;i++){
         const a=rows[i-1],b=rows[i];const item=paired({id:`festival:${r.id}:${key}:${a.carId}:${b.carId}`,event:r.name,kind:'Festival — Single Race',stage:g.grp!=='main'?`GROUP ${g.grp}`:'CHAMPIONSHIP ROUND',track:g.track,date:b.date||a.date||r.completedAt,a:{id:a.carId,time:a.time},b:{id:b.carId,time:b.time},origin:'festivalRace'});
         if(item)individual.push(item);
       }
     }
   }
   return {head2head,individual};
 }
 function battleCategories(s){
   const out=closest(s),match=timedMatchLists(s),swissStand=[];
   for(const e of s?.customEvents||[]){const finished=swissDone(e);if(!finished)continue;
     const sorted=finished.standings||[];
     for(let i=1;i<sorted.length;i++){
       const a=sorted[i-1],b=sorted[i];if(!a||!b||a.wins!==b.wins||a.oppWins!==b.oppWins||!finite(a.time)||!finite(b.time))continue;
       const item=paired({id:`swiss-standing:${e.id}:${a.id}:${b.id}`,event:e.name,kind:'Swiss Standings',stage:`TIED ON ${a.wins} WINS · ${a.oppWins} OPPONENT WINS`,track:'',date:finished.rounds?.at(-1)?.completedAt||e.completedAt,a,b,origin:'swissStandings'});
       if(item)swissStand.push(item);
     }
   }
   const c=[
     {group:'CHAMPIONSHIPS',key:'festivalWinner',icon:'🏆',title:'FESTIVAL — CLOSEST CHAMPIONSHIP',detail:'Final 1st vs 2nd · completed timed championships',rows:out.finish.map(x=>({...x,id:`festivalfinish:${x.eventId}`,first:{id:x.first.id,time:x.first.total},second:{id:x.second.id,time:x.second.total},origin:'festivalTotal',stage:'FINAL STANDINGS'}))},
     {group:'CHAMPIONSHIPS',key:'festivalOther',icon:'⚔️',title:'FESTIVAL — OTHER CLOSE BATTLES',detail:'Final adjacent positions, excluding 1st vs 2nd',rows:out.overall.filter(x=>x.p1!==1).map(x=>({...x,id:`festivalother:${x.eventId}:${x.p1}`,first:{id:x.first.id,time:x.first.total},second:{id:x.second.id,time:x.second.total},origin:'festivalTotal',stage:`FINAL ${x.p1} vs ${x.p2}`}))},
     {group:'HEAD-TO-HEAD',key:'raceOff',icon:'🏁',title:'RACE OFF — CLOSEST PAIRING',detail:'Timed Race Off and Custom Knockout pairings',rows:match.head2head.filter(x=>x.origin==='raceoff')},
     {group:'HEAD-TO-HEAD',key:'swissMatch',icon:'🇨🇭',title:'SWISS — CLOSEST MATCH',detail:'Timed Swiss pairings, both results entered',rows:match.head2head.filter(x=>x.origin==='swiss')},
     {group:'HEAD-TO-HEAD',key:'swissFinal',icon:'📊',title:'SWISS — CLOSEST STANDINGS TIE',detail:'Only cars tied on wins and opponent wins · total-time tiebreak',rows:swissStand},
   ];
   const discipline=[['road','🛣️','ROAD / STREET'],['offroad','🌲','OFF-ROAD'],['rally','⛰️','RALLY ADVENTURE'],['hotwheels','🔥','HOT WHEELS'],['drag','🚀','DRAG']];
   for(const [key,icon,label] of discipline)c.push({group:'DISCIPLINE RECORDS',key,icon,title:label+' — CLOSEST RACE',detail:'Same event and same route · FH5 track-classified timed results',rows:match.individual.filter(x=>trackType(x.track,s)===key)});
   for(const x of c){const uniq=new Map();for(const r of x.rows)if(r&&!uniq.has(r.id))uniq.set(r.id,r);x.rows=sortBattles([...uniq.values()]).slice(0,5)}
   return c;
 }

 function recordsPage(){
   const host=$('hall');if(!host)return;
   const s=activeSpace(),cars=carMap(s||{}),categories=battleCategories(s),groupNames=['CHAMPIONSHIPS','HEAD-TO-HEAD','DISCIPLINE RECORDS'];
   function row(x,i){const loc=x.track?`<span class="otgBattleTrack8115">${E(x.track)}</span>`:'';
     return `<article class="otgBattleRank8115"><div class="otgBattleRankHead8115"><b>#${i+1}</b><strong>${gapFmt(x.gap)}</strong><time>${E(day(x.date))}</time></div><div class="otgBattleRankEvent8115">${E(x.event)}${x.stage?` <span>• ${E(x.stage)}</span>`:''}</div>${loc}<div class="otgBattleRankCar8115"><span>${E(carLabel(x.first.id,cars))}</span><b>${fmt(x.first.time)}</b></div><div class="otgBattleRankCar8115"><span>${E(carLabel(x.second.id,cars))}</span><b>${fmt(x.second.time)}</b></div></article>`;}
   function card(cat){const first=cat.rows[0];
     return `<details class="otgBattleFold8115" data-cat="${cat.key}"><summary><span class="otgBattleFoldIcon8115" aria-hidden="true">${cat.icon}</span><span class="otgBattleFoldText8115"><strong>${E(cat.title)}</strong><small>${E(cat.detail)}</small>${first?`<span class="otgBattleLead8115"><b>${gapFmt(first.gap)}</b><span>${E(carLabel(first.first.id,cars))} <i>vs</i> ${E(carLabel(first.second.id,cars))}</span></span>`:`<span class="otgBattleEmptyLabel8115">AWAITING FIRST RECORD</span>`}</span><span class="otgBattleFoldAction8115" aria-hidden="true">${first?'TOP '+cat.rows.length:'OPEN'} <span class="otgBattleChevron8115">⌄</span></span></summary><div class="otgBattleFoldBody8115">${first?cat.rows.map(row).join(''):`<p class="otgBattleEmpty8115">No qualifying result has been recorded in this Space yet. The first eligible result will appear here automatically.</p>`}</div></details>`;}
   host.innerHTML=`<div class="v7Journey otgBattles8115"><div class="v7JourneyHead"><button type="button" onclick="rhRecordsMode='records';rhRenderRecords()">‹ BACK TO RECORDS</button><h1>CLOSEST BATTLES</h1><p>THE FINEST MARGINS IN OTG!</p></div><section class="otgBattleIntro8115"><span>🏆</span><div><b>EVERY MILLISECOND MATTERS.</b><p>Each category shows its closest battle. Tap to reveal the top five. New results update the rankings automatically.</p></div></section>${groupNames.map(g=>`<section class="otgBattleGroup8115"><h2>${g}</h2>${categories.filter(x=>x.group===g).map(card).join('')}</section>`).join('')}<p class="otgBattleFoot8115">ⓘ Championship records use completed final standings. Race Off and Swiss matches count as soon as both timed results are saved. Specialist records compare cars on the same race route; a battle can appear in both a format table and a discipline table. Swiss standings are time-ranked only after other Swiss tiebreakers are equal. Unsupported tracks remain unclassified. Results are never modified or deleted.</p></div>`;
   host.scrollTop=0;window.scrollTo(0,0);
 }
 window.rhOpenClosestBattlesV8115=recordsPage;
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
 window.otgBattlesQA8115={totalBoard,closest,historic,paired,trackType,timedMatchLists,battleCategories,swissDone};
})();
