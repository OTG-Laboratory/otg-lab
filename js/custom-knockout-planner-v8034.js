/* OTG! v8.0.34 — Custom Knockout Competition Planner foundation. */
(()=>{
'use strict';
const previousCreate=window.rhCreateEvent;
const previousSetup=window.rhEventSetupHtml;
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function pow2Floor(n){let p=1;while(p*2<=n)p*=2;return p;}
function roundLabel(n){return n===2?'FINAL':n===4?'SEMI-FINAL':n===8?'QUARTER-FINAL':`ROUND OF ${n}`;}
function koPlan(n){
 n=Math.max(0,Number(n)||0);
 if(n<2)return null;
 const main=pow2Floor(n);
 const prelimMatches=n-main;
 const straight=main-prelimMatches;
 const stages=[];
 if(prelimMatches>0)stages.push({label:'PRELIMINARY ROUND',matches:prelimMatches,note:`${straight} straight through to ${roundLabel(main)}`});
 let s=main;
 while(s>=2){stages.push({label:roundLabel(s),matches:s/2,note:s===2?'Champion decided':`${s/2} advance`});s/=2;}
 return {entrants:n,main,prelimMatches,straight,totalMatches:n-1,stages};
}
function stagesHtml(p){return p.stages.map((s,i)=>`<div class="rhKOStage8034"><span><small>${i===0&&p.prelimMatches?'OPENING STAGE':''}</small><b>${esc(s.label)}</b><em>${esc(s.note)}</em></span><strong>${s.matches}<small>MATCH${s.matches===1?'':'ES'}</small></strong></div>`).join('');}
window.rhCreateEvent=function(){
 previousCreate();
 const wrap=document.querySelector('#rhEventEditor .rhFormatPick8025');
 if(!wrap||wrap.querySelector('[data-format="knockout"]'))return;
 const groups=wrap.querySelector('[data-format="groups"]');
 if(!groups)return;
 const b=document.createElement('button');
 b.type='button';b.dataset.format='knockout';b.innerHTML='KNOCKOUT<small>Head-to-head elimination bracket</small>';
 groups.insertAdjacentElement('afterend',b);
 // Rebind all live format buttons because the v8.0.25 closure only knew the original set.
 wrap.querySelectorAll('button[data-format]').forEach(btn=>btn.onclick=()=>{
   wrap.querySelectorAll('button[data-format]').forEach(x=>x.classList.remove('active'));
   btn.classList.add('active');
   const hidden=wrap.querySelector('#rhEventFormat8025');if(hidden)hidden.value=btn.dataset.format;
 });
};
window.rhEventSetupHtml=function(e){
 const html=previousSetup(e);
 if((e.competitionFormat||'standard')!=='knockout')return html;
 const n=Number(window.rhEventRacerCount?.(e)||0), p=koPlan(n);
 const chosen=(window.rhEventChosenCars?.(e)||[]).length;
 const valid=p&&n<=64;
 const planner=`<section class="rhSection rhKOPlanner8034"><div class="rhEventSectionHead"><div><h2>Knockout Structure</h2><p class="small">OTG! has built the cleanest bracket for ${n} selected racer${n===1?'':'s'}.</p></div><span class="rhFormatBadge8025">KNOCKOUT</span></div>${!p?'<div class="empty">Choose at least 2 racers to build a Knockout bracket.</div>':n>64?'<div class="empty">Custom Knockout currently supports up to 64 racers. Reduce the field to continue.</div>':`<div class="rhKOSummary8034"><div><b>${p.entrants}</b><small>ENTRANTS</small></div><div><b>${p.prelimMatches}</b><small>PRELIM MATCHES</small></div><div><b>${p.totalMatches}</b><small>TOTAL MATCHES</small></div></div>${stagesHtml(p)}<p class="small">Odd fields are handled automatically with preliminary matches and straight-through places. START freezes the entrants and bracket.</p>`}</section>`;
 let out=html;
 // Replace Standard rounds section with the knockout plan: KO tracks are chosen round-by-round once race flow is wired.
 out=out.replace(/<section class="rhSection"><h2>Rounds<\/h2>[\s\S]*?<\/section>/,planner);
 const ready=valid&&chosen===n;
 out=out.replace(/<button class="btn rhStartEvent"[\s\S]*?<\/button><p class="small rhStartNote">[\s\S]*?<\/p>/,`<button class="btn rhStartEvent" disabled>START KNOCKOUT EVENT</button><p class="small rhStartNote">${ready?'Bracket ready. Knockout race-flow wiring is the next build.':'Choose the full entrant field before START.'}</p>`);
 return out;
};
window.rhCustomKOPlan8034=koPlan;
})();
