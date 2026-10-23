/* OTG! v8.0.25 — Custom Competition Planner foundation: Standard / Groups setup + balanced structure choices. */
(()=>{
'use strict';
const baseCreate=window.rhCreateEvent, baseSave=window.rhSaveNewEvent, baseSetup=window.rhEventSetupHtml;
const getEvent=id=>rhSpace().customEvents.find(x=>x.id===id);
function balance(n,g){const q=Math.floor(n/g),r=n%g;return Array.from({length:g},(_,i)=>q+(i<r?1:0));}
function groupOptions(n){
 const out=[];
 // Sensible direct group structures: target 4–8 cars, groups differ by at most one.
 for(let g=2;g<=Math.min(8,Math.floor(n/2));g++){
  const sizes=balance(n,g),min=Math.min(...sizes),max=Math.max(...sizes);
  if(min<4||max>8)continue;
  const qualifiers=g*2;
  out.push({g,sizes,qualifiers,score:Math.abs(6.5-(n/g)) + (qualifiers>Math.ceil(n*.7)?2:0)});
 }
 out.sort((a,b)=>a.score-b.score||a.g-b.g);
 return out.slice(0,3);
}
function fmtSizes(s){const counts={};s.forEach(x=>counts[x]=(counts[x]||0)+1);return Object.keys(counts).sort((a,b)=>b-a).map(k=>counts[k]>1?`${counts[k]} × ${k}`:k).join('  •  ');}
window.rhCreateEvent=function(){
 baseCreate();
 const modal=document.querySelector('#rhEventEditor .rhFormModal'); if(!modal)return;
 const count=modal.querySelector('.rhNumberPicker'); if(!count)return;
 const wrap=document.createElement('div');wrap.className='rhFormatPick8025';wrap.innerHTML=`<label>Competition Format</label><div class="rhFormatButtons8025"><button type="button" class="active" data-format="standard">STANDARD<small>Traditional Custom event</small></button><button type="button" data-format="groups">GROUPS<small>Qualify through balanced groups</small></button><button type="button" disabled>SWISS<small>Coming in the Swiss build</small></button></div><input type="hidden" id="rhEventFormat8025" value="standard">`;
 count.parentNode.insertBefore(wrap,count);
 wrap.querySelectorAll('button[data-format]').forEach(b=>b.onclick=()=>{wrap.querySelectorAll('button[data-format]').forEach(x=>x.classList.remove('active'));b.classList.add('active');wrap.querySelector('#rhEventFormat8025').value=b.dataset.format;});
};
window.rhSaveNewEvent=function(){
 const format=document.getElementById('rhEventFormat8025')?.value||'standard';
 const before=new Set(rhSpace().customEvents.map(e=>e.id));
 baseSave();
 const e=rhSpace().customEvents.find(x=>!before.has(x.id));
 if(e){e.competitionFormat=format;e.groupPlan=null;rhSave();}
};
window.rhSetGroupPlan8025=function(id,g){const e=getEvent(id);if(!e||rhEventIsStarted(e))return;const opt=groupOptions(rhEventRacerCount(e)).find(x=>x.g===Number(g));if(!opt)return;e.groupPlan={groupCount:opt.g,sizes:opt.sizes,qualifiers:opt.qualifiers};rhSave();rhOpenEvent(id);};
window.rhEventSetupHtml=function(e){
 const html=baseSetup(e); if((e.competitionFormat||'standard')!=='groups')return html;
 const chosen=rhEventChosenCars(e),opts=groupOptions(rhEventRacerCount(e));
 const selected=e.groupPlan?.groupCount;
 const cards=opts.length?opts.map((o,i)=>`<button class="rhGroupPlanCard8025 ${selected===o.g?'selected':''}" onclick="rhSetGroupPlan8025('${e.id}',${o.g})"><span>${i===0?'<em>RECOMMENDED</em>':''}<b>${o.g} GROUPS</b><small>${fmtSizes(o.sizes)} cars</small></span><strong>TOP 2<small>${o.qualifiers} qualify</small></strong></button>`).join(''):`<div class="empty">Choose between 8 and 64 racers for a Groups event. OTG! will then offer sensible balanced structures.</div>`;
 const planner=`<section class="rhSection rhGroupPlanner8025"><div class="rhEventSectionHead"><div><h2>Group Structure</h2><p class="small">OTG! has worked out sensible structures for ${rhEventRacerCount(e)} racers.</p></div><span class="rhFormatBadge8025">GROUPS</span></div>${cards}<p class="small">Group sizes are balanced as evenly as possible. The selected structure freezes when the Event starts.</p></section>`;
 let out=html.replace('<section class="rhSection"><h2>Rounds</h2>',planner+'<section class="rhSection"><h2>Rounds</h2>');
 // Foundation build: do not let Groups enter the old Standard execution engine.
 out=out.replace(/<button class="btn rhStartEvent"[^>]*onclick="rhStartEvent\('\Q/g,'$&');
 const startNeed=chosen.length===e.racerCount&&e.rounds.length&&selected;
 out=out.replace(/<button class="btn rhStartEvent"[\s\S]*?<\/button><p class="small rhStartNote">Starting freezes the selected racers and Rounds for this Event\.<\/p>/,`<button class="btn rhStartEvent" disabled>START GROUPS EVENT</button><p class="small rhStartNote">${startNeed?'Structure selected. Groups race-flow wiring is the next build.':'Choose all racers and a Group Structure before START.'}</p>`);
 return out;
};
})();
