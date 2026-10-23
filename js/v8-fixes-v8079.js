/* OTG! v8.0.79 — Evil Campaign Festival handoff + shuffle-bag reset repair.
   1) Evil-launched Festival setups show Evil Campaign metadata instead of the old diversified preset label.
   2) Reset Racing Data / Full Reset reliably clear FH5 persistent track shuffle bags after the v8.0.66 reset-button clone.
   3) A genuinely clean 0/708 Evil campaign with no racing data self-heals any stale pre-reset shuffle-bag state on first load.
*/
(()=>{
'use strict';
const VERSION='8.0.79';
const FH5_KEY='fh5-catalogue-v1';
const BAG_KEY='fh5TrackBags8070';
const EVIL_KEY='evilCampaign8076';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const clean=v=>String(v??'').trim();
function space(){try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}}
function fh5(){return space()?.catalogueKey===FH5_KEY}
function save(){try{typeof rhSave==='function'&&rhSave()}catch(_){}}
function catLabel(cat){return {ROAD:'ROAD / STREET',OFFROAD:'OFF-ROAD',RALLY:'RALLY ADVENTURE',HOT_WHEELS:'HOT WHEELS',MIXED:'MIXED',DRAG:'DRAG',SPECIAL:'SPECIAL'}[clean(cat)]||clean(cat)||'TRACK'}
function evilDoneCount(s){const d=s?.[EVIL_KEY]?.done;return d&&typeof d==='object'?Object.values(d).filter(Boolean).length:0}
function noRacingData(s){return !(s?.runs||[]).length && !(s?.raceOffs||[]).length && !(s?.customEvents||[]).length}
function clearBags(s=space()){
 if(!s||!Object.prototype.hasOwnProperty.call(s,BAG_KEY))return false;
 delete s[BAG_KEY];return true;
}

/* Heal the exact state exposed by live QA: Reset Racing Data had succeeded, Evil was 0/708,
   but the old Festival bag survived because v8.0.66 replaces the reset confirm button after v8.0.70 attaches its listener. */
function healCleanCampaignBag(){
 const s=space();if(!fh5()||!s||!noRacingData(s)||evilDoneCount(s)!==0)return false;
 if(clearBags(s)){save();return true}
 return false;
}
healCleanCampaignBag();

/* Rebind after every reset screen is fully built/replaced. Scheduling after the wrapped call means
   v8.0.66 has already cloned the approved confirmation button and the Evil progress listener has been attached. */
function bindBagResetToLiveButton(){
 const b=document.getElementById('rhResetConfirm6090');
 if(!b||b.dataset.rhBagReset8079==='1')return;
 b.dataset.rhBagReset8079='1';
 b.addEventListener('click',()=>{const s=space();if(s&&clearBags(s))save()},{once:true});
}
const baseResetConfirm8079=window.rhResetConfirm;
if(typeof baseResetConfirm8079==='function')window.rhResetConfirm=function(){
 const out=baseResetConfirm8079.apply(this,arguments);
 setTimeout(bindBagResetToLiveButton,0);
 return out;
};
const baseFullResetConfirm8079=window.rhFullResetConfirm;
if(typeof baseFullResetConfirm8079==='function')window.rhFullResetConfirm=function(){
 const out=baseFullResetConfirm8079.apply(this,arguments);
 setTimeout(bindBagResetToLiveButton,0);
 return out;
};

/* Evil Festival setups should describe the campaign instruction that is actually in force.
   The legacy FH5 preset still supplies useful setup defaults, but its old source/discipline copy can be wrong
   after Evil overrides the track category (e.g. Mitsubishi old preset says RALLY while Evil correctly says OFF-ROAD). */
function rewriteEvilProgrammePanel(){
 try{
  if(!fh5()||typeof rhSetup==='undefined'||!rhSetup?.evilCampaign8076)return;
  const marker=rhSetup.evilCampaign8076,panel=document.getElementById('rhFH5Preset8056');if(!panel)return;
  const slot=String(marker.slot||'').padStart(3,'0'),cat=catLabel(marker.trackCategory),rounds=(rhSetup.rounds||[]).length;
  const head=panel.querySelector('.rhSetupPanelHeadV1');
  if(head){
   const b=head.querySelector('b'),p=head.querySelector('p');
   if(b)b.textContent='EVIL CAMPAIGN PROGRAMME';
   if(p)p.textContent=`SLOT ${slot} • ${cat}`;
  }
  const info=panel.querySelector('.rhSetupInfoV1 p');
  if(info){
   let detail='';
   if(marker.fixedTrack)detail=`Fixed campaign track: ${marker.fixedTrack}.`;
   else if(marker.trackCategory&&marker.trackCategory!=='SPECIAL'&&marker.trackCategory!=='DRAG')detail=`Tracks are drawn from the persistent ${cat} shuffle bag. Preview and reroll do not consume tracks; START commits them.`;
   else detail='This slot uses its campaign-defined track programme.';
   info.innerHTML=`<b>${rounds} campaign round${rounds===1?'':'s'} configured.</b><br>${E(detail)}`;
  }
  const small=[...panel.querySelectorAll('p.small')].pop();
  if(small)small.textContent=`Setup supplied by Evil Campaign Slot ${slot}. Review it here before START.`;
 }catch(err){console.warn('OTG! v8.0.79 Evil programme copy repair failed',err)}
}
const baseRenderSetup8079=window.rhRenderSetup;
if(typeof baseRenderSetup8079==='function')window.rhRenderSetup=function(){
 const out=baseRenderSetup8079.apply(this,arguments);
 rewriteEvilProgrammePanel();
 return out;
};
/* Hot-update / alternate render safety. */
setTimeout(rewriteEvilProgrammePanel,0);

window.rhV8079QA={
 version:VERSION,
 healCleanCampaignBag,
 rewriteEvilProgrammePanel,
 bagPresent:()=>!!space()?.[BAG_KEY],
 evilDone:()=>evilDoneCount(space()),
 noRacingData:()=>noRacingData(space())
};
})();
