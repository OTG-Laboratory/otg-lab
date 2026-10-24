/* OTG! v6.0.68 — FH5 dedicated catalogue, in-place Forza 5 migration. */
const FH5_CATALOGUE=window.OTG_LAB_VERIFIED_FH5_CARS_V09;
if(!Array.isArray(FH5_CATALOGUE)||FH5_CATALOGUE.length!==902)throw Error("OTG! LAB v0.9: no verified downloaded FH5 catalogue; app refused to start");
const FH5_SPACE_KEY='fh5-catalogue-v1';
let fh5CatalogueSearch='',fh5CatalogueMake='All';
let fh5OwnedSet=null;

function fh5Norm(v){return String(v||'').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function fh5Loose(v){return fh5Norm(v).replace(/\b(forza horizon|horizon|forza edition|edition)\b/g,' ').replace(/\s+/g,' ').trim()}
function fh5Slug(v){return String(v||'').normalize('NFKD').replace(/[^\w]+/g,'-').replace(/^-|-$/g,'').toLowerCase()}
function fh5CarId(c){return 'fh5-'+fh5Slug(c.full+'-'+c.year)}
function fh5SpaceNameMatch(name){const n=fh5Norm(name);return n==='forza 5'||n==='forza horizon 5'||n==='fh5'||n==='forza horizon5'||n==='forza'}
function fh5FindExistingSpace(){
  if(!state||!Array.isArray(state.spaces))return null;
  // LAB v0.8: multiple FH5 catalogue Spaces are valid. Respect the ACTIVE one;
  // otherwise Garage operations in an optional FH5 Space silently switch to the first FH5 Space.
  const active=state.spaces.find(s=>s&&s.id===state.activeSpaceId);
  if(active&&active.catalogueKey===FH5_SPACE_KEY)return active;
  return state.spaces.find(s=>s&&s.catalogueKey===FH5_SPACE_KEY)||state.spaces.find(s=>s&&fh5SpaceNameMatch(s.name))||null
}
function fh5Space(){return fh5FindExistingSpace()}
function fh5Tokens(v){return new Set(fh5Loose(v).split(' ').filter(Boolean))}
function fh5Similarity(a,b){const A=fh5Tokens(a),B=fh5Tokens(b);if(!A.size||!B.size)return 0;let h=0;A.forEach(x=>{if(B.has(x))h++});return h/Math.max(A.size,B.size)}
function fh5FindCatalogueMatch(car){
  if(!car)return null;
  const year=String(car.year||'').trim();
  const variants=[car.name,[car.make,car.model].filter(Boolean).join(' '),car.model].map(fh5Loose).filter(Boolean);
  let best=null,bestScore=0;
  for(const c of FH5_CATALOGUE){
    const full=fh5Loose(c.full), model=fh5Loose(c.model);
    let score=0;
    for(const v of variants){
      if(v===full||v===model)score=Math.max(score,1.15);
      else if(v.includes(full)||full.includes(v)||v.includes(model)||model.includes(v))score=Math.max(score,0.92);
      else score=Math.max(score,fh5Similarity(v,full),fh5Similarity(v,model));
    }
    const carMake=fh5Norm(car.make||car.manufacturer||'');
    if(carMake&&carMake===fh5Norm(c.make))score+=0.12;
    if(year&&c.year&&year===String(c.year))score+=0.12;
    if(score>bestScore){bestScore=score;best=c}
  }
  return bestScore>=0.68?best:null
}
function fh5ReconcileExistingCars(s){
  if(!s)return 0;
  if(!s.catalogueOwned||typeof s.catalogueOwned!=='object')s.catalogueOwned={};
  const signature=(s.cars||[]).length+':'+(s.cars||[]).map(c=>c.id||'').join('|').length;
  if(s.catalogueReconcileSignature===signature){fh5OwnedSet=new Set(Object.keys(s.catalogueOwned));return fh5OwnedSet.size;}
  let matched=0;
  (s.cars||[]).forEach(car=>{const c=fh5FindCatalogueMatch(car);if(!c)return;const cid=fh5CarId(c);if(!s.catalogueOwned[cid])s.catalogueOwned[cid]=car.id||cid;matched++});
  s.catalogueReconcileSignature=signature;
  fh5OwnedSet=new Set(Object.keys(s.catalogueOwned));
  return matched
}
function fh5EnsureSpace(activate=true,createIfMissing=true){
  let s=fh5FindExistingSpace();
  if(!s&&!createIfMissing)return null;
  if(!s){s=rhSpaceTemplate('Forza Horizon 5',[]);state.spaces.push(s)}
  s.catalogueKey=FH5_SPACE_KEY;s.catalogueTitle='Forza Horizon 5';
  if(!s.catalogueOwned||typeof s.catalogueOwned!=='object')s.catalogueOwned={};
  fh5ReconcileExistingCars(s);
  if(activate)state.activeSpaceId=s.id;
  rhSync();rhSave();return s
}
function fh5Owned(c){const s=fh5Space();if(!s)return false;if(!fh5OwnedSet)fh5OwnedSet=new Set(Object.keys(s.catalogueOwned||{}));return fh5OwnedSet.has(fh5CarId(c))}
function fh5FestivalUnlocks(){
  const s=fh5Space();if(!s)return new Map();const out=new Map();
  rhMakeList().forEach(m=>out.set('make:'+m,`${m} Championship`));rhEraList().forEach(e=>out.set('era:'+e,`${e}s Championship`));rhClassTypeList().forEach(v=>out.set('classType:'+v,`${v} Championship`));
  if(rhVintageCount()>=RH_CHAMP_MIN_ELIGIBLE)out.set('vintage','Vintage Championship');if(rhClassicCount()>=RH_CHAMP_MIN_ELIGIBLE)out.set('classic','Classic Championship');
  const fav=s.favouriteManufacturer;if(fav&&rhEligible('favourite',fav).length>=RH_CHAMP_MIN_ELIGIBLE)out.set('favourite:'+fav,`${fav} Championship`);return out
}
function fh5AnnounceFestivalUnlocks(before){const after=fh5FestivalUnlocks();const made=[...after].filter(([k])=>!before.has(k)).map(([,n])=>n);if(!made.length)return;toast(made.length===1?`New Festival Championship created: ${made[0]}`:`${made.length} new Festival Championships created: ${made.join(' • ')}`)}
function fh5Toggle(cId){
  const c=FH5_CATALOGUE.find(x=>fh5CarId(x)===cId),s=fh5EnsureSpace(true,true);if(!c||!s)return;
  const ref=s.catalogueOwned[cId],adding=!ref,before=adding?fh5FestivalUnlocks():null;
  if(!adding){delete s.catalogueOwned[cId];const id=typeof ref==='string'?ref:cId;s.cars=(s.cars||[]).filter(x=>x.id!==id&&x.id!==cId)}
  else{s.catalogueOwned[cId]=cId;if(!(s.cars||[]).some(x=>x.id===cId))s.cars.push(normaliseCar({id:cId,make:c.make,model:c.model,year:c.year,classType:c.classType,name:c.full}))}
  rhSync();rhSave();rhRenderGarage();if(adding)fh5AnnounceFestivalUnlocks(before)
}
function fh5RenderCatalogue(){
  const s=fh5EnsureSpace(true,true);const q=fh5CatalogueSearch.trim().toLowerCase();const makes=['All',...new Set(FH5_CATALOGUE.map(c=>c.make))];
  const cars=FH5_CATALOGUE.filter(c=>(fh5CatalogueMake==='All'||c.make===fh5CatalogueMake)&&(!q||[c.full,c.year,c.classType].join(' ').toLowerCase().includes(q)));
  if(!fh5OwnedSet)fh5OwnedSet=new Set(Object.keys(s.catalogueOwned||{}));
  const owned=fh5OwnedSet.size;
  $('garage').innerHTML=`<div class="rhScene rhGarageScene">${rhHeader('FORZA HORIZON 5','Dedicated Catalogue Space','garage')}</div><div class="rhContent"><section class="rhSection fh5Intro"><div><small>FH5 CATALOGUE</small><h2>${owned} / 902 owned</h2><p>Grey cars are unowned. Tick a car to add it to this Forza Space Garage.</p></div></section><section class="rhSection"><div class="fh5Tools"><input id="fh5Search" placeholder="Search manufacturer, car, year or class" value="${esc(fh5CatalogueSearch)}" oninput="fh5CatalogueSearch=this.value;fh5RenderCatalogue()"><select onchange="fh5CatalogueMake=this.value;fh5RenderCatalogue()">${makes.map(m=>`<option ${m===fh5CatalogueMake?'selected':''}>${esc(m)}</option>`).join('')}</select></div><div class="fh5List">${cars.map(c=>{const id=fh5CarId(c),on=fh5Owned(c);return `<label class="fh5Car ${on?'owned':'unowned'}"><input type="checkbox" ${on?'checked':''} onchange="fh5Toggle('${id}')"><span class="fh5Tick">✓</span><span class="fh5CarCopy"><strong>${esc(c.full)}</strong><small>${esc(c.year||'Year unknown')} • ${esc(c.classType||'Class unknown')}</small></span></label>`}).join('')}</div></section></div>`
}

const otgGarageBeforeFH568=rhRenderGarage;
rhRenderGarage=function(){const s=rhSpace();if(s&&s.catalogueKey===FH5_SPACE_KEY)return fh5RenderCatalogue();return otgGarageBeforeFH568()};
const otgManageSpacesBeforeFH568=window.rhManageSpaces;
if(otgManageSpacesBeforeFH568)window.rhManageSpaces=function(){const r=otgManageSpacesBeforeFH568.apply(this,arguments);const host=document.querySelector('.rhSpacesPanel,.rhContent');if(host&&!document.getElementById('fh5PackButton'))host.insertAdjacentHTML('beforeend',`<section class="rhSection fh5Pack"><h2>FH5 CATALOGUE SPACE</h2><p>Upgrades your existing Forza 5 Space with the 902-car catalogue. Other OTG! Spaces are not changed.</p><button id="fh5PackButton" class="btn rhPrimaryWide" onclick="fh5EnsureSpace(true,true);show('garage')">${fh5Space()?'OPEN FORZA 5 SPACE':'CREATE FORZA HORIZON 5 SPACE'}</button></section>`);return r};
window.addEventListener('load',()=>{setTimeout(()=>{const existing=fh5FindExistingSpace();if(existing)fh5EnsureSpace(false,false)},100)});
