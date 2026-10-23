/* OTG! v6.0.150 — abandon active racing without rolling back valid achievements. */
(()=>{
'use strict';
const escA=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
let pending=null;
function space(){return typeof rhSpace==='function'?rhSpace():null;}
function find(kind,id){const s=space();if(!s)return null;if(kind==='championship')return (s.runs||[]).find(x=>String(x.id)===String(id));if(kind==='event')return (s.customEvents||[]).find(x=>String(x.id)===String(id));if(kind==='raceoff')return (s.raceOffs||[]).find(x=>String(x.id)===String(id));return null;}
function label(kind){return kind==='raceoff'?'TOURNAMENT':kind==='event'?'EVENT':'CHAMPIONSHIP';}
function buttonText(kind){return `ABANDON ${label(kind)}`;}
function inject(host,kind,id){
 const item=find(kind,id);if(!host||!item||['complete','abandoned'].includes(item.status)||host.querySelector('.rhAbandonZoneV6150'))return;
 const target=host.querySelector('main,.rhContent')||host;
 target.insertAdjacentHTML('beforeend',`<section class="rhAbandonZoneV6150"><small>DANGER ZONE</small><button type="button" onclick="rhAskAbandonV6150('${kind}','${escA(id)}')"><span>⚠</span><div><b>${buttonText(kind)}</b><em>Permanently close this active ${label(kind).toLowerCase()}</em></div><strong>›</strong></button></section>`);
}
window.rhAskAbandonV6150=function(kind,id){
 const item=find(kind,id);if(!item||['complete','abandoned'].includes(item.status))return;
 pending={kind,id};document.getElementById('rhAbandonConfirmV6150')?.remove();
 document.body.insertAdjacentHTML('beforeend',`<div id="rhAbandonConfirmV6150" class="rhOverlay rhAbandonOverlayV6150"><section class="rhAbandonConfirmV6150"><button class="rhAbandonCloseV6150" onclick="document.getElementById('rhAbandonConfirmV6150')?.remove()">×</button><small>⚠ DANGER ZONE</small><h2>ABANDON ${label(kind)}?</h2><p><b>${escA(item.name||label(kind))}</b> will be closed and removed from In Progress.</p><div class="rhAbandonKeepV6150"><strong>RESULTS STAY VALID</strong><span>Any races already completed, PBs and records remain accepted and will be marked <b>ABANDONED</b> where their source is shown.</span></div><p class="rhAbandonWarnV6150">This cannot be undone.</p><div class="rhAbandonActionsV6150"><button class="secondary" onclick="document.getElementById('rhAbandonConfirmV6150')?.remove()">CANCEL</button><button class="danger" onclick="rhConfirmAbandonV6150()">${buttonText(kind)}</button></div></section></div>`);
};
window.rhConfirmAbandonV6150=function(){
 const p=pending,item=p&&find(p.kind,p.id);if(!item)return document.getElementById('rhAbandonConfirmV6150')?.remove();
 const now=new Date().toISOString();item.status='abandoned';item.abandonedAt=now;item.updatedAt=now;
 // Keep every completed result exactly as recorded. The source status is the provenance marker.
 if(typeof rhSave==='function')rhSave();pending=null;document.getElementById('rhAbandonConfirmV6150')?.remove();
 if(typeof toast==='function')toast(`${label(p.kind)[0]+label(p.kind).slice(1).toLowerCase()} abandoned`);
 if(p.kind==='championship'&&item.pickMyDrive&&typeof rhPickMyDriveComingSoon==='function')return rhPickMyDriveComingSoon();if(p.kind==='championship')return rhRenderFestival();if(p.kind==='event')return rhRenderEvents();return rhRenderRaceOff();
};
// Festival active overview.
const openRun=window.rhOpenRun;if(typeof openRun==='function')window.rhOpenRun=function(id){const out=openRun.apply(this,arguments),r=find('championship',id);if(r?.status==='active')inject(document.getElementById('festival'),'championship',id);return out;};
// Custom Racing active overview.
const openEvent=window.rhOpenEvent;if(typeof openEvent==='function')window.rhOpenEvent=function(id){const out=openEvent.apply(this,arguments),e=find('event',id);if(e&&e.status==='active')inject(document.getElementById('event'),'event',id);return out;};
// Race Off has several active tournament screens; add the same bottom danger action to each.
['rhRenderRaceOffLocked','rhRaceOffOpenRoundSetup','rhRaceOffRenderDrawReview','rhRaceOffRenderDrawComplete','rhRaceOffRenderRoundProgress'].forEach(name=>{const base=window[name];if(typeof base!=='function')return;window[name]=function(id){const out=base.apply(this,arguments),ro=find('raceoff',id);if(ro&&!['complete','abandoned'].includes(ro.status))inject(document.getElementById('raceoff'),'raceoff',id);return out;};});
})();
