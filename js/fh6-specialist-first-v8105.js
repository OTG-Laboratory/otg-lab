/* OTG! v8.0.105 — FH6 Specialist-First planning workshop.
   Prelaunch planning ONLY: no race generator, launch, track or location replacement.
   All decisions are scoped to the FH6 Space, keyed by immutable catalogue ID.
*/
(()=>{
'use strict';
const KEY='fh6-catalogue-v1';
const ECO=['NORMAL','FORZA EDITION','DRIFT','RACE','OFF-ROAD / BUGGY'];
const CARS=window.FH6_CATALOGUE||[];
const BY_ID=new Map(CARS.map(c=>[c.id,c]));
let filter='ALL', category='ALL', query='', visible=50;
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalized=s=>String(s||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function space(){return window.fh6Space?.()||null;}
function active(){return !!(space()&&typeof rhSpace==='function'&&rhSpace()?.id===space().id);}
function store(create=false){
 const s=space();if(!s)return null;
 if(!s.fh6SpecialistPrep&&create){s.fh6SpecialistPrep={schema:1,decisions:{},lockedForCampaign:false};rhSync();rhSave();}
 const p=s.fh6SpecialistPrep;
 if(!p)return null;
 if(!p.decisions||typeof p.decisions!=='object')p.decisions={};
 return p;
}
function suggested(c){
 const hint=String(c?.evilHint||'').trim().toUpperCase();
 if(hint==='FORZA EDITION')return 'FORZA EDITION';
 if(hint==='DRIFT')return 'DRIFT';
 if(hint==='OFF-ROAD / BUGGY')return 'OFF-ROAD / BUGGY';
 if(hint==='RACE?')return 'RACE';
 if(hint==='REVIEW')return 'UNRESOLVED';
 return 'NORMAL';
}
function verified(cid){const d=store(false)?.decisions?.[cid];return !!(d&&ECO.includes(d.ecosystem)&&d.confirmedAt&&(d.ecosystem!=='FORZA EDITION'||['ROAD','OFF-ROAD'].includes(d.role)));}
function decision(cid){const d=store(false)?.decisions?.[cid];return verified(cid)?d:null;}
function classification(c){return decision(c.id)?.ecosystem||suggested(c);}
function roleFor(eco,role){if(eco==='DRIFT')return 'DRIFT ZONE';if(eco==='OFF-ROAD / BUGGY')return 'OFF-ROAD';if(eco==='FORZA EDITION')return role;return 'ROAD';}
function preview(){
 const results={total:CARS.length,confirmed:0,provisional:0,unresolved:0,owned:0,pools:{},confirmedPools:{}};
 for(const e of ECO){results.pools[e]=0;results.confirmedPools[e]=0;}
 for(const c of CARS){
  const d=decision(c.id), e=d?.ecosystem||suggested(c);
  if(d){results.confirmed++;results.pools[e]++;results.confirmedPools[e]++;}
  else if(e==='UNRESOLVED'){results.unresolved++;}
  else{results.provisional++;results.pools[e]++;}
 }
 const s=space();results.owned=Object.keys(s?.catalogueOwned||{}).filter(id=>BY_ID.has(id)).length;
 return results;
}
function candidateIds(ecosystem,{confirmedOnly=true,ownedOnly=false}={}){
 if(!ECO.includes(ecosystem))return [];
 const s=space();if(!s)return [];
 return CARS.filter(c=>(confirmedOnly?verified(c.id):true)&&classification(c)===ecosystem&&(!ownedOnly||Object.prototype.hasOwnProperty.call(s.catalogueOwned||{},c.id))).map(c=>c.id);
}
function options(selected){return `<option value="UNRESOLVED" ${selected==='UNRESOLVED'?'selected':''}>NEEDS REVIEW</option>`+ECO.map(x=>`<option ${x===selected?'selected':''} value="${x}">${x}</option>`).join('');}
function roleOptions(sel){return ['','ROAD','OFF-ROAD'].map(x=>`<option value="${x}" ${sel===x?'selected':''}>${x||'CHOOSE ROUTE'}</option>`).join('');}
function renderRow(c){
 const d=decision(c.id),hint=String(c.evilHint||''),eco=d?.ecosystem||suggested(c);
 const fe=eco==='FORZA EDITION';
 const role=d?.role||(fe?'':roleFor(eco,''));
 const owned=Object.prototype.hasOwnProperty.call(space()?.catalogueOwned||{},c.id);
 return `<article class="fh6PrepRow" data-prep-id="${c.id}">
 <div class="fh6PrepRowHead"><b>${escapeHtml(c.full)}</b><span class="fh6PrepBadge ${d?'fh6PrepConfirmed':'fh6PrepDraft'}">${d?'CONFIRMED':eco==='UNRESOLVED'?'NEEDS REVIEW':'DRAFT'}</span></div>
 <div class="fh6PrepSub">${escapeHtml(c.classType)} · ${owned?'OWNED':'UNOWNED'} · ${hint?'Roster hint: '+escapeHtml(hint):'No specialist flag in snapshot'}</div>
 <div class="fh6PrepSelects"><label>ECOSYSTEM<select aria-label="Ecosystem for ${escapeHtml(c.full)}" data-prep-eco="${c.id}" onchange="fh6PrepRoleChanged('${c.id}')">${options(eco)}</select></label>
 <label class="fh6PrepRole" data-prep-role-wrap="${c.id}" ${fe?'':'hidden'}>FORZA EDITION ROUTE<select data-prep-role="${c.id}" aria-label="Forza Edition route for ${escapeHtml(c.full)}">${roleOptions(role)}</select></label></div>
 <div class="fh6PrepActions"><button type="button" class="fh6PrepConfirm" onclick="fh6PrepConfirm('${c.id}')">${d?'UPDATE CONFIRMATION':'CONFIRM CLASS'}</button>${d?`<button type="button" class="fh6PrepUndo" onclick="fh6PrepUndo('${c.id}')">RETURN TO DRAFT</button>`:''}</div></article>`;
}
function render(){
 if(!active())return;
 store(true);
 const total=preview();const q=normalized(query);
 const matches=CARS.filter(c=>{
  const d=decision(c.id),eco=d?.ecosystem||suggested(c);
  if(filter==='UNRESOLVED'&&eco!=='UNRESOLVED')return false;
  if(filter==='DRAFT'&&d)return false;
  if(filter==='CONFIRMED'&&!d)return false;
  if(category!=='ALL'&&eco!==category)return false;
  if(q&&!normalized([c.full,c.make,c.model,c.classType,c.evilHint,eco].join(' ')).includes(q))return false;
  return true;
 });
 // Unknown and explicitly questioned vehicle roles rise to the top of the default view.
 if(filter==='ALL'&&category==='ALL'&&!q){
  const order=c=>classification(c)==='UNRESOLVED'?0:!decision(c.id)&&c.evilHint==='RACE?'?1:!decision(c.id)?2:3;
  matches.sort((a,b)=>order(a)-order(b)||a.make.localeCompare(b.make)||a.full.localeCompare(b.full));
 }
 const first=matches.slice(0,visible);
 const board=ECO.map(e=>`<div class="fh6PrepTile"><b>${total.pools[e]}</b><small>${escapeHtml(e)}</small><span>${total.confirmedPools[e]} confirmed</span></div>`).join('');
 const el=document.getElementById('garage');if(!el)return;
 el.innerHTML=`<div class="fh6PrepPage"><header class="fh6PrepHeader"><button onclick="fh6PrepBack()" aria-label="Back to FH6 catalogue">‹</button><div><small>OTG! / FORZA HORIZON 6</small><h1>SPECIALIST-FIRST</h1><p>PRE-LAUNCH CLASSIFICATION WORKSHOP</p></div></header>
 <main class="fh6PrepBody"><section class="fh6PrepIntro"><strong>${total.confirmed} / ${total.total} reviewed</strong><p>${total.provisional} provisional · ${total.unresolved} need review · ${total.owned} owned</p><p>These are <b>draft classifications</b> from the October FH6 roster. A suggestion is not a verified competition entry. CONFIRM requires an explicit selection; nothing here starts an Evil race.</p></section>
 <section class="fh6PrepGrid">${board}<div class="fh6PrepTile alert"><b>${total.unresolved}</b><small>UNRESOLVED</small><span>needs decision</span></div></section>
 <details class="fh6PrepRules"><summary>RACING POLICIES · APPROVED FOUNDATION</summary><p><b>First classify, then filter:</b> specialist designation overrides manufacturer, era, class or theme. NORMAL car races may never pull FE, DRIFT, RACE or OFF-ROAD / BUGGY.</p><p><b>FORZA EDITION:</b> specialist-only, ROAD and OFF-ROAD routes separated. <b>DRIFT:</b> score-based random Drift Zones, no repeats per draw bag. <b>RACE:</b> dedicated race-car events, not every Track Toy. <b>OFF-ROAD / BUGGY:</b> Dirt / Cross Country / Rally Adventure; never ordinary road finales.</p><p><b>Workload:</b> maximum 24 result entries per Festival visit, 5 Race Off pairings per visit. Random car order and random tracks without repeats. No FH6 track names, LOCATION clues, final event roster, or campaign slots have been invented.</p></details>
 <div class="fh6PrepTools"><input id="fh6PrepQuery" type="search" placeholder="Search FH6 cars or hints" value="${escapeHtml(query)}" oninput="fh6PrepSearch(this.value)"><div class="fh6PrepFilters"><select id="fh6PrepStatus" onchange="fh6PrepStatus(this.value)"><option value="ALL" ${filter==='ALL'?'selected':''}>ALL STATUSES</option><option value="UNRESOLVED" ${filter==='UNRESOLVED'?'selected':''}>NEEDS REVIEW</option><option value="DRAFT" ${filter==='DRAFT'?'selected':''}>NOT CONFIRMED</option><option value="CONFIRMED" ${filter==='CONFIRMED'?'selected':''}>CONFIRMED</option></select><select id="fh6PrepPool" onchange="fh6PrepCategory(this.value)"><option value="ALL">ALL ECOSYSTEMS</option><option value="UNRESOLVED" ${category==='UNRESOLVED'?'selected':''}>NEEDS REVIEW</option>${ECO.map(e=>`<option value="${e}" ${category===e?'selected':''}>${e}</option>`).join('')}</select></div></div>
 <p class="fh6PrepMatch">Showing ${first.length} of ${matches.length} matching cars. Changes are saved into FH6 only, not FH5 or GT7.</p><section class="fh6PrepRows">${first.map(renderRow).join('')||'<p class="fh6PrepEmpty">Nothing matches these filters.</p>'}</section>
 ${matches.length>first.length?`<button type="button" class="fh6PrepLoad" onclick="fh6PrepMore()">SHOW NEXT ${Math.min(50,matches.length-first.length)} CARS ▼</button>`:''}
 <div class="fh6PrepFooter"><b>NOT READY TO LAUNCH</b><p>FH6 tracks, Drift Zones and locations must be verified in-game. Classifications here are a planning foundation only; launch and playlist generation remain disabled for FH6 Evil.</p><button onclick="fh6PrepBack()">RETURN TO FH6 GARAGE</button></div></main></div>`;
}
function injected(){
 if(!active())return;
 const summary=document.querySelector('#garage .fh6Summary');
 if(summary&&!document.getElementById('fh6PrepLaunch')){
  summary.insertAdjacentHTML('afterend',`<div class="fh6PrepLaunch" id="fh6PrepLaunch"><div><b>FH6 SPECIALIST-FIRST PREP</b><p>Review the 658-car provisional racing classification. FH6 Evil races remain locked until routes are confirmed.</p></div><button type="button" onclick="fh6PrepOpen()">OPEN CLASSIFICATION ›</button></div>`);
 }
}
window.fh6PrepOpen=()=>{if(!active())return;filter='ALL';category='ALL';query='';visible=50;render();};
window.fh6PrepBack=()=>{if(!active())return;window.fh6RenderCatalogue?.();injected();};
window.fh6PrepSearch=q=>{query=String(q||'');visible=50;render();document.getElementById('fh6PrepQuery')?.focus();};
window.fh6PrepStatus=v=>{filter=['ALL','UNRESOLVED','DRAFT','CONFIRMED'].includes(v)?v:'ALL';visible=50;render();};
window.fh6PrepCategory=v=>{category=v==='UNRESOLVED'||ECO.includes(v)?v:'ALL';visible=50;render();};
window.fh6PrepMore=()=>{visible+=50;render();};
window.fh6PrepRoleChanged=cid=>{
 const eco=document.querySelector(`[data-prep-eco="${cid}"]`)?.value;
 const wrap=document.querySelector(`[data-prep-role-wrap="${cid}"]`);
 if(wrap)wrap.hidden=eco!=='FORZA EDITION';
};
window.fh6PrepConfirm=cid=>{
 if(!active()||!BY_ID.has(cid))return false;
 const ecosystem=document.querySelector(`[data-prep-eco="${cid}"]`)?.value;
 if(!ECO.includes(ecosystem)){window.alert?.('Please choose a specialist ecosystem first.');return false;}
 let role=roleFor(ecosystem,document.querySelector(`[data-prep-role="${cid}"]`)?.value||'');
 if(ecosystem==='FORZA EDITION'&&!['ROAD','OFF-ROAD'].includes(role)){window.alert?.('Choose the Forza Edition ROAD or OFF-ROAD route first.');return false;}
 const p=store(true);
 p.decisions[cid]={ecosystem,role,confirmedAt:new Date().toISOString()};
 p.lockedForCampaign=false;
 rhSync();rhSave();render();return true;
};
window.fh6PrepUndo=cid=>{
 if(!active()||!BY_ID.has(cid))return false;
 const p=store(false);if(!p?.decisions?.[cid])return false;
 delete p.decisions[cid];p.lockedForCampaign=false;rhSync();rhSave();render();return true;
};
window.fh6PrepSummary=preview;
window.fh6PrepSuggested=cid=>BY_ID.has(cid)?suggested(BY_ID.get(cid)):null;
window.fh6PrepCandidates=candidateIds;
window.fh6PrepConfirmed=verified;
const previousRender=window.rhRenderGarage;
window.rhRenderGarage=function(){const r=previousRender?.apply(this,arguments);injected();return r;};
})();
