/* OTG! v8.0.26 — keep the active manufacturer accordion open while selecting Custom racers. */
(()=>{
'use strict';
const baseFilter=window.rhFilterEventRacers;
if(typeof baseFilter!=='function')return;
function openMakes(){
 return [...document.querySelectorAll('#rhEventRacerOptions details.rhEventMake[open]')]
  .map(d=>d.querySelector('summary b')?.textContent||'').filter(Boolean);
}
function restoreMakes(names){
 if(!names.length)return;
 document.querySelectorAll('#rhEventRacerOptions details.rhEventMake').forEach(d=>{
  const make=d.querySelector('summary b')?.textContent||'';
  if(names.includes(make))d.open=true;
 });
}
window.rhFilterEventRacers=function(q){
 const names=openMakes();
 const out=baseFilter(q);
 restoreMakes(names);
 return out;
};
})();
