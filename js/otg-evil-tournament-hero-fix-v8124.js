/* OTG! 8.0.124 — PRESENTATION-ONLY title sponsor QA.
 * Read-only renderer: never writes to localStorage, Spaces, Garage,
 * result data, campaign slot IDs, championships, Swiss data or medals.
 */
(()=>{
'use strict';
const NAME='THE EVIL TOURNAMENT';
const SPONSOR='DAVE AND STEVES LUBRICATION FLUIDS';
const HERO='assets/tournaments/evil-tournament-hero-v8124.svg?v=8124';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function tile(){
 const t=document.querySelector('#home .v7DashTile.evil8097');
 if(!t) return;
 const name=t.querySelector(':scope > span > b');
 if(!name)return;
 t.classList.add('otgTournamentTile8124');
 name.textContent=NAME;
 let sponsor=t.querySelector(':scope > span > .otgTileSponsor8123');
 if(!sponsor){sponsor=document.createElement('small');sponsor.className='otgTileSponsor8123';name.insertAdjacentElement('afterend',sponsor);}
 if(!sponsor.classList.contains('otgTournamentTileSponsor8124')){
   sponsor.classList.add('otgTournamentTileSponsor8124');
   sponsor.innerHTML='<span>SPONSORED BY</span><strong>DAVE AND STEVES<br>LUBRICATION FLUIDS</strong>';
 }
 t.setAttribute('aria-label',`${NAME}. Sponsored by ${SPONSOR}. ${t.innerText.replace(/\s+/g,' ').trim()}`);
}
function hero(){
 const h=document.getElementById('evilcampaign');if(!h)return;
 const main=h.querySelector('main.rhEvilR1Body8097');
 const stats=main?.querySelector('.rhEvilR1Stats8097');
 // Stats uniquely identify the main Tournament landing screen. Do not change slot/detail headers.
 if(!stats)return;
 const header=h.querySelector('header.rhEvilR1Hero8097:not(.slot)');
 if(!header||header.classList.contains('otgTournamentHero8124'))return;
 header.classList.add('otgTournamentHero8124');
 header.innerHTML=`<div class="otgTournamentArt8124"><img src="${HERO}" alt="Night racing scene with a cyan and crimson-lit car and chequered flags" decoding="async"><span class="otgTournamentArtLabel8124">OTG! PRESENTS • FH5</span></div><div class="otgTournamentCopy8124"><small>THE OFFICIAL 1,212-SLOT RACING MARATHON</small><h1><span>THE EVIL</span><em>TOURNAMENT</em></h1><div class="otgTournamentSponsorPlate8124"><span>OFFICIAL TITLE SPONSOR</span><strong>${esc(SPONSOR)}</strong></div><p>1,212 SLOTS &nbsp;•&nbsp; FIVE SWISS CUPS &nbsp;•&nbsp; ABSOLUTELY NO MERCY</p><div class="otgTournamentOath8124">YOUR HARDEST OPPONENT IS YOU.</div></div>`;
}
function decorate(){tile();hero();}
function wrap(name,after){
 const orig=window[name];if(typeof orig!=='function'||orig._otgWrapped8124)return;
 function decorated(){const out=orig.apply(this,arguments);after();return out;}
 decorated._otgWrapped8124=true;
 window[name]=decorated;
}
wrap('rhRenderHome',tile);
wrap('rhOpenEvilCampaignR18098',hero);
wrap('rhRenderEvilCampaignR18098',hero);
// Some legacy flows call renderMain from their closure, not its public wrapper.
// Watch the campaign container only; no persistent state is touched.
function watch(){
 const h=document.getElementById('evilcampaign');
 if(h&&typeof MutationObserver!=='undefined'){
   let pending=false;
   const observer=new MutationObserver(()=>{
     if(pending)return;pending=true;
     Promise.resolve().then(()=>{pending=false;hero();});
   });
   observer.observe(h,{childList:true,subtree:true});
 }
 decorate();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
window.rhRefreshEvilTournamentHero8124=decorate;
})();
