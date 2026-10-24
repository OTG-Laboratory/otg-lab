/* OTG! v8.0.103 — live LOCATION always bound to the currently active track.
   Track catalogue source remains the locked v8.0.70 taxonomy. Rally Adventure and Hot Wheels now use
   event-family colour cues plus broad map-position / biome guidance. No racing data or saved setup is changed. */
(()=>{
'use strict';
const VERSION='8.0.103',FH5_KEY='fh5-catalogue-v1';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v??'').trim();
const norm=v=>clean(v).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
const HINTS=window.OTG_LAB_VERIFIED_FH5_TRACK_HINTS_V10;
if(!HINTS||Object.keys(HINTS).length!==145)throw Error('OTG! LAB v0.10: no verified external location clues');
const ALIASES={"Estadio Cross Country Circuit":"Estadio Cross Country Circuit","Teotihuacán Drag Strip":"Teotihuacan Drag Strip","Aeródromo Drag Strip":"Aerodromo Drag Strip","Desafío":"Desafio","Senda De Montaña":"Senda De Montana","Cráteres Secos":"Crateres Secos","Valle De Pozas":"Valle De Pozas","Volcán Sprint":"Volcán Sprint","Cañón Run":"Cañón Run","Panorámica Sprint":"Panorámica Sprint","Tierra Próspera Circuit":"Tierra Próspera Circuit","Bajío Trail":"Bajío Trail","Montaña Trail":"Montaña Trail","El Pípila Scramble":"El Pípila Scramble","Teotihuacán Scramble":"Teotihuacán Scramble"};
function fh5(){try{return typeof rhSpace==='function'&&rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function tax(){return window.rhFH5TrackTaxonomy8070||window.rhFH5TrackTaxonomy8067||null}
function canonical(name){const t=tax();if(t?.canonical)return t.canonical(name);const a=ALIASES[clean(name)]||clean(name);return a}
function meta(name){const c=canonical(name),t=tax()?.track?.(c);if(!t)return null;return {...t,name:t.name||c,hint:HINTS[t.name]||HINTS[c]||'Use the event icon for this route on its game map.'}}
function mapCode(t){if(!t||t.world!=='Mexico')return'';if(t.discipline==='Road Racing')return'B';if(t.discipline==='Street Racing')return'P';if(t.discipline==='Dirt Racing')return'O';if(t.discipline==='Cross Country')return'G';return''}
function codeLabel(c){return {B:'BLUE • ROAD RACING',P:'PURPLE • STREET SCENE',G:'GREEN • CROSS COUNTRY',O:'ORANGE • DIRT RACING'}[c]||''}
const RALLY_APEX=new Set(["Devil's Pass",'El Bosque','Quarry Trail','Arzate Sprint','The Narrows','La Cantera','Canyon Trail','Senda De Montana']);
const RALLY_RAPTORS=new Set(['Cascada Fuerte','Three Hills','Lago Azulado','Desert Scramble','Meridian','Forest Trail','Rugged Dunes','Tres Colinas']);
const RALLY_GRIT=new Set(['Reserva Del Carrizo','Orogrande','Tierras Verdes','Joya Marron','Crateres Secos','Valle De Pozas','Palm Forest','Switchback Run']);
function tagMeta(t){
 const c=mapCode(t);if(c){const colour={B:'blue',P:'purple',G:'green',O:'orange'}[c]||'cyan';return {text:`${c} • ${codeLabel(c)}`,colour}}
 if(t?.world==='Sierra Nueva'){
  if(t.name==='Horizon Badlands Goliath')return {text:'RED • HORIZON BADLANDS GOLIATH • FINALE',colour:'red'};
  if(RALLY_APEX.has(t.name))return {text:'CYAN • APEX PREDATORS • ROAD RALLY',colour:'cyan'};
  if(RALLY_RAPTORS.has(t.name))return {text:'ORANGE • HORIZON RAPTORS • DIRT RALLY',colour:'orange'};
  if(RALLY_GRIT.has(t.name))return {text:'PURPLE • GRIT REAPERS • NIGHT RALLY',colour:'purple'};
  return {text:'RALLY ADVENTURE',colour:'cyan'};
 }
 if(t?.world==='Hot Wheels Park'){
  if(t.name==='Hot Wheels Goliath')return {text:'BLUE • SPEED RACING • GOLIATH',colour:'blue'};
  if(t.discipline==='Hazard Racing')return {text:'ORANGE • HAZARD RACING',colour:'orange'};
  if(t.discipline==='Speed Racing')return {text:'BLUE • SPEED RACING',colour:'blue'};
  return {text:'HOT WHEELS',colour:'blue'};
 }
 return {text:t?.discipline||'TRACK',colour:'cyan'};
}
function group(t){if(t.special)return'Finale / Special';if(t.finale)return'Finale / Special';if(t.discipline==='Road Racing')return'Road';if(t.discipline==='Street Racing')return'Street';if(t.discipline==='Dirt Racing')return'Dirt';if(t.discipline==='Cross Country')return'Cross Country';if(t.category==='RALLY')return'Rally Adventure';if(t.category==='HOT_WHEELS')return'Hot Wheels';if(t.category==='DRAG')return'Drag';return t.discipline||t.category||'Other'}
function groupOrder(g){return ['Road','Street','Dirt','Cross Country','Rally Adventure','Hot Wheels','Drag','Finale / Special'].indexOf(g)}
function all(){const arr=(tax()?.tracks||[]).filter(t=>clean(t.name)!=='Winter Wonderland Circuit').map(t=>{const m=meta(t.name)||t;return {...m,group:group(m),code:mapCode(m)}});return arr.sort((a,b)=>{const d=groupOrder(a.group)-groupOrder(b.group);return d||a.name.localeCompare(b.name,undefined,{sensitivity:'base'})})}
function usageSnapshot(){
 const s=(()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}})(),out=new Map(),seen=new Set();
 const bucket=name=>{const c=canonical(name),m=meta(c);if(!m||clean(c)==='Winter Wonderland Circuit')return null;if(!out.has(c))out.set(c,{track:c,total:0,festival:0,raceoff:0,custom:0,pickmydrive:0,lastStarted:''});return out.get(c)};
 const add=(name,source,token,date='')=>{const b=bucket(name);if(!b)return;const key=`${source}|${token}|${norm(b.track)}`;if(seen.has(key))return;seen.add(key);b.total++;b[source]=(b[source]||0)+1;if(date&&String(date)>String(b.lastStarted||''))b.lastStarted=date};
 const finiteResult=res=>res&&Number.isFinite(Number(res.time))&&Number(res.time)>0;
 if(!s)return {byTrack:out,total:0,usedTracks:0};
 /* Festival / Pick My Drive: a configured round counts only after at least one actual result exists for that round. */
 for(const r of s.runs||[]){
  if(!r)continue;const source=(r.pickMyDrive||r.value==='pick-my-drive')?'pickmydrive':'festival';
  for(const res of r.results||[]){
   if(!finiteResult(res))continue;const track=clean(res.roundName||res.track);if(!track)continue;
   const slot=clean(res.roundId)||`name:${norm(track)}`;add(track,source,`run:${r.id}|round:${slot}`,res.date||r.completedAt||r.startedAt||'');
  }
 }
 /* Race Off: one usage per tournament round, as soon as that round has actually produced a saved race result. */
 for(const ro of s.raceOffs||[]){
  if(!ro)continue;for(const rd of ro.rounds||[]){
   const hasResult=(rd.matches||[]).some(m=>finiteResult(m?.resultA)||finiteResult(m?.resultB)||((m?.attempts||[]).some(finiteResult)));
   if(!hasResult)continue;add(rd.name,'raceoff',`ro:${ro.id}|round:${rd.id||rd.number||norm(rd.name)}`,rd.completedAt||rd.startedAt||ro.updatedAt||'');
  }
 }
 /* Standard Custom Racing uses the same result-backed rule: no future/setup round is counted. */
 for(const e of s.customEvents||[]){
  if(!e)continue;for(const res of e.results||[]){
   if(!finiteResult(res))continue;const track=clean(res.roundName||res.track);if(!track)continue;
   const slot=clean(res.roundId)||`name:${norm(track)}`;add(track,'custom',`event:${e.id}|round:${slot}`,res.date||e.completedAt||e.startedAt||'');
  }
  /* Competition formats may keep result objects inside their round/match structures instead of e.results. */
  const nested=[...(e.customSwiss?.rounds||[]),...(e.swissCompleted?.rounds||[]),...(e.customKO?.rounds||[])];
  for(const rd of nested){
   const rows=[...(rd?.results||[]),...(rd?.matches||[]).flatMap(m=>[m?.resultA,m?.resultB,...(m?.attempts||[])])].filter(finiteResult);
   if(!rows.length)continue;add(rd.trackName||rd.name,'custom',`event:${e.id}|nested:${rd.id||rd.index||norm(rd.trackName||rd.name)}`,rd.completedAt||rd.startedAt||e.updatedAt||'');
  }
 }
 const values=[...out.values()];return {byTrack:out,total:values.reduce((n,x)=>n+x.total,0),usedTracks:values.filter(x=>x.total>0).length};
}
function usage(name,snap=usageSnapshot()){const c=canonical(name);return snap.byTrack.get(c)||{track:c,total:0,festival:0,raceoff:0,custom:0,pickmydrive:0,lastStarted:''}}
function usageText(u){const bits=[];if(u.festival)bits.push(`Festival ${u.festival}`);if(u.raceoff)bits.push(`Race Off ${u.raceoff}`);if(u.pickmydrive)bits.push(`Pick My Drive ${u.pickmydrive}`);if(u.custom)bits.push(`Custom ${u.custom}`);return bits.join(' • ')||'Not raced yet'}
function close(id){document.getElementById(id)?.remove()}
window.rhOpenTrackLocation8073=function(name){
 const t=meta(name);if(!t)return typeof toast==='function'?toast('Track location is not in the FH5 directory yet'):null;
 const u=usage(t.name),used=`USED ${u.total} TIME${u.total===1?'':'S'}`,detail=usageText(u);
 close('rhTrackLocation8073');const tag=tagMeta(t);
 document.body.insertAdjacentHTML('beforeend',`<div id="rhTrackLocation8073" class="rhTrackOverlay8073" onclick="if(event.target===this)this.remove()"><section class="rhTrackLocationCard8073" role="dialog" aria-modal="true"><button class="rhTrackClose8073" onclick="document.getElementById('rhTrackLocation8073').remove()" aria-label="Close">×</button><small>WHERE THE FUCK IS IT?</small><h2>${E(t.name)}</h2><div class="rhTrackTag8073" data-rh-track-colour="${E(tag.colour)}">${E(tag.text)}</div><div class="rhTrackUsageCard8073"><b>${E(used)}</b><span>${E(detail)}</span><small>Counts only track slots that have produced a saved race result in this FH5 Space. Future rounds, setup, previews and rerolls do not count.</small></div><p>${E(t.hint)}</p><em>${E(t.world||'Forza Horizon 5')}</em><button class="btn" onclick="document.getElementById('rhTrackLocation8073').remove()">GOT IT</button></section></div>`);
 };
function renderDirectory(){
 const root=document.getElementById('rhTrackDirectory8073');if(!root)return;const input=root.querySelector('#rhTrackSearch8073'),filter=root.dataset.filter||'ALL',q=norm(input?.value||''),snap=usageSnapshot();
 const rows=all().filter(t=>(filter==='ALL'||t.group===filter)&&(!q||norm(`${t.name} ${t.group} ${t.world} ${tagMeta(t).text} ${t.hint}`).includes(q)));
 const list=root.querySelector('.rhTrackDirectoryList8073');if(!list)return;list.innerHTML=rows.length?rows.map(t=>{const tag=tagMeta(t),sub=[tag.text,t.world].filter(Boolean).join(' • '),u=usage(t.name,snap),used=`USED ${u.total} TIME${u.total===1?'':'S'}`;return `<button class="rhTrackDirectoryRow8073" onclick="rhOpenTrackLocation8073(decodeURIComponent('${encodeURIComponent(t.name)}'))"><span><b>${E(t.name)}</b><small>${E(sub)}</small><strong class="rhTrackUsage8073">${E(used)}${u.total?` • ${E(usageText(u))}`:''}</strong><em>${E(t.hint)}</em></span><i>›</i></button>`}).join(''):`<div class="rhTrackDirectoryEmpty8073">No matching tracks.</div>`;
 const count=root.querySelector('#rhTrackCount8073');if(count)count.textContent=`${rows.length} TRACK${rows.length===1?'':'S'} • ${snap.total} USE${snap.total===1?'':'S'}`;
 root.querySelectorAll('.rhTrackFilter8073').forEach(b=>b.classList.toggle('active',(b.dataset.filter||'ALL')===filter));
}
window.rhTrackDirectoryFilter8073=function(filter){const root=document.getElementById('rhTrackDirectory8073');if(!root)return;root.dataset.filter=filter||'ALL';renderDirectory()};
window.rhOpenTrackDirectory8073=function(){
 close('rhTrackDirectory8073');const total=all().length,filters=['ALL','Road','Street','Dirt','Cross Country','Rally Adventure','Hot Wheels','Drag','Finale / Special'];
 document.body.insertAdjacentHTML('beforeend',`<div id="rhTrackDirectory8073" class="rhTrackDirectoryPage8073" data-filter="ALL"><button class="rhTrackDirectoryBack8073" onclick="document.getElementById('rhTrackDirectory8073').remove()">‹ BACK</button><header><div><small>FH5 • ${total} USABLE ROUTES</small><h1>TRACK DIRECTORY</h1><p>Search the route, get the location clue, and see how often this Space has actually raced it.</p></div></header><main><div class="rhTrackDirectorySearch8073"><input id="rhTrackSearch8073" autocomplete="off" placeholder="Search track, area or category…"><b id="rhTrackCount8073">${total} TRACKS</b></div><div class="rhTrackFilters8073">${filters.map(f=>`<button type="button" class="rhTrackFilter8073${f==='ALL'?' active':''}" data-filter="${E(f)}" onclick="rhTrackDirectoryFilter8073('${E(f)}')">${E(f)}</button>`).join('')}</div><div class="rhTrackLegend8073"><span><b>B</b> Road</span><span><b>P</b> Street</span><span><b>G</b> Cross Country</span><span><b>O</b> Dirt</span></div><div class="rhTrackDirectoryList8073"></div><p class="rhTrackSource8073">Usage is backfilled automatically from saved race results in the current Space. Future/generated rounds, setup, preview and rerolls do not count. Reset Racing Data clears it naturally. Winter Wonderland is deliberately excluded.</p></main></div>`);
 const root=document.getElementById('rhTrackDirectory8073');root.querySelector('#rhTrackSearch8073').addEventListener('input',renderDirectory);renderDirectory();window.scrollTo(0,0);
};
function recordsCard(){
 if(!fh5()||window.rhRecordsMode==='hall'||document.getElementById('rhTrackDirectoryCard8073'))return;const main=document.querySelector('#hall .v7Records main');if(!main)return;const hall=main.querySelector('.v7Hall');const b=document.createElement('button');b.id='rhTrackDirectoryCard8073';b.className='rhTrackDirectoryCard8073';b.innerHTML=`<span>⌖</span><div><b>TRACK DIRECTORY</b><small>Find all 145 usable FH5 routes and get a quick location clue.</small><em>FIND A TRACK ›</em></div><i>›</i>`;b.onclick=()=>window.rhOpenTrackDirectory8073();hall?hall.insertAdjacentElement('afterend',b):main.prepend(b);
}
function locButton(track,small=false){const t=meta(track);if(!t)return null;const b=document.createElement('button');b.type='button';b.className=`rhTrackLocationBtn8073${small?' small':''}`;b.innerHTML=`<span>⌖</span><b>LOCATION</b>`;b.onclick=e=>{e.preventDefault();e.stopPropagation();window.rhOpenTrackLocation8073(t.name)};return b}
function liveTrackRow(host,track){
 if(!host)return;
 const cont=host.querySelector('.rhChamp33Continue, .rhContinueV1');if(!cont)return;
 const t=meta(track);if(!t)return;
 let row=host.querySelector('.rhTrackLiveActions8073');
 if(!row){row=document.createElement('div');row.className='rhTrackLiveActions8073';cont.insertAdjacentElement('beforebegin',row);row.append(cont)}
 let b=row.querySelector('.rhTrackLocationBtn8073');
 if(!b){b=locButton(t.name);if(!b)return;row.appendChild(b)}
 // Critical: replace the prior race closure, rather than leaving Race 1 LOCATION on Race 2.
 b.dataset.rhActiveTrack8103=t.name;
 b.onclick=e=>{e.preventDefault();e.stopPropagation();window.rhOpenTrackLocation8073(b.dataset.rhActiveTrack8103)};
}
function decorateVisibleFestival(){
 if(!fh5())return;const host=document.querySelector('#festival .rhChamp33Current, #festival .rhCurrentCarV1');if(!host)return;
 const shown=clean(host.querySelector('.rhChamp33Meta span:first-child b, .rhCurrentCarMetaV1 div:first-child b')?.textContent);if(shown)liveTrackRow(host,shown);
}
function decorateLiveFestival(runId){
 if(!fh5())return;let r=null;try{r=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>String(x.id)===String(runId))}catch(_){}if(!r)return;
 let next=null;try{next=typeof rhNextSlot==='function'?rhNextSlot(r):null}catch(_){}
 if(r.v8Groups?.activeGroup){const grp=r.v8Groups.activeGroup,rr=(r.results||[]).filter(x=>String(x.v8GroupId||x.groupId||'')===String(grp.id||''));for(const cid of grp.carIds||[]){const rd=(r.rounds||[]).find(q=>!rr.some(x=>String(x.carId)===String(cid)&&String(x.roundId)===String(q.id)));if(rd){next={round:rd};break}}}
 const track=next?.round?.name;if(!track)return;const host=document.querySelector('#festival .rhChamp33Current, #festival .rhCurrentCarV1');liveTrackRow(host,track);
}
function decorateLiveRaceOff(id,i=0){
 if(!fh5())return;let ro=null;try{ro=(rhSpace()?.raceOffs||[]).find(x=>String(x.id)===String(id))}catch(_){}const rd=ro?.rounds?.[Number(i)||0];if(!rd)return;
 const hasPending=(rd.matches||[]).some(m=>m?.status!=='complete');if(!hasPending)return;
 const sections=[...document.querySelectorAll('#raceoff .rhFestivalBodyV1 .rhFestivalSectionV1')],host=sections.reverse().find(x=>[...x.querySelectorAll('button')].some(b=>/^CONTINUE/i.test(clean(b.textContent))));if(!host)return;
 const cont=[...host.querySelectorAll('button')].find(b=>/^CONTINUE/i.test(clean(b.textContent)));if(!cont)return;const b=locButton(rd.name);if(!b)return;const old=host.querySelector('.rhTrackLiveActions8073');if(old)old.remove();
 const row=document.createElement('div');row.className='rhTrackLiveActions8073 rhTrackLiveActionsRaceOff8073';cont.insertAdjacentElement('beforebegin',row);row.append(cont,b);
}
/* LOCATION is also available on Race Off's actual ENTER RESULT screen, not only the round overview. */
function decorateRaceOffEntry(id,i=0){
 if(!fh5())return;
 let ro=[];try{ro=rhSpace()?.raceOffs||[]}catch(_){}const event=ro.find(x=>String(x.id)===String(id));
 const track=event?.rounds?.[Number(i)||0]?.name,t=meta(track),host=document.querySelector('#raceoff .rh5801Entry .rh5801Context');
 if(!t||!host)return;
 let b=host.querySelector('.rhRaceOffEntryLocation8103');
 if(!b){b=locButton(t.name);if(!b)return;b.classList.add('rhRaceOffEntryLocation8103');host.appendChild(b)}
 b.dataset.rhActiveTrack8103=t.name;
 b.onclick=e=>{e.preventDefault();e.stopPropagation();window.rhOpenTrackLocation8073(b.dataset.rhActiveTrack8103)};
}
const baseRaceOffEnterNext8103=window.rhRaceOffEnterNext;
if(typeof baseRaceOffEnterNext8103==='function')window.rhRaceOffEnterNext=function(id,i=0){const out=baseRaceOffEnterNext8103.apply(this,arguments);decorateRaceOffEntry(id,i);return out};
function decorate(){recordsCard();decorateVisibleFestival()}
const baseRecords=window.rhRenderRecords;if(typeof baseRecords==='function')window.rhRenderRecords=function(){const out=baseRecords.apply(this,arguments);setTimeout(recordsCard,0);return out};
const baseOpenRun=window.rhOpenRun;if(typeof baseOpenRun==='function')window.rhOpenRun=function(id){const out=baseOpenRun.apply(this,arguments);setTimeout(()=>decorateLiveFestival(id),0);return out};
const baseROProgress=window.rhRaceOffRenderRoundProgress;if(typeof baseROProgress==='function')window.rhRaceOffRenderRoundProgress=function(id,i=0){const out=baseROProgress.apply(this,arguments);setTimeout(()=>decorateLiveRaceOff(id,i),0);return out};
const ob=new MutationObserver(()=>{if(fh5())setTimeout(decorate,0)});ob.observe(document.body,{childList:true,subtree:true});
window.rhFH5TrackDirectory8087={version:VERSION,all,meta,mapCode,tagMeta,usageSnapshot,usage};
window.rhFH5TrackDirectory8074=window.rhFH5TrackDirectory8087;
window.rhFH5TrackDirectory8073=window.rhFH5TrackDirectory8087;
})();
