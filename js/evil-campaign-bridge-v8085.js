/* OTG! v8.0.85 — Evil Campaign return-button hotfix.
   v8.0.84 two-way bridge retained; return controls now use bound click handlers and a deterministic screen handoff.
   - DONE slots get a direct SHOW RESULTS action linked by the saved event/tournament id.
   - Evil-origin events carry a small SLOT origin marker while active.
   - Completed Festival / Race Off screens get RETURN TO EVIL CAMPAIGN.
   - Slot completion remains manual. Campaign order/progress rules are unchanged. */
(()=>{
'use strict';
const V='8.0.85';
const KEY='evilCampaign8076';
const DATA=()=>window.rhEvilCampaignData8076||{meta:{campaignId:'evil-8076-r1'},slots:[]};
const E=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const same=(a,b)=>String(a??'')===String(b??'');
const space=()=>{try{return typeof window.rhSpace==='function'?window.rhSpace():null}catch(_){return null}};
const slotBy=n=>(DATA().slots||[]).find(s=>Number(s.slot)===Number(n))||null;
const markerSlot=m=>Number(m?.slot)||0;
function markerMatches(m,s){
 if(!m||!s)return false;
 const campaign=String(DATA().meta?.campaignId||'');
 return (!campaign||same(m.campaignId,campaign))&&(same(m.slotId,s.id)||Number(m.slot)===Number(s.slot));
}
function progress(){
 const s=space();if(!s)return null;
 let p=s[KEY];
 if(!p||typeof p!=='object')return null;
 if(!p.links||typeof p.links!=='object')p.links={};
 return p;
}
function completedFestivalById(id){return (space()?.runs||[]).find(r=>same(r?.id,id)&&r?.status==='complete')||null}
function completedRaceOffById(id){return (space()?.raceOffs||[]).find(r=>same(r?.id,id)&&r?.status==='complete')||null}
function linkedResult(slotNum){
 const s=slotBy(slotNum);if(!s)return null;
 const p=progress(),stored=p?.links?.[s.id];
 if(stored?.kind==='festival'){const r=completedFestivalById(stored.id);if(r&&markerMatches(r.evilCampaign8076,s))return{kind:'festival',id:r.id,item:r,slot:s}}
 if(stored?.kind==='raceoff'){const ro=completedRaceOffById(stored.id);if(ro&&markerMatches(ro.evilCampaign8076,s))return{kind:'raceoff',id:ro.id,item:ro,slot:s}}
 const festivals=(space()?.runs||[]).filter(r=>r?.status==='complete'&&markerMatches(r?.evilCampaign8076,s)).sort((a,b)=>String(b.completedAt||b.updatedAt||'').localeCompare(String(a.completedAt||a.updatedAt||'')));
 if(festivals[0])return{kind:'festival',id:festivals[0].id,item:festivals[0],slot:s};
 const raceoffs=(space()?.raceOffs||[]).filter(ro=>ro?.status==='complete'&&markerMatches(ro?.evilCampaign8076,s)).sort((a,b)=>String(b.completedAt||b.updatedAt||'').localeCompare(String(a.completedAt||a.updatedAt||'')));
 if(raceoffs[0])return{kind:'raceoff',id:raceoffs[0].id,item:raceoffs[0],slot:s};
 return null;
}
function rememberLink(slotNum){
 const link=linkedResult(slotNum),p=progress(),s=slotBy(slotNum);if(!link||!p||!s)return link;
 const next={kind:link.kind,id:String(link.id),savedAt:new Date().toISOString()};
 if(!p.links[s.id]||p.links[s.id].kind!==next.kind||!same(p.links[s.id].id,next.id)){
   p.links[s.id]=next;try{window.rhSave?.()}catch(_){}
 }
 return link;
}
function markerForFestival(id){return (space()?.runs||[]).find(r=>same(r?.id,id))?.evilCampaign8076||null}
function raceOffById(id){return (space()?.raceOffs||[]).find(ro=>same(ro?.id,id))||null}
function markerForRaceOff(id){return raceOffById(id)?.evilCampaign8076||null}
function originHtml(m){const n=markerSlot(m);return n?`<div class="rhEvilOrigin8084"><span>EVIL CAMPAIGN</span><b>SLOT ${String(n).padStart(3,'0')}</b></div>`:''}
function decorateOrigin(host,m){
 if(!host||!markerSlot(m)||host.querySelector('.rhEvilOrigin8084'))return;
 const target=host.querySelector('.rhFestivalBodyV1,.rhChamp33Body,.rhContent,.rhRaceOffChampionBodyV6123');
 if(target)target.insertAdjacentHTML('afterbegin',originHtml(m));
}
function decorateFestival(id){
 const run=(space()?.runs||[]).find(r=>same(r?.id,id));if(!run?.evilCampaign8076)return;
 const m=run.evilCampaign8076;
 if(run.status==='complete'){
   const host=document.getElementById('final-standings');if(!host||host.classList.contains('hidden'))return;
   if(!host.querySelector('.rhEvilReturn8084')){
     const page=host.querySelector('.rhFS28Page')||host;
     const btn=document.createElement('button');btn.className='rhEvilReturn8084 rhEvilReturnFinal8084';btn.type='button';btn.dataset.evilKind='festival';btn.dataset.evilId=String(run.id);btn.innerHTML=`<small>EVIL • SLOT ${String(markerSlot(m)).padStart(3,'0')}</small><b>RETURN TO CAMPAIGN</b>`;bindReturn(btn);page.insertAdjacentElement('beforeend',btn);
   }
 }else decorateOrigin(document.getElementById('festival'),m);
}
function decorateRaceOff(id){
 const ro=raceOffById(id);if(!ro?.evilCampaign8076)return;
 const host=document.getElementById('raceoff');if(!host)return;
 decorateOrigin(host,ro.evilCampaign8076);
 if(ro.status==='complete'&&!host.querySelector('.rhEvilReturn8084')){
   const actions=host.querySelector('.rhRaceOffChampionActionsV6123');
   const btn=document.createElement('button');btn.className='btn rhEvilReturn8084 rhEvilReturnRaceOff8084';btn.type='button';btn.dataset.evilKind='raceoff';btn.dataset.evilId=String(ro.id);btn.innerHTML=`<small>EVIL • SLOT ${String(markerSlot(ro.evilCampaign8076)).padStart(3,'0')}</small><b>RETURN TO EVIL CAMPAIGN</b>`;bindReturn(btn);if(actions)actions.insertAdjacentElement('beforeend',btn);else (host.querySelector('.rhRaceOffChampionBodyV6123')||host).insertAdjacentElement('beforeend',btn);
 }
}
function returnToEvil(kind,id){
 const m=kind==='raceoff'?markerForRaceOff(id):markerForFestival(id),n=markerSlot(m);if(!n){try{window.toast?.('Evil Campaign slot link is unavailable')}catch(_){}return false}
 try{window.show?.('evilcampaign')}catch(_){document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));document.getElementById('evilcampaign')?.classList.remove('hidden')}
 try{window.rhRenderEvilCampaign8076?.()}catch(_){ }
 const open=()=>{try{window.rhEvilOpenSlot8076?.(n);window.scrollTo?.(0,0)}catch(e){console.warn('Evil Campaign return failed',e)}};
 if(typeof window.requestAnimationFrame==='function')window.requestAnimationFrame(open);else setTimeout(open,0);
 return true;
}
function bindReturn(btn){
 if(!btn||btn.dataset.evilReturnBound==='1')return btn;
 btn.dataset.evilReturnBound='1';
 btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();returnToEvil(btn.dataset.evilKind,btn.dataset.evilId)});
 return btn;
}
window.rhEvilReturn8085=returnToEvil;
window.rhEvilReturn8084=returnToEvil;
window.rhEvilShowResults8084=function(slotNum){
 const link=rememberLink(slotNum);if(!link){try{window.toast?.('No completed result is linked to this Evil slot')}catch(_){}return}
 if(link.kind==='raceoff'){try{window.show?.('raceoff')}catch(_){};return window.rhRaceOffRenderChampion?.(link.id)}
 try{window.show?.('festival')}catch(_){};return window.rhOpenRun?.(link.id);
};
function decorateEvilList(){
 const host=document.getElementById('evilcampaign');if(!host)return;
 host.querySelectorAll('.rhEvilRow8076.done').forEach(row=>{
   if(row.dataset.rhResults8084)return;
   const n=Number(row.querySelector('i')?.textContent||0),link=linkedResult(n);if(!n||!link)return;
   row.dataset.rhResults8084='1';
   const btn=document.createElement('button');btn.type='button';btn.className='rhEvilShowResults8084';btn.innerHTML='<span>↗</span><b>SHOW RESULTS</b>';
   btn.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();window.rhEvilShowResults8084(n)});
   row.insertAdjacentElement('afterend',btn);
 });
 const hero=host.querySelector('.rhEvilSlotCard8076.done');if(hero&&!host.querySelector('.rhEvilShowResultsSlot8084')){
   const title=host.querySelector('.rhEvilSlotHero8076 h1')?.textContent||'',n=Number((title.match(/\d+/)||[])[0]||0),link=linkedResult(n),actions=host.querySelector('.rhEvilActions8076');
   if(n&&link&&actions){const btn=document.createElement('button');btn.type='button';btn.className='btn secondary rhEvilShowResultsSlot8084';btn.textContent='SHOW RESULTS';btn.onclick=()=>window.rhEvilShowResults8084(n);actions.insertAdjacentElement('afterbegin',btn)}
 }
}

/* Evil list/detail decorators and exact-id link capture when a slot is marked DONE. */
const baseRenderEvil=window.rhRenderEvilCampaign8076;
if(typeof baseRenderEvil==='function')window.rhRenderEvilCampaign8076=function(){const out=baseRenderEvil.apply(this,arguments);decorateEvilList();return out};
const baseOpenSlot=window.rhEvilOpenSlot8076;
if(typeof baseOpenSlot==='function')window.rhEvilOpenSlot8076=function(){const out=baseOpenSlot.apply(this,arguments);decorateEvilList();return out};
const baseSetStatus=window.rhEvilSetStatus8076;
if(typeof baseSetStatus==='function')window.rhEvilSetStatus8076=function(n,status){if(status==='done')rememberLink(n);const out=baseSetStatus.apply(this,arguments);if(status==='done')rememberLink(n);decorateEvilList();return out};

/* Festival decorators. */
const baseOpenRun=window.rhOpenRun;
if(typeof baseOpenRun==='function')window.rhOpenRun=function(id){const out=baseOpenRun.apply(this,arguments);requestAnimationFrame(()=>decorateFestival(id));return out};
const baseFinal=window.rhShowFinalStandingsV5828;
if(typeof baseFinal==='function')window.rhShowFinalStandingsV5828=function(id){const out=baseFinal.apply(this,arguments);requestAnimationFrame(()=>decorateFestival(id));return out};
const baseComplete=window.rhChampionshipCompleteTransition;
if(typeof baseComplete==='function')window.rhChampionshipCompleteTransition=function(id){const out=baseComplete.apply(this,arguments);requestAnimationFrame(()=>decorateFestival(id));return out};

/* Race Off decorators across resume/setup/live/champion screens. */
function wrapRaceOff(name){const base=window[name];if(typeof base!=='function')return;window[name]=function(id){const out=base.apply(this,arguments);requestAnimationFrame(()=>decorateRaceOff(id));return out}}
['rhRenderRaceOffLocked','rhRaceOffOpenRoundSetup','rhRaceOffRenderDrawComplete','rhRaceOffRenderRoundProgress','rhRaceOffEnterNext','rhRaceOffRenderChampion'].forEach(wrapRaceOff);

/* Backfill direct links for already-DONE slots such as Slot 001 without mutating campaign order. */
try{const p=progress();if(p?.done)for(const s of DATA().slots||[])if(p.done[s.id])rememberLink(s.slot)}catch(_){}
window.rhEvilBridgeReport8084=()=>({version:V,links:Object.keys(progress()?.links||{}).length});
})();
