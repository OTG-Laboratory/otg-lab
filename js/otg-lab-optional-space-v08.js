/* OTG! LAB v0.8 — guarded online FH5 catalogue -> NEW, real OTG! Space.
  - Never modifies/deletes/replaces an existing Space; one opt-in test Space only.
  - Catalogue master is still bundled in LAB v0.8; public truly optional build is later.
  - Requires SHA-256 verified remote pack + immutable 902/145 preflight + all-Space safety backups.
*/
(()=>{'use strict';
const HOSTS=new Set(['otg-laboratory.github.io','localhost','127.0.0.1']);
if(!HOSTS.has(location.hostname))return;
const KEY='fh5-catalogue-v1', NAME='FH5 OPTIONAL LAB TEST', ID='fh5-complete';
let entry=null, verified=null, busy=false;
const $=q=>document.querySelector(q), panel=()=>$('#otgLabOptionalSpace08');
function inSpace(){return typeof state==='object'&&Array.isArray(state?.spaces)&&state.spaces.length>0}
function existing(){return inSpace()?state.spaces.find(s=>s?.labOptionalCatalogue08?.kind==='fh5')||null:null}
function report(message,error=false){const el=panel()?.querySelector('.lab08Status');if(el){el.textContent=message;el.classList.toggle('failure',error)}}
function step(n,message){const el=panel()?.querySelector('.lab08Step'+n);if(el)el.textContent=message}
function currentAvailable(){return Array.isArray(window.FH5_CATALOGUE|| (typeof FH5_CATALOGUE!=='undefined'?FH5_CATALOGUE:null))&&typeof rhSpaceTemplate==='function'&&typeof rhSave==='function'&&typeof rhSync==='function'&&window.rhFH5TrackIdsLab04?.ok===true&&window.rhLabPackBootV05?.ok===true&&!!window.rhLabFH5Pack05?.preflight&&!!window.rhLabRemoteCatalogues06?.browse&&!!window.rhLabRemoteCatalogues06?.downloadVerified}
function safetyPack(p){
 if(!p||p.schema!=='otg-lab-fh5-catalogue-pack-v1'||p.catalogueKey!==KEY||p.game!=='Forza Horizon 5'||p.packVersion!=='1.0.0'||!Array.isArray(p.cars)||!Array.isArray(p.tracks)||p.cars.length!==902||p.tracks.length!==145)throw Error('Not the protected complete LAB FH5 pack');
 const live=window.FH5_CATALOGUE||(typeof FH5_CATALOGUE!=='undefined'?FH5_CATALOGUE:[]);
 if(live.length!==902||new Set(live.map(c=>c.catalogueId)).size!==902)throw Error('Original FH5 identity registry is unexpected');
 const actual=new Map(p.cars.map(c=>[c.catalogueId,c]));
 if(actual.size!==902)throw Error('Repeated permanent car identity');
 for(const car of live){const copy=actual.get(car.catalogueId);if(!copy||['catalogueId','make','model','full','year','classType'].some(k=>String(copy[k])!==String(car[k])))throw Error('Protected car mismatch: '+car.catalogueId)}
 const ids=window.rhFH5TrackIdsLab04;
 if(!ids?.validate?.()||ids.count!==145)throw Error('Protected FH5 track registry unavailable');
 const routes=new Set();
 for(const t of p.tracks){if(!t?.trackId||routes.has(t.trackId))throw Error('Repeated or absent route ID');routes.add(t.trackId);const a=ids.info(t.trackId);if(!a||['trackId','name','world','category','discipline','standard','finale','special'].some(k=>a[k]!==t[k]))throw Error('Protected track mismatch: '+t.trackId)}
 if(routes.size!==145)throw Error('Route registry incomplete');
 return true;
}
function refresh(){const el=panel();if(!el)return;
 const installed=existing(), has=!!verified;
 el.querySelector('.lab08Check').disabled=busy||!!installed;
 el.querySelector('.lab08Download').disabled=busy||!entry||!!installed;
 el.querySelector('.lab08Create').disabled=busy||!has||!!installed;
 const msg=el.querySelector('.lab08Existing');
 msg.textContent=installed?`EXISTING TEST SPACE: ${installed.name} · ${installed.cars.length} Garage cars. Switch to it through Manage OTG! Spaces. No duplicate will be created.`:'No optional FH5 test Space created yet. Your existing FH5 LAB TEST is not a target.';
}
async function check(){if(busy||existing())return;busy=true;verified=null;entry=null;refresh();report('Checking separate online catalogue directory…');try{
 if(!currentAvailable())throw Error('LAB runtime identity or download safeguards unavailable');
 const found=await window.rhLabRemoteCatalogues06.browse();
 if(found?.packs?.length!==1||found.packs[0].id!==ID||found.packs[0].cars!==902||found.packs[0].tracks!==145)throw Error('Only the complete 902/145 FH5 fixture is supported');
 entry=found.packs[0];step(1,`FOUND • ${entry.title} • v${entry.packVersion} • 902 cars / 145 routes`);
 report('Library found. Nothing downloaded or installed. NEXT: DOWNLOAD & VERIFY.');
 }catch(e){entry=null;report('STOPPED SAFELY: '+String(e.message||e),true)}finally{busy=false;refresh()}}
async function download(){if(busy||!entry||existing())return;busy=true;verified=null;refresh();report('Downloading and checking SHA-256 + all permanent identities…');try{
 const pack=await window.rhLabRemoteCatalogues06.downloadVerified(entry);
 safetyPack(pack);
 const plan=await window.rhLabFH5Pack05.preflight(pack);
 if(plan.baseCars!==902||plan.baseTracks!==145||plan.additions.length!==0||plan.newCars.length!==0)throw Error('Space test accepts only unchanged 902/145 pack');
 verified={pack,version:pack.packVersion,checksum:entry.sha256};
 step(2,'VERIFIED • SHA-256 MATCH · 902 protected cars · 145 protected routes · 0 additions');
 report('DOWNLOAD VERIFIED. Your existing Spaces are still untouched. Review before creating a NEW test Space.');
 }catch(e){verified=null;report('DOWNLOAD BLOCKED: '+String(e.message||e),true)}finally{busy=false;refresh()}}
async function create(){if(busy||!verified||existing())return false;busy=true;refresh();
 const pack=verified.pack;
 if(!confirm(`Create a brand-new real OTG! Space named “${NAME}” with the verified FH5 catalogue?\n\nThis will NOT change or replace FH5 LAB TEST. This new Space will start with 0 owned cars and no racing results. Safety Backups are required. Continue?`)){busy=false;refresh();return false}
 report('Creating and verifying all-Space LAB Safety Backups…');let before=null,oldActive=null,originalCount=0,saved=false,created=null;
 try{
  if(!inSpace()||existing()||!currentAvailable())throw Error('LAB Space creation conditions have changed');
  safetyPack(pack);
  const newPlan=await window.rhLabFH5Pack05.preflight(pack);
  if(newPlan.additions.length||newPlan.newCars.length)throw Error('The baseline catalogue changed since preview');
  const backup=window.rhCreateAndVerifyAllSpaceSafetyBackupsV8065;
  if(typeof backup!=='function')throw Error('Safety Backup verifier unavailable');
  const ok=await backup();if(!ok?.ok)throw Error('Safety Backup verification refused: '+String(ok?.reason||'unknown'));
  // Snapshot after Safety Backups so a failed new-Space save can be rolled back without undoing backups.
  before=localStorage.getItem(RH_FINAL_STORE);
  if(!before)throw Error('Main LAB Space storage was not found');
  const beforeJson=JSON.parse(before),existingIds=new Set(beforeJson.spaces.map(s=>s.id));
  originalCount=state.spaces.length;oldActive=state.activeSpaceId;
  if(existingIds.size!==originalCount||existing())throw Error('Unsafe Space list detected');
  created=rhSpaceTemplate(NAME,[]);
  if(existingIds.has(created.id))throw Error('New Space identifier collision');
  created.catalogueKey=KEY;created.catalogueTitle='Forza Horizon 5';created.catalogueOwned={};
  created.catalogueLibrary={key:KEY,title:'Forza Horizon 5',version:'2',total:902,protected:true,identity:'immutable-row-id'};
  created.labOptionalCatalogue08={kind:'fh5',packId:ID,packVersion:verified.version,sha256:verified.checksum,installedAt:new Date().toISOString()};
  state.spaces.push(created);state.activeSpaceId=created.id;rhSync();rhSave();saved=true;
  const after=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');
  if(!after||after.spaces.length!==originalCount+1||after.activeSpaceId!==created.id||JSON.stringify(after.spaces.slice(0,originalCount))!==JSON.stringify(beforeJson.spaces)||after.spaces[originalCount].cars.length||Object.keys(after.spaces[originalCount].catalogueOwned||{}).length||after.spaces[originalCount].catalogueKey!==KEY)throw Error('New Space verification failed');
  verified=null;entry=null;step(3,'CREATED • New real FH5 Space • 0 owned cars • no races');
  report('SUCCESS — new FH5 OPTIONAL LAB TEST created. The original three-car Space remains separate.');
  if(typeof rhManageSpaces==='function')rhManageSpaces();
  return true;
 }catch(e){
  // No change to any existing saved Space on failure; do not roll back verified Safety Backups.
  if(created&&state.spaces?.includes(created))state.spaces=state.spaces.filter(x=>x!==created);
  if(oldActive)state.activeSpaceId=oldActive;
  if(state.spaces?.length)rhSync();
  if(saved&&before!==null){try{localStorage.setItem(RH_FINAL_STORE,before)}catch(_){}}
  report('NEW SPACE BLOCKED: '+String(e.message||e),true);return false;
 }finally{busy=false;refresh()}
}
function ensure(){
 const prior=$('#otgLabOptionalEntry07');
 if(!prior){panel()?.remove();return}
 if(panel()){refresh();return}
 const s=document.createElement('section');s.id='otgLabOptionalSpace08';s.className='rhSection rhSettingPanel';
 s.innerHTML=`<h2>🧪 REAL SPACE CATALOGUE — LAB v0.8</h2>
 <p class="small">Controlled next step: download the complete FH5 pack and create <b>one NEW actual OTG! Space</b>. This is NOT an import into, or a reset of, your existing three-car FH5 LAB TEST. The official FH5 master is <b>still bundled in LAB</b>; this test validates the real Space connection before removing bundled catalogues in a future public build.</p>
 <p class="small lab08Existing"></p>
 <button type="button" class="rhSettingRow lab08Check"><b>STEP 1 — CHECK ONLINE FH5 LIBRARY</b><span>No download · no changes ›</span></button><p class="lab08Step1 small">Library not checked.</p>
 <button type="button" class="rhSettingRow lab08Download" disabled><b>STEP 2 — DOWNLOAD &amp; VERIFY PACK</b><span>SHA-256 + 902 car IDs + 145 routes ›</span></button><p class="lab08Step2 small">No verified downloaded pack yet.</p>
 <button type="button" class="rhSettingRow lab08Create" disabled><b>STEP 3 — CREATE NEW FH5 LAB SPACE</b><span>Confirm + Safety Backups · existing Spaces preserved ›</span></button><p class="lab08Step3 small">Nothing created.</p>
 <p class="lab08Status small" role="status" aria-live="polite">Begin with Step 1. Stop after each step for phone screenshots.</p>`;
 prior.insertAdjacentElement('afterend',s);
 s.querySelector('.lab08Check').addEventListener('click',check);
 s.querySelector('.lab08Download').addEventListener('click',download);
 s.querySelector('.lab08Create').addEventListener('click',create);
 refresh();
}
const earlier=window.rhRenderSettings;
if(typeof earlier==='function')window.rhRenderSettings=function(){const r=earlier.apply(this,arguments);ensure();return r};
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-tab="more"],#navMore,#more'))setTimeout(ensure,0)},true);
ensure();
window.rhLabOptionalSpaces08=Object.freeze({safetyPack,existing,check,download,create,ensure});
})();
