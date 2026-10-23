/* OTG! LAB v0.5 — earliest SAFE additive FH5 car catalogue boot hook.
   Executes after fixed FH5 master and BEFORE deterministic catalogue reconciliation.
   Never updates or removes state/Spaces, owned selections, Garage rows, records or results. */
(()=>{
'use strict';
const KEY='otg-lab:fh5-pack-v05';
const own=(obj,k)=>Object.prototype.hasOwnProperty.call(obj,k);
const live=typeof FH5_CATALOGUE!=='undefined'?FH5_CATALOGUE:null;
const allowed=location.hostname==='otg-laboratory.github.io'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
const report={ok:false,baseCount:0,addedCars:0,installedVersion:null,reason:''};
window.rhLabPackBootV05=report;
if(!allowed){report.reason='LAB hostname required';return;}
if(!Array.isArray(live)||live.length!==902){report.reason='Expected original 902-car FH5 master; no package additions applied';return;}
const baseIds=new Set(live.map(c=>c?.catalogueId));
if(baseIds.size!==902||!Array.from(baseIds).every(id=>/^fh5-v1-\d{4}$/.test(String(id)))){
 report.reason='Frozen baseline identities unavailable';return;
}
report.baseCount=902;
let raw;
try{raw=localStorage.getItem(KEY)}catch(_){report.reason='LAB pack storage unavailable';return;}
if(!raw){report.ok=true;return;}
try{
 if(raw.length>2_000_000)throw Error('Saved pack metadata exceeds safe size');
 const saved=JSON.parse(raw);
 if(saved?.schema!==1||saved?.catalogueKey!=='fh5-catalogue-v1'||!Array.isArray(saved.extraCars)||saved.extraCars.length>2000||!/^\d+\.\d+\.\d+$/.test(String(saved.version||'')))throw Error('Invalid saved pack');
 const seen=new Set(),signatures=new Set(live.map(c=>`${String(c.make).toLowerCase()}|${String(c.model).toLowerCase()}|${String(c.year)}`));
 const additions=[];
 for(const row of saved.extraCars){
  if(!row||typeof row!=='object'||!/^fh5-v2-\d{4,}$/.test(String(row.catalogueId||''))||seen.has(row.catalogueId)||baseIds.has(row.catalogueId))throw Error('Duplicate/new car ID invalid');
  const fields=['make','model','full','year','classType'];
  if(!fields.every(k=>typeof row[k]==='string'&&row[k].trim()&&row[k].length<=150))throw Error('Invalid added car fields');
  const sig=`${row.make.toLowerCase()}|${row.model.toLowerCase()}|${row.year}`;
  if(signatures.has(sig))throw Error('Duplicate car identity');
  seen.add(row.catalogueId);signatures.add(sig);
  const clean=Object.fromEntries(['catalogueId',...fields].map(k=>[k,row[k]]));
  clean.legacyId='fh5-pack-'+row.catalogueId;
  Object.defineProperty(clean,'catalogueId',{value:row.catalogueId,enumerable:true,configurable:false,writable:false});
  additions.push(clean);
 }
 // Commit to the LIVE CATALOGUE only after every imported row passes validation.
 for(const car of additions)live.push(car);
 report.ok=true;report.addedCars=additions.length;report.installedVersion=saved.version;
}catch(err){report.reason=String(err?.message||err);console.error('OTG! LAB catalogue boot refused saved pack:',report.reason)}
})();
