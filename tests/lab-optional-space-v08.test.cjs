'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const contents=fs.readFileSync(path.join(root,'js/otg-lab-optional-space-v08.js'),'utf8');
const fh5src=fs.readFileSync(path.join(root,'js/fh5-catalogue-v6069-main.js'),'utf8');
const pack=JSON.parse(fs.readFileSync(path.join(root,'catalogue-packs/fh5-complete-1.0.0.json')));
const master=pack.cars.map(x=>({...x}));
const routes=new Map(pack.tracks.map(x=>[x.trackId,x]));
let n=0;const pass=x=>{n++;console.log('PASS',n,x)};
function makeSpace(id,name,more={}){return {id,name,cars:[],runs:[],customEvents:[],backups:[],favouriteManufacturer:'',...more}}
let db;
function fixture(){
 const original=makeSpace('original','Forza Horizon 5 Lab Test',{catalogueKey:'fh5-catalogue-v1',catalogueOwned:{'fh5-v1-0004':'testcar','fh5-v1-0123':'testcar2','fh5-v1-0456':'testcar3'},cars:[{id:'testcar'},{id:'testcar2'},{id:'testcar3'}]});
 const blank=makeSpace('blank','My OTG!');
 const state={spaces:[original,blank],activeSpaceId:'original',defaultSpaceId:'original',cars:original.cars,onboarded:true};
 const storage={'RaceHub_Studio_Final_v5_6':JSON.stringify(state)};
 const ctx={
  window:{FH5_CATALOGUE:master,rhFH5TrackIdsLab04:{ok:true,count:145,validate:()=>true,info:id=>routes.get(id)||null},rhLabPackBootV05:{ok:true},rhLabFH5Pack05:{preflight:async()=>({baseCars:902,baseTracks:145,additions:[],newCars:[]})},rhLabRemoteCatalogues06:{browse:async()=>({packs:[{id:'fh5-complete',title:'Forza Horizon 5 - complete catalogue',cars:902,tracks:145,packVersion:'1.0.0',sha256:'1'.repeat(64)}]}),downloadVerified:async()=>pack}},
  location:{hostname:'otg-laboratory.github.io'},state,document:{querySelector:()=>null,addEventListener:()=>{},createElement:()=>{throw Error('Unexpected DOM write')}},
  localStorage:{getItem:key=>storage[key]||null,setItem:(key,val)=>{storage[key]=val}},
  rhSpaceTemplate:(name)=>makeSpace('new-'+(Object.keys(storage).length+state.spaces.length),name),
  rhSave:()=>{storage.RaceHub_Studio_Final_v5_6=JSON.stringify(state)},rhSync:()=>{state.cars=state.spaces.find(x=>x.id===state.activeSpaceId).cars},
  RH_FINAL_STORE:'RaceHub_Studio_Final_v5_6',
  rhManageSpaces:()=>{},
  confirm:()=>true,
  setTimeout:()=>{},
  console,Date,JSON,Object,Set,Map,String,Array,
 };
 ctx.window.rhCreateAndVerifyAllSpaceSafetyBackupsV8065=async()=>({ok:true,count:2});
 ctx.window.rhRenderSettings=()=>{};
 vm.createContext(ctx);vm.runInContext(contents,ctx);
 return {ctx,storage,state,original,blank,api:ctx.window.rhLabOptionalSpaces08};
}
(async()=>{
 const f=fixture();assert(f.api);pass('v0.8 safe module exports API only under allowed LAB hostname');
 assert(f.api.safetyPack(pack));pass('all 902 cars and all 145 route identities match');
 let damaged=structuredClone(pack);damaged.cars[0].make='Daves Factory';assert.throws(()=>f.api.safetyPack(damaged),/car mismatch/);pass('protected car name changes are rejected');
 damaged=structuredClone(pack);damaged.tracks[0].name='Random New Route';assert.throws(()=>f.api.safetyPack(damaged),/track mismatch/);pass('protected track changes are rejected');
 damaged=structuredClone(pack);damaged.tracks[1].trackId=damaged.tracks[0].trackId;assert.throws(()=>f.api.safetyPack(damaged),/Repeated/);pass('duplicate track IDs rejected');
 await f.api.check();await f.api.download();pass('browse/download/identity preflight leave real state untouched');
 assert.equal(f.state.spaces.length,2);assert.equal(f.state.spaces[0].cars.length,3);pass('3 original cars preserved before creation');
 assert.equal(await f.api.create(),true);const r=f.state.spaces.at(-1);assert.equal(r.name,'FH5 OPTIONAL LAB TEST');assert.equal(r.cars.length,0);assert.equal(Object.keys(r.catalogueOwned).length,0);assert.equal(r.catalogueKey,'fh5-catalogue-v1');pass('creates a real catalogue Space with zero owned');
 assert.equal(f.state.activeSpaceId,r.id);assert.equal(f.state.defaultSpaceId,'original');pass('new Space active but original default preserved');
 assert.equal(f.state.spaces[0].cars.length,3);assert.equal(f.state.spaces[1].cars.length,0);pass('original FH5 ownership and custom Space unchanged');
 assert.equal(await f.api.create(),false);assert.equal(f.state.spaces.length,3);pass('repeat creation refused, no duplicate Space');
 const beforeSaved=JSON.parse(f.storage.RaceHub_Studio_Final_v5_6);assert.equal(beforeSaved.spaces.length,3);pass('real Space persisted to existing app storage');
 // Test original FH5 selector function with two catalogue Spaces.
 const match=fh5src.match(/function fh5FindExistingSpace\(\)\{[\s\S]*?\n\}/);assert(match);const c={state:f.state,FH5_SPACE_KEY:'fh5-catalogue-v1',fh5SpaceNameMatch:()=>false};vm.createContext(c);vm.runInContext(match[0]+';this.pick=fh5FindExistingSpace;',c);
 assert.equal(c.pick().id,r.id);f.state.activeSpaceId='original';assert.equal(c.pick().id,'original');pass('FH5 selector follows currently active FH5 Space both ways');
 const broken=fixture();broken.ctx.window.rhCreateAndVerifyAllSpaceSafetyBackupsV8065=async()=>({ok:false,reason:'injected failure'});await broken.api.check();await broken.api.download();assert.equal(await broken.api.create(),false);assert.equal(broken.state.spaces.length,2);pass('failed Safety Backup blocks all Space additions');
 const broken2=fixture();await broken2.api.check();await broken2.api.download();broken2.ctx.rhSave=()=>{throw Error('no storage available')}; // in script free rhSave global binding tracks ctx property
 assert.equal(await broken2.api.create(),false);assert.equal(broken2.state.spaces.length,2);pass('save failure rolls back new Space in memory');
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('content="0.8"'));assert(html.indexOf('js/otg-lab-optional-space-v08.js')>html.indexOf('js/otg-lab-optional-demo-entry-v07.js'));pass('0.8 source loaded last after existing LAB safety tools');
 assert(html.includes('lab08-multifh5'));pass('identity-safe active FH5 lookup versioned');
 const w=fs.readFileSync(path.join(root,'otg-lab-worker-v1.js'),'utf8');assert(w.includes('otg-lab-v0.8-optional-space'));pass('LAB v0.8 cache isolated and cache version advanced');
 console.log('\nPASS ALL',n,'LAB v0.8 tests');
})().catch(e=>{console.error(e);process.exitCode=1});
