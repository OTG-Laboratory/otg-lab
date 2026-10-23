/* OTG! v8.0.19 — manifest-led, Safety-Backup-gated updater */
(()=>{
'use strict';
const CURRENT=()=>document.querySelector('meta[name="racehub-version"]')?.content||'8.0.19';
const MANIFEST='./update-manifest.json';
let offered=null;
function clone(v){return JSON.parse(JSON.stringify(v));}
function id(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9);}
function digest(b){const raw=JSON.stringify({type:b.type,spaceName:b.spaceName,counts:b.counts,data:b.data});let h=2166136261;for(let i=0;i<raw.length;i++){h^=raw.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0');}
function safetySnapshot(s){const runs=Array.isArray(s.runs)?s.runs:[];return{id:id('safety-backup'),type:'safety',spaceName:s.name||'My RaceHub',date:new Date().toISOString(),counts:{cars:(s.cars||[]).length,championships:runs.length,results:runs.flatMap(r=>r.results||[]).length},data:clone({cars:s.cars||[],favouriteManufacturer:s.favouriteManufacturer||'',runs,customEvents:s.customEvents||[]})};}
function createAndVerifyAllSpaceSafetyBackups(){
 const key='RaceHub_Studio_Final_v5_6';
 try{
  const state=JSON.parse(localStorage.getItem(key)||'null');
  if(!state||!Array.isArray(state.spaces)||!state.spaces.length)return{ok:false,reason:'no-spaces'};
  const expected=[];
  for(const s of state.spaces){const b=safetySnapshot(s);s.safetyBackup=b;expected.push({spaceId:s.id,id:b.id,digest:digest(b)});}
  localStorage.setItem(key,JSON.stringify(state));
  const persisted=JSON.parse(localStorage.getItem(key)||'null');
  for(const e of expected){const s=(persisted.spaces||[]).find(x=>x.id===e.spaceId),b=s?.safetyBackup;if(!b||b.id!==e.id||b.type!=='safety'||digest(b)!==e.digest)return{ok:false,reason:'verify-failed'};}
  return{ok:true,count:expected.length,expected};
 }catch(error){console.warn('Safety Backup transaction failed',error);return{ok:false,reason:'exception',error};}
}

function status(t){const e=document.getElementById('rhUpdateStatus');if(e)e.textContent=t;}
function cmp(a,b){const A=String(a).split('.').map(Number),B=String(b).split('.').map(Number);for(let i=0;i<Math.max(A.length,B.length);i++){const d=(A[i]||0)-(B[i]||0);if(d)return d;}return 0;}
function close(){document.getElementById('rhUpdateAvailable8019')?.remove();}
async function latest(){const r=await fetch(MANIFEST+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('manifest');return r.json();}
function showUpdate(m){offered=m;if(document.getElementById('rhUpdateAvailable8019'))return;const d=document.createElement('div');d.id='rhUpdateAvailable8019';d.className='rhUpdateOverlay8015';d.innerHTML=`<section class="rhUpdateModal8015" role="dialog" aria-modal="true"><button class="rhUpdateClose8015" aria-label="Later">×</button><small>OTG! UPDATE AVAILABLE</small><h2>VERSION ${m.version}</h2><p>${m.message||'A newer version of OTG! is ready.'}</p><p class="rhUpdateSafety8015">A protected Safety Backup will be created and verified before the update starts.</p><button class="btn rhUpdateNow8015">UPDATE NOW</button><button class="btn secondary rhUpdateLater8015">LATER</button><div class="rhUpdateProgress8015" aria-live="polite"></div></section>`;document.body.appendChild(d);d.querySelector('.rhUpdateClose8015').onclick=close;d.querySelector('.rhUpdateLater8015').onclick=close;d.querySelector('.rhUpdateNow8015').onclick=()=>install(m,d);}
async function install(m,d){const btn=d.querySelector('.rhUpdateNow8015'),out=d.querySelector('.rhUpdateProgress8015');btn.disabled=true;out.textContent='Creating protected Safety Backup…';const gate=createAndVerifyAllSpaceSafetyBackups();if(!gate.ok){out.textContent='UPDATE COULDN’T START — Safety Backup could not be verified. Your data has not been changed.';btn.disabled=false;return;}out.textContent=`Safety Backup verified for ${gate.count} Space${gate.count===1?'':'s'}. Installing update…`;try{sessionStorage.setItem('otgUpdateReload','1');const reg=await navigator.serviceWorker.register(m.worker,{scope:'./',updateViaCache:'none'});if(reg.installing){await new Promise((resolve,reject)=>{const sw=reg.installing;const done=()=>{if(sw.state==='installed')resolve();else if(sw.state==='redundant')reject(new Error('install failed'));};sw.addEventListener('statechange',done);done();});}const w=reg.waiting;if(w)w.postMessage({type:'SKIP_WAITING'});else if(reg.active&&reg.active.scriptURL.includes(m.worker.replace('./','')))location.reload();else throw new Error('No installable update');out.textContent=`OTG! ${m.version} is installing…`;}catch(e){console.warn(e);sessionStorage.removeItem('otgUpdateReload');out.textContent='UPDATE COULDN’T START — Your Safety Backup is protected. Try again later.';btn.disabled=false;}}
async function check(showCurrent=false){try{const m=await latest();if(cmp(m.version,CURRENT())>0){status(`Installed version: ${CURRENT()} • Update ${m.version} available.`);showUpdate(m);return true;}if(showCurrent)status(`Installed version: ${CURRENT()} • Up to date.`);return false;}catch(e){if(showCurrent)status(`Installed version: ${CURRENT()} • Latest version unavailable. Try again later.`);return false;}}
async function manual(){const b=document.getElementById('rhCheckUpdateButton');if(b)b.disabled=true;status(`Installed version: ${CURRENT()} • Checking latest version…`);await check(true);if(b)b.disabled=false;}
navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(sessionStorage.getItem('otgUpdateReload')==='1'){sessionStorage.removeItem('otgUpdateReload');location.reload();}});
window.rhCheckForUpdate=manual;
window.rhAutoCheckForUpdateV8019=()=>check(false);
})();
