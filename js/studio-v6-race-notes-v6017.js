/* OTG! v6.0.17 — Stage 8C result-specific Race Notes.
   Additive layer only. Advanced Timing v6.0.16 remains protected and unchanged.
   Race Notes are available only when Advanced Timing is enabled, are optional,
   and are stored on the individual successfully-saved result. */
(()=>{
  'use strict';
  const enabled=()=>state?.settings?.advancedTiming===true;
  const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  let pendingNote='';

  function notesMarkup(){
    return `<section class="rhRaceNotesV6017">
      <label for="rhRaceNotesTextV6017"><small>RACE NOTES</small><b>Anything worth remembering?</b></label>
      <textarea id="rhRaceNotesTextV6017" maxlength="4000" autocomplete="off" placeholder="Add notes about this race..."></textarea>
      <span>Optional • saved with this result</span>
    </section>`;
  }

  function decorateNotes(hostId){
    if(!enabled())return;
    const host=document.getElementById(hostId),panel=host?.querySelector('.rhAdvancedTimingV6013');
    const shell=panel?.querySelector('.rhAdvancedTimingShellV6013');
    if(!shell||shell.querySelector('.rhRaceNotesV6017'))return;
    shell.insertAdjacentHTML('beforeend',notesMarkup());
  }

  function currentNote(){
    if(!enabled())return '';
    return String(document.querySelector('.screen:not(.hidden) #rhRaceNotesTextV6017')?.value||document.getElementById('rhRaceNotesTextV6017')?.value||'').trim();
  }

  function wrapSave(name){
    const original=window[name];
    if(typeof original!=='function')return;
    window[name]=function(){
      pendingNote=currentNote();
      try{return original.apply(this,arguments)}finally{pendingNote=''}
    };
  }
  wrapSave('rhSaveResultFinal');
  wrapSave('rhSaveEventResultV5801');

  const accepted=window.rhResultAccepted;
  if(typeof accepted==='function')window.rhResultAccepted=function(owner,res,source){
    if(res&&typeof res==='object'&&pendingNote){
      res.raceNotes=pendingNote;
      if(typeof window.rhSave==='function')window.rhSave();
      else if(typeof window.save==='function')window.save();
    }
    return accepted.apply(this,arguments);
  };

  function addSummaryNote(host,res){
    const note=String(res?.raceNotes||'').trim();
    if(!note)return;
    const body=host?.querySelector('.rhPodiumBodyV5804');
    if(!body||body.querySelector('.rhResultRaceNotesV6017'))return;
    const classification=body.querySelector('.rhPodiumClassificationV5804');
    const section=document.createElement('section');
    section.className='rhResultRaceNotesV6017';
    section.innerHTML='<small>RACE NOTES</small><p></p>';
    section.querySelector('p').textContent=note;
    if(classification)body.insertBefore(section,classification);else body.appendChild(section);
  }

  const resultSummary=window.rhResultSummary;
  if(typeof resultSummary==='function')window.rhResultSummary=function(r,res){
    const out=resultSummary.apply(this,arguments);
    addSummaryNote(document.getElementById('festival'),res);
    return out;
  };
  const eventSummary=window.rhEventResultSummary;
  if(typeof eventSummary==='function')window.rhEventResultSummary=function(e,res){
    const out=eventSummary.apply(this,arguments);
    addSummaryNote(document.getElementById('event'),res);
    return out;
  };

  const enterResult=window.rhEnterResult;
  if(typeof enterResult==='function')window.rhEnterResult=function(){
    const out=enterResult.apply(this,arguments); decorateNotes('festival'); return out;
  };
  const eventResult=window.rhEventResult;
  if(typeof eventResult==='function')window.rhEventResult=function(){
    const out=eventResult.apply(this,arguments); decorateNotes('event'); return out;
  };
})();
