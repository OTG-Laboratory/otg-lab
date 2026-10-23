/* OTG! v8.0.54 — Custom Racing Swiss final routes to the locked Final Standings / trophy screen. */
(()=>{
'use strict';
const byId=id=>{try{return rhSpace()?.customEvents?.find(e=>String(e.id)===String(id))||null}catch(_){return null}};
const carBy=id=>{try{return rhSpace()?.cars?.find(c=>String(c.id)===String(id))||null}catch(_){return null}};
const isSwissFinal=e=>!!(e&&e.status==='complete'&&e.swissCompleted&&e.customKO?.championId);
function finalMatch(e){
 const rounds=e?.customKO?.rounds||[],r=rounds[rounds.length-1],m=r?.matches?.[0];
 return r&&m&&m.resultA&&m.resultB?{r,m}:null;
}
function renderSwissFinal(e){
 const fm=finalMatch(e);if(!fm||typeof window.rhShowEventFinalStandingsV5828!=='function')return false;
 const {r,m}=fm,oldResults=e.results,oldCars=window.rhEventCars,oldRounds=window.rhEventRounds;
 const finalists=[carBy(m.carA),carBy(m.carB)].filter(Boolean);
 const finalResults=[m.resultA,m.resultB].filter(Boolean);
 try{
   e.results=finalResults;
   window.rhEventCars=ev=>String(ev?.id)===String(e.id)?finalists:(typeof oldCars==='function'?oldCars(ev):[]);
   window.rhEventRounds=ev=>String(ev?.id)===String(e.id)?[{id:r.id,name:r.trackName||'Final',trackName:r.trackName||'Final'}]:(typeof oldRounds==='function'?oldRounds(ev):(ev?.rounds||[]));
   window.rhShowEventFinalStandingsV5828(e.id);
   const label=document.querySelector('#final-standings .rhFS28ChampionLabel');if(label)label.textContent='CUSTOM SWISS CHAMPION';
   const timeLabel=document.querySelector('#final-standings .rhFS28TimeLabel');if(timeLabel)timeLabel.textContent='FINAL WINNING TIME';
   return true;
 }finally{
   e.results=oldResults;
   window.rhEventCars=oldCars;
   window.rhEventRounds=oldRounds;
 }
}
window.rhV8054CustomSwissFinal=renderSwissFinal;
const baseOpen=window.rhOpenEvent;
if(typeof baseOpen==='function')window.rhOpenEvent=function(id){
 let e=byId(id);if(isSwissFinal(e)&&renderSwissFinal(e))return;
 const out=baseOpen(id);
 e=byId(id);if(isSwissFinal(e))renderSwissFinal(e);
 return out;
};
})();
