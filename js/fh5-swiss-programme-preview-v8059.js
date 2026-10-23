/* OTG! v8.0.59 — FH5 Swiss full-programme setup preview.
   Presentation-only completion of the v8.0.58 Swiss route planning:
   - Shows configured Swiss rounds plus every expected knockout round and Final before START.
   - Uses the same v8.0.58 suggestion helper as the live knockout flow.
   - Preview follows the selected knockout cut and any edited Swiss-stage track names.
   - Suggestions remain editable when each live knockout stage is reached. */
(()=>{
'use strict';
const FH5_KEY='fh5-catalogue-v1';
const q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function uniq(a){const out=[],seen=new Set();for(const x of a||[]){const v=String(x||'').trim();if(v&&!seen.has(v)){seen.add(v);out.push(v)}}return out}
function koLabel(n){n=Number(n)||0;return n===2?'FINAL':n===4?'SEMI-FINAL':n===8?'QUARTER-FINAL':`ROUND OF ${n}`}
function swissProgram(type,value,swissTracks,cut){
  const opening=uniq(swissTracks||[]),start=Math.max(0,Number(cut)||0);
  if(!opening.length||start<2||typeof window.rhFH5SwissKOTrack8058!=='function')return null;
  const used=[...opening],knockout=[];
  for(let n=start;n>=2;n=Math.floor(n/2)){
    const track=String(window.rhFH5SwissKOTrack8058(type,value,n,used)||'').trim();
    if(!track)return null;
    knockout.push({participants:n,label:koLabel(n),track});
    used.push(track);
    if(n===2)break;
  }
  return {swiss:[...opening],knockout};
}
function row(label,tracks){return `<div class="rhFH5ProgrammeRow8057"><b>${E(label)}</b><span>${(tracks||[]).map(E).join(' <em>›</em> ')}</span></div>`}
function decorateSwissPreview(){
  if(!fh5()||typeof rhSetup==='undefined'||!rhSetup?.v8SwissMode)return;
  q('rhFH5FullSwiss8059')?.remove();
  const swissTracks=(rhSetup.rounds||[]).map(x=>x?.name).filter(Boolean),cut=Number(rhSetup.v8SwissPlan?.knockoutSize)||0;
  const plan=swissProgram(rhSetup.type,rhSetup.value,swissTracks,cut);if(!plan)return;
  const anchor=q('rhFH5Preset8056')||document.querySelector('#festival .v8051SwissPlanner')||document.querySelector('#festival .v8FormatPanel');if(!anchor)return;
  const sec=document.createElement('section');sec.id='rhFH5FullSwiss8059';sec.className='rhSetupPanelV1 rhFH5FullGroups8057 rhFH5FullSwiss8059';
  sec.innerHTML=`<div class="rhSetupPanelHeadV1"><div><b>FULL SWISS PROGRAMME</b><p>OTG! has planned the suggested route from the Swiss stage through the Championship Final.</p></div><strong>AUTO-SUGGESTED</strong></div>${row('SWISS STAGE',plan.swiss)}${plan.knockout.map(x=>row(x.label,[x.track])).join('')}<p class="small">Knockout tracks are filled automatically when you reach them. Every suggestion remains editable before that knockout round starts.</p>`;
  anchor.insertAdjacentElement('afterend',sec);
}
const baseRenderSetup=window.rhRenderSetup;
if(typeof baseRenderSetup==='function')window.rhRenderSetup=function(){const out=baseRenderSetup.apply(this,arguments);decorateSwissPreview();return out};
const baseRefresh=window.rhRefreshSetupEntryUi;
if(typeof baseRefresh==='function')window.rhRefreshSetupEntryUi=function(){const out=baseRefresh.apply(this,arguments);decorateSwissPreview();return out};
window.rhFH5SwissFullProgram8059=(type,value,swissTracks,cut)=>swissProgram(type,value,swissTracks,cut);
})();
