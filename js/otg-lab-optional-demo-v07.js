/* OTG! LAB v0.7 optional-catalogue proof — standalone, isolated IndexedDB only.
   NEVER opens, reads, resets or modifies core OTG! storage or other Spaces.
   No game catalogue JS is loaded before user explicitly opts in. */
(()=>{'use strict';
const HOSTS=['otg-laboratory.github.io','localhost','127.0.0.1'];
if(!HOSTS.includes(location.hostname))return;
const dbName='otg-lab-optional-catalogue-demo-v07',storeName='packs';
const $=id=>document.getElementById(id);
const entryPath='./catalogue-packs/library-v1.json';
const expectedSchema='otg-lab-catalogue-library-v1';
let selected=null,busy=false,installedPack=null;
function status(id,msg,error=false){const el=$(id);el.textContent=msg;el.classList.toggle('failure',error);}
function safeUrl(path){const u=new URL(path,location.href);if(u.origin!==location.origin||u.username||u.password)throw Error('Catalogue host mismatch');return u;}
function checkEntry(raw){
 if(raw?.schema!==expectedSchema||raw.channel!=='OTG-LAB'||!Array.isArray(raw.packs)||raw.packs.length!==1)throw Error('Unsupported catalogue directory');
 const p=raw.packs[0];
 if(p?.id!=='fh5-complete'||p.catalogueKey!=='fh5-catalogue-v1'||p.game!=='Forza Horizon 5'||p.packVersion!=='1.0.0'||p.cars!==902||p.tracks!==145)throw Error('Unexpected catalogue details');
 if(p.path!=='./catalogue-packs/fh5-complete-1.0.0.json'||!/^[0-9a-f]{64}$/.test(String(p.sha256)))throw Error('Catalogue filename or checksum not trusted');
 safeUrl(p.path);return p;
}
async function fetchBytes(path,max){
 const resp=await fetch(safeUrl(path),{cache:'no-store',credentials:'same-origin',redirect:'error'});
 if(!resp.ok||resp.type==='opaque'||resp.redirected)throw Error('Catalogue download failed');
 const advertised=Number(resp.headers?.get?.('content-length'));
 if(advertised>max)throw Error('File is too large');
 const bytes=await resp.arrayBuffer();if(bytes.byteLength>max)throw Error('File exceeds safe limit');return bytes;
}
const decode=bytes=>JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
function validatePack(pack,p){
 if(pack?.schema!=='otg-lab-fh5-catalogue-pack-v1'||pack.catalogueKey!==p.catalogueKey||pack.game!==p.game||pack.packVersion!==p.packVersion||!Array.isArray(pack.cars)||!Array.isArray(pack.tracks)||pack.cars.length!==902||pack.tracks.length!==145)throw Error('Unrecognised catalogue data');
 let carIDs=new Set(),trackIDs=new Set();
 for(const c of pack.cars){if(!/^fh5-v1-\d{4}$/.test(String(c?.catalogueId))||carIDs.has(c.catalogueId)||!c.make||!c.model||!c.year)throw Error('Invalid or repeated car identity');carIDs.add(c.catalogueId)}
 for(const t of pack.tracks){if(!/^fh5-track-v1-\d{4}$/.test(String(t?.trackId))||trackIDs.has(t.trackId)||!t.name)throw Error('Invalid or repeated track identity');trackIDs.add(t.trackId)}
 return true;
}
function openDB(){return new Promise((resolve,reject)=>{
 const req=indexedDB.open(dbName,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(storeName))req.result.createObjectStore(storeName)};
 req.onerror=()=>reject(req.error||Error('Storage unavailable'));req.onsuccess=()=>resolve(req.result);
})}
async function dbGet(){const db=await openDB();return new Promise((resolve,reject)=>{
 const tx=db.transaction(storeName,'readonly');const req=tx.objectStore(storeName).get('fh5');req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error||Error('Read failed'));tx.oncomplete=()=>db.close();tx.onerror=()=>reject(tx.error||Error('Read failed'));
})}
async function dbPut(value){const db=await openDB();return new Promise((resolve,reject)=>{
 const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).put(value,'fh5');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error||Error('Write failed'))};tx.onabort=()=>{db.close();reject(tx.error||Error('Write aborted'))};
})}
async function dbDelete(){const db=await openDB();return new Promise((resolve,reject)=>{
 const tx=db.transaction(storeName,'readwrite');tx.objectStore(storeName).delete('fh5');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error||Error('Delete failed'))};tx.onabort=()=>{db.close();reject(tx.error||Error('Delete aborted'))};
})}
function renderResults(){
 const node=$('results');node.replaceChildren();if(!installedPack)return;
 const q=String($('find').value||'').trim().toLowerCase();let found=0;
 for(const c of installedPack.cars){if(q&&!`${c.make} ${c.model} ${c.year}`.toLowerCase().includes(q))continue;found++;
  if(found<=30){const row=document.createElement('div');row.className='item';row.textContent=`${c.year} ${c.make} ${c.model} · ${c.classType||''}`;node.appendChild(row)}
 }
 if(!found)node.textContent='No matching cars.';
}
function render(){
 $('carSection').hidden=!installedPack;$('remove').disabled=!installedPack;
 if(installedPack){status('summary',`OPTIONAL FH5 DEMO INSTALLED • ${installedPack.cars.length} cars • ${installedPack.tracks.length} routes. Your original LAB Garage has not been changed.`);renderResults()}
 else {status('summary','CLEAN START • 0 installed cars • 0 installed routes. No catalogue chosen.');$('find').value='';$('results').replaceChildren()}
}
function lock(value){busy=value;$('browse').disabled=value;$('install').disabled=value||!selected;$('remove').disabled=value||!installedPack}
async function browse(){if(busy)return;selected=null;lock(true);status('online','Checking LAB catalogue directory…');try{
 const bytes=await fetchBytes(entryPath,65536);const p=checkEntry(decode(bytes));selected=p;
 status('online',`${p.title} • Pack v${p.packVersion} • ${p.cars} cars and ${p.tracks} routes. Download is optional; no pack has been installed from this check.`)
 }catch(e){status('online','CHECK BLOCKED: '+String(e.message||e),true)}finally{lock(false)}}
async function install(){if(busy||!selected)return;lock(true);status('online','Downloading independently hosted pack and verifying SHA-256…');try{
 if(!crypto?.subtle?.digest)throw Error('Secure SHA-256 not supported');
 const bytes=await fetchBytes(selected.path,2_000_000);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==selected.sha256)throw Error('Checksum does not match the approved directory');
 const pack=decode(bytes);validatePack(pack,selected);
 // Only a namespaced demo DB is used. No ordinary OTG! localStorage key is read or written.
 await dbPut(pack);const check=await dbGet();if(!check||check.cars?.length!==902||check.tracks?.length!==145)throw Error('Demo installation verification failed');
 installedPack=check;render();status('online','INSTALLED INTO ISOLATED DEMO ONLY — verified 902 cars / 145 routes. No real Garage or Space was changed.');
 }catch(e){status('online','INSTALL BLOCKED: '+String(e.message||e),true)}finally{lock(false)}}
async function remove(){if(busy||!installedPack)return;
 if(!confirm('Remove only the OPTIONAL CATALOGUE DEMO pack? This does not affect any OTG! Space or Garage.'))return;
 lock(true);try{await dbDelete();installedPack=null;render();status('online','Demo pack removed. Back to clean start: zero installed catalogues.');}
 catch(e){status('online','Could not remove demo pack: '+String(e.message||e),true)}finally{lock(false)}}
$('browse').addEventListener('click',browse);$('install').addEventListener('click',install);$('remove').addEventListener('click',remove);$('find').addEventListener('input',renderResults);
(async()=>{try{installedPack=await dbGet();if(installedPack)validatePack(installedPack,{catalogueKey:'fh5-catalogue-v1',game:'Forza Horizon 5',packVersion:'1.0.0'});render()}catch(e){installedPack=null;status('summary','Demo storage cannot be opened: '+String(e.message||e),true);$('browse').disabled=true;$('install').disabled=true;$('remove').disabled=true}})();
window.OTGLabOptionalDemo07=Object.freeze({checkEntry,validatePack,safeUrl});
})();
