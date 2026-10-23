/* OTG! v8.0.96 — portable full-data export/import; mobile-safe synchronous export handoff. */
(()=>{
'use strict';
const FORMAT='OTG_PORTABLE_BACKUP';
const FORMAT_VERSION=2;
const FALLBACK_STORE='RaceHub_Studio_Final_v5_6';
const ROLLBACK_DB='OTG_Portable_Import_Rollback_v1';
const ROLLBACK_STORE='rollback';
const CHECKPOINT_KEY='OTG_Event_Final_Checkpoint_v6092';
const APP_VERSION=()=>document.querySelector('meta[name="racehub-version"]')?.content||'8.0.96';
const STORE_KEY=()=>typeof RH_FINAL_STORE!=='undefined'?RH_FINAL_STORE:FALLBACK_STORE;
const clone=v=>JSON.parse(JSON.stringify(v));

function cleanPortableState(input){
 const out=clone(input);
 if(Array.isArray(out?.spaces))for(const s of out.spaces){
  // Safety Backups live in this browser's IndexedDB and are deliberately not portable.
  // Manual OTG!-managed backups remain inside the exported Space data.
  if(s&&Object.prototype.hasOwnProperty.call(s,'safetyBackup'))delete s.safetyBackup;
 }
 return out;
}
function validState(s){return !!(s&&typeof s==='object'&&Array.isArray(s.spaces)&&s.spaces.length>0);}
function countsFor(s){
 const spaces=Array.isArray(s?.spaces)?s.spaces:[];
 const cars=spaces.reduce((n,x)=>n+(Array.isArray(x?.cars)?x.cars.length:0),0);
 const championships=spaces.reduce((n,x)=>n+(Array.isArray(x?.runs)?x.runs.length:0)+(Array.isArray(x?.raceOffs)?x.raceOffs.length:0),0);
 const results=spaces.reduce((n,x)=>{
  const runResults=(Array.isArray(x?.runs)?x.runs:[]).reduce((a,r)=>a+(Array.isArray(r?.results)?r.results.length:0),0);
  const eventResults=(Array.isArray(x?.customEvents)?x.customEvents:[]).reduce((a,e)=>a+(Array.isArray(e?.results)?e.results.length:0),0);
  return n+runResults+eventResults;
 },0);
 return{spaces:spaces.length,cars,championships,results};
}
function checksum(text){
 // Fast synchronous FNV-1a style integrity check: no await before mobile Share/Download.
 let h=0x811c9dc5;
 for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
 return h.toString(16).padStart(8,'0');
}
async function sha256(text){
 try{
  if(!globalThis.crypto?.subtle||typeof TextEncoder==='undefined')return'';
  const data=new TextEncoder().encode(text),hash=await crypto.subtle.digest('SHA-256',data);
  return[...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
 }catch(_){return'';}
}
function stamp(){return new Date().toISOString().replace(/[:.]/g,'-');}
function filename(){return`OTG-PORTABLE-BACKUP-${stamp()}.json`;}
function makeFile(json,name){
 const blob=new Blob([json],{type:'application/json'});
 if(typeof File==='function'){
  try{return new File([blob],name,{type:'application/json',lastModified:Date.now()});}catch(_){ }
 }
 return blob;
}
function downloadBlob(blob,name){
 if(!globalThis.URL?.createObjectURL)throw new Error('This browser cannot create a downloadable backup file.');
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);
 a.click();
 setTimeout(()=>{a.remove();URL.revokeObjectURL(url);},2500);
}
function portablePayloadSync(){
 try{if(typeof rhSave==='function')rhSave();}catch(err){console.warn('OTG! save-before-export warning',err);}
 const key=STORE_KEY(),raw=localStorage.getItem(key);
 if(!raw)throw new Error(`No OTG! state was found in ${key}.`);
 let parsed;
 try{parsed=JSON.parse(raw);}catch(_){throw new Error('The saved OTG! state could not be read as JSON.');}
 if(!validState(parsed))throw new Error('The saved OTG! state does not contain any Spaces.');
 const portable=cleanPortableState(parsed),stateText=JSON.stringify(portable);
 return{
  format:FORMAT,
  formatVersion:FORMAT_VERSION,
  app:'Out The Garage!',
  appVersion:APP_VERSION(),
  exportedAt:new Date().toISOString(),
  sourceStore:key,
  counts:countsFor(portable),
  stateChecksum:checksum(stateText),
  stateLength:stateText.length,
  data:{state:portable,checkpoint:localStorage.getItem(CHECKPOINT_KEY)||null}
 };
}
function exportPortable(){
 // IMPORTANT: no await before navigator.share() / anchor.click(). Mobile browsers can otherwise
 // revoke the user gesture and block the file action.
 try{
  const payload=portablePayloadSync(),json=JSON.stringify(payload,null,2),name=filename(),file=makeFile(json,name);
  const canNativeShare=typeof File==='function'&&file instanceof File&&typeof navigator.share==='function'&&(!navigator.canShare||navigator.canShare({files:[file]}));
  if(canNativeShare){
   navigator.share({files:[file],title:'OTG! Portable Backup',text:'Portable OTG! data backup'}).then(()=>{
    if(typeof toast==='function')toast('Backup shared');
   }).catch(err=>{
    if(err?.name==='AbortError')return;
    console.warn('OTG! portable share failed; using direct download',err);
    try{downloadBlob(file,name);if(typeof toast==='function')toast('Backup exported');}
    catch(fallbackErr){showExportError(fallbackErr);}
   });
   return;
  }
  downloadBlob(file,name);
  if(typeof toast==='function')toast('Backup exported');
 }catch(err){showExportError(err);}
}
function showExportError(err){
 console.error('OTG! portable export failed',err);
 const msg=err?.message||err?.name||'Unknown browser error';
 if(typeof toast==='function')toast('Backup export failed');
 alert(`BACKUP EXPORT FAILED\n\n${msg}\n\nYour OTG! data has not been changed.`);
}

function openRollbackDb(){return new Promise((resolve,reject)=>{
 if(!('indexedDB'in window))return reject(new Error('IndexedDB unavailable'));
 const req=indexedDB.open(ROLLBACK_DB,1);
 req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(ROLLBACK_STORE))db.createObjectStore(ROLLBACK_STORE,{keyPath:'id'});};
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('Rollback database failed'));
});}
async function saveRollback(){
 const raw=localStorage.getItem(STORE_KEY());if(!raw)return false;
 const db=await openRollbackDb();
 try{await new Promise((resolve,reject)=>{const tx=db.transaction(ROLLBACK_STORE,'readwrite');tx.objectStore(ROLLBACK_STORE).put({id:'latest',savedAt:new Date().toISOString(),appVersion:APP_VERSION(),stateRaw:raw,checkpoint:localStorage.getItem(CHECKPOINT_KEY)||null});tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});return true;}finally{db.close();}
}
async function readRollback(){
 try{const db=await openRollbackDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction(ROLLBACK_STORE,'readonly'),q=tx.objectStore(ROLLBACK_STORE).get('latest');q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);});}finally{db.close();}}catch(_){return null;}
}
async function restoreRollback(){
 const rec=await readRollback();if(!rec?.stateRaw){if(typeof toast==='function')toast('No pre-import rollback available');return;}
 if(!confirm(`RESTORE PRE-IMPORT DATA?\n\nThis will replace the current OTG! data on this device with the copy saved before the last portable import (${new Date(rec.savedAt).toLocaleString('en-GB')}).`))return;
 try{JSON.parse(rec.stateRaw);localStorage.setItem(STORE_KEY(),rec.stateRaw);if(rec.checkpoint==null)localStorage.removeItem(CHECKPOINT_KEY);else localStorage.setItem(CHECKPOINT_KEY,rec.checkpoint);location.reload();}catch(err){console.error(err);if(typeof toast==='function')toast('Rollback restore failed');}
}
async function importFile(file){
 try{
  if(!file)return;
  const payload=JSON.parse(await file.text());
  if(payload?.format!==FORMAT||![1,2].includes(Number(payload?.formatVersion)))throw new Error('This is not a supported OTG! portable backup.');
  const imported=payload?.data?.state;if(!validState(imported))throw new Error('The backup does not contain valid OTG! Space data.');
  const state=cleanPortableState(imported),stateText=JSON.stringify(state);
  if(payload.stateChecksum&&checksum(stateText)!==payload.stateChecksum)throw new Error('Backup integrity check failed.');
  if(payload.stateSha256){const actual=await sha256(stateText);if(actual&&actual!==payload.stateSha256)throw new Error('Backup integrity check failed.');}
  const c=countsFor(state),ok=confirm(`IMPORT OTG! PORTABLE BACKUP?\n\nBackup: ${new Date(payload.exportedAt||Date.now()).toLocaleString('en-GB')}\n${c.spaces} Space${c.spaces===1?'':'s'} • ${c.cars} cars • ${c.championships} Championships\n\nThis replaces ALL OTG! Spaces and racing data currently stored on this device. A pre-import rollback copy will be kept on this device.`);
  if(!ok)return;
  try{await saveRollback();}catch(err){console.warn('OTG! pre-import rollback could not be saved',err);if(!confirm('The automatic pre-import rollback could not be created. Continue with the import anyway?'))return;}
  localStorage.setItem(STORE_KEY(),stateText);
  const checkpoint=payload?.data?.checkpoint;if(checkpoint==null)localStorage.removeItem(CHECKPOINT_KEY);else localStorage.setItem(CHECKPOINT_KEY,String(checkpoint));
  location.reload();
 }catch(err){console.error('OTG! portable import failed',err);alert(`IMPORT FAILED\n\n${err?.message||'The selected file could not be imported.'}\n\nYour current OTG! data has not been replaced.`);}
}
function chooseImport(){
 let input=document.getElementById('rhPortableImportFile8096');
 if(!input){input=document.createElement('input');input.id='rhPortableImportFile8096';input.type='file';input.accept='.json,application/json';input.style.display='none';input.addEventListener('change',async()=>{const file=input.files?.[0];input.value='';await importFile(file);});document.body.appendChild(input);}
 input.click();
}
async function updateRollbackVisibility(){const b=document.getElementById('rhPortableRollbackButton8096');if(!b)return;const rec=await readRollback();b.hidden=!rec?.stateRaw;if(rec?.savedAt)b.querySelector('span').textContent=`Undo last portable import • ${new Date(rec.savedAt).toLocaleString('en-GB')} ›`;}
function injectSettings(){
 const host=document.getElementById('more');
 const content=host?.querySelector('.rhContent');
 if(!host||!content||document.getElementById('rhPortableBackupPanel8096'))return;
 const heading=host.querySelector('h1')?.textContent||'';
 if(!/SETTINGS/i.test(heading))return;
 // Remove the v8.0.95 panel if a stale page somehow carried it across during update.
 document.getElementById('rhPortableBackupPanel8095')?.remove();
 const section=document.createElement('section');section.id='rhPortableBackupPanel8096';section.className='rhSection';
 section.innerHTML=`<h2>PORTABLE BACKUP</h2><p class="small">Move OTG! data between devices or keep an export outside the browser. Export includes every OTG! Space, Garage and racing history; browser-only Safety Backup snapshots are not copied.</p><button class="rhSettingRow" onclick="rhExportPortableBackupV8096()"><b>EXPORT BACKUP</b><span>Share / save all OTG! data ›</span></button><button class="rhSettingRow" onclick="rhChoosePortableImportV8096()"><b>IMPORT BACKUP</b><span>Restore all OTG! data from a file ›</span></button><button id="rhPortableRollbackButton8096" class="rhSettingRow" hidden onclick="rhRestorePortableRollbackV8096()"><b>RESTORE PRE-IMPORT</b><span>Undo the last portable import on this device ›</span></button>`;
 const sections=Array.from(content.children).filter(el=>el.tagName==='SECTION');
 const danger=sections.find(el=>/DANGER ZONE/i.test(el.querySelector('h2')?.textContent||''))||content.querySelector('.rhDangerFinal,.danger');
 if(danger)content.insertBefore(section,danger);else content.appendChild(section);
 updateRollbackVisibility();
}
function installSettingsObserver(){
 const host=document.getElementById('more');
 if(!host||window.rhPortableSettingsObserverV8096)return;
 let queued=false;
 const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;injectSettings();});};
 const obs=new MutationObserver(schedule);obs.observe(host,{childList:true,subtree:true});
 window.rhPortableSettingsObserverV8096=obs;
 schedule();
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
 window.addEventListener('pageshow',schedule);
}
window.rhExportPortableBackupV8096=exportPortable;
window.rhChoosePortableImportV8096=chooseImport;
window.rhRestorePortableRollbackV8096=restoreRollback;
window.rhPortableBackupFormatV8096=FORMAT;
installSettingsObserver();
})();
