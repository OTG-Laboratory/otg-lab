/* OTG! v6.0.155 — Race Off records bridge using the approved OTG! record celebration framework.
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
function snapshot(ro,rd,carId,time){const track=String(rd?.name||'').trim(),layout=String(rd?.layout||'').trim(),k=key(track,layout),all=allRows().filter(x=>x.trackKey===k),local=localRows(ro,track,layout),mine=all.filter(x=>String(x.carId)===String(carId));const localBest=best(local),trackBest=best(all),pbBest=best(mine);return {track,layout,time,localBest,trackBest,pbBest,raceOffRecord:localBest!=null&&time<localBest,trackRecord:trackBest!=null&&time<trackBest,personalBest:pbBest!=null&&time<pbBest};}
const REC_SEG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
function segDigit(ch){const on=REC_SEG[ch]||'';return `<i class="rhSegDigit" aria-hidden="true">${'abcdefg'.split('').map(x=>`<span class="s${x} ${on.includes(x)?'on':''}"></span>`).join('')}</i>`;}
function segTime(value){const t=fmt(value),m=t.slice(0,2),sec=t.slice(3,5),ms=t.slice(6),group=v=>v.split('').map(segDigit).join('');return `<span class="rhSegTime rhRecordGoldSeg" aria-label="${t}">${group(m)}<em>:</em>${group(sec)}<em>.</em>${group(ms)}</span>`;}
function showRecord(flags,ro,rd,res,side,i,matchId){
  if(!(flags.raceOffRecord||flags.trackRecord||flags.personalBest))return;
  Q('rhRaceOffTransitionV6119')?.remove();Q('rhRaceOffRecordV6155')?.remove();
  const previous=flags.trackRecord?flags.trackBest:flags.personalBest?flags.pbBest:flags.localBest;
  const improvement=previous!=null?Math.max(0,previous-Number(res.time||0)):null;
  const standings=()=>{Q('rhRaceOffRecordV6155')?.remove();try{window.rhRaceOffOpen?.(ro.id)}catch(_){window.rhRenderRaceOff?.();}};
  const proceed=()=>{Q('rhRaceOffRecordV6155')?.remove();if(side==='A')window.rhRaceOffCarTransition?.(ro.id,i,matchId);};
  document.body.insertAdjacentHTML('beforeend',`<div id="rhRaceOffRecordV6155" class="rhRORecordApprovedV6155"><div class="rhRecord127Page rhRORecordPageV6155">
    <div class="rhRecord127Hero rhRORecordHeroV6155"><img src="assets/final/record-celebration-hero-v6127.png?v=6127" alt="OTG! record celebration"><button class="rhRecord127Back" id="rhRORecordBackV6155" aria-label="Back"></button><div class="rhROHeroTitleV6155"><small>NEW RACE OFF RECORD!</small><b>RACE OFF<br>RECORD</b></div><div class="rhROHeroLocalV6155">RACE OFF<br>RECORD</div>${!flags.trackRecord?'<span class="rhRecord127HideGold"></span>':''}</div>
    <main class="rhRecord127Main"><section class="rhRecord127Best"><b>YOUR NEW BEST TIME</b><div>${segTime(res.time)}</div></section>${previous!=null?`<section class="rhRecord127Stat previous"><span class="rhRecord127Icon">◷</span><div><small>PREVIOUS BEST</small><b>${fmt(previous)}</b></div></section><section class="rhRecord127Stat improvement"><span class="rhRecord127Icon">↗</span><div><small>IMPROVEMENT</small><b>−${fmt(improvement)}</b></div></section>`:''}</main>
    <footer class="rhRecord127Actions"><button id="rhRORecordStandingsV6155"><span>🏆</span><b>VIEW CURRENT<br>STANDINGS</b></button><button id="rhRORecordContinueV6155"><span>🏁</span><b>CONTINUE RACE OFF</b></button></footer>
  </div></div>`);
  Q('rhRORecordBackV6155')?.addEventListener('click',standings);Q('rhRORecordStandingsV6155')?.addEventListener('click',standings);Q('rhRORecordContinueV6155')?.addEventListener('click',proceed);window.scrollTo(0,0);
}
const save=window.rhRaceOffSaveMatchResult;if(typeof save!=='function')return;
window.rhRaceOffSaveMatchResult=function(id,i,matchId,side){const ro=find(id),rd=ro?.rounds?.[Number(i)||0],match=rd?.matches?.find(x=>String(x.id)===String(matchId)),car=side==='A'?match?.carA:match?.carB,time=parseEntry();if(!ro||!rd||!match||!car||!finite(time))return save.apply(this,arguments);const flags=snapshot(ro,rd,cid(car),time),out=save.apply(this,arguments),saved=(side==='A'?match.resultA:match.resultB);if(saved&&!saved.advancedTiming){saved.raceOffRecord=flags.raceOffRecord;saved.trackRecord=flags.trackRecord;saved.personalBest=flags.personalBest;try{rhSave()}catch(_){}showRecord(flags,ro,rd,saved,side,Number(i)||0,matchId);}return out;};
})();
