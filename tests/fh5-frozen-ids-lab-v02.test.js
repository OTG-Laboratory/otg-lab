/* Node: node tests/fh5-frozen-ids-lab-v02.test.js — no browser storage or user data involved. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const text=f=>fs.readFileSync(path.join(base,f),'utf8');
const source=text('js/fh5-catalogue-v6069-main.js');
const match=source.match(/const FH5_CATALOGUE=(\[[^\n]*\]);/);
assert(match,'FH5 source array not found');
const catalogue=JSON.parse(match[1]);
const registry=JSON.parse(text('data/fh5-catalogue-ids-frozen-v1.json'));
assert.equal(catalogue.length,902);
assert.equal(registry.entries.length,902);
const ids=catalogue.map(c=>c.catalogueId);
const aliases=catalogue.map(c=>c.legacyId);
assert.equal(new Set(ids).size,902,'permanent IDs must be unique');
assert.equal(new Set(aliases).size,902,'legacy slug aliases must be unique');
const fh5slug=s=>String(s||'').normalize('NFKD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase();
for(let i=0;i<902;i++){
  const c=catalogue[i],r=registry.entries[i];
  assert.equal(c.catalogueId,`fh5-v1-${String(i+1).padStart(4,'0')}`);
  assert.equal(c.legacyId,`fh5-${fh5slug(c.full+'-'+c.year)}`);
  assert.deepEqual(c,r);
}
const fixtures=[
  ['Vauxhall Lotus Carlton','fh5-v1-0867'],
  ['Nissan R390 (GT1)','fh5-v1-0679'],
  ['BMW X5 M Forza Edition','fh5-v1-0102'],
];
for(const [name,id] of fixtures)assert(catalogue.some(c=>c.full===name&&c.catalogueId===id),name);

function repairUsing(list,ownedIds){
  // Execute the ACTUAL deterministic reconciliation, not a reimplementation.
  const s={id:'lab-test',name:'FH5 LAB TEST',catalogueKey:'fh5-catalogue-v1',catalogueOwned:{},cars:[],runs:[{entries:[],results:[],id:'historical-test-run'}],customEvents:[],backups:[{id:'do-not-touch'}]};
  for(const id of ownedIds){const car=list.find(c=>c.catalogueId===id);assert(car,`missing fixture ${id}`);s.catalogueOwned[id]=id;s.cars.push({id,catalogueId:id,catalogueKey:s.catalogueKey,make:car.make,model:car.model,year:car.year,classType:car.classType,name:car.full});}
  const mock={console,state:{spaces:[s],activeSpaceId:s.id},FH5_CATALOGUE:list,GT7_CATALOGUE:[],fh5Slug:fh5slug,gt7Slug:fh5slug,fh5Space:()=>s,gt7Space:()=>null,fh5EnsureSpace:()=>s,gt7EnsureSpace:()=>null,normaliseCar:o=>({...o}),rhSync:()=>{},rhSave:()=>{},fh5FestivalUnlocks:()=>new Map(),gt7FestivalUnlocks:()=>new Map(),fh5AnnounceFestivalUnlocks:()=>{},rhRenderGarage:()=>{},gt7RenderCatalogue:()=>{}};
  mock.window=mock;
  vm.runInNewContext(text('js/catalogue-deterministic-v6110.js'),mock,{filename:'catalogue-deterministic-v6110.js'});
  return {s,mock};
}
const fixtureIds=fixtures.map(x=>x[1]);
const first=repairUsing(structuredClone(catalogue),fixtureIds);
assert.deepEqual(Object.keys(first.s.catalogueOwned).sort(),fixtureIds.slice().sort());
assert.equal(first.s.cars.length,3);
assert.equal(first.s.runs.length,1,'historical results retained');
assert.equal(first.s.backups.length,1,'backups retained');
assert.equal(first.s.name,'FH5 LAB TEST');
assert.equal(first.mock.state.activeSpaceId,'lab-test');

// Moving rows and inserting a new, explicitly tagged car must NOT affect IDs or ownership.
const scrambled=structuredClone(catalogue).reverse();
scrambled.splice(115,0,{...structuredClone(catalogue[0]),catalogueId:'fh5-v2-0001',legacyId:'fh5-future-v2-test-car-2099',full:'TEST CAR — NOT SHIPPED',make:'Testing',model:'Future',year:'2099'});
const reordered=repairUsing(scrambled,fixtureIds);
assert.deepEqual(Object.keys(reordered.s.catalogueOwned).sort(),fixtureIds.slice().sort());
assert.equal(reordered.s.cars.length,3);

// Legacy compatibility: read original slug keys and reconcile onto frozen permanent IDs.
const legacyS={id:'test',catalogueKey:'fh5-catalogue-v1',catalogueOwned:{},cars:[],runs:[],customEvents:[]};
for(const [name,id] of fixtures){const c=catalogue.find(x=>x.catalogueId===id);legacyS.catalogueOwned[c.legacyId]=c.legacyId;legacyS.cars.push({id:c.legacyId,name:c.full,make:c.make,model:c.model,year:c.year});}
const legacyCtx={console,state:{spaces:[legacyS],activeSpaceId:'test'},FH5_CATALOGUE:structuredClone(catalogue),GT7_CATALOGUE:[],fh5Slug:fh5slug,gt7Slug:fh5slug,normaliseCar:o=>({...o}),rhSync:()=>{},rhSave:()=>{},fh5Space:()=>legacyS,gt7Space:()=>null};legacyCtx.window=legacyCtx;
vm.runInNewContext(text('js/catalogue-deterministic-v6110.js'),legacyCtx);
assert.deepEqual(Object.keys(legacyS.catalogueOwned).sort(),fixtureIds.slice().sort(),'legacy alias reconciliation');

// A typo that creates a duplicate or leaves ID unspecified must fail before it can remap ownership.
for(const breakage of ['remove','duplicate']){
  const bad=structuredClone(catalogue);
  if(breakage==='remove')delete bad[2].catalogueId;
  else bad[2].catalogueId=bad[1].catalogueId;
  assert.throws(()=>repairUsing(bad,fixtureIds),/LAB FH5 identity safety/,breakage);
}
// GT7 and user Spaces were not modified by this change.
assert.equal(text('js/catalogue-deterministic-v6110.js').includes("installIds(typeof GT7_CATALOGUE!=='undefined'?GT7_CATALOGUE:[], 'gt7');"),true);
assert.equal(text('index.html').includes('DEVELOPMENT COPY · v0.2 · MAIN IS SEPARATE'),true);
console.log('PASS: 902 frozen identity rows, 902 unique legacy aliases, 3 owned cars preserved under reordering/addition, legacy migration, fail-closed ID collisions, result/backup retention.');
