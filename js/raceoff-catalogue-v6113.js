/* OTG! v6.0.113 — Race Off Stage 2 catalogue/menu mirror of Festival */
(()=>{
'use strict';
function roEsc(v){return typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));}
function roTrophy(type){
  try{return rhTrophy(type==='make'?'manufacturer':type==='era'?'era':type==='favourite'?'favourite':type==='classType'?'festival':type==='vintage'||type==='classic'?'era':'festival')}catch(_){return 'assets/final/trophy-festival.png'}
}
function roCard(type,value,name,count){
  const safeType=roEsc(type),safeValue=roEsc(value).replace(/'/g,'&#39;'),safeName=roEsc(name).replace(/'/g,'&#39;');
  return `<button class="rhChampCard rhRaceOffLaunchCard" data-ro-type="${safeType}" data-ro-value="${safeValue}" data-ro-name="${safeName}" data-ro-count="${Number(count)||0}"><img src="${roTrophy(type)}" alt=""><span><b>${roEsc(name)}</b><small>${count} eligible car${count===1?'':'s'}</small></span><em>›</em></button>`;
}
window.rhRaceOffCataloguePick=function(type,value,name,count){
  window.rhRaceOffPendingCatalogue={type,value,name,count};
  toast('Race Off setup arrives in the next checkpoint');
};
window.rhRenderRaceOff=function(){
  const el=document.getElementById('raceoff'); if(!el)return;
  try{window.rhReconcileFestivalGarageRefs?.();}catch(_){ }
  const s=rhSpace(),makes=rhMakeList(),eras=rhEraList(),classTypes=rhClassTypeList(),vintageCount=rhVintageCount(),classicCount=rhClassicCount(),fav=s.favouriteManufacturer;
  el.innerHTML=`<div class="rhFestivalV1 rhRaceOffV1">
    <section class="rhFestivalHeroV1 rhRaceOffHeroV1">
      <div class="rhFestivalHeadV1">
        <button class="rhFestivalBackV1" onclick="show('home')" aria-label="Back">‹</button>
        <div><h1>RACE OFF</h1><p>Knockout Racing</p></div>
      </div>
    </section>
    <main class="rhFestivalBodyV1">
      <section class="rhFestivalSectionV1">
        <h2>OTG! RACE OFFS</h2>
        ${roCard('festival','all','Festival Race Off',s.cars.length)}
      </section>

      <section class="rhFestivalSectionV1 rhFestivalFavouriteV1 rhRaceOffFavouriteV1">
        <h2>FAVOURITE MANUFACTURER RACE OFF</h2>
        ${fav&&rhEligible('favourite',fav).length>=RH_CHAMP_MIN_ELIGIBLE?roCard('favourite',fav,`${fav} Race Off`,rhEligible('favourite',fav).length):`
          <div class="rhFavouriteUnset">
            <p>${fav?`Add at least ${RH_CHAMP_MIN_ELIGIBLE} ${roEsc(fav)} cars to unlock its Race Off.`:'Choose a Favourite Manufacturer in Settings to unlock its Race Off.'}</p>
            ${fav?'':`<button class="btn secondary" onclick="rhMoreMode='settings';show('more')">SET FAVOURITE MANUFACTURER</button>`}
          </div>`}
      </section>

      <details class="rhFestivalSectionV1 rhFestivalDetailsV1 rhFestivalHeritageV6">
        <summary>VINTAGE & CLASSIC RACE OFFS <span>${(vintageCount>=RH_CHAMP_MIN_ELIGIBLE?1:0)+(classicCount>=RH_CHAMP_MIN_ELIGIBLE?1:0)}</span></summary>
        <div class="rhFestivalExpandedV1">
          <div class="rhFestivalDetailIntroV1"><i aria-hidden="true">◆</i><span>Year-based Race Offs generated automatically from the Year details in your Garage.</span><b>VINTAGE ≤1949 • CLASSIC 1950–1990</b></div>
          ${vintageCount>=RH_CHAMP_MIN_ELIGIBLE?roCard('vintage','vintage','Vintage Race Off',vintageCount):''}
          ${classicCount>=RH_CHAMP_MIN_ELIGIBLE?roCard('classic','classic','Classic Race Off',classicCount):''}
          ${vintageCount<RH_CHAMP_MIN_ELIGIBLE&&classicCount<RH_CHAMP_MIN_ELIGIBLE?'<p class="small">At least 2 eligible cars are required to unlock Vintage or Classic Race Offs.</p>':''}
        </div>
      </details>

      <details class="rhFestivalSectionV1 rhFestivalDetailsV1">
        <summary>ERA RACE OFFS <span>${eras.length}</span></summary>
        <div class="rhFestivalDetailIntroV1"><i aria-hidden="true">◴</i><span>View available Race Offs by Era.</span><b>${eras.length} ERA${eras.length===1?'':'S'} AVAILABLE</b></div>
        <div class="rhFestivalExpandedV1">
          ${eras.map(e=>roCard('era',e,`${e}s Race Off`,rhEligible('era',e).length)).join('')||'<p class="small">Add cars with years to unlock Era Race Offs.</p>'}
        </div>
      </details>

      <details class="rhFestivalSectionV1 rhFestivalDetailsV1 rhFestivalClassTypeV6">
        <summary>CLASS / TYPE RACE OFFS <span>${classTypes.length}</span></summary>
        <div class="rhFestivalExpandedV1">
          <input class="rhSearch rhFestivalSearchV1" autocomplete="off" placeholder="Search Class / Type..." oninput="document.querySelectorAll('.rhRaceOffClassType').forEach(x=>x.hidden=!x.dataset.name.includes(this.value.toLowerCase()))">
          <div class="rhFestivalDetailIntroV1"><i aria-hidden="true">◆</i><span>View available Race Offs by the Class/Type details in your Garage.</span><b>${classTypes.length} CLASS / TYPE${classTypes.length===1?'':'S'} AVAILABLE</b></div>
          ${classTypes.map(v=>`<div class="rhRaceOffClassType" data-name="${roEsc(v.toLowerCase())}">${roCard('classType',v,`${v} Race Off`,rhEligible('classType',v).length)}</div>`).join('')||'<p class="small">Add matching Class/Type details to at least 2 cars to unlock Class/Type Race Offs.</p>'}
        </div>
      </details>

      <details class="rhFestivalSectionV1 rhFestivalDetailsV1">
        <summary>MANUFACTURER RACE OFFS <span>${makes.length}</span></summary>
        <div class="rhFestivalExpandedV1">
          <input class="rhSearch rhFestivalSearchV1" autocomplete="off" placeholder="Search manufacturers..." oninput="document.querySelectorAll('.rhRaceOffMake').forEach(x=>x.hidden=!x.dataset.name.includes(this.value.toLowerCase()))">
          <div class="rhFestivalDetailIntroV1"><i aria-hidden="true">▰</i><span>View available Race Offs by Manufacturer.</span><b>${makes.length} MANUFACTURER${makes.length===1?'':'S'} AVAILABLE</b></div>
          ${makes.map(m=>`<div class="rhRaceOffMake" data-name="${roEsc(m.toLowerCase())}">${roCard('make',m,`${m} Race Off`,rhEligible('make',m).length)}</div>`).join('')}
        </div>
      </details>

      <div class="rhFestivalInfoV1">
        <i aria-hidden="true">i</i>
        <p>Race Offs are generated from the cars in your Garage.<br>Vintage, Classic, Eras, Class/Types and Manufacturers require at least 2 eligible cars. UNKNOWN/missing details are ignored.<br>Use Expand to view available Race Offs.</p>
      </div>
    </main>
  </div>`;
};
const previousRender=window.rhRender;
window.rhRender=function(screen){if(screen==='raceoff')return window.rhRenderRaceOff();return previousRender(screen);};
})();
