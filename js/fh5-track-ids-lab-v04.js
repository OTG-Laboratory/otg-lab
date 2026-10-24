/* OTG! LAB v0.4 — FH5 frozen track identities. Read-only: does NOT migrate saved data.
   All existing saved track-name strings, randomisation pools and route labels remain unchanged.
   This registry locks the first 145 OTG! FH5 routes to explicit permanent IDs. */
(()=>{
 'use strict';
 const VERSION='0.4';
 const verified=window.OTG_LAB_VERIFIED_FH5_TRACKS_V10;
 if(!Array.isArray(verified)||verified.length!==145)throw Error('OTG! LAB v0.10: frozen track IDs require verified external pack');
 const FROZEN=verified.map(t=>[t.trackId,t.name,t.world,t.category,t.discipline,t.standard,t.finale,t.special]);
 const norm=v=>String(v??'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'');
 const current=window.rhFH5TrackTaxonomy8070||window.rhFH5TrackTaxonomy8067;
 const fail=reason=>{
   // Deliberately do not alter the live taxonomy if the registry fails validation.
   const err='LAB FH5 track identity safety: '+reason;
   console.error(err);
   window.rhFH5TrackIdsLab04={version:VERSION,ok:false,error:err};
   return false;
 };
 if(!current||!Array.isArray(current.tracks))return fail('track taxonomy unavailable');
 const byId=new Map(),byName=new Map();
 for(const row of FROZEN){
   const [id,name,world,category,discipline,standard,finale,special]=row;
   const key=norm(name);
   if(!/^fh5-track-v[1-9]\d*-\d{4,}$/.test(id)||!key||byId.has(id)||byName.has(key))return fail('duplicate, malformed or missing ID/name in the frozen registry');
   const item=Object.freeze({trackId:id,name,world,category,discipline,standard,finale,special});
   byId.set(id,item);byName.set(key,item);
 }
 // All 145 original routes must still exist, once each. Future new routes must be
 // registered with a distinct explicit ID before being published as a catalogue pack.
 if(byId.size!==145)return fail('expected 145 distinct baseline route IDs');
 if(current.tracks.length!==byId.size)return fail('taxonomy route count differs from the frozen registry');
 const seen=new Set();const application=[];
 for(const t of current.tracks){
   const entry=byName.get(norm(t?.name));
   if(!entry||seen.has(entry.trackId))return fail('unregistered or repeated route '+String(t?.name||''));
   if(entry.world!==t.world||entry.category!==t.category||entry.discipline!==t.discipline||entry.standard!==!!t.standard||entry.finale!==!!t.finale||entry.special!==!!t.special){
     return fail('route metadata changed without review: '+t.name);
   }
   if(t.trackId&&t.trackId!==entry.trackId)return fail('existing trackId mismatch: '+t.name);
   seen.add(entry.trackId);
   application.push([t,entry]);
 }
 if(seen.size!==145)return fail('baseline routes missing from live taxonomy');
 // Annotate the public snapshots AND the original rows returned by track(name).
 const originalCanonical=current.canonical.bind(current),originalTrack=current.track.bind(current);
 for(const [t,entry] of application){
   Object.defineProperty(t,'trackId',{value:entry.trackId,enumerable:true,writable:false,configurable:false});
   const internal=originalTrack(entry.name);
   if(internal&&internal!==t){
     if(internal.trackId&&internal.trackId!==entry.trackId)return fail('internal track identity conflict: '+entry.name);
     Object.defineProperty(internal,'trackId',{value:entry.trackId,enumerable:true,writable:false,configurable:false});
   }
 }
 function rowFor(input){
   const raw=String(input??'').trim();
   if(byId.has(raw))return byId.get(raw);
   // Consult existing canonical aliases first, then the frozen original names.
   // This retains legacy names in old races without changing any saved object.
   const canonical=originalCanonical(raw);
   return byName.get(norm(canonical))||byName.get(norm(raw))||null;
 }
 const originalAudit=current.auditNames;
 current.canonical=function(input){const row=rowFor(input);return row?row.name:originalCanonical(input)};
 current.track=function(input){const row=rowFor(input);return originalTrack(row?row.name:input)};
 if(typeof originalAudit==='function')current.auditNames=names=>(names||[]).map(input=>({input,canonical:current.canonical(input),track:current.track(input),ok:!!current.track(input)}));
 window.rhFH5TrackIdsLab04=Object.freeze({
   version:VERSION,ok:true,count:byId.size,
   idFor:input=>rowFor(input)?.trackId||null,
   nameFor:input=>rowFor(input)?.name||null,
   info:input=>rowFor(input)||null,
   validate:()=>current.tracks.length===byId.size&&current.tracks.every(t=>byName.get(norm(t.name))?.trackId===t.trackId),
 });
})();
