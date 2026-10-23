/* OTG! LAB v0.5 — LAB-only update checker, live initial status repair. */
(()=>{
'use strict';
const LAB_CHANNEL='OTG-LAB';
const current=()=>document.querySelector('meta[name="otg-lab-version"]')?.content||'0.0';
const manifestUrl='./update-manifest.json';
let checking=false, installing=false;
function compare(a,b){
 const parse=s=>/^\d+(?:\.\d+)*$/.test(String(s))?String(s).split('.').map(Number):null;
 const A=parse(a),B=parse(b);if(!A||!B)throw new Error('Invalid LAB version');
 for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d;}return 0;
}
function setStatus(message,state=''){
 const el=document.getElementById('rhUpdateStatus');if(el){el.textContent=message;el.dataset.state=state;}
}
function updateSettingsLabels(){
 const box=document.getElementById('rhUpdatePanel');if(!box)return;
 const heading=box.querySelector('h2');if(heading&&heading.textContent!=='LAB UPDATES')heading.textContent='LAB UPDATES';
 const description=box.querySelector('p');if(description&&description.textContent!=='Check the published OTG! LAB development version. MAIN is never checked or updated here.')description.textContent='Check the published OTG! LAB development version. MAIN is never checked or updated here.';
 const button=box.querySelector('#rhCheckUpdateButton');
 if(button){const label=button.querySelector('span');if(label&&label.textContent!==`OTG! LAB v${current()} • CHECK NOW ›`)label.textContent=`OTG! LAB v${current()} • CHECK NOW ›`;}
 const status=box.querySelector('#rhUpdateStatus');if(status && (!status.dataset.labTouched || /Installed version: 8\.0\.143|Latest version: 8\.0\.143/.test(status.textContent))){status.textContent=`Installed LAB v${current()} • Ready to check LAB releases.`;status.dataset.labTouched='1';}
}
async function getManifest(){
 const response=await fetch(manifestUrl+'?lab-check='+Date.now(),{cache:'no-store'});
 if(!response.ok)throw new Error('Update manifest unavailable');
 const data=await response.json();
 if(data?.channel!==LAB_CHANNEL||data?.branch!=='LAB'||!data?.labVersion||!data?.labWorker)throw new Error('Not an OTG! LAB release');
 compare(data.labVersion,current());
 const workerUrl=new URL(data.labWorker,location.href);
 if(workerUrl.origin!==location.origin||!workerUrl.pathname.endsWith('/otg-lab-worker-v1.js'))throw new Error('Unexpected LAB worker');
 return data;
}
function showOffer(data){
 if(document.getElementById('otgLabUpdateOffer03'))return;
 const overlay=document.createElement('div');overlay.id='otgLabUpdateOffer03';overlay.className='rhUpdateOverlay8015';
 overlay.innerHTML='<section class="rhUpdateModal8015" role="dialog" aria-modal="true" aria-labelledby="otgLabUpdateTitle03"><button type="button" class="rhUpdateClose8015" aria-label="Later">×</button><small>OTG! LAB UPDATE AVAILABLE</small><h2 id="otgLabUpdateTitle03"></h2><p class="otgLabUpdateMessage03"></p><p class="rhUpdateSafety8015">LAB Safety Backups will be created and verified before applying this update. MAIN is not involved.</p><button type="button" class="btn otgLabApply03">UPDATE LAB NOW</button><button type="button" class="btn secondary otgLabLater03">LATER</button><div class="rhUpdateProgress8015" aria-live="polite"></div></section>';
 overlay.querySelector('h2').textContent='LAB v'+data.labVersion;
 overlay.querySelector('.otgLabUpdateMessage03').textContent=data.message||'A newer OTG! LAB build has been published.';
 const close=()=>{if(!installing)overlay.remove();};
 overlay.querySelector('.rhUpdateClose8015').addEventListener('click',close);
 overlay.querySelector('.otgLabLater03').addEventListener('click',close);
 overlay.querySelector('.otgLabApply03').addEventListener('click',()=>install(data,overlay));
 document.body.appendChild(overlay);
}
async function install(data,overlay){
 if(installing)return;
 installing=true;
 const button=overlay.querySelector('.otgLabApply03');button.disabled=true;
 const progress=overlay.querySelector('.rhUpdateProgress8015');
 progress.textContent='Creating and verifying LAB Safety Backups…';
 try{
  const backup=window.rhCreateAndVerifyAllSpaceSafetyBackupsV8065;
  if(typeof backup!=='function')throw new Error('Safety Backup support unavailable');
  const gate=await backup();
  if(!gate?.ok)throw new Error('Safety Backup verification failed: '+(gate?.reason||'unknown'));
  progress.textContent=`Verified ${gate.count} LAB Space backup${gate.count===1?'':'s'}. Checking published files…`;
  const latest=await getManifest();
  if(compare(latest.labVersion,data.labVersion)!==0)throw new Error('Published LAB update changed during install; check again');
  if(compare(latest.labVersion,current())<=0)throw new Error('That version is already installed');
  if(!('serviceWorker' in navigator))throw new Error('Service worker is unavailable');
  const registration=await navigator.serviceWorker.register(latest.labWorker,{scope:'./',updateViaCache:'none'});
  await registration.update();
  // The LAB worker may already have activated automatically while the app was open.
  // Only reload after the verified backup gate and a successful update request.
  if(registration.installing){
   await new Promise((resolve,reject)=>{const sw=registration.installing;
    const changed=()=>{if(sw.state==='installed'||sw.state==='activated')resolve();else if(sw.state==='redundant')reject(new Error('Worker install failed'));};
    sw.addEventListener('statechange',changed);changed();
   });
  }
  if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});
  progress.textContent=`Applying LAB v${latest.labVersion}…`;
  location.replace('./index.html?lab-updated='+Date.now());
 }catch(err){
  progress.textContent='LAB update stopped safely: '+(err?.message||'Unknown error')+'. Your data has not been reset.';
  button.disabled=false;installing=false;
 }
}
async function manualCheck({quiet=false}={}){
 if(checking||installing)return false;
 checking=true;updateSettingsLabels();
 const button=document.getElementById('rhCheckUpdateButton');if(button)button.disabled=true;
 if(!quiet)setStatus(`Installed LAB v${current()} • Checking latest LAB release…`,'checking');
 try{
  const data=await getManifest();
  if(compare(data.labVersion,current())>0){
   setStatus(`Installed LAB v${current()} • LAB v${data.labVersion} available.`,'found');
   if(!quiet)showOffer(data);
   return true;
  }
  if(!quiet)setStatus(`OTG! LAB v${current()} is up to date.`,'current');
  return false;
 }catch(err){
  if(!quiet)setStatus('Could not verify LAB updates. Try again when online.','error');
  console.warn('OTG! LAB update check',err);
  return false;
 }finally{checking=false;if(button)button.disabled=false;}
}
// Turn off inherited Main updater paths. Lab is keyed only by labVersion/channel.
window.rhCheckForUpdate=()=>manualCheck();
window.rhAutoCheckForUpdateV8021=()=>Promise.resolve(false);
window.rhStartupUpdateGate8062=()=>Promise.resolve(false);
const render=window.rhRenderSettings;
if(typeof render==='function')window.rhRenderSettings=function(){const ret=render.apply(this,arguments);updateSettingsLabels();return ret;};
window.otgLabUpdateCheckV05=()=>manualCheck();
// Legacy scripts can populate a stale MAIN result when Settings first appears.
// Watch that panel's render and replace only initial legacy copy, never a LAB check result.
const statusHost=document.getElementById('more');
if(statusHost&&typeof MutationObserver!=='undefined'){
 const observer=new MutationObserver(()=>updateSettingsLabels());
 observer.observe(statusHost,{childList:true,subtree:true,characterData:true});
}
updateSettingsLabels();
// The LAB button is recreated by legacy renderers. Capture clicks before the
// old inline onclick can run; this is the final update handler in the page.
document.addEventListener('click',function(e){
 const button=e.target?.closest?.('#rhCheckUpdateButton');
 if(!button)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 manualCheck();
},true);

})();
