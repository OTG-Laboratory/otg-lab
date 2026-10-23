/* OTG! LAB v0.6 — same-origin, independently hosted FH5 catalogue download library.
   This never applies a pack directly. It verifies content SHA-256 first, then
   hands the full pack to the existing v0.5 identity/safety preflight.
   MAIN and blank custom Spaces are not involved. */
(()=>{
'use strict';
const MANIFEST='./catalogue-packs/library-v1.json';
const LIBRARY_SCHEMA='otg-lab-catalogue-library-v1';
const MAX_MANIFEST_BYTES=65536,MAX_PACK_BYTES=2_000_000;
const LAB_ORIGINS=new Set(['otg-laboratory.github.io','localhost','127.0.0.1']);
if(!LAB_ORIGINS.has(location.hostname))return;
let library=null,requestActive=false;
const $=s=>document.querySelector(s);
const text=(v)=>String(v??'');
function exactUrl(relative){
 const url=new URL(relative,location.href);
 if(url.origin!==location.origin||url.username||url.password)throw Error('Cross-origin catalogue download blocked');
 return url;
}
function validateManifest(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.schema!==LIBRARY_SCHEMA||raw.channel!=='OTG-LAB'||!Array.isArray(raw.packs)||raw.packs.length<1||raw.packs.length>20)throw Error('Unrecognised LAB catalogue library');
 const seen=new Set();
 const packs=raw.packs.map(p=>{
  if(!p||typeof p!=='object'||Array.isArray(p)||p.id!=='fh5-complete'||p.game!=='Forza Horizon 5'||p.catalogueKey!=='fh5-catalogue-v1'||!/^\d+\.\d+\.\d+$/.test(text(p.packVersion)))throw Error('Unsupported pack metadata');
  if(p.cars!==902||p.tracks!==145||!/^\.\/catalogue-packs\/fh5-complete-\d+\.\d+\.\d+\.json$/.test(text(p.path))||!(/^[a-f0-9]{64}$/.test(text(p.sha256))))throw Error('Unsupported or unsafe pack size or filename');
  if(!text(p.path).endsWith('-'+p.packVersion+'.json'))throw Error('Pack version does not match filename');
  if(seen.has(p.id))throw Error('Duplicate catalogue identifier');
  seen.add(p.id);exactUrl(p.path);
  return {id:p.id,title:text(p.title).slice(0,80),status:text(p.status).slice(0,120),game:p.game,catalogueKey:p.catalogueKey,packVersion:p.packVersion,path:p.path,sha256:p.sha256,cars:p.cars,tracks:p.tracks};
 });
 return {libraryVersion:text(raw.libraryVersion).slice(0,30),packs};
}
async function fetchBounded(url,maxBytes){
 const response=await fetch(url.href,{cache:'no-store',credentials:'same-origin',redirect:'error'});
 if(!response.ok||response.type==='opaque')throw Error('Catalogue server returned '+response.status);
 const reported=Number(response.headers?.get?.('content-length'));
 if(Number.isFinite(reported)&&reported>maxBytes)throw Error('Catalogue file exceeds download limit');
 // Reading into RAM is capped by the hosting model; validate total bytes
 // before decode/parse. JSON packs are limited to 2 MB by the engine too.
 const bytes=await response.arrayBuffer();
 if(bytes.byteLength>maxBytes)throw Error('Catalogue file exceeds download limit');
 return bytes;
}
function decodeJSON(bytes){
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
 catch(_){throw Error('Catalogue server returned invalid JSON');}
}
async function browse(){
 const url=exactUrl(MANIFEST);url.searchParams.set('check',Date.now().toString());
 const bytes=await fetchBounded(url,MAX_MANIFEST_BYTES);
 return validateManifest(decodeJSON(bytes));
}
async function downloadVerified(p){
 if(!p||p.id!=='fh5-complete')throw Error('Catalogue is not in the approved directory');
 // Read immutable validated entry again: callers cannot redirect downloads.
 const entry=validateManifest({schema:LIBRARY_SCHEMA,channel:'OTG-LAB',packs:[p]}).packs[0];
 if(!crypto?.subtle?.digest)throw Error('Secure catalogue verification is unavailable on this device');
 const bytes=await fetchBounded(exactUrl(entry.path),MAX_PACK_BYTES);
 const actual=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');
 if(actual!==entry.sha256)throw Error('Catalogue checksum mismatch — download REFUSED');
 const pack=decodeJSON(bytes);
 if(pack.schema!=='otg-lab-fh5-catalogue-pack-v1'||pack.catalogueKey!==entry.catalogueKey||pack.game!==entry.game||pack.packVersion!==entry.packVersion||!Array.isArray(pack.cars)||!Array.isArray(pack.tracks)||pack.cars.length!==entry.cars||pack.tracks.length!==entry.tracks)throw Error('Downloaded catalogue does not match the directory');
 return pack;
}
function eligible(){
 return !!($('#otgLabPackPanel05') && window.rhLabFH5Pack05?.readAndPreview);
}
function host(){return $('#otgLabRemoteCatalogues06');}
function show(msg,error=false){
 const h=host(),out=h?.querySelector('.otgLabRemoteStatus06');
 if(out){out.textContent=msg;out.style.color=error?'#ffaaaa':'#9de1ed';}
}
function buttonsDisabled(value){const h=host();h?.querySelectorAll('button').forEach(b=>b.disabled=value);}
function clearPriorPreview(){
 // No stale preflight can remain APPLY-able if a fresh online download fails.
 window.rhLabFH5Pack05?.clearPreview?.();
}
async function browseFromUI(){
 if(requestActive)return;
 requestActive=true;library=null;clearPriorPreview();buttonsDisabled(true);
 show('Checking the independent LAB catalogue directory…');
 try{
  library=await browse();
  const entry=library.packs[0];
  const area=host()?.querySelector('.otgLabRemoteSelection06');
  if(area){area.hidden=false;
   area.querySelector('.otgLabRemoteDetails06').textContent=`${entry.title} • Pack v${entry.packVersion} • ${entry.cars} cars • ${entry.tracks} tracks. ${entry.status}`;
  }
  show('Catalogue available online. Nothing has been installed. Choose DOWNLOAD & PREVIEW to verify its contents.');
 }catch(e){const area=host()?.querySelector('.otgLabRemoteSelection06');if(area)area.hidden=true;show('DOWNLOAD BLOCKED: '+text(e.message||e),true);}
 finally{requestActive=false;buttonsDisabled(false);}
}
async function downloadFromUI(){
 if(requestActive||!library?.packs?.length)return;
 requestActive=true;clearPriorPreview();buttonsDisabled(true);
 show('Downloading the selected FH5 pack; verifying SHA-256 and protected catalogue IDs…');
 try{
  const pack=await downloadVerified(library.packs[0]);
  // This only previews; the user's separate APPLY button still requires a
  // confirmation and creates and verifies Space Safety Backups before write.
  await window.rhLabFH5Pack05.readAndPreview(pack);
  const result=$('#otgLabPackPanel05 .otgLabPackResult05')?.textContent||'';
  if(!result.startsWith('VERIFIED:'))throw Error('Downloaded pack failed permanent-ID preflight');
  show('DOWNLOAD VERIFIED. Review the VERIFIED details below. No installation has occurred; APPLY remains a separate step.');
 }catch(e){clearPriorPreview();show('DOWNLOAD BLOCKED: '+text(e.message||e)+' — no saved data changed.',true);}
 finally{requestActive=false;buttonsDisabled(false);}
}
function ensureUI(){
 if(!eligible()){host()?.remove();return;}
 if(host())return;
 const old=$('#otgLabPackPanel05');
 const div=document.createElement('div');div.id='otgLabRemoteCatalogues06';
 div.style.cssText='border-top:1px solid rgba(92,196,208,.25);margin-top:16px;padding-top:12px;';
 div.innerHTML=`<h3>🌐 DOWNLOADABLE FH5 CATALOGUE — LAB</h3>
 <p class="small">Fetch a complete catalogue separately from the app. Downloads come from this LAB website, and are checked before the existing protected installer can apply them. FH5 is already built into this development app; this is a download/preservation test, not yet the public optional-catalogue build.</p>
 <button type="button" class="rhSettingRow otgLabRemoteCheck06"><b>CHECK ONLINE FH5 CATALOGUE LIBRARY</b><span>No download or data changes ›</span></button>
 <div class="otgLabRemoteSelection06" hidden><p class="small otgLabRemoteDetails06"></p><button type="button" class="rhSettingRow otgLabRemoteDownload06"><b>DOWNLOAD &amp; PREVIEW</b><span>Verify SHA-256, all 902 car IDs and all 145 route IDs; no install ›</span></button></div>
 <p class="otgLabRemoteStatus06 small" aria-live="polite">No online catalogue has been fetched.</p>`;
 old.appendChild(div);
 div.querySelector('.otgLabRemoteCheck06').addEventListener('click',browseFromUI);
 div.querySelector('.otgLabRemoteDownload06').addEventListener('click',downloadFromUI);
}
// Settings is rebuilt by legacy scripts: recreate the remote controls only on FH5.
const previous=window.rhRenderSettings;
if(typeof previous==='function')window.rhRenderSettings=function(){const out=previous.apply(this,arguments);ensureUI();return out};
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-tab="more"],#navMore,#more'))setTimeout(ensureUI,0)},true);
ensureUI();
window.rhLabRemoteCatalogues06=Object.freeze({validateManifest,browse,downloadVerified,ensureUI});
})();
