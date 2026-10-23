/* OTG! v5.9.18 — universal BACK size release/version authority. */
(()=>{
 'use strict';
 const CURRENT_VERSION=document.querySelector('meta[name="racehub-version"]')?.content||'5.9.18';
 function updateStatus(text,state=''){const el=document.getElementById('rhUpdateStatus');if(el){el.textContent=text;el.dataset.state=state}}
 window.rhCheckForUpdate=async function(){
   const button=document.getElementById('rhCheckUpdateButton');
   if(button)button.disabled=true;
   updateStatus(`Installed version: ${CURRENT_VERSION} • Checking latest version…`,'checking');
   try{
     const registration=await navigator.serviceWorker?.getRegistration();
     if(registration)await registration.update();
     const response=await fetch(`./index.html?update-check=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
     if(!response.ok)throw new Error();
     const html=await response.text();
     const match=html.match(/name=["']racehub-version["']\s+content=["']([^"']+)/i);
     const remote=match?.[1]||CURRENT_VERSION;
     if(remote!==CURRENT_VERSION){
       updateStatus(`Installed version: ${CURRENT_VERSION} • Latest version: ${remote} — applying…`,'found');
       if(registration?.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
       setTimeout(()=>location.reload(),500);
     }else{
       updateStatus(`Installed version: ${CURRENT_VERSION} • Latest version: ${remote} — up to date.`,'current');
     }
   }catch(_){
     updateStatus(`Installed version: ${CURRENT_VERSION} • Latest version unavailable. Try again later.`,'error');
   }finally{if(button)button.disabled=false}
 };
 const settings=window.rhRenderSettings;
 if(settings)window.rhRenderSettings=function(){
   const out=settings(),content=document.querySelector('#more .rhContent');
   if(!content)return out;
   const danger=content.querySelector('.rhDangerFinal');
   if(danger&&!document.getElementById('rhUpdatePanel'))danger.insertAdjacentHTML('beforebegin',`<section id="rhUpdatePanel" class="rhSection rhSettingPanel rhUpdatePanelV5783"><h2>APP UPDATE</h2><p>Check for the latest OTG! build without closing the app.</p><button id="rhCheckUpdateButton" class="rhSettingRow" onclick="rhCheckForUpdate()"><b>CHECK FOR LATEST UPDATE</b><span>OTG! v${CURRENT_VERSION} • CHECK NOW ›</span></button><div id="rhUpdateStatus" class="rhUpdateStatusV5783" aria-live="polite">Installed version: ${CURRENT_VERSION}</div></section>`);
   return out;
 };
})();
