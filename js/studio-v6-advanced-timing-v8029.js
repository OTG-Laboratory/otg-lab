/* OTG! v6.0.15 — Stage 8B corrected Advanced Timing implementation.
   Built only from protected v6.0.13. Locked presentation: compact digital lap rows,
   mandatory complete lap set, live fastest-lap highlight, and lap-total -> main timer.
   Existing result creation / record / Result Accepted flow remains owned by v5.8.03. */
(()=>{
  'use strict';
  const enabled=()=>state?.settings?.advancedTiming===true;
  const q=id=>document.getElementById(id);
  const SEG={0:'abcdef',1:'bc',2:'abdeg',3:'abcdg',4:'bcfg',5:'acdfg',6:'acdefg',7:'abc',8:'abcdefg',9:'abcdfg'};
  const digit=ch=>`<i class="rhSegDigit">${'abcdefg'.split('').map(s=>`<span class="s${s} ${(SEG[ch]||'').includes(s)?'on':''}"></span>`).join('')}</i>`;
  const group=(v,n)=>String(v||'').padStart(n,'0').slice(-n).split('').map(digit).join('');

  function ensurePreference(){
    if(!state.settings||typeof state.settings!=='object')state.settings={};
    if(typeof state.settings.advancedTiming!=='boolean')state.settings.advancedTiming=false;
  }

  window.rhSetAdvancedTimingV6013=function(value){
    ensurePreference();
    state.settings.advancedTiming=!!value;
    if(typeof window.rhSave==='function')window.rhSave();
    else if(typeof window.save==='function')window.save();
  };

  window.rhToggleAdvancedTimingPanelV6013=function(button){
    const panel=button?.closest?.('.rhAdvancedTimingV6013');
    if(!panel)return;
    const open=panel.classList.toggle('open');
    button.setAttribute('aria-expanded',open?'true':'false');
    const body=panel.querySelector('.rhAdvancedTimingBodyV6013');
    if(body)body.hidden=!open;
    const text=button.querySelector('em');
    if(text)text.textContent=open?'COLLAPSE':'EXPAND';
  };

  function clampInt(value,min,max){
    const digits=String(value??'').replace(/\D/g,'');
    if(!digits)return min;
    const parsed=parseInt(digits,10);
    return Math.max(min,Math.min(max,Number.isFinite(parsed)?parsed:min));
  }

  function lapPart(n,part,len,label){
    const id=`rhAT${n}${part}`;
    return `<label class="rhATLapPartV6015 ${part==='Ms'?'ms':''}">
      <span id="${id}Display" class="rhATSegDisplayV6015" aria-hidden="true">${group('0',len)}</span>
      <input id="${id}" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="${len}" autocomplete="off" aria-label="Lap ${n} ${label}" data-part="${part}" onfocus="this.select()" oninput="rhAdvancedTimingInputV6015(this,${len})">
    </label>`;
  }

  function lapRow(index){
    const n=index+1;
    return `<div class="rhATLapRowV6015" data-lap="${n}">
      <span class="rhATLapLabelV6015">LAP ${String(n).padStart(2,'0')}</span>
      <div class="rhATLapConsoleV6015" aria-label="Lap ${n} time">
        ${lapPart(n,'Min',2,'minutes')}<i>:</i>${lapPart(n,'Sec',2,'seconds')}<i>.</i>${lapPart(n,'Ms',3,'milliseconds')}
      </div>
      <span class="rhATFastestMarkV6015" aria-label="Fastest lap">★ F.L.</span>
    </div>`;
  }

  function readRow(row){
    const raw=(part)=>row.querySelector(`[data-part="${part}"]`)?.value||'';
    const minRaw=raw('Min'),secRaw=raw('Sec'),msRaw=raw('Ms');
    const complete=!!minRaw&&!!secRaw&&!!msRaw;
    const min=Number(minRaw||0),sec=Number(secRaw||0),ms=Number(msRaw||0);
    const valid=complete&&Number.isFinite(min)&&Number.isFinite(sec)&&Number.isFinite(ms)&&sec<=59&&ms<=999&&(min>0||sec>0||ms>0);
    return {row,min,sec,ms,valid,complete,seconds:min*60+sec+ms/1000};
  }

  function allRows(panel){return Array.from(panel?.querySelectorAll('.rhATLapRowV6015')||[]).map(readRow)}

  function setMainTimer(panel,totalMs,complete){
    const host=panel?.closest('.rh5801Entry');
    if(!host)return;
    const isEvent=!!host.querySelector('#rhEventMin');
    const prefix=isEvent?'rhEvent':'rh';
    const min=q(prefix+'Min'),sec=q(prefix+'Sec'),ms=q(prefix+'Ms');
    if(!min||!sec||!ms)return;
    if(!complete){min.value='';sec.value='';ms.value='';}
    else{
      const total=Math.max(0,Math.round(totalMs));
      const minutes=Math.floor(total/60000);
      const seconds=Math.floor((total%60000)/1000);
      const millis=total%1000;
      if(minutes>99){min.value='';sec.value='';ms.value='';panel.dataset.totalOverflow='1';}
      else{min.value=String(minutes).padStart(2,'0');sec.value=String(seconds).padStart(2,'0');ms.value=String(millis).padStart(3,'0');delete panel.dataset.totalOverflow;}
    }
    window.rhRefreshStopwatch?.(prefix);
    const note=host.querySelector('.rh5801Stopwatch>p');
    if(note)note.textContent=enabled()?'Auto-updated from Advanced Timing lap total':'Tap a section and type the race time';
    [min,sec,ms].forEach(input=>{input.readOnly=enabled();input.setAttribute('aria-readonly',enabled()?'true':'false')});
    host.querySelector('.rh5801Stopwatch')?.classList.toggle('rhATAutoTotalV6015',enabled());
  }

  function updatePanel(panel){
    if(!panel)return;
    const rows=allRows(panel);
    const valid=rows.filter(x=>x.valid);
    const complete=rows.length>0&&valid.length===rows.length;
    const totalMs=valid.reduce((sum,x)=>sum+Math.round(x.seconds*1000),0);
    const fastest=valid.length?Math.min(...valid.map(x=>Math.round(x.seconds*1000))):null;
    rows.forEach(x=>x.row.classList.toggle('fastest',x.valid&&Math.round(x.seconds*1000)===fastest));
    const status=panel.querySelector('.rhATStatusV6015');
    if(status){
      if(complete)status.innerHTML=`<b>${rows.length} LAP${rows.length===1?'':'S'} COMPLETE</b><span>Ready to save</span>`;
      else status.innerHTML=`<b>${valid.length} OF ${rows.length} LAPS COMPLETE</b><span>Every lap is required before saving</span>`;
    }
    const total=panel.querySelector('.rhATTotalV6015 strong');
    if(total){
      const min=Math.floor(totalMs/60000),sec=Math.floor((totalMs%60000)/1000),ms=totalMs%1000;
      total.textContent=complete?`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}.${String(ms).padStart(3,'0')}`:'--:--.---';
    }
    setMainTimer(panel,totalMs,complete);
  }

  function refreshLapDisplay(input){
    const part=input.dataset.part;
    const max=part==='Sec'?59:part==='Ms'?999:99;
    const len=input.maxLength>0?input.maxLength:2;
    let raw=String(input.value||'').replace(/\D/g,'').slice(0,len);
    if(raw&&Number(raw)>max)raw=String(max);
    input.value=raw;
    const display=q(input.id+'Display');
    if(display)display.innerHTML=group(raw||'0',len);
  }

  window.rhAdvancedTimingInputV6015=function(input,len){
    refreshLapDisplay(input);
    if(input.value.length>=len){
      const part=input.dataset.part;
      const row=input.closest('.rhATLapRowV6015');
      const next=part==='Min'?row?.querySelector('[data-part="Sec"]'):part==='Sec'?row?.querySelector('[data-part="Ms"]'):null;
      if(next){next.focus();next.select?.()}
    }
    updatePanel(input.closest('.rhAdvancedTimingV6013'));
  };

  function snapshotRows(panel){
    return allRows(panel).map(x=>({Min:x.row.querySelector('[data-part="Min"]')?.value||'',Sec:x.row.querySelector('[data-part="Sec"]')?.value||'',Ms:x.row.querySelector('[data-part="Ms"]')?.value||''}));
  }

  function renderLapRows(panel,count){
    const holder=panel?.querySelector('.rhATLapsV6015');
    if(!holder)return;
    const existing=snapshotRows(panel);
    holder.innerHTML=Array.from({length:count},(_,i)=>lapRow(i)).join('');
    Array.from(holder.querySelectorAll('.rhATLapRowV6015')).forEach((row,i)=>{
      const prior=existing[i];
      if(!prior)return;
      ['Min','Sec','Ms'].forEach(part=>{const input=row.querySelector(`[data-part="${part}"]`);if(input){input.value=prior[part];refreshLapDisplay(input)}});
    });
    updatePanel(panel);
  }

  window.rhAdvancedTimingSetLapCountV6015=function(input){
    const count=clampInt(input?.value,1,99); input.value=String(count); renderLapRows(input.closest('.rhAdvancedTimingV6013'),count);
  };
  window.rhAdvancedTimingStepLapsV6015=function(button,delta){
    const panel=button?.closest('.rhAdvancedTimingV6013'),input=panel?.querySelector('.rhATLapCountV6015');
    if(!input)return;
    const count=Math.max(1,Math.min(99,clampInt(input.value,1,99)+(delta>0?1:-1))); input.value=String(count); renderLapRows(panel,count);
  };

  function settingsPanel(){
    return `<section class="rhSection rhAdvancedTimingSettingsV6013"><h2>Advanced Timing</h2><label class="rhToggle rhAdvancedTimingToggleV6013"><span><b>Advanced Timing</b><small>Show optional lap-timing tools on Enter Result.</small></span><input id="rhAdvancedTimingSettingV6013" type="checkbox" ${enabled()?'checked':''} onchange="rhSetAdvancedTimingV6013(this.checked)"></label></section>`;
  }
  const renderSettings=window.rhRenderSettings;
  if(typeof renderSettings==='function')window.rhRenderSettings=function(){
    ensurePreference(); const out=renderSettings.apply(this,arguments); const content=document.querySelector('#more .rhContent');
    if(!content||content.querySelector('.rhAdvancedTimingSettingsV6013'))return out;
    const sections=Array.from(content.querySelectorAll(':scope > .rhSection'));
    const celebrations=sections.find(section=>/^celebrations$/i.test(section.querySelector('h2')?.textContent?.trim()||''));
    if(celebrations)celebrations.insertAdjacentHTML('afterend',settingsPanel()); else content.insertAdjacentHTML('afterbegin',settingsPanel()); return out;
  };

  function timingTile(){
    return `<section class="rhAdvancedTimingV6013">
      <button type="button" class="rhAdvancedTimingHeadV6013" aria-expanded="false" onclick="rhToggleAdvancedTimingPanelV6013(this)"><span class="rhAdvancedTimingIconV6013" aria-hidden="true">◷</span><span><small>OPTIONAL</small><b>ADVANCED TIMING</b></span><em>EXPAND</em></button>
      <div class="rhAdvancedTimingBodyV6013" hidden><div class="rhAdvancedTimingShellV6013"><small>LAP TIMING</small><b>Record more detail when you want it.</b><p>Advanced Timing adds optional lap timing alongside the existing total race time.</p>
        <div class="rhATEntryV6015"><div class="rhATCountRowV6015"><label>NUMBER OF LAPS</label><div class="rhATCountControlV6015"><button type="button" aria-label="Remove lap" onclick="rhAdvancedTimingStepLapsV6015(this,-1)">−</button><input class="rhATLapCountV6015" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" value="1" aria-label="Number of laps" oninput="rhAdvancedTimingSetLapCountV6015(this)"><button type="button" aria-label="Add lap" onclick="rhAdvancedTimingStepLapsV6015(this,1)">+</button></div></div>
        <div class="rhATLapsV6015" aria-live="polite"></div><div class="rhATSummaryV6015"><div class="rhATStatusV6015"><b>0 OF 1 LAPS COMPLETE</b><span>Every lap is required before saving</span></div><div class="rhATTotalV6015"><small>LAP TIMES TOTAL</small><strong>--:--.---</strong></div></div></div>
      </div></div>
    </section>`;
  }
  function discoverabilityTile(){return `<aside class="rhAdvancedTimingDiscoverV6013" aria-label="Advanced Timing available"><span class="rhAdvancedTimingIconV6013" aria-hidden="true">◷</span><span><b>ADVANCED TIMING</b><small>Want to record lap timing too? Enable Advanced Timing in Settings.</small></span></aside>`}

  function decorateResultEntry(hostId){
    ensurePreference(); const host=document.getElementById(hostId),main=host?.querySelector('.rh5801Entry'); if(!main)return;
    main.querySelectorAll('.rhAdvancedTimingV6013,.rhAdvancedTimingDiscoverV6013').forEach(x=>x.remove());
    if(enabled()){
      const controls=main.querySelector('.rh5801Controls');
      if(controls){controls.insertAdjacentHTML('afterbegin',timingTile());const panel=controls.querySelector('.rhAdvancedTimingV6013');renderLapRows(panel,1);setMainTimer(panel,0,false)}
    }else{
      const position=main.querySelector('.rh5801Position'); if(position)position.insertAdjacentHTML('afterend',discoverabilityTile());
    }
  }

  function advancedPayload(){
    if(!enabled())return {ok:true,payload:null};
    const panel=document.querySelector('.screen:not(.hidden) .rhAdvancedTimingV6013')||document.querySelector('.rhAdvancedTimingV6013');
    if(!panel)return {ok:false,message:'Advanced Timing is on but lap timing is unavailable'};
    const rows=allRows(panel),invalid=rows.find(x=>!x.valid);
    if(invalid){
      panel.classList.add('open'); panel.querySelector('.rhAdvancedTimingBodyV6013').hidden=false; panel.querySelector('.rhAdvancedTimingHeadV6013')?.setAttribute('aria-expanded','true');
      invalid.row.classList.add('invalid'); invalid.row.scrollIntoView?.({behavior:'smooth',block:'center'}); invalid.row.querySelector('input')?.focus();
      return {ok:false,message:`Enter a valid time for Lap ${String(invalid.row.dataset.lap).padStart(2,'0')}`};
    }
    const lapTimes=rows.map((x,i)=>({lap:i+1,time:Number(x.seconds.toFixed(3))}));
    const total=lapTimes.reduce((s,x)=>s+x.time,0),fastest=Math.min(...lapTimes.map(x=>x.time));
    const totalMs=Math.round(total*1000);
    if(Math.floor(totalMs/60000)>99)return {ok:false,message:'Lap times total exceeds the 99:59.999 race-time limit'};
    return {ok:true,payload:{lapCount:lapTimes.length,lapTimes,fastestTime:fastest,fastestLaps:lapTimes.filter(x=>Math.abs(x.time-fastest)<0.0005).map(x=>x.lap),totalTime:Number(total.toFixed(3))}};
  }

  let pending=null;
  function wrapSave(name){
    const original=window[name]; if(typeof original!=='function')return;
    window[name]=function(){
      if(enabled()){
        const checked=advancedPayload(); if(!checked.ok){window.toast?.(checked.message);return}
        pending=checked.payload;
      }
      try{return original.apply(this,arguments)}finally{pending=null}
    };
  }
  wrapSave('rhSaveResultFinal'); wrapSave('rhSaveEventResultV5801');

  const accepted=window.rhResultAccepted;
  if(typeof accepted==='function')window.rhResultAccepted=function(owner,res,source){
    if(pending&&res&&typeof res==='object'){
      res.advancedTiming={lapCount:pending.lapCount,lapTimes:pending.lapTimes.map(x=>({...x})),fastestTime:pending.fastestTime,fastestLaps:[...pending.fastestLaps],totalTime:pending.totalTime};
      if(typeof window.rhSave==='function')window.rhSave(); else if(typeof window.save==='function')window.save();
    }
    return accepted.apply(this,arguments);
  };

  window.rhDecorateResultEntryV8029=decorateResultEntry;
  const enterResult=window.rhEnterResult;
  if(typeof enterResult==='function')window.rhEnterResult=function(){const out=enterResult.apply(this,arguments);decorateResultEntry('festival');return out};
  const eventResult=window.rhEventResult;
  if(typeof eventResult==='function')window.rhEventResult=function(){const out=eventResult.apply(this,arguments);decorateResultEntry('event');return out};

  ensurePreference();
})();
