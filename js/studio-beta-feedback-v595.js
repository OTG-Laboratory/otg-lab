/* OTG! v5.9.4 — synchronized beta feedback fixes. */
(()=>{
  'use strict';
  const CURRENT_VERSION=document.querySelector('meta[name="racehub-version"]')?.content||'5.9.18';
  const safe=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* Hall of Fame back arrow: always return to the Records view and keep the Hall screen visible. */
  window.rhBackFromHallOfFame=function(){
    window.rhRecordsMode='records';
    if(typeof window.rhRenderRecords==='function')window.rhRenderRecords();
    if(typeof window.show==='function')window.show('hall');
  };
  function repairHallBack(){
    const hall=document.getElementById('hall');
    if(!hall||window.rhRecordsMode!=='hall')return;
    const button=hall.querySelector('.rhRecordsHeadV1 button');
    if(button){button.onclick=window.rhBackFromHallOfFame;button.setAttribute('onclick','rhBackFromHallOfFame()');}
  }
  const originalRecords=window.rhRenderRecords;
  if(typeof originalRecords==='function')window.rhRenderRecords=function(){const out=originalRecords.apply(this,arguments);repairHallBack();repairHallTile();return out;};

  /* Restore deliberate addition of newly acquired Garage cars to an active Festival Championship. */
  function festivalNewCars(run){
    if(!run||(run.type!=='festival'&&run.championshipType!=='festival'))return [];
    const existing=new Set(Array.isArray(run.entries)?run.entries:[]);
    const space=typeof rhSpace==='function'?rhSpace():null;
    return (space?.cars||[]).filter(car=>!existing.has(car.id));
  }
  window.rhAddNewCarsToFestival=function(id){
    const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>x.id===id);
    if(!run)return;
    const additions=festivalNewCars(run);
    if(!additions.length){if(typeof toast==='function')toast('No new Garage cars to add');return;}
    run.entries=[...(run.entries||[]),...additions.map(car=>car.id)];
    if(typeof rhSave==='function')rhSave();
    if(typeof toast==='function')toast(`${additions.length} new car${additions.length===1?'':'s'} added to Championship`);
    if(typeof rhOpenRun==='function')rhOpenRun(id);
  };
  function addFestivalCarAction(id){
    const run=(typeof rhCurrentRuns==='function'?rhCurrentRuns():[]).find(x=>x.id===id);
    if(!run||run.pickMyDrive||run.value==='pick-my-drive')return;
    const additions=festivalNewCars(run);
    if(!additions.length)return;
    const screen=document.getElementById('festival');
    if(!screen||screen.querySelector('.rhAddFestivalCarsV593'))return;
    const tools=screen.querySelector('.rhChamp33Tools');
    const footer=screen.querySelector('.rhChamp33Footer');
    const anchor=tools||footer;
    if(!anchor)return;
    const label=`ADD ${additions.length} NEW GARAGE CAR${additions.length===1?'':'S'} TO CHAMPIONSHIP`;
    anchor.insertAdjacentHTML(tools?'afterend':'beforebegin',`<button class="rhAddFestivalCarsV593" onclick="rhAddNewCarsToFestival('${safe(id)}')">＋ ${label}</button>`);
  }
  const originalOpenRun=window.rhOpenRun;
  if(typeof originalOpenRun==='function')window.rhOpenRun=function(id){const out=originalOpenRun.apply(this,arguments);addFestivalCarAction(id);return out;};


  /* v5.9.3: make the complete Hall of Fame banner a reliable navigation target. */
  window.rhOpenHallOfFameV593=function(){
    window.rhRecordsMode='hall';
    if(typeof window.rhRenderRecords==='function')window.rhRenderRecords();
    if(typeof window.show==='function')window.show('hall');
  };
  document.addEventListener('click',function(event){
    const tile=event.target.closest?.('.rhHallBannerV1,.rhHallBanner');
    if(!tile)return;
    event.preventDefault();
    event.stopPropagation();
    window.rhOpenHallOfFameV593();
  },true);
  function repairHallTile(){
    document.querySelectorAll('.rhHallBannerV1,.rhHallBanner').forEach(tile=>{
      tile.setAttribute('onclick','rhOpenHallOfFameV593()');
      tile.onclick=window.rhOpenHallOfFameV593;
      tile.style.pointerEvents='auto';
    });
  }

  /* Automatic update notification, sharing the Settings version authority. */
  function compareVersions(a,b){
    const aa=String(a).replace(/^v/i,'').split('.').map(Number),bb=String(b).replace(/^v/i,'').split('.').map(Number);
    for(let i=0;i<Math.max(aa.length,bb.length);i++){const d=(aa[i]||0)-(bb[i]||0);if(d)return d;}
    return 0;
  }
  function closeUpdateNotice(){document.getElementById('rhUpdateAvailableV593')?.remove();sessionStorage.setItem(`rh-update-later-${CURRENT_VERSION}`,'1');}
  window.rhCloseUpdateNoticeV593=closeUpdateNotice;
  window.rhApplyUpdateV593=async function(){
    const button=document.querySelector('#rhUpdateAvailableV593 .rhUpdateNowV593');if(button)button.disabled=true;
    try{
      const registration=await navigator.serviceWorker?.getRegistration();
      if(registration){await registration.update();if(registration.waiting)registration.waiting.postMessage({type:'SKIP_WAITING'});}
    }catch(_){ }
    location.reload();
  };
  function showUpdateNotice(latest){
    if(document.getElementById('rhUpdateAvailableV593'))return;
    document.body.insertAdjacentHTML('beforeend',`<div id="rhUpdateAvailableV593" class="rhUpdateOverlayV593"><section class="rhUpdateModalV593" role="dialog" aria-modal="true" aria-labelledby="rhUpdateTitleV593"><small>NEW VERSION AVAILABLE</small><h2 id="rhUpdateTitleV593">UPDATE TO v${safe(latest)}</h2><p>A newer OTG! build is ready with the latest fixes and improvements.</p><div class="rhUpdateVersionsV593"><span>INSTALLED <b>v${safe(CURRENT_VERSION)}</b></span><span>LATEST <b>v${safe(latest)}</b></span></div><div class="rhUpdateActionsV593"><button onclick="rhCloseUpdateNoticeV593()">LATER</button><button class="rhUpdateNowV593" onclick="rhApplyUpdateV593()">UPDATE NOW</button></div></section></div>`);
  }
  async function checkAutomaticUpdate(){
    if(sessionStorage.getItem(`rh-update-later-${CURRENT_VERSION}`))return;
    try{
      const response=await fetch(`./index.html?automatic-update=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
      if(!response.ok)return;
      const html=await response.text();
      const latest=html.match(/name=["']racehub-version["']\s+content=["']([^"']+)/i)?.[1];
      if(latest&&compareVersions(latest,CURRENT_VERSION)>0)showUpdateNotice(latest);
    }catch(_){ }
  }
  setTimeout(checkAutomaticUpdate,1800);
  setTimeout(()=>{repairHallBack();repairHallTile();},0);
})();

/* v5.9.18 — authoritative version; universal BACK and form-memory controls retained. */
(()=>{
  'use strict';
  const VERSION=document.querySelector('meta[name="racehub-version"]')?.content||'5.9.18';
  let fieldSerial=0;

  function repairAboutVersion(){
    document.querySelectorAll('.rhSettingRow').forEach(row=>{
      const title=row.querySelector('b')?.textContent?.trim();
      if(title!=='ABOUT OUT THE GARAGE!')return;
      const value=row.querySelector('span');
      if(value)value.textContent=`OTG! v${VERSION} • ›`;
    });
  }

  function isTopNavigationBack(control){
    if(!control?.matches?.('button,a'))return false;
    const raw=(control.textContent||'').trim();
    if(control.matches('.rhBack,.rhPostRaceBack,.rhResultBack,.rhRecordsHeadV1>button,.rhStandings34Header>button,.rhStandings33 header button'))return true;
    if(/^[‹〈❮←]$/.test(raw))return true;
    if(control.matches('.rhPageHead button,.rhScene .rhPageHead button,.rhRecordsHeadV1 button') && /back|‹|〈|❮|←/i.test(`${raw} ${control.getAttribute('aria-label')||''}`))return true;
    if(control.tagName==='A' && /^←\s*(events|festival|garage|records|settings|stats|home)$/i.test(raw))return true;
    return false;
  }

  function repairBackControls(root=document){
    const controls=[];
    if(root?.matches?.('button,a'))controls.push(root);
    root?.querySelectorAll?.('button,a').forEach(x=>controls.push(x));
    controls.forEach(control=>{
      if(!isTopNavigationBack(control))return;
      control.classList.remove('rhBackCenteredV593');
      control.classList.add('rhUniversalBackV594');
      control.textContent='BACK';
      control.setAttribute('aria-label','Back');
    });
  }

  function suppressFieldMemory(root=document){
    const fields=[];
    if(root?.matches?.('input,textarea'))fields.push(root);
    root?.querySelectorAll?.('input,textarea').forEach(x=>fields.push(x));
    fields.forEach(field=>{
      if(field.type==='checkbox'||field.type==='radio'||field.type==='range'||field.type==='file'||field.type==='hidden')return;
      field.setAttribute('autocomplete','off');
      field.setAttribute('autocorrect','off');
      field.setAttribute('autocapitalize','off');
      field.setAttribute('spellcheck','false');
      if(!field.name)field.name=`rh-field-v595-${++fieldSerial}`;
    });
  }

  const settings=window.rhRenderSettings;
  if(typeof settings==='function')window.rhRenderSettings=function(){
    const out=settings.apply(this,arguments);
    repairAboutVersion();
    repairBackControls(document.getElementById('more')||document);
    suppressFieldMemory(document.getElementById('more')||document);
    return out;
  };

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        repairAboutVersion();
        repairBackControls(node);
        suppressFieldMemory(node);
      }
    }
  });
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(()=>{repairAboutVersion();repairBackControls();suppressFieldMemory();},0);
})();
