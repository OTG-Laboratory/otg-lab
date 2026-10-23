/* OTG! v6.0.0 — Stage 1: Garage foundation.
   Non-destructive schema migration only. Existing v5 Garage/Space data remains authoritative. */
const RH_V6_BUILD_VERSION='6.0.45';
const RH_V6_SCHEMA=3;

function rhV6NormaliseSpace(space,index=0){
 const s=(space&&typeof space==='object')?space:{};
 if(!s.id)s.id=rhId('space');
 if(typeof s.name!=='string'||!s.name.trim())s.name=index===0?'My OTG!':`OTG! ${index+1}`;
 s.cars=Array.isArray(s.cars)?s.cars.map(car=>{
   const original=(car&&typeof car==='object')?car:{};
   const normal=normaliseCar(original);
   // Preserve the existing stable car id: Championships/results refer to it.
   if(original.id)normal.id=original.id;
   normal.classType=String(original.classType||normal.classType||'').trim();
   return Object.assign({},original,normal);
 }):[];
 if(!Array.isArray(s.runs))s.runs=[];
 if(!Array.isArray(s.customEvents))s.customEvents=[];
 if(!Array.isArray(s.backups))s.backups=[];
 if(typeof s.favouriteManufacturer!=='string')s.favouriteManufacturer='';
 return s;
}

function rhV6MigrateState(raw){
 const next=(raw&&typeof raw==='object')?raw:{};
 next.spaces=Array.isArray(next.spaces)?next.spaces.map(rhV6NormaliseSpace):[];
 if(!next.spaces.length)next.spaces=[rhSpaceTemplate('My OTG!',[])];
 if(!next.spaces.some(s=>s.id===next.activeSpaceId))next.activeSpaceId=next.spaces[0].id;
 next.settings=Object.assign({sound:true,confetti:true,vibrate:true},next.settings||{});
 if(typeof next.driverName!=='string')next.driverName='';
 if(typeof next.onboarded!=='boolean')next.onboarded=Boolean(next.driverName);
 next.schema=RH_V6_SCHEMA;
 next.version=RH_V6_BUILD_VERSION;
 return next;
}

// Replace only persistence entry points. All proven v5 systems continue to use the same state object.
rhLoad=function(){
 try{
   const stored=JSON.parse(localStorage.getItem(RH_FINAL_STORE)||'null');
   if(stored&&Array.isArray(stored.spaces)&&stored.spaces.length){
     const migrated=rhV6MigrateState(stored);
     const valid=id=>migrated.spaces.some(s=>s.id===id);
     if(!valid(migrated.defaultSpaceId))migrated.defaultSpaceId=valid(migrated.activeSpaceId)?migrated.activeSpaceId:migrated.spaces[0].id;
     migrated.activeSpaceId=migrated.defaultSpaceId;
     localStorage.setItem(RH_FINAL_STORE,JSON.stringify(migrated));
     return migrated;
   }
 }catch(e){}
 try{
   const old=JSON.parse(localStorage.getItem(STORE)||'null');
   if(old?.cars){
     const migrated=rhV6MigrateState(rhMigrateLegacy(old));
     migrated.defaultSpaceId=migrated.activeSpaceId;
     localStorage.setItem(RH_FINAL_STORE,JSON.stringify(migrated));
     return migrated;
   }
 }catch(e){}
 const space=rhSpaceTemplate('My OTG!',[]);
 const fresh=rhV6MigrateState({driverName:'',spaces:[space],activeSpaceId:space.id,defaultSpaceId:space.id,settings:{sound:true,confetti:true,vibrate:true},onboarded:false});
 localStorage.setItem(RH_FINAL_STORE,JSON.stringify(fresh));
 return fresh;
};

rhSave=function(){
 if(state&&typeof state==='object'){
   state.schema=RH_V6_SCHEMA;
   state.version=RH_V6_BUILD_VERSION;
 }
 localStorage.setItem(RH_FINAL_STORE,JSON.stringify(state));
};
