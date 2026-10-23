/* OTG! v6.0.112 — Race Off Stage 1 dashboard/navigation checkpoint */
(()=>{
'use strict';
const previousRender=window.rhRender;
window.rhRenderRaceOff=function(){
 const el=document.getElementById('raceoff'); if(!el)return;
 el.innerHTML=`<div class="rhScene rhFestivalScene">${typeof rhHeader==='function'?rhHeader('RACE OFF','Knockout Racing','raceoff'):''}</div><div class="rhContent"><section class="rhSection"><h2>Race Off</h2><p class="small">Knockout racing catalogue arrives in the next checkpoint.</p></section></div>`;
};
window.rhRender=function(screen){if(screen==='raceoff')return window.rhRenderRaceOff(); return previousRender(screen);};
})();
