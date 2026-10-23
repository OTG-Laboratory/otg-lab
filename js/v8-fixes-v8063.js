/* OTG! v8.0.63 — live QA polish after v8.0.62.
   - Festival Lonely Hearts intro now mirrors the clean Race Off presentation.
   - Hennessy typo is canonicalised into Hennessey without losing cars/progress.
   - Race Off catalogue keeps Festival before Favourite Manufacturer. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').replace(/\u00a0/g,' ').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const isHennessey=v=>['hennessey','hennessy'].includes(norm(v));

function repairHennessey8063(){
 let changed=false;
 try{
  if(typeof state==='undefined'||!Array.isArray(state?.spaces))return false;
  for(const s of state.spaces){
   const canonical='Hennessey';
   for(const c of s.cars||[]){if(isHennessey(c?.make)&&c.make!==canonical){c.make=canonical;changed=true}}
   if(isHennessey(s.favouriteManufacturer)&&s.favouriteManufacturer!==canonical){s.favouriteManufacturer=canonical;changed=true}
   for(const r of s.runs||[]){if(['make','favourite'].includes(String(r?.type||r?.championshipType||''))&&isHennessey(r?.value)&&r.value!==canonical){r.value=canonical;changed=true}}
   for(const ro of s.raceOffs||[]){
    if(['make','favourite'].includes(String(ro?.type||''))&&isHennessey(ro?.value)&&ro.value!==canonical){ro.value=canonical;changed=true}
    for(const c of ro?.entrants||[]){if(isHennessey(c?.make)&&c.make!==canonical){c.make=canonical;changed=true}}
   }
  }
  if(changed&&typeof rhSave==='function')rhSave();
 }catch(err){console.warn('OTG! v8.0.63 Hennessey repair skipped',err)}
 return changed;
}

function polishFestivalLonely8063(){
 const section=$('festival')?.querySelector('.rhLonelyHearts8062');if(!section)return;
 const intro=section.querySelector('.rhFestivalDetailIntroV1'),copy=intro?.querySelector('span'),badge=intro?.querySelector('b');
 if(copy)copy.textContent='One car from every Manufacturer that currently has exactly one owned car in this Garage. The field freezes when you start the Cup.';
 if(badge){
  const count=(badge.textContent.match(/\d+/)||[])[0]||String(window.rhLonelyHeartsEligible8062?.().length||'');
  badge.textContent=`${count} ONE-CAR MANUFACTURERS`;
 }
}

function normaliseRaceOffCatalogueOrder8063(){
 const body=$('raceoff')?.querySelector('.rhFestivalBodyV1');if(!body)return;
 const fav=body.querySelector('.rhRaceOffFavouriteV1');if(!fav)return;
 const festival=[...body.children].find(x=>x!==fav&&x.matches?.('.rhFestivalSectionV1')&&/^OTG! RACE OFFS$/i.test(x.querySelector(':scope > h2')?.textContent?.trim()||''));
 if(!festival)return;
 const pos=festival.compareDocumentPosition(fav);
 if(pos&Node.DOCUMENT_POSITION_PRECEDING)body.insertBefore(festival,fav);
}

repairHennessey8063();
const baseFestival=window.rhRenderFestival;
if(typeof baseFestival==='function')window.rhRenderFestival=function(){repairHennessey8063();const out=baseFestival.apply(this,arguments);polishFestivalLonely8063();return out};
const baseRaceOff=window.rhRenderRaceOff;
if(typeof baseRaceOff==='function')window.rhRenderRaceOff=function(){repairHennessey8063();const out=baseRaceOff.apply(this,arguments);normaliseRaceOffCatalogueOrder8063();return out};

window.rhRepairHennesseyV8063=repairHennessey8063;
window.rhPolishFestivalLonelyV8063=polishFestivalLonely8063;
window.rhNormaliseRaceOffCatalogueOrderV8063=normaliseRaceOffCatalogueOrder8063;
})();
