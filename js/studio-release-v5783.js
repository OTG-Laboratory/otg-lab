/* OTG! v5.7.83 — final leaderboard route + in-app update check */
(()=>{
 const CURRENT_VERSION='5.7.88';
 const safeText=v=>String(v??'');

 // The completed-result action now opens the locked Final Leaderboard directly.
 const previousSummary=window.rhResultSummary;
 if(previousSummary){
  window.rhResultSummary=function(r,res){
   const out=previousSummary(r,res);
   if(r?.status==='complete'){
    const button=document.querySelector('#festival .rhResultContinueFinal');
    if(button){
     button.setAttribute('onclick',`rhOpenRun('${r.id}')`);
     const main=button.querySelector('b');
     const sub=button.querySelector('small');
     if(main)main.textContent='FINAL LEADERBOARD';
     if(sub)sub.textContent='VIEW OFFICIAL CLASSIFICATION';
    }
   }
   return out;
  };
 }

 // Keep the completion milestone compatible, but make its action deterministic.
 window.rhChampionshipCompleteTransition=function(runId){
  window.rhOpenRun(runId);
 };

 function updateStatus(text,state=''){
  const el=document.getElementById('rhUpdateStatus');
  if(!el)return;
  el.textContent=text;
  el.dataset.state=state;
 }

 window.rhCheckForUpdate=async function(){
  const button=document.getElementById('rhCheckUpdateButton');
  if(button)button.disabled=true;
  updateStatus('Checking OTG!…','checking');
  try{
   const registration=await navigator.serviceWorker?.getRegistration();
   if(registration)await registration.update();
   const response=await fetch(`./index.html?update-check=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
   if(!response.ok)throw new Error('Update check failed');
   const html=await response.text();
   const match=html.match(/Version\s+([0-9]+\.[0-9]+\.[0-9]+)/i);
   const remote=match?.[1]||CURRENT_VERSION;
   if(remote!==CURRENT_VERSION){
    updateStatus(`Update ${safeText(remote)} found — applying…`,'found');
    if(registration?.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
    setTimeout(()=>window.location.reload(),500);
    return;
   }
   updateStatus(`OTG! ${CURRENT_VERSION} is up to date.`,'current');
  }catch(error){
   updateStatus('Could not check right now. Check your connection and try again.','error');
  }finally{
   if(button)button.disabled=false;
  }
 };

 const previousSettings=window.rhRenderSettings;
 if(previousSettings){
  window.rhRenderSettings=function(){
   const out=previousSettings();
   const content=document.querySelector('#more .rhContent');
   if(!content)return out;
   content.querySelectorAll('.rhSettingRow span').forEach(span=>{
    if(/OTG! v/i.test(span.textContent||''))span.textContent=`OTG! v${CURRENT_VERSION} • ›`;
   });
   const danger=content.querySelector('.rhDangerFinal');
   if(danger&&!document.getElementById('rhUpdatePanel')){
    danger.insertAdjacentHTML('beforebegin',`<section id="rhUpdatePanel" class="rhSection rhSettingPanel rhUpdatePanelV5783"><h2>APP UPDATE</h2><p>Check for the latest OTG! build without closing the app.</p><button id="rhCheckUpdateButton" class="rhSettingRow" onclick="rhCheckForUpdate()"><b>CHECK FOR LATEST UPDATE</b><span>OTG! v${CURRENT_VERSION} • CHECK NOW ›</span></button><div id="rhUpdateStatus" class="rhUpdateStatusV5783" aria-live="polite">Installed version: ${CURRENT_VERSION}</div></section>`);
   }
   return out;
  };
 }
})();
