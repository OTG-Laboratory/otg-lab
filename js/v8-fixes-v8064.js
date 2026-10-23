/* OTG! v8.0.64 — Race Off catalogue in-progress presentation.
   - Removes the temporary top-level CONTINUE RACE OFF bucket.
   - Active/setup Race Offs stay in their natural catalogue sections.
   - Their catalogue cards become IN PROGRESS resume cards, like Festival.
   - Multiple active tournaments from the same catalogue entry remain individually resumable. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const norm=v=>String(v??'').replace(/\u00a0/g,' ').trim().replace(/\s+/g,' ').toLocaleLowerCase();
const key=(type,value)=>`${norm(type)}\u0001${norm(value)}`;
const active=ro=>ro&&!['complete','abandoned'].includes(String(ro.status||'').toLowerCase());
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));

function stageText8064(ro){
 const i=Number(ro?.currentRoundIndex||0),rd=ro?.rounds?.[i],locked=Number(ro?.entryIds?.length||ro?.entrants?.length||0);
 if(!rd)return `${locked} cars locked • Ready for Round 1 setup`;
 const label=rd.drawPlan?.label||rd.stageLabel||rd.label||`Round ${i+1}`;
 const matches=Array.isArray(rd.matches)?rd.matches:[];
 const done=matches.filter(m=>m?.status==='complete'||m?.winnerCarId).length,total=matches.length;
 if(rd.status==='setup')return `${label} • setup`;
 if(rd.status==='drawn')return `${label} • Draw complete`;
 if(total)return `${label} • ${done} of ${total} matches complete`;
 return `${label} • ${String(rd.status||'ready').replace(/-/g,' ')}`;
}

function makeResumeCard8064(template,ro){
 const card=template.cloneNode(true);
 card.classList.remove('rhRaceOffLaunchCard');
 card.classList.add('rhRaceOffResumeCard8064');
 ['roType','roValue','roName','roCount'].forEach(k=>{try{delete card.dataset[k]}catch(_){}});
 card.dataset.raceoffId=String(ro.id||'');
 const title=card.querySelector('span > b, b');if(title)title.textContent=String(ro.name||title.textContent||'Race Off');
 const small=card.querySelector('span > small, small');if(small)small.textContent=`IN PROGRESS • ${stageText8064(ro)}`;
 card.setAttribute('aria-label',`Continue ${String(ro.name||'Race Off')}`);
 card.onclick=e=>{e.preventDefault();e.stopPropagation();window.rhRenderRaceOffLocked?.(ro.id)};
 return card;
}

function fallbackCard8064(ro){
 const b=document.createElement('button');b.className='rhChampCard rhRaceOffResumeCard8064';b.dataset.raceoffId=String(ro.id||'');
 b.innerHTML=`<span><b>${E(ro.name||'Race Off')}</b><small>IN PROGRESS • ${E(stageText8064(ro))}</small></span><em>›</em>`;
 b.onclick=e=>{e.preventDefault();e.stopPropagation();window.rhRenderRaceOffLocked?.(ro.id)};return b;
}

function fallbackTarget8064(root,ro){
 const type=String(ro?.type||'');
 if(type==='lonely-hearts')return root.querySelector('.rhLonelyHeartsRaceOff8062');
 if(type==='festival')return [...root.querySelectorAll('.rhFestivalSectionV1')].find(x=>/^OTG! RACE OFFS$/i.test(x.querySelector(':scope > h2')?.textContent?.trim()||''));
 if(type==='favourite')return root.querySelector('.rhRaceOffFavouriteV1');
 const summaries=[...root.querySelectorAll('details.rhFestivalSectionV1')];
 if(type==='vintage'||type==='classic')return root.querySelector('.rhFestivalHeritageV6 .rhFestivalExpandedV1');
 if(type==='era')return summaries.find(d=>/ERA RACE OFFS/i.test(d.querySelector('summary')?.textContent||''))?.querySelector('.rhFestivalExpandedV1');
 if(type==='classType')return summaries.find(d=>/CLASS \/ TYPE RACE OFFS/i.test(d.querySelector('summary')?.textContent||''))?.querySelector('.rhFestivalExpandedV1');
 if(type==='make')return summaries.find(d=>/MANUFACTURER RACE OFFS/i.test(d.querySelector('summary')?.textContent||''))?.querySelector('.rhFestivalExpandedV1');
 const sameType=root.querySelector(`.rhRaceOffLaunchCard[data-ro-type="${CSS.escape(type)}"]`);if(sameType)return sameType.parentElement;
 return null;
}

function decorateRaceOffCatalogue8064(){
 const root=$('raceoff');if(!root)return;
 // v6/v8 legacy wrappers insert a top Continue bucket. v8.0.64 deliberately replaces it with Festival-style cards in place.
 root.querySelectorAll('.rhRaceOffContinue').forEach(x=>x.remove());
 const list=((typeof rhSpace==='function'?rhSpace()?.raceOffs:null)||[]).filter(active).sort((a,b)=>String(a.createdAt||a.updatedAt||'').localeCompare(String(b.createdAt||b.updatedAt||'')));
 if(!list.length)return;
 const groups=new Map();for(const ro of list){const k=key(ro.type,ro.value);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(ro)}
 const cards=[...root.querySelectorAll('.rhRaceOffLaunchCard')];
 for(const original of cards){
  const k=key(original.dataset.roType,original.dataset.roValue),runs=groups.get(k);if(!runs?.length)continue;
  const template=original.cloneNode(true),frag=document.createDocumentFragment();
  runs.forEach(ro=>frag.appendChild(makeResumeCard8064(template,ro)));
  original.replaceWith(frag);groups.delete(k);
 }
 // Frozen active tournaments remain reachable even if later Garage changes mean the normal launch card is no longer generated.
 for(const runs of groups.values())for(const ro of runs){const target=fallbackTarget8064(root,ro);if(target)target.appendChild(fallbackCard8064(ro));}
}

const base=window.rhRenderRaceOff;
if(typeof base==='function')window.rhRenderRaceOff=function(){const out=base.apply(this,arguments);decorateRaceOffCatalogue8064();return out};
window.rhDecorateRaceOffCatalogueV8064=decorateRaceOffCatalogue8064;
window.rhRaceOffStageTextV8064=stageText8064;
})();
