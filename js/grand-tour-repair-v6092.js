/* OTG! v6.0.92 — Grand Tour GT-01..GT-08 repair release.
   GT-08 priority: completed Event/result durability is checkpointed before any
   result-summary / Hubs / final-navigation UI is allowed to render.
   Also makes saved Race Notes visible from Records history. */
(()=>{
'use strict';
const STORE='RaceHub_Studio_Final_v5_6';
const RECOVERY='OTG_Event_Final_Checkpoint_v6092';
const byId=id=>document.getElementById(id);
const safe=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function clone(v){try{return structuredClone(v)}catch(_){return JSON.parse(JSON.stringify(v))}}
function checkpointEvent(event,res){
  if(!event||!res)return false;
  try{
    // Save through OTG!'s authoritative state writer first.
    if(typeof window.rhSave==='function')window.rhSave();
    // Keep a tiny independent recovery checkpoint until the completed Event is
    // demonstrably present in the authoritative localStorage payload.
    const cp={spaceId:(typeof rhSpace==='function'?rhSpace()?.id:null),event:clone(event),resultId:String(res.id||''),savedAt:new Date().toISOString()};
    localStorage.setItem(RECOVERY,JSON.stringify(cp));
    const raw=JSON.parse(localStorage.getItem(STORE)||'null');
    const spaces=Array.isArray(raw?.spaces)?raw.spaces:[];
    const sp=spaces.find(s=>!cp.spaceId||String(s.id)===String(cp.spaceId));
    const durable=!!sp?.customEvents?.some(e=>String(e.id)===String(event.id)&&(e.results||[]).some(r=>String(r.id)===String(res.id)));
    if(durable)localStorage.removeItem(RECOVERY);
    return durable;
  }catch(err){console.error('OTG! Event checkpoint failed',err);return false}
}
function recoverCheckpoint(){
  try{
    const cp=JSON.parse(localStorage.getItem(RECOVERY)||'null'); if(!cp?.event?.id)return;
    const sp=typeof rhSpace==='function'?rhSpace():null; if(!sp)return;
    if(cp.spaceId&&String(cp.spaceId)!==String(sp.id))return;
    sp.customEvents=Array.isArray(sp.customEvents)?sp.customEvents:[];
    const at=sp.customEvents.findIndex(e=>String(e.id)===String(cp.event.id));
    if(at<0)sp.customEvents.push(cp.event); else {
      const existing=sp.customEvents[at],er=(existing.results||[]),cr=(cp.event.results||[]);
      if(cr.length>er.length||cp.event.status==='complete')sp.customEvents[at]=cp.event;
    }
    if(typeof window.rhSave==='function')window.rhSave();
    localStorage.removeItem(RECOVERY);
  }catch(err){console.error('OTG! Event recovery failed',err)}
}
recoverCheckpoint();

// Last gate before any Accepted/Summary/Hubs UI: force a durable Event checkpoint.
const accepted=window.rhResultAccepted;
if(typeof accepted==='function')window.rhResultAccepted=function(owner,res,source){
  if(source==='events')checkpointEvent(owner,res);
  return accepted.apply(this,arguments);
};

// Completed Events must never route through the active-event opener from Hubs.
// Give both Hubs actions deterministic destinations with no inline/eval dependency.
const eventSummary=window.rhEventResultSummary;
if(typeof eventSummary==='function')window.rhEventResultSummary=function(event,res){
  checkpointEvent(event,res);
  return eventSummary.apply(this,arguments);
};

// GT-08 navigation hardening. The legacy Hubs page owns target-level listeners;
// intercept these two actions in capture phase so a stale/failed target listener
// cannot strand the completed Event on the celebration page.
document.addEventListener('click',function(ev){
  const btn=ev.target?.closest?.('#rhHubs29Standings,#rhHubs29Continue'); if(!btn)return;
  const eventHost=byId('event'); if(!eventHost||eventHost.classList.contains('hidden')||!eventHost.querySelector('.rhHubs29Page'))return;
  const sp=typeof rhSpace==='function'?rhSpace():null;
  const events=(sp?.customEvents||[]).filter(e=>(e.results||[]).length).sort((a,b)=>String(b.completedAt||b.results?.at?.(-1)?.date||'').localeCompare(String(a.completedAt||a.results?.at?.(-1)?.date||'')));
  const event=events[0]; if(!event)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  if(event.status==='complete'){checkpointEvent(event,(event.results||[]).at(-1));window.rhShowEventFinalStandingsV5828?.(event.id);return}
  if(btn.id==='rhHubs29Standings'){window.rhOpenEvent?.(event.id);return}
  window.rhOpenEvent?.(event.id);
},true);

// Race Notes were already stored on results. Surface them in Records so they are
// not write-only data after the immediate Result Summary.
function addRecordNotes(){
  const root=byId('hall'); if(!root||window.rhRecordsMode==='hall')return;
  const sp=typeof rhSpace==='function'?rhSpace():null; if(!sp)return;
  const sources=[...(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]),...(sp.customEvents||[])];
  root.querySelectorAll('.rhRaceRecordRowV5830').forEach(row=>{
    if(row.querySelector('.rhGT92Notes'))return;
    const sourceName=row.querySelector('.rhRaceRecordTextV5830 b')?.textContent?.trim();
    const raceCard=row.closest('.rhRaceRecordCardV5830');
    const raceName=raceCard?.querySelector('summary b')?.textContent?.trim();
    if(!sourceName||!raceName)return;
    const src=sources.find(s=>String(s.name||s.title||'').trim()===sourceName);
    const result=(src?.results||[]).filter(r=>String(r.roundName||'').trim()===raceName&&String(r.raceNotes||'').trim()).sort((a,b)=>Number(a.time||0)-Number(b.time||0))[0];
    if(!result)return;
    const note=document.createElement('div');note.className='rhGT92Notes';note.innerHTML='<small>RACE NOTES</small><p></p>';note.querySelector('p').textContent=String(result.raceNotes).trim();row.appendChild(note);
  });
}
const renderRecords=window.rhRenderRecords;
if(typeof renderRecords==='function')window.rhRenderRecords=function(){const out=renderRecords.apply(this,arguments);addRecordNotes();return out};

window.RACEHUB_VERSION='6.0.92';
})();
