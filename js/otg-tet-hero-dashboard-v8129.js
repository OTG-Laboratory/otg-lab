/* OTG! 8.0.129 — TET official private artwork and clean sponsor logo launcher.
 * PRESENTATION ONLY: no Space, Garage, R1 draw, entry, results or settings mutations.
 */
(()=>{
 'use strict';
 const HERO='assets/tournaments/dave-steve-penguin-evil-hero-v8129.png?v=8129';
 const LOGO='assets/tournaments/dave-steve-friendly-logo-v8129.png?v=8129';
 function decorateTile(){
  const tile=document.querySelector('#home .v7DashTile.evil8097');
  if(!tile||tile.querySelector(':scope > img.tetSponsorLogo8129'))return;
  // Preserve the button, its click handler and keyboard semantics: only visual children change.
  tile.classList.add('tetLogoLauncher8129');
  tile.setAttribute('aria-label','Open The Evil Tournament, sponsored by Dave and Steves Lubrication Fluids');
  tile.innerHTML='<img class="tetSponsorLogo8129" src="'+LOGO+'" alt="The Evil Tournament sponsor — Dave and Steves Lubrication Fluids, penguin racing logo" decoding="async">';
 }
 function decorateHero(){
  const root=document.getElementById('evilcampaign');
  if(!root?.querySelector('main.rhEvilR1Body8097 .rhEvilR1Stats8097'))return;
  const header=root.querySelector('header.rhEvilR1Hero8097.otgTournamentHero8124');
  if(!header)return; // Never overwrite individual slot or Hubbs detail headers.
  header.classList.add('tetPenguinHero8129');
  const image=header.querySelector('.otgTournamentArt8124 img');
  if(image&&image.getAttribute('src')!==HERO){
   image.setAttribute('src',HERO);
   image.setAttribute('alt','Dave and Steve, two grinning race mechanics, enthusiastically drenching their horrified penguin mascot in track lubricant — official Evil Tournament sponsorship artwork');
   image.setAttribute('loading','eager');
  }
  const subhead=header.querySelector('.otgTournamentCopy8124 > small');
  if(subhead&&subhead.textContent!=='THE OFFICIAL 1,219-SLOT RACING MARATHON')subhead.textContent='THE OFFICIAL 1,219-SLOT RACING MARATHON';
  const sponsor=header.querySelector('.otgTournamentSponsorPlate8124 > strong');
  if(sponsor&&!sponsor.classList.contains('tetTwoLineSponsor8129')){
   sponsor.classList.add('tetTwoLineSponsor8129');
   sponsor.innerHTML='<span>DAVE AND STEVES</span><span>LUBRICATION FLUIDS</span>';
  }
  const info=header.querySelector('.otgTournamentCopy8124 > p');
  const correct='1,219 SLOTS  •  FIVE SWISS CUPS  •  ABSOLUTELY NO MERCY';
  if(info&&info.textContent.replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim()!==correct)
   info.textContent=correct;
 }
 function refresh(){decorateTile();decorateHero();}
 function wrap(name){
  const original=window[name];
  if(typeof original!=='function'||original._tet129)return;
  function wrapped(){const output=original.apply(this,arguments);refresh();return output;}
  wrapped._tet129=true;window[name]=wrapped;
 }
 wrap('rhRenderHome');wrap('rhOpenEvilCampaignR18098');wrap('rhRenderEvilCampaignR18098');
 function watch(id){
  const node=document.getElementById(id);if(!node||typeof MutationObserver==='undefined')return;
  let pending=false;
  new MutationObserver(()=>{
   if(pending)return;pending=true;
   queueMicrotask(()=>{pending=false;refresh()});
  }).observe(node,{childList:true,subtree:true});
 }
 function init(){watch('home');watch('evilcampaign');refresh();}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.rhRefreshTETArtwork8129=refresh;
})();
