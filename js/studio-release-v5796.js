/* OTG! v5.7.96 — Final Standings page removed completely. */
(()=>{
 const VERSION='5.7.96';
 const runs=()=>typeof rhCurrentRuns==='function'?(rhCurrentRuns()||[]):[];

 function returnToFestival(){
   document.querySelectorAll('#rh593-final-root,.rh588-final-screen,.rhLockedFinalScreen,.rhOfficialFinal').forEach(el=>el.remove());
   document.body.classList.remove('rh593-final-open','rh588-final-open','rh591-summary-open');
   document.documentElement.classList.remove('rh593-final-open');
   document.body.style.removeProperty('overflow');
   document.documentElement.style.removeProperty('overflow');
   document.querySelectorAll('body > [data-rh595-hidden]').forEach(el=>{
     el.style.removeProperty('display');
     el.removeAttribute('data-rh595-hidden');
     el.removeAttribute('data-rh595-display');
     el.removeAttribute('aria-hidden');
   });
   if(typeof rhRenderFestival==='function')rhRenderFestival();
   if(typeof show==='function')show('festival');
   window.scrollTo(0,0);
 }

 // No completed-run leaderboard route remains in this build.
 window.rhChampionshipCompleteTransition=returnToFestival;
 window.rhShowLockedFinalLeaderboard=undefined;
 window.rhShowLockedFinalLeaderboardV5788=undefined;
 window.rhShowFinalStandingsV5792=undefined;
 window.rhShowFinalStandingsV5793=undefined;

 const priorOpen=window.rhOpenRun;
 if(priorOpen)window.rhOpenRun=function(id){
   const run=runs().find(x=>String(x.id)===String(id));
   if(run?.status==='complete')return returnToFestival();
   return priorOpen(id);
 };

 const priorSummary=window.rhResultSummary;
 if(priorSummary)window.rhResultSummary=function(run,result){
   const out=priorSummary(run,result);
   const host=document.getElementById('festival');
   host?.querySelectorAll('.rhOfficialBoard,.rhLockedBoard,.rh588-board,.rh593-board,.rhLockedBoardBoot').forEach(el=>el.remove());
   if(run?.status==='complete'){
     const btn=host?.querySelector('.rhResultContinueFinal');
     if(btn){
       btn.removeAttribute('onclick');
       btn.onclick=returnToFestival;
       const main=btn.querySelector('b');
       const sub=btn.querySelector('small');
       if(main)main.textContent='CHAMPIONSHIP COMPLETE';
       if(sub)sub.textContent='RETURN TO FESTIVAL';
     }
   }
   return out;
 };

 // Block any stale cached legacy Final Leaderboard action from opening a removed page.
 document.addEventListener('click',event=>{
   const target=event.target?.closest?.('button,a');
   if(!target)return;
   const text=(target.textContent||'').toUpperCase();
   if(!text.includes('FINAL LEADERBOARD')&&!text.includes('FINAL STANDINGS')&&!text.includes('VIEW OFFICIAL CLASSIFICATION'))return;
   event.preventDefault();
   event.stopImmediatePropagation();
   returnToFestival();
 },true);

 // Settings is the version authority and update checker.
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
     const match=html.match(/<meta\s+name=["']racehub-version["']\s+content=["']([0-9]+\.[0-9]+\.[0-9]+)["']/i);
     const remote=match?.[1]||VERSION;
     if(remote!==VERSION){
       updateStatus(`Update ${remote} found — applying…`,'found');
       if(registration?.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
       setTimeout(()=>window.location.reload(),500);
     }else updateStatus(`OTG! ${VERSION} is up to date.`,'current');
   }catch(_){updateStatus('Could not check right now. Check your connection and try again.','error');}
   finally{if(button)button.disabled=false;}
 };
 const oldSettings=window.rhRenderSettings;
 if(oldSettings)window.rhRenderSettings=function(){
   const out=oldSettings();
   const content=document.querySelector('#more .rhContent');
   if(!content)return out;
   content.querySelectorAll('.rhSettingRow span').forEach(span=>{
     if(/OTG! v/i.test(span.textContent||''))span.textContent=`OTG! v${VERSION} • CHECK NOW ›`;
   });
   const danger=content.querySelector('.rhDangerFinal');
   if(danger&&!document.getElementById('rhUpdatePanel')){
     danger.insertAdjacentHTML('beforebegin',`<section id="rhUpdatePanel" class="rhSection rhSettingPanel rhUpdatePanelV5783"><h2>APP UPDATE</h2><p>Check for the latest OTG! build without closing the app.</p><button id="rhCheckUpdateButton" class="rhSettingRow" onclick="rhCheckForUpdate()"><b>CHECK FOR LATEST UPDATE</b><span>OTG! v${VERSION} • CHECK NOW ›</span></button><div id="rhUpdateStatus" class="rhUpdateStatusV5783" aria-live="polite">Installed version: ${VERSION}</div></section>`);
   }
   const status=document.getElementById('rhUpdateStatus');
   if(status&&!/Checking|Update .*found|Could not/i.test(status.textContent||''))status.textContent=`Installed version: ${VERSION}`;
   return out;
 };
})();
