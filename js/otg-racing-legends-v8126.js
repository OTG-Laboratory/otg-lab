/* v8.0.126: verified Historic Moments archive bridge. v8.0.119 ranking engine retained. */
/* OTG! v8.0.119 — Arch-Rivals: distinct competition meetings and explicit back navigation.
 * Read-only racing analysis. Never changes saved results, medal rules or campaign progress.
 */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const current=()=>typeof window.rhSpace==='function'?window.rhSpace():null;
 const valid=t=>t!==null&&t!==undefined&&t!==''&&Number.isFinite(Number(t))&&Number(t)>0;
 const ms=t=>Math.round(Number(t)*1000);
 const gapFmt=t=>(ms(t)/1000).toFixed(3)+'s';
 const carId=v=>String(v?.sourceCarId??v?.id??v??'');
 const carMap=s=>new Map((s?.cars||[]).map(c=>[String(c.id),c]));
 const label=(id,map)=>{const c=map.get(String(id));return c?(typeof window.carName==='function'?window.carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ')):String(id||'Unknown car')};
 const eventName=e=>String(e?.name||e?.title||'Unnamed event');
 const dateLabel=v=>Number.isFinite(Date.parse(v||''))?new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'DATE NOT RECORDED';
 const pairKey=(a,b)=>[String(a),String(b)].sort().join('¦');
 const cmp=(a,b)=>String(a).localeCompare(String(b),'en');

 // Only compare two valid results in the SAME head-to-head matchup or the SAME
 // timed Festival race. One encounter per race/round/group, never across routes.
 function encounters(s){const all=[],used=new Set();
   function add(src,a,b,ta,tb,meta){a=carId(a);b=carId(b);if(!a||!b||a===b||!valid(ta)||!valid(tb)||!src||used.has(src))return;
     const left=Number(ta)<=Number(tb)?a:b,right=left===a?b:a;
     all.push({id:src,key:pairKey(a,b),a,b,timeA:ms(ta),timeB:ms(tb),winner:ms(ta)===ms(tb)?'':left,loser:ms(ta)===ms(tb)?'':right,gap:Math.abs(ms(ta)-ms(tb))/1000,...meta});used.add(src);
   }
   for(const ro of s?.raceOffs||[])for(const rd of ro?.rounds||[])for(let i=0;i<(rd.matches||[]).length;i++){
     const m=rd.matches[i];if(!m?.resultA||!m?.resultB)continue;
     if(m.resultA.track&&m.resultB.track&&String(m.resultA.track)!==String(m.resultB.track))continue;
     add(`raceoff:${ro.id}:${rd.id||rd.number||''}:${m.id||i}`,m.carA,m.carB,m.resultA.time,m.resultB.time,{event:eventName(ro),kind:'RACE OFF',track:String(rd.name||m.resultA.track||''),date:m.resultB.date||m.resultA.date||ro.completedAt||''});
   }
   for(const e of s?.customEvents||[]){
     for(const [name,rounds] of [['SWISS',e.swissCompleted?.rounds||e.customSwiss?.rounds||[]],['KNOCKOUT',e.customKO?.rounds||[]]])for(const rd of rounds)for(let i=0;i<(rd.matches||[]).length;i++){
       const m=rd.matches[i];if(!m?.resultA||!m?.resultB)continue;
       if(m.resultA.track&&m.resultB.track&&String(m.resultA.track)!==String(m.resultB.track))continue;
       add(`${name}:${e.id}:${rd.id||rd.index||''}:${m.id||i}`,m.carA,m.carB,m.resultA.time,m.resultB.time,{event:eventName(e),kind:name,track:String(rd.trackName||rd.name||''),date:m.resultB.date||m.resultA.date||rd.completedAt||''});
     }
   }
   for(const r of s?.runs||[]){
     const grouped=r.format==='groups-total-time';
     const validGroups=grouped?new Map([...(r.v8Groups?.completedGroups||[]),r.v8Groups?.activeGroup].filter(Boolean).map(g=>[String(g.id),new Set((g.carIds||[]).map(String))])):null;
     // Group results carry v8GroupId: keep heats isolated even when their route
     // and round IDs coincide. Do not compare cars from different drawn groups.
     const races=new Map();
     for(const x of r.results||[]){if(!valid(x.time)||x.advancedTiming||!x.carId)continue;
       const round=String(x.roundId||''),route=String(x.roundName||x.track||'').trim();if(!round||!route)continue;
       if(grouped&&(!x.v8GroupId||!validGroups?.get(String(x.v8GroupId))?.has(String(x.carId))))continue;
       const key=JSON.stringify([grouped?String(x.v8GroupId):String(x.groupId||'main'),round,route.toLowerCase()]);
       if(!races.has(key))races.set(key,{name:route,byCar:new Map()});
       races.get(key).byCar.set(String(x.carId),x);
     }
     for(const [key,round] of races){const arr=[...round.byCar.values()];
       for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++)add(`festival:${r.id}:${key}:${pairKey(arr[i].carId,arr[j].carId)}`,arr[i].carId,arr[j].carId,arr[i].time,arr[j].time,{event:eventName(r),eventId:String(r.id),groupId:JSON.parse(key)[0],kind:'FESTIVAL',track:round.name,date:arr[j].date||arr[i].date||r.completedAt||''});
     }
   }
   return all;
 }
 // One rivalry meeting is ONE competition encounter, NOT one route within a
 // championship. Two cars sharing two or more Festival races in the same group
 // count once, with cumulative comparable timing deciding the head-to-head win.
 // Knockout/Swiss pairings each count once because each match is one encounter.
 function rivalryMeetings(s){
   const combined=new Map(),out=[];
   for(const m of encounters(s)){
     if(m.kind!=='FESTIVAL'){out.push(m);continue;}
     const [a,b]=m.key.split('¦');
     const id=JSON.stringify([m.eventId,m.groupId,m.key]);
     if(!combined.has(id))combined.set(id,{id,key:m.key,a,b,event:m.event,kind:'FESTIVAL',date:m.date||'',totalA:0,totalB:0,races:0,tracks:new Set()});
     const g=combined.get(id);
     g.totalA+=m.a===g.a?m.timeA:m.timeB;
     g.totalB+=m.a===g.b?m.timeA:m.timeB;
     g.races++;
     if(m.track)g.tracks.add(m.track);
     if((Date.parse(m.date)||0)>(Date.parse(g.date)||0))g.date=m.date;
   }
   for(const g of combined.values())out.push({
     id:g.id,key:g.key,a:g.a,b:g.b,kind:g.kind,event:g.event,date:g.date,
     races:g.races,track:g.races===1?([...g.tracks][0]||'1 timed race'):`${g.races} shared timed races · one competition`,
     winner:g.totalA===g.totalB?'':g.totalA<g.totalB?g.a:g.b,
     loser:g.totalA===g.totalB?'':g.totalA>g.totalB?g.a:g.b,
     gap:Math.abs(g.totalA-g.totalB)/1000
   });
   return out;
 }
 function rivals(s){const by=new Map();for(const m of rivalryMeetings(s)){
   let r=by.get(m.key);if(!r){const [a,b]=m.key.split('¦');r={a,b,key:m.key,meetings:0,aWins:0,bWins:0,ties:0,closest:Infinity,history:[]};by.set(m.key,r)}
   r.meetings++;if(m.winner===r.a)r.aWins++;else if(m.winner===r.b)r.bWins++;else r.ties++;
   r.closest=Math.min(r.closest,m.gap);r.history.push(m);
 }
   return [...by.values()].filter(x=>x.meetings>=2).sort((a,b)=>b.meetings-a.meetings||Math.abs(a.aWins-a.bWins)-Math.abs(b.aWins-b.bWins)||a.closest-b.closest||cmp(a.key,b.key)).slice(0,5);
 }
 function dynasties(kind,s){if(String(s?.catalogueKey)!=='fh5-catalogue-v1')return[];
   const q=window.rhEvilR1MedalQA8111;if(!q||typeof q.standings!=='function')return[];
   try{return q.standings(kind).slice(0,5).map(x=>({name:String(x.name),key:String(x.key),gold:Number(x.gold)||0,silver:Number(x.silver)||0,bronze:Number(x.bronze)||0,total:Number(x.total)||0,history:x.history||[],dynasty:(Number(x.gold)||0)>=3}));}catch(_){return[]}
 }
 // A proper timed, multi-round Festival: all the SAME entrants have valid results
 // from the opening round to the completed final. Final time is cumulative.
 function festivalComebacks(s){const out=[];
   for(const r of s?.runs||[]){if(r.status!=='complete'||r.format==='groups-total-time'||r.v8Groups)continue;
     const ids=[...new Set((r.entries||[]).map(String))],rounds=r.rounds||[];
     if(ids.length<2||rounds.length<2||!rounds.every(rd=>rd.id))continue;
     const data=new Map(ids.map(id=>[id,new Map()])),roundIds=rounds.map(rd=>String(rd.id));
     for(const x of r.results||[]){const id=String(x.carId),rd=String(x.roundId);if(!data.has(id)||!roundIds.includes(rd)||!valid(x.time)||x.advancedTiming)continue;
       // Re-entry or corrections must not silently count twice.
       data.get(id).set(rd,Number(x.time));
     }
     if([...data.values()].some(x=>x.size!==rounds.length))continue;
     const firstId=roundIds[0],first=[...data].map(([id,t])=>({id,time:t.get(firstId)})).sort((a,b)=>a.time-b.time||cmp(a.id,b.id));
     const finals=[...data].map(([id,t])=>({id,time:[...t.values()].reduce((a,b)=>a+b,0)})).sort((a,b)=>a.time-b.time||cmp(a.id,b.id));
     for(const last of finals){const id=last.id,opening=first.find(x=>x.id===id);
       const firstRank=1+first.filter(x=>ms(x.time)<ms(opening.time)).length;
       const finalRank=1+finals.filter(x=>ms(x.time)<ms(last.time)).length;
       const gain=firstRank-finalRank;
       if(gain<=0)continue;
       out.push({id,event:eventName(r),kind:'FESTIVAL',firstRank,finalRank,gain,rounds:rounds.length,date:r.completedAt||'',title:rounds[0]?.name||'FIRST ROUND',total:last.time});
     }
   }
   return out.sort((a,b)=>b.gain-a.gain||a.finalRank-b.finalRank||cmp(a.event,b.event)).slice(0,5);
 }
 // Rebuild Swiss standings after round one and after its final qualifying round
 // using the Swiss engine's actual tie hierarchy: wins, opponent wins, total time.
 // Do not treat the subsequent knockout as part of Swiss standings.
 function swissSnapshot(ids,rounds){const by=new Map(ids.map(id=>[String(id),{id:String(id),wins:0,opps:[],oppWins:0,time:0}]));
   for(const rd of rounds)for(const m of rd.matches||[]){
     const a=by.get(String(m.carA)),b=by.get(String(m.carB));if(!a||!b||!valid(m.resultA?.time)||!valid(m.resultB?.time)||!m.winnerId)return null;
     a.time+=Number(m.resultA.time);b.time+=Number(m.resultB.time);a.opps.push(b.id);b.opps.push(a.id);
     if(by.has(String(m.winnerId)))by.get(String(m.winnerId)).wins++;else return null;
   }
   for(const rd of rounds){if(rd.byeId){if(!by.has(String(rd.byeId)))return null;by.get(String(rd.byeId)).wins++;}}
   for(const x of by.values())x.oppWins=x.opps.reduce((n,id)=>n+(by.get(id)?.wins||0),0);
   return [...by.values()].sort((a,b)=>b.wins-a.wins||b.oppWins-a.oppWins||a.time-b.time||cmp(a.id,b.id));
 }
 function swissComebacks(s){const out=[];
   for(const e of s?.customEvents||[]){const swiss=e.swissCompleted?.rounds||e.customSwiss?.rounds||[],need=Number(e.customSwiss?.roundCount||swiss.length),ids=(e.swissCompleted?.standings||e.frozenCarIds||[]).map(v=>String(v?.id??v));
     if(!ids.length||ids.length<2||swiss.length<2||need!==swiss.length||swiss.some(r=>r.status!=='complete'))continue;
     const first=swissSnapshot(ids,[swiss[0]]),end=swissSnapshot(ids,swiss);if(!first||!end)continue;
     const ahead=(a,b)=>a.wins>b.wins||(a.wins===b.wins&&(a.oppWins>b.oppWins||(a.oppWins===b.oppWins&&ms(a.time)<ms(b.time))));
     for(const last of end){const opening=first.find(x=>x.id===last.id);
       const firstRank=1+first.filter(x=>ahead(x,opening)).length;
       const finalRank=1+end.filter(x=>ahead(x,last)).length;
       const gain=firstRank-finalRank;
       if(gain<=0)continue;
       out.push({id:last.id,event:eventName(e),kind:'SWISS',firstRank,finalRank,gain,rounds:swiss.length,date:swiss.at(-1)?.completedAt||e.completedAt||'',title:'SWISS ROUND 1',wins:last.wins});
     }
   }
   return out.sort((a,b)=>b.gain-a.gain||a.finalRank-b.finalRank||cmp(a.event,b.event)).slice(0,5);
 }
 function careerRows(s,by){
   // Reuse the tested Garage Intelligence collector. Counts are actual timed
   // results from the ACTIVE Space, not made-up in-game mileage or wins.
   const fn=window.otgGarageIntelQA8122?.analyse;
   if(typeof fn!=='function')return[];
   return fn(s).filter(x=>x.starts>0).sort((a,b)=>by==='routes'
     ?b.tracks.size-a.tracks.size||b.starts-a.starts||cmp(a.name,b.name)
     :b.starts-a.starts||b.tracks.size-a.tracks.size||cmp(a.name,b.name)).slice(0,5);
 }
 function groups(s){return[
   {group:'CAR CAREERS',key:'mostRaced',icon:'🛞',title:'MOST RACED CARS',detail:'Most official timed result entries in this Space',rows:careerRows(s,'starts')},
   {group:'CAR CAREERS',key:'mostRoutes',icon:'🗺️',title:'MOST WELL-TRAVELLED CARS',detail:'Most different recorded routes and layouts · current Space',rows:careerRows(s,'routes')},
   {group:'ARCH-RIVALS',key:'rivals',icon:'⚔️',title:'MOST FREQUENT RIVALRY',detail:'Same race or knockout pairing · at least 2 meetings',rows:rivals(s)},
   {group:'DYNASTIES',key:'carDynasties',icon:'🏎️',title:'CAR DYNASTIES',detail:'Evil R1 individual-car medals · 3 golds creates a dynasty',rows:dynasties('cars',s)},
   {group:'DYNASTIES',key:'makeDynasties',icon:'🏭',title:'MANUFACTURER DYNASTIES',detail:'Eligible Evil R1 make medals · 3 golds creates a dynasty',rows:dynasties('manufacturers',s)},
   {group:'GREATEST COMEBACKS',key:'festivalComebacks',icon:'🏆',title:'FESTIVAL — COMEBACKS',detail:'From first-race position to completed cumulative standings',rows:festivalComebacks(s)},
   {group:'GREATEST COMEBACKS',key:'swissComebacks',icon:'🇨🇭',title:'SWISS — COMEBACKS',detail:'From Swiss round-one standings to final Swiss ranking',rows:swissComebacks(s)},
 ];}
 function backToStats(){
   if(typeof window.rhRenderStats==='function')window.rhRenderStats();
   const host=$('more');if(host)host.scrollTop=0;
   window.scrollTo(0,0);
 }
 window.rhLegendsBack8119=backToStats;
 function render(){const host=$('more');if(!host)return;const s=current(),cars=carMap(s),cats=groups(s);
   function leader(c,r){if(!r)return '<span class="otgLegendPending8118">AWAITING FIRST RECORD</span>';
     if(c.key==='rivals')return `<span class="otgLegendTop8118"><b>${r.meetings} MEETINGS</b><span>${E(label(r.a,cars))} <i>vs</i> ${E(label(r.b,cars))}</span></span>`;
     if(c.key==='mostRaced'||c.key==='mostRoutes')return `<span class="otgLegendTop8118"><b>${c.key==='mostRoutes'?r.tracks.size+' ROUTES':r.starts+' TIMED RESULTS'}</b><span>${E(r.name)}</span></span>`;
     if(c.key.includes('Dynasties'))return `<span class="otgLegendTop8118"><b>${r.dynasty?'DYNASTY':'CONTENDER'} · ${r.gold} 🥇</b><span>${E(r.name)}</span></span>`;
     return `<span class="otgLegendTop8118"><b>+${r.gain} PLACES</b><span>${E(label(r.id,cars))} · ${E(r.event)}</span></span>`;
   }
   function row(c,r,i){let detail='';
     if(c.key==='rivals')detail=`<h3>${E(label(r.a,cars))} <span>vs</span> ${E(label(r.b,cars))}</h3><p>${r.meetings} meetings · ${r.aWins}–${r.bWins} wins${r.ties?' · '+r.ties+' tied':''} · closest ${gapFmt(r.closest)}</p><div class="otgLegendHistory8118">${r.history.slice().sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0)).slice(0,5).map(m=>`<div><small>${E(m.kind)} · ${E(m.event)}${m.track?' · '+E(m.track):''}</small><b>${gapFmt(m.gap)}</b></div>`).join('')}</div>`;
     else if(c.key.includes('Dynasties'))detail=`<h3>${E(r.name)}</h3><p><strong>${r.gold} 🥇</strong> · ${r.silver} 🥈 · ${r.bronze} 🥉 · ${r.total} total medals</p><p class="otgLegendState8118">${r.dynasty?'🏆 DYNASTY ESTABLISHED':'Building a dynasty · '+r.gold+' / 3 gold medals'}</p>`;
     else if(c.key==='mostRaced'||c.key==='mostRoutes')detail=`<h3>${E(r.name)}</h3><p>${r.starts} recorded timed results · ${r.tracks.size} distinct route/layout combinations · ${r.events.size} competitions</p><p class="otgLegendState8118">Racing history only — mileage and in-game driving outside OTG! are not claimed.</p>`;
     else detail=`<h3>${E(label(r.id,cars))}</h3><p>${E(r.event)} · ${E(r.kind)}</p><p>After round one: <b>${r.firstRank}${ordinal(r.firstRank)}</b> → Final: <b>${r.finalRank}${ordinal(r.finalRank)}</b> · <strong>+${r.gain} positions</strong></p><small>${r.rounds} rounds · ${E(dateLabel(r.date))}</small>`;
     return `<article class="otgLegendRank8118"><header><b>#${i+1}</b><strong>${c.key==='rivals'?r.meetings+' MEETINGS':c.key.includes('Dynasties')?r.gold+' 🥇':c.key==='mostRaced'?r.starts+' RESULTS':c.key==='mostRoutes'?r.tracks.size+' ROUTES':`+${r.gain} PLACES`}</strong></header>${detail}</article>`;
   }
   function ordinal(n){return n%100>=11&&n%100<=13?'th':n%10===1?'st':n%10===2?'nd':n%10===3?'rd':'th'}
   function card(c){const r=c.rows[0];return `<details class="otgLegendFold8118"><summary><span class="otgLegendIcon8118" aria-hidden="true">${c.icon}</span><span class="otgLegendMeta8118"><strong>${E(c.title)}</strong><small>${E(c.detail)}</small>${leader(c,r)}</span><span class="otgLegendAction8118">${r?'TOP '+c.rows.length:'OPEN'} ⌄</span></summary><div class="otgLegendBody8118">${r?c.rows.map((x,i)=>row(c,x,i)).join(''):'<p>No qualifying record yet. This category fills itself as you race — no extra data entry required.</p>'}</div></details>`}
   const sectionNames=['ARCH-RIVALS','DYNASTIES','CAR CAREERS','GREATEST COMEBACKS'];
   host.innerHTML=`<main class="otgLegends8118"><header class="otgLegendsHero8118"><button type="button" onclick="rhLegendsBack8119()">‹ BACK TO STATS</button><small>MY OTG! · CAREER RECORDS</small><h1>RACING LEGENDS</h1><p>Rivalries. Reign of champions. Against-the-odds comebacks.</p></header><div class="otgLegendsIntro8118">Top record visible in each category. Tap to see the Top 5. All rankings are calculated from your saved results; no history is overwritten.</div><section class="otgChronLegendsLink8126"><div><small>THE CAREER HISTORY BOOK</small><h2>HISTORIC MOMENTS</h2><p>Read the stories behind real rivalries, closest races, first titles, comebacks and the Evil Tournament landmarks. Every entry shows its evidence.</p></div><button type="button" onclick="rhOpenHistoricMoments8126('legends')">🏛️ OPEN THE ARCHIVE ›</button></section>${sectionNames.map(x=>`<section class="otgLegendsGroup8118"><h2>${x}</h2>${cats.filter(c=>c.group===x).map(card).join('')}</section>`).join('')}<p class="otgLegendsFooter8118">ⓘ Dynasties use existing Evil R1 Olympic medal rules; a car or make needs three golds for dynasty status. Manufacturer medals exclude Drift and single-manufacturer competitions. Rival meetings count once per Festival competition/group; comparable timed routes are combined for that meeting. Race Off and Swiss matches count separately. Comebacks require complete, comparable standings; grouped Festival championships are excluded. Swiss comebacks compare qualifying-stage ranks, not the subsequent knockout. All data belongs to the current Space.</p><div class="otgLegendsBottom8119"><button type="button" onclick="rhLegendsBack8119()" aria-label="Back to Stats">‹ BACK TO STATS</button></div></main>`;
   host.scrollTop=0;window.scrollTo(0,0);
 }
 window.rhOpenRacingLegends8118=render;
 function inject(){const host=$('more');if(!host||host.querySelector('#otgLegendsTile8118')||!host.querySelector('.v7StatsScene'))return;
   const tile=document.createElement('button');tile.id='otgLegendsTile8118';tile.type='button';tile.className='otgLegendsTile8118';tile.innerHTML='<span aria-hidden="true">⚔️</span><div><b>RACING LEGENDS</b><small>Arch-Rivals · Dynasties · Greatest Comebacks</small><em>EXPLORE YOUR CAREER ›</em></div><i aria-hidden="true">›</i>';tile.addEventListener('click',render);
   const anchor=host.querySelector('.v7StatsCards')||host.querySelector('.v7StatsScene');anchor?.insertAdjacentElement('afterend',tile);
 }
 const baseStats=window.rhRenderStats;if(typeof baseStats==='function')window.rhRenderStats=function(...args){const value=baseStats.apply(this,args);inject();return value};
 const baseMore=window.rhRenderMore;if(typeof baseMore==='function')window.rhRenderMore=function(...args){const value=baseMore.apply(this,args);if(window.rhMoreMode!=='settings')inject();return value};
 window.otgLegendsQA8118={encounters,rivalryMeetings,rivals,dynasties,festivalComebacks,swissSnapshot,swissComebacks,groups};
})();
