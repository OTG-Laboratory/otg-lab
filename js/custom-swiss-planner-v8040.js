/* OTG! v8.0.55 — Custom Swiss planner: 8+ entrants, 3/4-round recommendations, unlimited advanced override. */
(()=>{
'use strict';
const previousCreate=window.rhCreateEvent;
const previousSetup=window.rhEventSetupHtml;
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function getEvent(id){return (window.rhSpace?.().customEvents||[]).find(e=>e.id===id);}
function defaultRounds(n){return Number(n)>=65?4:3;}
function koCuts(n){const a=[];[4,8,16].forEach(x=>{if(x<=n)a.push(x);});return a;}
function plan(n){
 n=Number(n)||0;if(n<8)return null;
 const rec=defaultRounds(n),rounds=[rec];
 const cuts=koCuts(n);const recCut=n>=12&&cuts.includes(8)?8:cuts[cuts.length-1]||4;
 return {n,rec,rounds,cuts,recCut,odd:n%2===1};
}
window.rhSetSwissPlan8040=function(id,rounds,cut){const e=getEvent(id);if(!e||window.rhEventIsStarted?.(e))return;rounds=Math.max(1,Math.trunc(Number(rounds)||0));e.swissPlan={rounds,knockoutSize:Number(cut)};window.rhSave?.();window.rhOpenEvent?.(id);};
window.rhSetSwissCustomRounds8055=function(id){const e=getEvent(id);if(!e||window.rhEventIsStarted?.(e))return;const p=plan(window.rhEventRacerCount?.(e)||0);if(!p)return;const input=document.getElementById('rhSwissCustomRounds8055'),rounds=Math.trunc(Number(input?.value));if(!Number.isFinite(rounds)||rounds<=p.rec)return window.toast?.(`Choose more than ${p.rec} Swiss rounds`);const cut=Number(e.swissPlan?.knockoutSize||p.recCut);window.rhSetSwissPlan8040(id,rounds,cut);};
window.rhCreateEvent=function(){
 previousCreate();
 const wrap=document.querySelector('#rhEventEditor .rhFormatPick8025');if(!wrap)return;
 let swiss=[...wrap.querySelectorAll('button')].find(b=>/SWISS/.test(b.textContent));if(!swiss)return;
 swiss.disabled=false;swiss.dataset.format='swiss';swiss.innerHTML='SWISS<small>League pairings into a knockout finish</small>';
 wrap.querySelectorAll('button[data-format]').forEach(btn=>btn.onclick=()=>{wrap.querySelectorAll('button[data-format]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const h=wrap.querySelector('#rhEventFormat8025');if(h)h.value=btn.dataset.format;});
};
window.rhEventSetupHtml=function(e){
 const html=previousSetup(e);if((e.competitionFormat||'standard')!=='swiss')return html;
 const n=Number(window.rhEventRacerCount?.(e)||0),chosen=(window.rhEventChosenCars?.(e)||[]).length,p=plan(n);
 const selected=e.swissPlan||(p?{rounds:p.rec,knockoutSize:p.recCut}:null);
 let body='';
 if(!p){body=`<div class="empty">Swiss supports 8+ racers with no upper entrant cap.</div>`;}
 else {
   const selectedRounds=Math.max(1,Number(selected?.rounds)||p.rec),isAdvanced=selectedRounds>p.rec;
   const roundBtns=`<button type="button" class="rhSwissChoice8040 ${!isAdvanced?'selected':''}" onclick="rhSetSwissPlan8040('${esc(e.id)}',${p.rec},${selected?.knockoutSize||p.recCut})">${p.rec} ROUNDS<small>RECOMMENDED FOR ${n<=64?'8–64':'65+'}</small></button>`;
   const cutBtns=p.cuts.map(c=>`<button type="button" class="rhSwissChoice8040 ${selected?.knockoutSize===c?'selected':''}" onclick="rhSetSwissPlan8040('${esc(e.id)}',${selectedRounds},${c})">TOP ${c}<small>TO KNOCKOUT</small></button>`).join('');
   body=`<div class="rhSwissSummary8040"><div><b>${n}</b><small>ENTRANTS</small></div><div><b>${selectedRounds}</b><small>SWISS ROUNDS</small></div><div><b>${selected?.knockoutSize||p.recCut}</b><small>QUALIFY</small></div></div>
   <h3>Swiss Rounds</h3><div class="rhSwissChoices8040">${roundBtns}</div>
   <details class="rhSwissRules8040" ${isAdvanced?'open':''}><summary><b>ADVANCED / CUSTOM ROUNDS</b></summary><span>Use more Swiss rounds if you want a longer league stage. There is no configured-round ceiling.</span><div class="rhSwissChoices8040"><input id="rhSwissCustomRounds8055" class="rhSwissChoice8040" style="grid-column:span 2" type="number" inputmode="numeric" min="${p.rec+1}" step="1" value="${isAdvanced?selectedRounds:p.rec+1}" aria-label="Custom Swiss rounds"><button type="button" class="rhSwissChoice8040" onclick="rhSetSwissCustomRounds8055('${esc(e.id)}')">USE CUSTOM ROUNDS</button></div></details>
   <h3>Knockout Cut</h3><div class="rhSwissChoices8040">${cutBtns}</div>
   <div class="rhSwissRules8040"><b>HOW OTG! WILL RUN IT</b><span>• One track per Swiss round, chosen when that round starts.</span><span>• Pair cars on equal/near-equal records and avoid rematches.</span><span>• Standings: Wins → Opponent Wins → Total Time.</span><span>• ${p.odd?'Odd field: one rotating bye each round; no repeat bye until necessary.':'Even field: every racer gets an opponent each round.'}</span><span>• After the Swiss rounds, the Top ${selected?.knockoutSize||p.recCut} enter a normal knockout bracket.</span></div>`;
 }
 const planner=`<section class="rhSection rhSwissPlanner8040"><div class="rhEventSectionHead"><div><h2>Swiss Structure</h2><p class="small">Swiss supports any field of 8 or more racers. OTG! recommends ${p?.rec||3} rounds for this field, with Advanced available for more.</p></div><span class="rhFormatBadge8025">SWISS</span></div>${body}</section>`;
 let out=html.replace(/<section class="rhSection"><h2>Rounds<\/h2>[\s\S]*?<\/section>/,planner);
 const ready=!!p&&chosen===n&&Number(selected?.rounds)>0&&selected?.knockoutSize;
 out=out.replace(/<button class="btn rhStartEvent"[\s\S]*?<\/button><p class="small rhStartNote">[\s\S]*?<\/p>/,`<button class="btn rhStartEvent" disabled>START SWISS EVENT</button><p class="small rhStartNote">${ready?'Swiss structure ready. Race-flow wiring is the next build.':'Choose the full entrant field and Swiss structure before START.'}</p>`);
 return out;
};
window.rhCustomSwissPlan8040=plan;
})();
