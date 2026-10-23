/* OTG! v8.0.122 — GARAGE INTELLIGENCE (first-pass QA)
   Purely read-only, active-Space-only; zero changes to saved racing records,
   Garage ownership, campaign slots, medal data, or backup formats.
*/
(()=>{
 'use strict';
 const byId=id=>document.getElementById(id);
 const html=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const space=()=>typeof window.rhSpace==='function'?window.rhSpace():null;
 const dayMs=86400000;
 const timestamp=v=>{const t=Date.parse(v||'');return Number.isFinite(t)&&t>0?t:0};
 const date=v=>v?new Date(v).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'No recorded date';
 const label=c=>[c?.make,c?.model,c?.year].filter(Boolean).join(' ').trim()||String(c?.name||'Unnamed car');
 const carKey=v=>String(v?.sourceCarId||v?.id||v||'');
 const msTime=t=>Math.round(Number(t)*1000);
 const timed=t=>t!==null&&t!==undefined&&t!==''&&Number.isFinite(Number(t))&&Number(t)>0;
 const timeText=t=>{const n=msTime(t),m=Math.floor(n/60000),s=Math.floor(n%60000/1000),ms=n%1000;return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`};
 const root=()=>byId('garage');
 let panel='',filters={search:'',make:'',kind:'',era:'',history:'all',idle:90},pair={left:'',right:''},randomPick='';
 function analyse(s){
   const cars=(s?.cars||[]).filter(c=>c&&c.id),by=new Map(cars.map(c=>[String(c.id),{id:String(c.id),car:c,name:label(c),starts:0,last:0,dated:0,undated:0,tracks:new Map(),events:new Set(),results:0}]));
   const seen=new Set();
   function add(res,eventId,kind,round,who,extra){
     if(!res||res.advancedTiming||!timed(res.time))return;
     const id=carKey(who||res.carId||res.car),info=by.get(id);
     if(!info)return;
     // The same result must never count twice, even if it carries a record flag.
     const key=res.id?`id:${res.id}`:`${kind}:${eventId}:${round?.id||''}:${extra||''}:${id}:${res.date||''}:${res.time}`;
     if(seen.has(key))return;seen.add(key);
     info.starts++;info.results++;
     const at=timestamp(res.date||res.savedAt||res.recordedAt||res.createdAt);
     if(at){info.dated++;info.last=Math.max(info.last,at);}else info.undated++;
     if(eventId)info.events.add(`${kind}:${eventId}`);
     const route=String(res.track||res.roundName||round?.name||round?.trackName||'').trim();
     const layout=String(res.layout||round?.layout||'').trim();
     if(route){const k=(route+'\u241e'+layout).toLocaleLowerCase('en');const old=info.tracks.get(k);
       if(!old||msTime(res.time)<msTime(old.best))info.tracks.set(k,{track:route,layout,best:Number(res.time)});
     }
   }
   for(const r of s?.runs||[]){const rounds=new Map((r.rounds||[]).map(x=>[String(x.id),x]));for(const v of r.results||[])add(v,r.id,'festival',rounds.get(String(v.roundId)),v.carId);}
   for(const r of s?.customEvents||[]){const rounds=new Map((r.frozenRounds?.length?r.frozenRounds:r.rounds||[]).map(x=>[String(x.id),x]));
     for(const v of r.results||[])add(v,r.id,'custom',rounds.get(String(v.roundId)),v.carId);
     // Native Swiss/knockout head-to-head results live in separate nested rounds.
     for(const [kind,roundsList] of [['swiss',r.swissCompleted?.rounds||r.customSwiss?.rounds||[]],['knockout',r.customKO?.rounds||[]]])
       for(const rd of roundsList)for(const m of rd.matches||[]){add(m.resultA,r.id,kind,rd,m.carA,m.id+':A');add(m.resultB,r.id,kind,rd,m.carB,m.id+':B');}
   }
   for(const r of s?.raceOffs||[])for(const rd of r.rounds||[])for(const m of rd.matches||[]){add(m.resultA,r.id,'raceoff',rd,m.carA,m.id+':A');add(m.resultB,r.id,'raceoff',rd,m.carB,m.id+':B');}
   return [...by.values()].sort((a,b)=>a.name.localeCompare(b.name,'en'));
 }
 const options=(vals,prompt,current)=>`<option value="">${html(prompt)}</option>`+vals.map(v=>`<option value="${html(v)}" ${v===current?'selected':''}>${html(v)}</option>`).join('');
 const year=c=>Number(c.year)||0;
 const era=c=>{const y=year(c);return y>=1900&&y<2100?`${Math.floor(y/10)*10}s`:''};
 const statsLine=o=>`${o.starts} TIMED RESULT${o.starts===1?'':'S'} · ${o.tracks.size} ROUTE${o.tracks.size===1?'':'S'} · ${o.starts?(o.last?'LAST '+date(o.last):'DATE UNKNOWN'):'NO RECORDED RACES'}`;
 function head(title,subtitle){return `<div class="otgIntelHead8122"><button type="button" class="rhBack" onclick="rhIntelBack8122()" aria-label="Back to Garage">‹</button><div><small>GARAGE INTELLIGENCE</small><h1>${title}</h1><p>${subtitle}</p></div></div>`}
 function notice(){return `<p class="otgIntelNotice8122">ⓘ Reads existing timed results in this Space only. No races, ownership, championship results or Evil Campaign slots are changed. No inferred performance ratings.</p>`}
 function cards(rows,limit=35){return rows.length?rows.slice(0,limit).map(o=>`<div class="otgIntelCar8122"><b>${html(o.name)}</b><span>${html(statsLine(o))}</span><small>${html(o.car.classType||'CLASS NOT SET')}</small></div>`).join(''):`<p class="otgIntelEmpty8122">No matching cars. Try another filter.</p>`}
 function hero(info){return `<div class="otgIntelHero8122"><b>${info.cars} OWNED CARS</b><span>${info.raced} WITH TIMED RESULTS · ${info.unraced} WITHOUT</span></div>`}
 function info(s){const rows=analyse(s);return{rows,cars:rows.length,raced:rows.filter(o=>o.starts>0).length,unraced:rows.filter(o=>!o.starts).length};}
 function shell(title,sub,content){const host=root();if(!host)return;host.innerHTML=`<div class="otgIntel8122">${head(title,sub)}<main class="otgIntelBody8122">${content}${notice()}</main></div>`;host.scrollTop=0;window.scrollTo(0,0);}
 function forgotten(){const a=info(space()),now=Date.now(),stale=a.rows.filter(o=>o.starts>0&&o.last&&now-o.last>=filters.idle*dayMs).sort((x,y)=>x.last-y.last||x.name.localeCompare(y.name)),never=a.rows.filter(o=>!o.starts);
   const undated=a.rows.filter(o=>o.starts>0&&!o.last);
   shell('FORGOTTEN CARS','The cars gathering dust while others hog the spotlight.',`${hero(a)}<div class="otgIntelControls8122"><label>Forgotten for at least <select id="rhIntelIdle8122" onchange="rhIntelSetIdle8122(this.value)">${[30,60,90,180].map(n=>`<option value="${n}" ${n===filters.idle?'selected':''}>${n} days</option>`).join('')}</select></label></div><div class="otgIntelGroup8122"><h2>NEVER RECORDED <small>${never.length}</small></h2><p>No saved timed races in this Space. This doesn't prove you've never driven these cars in-game.</p>${cards(never,30)}${never.length>30?`<p class="otgIntelMore8122">Showing 30 of ${never.length}. Use SMART CAR FINDER to search the rest.</p>`:''}</div><div class="otgIntelGroup8122"><h2>GATHERING DUST <small>${stale.length}</small></h2><p>Previously raced, but nothing dated in the past ${filters.idle} days.</p>${cards(stale,30)}${stale.length>30?`<p class="otgIntelMore8122">Showing 30 of ${stale.length}.</p>`:''}</div>${undated.length?`<div class="otgIntelGroup8122"><h2>DATE UNKNOWN <small>${undated.length}</small></h2><p>Recorded timed results exist, but none has a usable date.</p>${cards(undated,20)}</div>`:''}`);
 }
 function filtered(a){const q=filters.search.toLocaleLowerCase('en').trim(),idle=Number(filters.idle)||90,now=Date.now();return a.filter(o=>{
   if(q&&!`${o.name} ${o.car.classType||''}`.toLocaleLowerCase('en').includes(q))return false;
   if(filters.make&&String(o.car.make)!==filters.make)return false;
   if(filters.kind&&String(o.car.classType||'')!==filters.kind)return false;
   if(filters.era&&era(o.car)!==filters.era)return false;
   if(filters.history==='unraced'&&o.starts)return false;
   if(filters.history==='raced'&&!o.starts)return false;
   if(filters.history==='dormant'&&(!o.starts||!o.last||now-o.last<idle*dayMs))return false;
   return true;});}
 function finder(){const a=info(space()),rows=filtered(a.rows),makes=[...new Set(a.rows.map(o=>String(o.car.make||'')).filter(Boolean))].sort(),kinds=[...new Set(a.rows.map(o=>String(o.car.classType||'')).filter(Boolean))].sort(),eras=[...new Set(a.rows.map(o=>era(o.car)).filter(Boolean))].sort();
   const currentPick=rows.find(o=>o.id===randomPick);shell('SMART CAR FINDER','Make the Garage choose your next victim.',`${hero(a)}<div class="otgIntelControls8122"><label>Search <input id="rhIntelSearch8122" type="search" value="${html(filters.search)}" placeholder="Make, model, class or year" oninput="rhIntelFilter8122('search',this.value)"></label><label>Manufacturer<select onchange="rhIntelFilter8122('make',this.value)">${options(makes,'Any manufacturer',filters.make)}</select></label><label>Class / Type<select onchange="rhIntelFilter8122('kind',this.value)">${options(kinds,'Any class',filters.kind)}</select></label><label>Decade<select onchange="rhIntelFilter8122('era',this.value)">${options(eras,'Any decade',filters.era)}</select></label><label>Racing activity<select onchange="rhIntelFilter8122('history',this.value)">${[['all','All cars'],['unraced','No recorded timed races'],['raced','Has raced'],['dormant',`Not raced for ${filters.idle}+ days`]].map(([v,t])=>`<option value="${v}" ${v===filters.history?'selected':''}>${html(t)}</option>`).join('')}</select></label><button class="otgIntelRandom8122" type="button" onclick="rhIntelRandom8122()">🎲 PICK ONE RANDOMLY</button><button class="otgIntelClear8122" type="button" onclick="rhIntelClear8122()">CLEAR FILTERS</button></div>${currentPick?`<div class="otgIntelWinner8122"><small>🎲 YOUR RANDOM DRIVE</small><b>${html(currentPick.name)}</b><span>${html(statsLine(currentPick))}</span></div>`:''}<div class="otgIntelGroup8122"><h2>MATCHING CARS <small>${rows.length}</small></h2>${cards(rows,50)}${rows.length>50?`<p class="otgIntelMore8122">Showing 50 of ${rows.length}. Narrow your filters to see the others.</p>`:''}</div>`);
 }
 function compare(){const a=info(space());if(a.rows.length<2){shell('CAR COMPARISON','Same Space, real racing data.',`${hero(a)}<p class="otgIntelEmpty8122">Add at least two cars before comparing.</p>`);return;}
   const fastest=a.rows.slice().sort((x,y)=>y.starts-x.starts||x.name.localeCompare(y.name));
   if(!a.rows.some(x=>x.id===pair.left))pair.left=fastest[0].id;
   if(!a.rows.some(x=>x.id===pair.right)||pair.left===pair.right)pair.right=fastest.find(x=>x.id!==pair.left)?.id||'';
   const left=a.rows.find(x=>x.id===pair.left),right=a.rows.find(x=>x.id===pair.right);
   const opt=who=>a.rows.map(o=>`<option value="${html(o.id)}" ${o.id===who?'selected':''}>${html(o.name)}</option>`).join('');
   const common=left&&right&&left.id!==right.id?[...left.tracks.keys()].filter(k=>right.tracks.has(k)).map(k=>{const x=left.tracks.get(k),y=right.tracks.get(k);return{track:x.track,layout:x.layout,l:x.best,r:y.best,diff:Math.abs(msTime(x.best)-msTime(y.best))/1000}}).sort((x,y)=>x.track.localeCompare(y.track)):[];
   const panel=(o,n)=>`<div class="otgIntelCompareCar8122"><small>CAR ${n}</small><b>${html(o?.name||'')}</b><strong>${o?.starts||0}</strong><span>TIMED RESULTS</span><strong>${o?.tracks.size||0}</strong><span>ROUTES RECORDED</span><span>${o?.last?'LAST '+html(date(o.last)):'NO DATED RESULTS'}</span></div>`;
   shell('CAR COMPARISON','Real results. Same track or no fantasy winner.',`${hero(a)}<div class="otgIntelControls8122 otgIntelCompareSelect8122"><label>Car A<select onchange="rhIntelPair8122('left',this.value)">${opt(pair.left)}</select></label><label>Car B<select onchange="rhIntelPair8122('right',this.value)">${opt(pair.right)}</select></label></div><div class="otgIntelSideBySide8122">${panel(left,'A')}${panel(right,'B')}</div>${left?.id===right?.id?'<p class="otgIntelEmpty8122">Choose two different cars.</p>':`<div class="otgIntelGroup8122"><h2>SHARED ROUTE PERSONAL BESTS <small>${common.length}</small></h2><p>Only the same named route and layout are compared. These are recorded PBs, not performance ratings; car tuning and race conditions may differ.</p>${common.length?common.slice(0,30).map(t=>`<div class="otgIntelTrack8122"><b>${html(t.track)}${t.layout?' • '+html(t.layout):''}</b><span>CAR A <strong>${timeText(t.l)}</strong> &nbsp; CAR B <strong>${timeText(t.r)}</strong></span><small>${t.l===t.r?'TIE':`FASTER PB: CAR ${t.l<t.r?'A':'B'}`} · ${t.diff.toFixed(3)}s GAP</small></div>`).join(''):'<p class="otgIntelEmpty8122">No identical routes with timed results for both cars yet. We will not compare completely different tracks!</p>'}</div>`}`);
 }
 function render(){if(panel==='forgotten')forgotten();else if(panel==='finder')finder();else if(panel==='compare')compare();}
 function insertTiles(){const host=root();if(!host||host.querySelector('#otgIntelTileSet8122'))return;const body=host.querySelector('.rhGarageBodyV1')||host.querySelector('.rhGarageV1')||host;
   const el=document.createElement('section');el.id='otgIntelTileSet8122';el.className='otgIntelTiles8122';el.innerHTML=`<h2>GARAGE INTELLIGENCE</h2><p>Your cars. Your racing history. Three new ways to cause trouble.</p><div class="otgIntelTileGrid8122"><button type="button" onclick="rhIntelOpen8122('forgotten')"><i>🕸️</i><b>FORGOTTEN CARS</b><small>Who's been collecting dust?</small><em>VIEW ›</em></button><button type="button" onclick="rhIntelOpen8122('finder')"><i>🎲</i><b>SMART CAR FINDER</b><small>Filter and randomly pick.</small><em>FIND ›</em></button><button type="button" onclick="rhIntelOpen8122('compare')"><i>⚔️</i><b>CAR COMPARISON</b><small>Real results, shared routes.</small><em>COMPARE ›</em></button></div>`;
   const first=body.querySelector('.rhGarageSummaryV1');if(first)first.insertAdjacentElement('afterend',el);else body.prepend(el);
 }
 window.rhIntelOpen8122=kind=>{if(!['forgotten','finder','compare'].includes(kind))return;panel=kind;randomPick='';render()};
 window.rhIntelBack8122=()=>{panel='';window.rhShow?.('garage')};
 window.rhIntelSetIdle8122=n=>{filters.idle=[30,60,90,180].includes(Number(n))?Number(n):90;render()};
 window.rhIntelFilter8122=(key,val)=>{if(!(key in filters))return;filters[key]=String(val);randomPick='';render();if(key==='search'){const input=byId('rhIntelSearch8122');input?.focus();input?.setSelectionRange(filters.search.length,filters.search.length)}};
 window.rhIntelRandom8122=()=>{const rows=filtered(info(space()).rows);if(!rows.length)return;randomPick=rows[Math.floor(Math.random()*rows.length)].id;render()};
 window.rhIntelClear8122=()=>{filters={search:'',make:'',kind:'',era:'',history:'all',idle:90};randomPick='';render()};
 window.rhIntelPair8122=(side,value)=>{if(!['left','right'].includes(side))return;pair[side]=String(value);render()};
 const original=window.rhRenderGarage;
 if(typeof original==='function')window.rhRenderGarage=function(...args){panel='';const r=original.apply(this,args);insertTiles();return r;};
 window.otgGarageIntelQA8122={analyse,filtered:(s,f)=>{const old=filters;try{filters={...filters,...f};return filtered(analyse(s))}finally{filters=old}},label};
})();
