'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const pack=JSON.parse(fs.readFileSync(path.join(root,'data/fh5-lab-baseline-pack-v05.json')));
const frozenCars={entries:pack.cars},frozenTracks={entries:pack.tracks};
let tests=0;
function trial(label,fn){return Promise.resolve().then(fn).then(()=>{tests++;console.log('PASS',label)})}
function sandbox({installed=null}={}){
 const storage=new Map();if(installed)storage.set('otg-lab:fh5-pack-v05',JSON.stringify(installed));
 const fake={hostname:'otg-laboratory.github.io'};
 const sandbox={console,Map,Set,Number,String,Object,JSON,Array,Error,RegExp,Promise,location:fake,
 localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
 fetch:async url=>({ok:true,json:async()=>url.includes('fh5-track-ids')?frozenTracks:frozenCars}),
 document:{querySelector:()=>null,getElementById:()=>null,addEventListener:()=>{}},
 confirm:()=>true,window:{rhFH5TrackIdsLab04:{ok:true}},setTimeout(){},
 };
 sandbox.window.window=sandbox.window;
 vm.createContext(sandbox);
 vm.runInContext('const FH5_CATALOGUE='+JSON.stringify(pack.cars)+';',sandbox);
 const boot=fs.readFileSync(path.join(root,'js/otg-lab-fh5-pack-boot-v05.js'),'utf8');
 const engine=fs.readFileSync(path.join(root,'js/otg-lab-fh5-packs-v05.js'),'utf8');
 vm.runInContext(boot,sandbox);vm.runInContext(engine,sandbox);
 return {sandbox,storage,api:sandbox.window.rhLabFH5Pack05,base:pack};
}
function cloned(){return JSON.parse(JSON.stringify(pack))}
async function rejects(p,why){const t=sandbox();await assert.rejects(()=>t.api.preflight(p),why)}
(async()=>{
 await trial('Full 902-car, 145-route pack validates without mutations',async()=>{const t=sandbox();const before=JSON.stringify(t.sandbox.window.rhLabPackBootV05);const result=await t.api.preflight(cloned());assert.equal(result.baseCars,902);assert.equal(result.baseTracks,145);assert.equal(result.additions.length,0);assert.equal(t.storage.size,0);assert.equal(t.sandbox.window.rhLabPackBootV05.addedCars,0);});
 await trial('A rearranged pack preserves IDs and remains valid',async()=>{const p=cloned();p.cars.reverse();p.tracks.reverse();assert.equal((await sandbox().api.preflight(p)).additions.length,0)});
 await trial('Removing an official car is blocked',async()=>{const p=cloned();p.cars.pop();await rejects(p,/Protected car missing|full baseline/)});
 await trial('Reusing an official ID for a renamed car is blocked',async()=>{const p=cloned();p.cars[15].model='Fake renamed';await rejects(p,/Protected car altered/)});
 await trial('Duplicate official IDs are blocked',async()=>{const p=cloned();p.cars[0].catalogueId=p.cars[1].catalogueId;await rejects(p,/duplicate car permanent ID|Missing\/duplicate car|Protected car altered/)});
 await trial('Changing a route classification is blocked',async()=>{const p=cloned();p.tracks[0].category='OFFROAD';await rejects(p,/Protected track altered/)});
 await trial('New tracks are blocked until scheduler compatibility exists',async()=>{const p=cloned();p.tracks.push({...p.tracks[0],trackId:'fh5-track-v2-0001',name:'Fixture Route'});await rejects(p,/not yet installable/)});
 await trial('New car appended with a never-used ID validates',async()=>{const p=cloned();p.packVersion='1.1.0';p.cars.push({catalogueId:'fh5-v2-0001',make:'Test',model:'Fixture One',full:'Test Fixture One',year:'2027',classType:'Test Category'});const result=await sandbox().api.preflight(p);assert.equal(result.additions.length,1)});
 await trial('New car with forbidden legacy ID scheme is blocked',async()=>{const p=cloned();p.cars.push({catalogueId:'fh5-v1-9999',make:'Test',model:'Fixture One',full:'Test Fixture One',year:'2027',classType:'Test Category'});await rejects(p,/Unapproved car identity family/)});
 await trial('Saved append-only cars boot BEFORE deterministic reconciliation',async()=>{const installed={schema:1,catalogueKey:'fh5-catalogue-v1',version:'1.1.0',extraCars:[{catalogueId:'fh5-v2-0001',make:'Test',model:'Fixture One',full:'Test Fixture One',year:'2027',classType:'Test Category'}]};const t=sandbox({installed});assert.equal(t.sandbox.window.rhLabPackBootV05.addedCars,1);assert.equal(vm.runInContext('FH5_CATALOGUE.length',t.sandbox),903);assert.equal(vm.runInContext('FH5_CATALOGUE[902].catalogueId',t.sandbox),'fh5-v2-0001');});
 await trial('New pack cannot remove a previously added car',async()=>{const existing={schema:1,catalogueKey:'fh5-catalogue-v1',version:'1.1.0',extraCars:[{catalogueId:'fh5-v2-0001',make:'Test',model:'Fixture One',full:'Test Fixture One',year:'2027',classType:'Test Category'}]};const t=sandbox({installed:existing});const p=cloned();p.packVersion='1.2.0';await assert.rejects(()=>t.api.preflight(p),/Existing added car removed/)});
 await trial('Invalid saved catalogues fail closed with baseline untouched',async()=>{const existing={schema:1,catalogueKey:'fh5-catalogue-v1',version:'1.1.0',extraCars:[{catalogueId:'fh5-v1-0001',make:'Tamper',model:'Oops',full:'Tamper Oops',year:'2027',classType:'Oops'}]};const t=sandbox({installed:existing});assert.equal(t.sandbox.window.rhLabPackBootV05.ok,false);assert.equal(vm.runInContext('FH5_CATALOGUE.length',t.sandbox),902)});
 console.log(`ALL ${tests} PASS`);
})().catch(e=>{console.error(e);process.exitCode=1});
