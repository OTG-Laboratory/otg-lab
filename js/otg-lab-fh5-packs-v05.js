/* OTG! LAB v0.5 — protected FH5 catalogue pack import preview/installation.
   Full baseline 902 cars + 145 tracks is REQUIRED; additions are append-only and
   must be explicitly identified. Track additions are blocked pending pool integration.
   No user-created Space, race result, record, Garage ownership or Main data is edited. */
(()=>{
'use strict';
const KEY='otg-lab:fh5-pack-v05',SCHEMA='otg-lab-fh5-catalogue-pack-v1',CAT='fh5-catalogue-v1';
const norm=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const allowed=location.hostname==='otg-laboratory.github.io'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
if(!allowed)return;
let preview=null, busy=false, fileInput=null;
const baseCache={cars:null,tracks:null};
const installed=()=>{try{const x=localStorage.getItem(KEY);return x?JSON.parse(x):null}catch(_){return null}};
const safeVersion=(v)=>/^\d+\.\d+\.\d+$/.test(String(v||''));
function cmp(a,b){const A=a.split('.').map(Number),B=b.split('.').map(Number);for(let i=0;i<3;i++){if(A[i]!==B[i])return A[i]-B[i]}return 0;}
async function bases(){
 if(baseCache.cars&&baseCache.tracks)return baseCache;
 const paths=['./data/fh5-catalogue-ids-frozen-v1.json','./data/fh5-track-ids-frozen-v1.json'];
 const result=await Promise.all(paths.map(async path=>{const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('Frozen identity registry unavailable');return r.json()}));
 if(result[0]?.entries?.length!==902||result[1]?.entries?.length!==145)throw Error('Original identity registry must have 902 cars and 145 tracks');
 baseCache.cars=result[0].entries;baseCache.tracks=result[1].entries;
 return baseCache;
}
function requiredEqual(a,b,keys){return keys.every(k=>String(a?.[k]??'')===String(b?.[k]??''))}
function validateList(list,baseline,idKey,required,pattern,what){
 if(!Array.isArray(list)||list.length<baseline.length||list.length>3000)throw Error(`${what} list must contain the full baseline and no more than 3000 rows`);
 const fixed=new Map(baseline.map(x=>[x[idKey],x])),byId=new Map(),byName=new Set(),extras=[];
 for(const x of list){
  if(!x||typeof x!=='object'||Array.isArray(x))throw Error('Invalid '+what+' record');
  const id=x[idKey];
  if(typeof id!=='string'||!/^fh5-(?:track-)?v[1-9]\d*-\d{4,}$/.test(id)||byId.has(id))throw Error('Missing/duplicate '+what+' permanent ID');
  byId.set(id,x);
  if(fixed.has(id)){
   if(!requiredEqual(x,fixed.get(id),required))throw Error(`Protected ${what} altered: ${id}`);
   continue;
  }
  if(!pattern.test(id))throw Error(`Unapproved ${what} identity family ${id}`);
  const strings=what==='car'?['make','model','full','year','classType']:['name','world','category','discipline'];
  if(strings.some(k=>typeof x[k]!=='string'||!x[k].trim()||x[k].length>150))throw Error('Invalid new '+what+' fields');
  if(what==='car'){
   if(!/^\d{4}$/.test(x.year))throw Error('New car year must be four digits');
  }else{
   if(!['ROAD','OFFROAD','RALLY','HOT_WHEELS','DRAG'].includes(x.category)||typeof x.standard!=='boolean'||typeof x.finale!=='boolean'||typeof x.special!=='boolean')throw Error('Unknown route classification');
  }
  extras.push(x);
 }
 for(const id of fixed.keys())if(!byId.has(id))throw Error(`Protected ${what} missing: ${id}`);
 return extras;
}
function checkNewDuplicates(cars,tracks,originalCars,originalTracks){
 const carSig=new Set(originalCars.map(c=>[norm(c.make),norm(c.model),c.year].join('|')));
 for(const c of cars){const sig=[norm(c.make),norm(c.model),c.year].join('|');if(carSig.has(sig))throw Error('Duplicate car model/year found in update');carSig.add(sig)}
 const trackSig=new Set(originalTracks.map(t=>norm(t.name)));
 for(const t of tracks){const sig=norm(t.name);if(trackSig.has(sig))throw Error('Duplicate track name found in update');trackSig.add(sig)}
}
async function preflight(pack){
 if(!pack||typeof pack!=='object'||Array.isArray(pack)||pack.schema!==SCHEMA||pack.catalogueKey!==CAT||pack.game!=='Forza Horizon 5'||!safeVersion(pack.packVersion))throw Error('Not a supported FH5 LAB catalogue pack');
 if(!window.rhLabPackBootV05?.ok)throw Error('LAB catalogue boot safety check did not pass');
 if(!window.rhFH5TrackIdsLab04?.ok)throw Error('The protected FH5 track ID registry is unavailable');
 const {cars:baseCars,tracks:baseTracks}=await bases();
 const newCars=validateList(pack.cars,baseCars,'catalogueId',['catalogueId','legacyId','make','model','full','year','classType'],/^fh5-v2-\d{4,}$/,'car');
 const newTracks=validateList(pack.tracks,baseTracks,'trackId',['trackId','name','world','category','discipline','standard','finale','special'],/^fh5-track-v2-\d{4,}$/,'track');
 checkNewDuplicates(newCars,newTracks,baseCars,baseTracks);
 if(newTracks.length)throw Error('New FH5 routes are not yet installable: race pools need an additional compatibility test. This pack was NOT applied.');
 const saved=installed();
 const oldCars=saved?.extraCars||[], oldById=new Map(oldCars.map(c=>[c.catalogueId,c]));
 if(saved&&(saved.schema!==1||saved.catalogueKey!==CAT||!safeVersion(saved.version)||!Array.isArray(saved.extraCars)))throw Error('Current LAB package metadata is invalid');
 const newById=new Map(newCars.map(c=>[c.catalogueId,c]));
 for(const old of oldCars){const next=newById.get(old.catalogueId);if(!next||!requiredEqual(next,old,['catalogueId','make','model','full','year','classType']))throw Error('Existing added car removed or altered; update refused');}
 if(saved && cmp(pack.packVersion,saved.version)<0)throw Error('Catalogue downgrades are blocked');
 if(saved && cmp(pack.packVersion,saved.version)===0 && newCars.length!==oldCars.length)throw Error('New car additions require a higher pack version');
 const additions=newCars.filter(x=>!oldById.has(x.catalogueId));
 return {version:pack.packVersion,label:String(pack.packLabel||'FH5 catalogue pack').slice(0,140),baseCars:902,baseTracks:145,newCars, additions, installedVersion:saved?.version||null};
}
function activeIsFH5(){try{return typeof rhSpace==='function'&&rhSpace()?.catalogueKey===CAT}catch(_){return false}}
function panel(){return document.getElementById('otgLabPackPanel05')}
function result(text,error=false){const el=panel()?.querySelector('.otgLabPackResult05');if(el){el.textContent=text;el.style.color=error?'#ffaaaa':'#9de1ed';}}
function refreshPanel(){
 const p=panel();if(!p)return;
 const inst=installed(),boot=window.rhLabPackBootV05;
 const current=p.querySelector('.otgLabPackInstalled05');
 if(current)current.textContent=`FH5 • ${902+(boot?.addedCars||0)} catalogue cars • 145 live routes • Package: ${inst?.version||'baseline only'}`;
 const apply=p.querySelector('.otgLabPackApply05');if(apply)apply.disabled=!preview||busy;
}
async function readAndPreview(data){
 preview=null;refreshPanel();result('Verifying official identities and existing LAB additions…');
 try{
  if(!data||JSON.stringify(data).length>2_000_000)throw Error('JSON pack is too large');
  const plan=await preflight(data);
  preview={data,plan};
  result(`VERIFIED: ${plan.baseCars} original cars + ${plan.baseTracks} routes unchanged. New cars: ${plan.additions.length}. Existing installed additions: ${plan.newCars.length-plan.additions.length}. No saved Space data will be changed.`);
 }catch(e){result('BLOCKED: '+String(e.message||e),true)}
 refreshPanel();
}
async function selectFile(file){
 if(!file)return;
 try{if(file.size>2_000_000)throw Error('File exceeds 2 MB');await readAndPreview(JSON.parse(await file.text()))}catch(e){preview=null;result('BLOCKED: '+String(e.message||e),true);refreshPanel()}
}
async function apply(){
 if(!preview||busy)return;
 const plan=preview.plan;
 if(!confirm(`Apply verified FH5 LAB pack v${plan.version}? ${plan.additions.length} new cars; 902 original cars and all 145 tracks remain unchanged. Your LAB Spaces and recorded results are not replaced. Continue?`))return;
 busy=true;refreshPanel();result('Checking LAB Safety Backups before writing pack metadata…');
 try{
  const backup=window.rhCreateAndVerifyAllSpaceSafetyBackupsV8065;
  if(typeof backup!=='function')throw Error('Safety Backup verifier unavailable');
  const status=await backup();
  if(!status?.ok)throw Error('Safety Backup verification failed: '+(status?.reason||'unknown'));
  const fresh=await preflight(preview.data);
  if(fresh.version!==plan.version||fresh.additions.length!==plan.additions.length)throw Error('Pack changed during verification');
  const saved={schema:1,catalogueKey:CAT,version:plan.version,extraCars:plan.newCars.map(x=>Object.fromEntries(['catalogueId','make','model','full','year','classType'].map(k=>[k,x[k]])))};
  // All app user-owned data remain in their existing OTG storage, untouched.
  // Only this LAB-owned catalogue registry key is updated.
  const before=localStorage.getItem(KEY);
  localStorage.setItem(KEY,JSON.stringify(saved));
  const verify=JSON.parse(localStorage.getItem(KEY)||'null');
  if(verify?.version!==saved.version||verify?.extraCars?.length!==saved.extraCars.length){if(before===null)localStorage.removeItem(KEY);else localStorage.setItem(KEY,before);throw Error('Stored pack verification failed')}
  result(`Pack v${plan.version} saved. Reloading LAB to activate protected additions…`);
  location.reload();
 }catch(e){result('STOPPED SAFELY: '+String(e.message||e),true);busy=false;refreshPanel()}
}
function ensurePanel(){
 if(!activeIsFH5()){panel()?.remove();return;}
 if(panel())return;
 const root=document.querySelector('#more .rhContent');if(!root)return;
 const sect=document.createElement('section');sect.id='otgLabPackPanel05';sect.className='rhSection rhSettingPanel';
 sect.innerHTML=`<h2>🧪 FH5 CATALOGUE PACK LAB</h2><p class="small">Protected full-pack import: 902 original cars and 145 existing routes cannot be changed or removed. New car IDs must be explicit. New route additions are blocked in v0.5 until racing-pool support is verified. Blank Spaces and MAIN are not involved.</p><p class="otgLabPackInstalled05"></p><button class="rhSettingRow otgLabPackTry05" type="button"><b>PREVIEW INCLUDED FH5 BASELINE</b><span>902 cars · 145 tracks · no new content ›</span></button><button class="rhSettingRow otgLabPackUpload05" type="button"><b>PREVIEW FH5 PACK JSON FILE</b><span>Validate identities BEFORE installing ›</span></button><button class="rhSettingRow otgLabPackApply05" type="button" disabled><b>APPLY VERIFIED LAB PACK</b><span>LAB-only safety-backed operation ›</span></button><p class="otgLabPackResult05" aria-live="polite"></p>`;
 const attach=root.querySelector('#rhCatalogueLibrary6079')||root.querySelector('#rhUpdatePanel');
 if(attach)attach.insertAdjacentElement('afterend',sect);else root.appendChild(sect);
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.style.display='none';sect.appendChild(input);fileInput=input;
 input.addEventListener('change',async()=>{await selectFile(input.files?.[0]);input.value=''});
 sect.querySelector('.otgLabPackTry05').onclick=async()=>{
  try{const r=await fetch('./data/fh5-lab-baseline-pack-v05.json',{cache:'no-store'});if(!r.ok)throw Error('Included baseline pack unavailable');await readAndPreview(await r.json())}catch(e){result('BLOCKED: '+String(e.message||e),true)}
 };
 sect.querySelector('.otgLabPackUpload05').onclick=()=>input.click();
 sect.querySelector('.otgLabPackApply05').onclick=apply;
 refreshPanel();
}
// The inherited Settings view is dynamically generated; hook its FINAL renderer.
const originalRender=window.rhRenderSettings;
if(typeof originalRender==='function')window.rhRenderSettings=function(){const v=originalRender.apply(this,arguments);ensurePanel();return v};
// Some navigation paths render Settings asynchronously.
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-tab="more"],#navMore,#more'))setTimeout(ensurePanel,0)},true);
window.rhLabFH5Pack05=Object.freeze({preflight,readAndPreview,ensurePanel,getStatus:()=>({boot:window.rhLabPackBootV05,installed:installed()})});
ensurePanel();
})();
