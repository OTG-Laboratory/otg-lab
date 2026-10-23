/* OTG! v8.0.44 — manifest-led, Safety-Backup-gated updater */
(()=>{
'use strict';
const CURRENT=()=>document.querySelector('meta[name="racehub-version"]')?.content||'8.0.44';
const MANIFEST='./update-manifest.json';
let offered=null;
function clone(v){return JSON.parse(JSON.stringify(v));}
function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);}
function digest(b){const raw=JSON.stringify({type:b.type,spaceName:b.spaceName,counts:b.counts,data:b.data});let h=2166136261;for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0');}
function safetySnapshot(s){const runs=Array.isArray(s.runs)?s.runs:[];return{id:id('safety-backup'),type:'safety',spaceName:s.name||'My RaceHub',date:new Date().toISOString(),counts:{cars:(s.cars||[]).length,championships:runs.length,results:runs.flatMap(r=>r.results||[]).length},data:clone({cars:s.cars||[],favouriteManufacturer:s.favouriteManufacturer||'',runs,customEvents:s.customEvents||[]})};}
function createAndVerifyAllSpaceSafetyBackups(){
 try{
  // v8.0.44: persisted storage is the authority for backup slots.
  // Re-read it immediately before the transaction so stale in-memory backup arrays
  // can never resurrect/delete manual backups during an update.
  if(typeof state==='undefined'||!state||!Array.isArray(state.spaces)||!state.spaces.length)return{ok:false,reason:'no-spaces'};
  if(typeof RH_FINAL_STORE==='undefined'||typeof rhSave!=='function'||typeof window.rhBackupSnapshotV8012!=='function'||typeof window.rhSafetyDigestV8013!=='function')return{ok:false,reason:'backup-api-unavailable'};
  const persistedState=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');
  if(!persistedState||!Array.isArray(persistedState.spaces))return{ok:false,reason:'persisted-state-unavailable'};
  const expected=[];
  for(const live of state.spaces){
   const stored=persistedState.spaces.find(x=>String(x.id)===String(live.id));
   if(!stored)return{ok:false,reason:'persisted-space-missing'};
   // Backup ownership comes ONLY from the freshly-read persisted Space.
   const canonicalManual=clone(stored.backups||[]).filter(b=>b&&b.type!=='safety');
   const manualDigest=JSON.stringify(canonicalManual);
   live.backups=clone(canonicalManual);
   const b=window.rhBackupSnapshotV8012(live,'safety');
   live.safetyBackup=b;
   expected.push({spaceId:live.id,id:b.id,digest:window.rhSafetyDigestV8013(b),manualDigest});
  }
  rhSave();
  const verifyState=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');
  if(!verifyState||!Array.isArray(verifyState.spaces))return{ok:false,reason:'verify-state-unavailable'};
  for(const e of expected){
   const stored=verifyState.spaces.find(x=>String(x.id)===String(e.spaceId));
   const b=stored?.safetyBackup;
   if(!b||b.id!==e.id||b.type!=='safety'||window.rhSafetyDigestV8013(b)!==e.digest)return{ok:false,reason:'verify-failed'};
   const manuals=(stored.backups||[]).filter(x=>x&&x.type!=='safety');
   if(JSON.stringify(manuals)!==e.manualDigest)return{ok:false,reason:'manual-backups-changed'};
  }
  return{ok:true,count:expected.length,expected};
 }catch(error){console.warn('Safety Backup transaction failed',error);return{ok:false,reason:'exception',error};}
}

function status(t){const e=document.getElementById('rhUpdateStatus');if(e)e.textContent=t;}
function cmp(a,b){const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d;}return 0;}
function close(){document.getElementById('rhUpdateAvailable8020')?.remove();}
async function latest(){const r=await fetch(MANIFEST+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('manifest');return r.json();}
function showUpdate(m){offered=m;if(document.getElementById('rhUpdateAvailable8020'))return;const d=document.createElement('div');d.id='rhUpdateAvailable8020';d.className='rhUpdateOverlay8015';d.innerHTML=`<section class="rhUpdateModal8015" role="dialog" aria-modal="true"><button class="rhUpdateClose8015" aria-label="Later">×</button><small>OTG! UPDATE AVAILABLE</small><h2>VERSION ${m.version}</h2><p>${m.message||'A newer version of OTG! is ready.'}</p><p class="rhUpdateSafety8015">A protected Safety Backup will be created and verified before the update starts.</p><button class="btn rhUpdateNow8015">UPDATE NOW</button><button class="btn secondary rhUpdateLater8015">LATER</button><div class="rhUpdateProgress8015" aria-live="polite"></div></section>`;document.body.appendChild(d);d.querySelector('.rhUpdateClose8015').onclick=close;d.querySelector('.rhUpdateLater8015').onclick=close;d.querySelector('.rhUpdateNow8015').onclick=()=>install(m,d);}
async function install(m,d){const btn=d.querySelector('.rhUpdateNow8015'),out=d.querySelector('.rhUpdateProgress8015');btn.disabled=true;out.textContent='Creating protected Safety Backup…';const gate=createAndVerifyAllSpaceSafetyBackups();if(!gate.ok){out.textContent='UPDATE COULDN’T START — Safety Backup could not be verified. Your data has not been changed.';btn.disabled=false;return;}out.textContent=`Safety Backup verified for ${gate.count} Space${gate.count===1?'':'s'}. Installing update…`;try{sessionStorage.setItem('otgUpdateReload','1');const reg=await navigator.serviceWorker.register(m.worker,{scope:'./',updateViaCache:'none'});if(reg.installing){await new Promise((resolve,reject)=>{const sw=reg.installing;const done=()=>{if(sw.state==='installed')resolve();else if(sw.state==='redundant')reject(new Error('install failed'));};sw.addEventListener('statechange',done);done();});}const w=reg.waiting;if(w)w.postMessage({type:'SKIP_WAITING'});else if(reg.active&&reg.active.scriptURL.includes(m.worker.replace('./','')))location.reload();else throw new Error('No installable update');out.textContent=`OTG! ${m.version} is installing…`;}catch(e){console.warn(e);sessionStorage.removeItem('otgUpdateReload');out.textContent='UPDATE COULDN’T START — Your Safety Backup is protected. Try again later.';btn.disabled=false;}}
async function check(showCurrent=false){try{const m=await latest();if(cmp(m.version,CURRENT())>0){status(`Installed version: ${CURRENT()} • Update ${m.version} available.`);showUpdate(m);return true;}if(showCurrent)status(`Installed version: ${CURRENT()} • Up to date.`);return false;}catch(e){if(showCurrent)status(`Installed version: ${CURRENT()} • Latest version unavailable. Try again later.`);return false;}}
async function manual(){const b=document.getElementById('rhCheckUpdateButton');if(b)b.disabled=true;status(`Installed version: ${CURRENT()} • Checking latest version…`);await check(true);if(b)b.disabled=false;}
navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('otgUpdateReload')==='1'){sessionStorage.removeItem('otgUpdateReload');location.reload();}});
window.rhCheckForUpdate=manual;
window.rhAutoCheckForUpdateV8021=()=>check(false);
})();
