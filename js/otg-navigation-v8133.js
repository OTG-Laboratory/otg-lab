/* OTG! v8.0.133 — Scroll-to-top navigation QA. Presentation/navigation only.
 * A consistent escape route for Chronicle, Legends, Reports, Closest Battles,
 * and Garage Intelligence; context-aware returns from the Chronicle's links.
 * Never accesses or changes racing state, storage, Spaces, or campaign data.
 */
(()=>{
 'use strict';
 const $=selector=>document.querySelector(selector);
 let archiveOrigin='journey';
 const viaArchive={legends:false,reports:false,battles:false};
 const clear=()=>{for(const k of Object.keys(viaArchive))viaArchive[k]=false};
 const isHistory=()=>!!$('#hall .otgChronicle8126');

 // Remember where Historic Moments was entered, so a linked screen can come back.
 const openHistoric=window.rhOpenHistoricMoments8126;
 if(typeof openHistoric==='function'){
  window.rhOpenHistoricMoments8126=function(origin){
   archiveOrigin=origin==='legends'?'legends':'journey';
   clear();
   return openHistoric.apply(this,arguments);
  };
 }
 // Journey's tile calls an internal closure instead of the public entry point.
 document.addEventListener('click',e=>{
  if(e.target.closest?.('#otgChronTile8126')){archiveOrigin='journey';clear();}
 },true);
 for(const [type,callback] of [
  ['legends','rhChronicleLegends8126'],
  ['reports','rhChronicleReports8126'],
  ['battles','rhChronicleBattles8126']
 ]){
  const original=window[callback];
  if(typeof original!=='function')continue;
  window[callback]=function(){
   if(isHistory()){clear();viaArchive[type]=true;}
   return original.apply(this,arguments);
  };
 }

 function back(kind){
  if(kind==='historic'){
   // Respect Chronicle's own origin (Journey versus Legends).
   if(typeof window.rhChronicleBack8126==='function')return window.rhChronicleBack8126();
  }
  if(viaArchive[kind]){
   clear();
   if(typeof window.rhOpenHistoricMoments8126==='function')return window.rhOpenHistoricMoments8126(archiveOrigin);
  }
  if(kind==='reports')return window.rhOpenJourneyV7003?.();
  if(kind==='battles'){
   // rhRecordsMode can be a top-level lexical binding, not a window property.
   try{if(typeof rhRecordsMode!=='undefined')rhRecordsMode='records';}catch(_){ }
   window.rhRecordsMode='records';
   return window.rhRenderRecords?.();
  }
  if(kind==='legends')return window.rhLegendsBack8119?.();
  if(kind==='garage')return window.rhIntelBack8122?.();
 }
 window.rhNavBack8127=back;
 window.rhNavTop8127=function(event){
  // On mobile, the visible Records/Journey view can be an independently
  // scrollable container. Scrolling only window leaves that panel unchanged.
  const trigger=event?.currentTarget;
  const nav=trigger?.closest?.('.otgNavFooter8127');
  const view=nav?.closest?.('.screen') || nav?.closest?.('#hall, #more, #garage');
  const top=view?.querySelector?.('.v7JourneyHead, .otgChronHero8126, .otgLegendsHero8118, .otgReports8113, .otgIntel8122') || null;
  const jump=(el)=>{
    if(!el)return;
    try{el.scrollTo?.({top:0,left:0,behavior:'instant'});}catch(_){ }
    try{el.scrollTop=0;}catch(_){ }
  };
  // Reset every scrollable ancestor of this button, not just the page.
  for(let el=nav;el;el=el.parentElement)jump(el);
  jump(view);jump(document.scrollingElement);jump(document.documentElement);jump(document.body);
  try{window.scrollTo?.(0,0);}catch(_){ }
  // scrollIntoView also covers mobile WebViews that manage their own viewport.
  try{top?.scrollIntoView?.({block:'start',behavior:'instant'});}catch(_){ }
 };

 function nav(container,kind,defaultLabel){
  const existing=container.querySelector(':scope > .otgNavFooter8127');
  const label=kind==='historic'?(archiveOrigin==='legends'?'BACK TO RACING LEGENDS':'BACK TO JOURNEY'):(viaArchive[kind]?'BACK TO HISTORIC MOMENTS':defaultLabel);
  if(existing){
   const b=existing.querySelector('[data-otg-back]');
   if(b&&b.dataset.label!==label){b.textContent='‹ '+label;b.dataset.label=label;}
   return;
  }
  const bar=document.createElement('nav');
  bar.className='otgNavFooter8127';bar.setAttribute('aria-label','Page navigation');
  const btn=document.createElement('button');btn.type='button';btn.dataset.otgBack='';btn.dataset.label=label;
  btn.textContent='‹ '+label;btn.addEventListener('click',()=>back(kind));
  const top=document.createElement('button');top.type='button';top.className='otgNavToTop8127';top.textContent='↑ TOP';
  top.addEventListener('click',window.rhNavTop8127);
  bar.append(btn,top);container.appendChild(bar);
 }
 function updateTop(parent,kind){
  const btn=parent?.querySelector('.v7JourneyHead > button, .otgLegendsHero8118 > button');
  if(!btn)return;
  const label=viaArchive[kind]?'BACK TO HISTORIC MOMENTS':kind==='reports'?'BACK TO JOURNEY':kind==='battles'?'BACK TO RECORDS':'BACK TO STATS';
  if(btn.dataset.otgNav8127===label)return;
  btn.dataset.otgNav8127=label;btn.textContent='‹ '+label;
  // Replace inline old fixed-destination handler with a context-aware one.
  btn.removeAttribute('onclick');btn.onclick=()=>back(kind);
 }
 function apply(){
  const historic=$('#hall .otgChronicle8126');
  if(historic){
   const top=historic.querySelector('.otgChronHero8126 > button');
   const label=archiveOrigin==='legends'?'BACK TO RACING LEGENDS':'BACK TO JOURNEY';
   if(top&&top.dataset.otgNav8127!==label){top.dataset.otgNav8127=label;top.textContent='‹ '+label;}
   const main=historic.querySelector('.otgChronMain8126');
   if(main)nav(main,'historic','BACK');
  }
  const report=$('#hall .otgReports8113');
  if(report){updateTop(report,'reports');nav(report,'reports','BACK TO JOURNEY');}
  const battles=$('#hall .otgBattles8117');
  if(battles){updateTop(battles,'battles');nav(battles,'battles','BACK TO RECORDS');}
  const legends=$('#more .otgLegends8118');
  if(legends){
   updateTop(legends,'legends');
   // Legends already has a bottom back button; add a reliable context-aware return.
   const oldBottom=legends.querySelector('.otgLegendsBottom8119');
   if(oldBottom){
    const b=oldBottom.querySelector('button');
    if(b){const label=viaArchive.legends?'BACK TO HISTORIC MOMENTS':'BACK TO STATS';
     if(b.dataset.otgNav8127!==label){b.dataset.otgNav8127=label;b.textContent='‹ '+label;b.removeAttribute('onclick');b.onclick=()=>back('legends');}}
   }
  }
  const garage=$('#garage .otgIntel8122');
  if(garage)nav(garage,'garage','BACK TO GARAGE');
 }
 let queued=false;
 function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply();});}
 const observer=new MutationObserver(schedule);
 for(const id of ['hall','more','garage']){
  const el=document.getElementById(id);
  if(el)observer.observe(el,{childList:true,subtree:true});
 }
 apply();
 window.otgNavigationQA8127={apply,back,contexts:()=>({archiveOrigin,...viaArchive})};
})();
