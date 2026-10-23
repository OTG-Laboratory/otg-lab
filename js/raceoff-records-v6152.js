/* OTG! v6.0.152 — Race Off records bridge + Hubs-free record celebration.
   Single-run Race Off results can set Race Off, Track and Personal Best records.
   Advanced Timing/lap results remain excluded from records. */
(()=>{
'use strict';
const Q=id=>document.getElementById(id);
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const norm=v=>String(v??'').trim().replace(/\s+/g,' ').toLowerCase();
const key=(track,layout='')=>`${norm(track)}||${norm(layout)}`;
const cid=c=>String(c?.sourceCarId||c?.id||c||'');
const finite=v=>Number.isFinite(Number(v))&&Number(v)>0;
function fmt(v){if(!finite(v))return '—';const t=Number(v),m=Math.floor(t/60),s=Math.floor(t%60),ms=Math.round((t-Math.floor(t))*1000);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;}
function store(){const s=typeof rhSpace==='function'?rhSpace():null;if(s&&!Array.isArray(s.raceOffs))s.raceOffs=[];return s?.raceOffs||[];}
function find(id){return store().find(x=>String(x.id)===String(id));}
function parseEntry(){const m=Number(Q('rhRaceOffMin')?.value||0),s=Number(Q('rhRaceOffSec')?.value||0),ms=Number((Q('rhRaceOffMs')?.value||'0').padEnd(3,'0'));if(!Number.isFinite(m)||!Number.isFinite(s)||!Number.isFinite(ms)||m<0||s<0||s>59||ms<0||ms>999)return 0;return m*60+s+ms/1000;}
function localRows(ro,track,layout){const k=key(track,layout),out=[];(ro?.rounds||[]).forEach(rd=>(rd?.matches||[]).forEach(match=>[match?.resultA,match?.resultB].forEach(res=>{if(!res||res.advancedTiming||!finite(res.time))return;const rk=key(res.track||rd?.name||'',res.layout||rd?.layout||'');if(rk===k)out.push(res);})));return out;}
function allRows(){try{return window.rhTrackTargetsV6143?.allResults?.()||[]}catch(_){return[]}}
function best(rows){return rows.length?Math.min(...rows.map(x=>Number(x.time)).filter(finite)):null;}
function snapshot(ro,rd,carId,time){
  const track=String(rd?.name||'').trim(),layout=String(rd?.layout||'').trim(),k=key(track,layout),all=allRows().filter(x=>x.trackKey===k),local=localRows(ro,track,layout),mine=all.filter(x=>String(x.carId)===String(carId));
  const localBest=best(local),trackBest=best(all),pbBest=best(mine);
  return {track,layout,time,localBest,trackBest,pbBest,raceOffRecord:localBest!=null&&time<localBest,trackRecord:trackBest!=null&&time<trackBest,personalBest:pbBest!=null&&time<pbBest};
}
function card(label,tone='silver'){return `<article class="rhRORecordCardV6151 ${tone}"><span>★</span><div><small>NEW RECORD</small><b>${E(label)}</b><em>NEW BEST TIME</em></div></article>`;}
function quote(flags){if(flags.trackRecord&&flags.personalBest)return 'That was seriously quick. You have reset the track benchmark and your own best.';if(flags.trackRecord)return 'That is the quickest eligible time OTG! has recorded on this track.';if(flags.personalBest)return 'Excellent work. That is your quickest eligible time here.';return 'Excellent work. That is the quickest time in this Race Off.';}
function showRecord(flags,ro,rd,res,side,i,matchId){
  if(!(flags.raceOffRecord||flags.trackRecord||flags.personalBest))return;
  Q('rhRaceOffTransitionV6119')?.remove();Q('rhRaceOffRecordV6151')?.remove();
  const prev=flags.trackRecord?flags.trackBest:flags.personalBest?flags.pbBest:flags.localBest,improvement=prev!=null?Math.max(0,prev-Number(res.time||0)):null;
  document.body.insertAdjacentHTML('beforeend',`<div id="rhRaceOffRecordV6151" class="rhOverlay rhRORecordOverlayV6151"><section class="rhRORecordModalV6151"><header><small>NEW RECORD</small><h2>NEW RACE OFF RECORD</h2></header><div class="rhRORecordCardsV6151">${flags.raceOffRecord?card('RACE OFF RECORD'):''}${flags.trackRecord?card('TRACK RECORD','gold'):''}${flags.personalBest?card('YOUR PB','cyan'):''}</div><div class="rhRORecordTimeV6151"><small>YOUR NEW BEST TIME</small><strong>${fmt(res.time)}</strong>${prev!=null?`<small>PREVIOUS BEST</small><b>${fmt(prev)}</b>${improvement>0?`<em>−${fmt(improvement)}</em>`:''}`:''}</div><blockquote>“${E(quote(flags))}”</blockquote><button class="btn" id="rhRORecordContinueV6151">CONTINUE RACE OFF</button></section></div>`);
  Q('rhRORecordContinueV6151')?.addEventListener('click',()=>{Q('rhRaceOffRecordV6151')?.remove();if(side==='A')window.rhRaceOffCarTransition?.(ro.id,i,matchId);});
}
const save=window.rhRaceOffSaveMatchResult;
if(typeof save!=='function')return;
window.rhRaceOffSaveMatchResult=function(id,i,matchId,side){
  const ro=find(id),rd=ro?.rounds?.[Number(i)||0],match=rd?.matches?.find(x=>String(x.id)===String(matchId)),car=side==='A'?match?.carA:match?.carB,time=parseEntry();
  if(!ro||!rd||!match||!car||!finite(time))return save.apply(this,arguments);
  // Race Off currently uses single-run timing here. Future lap/Advanced Timing payloads are excluded by the Records/targets collectors.
  const flags=snapshot(ro,rd,cid(car),time),out=save.apply(this,arguments),saved=(side==='A'?match.resultA:match.resultB);
  if(saved&&!saved.advancedTiming){saved.raceOffRecord=flags.raceOffRecord;saved.trackRecord=flags.trackRecord;saved.personalBest=flags.personalBest;try{rhSave()}catch(_){}showRecord(flags,ro,rd,saved,side,Number(i)||0,matchId);}
  return out;
};
})();
