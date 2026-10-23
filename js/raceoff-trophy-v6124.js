/* OTG! v6.0.124 — locked Race Off trophy + Tournament heading cleanup only */
(()=>{
'use strict';
const RACE_OFF_TROPHY='assets/final/trophy-era.png';

function applyRaceOffTrophies(){
  document.querySelectorAll('#raceoff .rhRaceOffLaunchCard img').forEach(img=>{
    img.src=RACE_OFF_TROPHY;
    img.classList.add('rhRaceOffTrophyV6124');
    img.alt='';
  });
}

const baseLanding=window.rhRenderRaceOff;
window.rhRenderRaceOff=function(){
  const out=baseLanding.apply(this,arguments);
  applyRaceOffTrophies();
  return out;
};

const baseHistory=window.rhRaceOffRenderHistory;
window.rhRaceOffRenderHistory=function(){
  const out=baseHistory.apply(this,arguments);
  document.querySelectorAll('#raceoff .rhFestivalBodyV1 details > summary > span').forEach(span=>span.remove());
  return out;
};
})();
