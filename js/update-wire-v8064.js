/* OTG! v8.0.64 — manifest updater + IndexedDB Safety Backup gate. */
(()=>{
'use strict';
const CURRENT=()=>document.querySelector('meta[name="racehub-version"]')?.content||'8.0.64';
const MANIFEST='./update-manifest.json';
const SAFETY_DB='OTG_Safety_Backups_v1';
const SAFETY_STORE='backups';
let offered=null;
function clone(v){return JSON.parse(JSON.stringify(v));}
function openSafetyDb(){
 return new Promise((resolve,reject)=>{
  if(!('indexedDB' in window))return reject(new Error('indexeddb-unavailable'));
  const req=indexedDB.open(SAFETY_DB,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(SAFETY_STORE))db.createObjectStore(SAFETY_STORE,{keyPath:'spaceId'});};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>reject(req.error||new Error('indexeddb-open-failed'));
  req.onblocked=()=>reject(new Error('indexeddb-blocked'));
 });
}
function txDone(tx){return new Promise((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error||new Error('indexeddb-transaction-failed'));tx.onabort=()=>reject(tx.error||new Error('indexeddb-transaction-aborted'));})}
async function readIndexedSafetyBackup(spaceId){
 const db=await openSafetyDb();
 try{
  const tx=db.transaction(SAFETY_STORE,'readonly'),store=tx.objectStore(SAFETY_STORE);
  const rec=await new Promise((resolve,reject)=>{const q=store.get(String(spaceId));q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error||new Error('indexeddb-read-failed'));});
  await txDone(tx);return rec;
 }finally{db.close();}
}
async function createAndVerifyAllSpaceSafetyBackups(){
 try{
  if(typeof state==='undefined'||!state||!Array.isArray(state.spaces)||!state.spaces.length)return{ok:false,reason:'no-spaces'};
  if(typeof RH_FINAL_STORE==='undefined'||typeof rhSave!=='function'||typeof window.rhBackupSnapshotV8012!=='function'||typeof window.rhSafetyDigestV8013!=='function')return{ok:false,reason:'backup-api-unavailable'};
  const persistedState=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');
  if(!persistedState||!Array.isArray(persistedState.spaces)||!persistedState.spaces.length)return{ok:false,reason:'persisted-state-unavailable'};
  const expected=[];
  for(const stored of persistedState.spaces){
   const b=window.rhBackupSnapshotV8012(stored,'safety'),digest=window.rhSafetyDigestV8013(b);
   expected.push({spaceId:String(stored.id),id:b.id,digest,backup:b,manualDigest:JSON.stringify(clone(stored.backups||[]).filter(x=>x&&x.type!=='safety'))});
  }
  const db=await openSafetyDb();
  try{
   const tx=db.transaction(SAFETY_STORE,'readwrite'),store=tx.objectStore(SAFETY_STORE);store.clear();
   for(const e of expected)store.put({spaceId:e.spaceId,backup:e.backup,digest:e.digest,version:String(offered?.version||CURRENT()),savedAt:new Date().toISOString()});
   await txDone(tx);
   const verifyTx=db.transaction(SAFETY_STORE,'readonly'),verifyStore=verifyTx.objectStore(SAFETY_STORE);
   for(const e of expected){
    const rec=await new Promise((resolve,reject)=>{const q=verifyStore.get(e.spaceId);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error||new Error('indexeddb-read-failed'));});
    if(!rec?.backup||rec.backup.id!==e.id||rec.backup.type!=='safety'||rec.digest!==e.digest||window.rhSafetyDigestV8013(rec.backup)!==e.digest)return{ok:false,reason:'indexeddb-verify-failed'};
   }
   await txDone(verifyTx);
  }finally{db.close();}

  // Store only tiny verified pointers in the normal OTG! state. The full backup stays in IndexedDB,
  // so a large Garage / many frozen events cannot double localStorage and trip its quota.
  const byId=new Map(expected.map(e=>[e.spaceId,e]));
  for(const live of state.spaces){
   const stored=persistedState.spaces.find(x=>String(x.id)===String(live.id));if(!stored)return{ok:false,reason:'persisted-space-missing'};
   const e=byId.get(String(live.id));if(!e)return{ok:false,reason:'indexeddb-space-missing'};
   live.backups=clone(stored.backups||[]).filter(x=>x&&x.type!=='safety');
   live.safetyBackup={id:e.backup.id,type:'safety',spaceName:e.backup.spaceName,date:e.backup.date,counts:clone(e.backup.counts),storage:'indexeddb',spaceId:String(live.id),digest:e.digest};
  }
  try{rhSave();}catch(error){return{ok:false,reason:error?.name==='QuotaExceededError'?'pointer-save-quota':'pointer-save-failed',error};}
  const verifyState=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');if(!verifyState||!Array.isArray(verifyState.spaces))return{ok:false,reason:'verify-state-unavailable'};
  for(const e of expected){
   const stored=verifyState.spaces.find(x=>String(x.id)===e.spaceId),stub=stored?.safetyBackup;
   if(!stub||stub.id!==e.id||stub.type!=='safety'||stub.storage!=='indexeddb'||stub.digest!==e.digest)return{ok:false,reason:'pointer-verify-failed'};
   const manuals=(stored.backups||[]).filter(x=>x&&x.type!=='safety');if(JSON.stringify(manuals)!==e.manualDigest)return{ok:false,reason:'manual-backups-changed'};
  }
  try{localStorage.setItem('otgSafetyBackupStorage','indexeddb');}catch(_ ){}
  return{ok:true,count:expected.length,expected};
 }catch(error){console.warn('Safety Backup transaction failed',error);return{ok:false,reason:error?.message||error?.name||'exception',error};}
}
function status(t){const e=document.getElementById('rhUpdateStatus');if(e)e.textContent=t;}
function cmp(a,b){const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d;}return 0;}
function close(){document.getElementById('rhUpdateAvailable8020')?.remove();}
async function latest(){const r=await fetch(MANIFEST+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('manifest');return r.json();}
function showUpdate(m,{direct=false}={}){
 offered=m;if(document.getElementById('rhUpdateAvailable8020'))return;
 const d=document.createElement('div');d.id='rhUpdateAvailable8020';d.className='rhUpdateOverlay8015';
 d.innerHTML=`<section class="rhUpdateModal8015" role="dialog" aria-modal="true"><button class="rhUpdateClose8015" aria-label="Later">×</button><small>OTG! UPDATE AVAILABLE</small><h2>VERSION ${m.version}</h2><p>${m.message||'A newer version of OTG! is ready.'}</p><p class="rhUpdateSafety8015">A protected Safety Backup will be created and verified for every OTG! Space before the update starts.</p>${direct?'<p class="small">The new app files arrived before the installed service worker changed. OTG! has paused activation so the Safety Backup gate cannot be skipped.</p>':''}<button class="btn rhUpdateNow8015">UPDATE NOW</button><button class="btn secondary rhUpdateLater8015">LATER</button><div class="rhUpdateProgress8015" aria-live="polite"></div></section>`;
 document.body.appendChild(d);d.querySelector('.rhUpdateClose8015').onclick=close;d.querySelector('.rhUpdateLater8015').onclick=close;d.querySelector('.rhUpdateNow8015').onclick=()=>install(m,d);
}
function gateFailureText(gate){
 const reason=String(gate?.reason||'verification-failed');
 if(reason==='pointer-save-quota')return 'UPDATE COULDN’T START — Browser storage is full even after compacting the Safety Backup. Your racing data has not been replaced.';
 return `UPDATE COULDN’T START — Safety Backup could not be verified (${reason}). Your racing data has not been replaced.`;
}
async function install(m,d){
 const btn=d.querySelector('.rhUpdateNow8015'),out=d.querySelector('.rhUpdateProgress8015');btn.disabled=true;out.textContent='Creating protected Safety Backup…';
 const gate=await createAndVerifyAllSpaceSafetyBackups();if(!gate.ok){out.textContent=gateFailureText(gate);btn.disabled=false;return;}
 out.textContent=`Safety Backup verified for ${gate.count} Space${gate.count===1?'':'s'}. Installing update…`;
 try{
  sessionStorage.setItem('otgUpdateReload','1');localStorage.setItem('otgUpdateAcceptedVersion',String(m.version));
  const reg=await navigator.serviceWorker.register(m.worker,{scope:'./',updateViaCache:'none'});
  if(reg.installing){await new Promise((resolve,reject)=>{const sw=reg.installing;const done=()=>{if(sw.state==='installed')resolve();else if(sw.state==='redundant')reject(new Error('install failed'));};sw.addEventListener('statechange',done);done();});}
  const w=reg.waiting;if(w)w.postMessage({type:'SKIP_WAITING'});else if(reg.active&&reg.active.scriptURL.includes(m.worker.replace('./','')))location.reload();else throw new Error('No installable update');
  out.textContent=`OTG! ${m.version} is installing…`;
 }catch(e){console.warn(e);sessionStorage.removeItem('otgUpdateReload');out.textContent='UPDATE COULDN’T START — Your Safety Backup is protected. Try again later.';btn.disabled=false;}
}
async function check(showCurrent=false){try{const m=await latest();if(cmp(m.version,CURRENT())>0){status(`Installed version: ${CURRENT()} • Update ${m.version} available.`);showUpdate(m);return true;}if(showCurrent)status(`Installed version: ${CURRENT()} • Up to date.`);return false;}catch(e){if(showCurrent)status(`Installed version: ${CURRENT()} • Latest version unavailable. Try again later.`);return false;}}
async function manual(){const b=document.getElementById('rhCheckUpdateButton');if(b)b.disabled=true;status(`Installed version: ${CURRENT()} • Checking latest version…`);await check(true);if(b)b.disabled=false;}
function versionFromWorkerUrl(url){const m=String(url||'').match(/(?:service-worker|worker)-v(\d{4})\.js/i);if(!m)return'';const x=m[1];return `${Number(x[0])}.${Number(x[1])}.${Number(x.slice(2))}`;}
function versionFromCacheKey(k){const m=String(k||'').match(/otg-v(\d+\.\d+\.\d+)-version-pinned/i);return m?.[1]||'';}
async function priorInstalledVersion(){
 let versions=[];
 try{const reg=await navigator.serviceWorker.getRegistration('./');const v=versionFromWorkerUrl(navigator.serviceWorker.controller?.scriptURL||reg?.active?.scriptURL||reg?.waiting?.scriptURL);if(v)versions.push(v);}catch(_){}
 try{for(const k of await caches.keys()){const v=versionFromCacheKey(k);if(v)versions.push(v);}}catch(_){}
 try{const v=localStorage.getItem('otgUpdateAcceptedVersion');if(v)versions.push(v);}catch(_){}
 versions=versions.filter(v=>cmp(v,CURRENT())<0).sort(cmp);return versions.at(-1)||'';
}
window.rhStartupUpdateGate8062=async function(){
 const prior=await priorInstalledVersion();if(!prior)return false;
 try{const m=await latest();const target=cmp(m.version,CURRENT())>=0?m:{version:CURRENT(),worker:'./otg-service-worker-v8064.js',message:'OTG! v8.0.64 is ready.'};showUpdate(target,{direct:true});return true;}catch(_){showUpdate({version:CURRENT(),worker:'./otg-service-worker-v8064.js',message:'OTG! v8.0.64 is ready.'},{direct:true});return true;}
};
navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('otgUpdateReload')==='1'){sessionStorage.removeItem('otgUpdateReload');location.reload();}});
function installIndexedSafetyRestoreBridge(){
 if(window.rhIndexedSafetyRestoreBridgeV8065||typeof window.rhRestoreFinal!=='function')return;
 const base=window.rhRestoreFinal;
 window.rhRestoreFinal=async function(id){
  if(String(id)!=='SAFETY')return base.apply(this,arguments);
  const s=typeof rhSpace==='function'?rhSpace():null,stub=s?.safetyBackup;
  if(!stub||stub.storage!=='indexeddb')return base.apply(this,arguments);
  try{
   const rec=await readIndexedSafetyBackup(String(s.id)),b=rec?.backup;
   if(!b||b.id!==stub.id||b.type!=='safety'||(stub.digest&&window.rhSafetyDigestV8013?.(b)!==stub.digest)){if(typeof toast==='function')toast('Safety Backup could not be verified');return;}
   const manual=s.backups||[],safety=s.safetyBackup||null;
   Object.assign(s,typeof rhClone==='function'?rhClone(b.data):clone(b.data));s.backups=manual;s.safetyBackup=safety;rhSave();
   if(typeof toast==='function')toast('Backup restored');window.rhRenderSettings?.();
  }catch(err){console.warn('OTG! indexed Safety Backup restore failed',err);if(typeof toast==='function')toast('Safety Backup restore failed');}
 };
 window.rhIndexedSafetyRestoreBridgeV8065=true;
}
installIndexedSafetyRestoreBridge();
window.rhCheckForUpdate=manual;
window.rhAutoCheckForUpdateV8021=()=>check(false);
window.rhCreateAndVerifyAllSpaceSafetyBackupsV8064=createAndVerifyAllSpaceSafetyBackups;
window.rhReadIndexedSafetyBackupV8065=readIndexedSafetyBackup;
window.rhSafetyBackupDbNameV8065=SAFETY_DB;
})();
