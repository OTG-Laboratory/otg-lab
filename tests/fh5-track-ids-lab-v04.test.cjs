'use strict';
/* Run from the OTG! LAB repo root: node tests/fh5-track-ids-lab-v04.test.cjs */
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
function source(name){return fs.readFileSync(path.join(ROOT,'js',name),'utf8')}
function boot({reorder=false,dup=false,missing=false,add=false,results=false}={}){
 const logs=[];
 const a={window:{},console:{error:(...x)=>logs.push(x.join(' ')),warn:()=>{},log:()=>{}},document:{body:{}},setTimeout:()=>{},MutationObserver:class{observe(){}},Date,Set,Map};
 if(results){
  const slot={id:'round-1',name:'Festival Gatecrash'};
  const fixture={catalogueKey:'fh5-catalogue-v1',runs:[{id:'run-1',value:'normal',rounds:[slot],results:[{roundId:'round-1',roundName:'Festival Gatecrash',time:95432,carId:'fh5-v1-0001'}]}],raceOffs:[{id:'raceoff-1',rounds:[{id:'r-2',name:'The Goliath',matches:[{resultA:{time:12}}]}]}],customEvents:[{id:'custom-1',results:[{roundName:'Estadio Cross Country',roundId:'1',time:9}]}]};
  a.rhSpace=()=>fixture;a.window.rhSpace=a.rhSpace;a.testFixture=fixture;
 }
 vm.createContext(a);
 vm.runInContext(source('fh5-track-taxonomy-v8067.js'),a,{filename:'taxonomy'});
 vm.runInContext(source('fh5-track-cleanup-v8070.js'),a,{filename:'cleanup'});
 const tax=a.window.rhFH5TrackTaxonomy8070;
 const before=tax.tracks.map(x=>JSON.stringify(x));
 const pools=JSON.stringify(['ROAD','OFFROAD','RALLY','HOT_WHEELS','DRAG'].map(x=>[x,tax.standardPool(x),tax.finalePool(x)]));
 if(reorder)tax.tracks.reverse();
 if(dup)tax.tracks[0]={...tax.tracks[1]};
 if(missing)tax.tracks.pop();
 if(add)tax.tracks.push({name:'User invented fake route',world:'Mexico',category:'ROAD',discipline:'Road Racing',standard:true,finale:false});
 vm.runInContext(source('fh5-track-ids-lab-v04.js'),a,{filename:'idlock'});
 return {a,tax,pools,before,logs};
}
const reg=JSON.parse(fs.readFileSync(path.join(ROOT,'data/fh5-track-ids-frozen-v1.json')));
assert.equal(reg.entries.length,145);
const test=boot({results:true});const {a,tax}=test;const api=a.window.rhFH5TrackIdsLab04;
assert.equal(api.ok,true,api.error);assert.equal(api.count,145);assert.equal(api.validate(),true);
const ids=tax.tracks.map(t=>t.trackId);assert.equal(new Set(ids).size,145);assert.equal(ids.filter(x=>x).length,145);
const regByName=new Map(reg.entries.map(x=>[x.name,x]));
for(const t of tax.tracks){
 const entry=regByName.get(t.name);assert(entry,`missing registered name ${t.name}`);
 assert.equal(t.trackId,entry.trackId);assert.equal(api.idFor(t.name),entry.trackId);assert.equal(api.idFor(entry.trackId),entry.trackId);
 assert.equal(api.nameFor(entry.trackId),t.name);
 assert.equal(tax.track(entry.trackId)?.name,t.name);
 assert.equal(tax.track(t.name)?.trackId,entry.trackId);
 assert.equal(Object.getOwnPropertyDescriptor(t,'trackId').writable,false);
}
assert.equal(api.idFor('Definitely not an FH5 route'),null);
assert.equal(api.idFor('Winter Wonderland Circuit'),null);
for(const [alias,canonical] of [
 ['Estadio Cross Country','Estadio Cross Country Circuit'],
 ['Aerodromo Sprint','Aeródromo Sprint'],
 ["Ek' Balam Cross Country", "Ek' Balam Cross Country Circuit"],
 ['Teotihuacán Drag Strip','Teotihuacan Drag Strip'],
]){
 assert.equal(api.idFor(alias),api.idFor(canonical),alias);
 assert.equal(tax.canonical(alias),canonical,alias);
}
assert.equal(tax.canonical('The Goliath'),'The Goliath');
assert.equal(tax.track('Horizon Badlands Goliath').finale,true);
assert.equal(tax.track('Desafio').special,true);
assert.equal(test.pools,JSON.stringify(['ROAD','OFFROAD','RALLY','HOT_WHEELS','DRAG'].map(x=>[x,tax.standardPool(x),tax.finalePool(x)])));
assert.equal(test.before.map(x=>JSON.parse(x).name).join('|'),tax.tracks.map(x=>x.name).join('|'));
// Directory reads real taxonomy and historical name strings, no state mutation/renaming.
const beforeFixture=JSON.stringify(a.testFixture);
vm.runInContext(source('fh5-track-directory-v8103.js'),a,{filename:'directory'});
const directory=a.window.rhFH5TrackDirectory8087;
assert.equal(directory.all().length,145);
const usage=directory.usageSnapshot();
assert.equal(usage.total,3);
assert.equal(directory.usage('Festival Gatecrash').festival,1);
assert.equal(directory.usage('The Goliath').raceoff,1);
assert.equal(directory.usage('Estadio Cross Country Circuit').custom,1);
assert.equal(JSON.stringify(a.testFixture),beforeFixture,'history fixture mutated!');
const reordered=boot({reorder:true});
assert.equal(reordered.a.window.rhFH5TrackIdsLab04.ok,true);
for(const row of reg.entries)assert.equal(reordered.a.window.rhFH5TrackIdsLab04.idFor(row.name),row.trackId);
for(const kind of ['dup','missing','add']){
 const broken=boot({[kind]:true});
 assert.equal(broken.a.window.rhFH5TrackIdsLab04.ok,false,`${kind}: must refuse corrupted route registry`);
 assert.equal(broken.tax.tracks.some(x=>Object.prototype.hasOwnProperty.call(x,'trackId')),false,`${kind}: no partial mutation`);
}
// No saved state read, deleted, reset, or written by the registry script.
for(const forbidden of ['rhSave(', 'localStorage.', 'sessionStorage.', '.results=', '.runs=', '.cars=', 'removeItem(', 'catalogueOwned='])assert.equal(source('fh5-track-ids-lab-v04.js').includes(forbidden),false,forbidden);
// Runtime linkage: new script is loaded after active v8070 and before directory, with cache entries.
const index=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
assert(index.indexOf('fh5-track-cleanup-v8070.js')<index.indexOf('fh5-track-ids-lab-v04.js'));
assert(index.indexOf('fh5-track-ids-lab-v04.js')<index.indexOf('fh5-track-directory-v8103.js'));
assert(index.includes('name="otg-lab-version" content="0.4.1"'));
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'update-manifest.json')));
assert.equal(manifest.labVersion,'0.4.1');assert.equal(manifest.channel,'OTG-LAB');assert.equal(manifest.version,'8.0.143');
const sw=fs.readFileSync(path.join(ROOT,'otg-lab-worker-v1.js'),'utf8');
assert(sw.includes('otg-lab-v0.4.1-updater-fix-8143'));
assert(sw.split('fh5-track-ids-lab-v04.js?v=lab04').length>=3);
assert.equal(index.includes('fh5-catalogue-v6069-main.js?v=lab02-idlock'),true);
console.log('PASS: 145 unique frozen FH5 route IDs; all legacy aliases, finals and exclusions unchanged.');
console.log('PASS: 145 route directory entries and original random pools preserved.');
console.log('PASS: reordered taxonomy retains identities; duplicate, missing or unregistered route rejected.');
console.log('PASS: historic Festival, Race Off and Custom results counted without modifying stored names.');
console.log('PASS: LAB v0.4.1 worker, installer manifest, three owned-car compatibility paths and cache wiring.');

// Regression: LAB update checker must be loaded AFTER all historical app scripts
// which assign window.rhCheckForUpdate. It must also use a LAB-only manifest.
assert(index.lastIndexOf('otg-lab-updates-v041.js') > index.lastIndexOf('grand-tour-final-fixes-v6094.js'));
assert(index.lastIndexOf('otg-lab-updates-v041.js') > index.lastIndexOf('update-wire-v8143.js'));
assert(sw.includes('otg-lab-updates-v041.js?v=lab041'));
const updater=source('otg-lab-updates-v041.js');
assert(updater.includes('e.stopImmediatePropagation()'));
assert(updater.includes("const LAB_CHANNEL='OTG-LAB'"));
assert(updater.includes('window.rhCheckForUpdate=()=>manualCheck()'));
assert(!updater.includes('window.rhCheckForUpdate=manual'));
console.log('PASS: LAB updater loads after all legacy overrides, with a capture-phase LAB-only click handler.');
