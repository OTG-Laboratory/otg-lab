const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const dir=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(dir,'js/otg-lab-download-boot-v09.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'js/otg-lab-boot-manifest-v09.json')));
const pack=fs.readFileSync(path.join(dir,'catalogue-packs/fh5-complete-1.0.0.json'));
const lib=fs.readFileSync(path.join(dir,'catalogue-packs/library-v1.json'));
async function once({storage=new Map(),offline=false,tampered=false}={}){
 const events=[];const fetches=[];const local={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const box={querySelector:s=> s==='button' ? {style:{},addEventListener:(e,h)=>events.push(['click-registered',!!h])}: {set textContent(v){events.push(['status',String(v)])}}, remove:()=>events.push(['removed'])};
 const document={readyState:'complete',body:{appendChild(s){events.push(['script',s.src]);queueMicrotask(()=>s.onload?.());}},querySelector:(s)=>s==='main'?{prepend:b=>events.push(['prepend',!!b])}:null,createElement:tag=> tag==='script'?{async:true,onload:null,onerror:null}:{style:{},setAttribute:()=>{},querySelector:box.querySelector.bind(box),set innerHTML(s){events.push(['html',s.includes('DOWNLOAD &')])}} ,getElementById:id=>id==='otgLabBoot09'?box:null,dispatchEvent:event=>events.push(['event',event.type])};
 const fetch=async(url)=>{const pathname=String(url).split('?')[0];fetches.push(pathname);if(pathname.includes('library-v1.json')){if(offline)throw new Error('Offline');return {ok:true,type:'basic',arrayBuffer:async()=>lib.buffer.slice(lib.byteOffset,lib.byteOffset+lib.byteLength)}};
 if(pathname.includes('fh5-complete-1.0.0.json')){if(offline)throw new Error('Offline');const b=tampered?Buffer.concat([pack,Buffer.from('junk')]):pack;return {ok:true,type:'basic',arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}};
 if(pathname.includes('boot-manifest')){const b=Buffer.from(JSON.stringify(manifest));return {ok:true,type:'basic',arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)}};
 throw new Error('Unexpected asset fetch '+url)};
 const context={document,window:{dispatchEvent:e=>events.push(['window-event',e.type])},location:{hostname:'otg-laboratory.github.io'},crypto:crypto.webcrypto,TextEncoder,TextDecoder,fetch,localStorage:local,console:{error:()=>{},warn:()=>{}},setTimeout:fn=>fn(),Event:class{constructor(type){this.type=type}},queueMicrotask};
 vm.runInNewContext(js,context);for(let i=0;i<2000&&!events.some(x=>x[0]==='window-event'&&x[1]==='load')&&!events.some(x=>x[0]==='status'&&x[1].includes('SAFE STOP'));i++)await new Promise(r=>setImmediate(r));
 return {events,fetches,storage,cars:context.window.OTG_LAB_VERIFIED_FH5_CARS_V09};
}
(async()=>{
 const first=await once();assert.equal(first.cars.length,902);assert.equal(first.events.filter(x=>x[0]==='script').length,137);assert.equal(first.events.filter(x=>x[0]==='window-event'&&x[1]==='load').length,1);assert(first.storage.has('otg-lab:verified-fh5-boot-v09'));
 const offline=await once({storage:first.storage,offline:true});assert.equal(offline.cars.length,902);assert(!offline.fetches.some(x=>x.includes('library-v1.json')));assert.equal(offline.events.filter(x=>x[0]==='script').length,137);
 const bad=await once({storage:new Map(),tampered:true});assert.equal(bad.cars,undefined);assert.equal(bad.events.filter(x=>x[0]==='script').length,0);assert(bad.events.some(x=>x[0]==='status'&&x[1].includes('SAFE STOP')));
 console.log('PASS: network first boot, 137 scripts ordered, offline cached reboot, tampered SHA blocks all app scripts');
})().catch(e=>{console.error(e);process.exit(1)});
