/* OTG! v8.0.62 — consolidated reliability + Lonely Hearts patch.
   - Swiss abandon restored after late Swiss render overrides.
   - Safe championship launch handlers (apostrophes / special characters).
   - Hennessey duplicate manufacturer normalization.
   - Lonely Hearts Cup in Festival + Race Off.
   - Hall of Fame includes completed Race Off champions.
   - Race Off landing surfaces every active tournament. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normMake=v=>String(v??'').replace(/\u00a0/g,' ').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const clone=v=>JSON.parse(JSON.stringify(v));
const activeStatus=s=>!['complete','abandoned'].includes(String(s||''));
const carLabel=c=>{try{return typeof carName==='function'?carName(c):[c?.make,c?.model,c?.year].filter(Boolean).join(' ')}catch(_){return [c?.make,c?.model,c?.year].filter(Boolean).join(' ')||'Unknown car'}};
const fmt=v=>typeof rhFmtTime==='function'?rhFmtTime(Number(v)||0):String(v||'—');

/* ---------- Hennessey live-state repair ---------- */
function repairHennessey(){
 let changed=false;
 try{
  if(typeof state==='undefined'||!Array.isArray(state?.spaces))return false;
  for(const s of state.spaces){
   const canonical='Hennessey';
   const isH=v=>normMake(v)==='hennessey';
   for(const c of s.cars||[]){if(isH(c.make)&&c.make!==canonical){c.make=canonical;changed=true}}
   if(isH(s.favouriteManufacturer)&&s.favouriteManufacturer!==canonical){s.favouriteManufacturer=canonical;changed=true}
   for(const r of s.runs||[]){if(['make','favourite'].includes(String(r?.type||r?.championshipType||''))&&isH(r.value)&&r.value!==canonical){r.value=canonical;changed=true}}
   for(const ro of s.raceOffs||[]){if(['make','favourite'].includes(String(ro?.type||''))&&isH(ro.value)&&ro.value!==canonical){ro.value=canonical;changed=true}for(const c of ro?.entrants||[]){if(isH(c.make)&&c.make!==canonical){c.make=canonical;changed=true}}}
  }
  if(changed&&typeof rhSave==='function')rhSave();
 }catch(err){console.warn('OTG! v8.0.62 Hennessey repair skipped',err)}
 return changed;
}
repairHennessey();
window.rhRepairHennesseyV8062=repairHennessey;

/* ---------- Backup completeness: protect all current Space data ---------- */
window.rhBackupSnapshotV8012=function(s,type='manual'){
 const data=clone(s||{});delete data.id;delete data.name;delete data.createdAt;delete data.backups;delete data.safetyBackup;
 const runResults=(s?.runs||[]).flatMap(r=>r.results||[]).length,eventResults=(s?.customEvents||[]).flatMap(e=>e.results||[]).length;
 let raceOffResults=0;for(const ro of s?.raceOffs||[])for(const rd of ro?.rounds||[])for(const m of rd?.matches||[]){if(m?.resultA)raceOffResults++;if(m?.resultB)raceOffResults++;}
 return {id:rhId(type==='safety'?'safety-backup':'backup'),type,spaceName:s?.name||'My OTG!',date:new Date().toISOString(),counts:{cars:(s?.cars||[]).length,championships:(s?.runs||[]).length,results:runResults+eventResults+raceOffResults},data};
};
function repairRecentSafetyBackups8062(){
 try{
  let changed=false,now=Date.now();if(typeof state==='undefined'||!Array.isArray(state?.spaces))return;
  for(const s of state.spaces){const b=s?.safetyBackup,age=now-new Date(b?.date||0).getTime();if(b?.type==='safety'&&age>=0&&age<60*60*1000&&b.data&&!Object.prototype.hasOwnProperty.call(b.data,'raceOffs')){s.safetyBackup=window.rhBackupSnapshotV8012(s,'safety');changed=true}}
  if(changed){rhSave();console.info('OTG! v8.0.62 upgraded the recent Safety Backup to include current Race Off and full Space data.');}
 }catch(err){console.warn('OTG! v8.0.62 Safety Backup completeness repair skipped',err)}
}
repairRecentSafetyBackups8062();

/* ---------- Lonely Hearts eligibility ---------- */
function lonelyCars(){
 const cars=(typeof rhSpace==='function'?rhSpace()?.cars:[])||[];
 const groups=new Map();
 for(const c of cars){
  const raw=String(c?.make||'').replace(/\u00a0/g,' ').trim().replace(/\s+/g,' ');if(!raw)continue;
  const k=raw.toLocaleLowerCase();if(!groups.has(k))groups.set(k,[]);groups.get(k).push(c);
 }
 return [...groups.values()].filter(list=>list.length===1).map(list=>list[0]).sort((a,b)=>String(a.make).localeCompare(String(b.make),undefined,{sensitivity:'base'}));
}
const baseEligible8062=window.rhEligible;
window.rhEligible=function(type,value){if(String(type)==='lonely-hearts')return lonelyCars();return baseEligible8062(type,value)};
const baseLabel8062=window.rhSetupTypeLabel;
window.rhSetupTypeLabel=function(type){if(String(type)==='lonely-hearts')return 'LONELY HEARTS CUP';return baseLabel8062(type)};
const baseTrophyKey8062=window.rhTrophyTypeKey;
window.rhTrophyTypeKey=function(type){if(String(type)==='lonely-hearts')return 'festival';return baseTrophyKey8062(type)};

function lonelyPreset(context='festival'){
 return {family:'manufacturer',profile:'GT',discipline:'GT',tracks:['Horizon Mexico Circuit','Emerald Circuit','Sierra Verde Sprint','Reservorio Sprint','Gran Pantano Sprint','Coast Run'],source:'Lonely Hearts Cup'};
}
const basePreset8062=window.rhFH5Preset8056;
if(typeof basePreset8062==='function')window.rhFH5Preset8056=function(type,value,context='festival'){if(String(type)==='lonely-hearts')return lonelyPreset(context);return basePreset8062(type,value,context)};

function configureLonelySetup(){
 if(typeof rhSetup==='undefined'||!rhSetup||rhSetup.type!=='lonely-hearts')return;
 const n=(rhSetup.entries||[]).length,p=lonelyPreset(),format=n<=16?'standard':n<=64?'groups':'swiss',fh5=rhSpace()?.catalogueKey==='fh5-catalogue-v1';
 if(fh5){const need=format==='swiss'?(n<=64?3:4):3;rhSetup.rounds=Array.from({length:need},(_,i)=>({id:rhId('round'),name:p.tracks[i%p.tracks.length],layout:''}));}
 rhSetup.v8GroupMode=format==='groups';rhSetup.v8SwissMode=format==='swiss';
 if(format!=='groups')rhSetup.v8GroupPlan=null;
 if(format!=='swiss')rhSetup.v8SwissPlan=null;
 else if(!rhSetup.v8SwissPlan){const plan=window.rhCustomSwissPlan8040?.(n);rhSetup.v8SwissPlan={knockoutSize:Number(plan?.recCut||8)};}
 if(fh5)rhSetup.fh5Preset={format,source:p.source,family:p.family,profile:p.profile,discipline:p.discipline,pool:[...p.tracks],fixed:false};
}
const baseBegin8062=window.rhBeginSetup;
window.rhBeginSetup=function(type,value,name){
 const out=baseBegin8062(type,value,name);
 if(String(type)==='lonely-hearts'&&typeof rhSetup!=='undefined'&&rhSetup&&!rhSetup.savedRunId){configureLonelySetup();rhRenderSetup()}
 return out;
};

/* ---------- Safe fresh Championship card handlers ---------- */
const baseChampCard8062=window.rhChampCard;
window.rhChampCard=function(type,value,name,count){
 let html=baseChampCard8062(type,value,name,count);
 if(!/onclick="rhBeginSetup\(/.test(html))return html;
 const attrs=` data-rh-setup-type="${E(encodeURIComponent(String(type??'')))}" data-rh-setup-value="${E(encodeURIComponent(String(value??'')))}" data-rh-setup-name="${E(encodeURIComponent(String(name??'')))}"`;
 html=html.replace(/\s+onclick="rhBeginSetup\([^\"]*\)"/,attrs);
 return html;
};
document.addEventListener('click',e=>{
 const b=e.target.closest?.('.rhChampCard[data-rh-setup-type]');if(!b)return;
 e.preventDefault();e.stopPropagation();
 try{rhBeginSetup(decodeURIComponent(b.dataset.rhSetupType||''),decodeURIComponent(b.dataset.rhSetupValue||''),decodeURIComponent(b.dataset.rhSetupName||''))}catch(err){console.error(err);toast('Could not open Championship')}
});

/* ---------- Festival + Race Off Lonely Hearts launch cards ---------- */
function injectFestivalLonely(){
 const root=$('festival'),body=root?.querySelector('.rhFestivalBodyV1');if(!body||root.querySelector('.rhLonelyHearts8062'))return;
 const count=lonelyCars().length;if(count<2)return;
 const fav=body.querySelector('.rhFestivalFavouriteV1');
 const html=`<section class="rhFestivalSectionV1 rhLonelyHearts8062"><h2>LONELY HEARTS CUP</h2><div class="rhFestivalDetailIntroV1"><i aria-hidden="true">♥</i><span>One car from every Manufacturer that currently has exactly one owned car in this Garage.</span><b>${count} ONE-CAR MANUFACTURERS • FIELD FREEZES AT START</b></div>${rhChampCard('lonely-hearts','one-car-makes','Lonely Hearts Cup',count)}</section>`;
 if(fav)fav.insertAdjacentHTML('afterend',html);else body.insertAdjacentHTML('afterbegin',html);
}
function raceOffLonelyCard(count){
 return `<section class="rhFestivalSectionV1 rhLonelyHeartsRaceOff8062"><h2>LONELY HEARTS RACE OFF</h2><div class="rhFestivalDetailIntroV1"><i aria-hidden="true">♥</i><span>The one-car Manufacturers meet in a knockout. The field freezes when you lock the draw.</span><b>${count} ONE-CAR MANUFACTURERS</b></div><button class="rhChampCard rhRaceOffLaunchCard" data-ro-type="lonely-hearts" data-ro-value="one-car-makes" data-ro-name="Lonely Hearts Race Off" data-ro-count="${count}"><img src="assets/final/trophy-era.png" alt=""><span><b>Lonely Hearts Race Off</b><small>${count} eligible cars</small></span><em>›</em></button></section>`;
}
function injectRaceOffLonely(){const root=$('raceoff'),body=root?.querySelector('.rhFestivalBodyV1');if(!body||root.querySelector('.rhLonelyHeartsRaceOff8062'))return;const count=lonelyCars().length;if(count>=2)body.insertAdjacentHTML('afterbegin',raceOffLonelyCard(count))}

/* ---------- All active Race Off tournaments ---------- */
function raceOffStageText(ro){
 const i=Number(ro?.currentRoundIndex||0),rd=ro?.rounds?.[i],locked=ro?.entryIds?.length||ro?.entrants?.length||0;
 if(!rd)return `${locked} cars locked • Ready for Round 1 setup`;
 const label=rd.drawPlan?.label||rd.stageLabel||rd.label||`Round ${i+1}`;
 const done=(rd.matches||[]).filter(m=>m?.status==='complete'||m?.winnerCarId).length,total=(rd.matches||[]).length;
 if(rd.status==='drawn')return `${label} • Draw complete`;
 if(total)return `${label} • ${done} of ${total} matches complete`;
 return `${label} • ${String(rd.status||'ready').replace(/-/g,' ')}`;
}
function injectAllActiveRaceOffs(){
 const root=$('raceoff'),body=root?.querySelector('.rhFestivalBodyV1');if(!body)return;
 root.querySelectorAll('.rhRaceOffContinue').forEach(x=>x.remove());
 const list=((rhSpace()?.raceOffs)||[]).filter(ro=>ro&&activeStatus(ro.status)).sort((a,b)=>String(b.updatedAt||b.createdAt||'').localeCompare(String(a.updatedAt||a.createdAt||'')));
 if(!list.length)return;
 body.insertAdjacentHTML('afterbegin',`<section class="rhFestivalSectionV1 rhRaceOffContinue rhRaceOffContinueAll8062"><h2>CONTINUE RACE OFF</h2><p class="small">Every active tournament stays available here until completed or abandoned.</p>${list.map(ro=>`<button class="rhChampCard" onclick="rhRenderRaceOffLocked('${E(ro.id)}')"><span><b>${E(ro.name||'Race Off')}</b><small>${E(raceOffStageText(ro))}</small></span><em>›</em></button>`).join('')}</section>`);
}

const baseRenderFestival8062=window.rhRenderFestival;
window.rhRenderFestival=function(){const out=baseRenderFestival8062();injectFestivalLonely();return out};
const baseRenderRaceOff8062=window.rhRenderRaceOff;
window.rhRenderRaceOff=function(){const out=baseRenderRaceOff8062();injectAllActiveRaceOffs();injectRaceOffLonely();return out};

/* ---------- Restore Abandon to late Swiss renderers ---------- */
function abandonZone(host,kind,id){
 const s=rhSpace(),item=kind==='event'?(s.customEvents||[]).find(x=>String(x.id)===String(id)):(s.runs||[]).find(x=>String(x.id)===String(id));
 if(!host||!item||!activeStatus(item.status)||host.querySelector('.rhAbandonZoneV6150'))return;
 const label=kind==='event'?'EVENT':'CHAMPIONSHIP';const target=host.querySelector('main,.rhContent')||host;
 target.insertAdjacentHTML('beforeend',`<section class="rhAbandonZoneV6150"><small>DANGER ZONE</small><button type="button" onclick="rhAskAbandonV6150('${kind}','${E(id)}')"><span>⚠</span><div><b>ABANDON ${label}</b><em>Permanently close this active ${label.toLowerCase()}</em></div><strong>›</strong></button></section>`);
}
function decorateRunSwiss(id){const r=(rhCurrentRuns?.()||[]).find(x=>String(x.id)===String(id));if(r?.format==='swiss')abandonZone($('festival'),'championship',id)}
function decorateEventSwiss(id){const e=(rhSpace()?.customEvents||[]).find(x=>String(x.id)===String(id));if(e?.format==='swiss'||e?.competitionFormat==='swiss'||e?.v8Swiss||e?.customSwiss||e?.swissCompleted)abandonZone($('event'),'event',id)}
const baseOpenRun8062=window.rhOpenRun;
window.rhOpenRun=function(id){const out=baseOpenRun8062.apply(this,arguments);decorateRunSwiss(id);return out};
const baseOpenEvent8062=window.rhOpenEvent;
window.rhOpenEvent=function(id){const out=baseOpenEvent8062.apply(this,arguments);decorateEventSwiss(id);return out};
function wrapSwiss(names,kind){for(const name of names){const base=window[name];if(typeof base!=='function')continue;window[name]=function(id){const out=base.apply(this,arguments);if(kind==='event')decorateEventSwiss(id);else decorateRunSwiss(id);return out}}}
wrapSwiss(['rhV8051StartSwissRound','rhV8051SwissResult','rhV8051SaveSwissResult','rhV8051NextSwissRound','rhV8051BeginSwissKO','rhV8051KOResult','rhV8051SaveKOResult','rhV8051NextKORound'],'championship');
wrapSwiss(['rhCustomSwissStartRound8041','rhSaveSwissResult8041','rhSwissNextRound8041','rhSwissBeginKO8041','rhV8054CustomSwissFinal'],'event');

/* ---------- Lonely Hearts start freeze + live Race Off track suggestion ---------- */
const baseConfirmStart8062=window.rhConfirmStart;
window.rhConfirmStart=function(){
 const lonely=typeof rhSetup!=='undefined'&&rhSetup?.type==='lonely-hearts';
 const out=baseConfirmStart8062.apply(this,arguments);
 if(lonely){
   const candidates=(rhSpace()?.runs||[]).filter(r=>r?.type==='lonely-hearts'&&r?.status==='active').sort((a,b)=>String(b.startedAt||b.createdAt||'').localeCompare(String(a.startedAt||a.createdAt||'')));
   const run=candidates[0];if(run?.v8Groups&&!run.v8Groups.stage1Closed){run.v8Groups.stage1Closed=true;run.v8Groups.knownStage1Eligible=[...(run.entries||[])];rhSave();}
 }
 return out;
};
const baseRaceOffRound8062=window.rhRaceOffOpenRoundSetup;
if(typeof baseRaceOffRound8062==='function')window.rhRaceOffOpenRoundSetup=function(id){
 const out=baseRaceOffRound8062.apply(this,arguments),ro=(rhSpace()?.raceOffs||[]).find(x=>String(x.id)===String(id));
 if(ro?.type==='lonely-hearts'&&rhSpace()?.catalogueKey==='fh5-catalogue-v1'){
   const i=Number(ro.currentRoundIndex||0),rd=ro.rounds?.[i],field=Number(rd?.entryIds?.length||rd?.entrants?.length||(i===0?(ro.entryIds?.length||ro.entrants?.length):0)),p=lonelyPreset('raceoff');
   const track=field===2?'The Colossus':p.tracks[i%p.tracks.length],input=$('rhRaceOffTrack');
   if(input&&!String(input.value||'').trim())input.value=track;
   const note=$('rhFH5RaceOffSuggestion8056');if(note)note.innerHTML=`<b>FH5 SUGGESTED TRACK:</b> ${E(track)} — Lonely Hearts programme • edit before REVIEW DRAW if you want a different race.`;
 }
 return out;
};

/* ---------- Race Off Hall of Fame ---------- */
function raceOffChampionId(ro){return String(ro?.championCarId||ro?.champion?.sourceCarId||ro?.champion?.id||'')}
function raceOffChampionName(ro){const id=raceOffChampionId(ro),live=(rhSpace()?.cars||[]).find(c=>String(c.id)===id);return live?carLabel(live):String(ro?.champion?.name||'Race Off Champion')}
function raceOffChampionTotal(ro){
 const id=raceOffChampionId(ro);let total=0,found=0;
 for(const rd of ro?.rounds||[])for(const m of rd?.matches||[]){if(String(m?.winnerCarId||'')!==id)continue;const a=String(m?.carA?.sourceCarId||m?.carA?.id||m?.carA||'')===id;const res=a?m.resultA:m.resultB;if(res&&Number(res.time)>0){total+=Number(res.time);found++}}
 return found?total:0;
}
function raceOffHofCards(){
 return (rhSpace()?.raceOffs||[]).filter(ro=>ro?.status==='complete'&&raceOffChampionId(ro)).map(ro=>`<article class="rhHallCardV1 rhHallRaceOff8062"><div class="rhHofTrophyV6"><img src="assets/final/trophy-era.png" alt=""></div><small class="rhHallType8062">RACE OFF</small><b>${E(ro.name||'Race Off')}</b><span>${E(raceOffChampionName(ro))}</span><small>WINNING TIME</small><strong>${raceOffChampionTotal(ro)?fmt(raceOffChampionTotal(ro)):'—'}</strong></article>`).join('');
}
const baseHall8062=window.rhHallOfFame;
if(typeof baseHall8062==='function')window.rhHallOfFame=function(completed){
 let html=baseHall8062(completed),cards=raceOffHofCards();if(!cards)return html;
 if(html.includes('<div class="rhHallGridV1">'))html=html.replace('<div class="rhHallGridV1">','<div class="rhHallGridV1">'+cards);
 else{
   const emptyStart=html.indexOf('<div class="rhEmpty');
   if(emptyStart>=0){const info=html.indexOf('<div class="rhRecordsInfoV1"',emptyStart);if(info>=0)html=html.slice(0,emptyStart)+`<div class="rhHallGridV1">${cards}</div>`+html.slice(info)}
   else html=html.replace('<div class="rhRecordsInfoV1"',`<div class="rhHallGridV1">${cards}</div><div class="rhRecordsInfoV1"`);
 }
 html=html.replace('Completed Championships are honoured here with their trophy, winning car and final time.','Completed Championships and Race Off champions are honoured here with their trophy, winning car and final time.')
          .replace('Only fully completed Championships appear here.','Only fully completed Championships and Race Offs appear here.');
 return html;
};

/* Update visible landing copy after Hall of Fame extension. */
const baseRecords8062=window.rhRenderRecords;
if(typeof baseRecords8062==='function')window.rhRenderRecords=function(){const out=baseRecords8062.apply(this,arguments);if(window.rhRecordsMode!=='hall'){document.querySelectorAll('.v7Hall small,.rhHallBannerV1 small').forEach(x=>{x.textContent='Completed Championships and Race Off champions, with winning cars and final times.'})}return out};

/* tiny QA hooks */
window.rhLonelyHeartsEligible8062=()=>lonelyCars().map(c=>c.id);
window.rhV8062RepairReport=()=>({hennesseyCars:(rhSpace()?.cars||[]).filter(c=>normMake(c.make)==='hennessey').length,lonelyHearts:lonelyCars().length,activeRaceOffs:(rhSpace()?.raceOffs||[]).filter(ro=>ro&&activeStatus(ro.status)).length});
})();
