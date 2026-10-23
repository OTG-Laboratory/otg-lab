/* OTG! v8.0.132 — career comparison + Garage-style in-draw Car History.
 * READ-ONLY: Reuses the existing Garage Car History, Racing Legends encounter
 * collector and Olympic medal collector. Never modifies races, slot state,
 * saved results, Garage ownership, data schemas, or draw order.
 */
(()=>{
 'use strict';
 const $=s=>document.querySelector(s);
 const esc=v=>String(v??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const space=()=>{try{return window.rhSpace?.()||null;}catch(_){return null}};
 const cars=()=>Array.isArray(space()?.cars)?space().cars:[];
 const normalize=v=>String(v??'').normalize('NFKD').toLocaleLowerCase('en').replace(/[^a-z0-9]+/g,' ').trim();
 const id=v=>String(v?.sourceCarId||v?.id||v||'');
 const carLabel=c=>{try{if(typeof window.carName==='function')return window.carName(c);}catch(_){}return [c?.make,c?.model,c?.year].filter(Boolean).join(' ').trim()||String(c?.name||'')};
 const memo=new Map();
 function carLookup(){
  const m=new Map();
  for(const c of cars()){
   if(!c?.id)continue;
   const labels=[carLabel(c),c.name,[c.make,c.model,c.year].filter(Boolean).join(' '),[c.year,c.make,c.model].filter(Boolean).join(' ')];
   for(const label of labels){const k=normalize(label);if(!k)continue;
    if(!m.has(k))m.set(k,new Set());m.get(k).add(String(c.id));
   }
  }
  return m;
 }
 function history(carId){
  // Existing Car History is an overlay; don't navigate away or re-render the race.
  const c=cars().find(x=>String(x.id)===String(carId));
  if(!c||typeof window.rhOpenCarHistoryV7001!=='function')return;
  const screen=document.querySelector('.screen:not(.hidden)')?.id||'';
  const scrollY=window.scrollY||document.documentElement.scrollTop||0;
  const internalScroll=screen?document.getElementById(screen)?.scrollTop||0:0;
  window.rhOpenCarHistoryV7001(String(c.id));
  const overlay=document.getElementById('rhCarHistoryV7001');
  if(!overlay)return;
  // The old history opener scrolls the underlying screen to TOP. Restore it
  // only on return; do not modify the overlay's tested Back functions.
  overlay.addEventListener('click',event=>{
   if(!event.target.closest('.rhCarHistoryBackV8066,.v7CarHistoryPage > header > button'))return;
   setTimeout(()=>{if(screen&&document.getElementById(screen))document.getElementById(screen).scrollTop=internalScroll;window.scrollTo(0,scrollY);},0);
  },{capture:true});
  window.scrollTo(0,0);
 }
 window.rhDrawCarHistory8131=history;
 function carButton(carId){const b=document.createElement('button');b.type='button';b.className='v7HistoryBtn otgDrawHistory8131';b.textContent='▤';b.setAttribute('aria-label','Open Car History');b.title='Car History';
  b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();history(carId);});return b;
 }
 // ONLY enhance a visible drawn entrant's name. Ambiguous identical car
 // names are not guessed at; the race's own data stays authoritative.
 const selectors=[
  '#evilcampaign .rhEvilR1EligibleList8097 > div > span > b',
  '#evilcampaign .rhEvilR1DriftEntry8098 h2',
  '#festival .rhLineupRowV1 > div > b',
  '#festival .rhCurrentCarHeadV1 h2',
  '#festival .rhChamp33CurrentHead h2',
  '#festival .rhChamp33NextRows > div > b',
  '#festival .v8Standing > span',
  '#raceoff .rhRaceOffDrawMatchV6118 > b'
 ].join(',');
 function decorateDraw(){
  // Never crawl/modify history while its overlay is open.
  const map=carLookup();
  for(const node of document.querySelectorAll(selectors)){
   if(node.querySelector('.otgDrawHistory8131'))continue;
   const name=[...node.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).map(n=>n.textContent).join(' ').trim()||node.textContent.trim();
   if(!name||/^(-|no car waiting)$/i.test(name))continue;
   const ids=map.get(normalize(name));if(!ids||ids.size!==1)continue;
   node.appendChild(carButton([...ids][0]));
  }
 }
 // Renderers replace these screens with innerHTML on every draw/result.
 // One frame per batch and append-only-if-missing ensure the observer settles.
 let queued=false;
 function queueDraw(){if(queued)return;queued=true;(window.requestAnimationFrame||((f)=>setTimeout(f,16)))(()=>{queued=false;decorateDraw()});}
 function attachWatch(){
  const obs=window.MutationObserver;
  if(!obs)return;
  for(const name of ['evilcampaign','festival','raceoff']){
   const root=document.getElementById(name);if(!root)continue;
   new obs(queueDraw).observe(root,{childList:true,subtree:true});
  }
  queueDraw();
 }
 // CAR COMPARISON: complete careers and real same-event rivalry meetings.
 // Use the existing comparison UI and original shared-track PB calculations.
 function medallist(carId){
  const get=window.rhEvilR1MedalQA8111?.standings;
  if(typeof get!=='function')return null;
  try{return get('cars').find(x=>String(x.key)===String(carId))||null;}catch(_){return null;}
 }
 function report(carId){
  const c=cars().find(x=>String(x.id)===String(carId));
  const a=window.otgGarageIntelQA8122?.analyse?.(space())||[];
  const info=a.find(x=>String(x.id)===String(carId));
  const medal=medallist(carId);
  let honours=[];try{honours=window.rhV7RecordsFoundation?.honours?.(carId)||[];}catch(_){ }
  return {car:c,info,medal,honours};
 }
 function verifiedMeetings(a,b){
  let rows=[];try{rows=window.otgLegendsQA8118?.rivalryMeetings?.(space())||[];}catch(_){ }
  const x=String(a),y=String(b);
  return rows.filter(r=>(String(r.a)===x&&String(r.b)===y)||(String(r.b)===x&&String(r.a)===y));
 }
 function panelStat(label,value){return `<div class="otgCareerStat8131"><small>${esc(label)}</small><strong>${esc(value)}</strong></div>`;}
 function medalText(m){return m?`${m.gold} 🥇 · ${m.silver} 🥈 · ${m.bronze} 🥉`:'0 🥇 · 0 🥈 · 0 🥉';}
 function careerCard(carId,side){const r=report(carId);return `<div class="otgCareerCard8131"><small>CAR ${side} • VERIFIED HISTORY</small><h3>${esc(carLabel(r.car))}</h3><div class="otgCareerStats8131">${panelStat('Championship victories / honours',r.honours.length)}${panelStat('Tournament medals',medalText(r.medal))}${panelStat('Different competitions',r.info?.events.size||0)}${panelStat('Timed results',r.info?.starts||0)}</div><button type="button" data-otg-history="${esc(carId)}">▤ CAR HISTORY ›</button></div>`;}
 function verdict(a,b,leftWins,rightWins,ties,meetings){
  if(meetings)return leftWins>rightWins?'CAR A LEADS THE DIRECT RIVALRY':rightWins>leftWins?'CAR B LEADS THE DIRECT RIVALRY':'DIRECT RIVALRY LEVEL';
  const l=report(a),r=report(b),lg=l.medal?.gold||0,rg=r.medal?.gold||0;
  if(lg||rg)return lg>rg?'CAR A HAS MORE TOURNAMENT GOLDS':rg>lg?'CAR B HAS MORE TOURNAMENT GOLDS':'TOURNAMENT GOLDS LEVEL — NO HEAD-TO-HEAD YET';
  return 'NO VERIFIED HEAD-TO-HEAD YET';
 }
 function renderCareer(){
  const section=$('#garage .otgIntel8122'),selects=section?.querySelectorAll('.otgIntelCompareSelect8122 select');
  if(!section||!selects||selects.length!==2)return;
  const l=String(selects[0].value),r=String(selects[1].value);
  section.querySelector('.otgCareerRivals8131')?.remove();
  if(!l||!r||l===r)return;
  const meetings=verifiedMeetings(l,r),leftWins=meetings.filter(m=>String(m.winner)===l).length,rightWins=meetings.filter(m=>String(m.winner)===r).length,ties=meetings.length-leftWins-rightWins;
  const latest=meetings.slice().sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0)).slice(0,6);
  const closest=meetings.length?Math.min(...meetings.map(m=>Number(m.gap)||0)).toFixed(3)+'s':'—';
  const panel=document.createElement('section');panel.className='otgCareerRivals8131';
  panel.innerHTML=`<header><small>CAREER RIVALS • VERIFIED RESULTS</small><h2>WHO ACTUALLY HAS THE EDGE?</h2></header><div class="otgCareerDuel8131">${careerCard(l,'A')}${careerCard(r,'B')}</div><div class="otgCareerHeadToHead8131"><h3>⚔️ DIRECT HEAD-TO-HEAD</h3><div>${panelStat('Meetings',meetings.length)}${panelStat('Car A wins',leftWins)}${panelStat('Car B wins',rightWins)}${panelStat('Ties',ties)}${panelStat('Closest margin',closest)}</div><strong>${esc(verdict(l,r,leftWins,rightWins,ties,meetings.length))}</strong><p>One meeting per Festival competition/group; individual Race Off and Swiss matches. Shared-track PBs remain below. This is recorded racing history, not a performance prediction.</p>${latest.length?`<details><summary>LAST ${latest.length} MEETING${latest.length===1?'':'S'} ▾</summary>${latest.map(m=>`<article><small>${esc(m.kind)} • ${esc(m.event)}${m.track?' • '+esc(m.track):''}</small><b>${m.winner?esc(carLabel(cars().find(c=>String(c.id)===String(m.winner))))+' WON':'TIED'} · ${Number(m.gap||0).toFixed(3)}s</b></article>`).join('')}</details>`:'<p>These two have no documented direct meetings yet. Nothing is invented.</p>'}</div>`;
  const anchor=section.querySelector('.otgIntelSideBySide8122');if(anchor)anchor.insertAdjacentElement('afterend',panel);
  panel.addEventListener('click',e=>{const b=e.target.closest('[data-otg-history]');if(b)history(b.dataset.otgHistory)});
 }
 // The original Garage comparison re-renders when selection changes.
 function wrapCompare(name){const original=window[name];if(typeof original!=='function')return;
  window[name]=function(){const result=original.apply(this,arguments);renderCareer();return result;};
 }
 wrapCompare('rhIntelOpen8122');wrapCompare('rhIntelPair8122');
 function init(){attachWatch();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.otgCareerRivalsQA8131={verifiedMeetings,report,decorateDraw,renderCareer};
})();
