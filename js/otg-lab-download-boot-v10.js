/* OTG! LAB v0.10 — independent FH5 car catalogue startup gate.
   No saved Space, ownership, racing history, or reset is changed by this script.
   Boot refuses to load the normal app until the separate car pack is verified. */
(()=>{
 'use strict';
 const HOSTS=new Set(['otg-laboratory.github.io','localhost','127.0.0.1']);
 const PIN='78203708193b4880e0a27b4f9b594fc66fda0be7df091360f47564900d00b90e';
 const CACHE='otg-lab:verified-fh5-boot-v09';
 const TRACK_PIN='38391e98d921ad8db1a8c3ddf9cfa8bca05ba8e9ce64c51ac5c77f5ee25ef1ee';
 const TRACK_CACHE='otg-lab:verified-fh5-tracks-v10';
 const TRACK_LIBRARY='./catalogue-packs/tracks-library-v1.json';
 const TRACK_PACK='./catalogue-packs/fh5-tracks-1.0.0.json';
 const PACK='./catalogue-packs/fh5-complete-1.0.0.json';
 const LIBRARY='./catalogue-packs/library-v1.json';
 const MAX_BYTES=2_000_000;
 let busy=false,started=false;
 function show(){
  let box=document.getElementById('otgLabBoot10');if(box)return box;
  box=document.createElement('section');box.id='otgLabBoot10';
  box.setAttribute('role','status');box.setAttribute('aria-live','polite');
  box.style.cssText='position:relative;z-index:5;max-width:720px;margin:28px auto 60px;padding:26px;border:2px solid #338da9;border-radius:24px;background:#061521;color:#eafaff;font:17px system-ui,sans-serif;box-shadow:0 9px 40px #000a;';
  box.innerHTML='<h2 style="margin:0 0 13px;color:#58c0d9">🧪 LAB v0.10 — Downloaded FH5 Catalogue</h2><p>For this experiment the FH5 car and track catalogues are <b>not embedded in the running application JavaScript</b>. We verify both separate LAB downloads before starting your existing Spaces.</p><p class="otgLabBootStatus10">Checking for previously verified car and track downloads…</p><button type="button" class="otgLabBootDownload10" style="padding:16px 24px;background:#06304b;color:white;border:1px solid #61bfd8;border-radius:18px;font:700 17px system-ui;display:none;cursor:pointer">DOWNLOAD &amp; VERIFY FH5 PACKS</button><p style="font-size:13px;color:#a5c0ca">Safe stop: if download fails, no Space or racing data is altered. Original LAB v0.8.1 ZIP is the rollback.</p>';
  (document.querySelector('main')||document.body).prepend(box);
  box.querySelector('button').addEventListener('click',()=>boot(true));return box;
 }
 function status(msg,action=false){const box=show();box.querySelector('.otgLabBootStatus10').textContent=msg;box.querySelector('button').style.display=action?'block':'none'}
 async function digest(bytes){if(!globalThis.crypto?.subtle)throw Error('This phone does not support SHA-256 verification');return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(x=>x.toString(16).padStart(2,'0')).join('')}
 const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
 function dataChecks(pack){if(!pack||pack.schema!=='otg-lab-fh5-catalogue-pack-v1'||pack.game!=='Forza Horizon 5'||pack.catalogueKey!=='fh5-catalogue-v1'||pack.packVersion!=='1.0.0'||!Array.isArray(pack.cars)||pack.cars.length!==902||!Array.isArray(pack.tracks)||pack.tracks.length!==145)throw Error('Unexpected or incomplete FH5 pack');
   const ids=new Set(),routes=new Set();for(let i=0;i<pack.cars.length;i++){const x=pack.cars[i];if(x.catalogueId!==`fh5-v1-${String(i+1).padStart(4,'0')}`||ids.has(x.catalogueId)||!['make','model','full','year','classType','legacyId'].every(k=>typeof x[k]==='string'&&x[k]))throw Error('Protected car IDs or fields corrupted');ids.add(x.catalogueId)}
   for(const x of pack.tracks){if(!x||!/^fh5-track-v1-\d{4}$/.test(x.trackId)||routes.has(x.trackId))throw Error('Protected route identities corrupted');routes.add(x.trackId)}
   // All route descriptions, category/classification data arrive in the signed pack;
   // legacy runtime track pools remain separate until a later LAB migration.
   return pack; }
 function trackChecks(pack){
  if(!pack||pack.schema!=='otg-lab-fh5-track-pack-v1'||pack.game!=='Forza Horizon 5'||pack.catalogueKey!=='fh5-catalogue-v1'||pack.packVersion!=='1.0.0'||!Array.isArray(pack.tracks)||pack.tracks.length!==145)throw Error('Unexpected or incomplete FH5 track pack');
  const ids=new Set(),names=new Set();
  for(let i=0;i<pack.tracks.length;i++){
   const x=pack.tracks[i];const id=`fh5-track-v1-${String(i+1).padStart(4,'0')}`;
   if(!x||x.trackId!==id||ids.has(x.trackId)||typeof x.name!=='string'||!x.name||names.has(x.name.normalize('NFKD').toLowerCase())||
   !['world','category','discipline','locationHint'].every(k=>typeof x[k]==='string'&&x[k])||
   !['standard','finale','special'].every(k=>typeof x[k]==='boolean'))throw Error('FH5 track identity, metadata or location hint corrupted');
   ids.add(x.trackId);names.add(x.name.normalize('NFKD').toLowerCase());
  }
  return pack;
 }
 async function loadTracks(useNetwork){
  let bytes;
  if(!useNetwork){try{const saved=localStorage.getItem(TRACK_CACHE);if(saved&&saved.length<MAX_BYTES)bytes=enc.encode(saved)}catch(_){}}
  if(!bytes){
   const lib=JSON.parse(dec.decode(await fetchBytes(TRACK_LIBRARY,65536)));
   const ent=lib?.packs?.[0];if(lib.schema!=='otg-lab-track-library-v1'||lib.channel!=='OTG-LAB'||lib.packs.length!==1||
   ent.id!=='fh5-tracks'||ent.path!==TRACK_PACK||ent.sha256!==TRACK_PIN||ent.tracks!==145||ent.packVersion!=='1.0.0')throw Error('Independent FH5 track library no longer matches pinned identity');
   bytes=await fetchBytes(TRACK_PACK,MAX_BYTES);
  }
  if(await digest(bytes)!==TRACK_PIN)throw Error('FH5 TRACK SHA-256 FAILED; app stays stopped');
  const pack=trackChecks(JSON.parse(dec.decode(bytes)));
  if(useNetwork||!localStorage.getItem(TRACK_CACHE)){try{localStorage.setItem(TRACK_CACHE,dec.decode(bytes))}catch(e){console.warn('LAB routes could not be cached',e)}}
  return pack;
 }
 async function fetchBytes(path,max){const r=await fetch(path,{cache:'no-store',redirect:'error',credentials:'same-origin'});if(!r.ok||r.type==='opaque')throw Error('Online catalogue unavailable ('+r.status+')');const ab=await r.arrayBuffer();if(ab.byteLength>max)throw Error('Downloaded file too large');return new Uint8Array(ab)}
 async function loadPack(useNetwork){
  let bytes;
  if(!useNetwork){try{const saved=localStorage.getItem(CACHE);if(saved&&saved.length<MAX_BYTES)bytes=enc.encode(saved)}catch(_){}}
  if(!bytes){
   const lib=JSON.parse(dec.decode(await fetchBytes(LIBRARY,65536)));
   const ent=lib?.packs?.[0];if(lib.schema!=='otg-lab-catalogue-library-v1'||lib.channel!=='OTG-LAB'||lib.packs.length!==1||ent.id!=='fh5-complete'||ent.path!==PACK||ent.sha256!==PIN||ent.cars!==902||ent.tracks!==145)throw Error('Online library no longer matches the protected FH5 catalogue');
   bytes=await fetchBytes(PACK,MAX_BYTES);
  }
  if(await digest(bytes)!==PIN)throw Error('SHA-256 check FAILED; app cannot boot with an unverified catalogue');
  const pack=dataChecks(JSON.parse(dec.decode(bytes)));
  if(useNetwork||!localStorage.getItem(CACHE)){try{localStorage.setItem(CACHE,dec.decode(bytes))}catch(e){console.warn('LAB catalogue cannot be cached on this phone',e)}}
  return pack;
 }
 async function loadScripts(){
  const raw=await fetchBytes('./js/otg-lab-boot-manifest-v10.json?v=lab10',40000),manifest=JSON.parse(dec.decode(raw));
  if(manifest.schema!=='otg-lab-script-boot-v1'||manifest.scripts.length<100||manifest.scripts.some(x=>!/^js\/[\w.\-]+\.js\?v=[\w.\-?=]+$/.test(x)))throw Error('LAB script manifest is invalid');
  // Keep exactly the same script execution order as v0.8.1.
  // The app's first bootstrap begins only AFTER the downloaded pack is verified.
  const total=manifest.scripts.length;let n=0;
  for(const path of manifest.scripts){
   await new Promise((resolve,reject)=>{
    const s=document.createElement('script');s.async=false;s.src=path;
    s.onload=()=>{n++;if(n%25===0)status('Both catalogues verified. Starting LAB modules '+n+'/'+total+'…');resolve()};
    s.onerror=()=>reject(Error('Required LAB module failed to load: '+path));
    document.body.appendChild(s);
   });
  }
  // Since the app modules were delayed until AFTER document load, replay
  // their legacy one-shot lifecycle hooks exactly once after every module.
  document.dispatchEvent(new Event('DOMContentLoaded'));
  window.dispatchEvent(new Event('load'));
  status('VERIFIED — 902 FH5 cars and 145 FH5 tracks; LAB is ready.');
  setTimeout(()=>document.getElementById('otgLabBoot10')?.remove(),300);
 }
 async function boot(force=false){if(started||busy)return;busy=true;status('Verifying independent FH5 car and track catalogue files…');try{
  if(!HOSTS.has(location.hostname))throw Error('Protected LAB hostname required');
  let pack;
  if(!force){try{pack=await loadPack(false)}catch(e){throw e}}
  else pack=await loadPack(true);
  const trackPack=await loadTracks(force);
  // Both verified catalogues exist only in memory until the app needs them; never in master JS lists.
  window.OTG_LAB_VERIFIED_FH5_TRACKS_V10=trackPack.tracks.map(({locationHint,...row})=>row);
  window.OTG_LAB_VERIFIED_FH5_TRACK_HINTS_V10=Object.fromEntries(trackPack.tracks.map(t=>[t.name,t.locationHint]));
  window.OTG_LAB_VERIFIED_FH5_CARS_V09=pack.cars;
  window.OTG_LAB_VERIFIED_FH5_TRACKS_V09=pack.tracks;
  status('Verified independent 902-car and 145-route SHA-256 packs. Starting your existing LAB Spaces…');
  started=true;await loadScripts();
 }catch(e){started=false;status('SAFE STOP — '+String(e.message||e)+'. Your Spaces have not been changed by the catalogue loader. Tap DOWNLOAD & VERIFY to retry.',true);console.error('LAB v0.10 boot:',e)}finally{busy=false}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{show();boot(false)},{once:true});else{show();boot(false)}
})();
