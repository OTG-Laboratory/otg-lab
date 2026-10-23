/* OTG! 8.0.125 — TET After Dark optional entrance skin + REAL Hubbs schedule.
 * The theme is limited to the FH5 tournament landing; it never changes races.
 * A separate device-only visual preference can be switched back to v8.0.124.
 */
(()=>{
'use strict';
const PREF='otg-tet-afterdark-v8125';
let afterDark=true;
try{afterDark=localStorage.getItem(PREF)!=='classic'}catch(_){/* private mode */}
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const divisions=[
 {id:'HUBBS-N-F',short:'ROAD OUTSIDERS',desc:'28 sole-make road cars • four 7-car groups, then the Top 8 final',icon:'🏁'},
 {id:'HUBBS-RC-F',short:'RACE REBELS',desc:'5 dedicated race cars • two Road / Street rounds',icon:'🏎️'},
 {id:'HUBBS-OR-F',short:'DIRT MISFITS',desc:'12 off-road specialists • two Dirt / Cross Country rounds',icon:'🌪️'}
];
function campaignSlots(){try{return window.rhEvilR1QA8103?.slots?.()||[]}catch(_){return []}}
function divisionRows(){const slots=campaignSlots();return divisions.map(d=>({...d,visits:slots.filter(s=>s.eventId===d.id)}));}
function decorateMemorial(){
 const teaser=document.querySelector('#evilcampaign .rhEvilR1Body8097 .otgHubbsTeaser8123');
 if(!teaser)return;
 const eyebrow=teaser.querySelector('.eyebrow'),desc=teaser.querySelector('p'),button=teaser.querySelector('button');
 if(eyebrow&&eyebrow.textContent!=='LEGACY REBORN • A REAL TOURNAMENT')eyebrow.textContent='LEGACY REBORN • A REAL TOURNAMENT';
 if(desc&&desc.textContent!=='45 one-car manufacturers. Three specialist divisions. Seven final-encore visits. A trophy worthy of the underdogs.')desc.textContent='45 one-car manufacturers. Three specialist divisions. Seven final-encore visits. A trophy worthy of the underdogs.';
 if(button&&button.textContent!=='THE TROPHY & RACE PLAN ›')button.textContent='THE TROPHY & RACE PLAN ›';
 if(!teaser.querySelector('.otgHubbsStatus8125')){let x=document.createElement('div');x.className='otgHubbsStatus8125';x.textContent='🏆 LIVE ON THE TET LIST • THE FINAL ENCORE';teaser.appendChild(x)}
}
function decorateLanding(){
 const host=document.getElementById('evilcampaign');if(!host)return;
 const main=host.querySelector('main.rhEvilR1Body8097');
 const mainScreen=!!main?.querySelector('.rhEvilR1Stats8097');
 host.classList.toggle('tetAfterDark8125',mainScreen&&afterDark);
 if(!mainScreen)return;
 decorateMemorial();
 const hero=host.querySelector('header.otgTournamentHero8124');if(!hero)return;
 const inner=hero.querySelector('.otgTournamentCopy8124');if(!inner)return;
 let controls=inner.querySelector('.tetThemeControls8125');
 if(!controls){
  controls=document.createElement('div');controls.className='tetThemeControls8125';
  controls.innerHTML='<div class="tetAfterDarkOverline8125">THE MIDNIGHT GRID • PRIVATE TOURNAMENT EDITION</div><div class="tetAfterDarkQuote8125">THE TRACK GETS DIRTY. <strong>THE TIMES STAY CLEAN.</strong></div><button type="button" class="tetSwitch8125" onclick="rhToggleTETAfterDark8125()" aria-label="Change Evil Tournament visual theme"></button>';
  inner.appendChild(controls);
 }
 const switcher=controls.querySelector('.tetSwitch8125');
 if(switcher){const lbl=afterDark?'✦ AFTER DARK IS ON • SHOW ORIGINAL':'✦ GO AFTER DARK • RAISE THE HEAT';if(switcher.textContent!==lbl)switcher.textContent=lbl;switcher.setAttribute('aria-pressed',String(afterDark))}
}
window.rhToggleTETAfterDark8125=()=>{afterDark=!afterDark;try{localStorage.setItem(PREF,afterDark?'afterdark':'classic')}catch(_){ }decorateLanding()};
function memorialDetail(){
 const current=window.rhOpenHubbsMemorial8123;
 if(typeof current!=='function'||current._hubbsSchedule8125)return;
 function open(){current.apply(this,arguments);
  const section=document.querySelector('#evilcampaign .otgHubbsDetail8123');if(!section)return;
  const desc=section.querySelector('p');if(desc)desc.textContent='Forty-five wonderfully overlooked one-car manufacturers. All invited. Normal, Race and Off-Road entrants race in their OWN divisions — no sacrificial buggies on The Colossus.';
  const warning=section.querySelector('.otgHubbsCaution8123');
  if(warning){warning.classList.add('otgHubbsLive8125');warning.innerHTML='<strong>THE MEMORIAL IS NOW A REAL COMPETITION</strong><br>Seven playable Festival visits follow the existing campaign as a final encore. Every one of the original 1,212 slots keeps its number and saved status. Three divisions, three genuine champions. The trophy is only earned by racing.';}
  if(!section.querySelector('.otgHubbsDivisions8125')){
    const wrap=document.createElement('div');wrap.className='otgHubbsDivisions8125';
    const rows=divisionRows();
    wrap.innerHTML=`<h3>THE HUBBS MEMORIAL • RACE PROGRAMME</h3><p>3 eligible fields • 45 cars • 7 visits • one-car makes only</p>${rows.map(d=>{const nos=d.visits.map(x=>Number(x.slot));const first=nos[0];const span=nos.length?`SLOT${nos.length===1?'':'S'} ${nos.map(n=>String(n).padStart(4,'0')).join(' · ')}`:'COMPETITION NOT LOADED';return `<article><span class="otgHubbsDivisionIcon8125">${d.icon}</span><div><b>${esc(d.short)}</b><small>${esc(d.desc)}</small><strong>${esc(span)}</strong></div>${first?`<button type="button" onclick="rhEvilOpenR1Slot8098(${first})" aria-label="View ${esc(d.short)} first slot">VIEW ›</button>`:''}</article>`}).join('')}`;
    warning?.insertAdjacentElement('afterend',wrap);
  }
 }
 open._hubbsSchedule8125=true;window.rhOpenHubbsMemorial8123=open;
}
function refresh(){memorialDetail();decorateLanding()}
function attach(){const host=document.getElementById('evilcampaign');if(host&&typeof MutationObserver!=='undefined'){
 let active=false;new MutationObserver(()=>{if(active)return;active=true;queueMicrotask(()=>{active=false;refresh()})}).observe(host,{childList:true,subtree:true});}
 refresh();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',attach,{once:true});else attach();
})();
