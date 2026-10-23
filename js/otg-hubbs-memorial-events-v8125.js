/* OTG! v8.0.125 — Hubbs Memorial Trophy RETURNS as a genuine TET competition.
 * Injects 3 separate ecosystem-safe Festival divisions + seven final-encore
 * visits into the read-only campaign catalogue BEFORE the live R1 engine loads.
 * The original 1,165 source visit records, historic 1,212 live slot numbers,
 * all saved R1 DONE keys, active runs, Spaces, Garage and results are unchanged.
 */
(()=>{
 'use strict';
 const d=window.rhEvilSpecialistR18097;
 if(!d?.slots||!d?.cars||!d?.events)return;
 if(d.events['HUBBS-N-F'])return;
 // A lonely heart is a manufacturer with precisely one FH5 car in the
 // original, approved 697-car frozen garage — across ALL five ecosystems.
 const makeCounts=new Map();
 for(const c of d.cars){const key=String(c.make||'').trim().toLowerCase();makeCounts.set(key,(makeCounts.get(key)||0)+1);}
 const lonely=d.cars.filter(c=>makeCounts.get(String(c.make||'').trim().toLowerCase())===1);
 const rows=[
  {id:'HUBBS-N-F',ecosystem:'NORMAL',name:'Hubbs Memorial Trophy — Road Outsiders',pool:'ROAD / STREET',format:'GROUPS',finale:'The Marathon',cars:lonely.filter(c=>c.ecosystem==='NORMAL')},
  {id:'HUBBS-RC-F',ecosystem:'RACE',name:'Hubbs Memorial Trophy — Race Rebels',pool:'ROAD / STREET',format:'STANDARD',finale:'The Colossus',cars:lonely.filter(c=>c.ecosystem==='RACE')},
  {id:'HUBBS-OR-F',ecosystem:'OFF-ROAD / BUGGY',name:'Hubbs Memorial Trophy — Dirt Misfits',pool:'OFF-ROAD',format:'STANDARD',finale:'The Gauntlet',cars:lonely.filter(c=>c.ecosystem==='OFF-ROAD / BUGGY')},
 ];
 // Hard safety gate: do not produce an invalid 7-visit competition after
 // a catalogue change. Neither existing slots nor existing events are edited.
 if(rows.map(x=>x.cars.length).join(',')!=='28,5,12'||lonely.length!==45){
  console.warn('Hubbs Memorial: exact frozen single-manufacturer field changed; no schedule injected.');return;
 }
 const visit=(division,i,total,work,doNow,stopWhen)=>({
  slot:1166+d.slots.filter(s=>String(s.eventId||'').startsWith('HUBBS-')).length,
  phase:'07 • HUBBS MEMORIAL AFTER HOURS',ecosystem:division.ecosystem,
  eventId:division.id,mode:'Festival',family:'Hubbs Memorial Trophy',event:division.name,
  eligible:division.cars.length,liveFormat:division.format,visit:`${i}/${total}`,
  doNow,stopWhen,programme:'RANDOMISE ALL',pool:division.pool,workload:work,
  notes:'HUBBS MEMORIAL: One-car manufacturers only. Ecosystems never mix. All original TET slots and existing racing history remain untouched.'
 });
 for(const v of rows){
  d.events[v.id]={id:v.id,ecosystem:v.ecosystem,mode:'Festival',family:'Hubbs Memorial Trophy',
   event:v.name,pool:v.pool,formatRule:v.format,protectedFinale:v.finale,
   eligibilityRule:'Exactly the single-car manufacturers from the frozen 697-car FH5 catalogue in this ecosystem; no mixing road cars, dedicated race cars or off-road specialists.',
   notes:'HUBBS MEMORIAL • The Lonely Hearts legend returns as a real race, with three separate divisions and three earned champions.',
   eligible:v.cars.length,eligibleIds:v.cars.map(c=>String(c.id))};
 }
 const [road,race,offroad]=rows;
 const additions=[
  ...Array.from({length:4},(_,i)=>visit(road,i+1,5,14,`DRAW & RUN STAGE 1 GROUP ${i+1}/4 • 7 CARS × 2 RANDOM TRACKS`,'Run this complete group, bank the Top 2, then PARK IT.')),
  visit(race,1,1,10,'RACE REBELS • 5 CARS × 2 ROAD / STREET ROUNDS','Crown the RACE specialist champion; do not race the Normal or Off-Road entrants on this course.'),
  visit(offroad,1,1,24,'DIRT MISFITS • 12 CARS × 2 DIRT / CROSS COUNTRY ROUNDS','Crown the OFF-ROAD specialist champion; no road finales.'),
  visit(road,5,5,16,'RUN THE FINAL • 8 QUALIFIERS × 2 TRACKS','Crown the NORMAL road champion and complete the Hubbs Memorial Trophy.'),
 ];
 const before=d.slots.length;
 if(before!==1165)return;
 additions.forEach((s,i)=>{s.slot=before+i+1;d.slots.push(s);});
 d.meta.eventCards+=3;
 d.meta.slots+=7;
 d.meta.hubbsMemorial={divisionEvents:3,visits:7,entrants:45,format:'NORMAL GROUPS + RACE STANDARD + OFF-ROAD STANDARD',slotPolicy:'APPEND-ONLY after existing 1212 TET slots; positions depend on favourite finals sizes.'};
 window.rhHubbsMemorial125={name:'HUBBS MEMORIAL TROPHY',fields:rows.map(v=>({id:v.id,ecosystem:v.ecosystem,count:v.cars.length,ids:v.cars.map(c=>c.id)})),addedSlots:7};
})();
