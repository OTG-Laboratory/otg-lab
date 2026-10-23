'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'js/otg-lab-remote-catalogues-v06.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(ROOT,'catalogue-packs/library-v1.json'),'utf8'));
const packBytes=fs.readFileSync(path.join(ROOT,'catalogue-packs/fh5-complete-1.0.0.json'));
let count=0;
function test(label,fn){return Promise.resolve().then(fn).then(()=>{count++;console.log('PASS',label)})}
function make({manifestData=manifest,download=packBytes,fail=false,oversize=false}={}){
 const calls=[];const storage=new Map();
 const fetch=async(input)=>{
  const url=String(input);calls.push(url);
  if(fail)throw Error('offline');
  const bytes=url.includes('library-v1.json')?Buffer.from(JSON.stringify(manifestData)):download;
  const header=oversize?'3000000':String(bytes.byteLength);
  return {ok:true,status:200,type:'basic',headers:{get:k=>k==='content-length'?header:null},arrayBuffer:async()=>Uint8Array.from(bytes).buffer};
 };
 const loc={hostname:'otg-laboratory.github.io',href:'https://otg-laboratory.github.io/otg-lab/index.html',origin:'https://otg-laboratory.github.io'};
 const document={querySelector:()=>null,addEventListener:()=>{}};
 const ctx={URL,Date,console,crypto:webcrypto,fetch,location:loc,document,window:{},TextDecoder,Uint8Array,setTimeout};
 vm.createContext(ctx);vm.runInContext(src,ctx);
 return {api:ctx.window.rhLabRemoteCatalogues06,calls,storage};
}
(async()=>{
 await test('Library manifest lists exactly one hosted 902-car/145-route FH5 pack',async()=>{
  const t=make();const found=await t.api.browse();assert.equal(found.packs.length,1);assert.equal(found.packs[0].cars,902);assert.equal(found.packs[0].tracks,145);assert.match(t.calls[0],/catalogue-packs\/library-v1\.json\?check=/);assert.equal(t.storage.size,0);
 });
 await test('Downloaded remote bytes match required SHA-256 and full pack metadata',async()=>{
  const t=make();const list=await t.api.browse();const pack=await t.api.downloadVerified(list.packs[0]);assert.equal(pack.cars.length,902);assert.equal(pack.tracks.length,145);assert.equal(pack.packVersion,'1.0.0');assert.equal(t.storage.size,0);
 });
 await test('Invalid checksum prevents preview of modified content',async()=>{
  const altered=Buffer.from(packBytes);altered[10]^=1;
  const t=make({download:altered});const list=await t.api.browse();await assert.rejects(()=>t.api.downloadVerified(list.packs[0]),/checksum mismatch/);
 });
 await test('Changing directory declared SHA-256 to rubbish blocks remote download',async()=>{
  const modified=JSON.parse(JSON.stringify(manifest));modified.packs[0].sha256='0'.repeat(64);const t=make({manifestData:modified});const list=await t.api.browse();await assert.rejects(()=>t.api.downloadVerified(list.packs[0]),/checksum mismatch/);
 });
 await test('Path traversal and external URLs rejected by manifest validator',async()=>{
  const t=make();for(const bad of ['../../other.json','https://somewhere-else.com/fh5.json','./catalogue-packs/../fh5-complete-1.0.0.json']){
   const m=JSON.parse(JSON.stringify(manifest));m.packs[0].path=bad;assert.throws(()=>t.api.validateManifest(m),/unsafe pack size or filename/);
  }
 });
 await test('Wrong game and custom blank Space packs rejected',async()=>{
  const t=make();const m=JSON.parse(JSON.stringify(manifest));m.packs[0].game='Custom game';assert.throws(()=>t.api.validateManifest(m),/Unsupported pack metadata/);
 });
 await test('Manifest version/path disagreement rejected',async()=>{
  const t=make();const m=JSON.parse(JSON.stringify(manifest));m.packs[0].packVersion='1.0.1';assert.throws(()=>t.api.validateManifest(m),/version does not match filename/);
 });
 await test('Duplicate IDs in directory rejected',async()=>{
  const t=make();const m=JSON.parse(JSON.stringify(manifest));m.packs.push({...m.packs[0]});assert.throws(()=>t.api.validateManifest(m),/Duplicate catalogue identifier/);
 });
 await test('Declaring more than 2MB blocked before response decode',async()=>{
  const t=make({oversize:true});await assert.rejects(()=>t.api.browse(),/download limit/);
 });
 await test('Offline request aborts without changing data',async()=>{
  const t=make({fail:true});await assert.rejects(()=>t.api.browse(),/offline/);assert.equal(t.storage.size,0);
 });
 await test('Real remote download passes the existing v0.5 frozen identity preflight without writes',async()=>{
  const t=make();const pack=await t.api.downloadVerified((await t.api.browse()).packs[0]);
  const saved=new Map();
  const frozenCars={entries:pack.cars},frozenTracks={entries:pack.tracks};
  const ctx={console,Map,Set,Number,String,Object,JSON,Array,Error,RegExp,Promise,
   location:{hostname:'otg-laboratory.github.io'},
   localStorage:{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,v),removeItem:k=>saved.delete(k)},
   fetch:async url=>({ok:true,json:async()=>url.includes('fh5-track-ids')?frozenTracks:frozenCars}),
   document:{querySelector:()=>null,getElementById:()=>null,addEventListener:()=>{}},
   confirm:()=>true,window:{rhFH5TrackIdsLab04:{ok:true}},setTimeout(){}
  };
  vm.createContext(ctx);
  vm.runInContext('const FH5_CATALOGUE='+JSON.stringify(pack.cars)+';',ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'js/otg-lab-fh5-pack-boot-v05.js'),'utf8'),ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT,'js/otg-lab-fh5-packs-v05.js'),'utf8'),ctx);
  const verified=await ctx.window.rhLabFH5Pack05.preflight(pack);
  assert.equal(verified.baseCars,902);assert.equal(verified.baseTracks,145);
  assert.equal(verified.additions.length,0);assert.equal(saved.size,0);
 });
 console.log(`ALL ${count} REMOTE CATALOGUE TESTS PASS`);
})().catch(e=>{console.error(e);process.exitCode=1});
