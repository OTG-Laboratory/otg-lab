'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.join(__dirname,'..'),load=p=>fs.readFileSync(path.join(root,p));
const loader=load('js/otg-lab-download-boot-v10.js').toString(),manifest=load('js/otg-lab-boot-manifest-v10.json'),cars=load('catalogue-packs/fh5-complete-1.0.0.json'),carLib=load('catalogue-packs/library-v1.json'),tracks=load('catalogue-packs/fh5-tracks-1.0.0.json'),trackLib=load('catalogue-packs/tracks-library-v1.json');
async function once({storage=new Map(),offline=false,tamperTracks=false,omitTracks=false}={}){
 const events=[],fetched=[];
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const box={querySelector:s=>s==='button'?{style:{},addEventListener:(e,h)=>events.push(['button',e])}:{set textContent(v){events.push(['status',String(v)])}},remove:()=>events.push(['removed'])};
 const document={readyState:'complete',body:{appendChild(s){events.push(['script',s.src]);queueMicrotask(()=>s.onload?.())}},querySelector:s=>s==='main'?{prepend:()=>{}}:null,
 createElement:tag=>tag==='script'?{async:true,onload:null,onerror:null}:{style:{},setAttribute(){},querySelector:box.querySelector.bind(box),set innerHTML(v){events.push(['html',String(v)])}},getElementById:id=>id==='otgLabBoot10'?box:null,dispatchEvent:e=>events.push(['event',e.type])};
 const asReply=b=>({ok:true,type:'basic',arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)});
 const fetch=async url=>{
  const u=String(url).split('?')[0];fetched.push(u);
  if(u.includes('boot-manifest'))return asReply(manifest); // same-origin cached worker manifest
  if(offline)throw Error('Network disconnected');
  if(u.endsWith('/library-v1.json'))return asReply(carLib);
  if(u.endsWith('/fh5-complete-1.0.0.json'))return asReply(cars);
  if(u.endsWith('/tracks-library-v1.json'))return asReply(trackLib);
  if(u.endsWith('/fh5-tracks-1.0.0.json'))return asReply(tamperTracks?Buffer.concat([tracks,Buffer.from('corrupt')]):tracks);
  throw Error('Unexpected asset '+u);
 };
 if(omitTracks)storage.delete('otg-lab:verified-fh5-tracks-v10');
 const window={dispatchEvent:e=>events.push(['window-event',e.type])};
 const c={document,window,location:{hostname:'otg-laboratory.github.io'},crypto:crypto.webcrypto,TextEncoder,TextDecoder,fetch,localStorage,console:{warn(){},error(){}},Event:class{constructor(type){this.type=type}},setTimeout:fn=>fn(),queueMicrotask};
 vm.runInNewContext(loader,c);
 for(let i=0;i<2000&&!events.some(x=>x[0]==='window-event'&&x[1]==='load')&&!events.some(x=>x[0]==='status'&&x[1].includes('SAFE STOP'));i++)await new Promise(r=>setImmediate(r));
 return {events,storage,window,fetched};
}
(async()=>{
 const first=await once();assert.equal(first.window.OTG_LAB_VERIFIED_FH5_CARS_V09.length,902);assert.equal(first.window.OTG_LAB_VERIFIED_FH5_TRACKS_V10.length,145);
 assert.equal(Object.keys(first.window.OTG_LAB_VERIFIED_FH5_TRACK_HINTS_V10).length,145);
 assert.equal(first.events.filter(x=>x[0]==='script').length,137);
 assert(first.storage.has('otg-lab:verified-fh5-tracks-v10'));assert(first.fetched.some(x=>x.endsWith('fh5-tracks-1.0.0.json')));
 const offline=await once({storage:first.storage,offline:true});assert.equal(offline.window.OTG_LAB_VERIFIED_FH5_TRACKS_V10.length,145);
 assert.equal(offline.events.filter(x=>x[0]==='script').length,137);assert(!offline.fetched.some(x=>x.includes('catalogue-packs')));
 const tamper=await once({tamperTracks:true});assert.equal(tamper.events.filter(x=>x[0]==='script').length,0);
 assert(tamper.events.some(x=>x[0]==='status'&&x[1].includes('SAFE STOP')));
 const offlineNoTrack=await once({storage:first.storage,offline:true,omitTracks:true});assert.equal(offlineNoTrack.events.filter(x=>x[0]==='script').length,0);
 assert(offlineNoTrack.events.some(x=>x[0]==='status'&&x[1].includes('SAFE STOP')));
 const damagedStored=new Map(first.storage);damagedStored.set('otg-lab:verified-fh5-tracks-v10',damagedStored.get('otg-lab:verified-fh5-tracks-v10')+'BAD');
 const corruptStored=await once({storage:damagedStored,offline:true});assert.equal(corruptStored.events.filter(x=>x[0]==='script').length,0);
 assert(corruptStored.events.some(x=>x[0]==='status'&&x[1].includes('SAFE STOP')));
 console.log('PASS: v0.10 first boot (both SHA packs), 137 scripts, offline cached boot, tampered network track, missing offline track, damaged cache fail closed');
})().catch(e=>{console.error(e);process.exit(1)});
