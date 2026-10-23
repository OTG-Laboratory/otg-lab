/* OTG! v8.0.60 — FH5 Race Off full-programme setup preview.
   Presentation-only completion of the existing v8.0.56/v8.0.58 Race Off suggestions:
   - Shows the expected knockout path and suggested track for every round before the first draw starts.
   - Uses the same preset rotation as the live Race Off round setup and the same diversified Final helper.
   - The current round remains editable; later live suggestions remain editable when reached.
   - No bracket/draw/result logic is changed. */
(()=>{
'use strict';
const FH5_KEY='fh5-catalogue-v1';
const q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fh5(){try{return rhSpace()?.catalogueKey===FH5_KEY}catch(_){return false}}
function roById(id){try{return (rhSpace()?.raceOffs||[]).find(x=>String(x.id)===String(id))||null}catch(_){return null}}
function pow2Floor(n){let p=1;while(p*2<=n)p*=2;return p}
function mainLabel(n){n=Number(n)||0;if(n===32)return'ROUND OF 32';if(n===16)return'ROUND OF 16';if(n===8)return'QUARTER-FINALS';if(n===4)return'SEMI-FINALS';if(n===2)return'FINAL';return`ROUND OF ${n}`}
function programme(ro,currentTrack=''){
  const count=Math.max(2,Number(ro?.entryIds?.length||ro?.entrants?.length||0));
  const preset=window.rhFH5Preset8056?.(ro?.type,ro?.value,'raceoff');
  if(!preset?.tracks?.length)return null;
  const stages=[];let index=0,field=count;
  const target=pow2Floor(field);
  const trackFor=(i,n)=>{
    if(i===0&&String(currentTrack||'').trim())return String(currentTrack).trim();
    if(n===2){const fin=window.rhFH5Finale8058?.(ro?.type,ro?.value,'raceoff');if(fin)return String(fin)}
    return String(preset.tracks[i%preset.tracks.length]||'').trim();
  };
  if(field>target){stages.push({index,field,label:'PRELIMINARY ROUND',track:trackFor(index,field)});index++;field=target}
  while(field>=2){stages.push({index,field,label:mainLabel(field),track:trackFor(index,field)});if(field===2)break;index++;field=Math.floor(field/2)}
  return {entryCount:count,stages};
}
function row(stage){return `<div class="rhFH5ProgrammeRow8057" data-ro-stage="${stage.index}"><b>${E(stage.label)}</b><span>${E(stage.track)}</span></div>`}
function decorate(id){
  q('rhFH5FullRaceOff8060')?.remove();
  if(!fh5())return;
  const ro=roById(id),idx=Number(ro?.currentRoundIndex||0);if(!ro||idx!==0)return;
  const input=q('rhRaceOffTrack'),plan=programme(ro,input?.value||'');if(!plan?.stages?.length)return;
  const shell=document.querySelector('#raceoff .rhRaceOffRoundSetupV6116');if(!shell)return;
  const sections=[...shell.querySelectorAll(':scope > .rhSection')],anchor=sections[1]||sections[0];if(!anchor)return;
  const sec=document.createElement('section');sec.id='rhFH5FullRaceOff8060';sec.className='rhSetupPanelV1 rhFH5FullGroups8057 rhFH5FullRaceOff8060';
  sec.innerHTML=`<div class="rhSetupPanelHeadV1"><div><b>FULL RACE OFF PROGRAMME</b><p>OTG! has planned the suggested route from the opening round through the Race Off Final.</p></div><strong>AUTO-SUGGESTED</strong></div>${plan.stages.map(row).join('')}<p class="small" style="padding:0 12px 12px;margin:0">Later-round tracks are filled automatically when you reach them. Every suggestion remains editable before REVIEW DRAW.</p>`;
  anchor.insertAdjacentElement('afterend',sec);
  if(input&&!input.dataset.rhFullRaceOff8060){input.dataset.rhFullRaceOff8060='1';input.addEventListener('input',()=>{const span=q('rhFH5FullRaceOff8060')?.querySelector('[data-ro-stage="0"] span');if(span)span.textContent=String(input.value||'').trim()||'—';});}
}
const baseOpen=window.rhRaceOffOpenRoundSetup;
if(typeof baseOpen==='function')window.rhRaceOffOpenRoundSetup=function(id){const out=baseOpen.apply(this,arguments);decorate(id);return out};
window.rhFH5RaceOffFullProgram8060=(type,value,count,currentTrack='')=>programme({type,value,entryIds:Array.from({length:Math.max(2,Number(count)||2)})},currentTrack);
})();
