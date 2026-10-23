/* OTG! v5.8.28 — Final Standings single-authority face-on rebuild. */
(()=>{
'use strict';
const q=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=t=>typeof rhFmtTime==='function'?rhFmtTime(Number(t||0)):String(t??'—');
const activeSpace=()=>{try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}};
const allCars=()=>activeSpace()?.cars||[];
const carById=id=>allCars().find(c=>String(c.id)===String(id));
const carLabel=id=>{const c=carById(id);if(!c)return 'Unknown car';try{return typeof carName==='function'?carName(c):(c.name||c.model||'Unknown car')}catch(_){return c.name||c.model||'Unknown car'}};
const runRows=run=>{const rounds=(run.rounds||[]).length;return (run.entries||[]).map(id=>{const results=(run.results||[]).filter(r=>String(r.carId)===String(id));return results.length===rounds?{id,total:results.reduce((s,r)=>s+Number(r.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total)};
const eventCars=e=>{try{return typeof rhEventCars==='function'?(rhEventCars(e)||[]):[]}catch(_){return []}};
const eventRounds=e=>{try{return typeof rhEventRounds==='function'?(rhEventRounds(e)||[]):(e.rounds||[])}catch(_){return e.rounds||[]}};
const eventRows=e=>{const rounds=eventRounds(e).length;return eventCars(e).map(c=>{const results=(e.results||[]).filter(r=>String(r.carId)===String(c.id));return results.length===rounds?{id:c.id,total:results.reduce((s,r)=>s+Number(r.time||0),0)}:null}).filter(Boolean).sort((a,b)=>a.total-b.total)};
const trophy=item=>{const type=String(item?.type||item?.championshipType||item?.trophy||'festival').toLowerCase();if(type==='make'||type==='manufacturer')return 'assets/final/trophy-manufacturer.png';if(type==='era')return 'assets/final/trophy-era.png';if(type==='classtype'||type==='class-type')return 'assets/final/trophy-class-type.png';if(type==='vintage')return 'assets/final/trophy-vintage.png';if(type==='classic')return 'assets/final/trophy-classic.png';if(type==='favourite')return 'assets/final/trophy-favourite.png';return 'assets/final/trophy-festival.png'};
const championLabel=(kind,item)=>{if(kind==='event')return 'EVENT WINNER';const type=String(item?.type||item?.championshipType||'festival').toLowerCase();if(type==='era')return 'ERA CHAMPION';if(type==='make'||type==='manufacturer')return 'MANUFACTURER CHAMPION';if(type==='classtype'||type==='class-type')return 'CLASS / TYPE CHAMPION';if(type==='vintage')return 'VINTAGE CHAMPION';if(type==='classic')return 'CLASSIC CHAMPION';if(type==='favourite')return 'FAVOURITE CHAMPION';return 'FESTIVAL CHAMPION'};
function rowsMarkup(rows){const leader=rows[0]?.total||0;return rows.map((row,index)=>`<div class="rhFS28Row"><span class="rhFS28Pos">${String(index+1).padStart(2,'0')}</span><span class="rhFS28Car">${esc(carLabel(row.id))}</span><span class="rhFS28Time">${fmt(row.total)}</span><span class="rhFS28Gap">${index===0?'—':'+'+fmt(row.total-leader)}</span></div>`).join('')}
function leave(kind,host){document.body.classList.remove('rhFS28Active');host.classList.add('hidden');host.innerHTML='';if(kind==='event'){rhRenderEvents();show('events')}else{rhRenderFestival();show('festival')}window.scrollTo(0,0)}
function standingsContent(kind,item,rows){
 const winner=rows[0];
 return `<img class="rhFS28Art" src="assets/final/final-standings-face-on-ui-ready-v5828.png?v=5828" alt="">
 <div class="rhFS28Subtitle">${esc(item?.name||'Final Standings')}</div>
 <div class="rhFS28Rows">${rowsMarkup(rows)}</div>
 <img class="rhFS28Trophy" src="${trophy(item)}" alt="">
 <div class="rhFS28ChampionLabel">${esc(championLabel(kind,item))}</div>
 <div class="rhFS28WinnerName">${esc(winner?carLabel(winner.id):'—')}</div>
 <div class="rhFS28TimeLabel">TOTAL TIME</div>
 <div class="rhFS28WinnerTime">${winner?fmt(winner.total):'—'}</div>`;
}
function mount(kind,item,rows){
 const host=q('final-standings'); if(!host)return;
 document.body.classList.add('rhFS28Active');
 document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
 host.classList.remove('hidden');
 host.innerHTML=`<div class="rhFS28Page"><div class="rhFS28Stage">
 ${standingsContent(kind,item,rows)}
 <button id="rhFS28TopBack" class="rhFS28Hot rhFS28TopBack" aria-label="Back"></button>
 <button id="rhFS28Hall" class="rhFS28Hot rhFS28Hall" aria-label="View Hall of Fame"></button>
 <button id="rhFS28Back" class="rhFS28Hot rhFS28Back" aria-label="Back"></button>
 </div></div>`;
 window.scrollTo(0,0);
 q('rhFS28Back')?.addEventListener('click',()=>leave(kind,host));
 q('rhFS28TopBack')?.addEventListener('click',()=>leave(kind,host));
 q('rhFS28Hall')?.addEventListener('click',()=>{if(kind==='event'){leave(kind,host);return}document.body.classList.remove('rhFS28Active');host.classList.add('hidden');host.innerHTML='';window.rhRecordsMode='hall';rhRenderRecords();show('hall');window.scrollTo(0,0)});
}
let recordsOverlayKeyHandler=null;
function closeRecordsOverlay(){
 const overlay=q('rhFS34RecordsOverlay');
 if(overlay)overlay.remove();
 document.body.classList.remove('rhFS34RecordsOverlayActive');
 if(recordsOverlayKeyHandler){document.removeEventListener('keydown',recordsOverlayKeyHandler);recordsOverlayKeyHandler=null}
}
function mountRecordsOverlay(kind,item,rows){
 closeRecordsOverlay();
 const overlay=document.createElement('div');
 overlay.id='rhFS34RecordsOverlay';
 overlay.className='rhFS34RecordsOverlay';
 overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');
 overlay.setAttribute('aria-label',`${item?.name||'Final Standings'} historical Final Standings`);
 overlay.innerHTML=`<div class="rhFS34RecordsBackdrop"></div><div class="rhFS34RecordsModal"><div class="rhFS28Page"><div class="rhFS28Stage">${standingsContent(kind,item,rows)}<button id="rhFS34RecordsClose" class="rhFS34RecordsClose" type="button" aria-label="Close Final Standings">×</button></div></div></div>`;
 document.body.appendChild(overlay);
 document.body.classList.add('rhFS34RecordsOverlayActive');
 q('rhFS34RecordsClose')?.addEventListener('click',closeRecordsOverlay);
 overlay.querySelector('.rhFS34RecordsBackdrop')?.addEventListener('click',closeRecordsOverlay);
 recordsOverlayKeyHandler=e=>{if(e.key==='Escape')closeRecordsOverlay()};
 document.addEventListener('keydown',recordsOverlayKeyHandler);
 q('rhFS34RecordsClose')?.focus();
}
function showRun(id){const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(r=>String(r.id)===String(id));if(run)mount('championship',run,runRows(run))}
function showEvent(id){const event=activeSpace()?.customEvents?.find(e=>String(e.id)===String(id));if(event)mount('event',event,eventRows(event))}
function showRecordRun(id){const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(r=>String(r.id)===String(id));if(run)mountRecordsOverlay('championship',run,runRows(run))}
function showRecordEvent(id){const event=activeSpace()?.customEvents?.find(e=>String(e.id)===String(id));if(event)mountRecordsOverlay('event',event,eventRows(event))}
window.rhShowFinalStandingsV5828=showRun;
window.rhShowEventFinalStandingsV5828=showEvent;
window.rhShowRecordFinalStandingsV6034=showRecordRun;
window.rhShowRecordEventFinalStandingsV6034=showRecordEvent;
window.rhCloseRecordFinalStandingsV6034=closeRecordsOverlay;
window.rhChampionshipCompleteTransition=showRun;
window.rhEventCompleteTransition=showEvent;
window.rhShowCompletedEventLeaderboard=showEvent;
})();
