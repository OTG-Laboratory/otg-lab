'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const library=JSON.parse(read('catalogue-packs/tracks-library-v1.json'));
const raw=fs.readFileSync(path.join(root,'catalogue-packs/fh5-tracks-1.0.0.json'));
const p=JSON.parse(raw);const sha=crypto.createHash('sha256').update(raw).digest('hex');
assert.equal(sha,library.packs[0].sha256,'independent SHA-256 matches');
assert.equal(p.tracks.length,145);assert.equal(p.schema,'otg-lab-fh5-track-pack-v1');
const original=JSON.parse(read('tests/_legacy_tracks_snapshot.json'));const oldHints=new Map(p.tracks.map(t=>[t.name,t.locationHint]));
for(let i=0;i<145;i++){
 const t=p.tracks[i],old=original[i];assert.equal(t.trackId,'fh5-track-v1-'+String(i+1).padStart(4,'0'));
 for(let key of Object.keys(old))assert.deepEqual(t[key],old[key],`preserved legacy taxonomy #${i} field ${key}`);
 assert(t.locationHint && t.locationHint.length>20);
}
assert.equal(new Set(p.tracks.map(t=>t.trackId)).size,145);
assert.equal(new Set(p.tracks.map(t=>t.name)).size,145);
const w={OTG_LAB_VERIFIED_FH5_TRACKS_V10:p.tracks.map(({locationHint,...t})=>t),OTG_LAB_VERIFIED_FH5_TRACK_HINTS_V10:Object.fromEntries(p.tracks.map(t=>[t.name,t.locationHint]))};
const ctx=vm.createContext({window:w,console,document:{querySelector:()=>null,getElementById:()=>null},state:{spaces:[]},crypto:crypto.webcrypto,MutationObserver:class{observe(){}},setTimeout(){} });
for(let f of ['fh5-track-taxonomy-v8067.js','fh5-track-cleanup-v8070.js','fh5-track-ids-lab-v04.js','fh5-track-directory-v8103.js']){
 vm.runInContext(read('js/'+f),ctx,{filename:f});
}
assert.equal(w.rhFH5TrackTaxonomy8070.tracks.length,145);
assert.equal(w.rhFH5TrackIdsLab04.ok,true);
assert.equal(w.rhFH5TrackIdsLab04.validate(),true);
assert.equal(w.rhFH5TrackIdsLab04.idFor('Aerodromo Sprint'),'fh5-track-v1-0136');
assert.equal(w.rhFH5TrackTaxonomy8070.canonical('Aerodromo Sprint'),'Aeródromo Sprint');
assert.deepEqual(JSON.parse(JSON.stringify(w.rhFH5TrackTaxonomy8070.summary())),{ROAD:{standard:53,finales:3},OFFROAD:{standard:38,finales:2},RALLY:{standard:24,finales:1},HOT_WHEELS:{standard:17,finales:1},DRAG:{standard:3,finales:0}});
assert.equal(oldHints.get('Aeródromo Sprint'),w.OTG_LAB_VERIFIED_FH5_TRACK_HINTS_V10['Aeródromo Sprint']);
assert.equal(w.rhFH5TrackTaxonomy8070.track('The Gauntlet').roadWildcard,true);
assert.equal(w.rhFH5TrackTaxonomy8070.specialTracks.length,3);
for(let f of ['fh5-track-taxonomy-v8067.js','fh5-track-cleanup-v8070.js','fh5-track-ids-lab-v04.js','fh5-track-directory-v8103.js']){
 const src=read('js/'+f);assert(!src.includes('const FROZEN=[['),`no embedded frozen routes ${f}`);assert(!src.includes('const HINTS={'),`no embedded location directory ${f}`);
}
const boot=read('js/otg-lab-download-boot-v10.js');assert(boot.includes(sha));assert(boot.includes('OTG_LAB_VERIFIED_FH5_TRACKS_V10'));assert(boot.includes('OTG_LAB_VERIFIED_FH5_TRACK_HINTS_V10'));
const manifest=JSON.parse(read('js/otg-lab-boot-manifest-v10.json'));assert.equal(manifest.scripts.length,137);
for(let f of ['fh5-track-taxonomy-v8067.js','fh5-track-cleanup-v8070.js','fh5-track-ids-lab-v04.js','fh5-track-directory-v8103.js'])assert(manifest.scripts.some(x=>x.includes(f)));
assert.equal(JSON.parse(read('update-manifest.json')).labVersion,'0.10');
assert(read('index.html').includes('DEVELOPMENT COPY · v0.10'));
console.log('PASS: independent 145-track pack SHA, IDs, fields, 145 clues, 145 API routes, 5 pools, aliases, 137 modules, v0.10 manifest');
