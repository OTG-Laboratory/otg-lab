/* OTG! v8.0.123 — The Evil Tournament title sponsorship + Hubbs Memorial Trophy.
 * PRESENTATION ONLY. Does not mutate event IDs, 1,212-slot schedule, Space,
 * localStorage, Garage, R1 done map, race records, trophies or backup schema.
 */
(()=>{
  'use strict';
  const CAMPAIGN='THE EVIL TOURNAMENT';
  const SPONSOR='DAVE AND STEVES LUBRICATION FLUIDS';
  const TROPHY='assets/tournaments/hubbs-memorial-trophy-v8123.svg?v=8123';
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function tournamentHeader(){return `<small class="otgTournamentKicker8123">OUT THE GARAGE! • FH5 • THE MAIN EVENT</small><h1><em>THE EVIL</em><span>TOURNAMENT</span></h1><div class="otgTournamentSponsor8123"><svg viewBox="0 0 38 48" aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 3C15 12 4 25 4 32a15 15 0 0 0 30 0C34 25 23 12 19 3Z" fill="#d6416b" stroke="#ffacc1" stroke-width="2"/><path d="M13 26c-4 5-4 12 2 15" stroke="#fce2e8" stroke-width="3" stroke-linecap="round"/><path d="M19 14c-1 6-9 15-9 20" stroke="#ffbed0" stroke-width="1.8" stroke-linecap="round"/></svg><span><small>OFFICIAL TITLE SPONSOR</small>${esc(SPONSOR)}</span></div><p>1,212 SLOTS • FIVE SPECIALIST WORLDS • ONE EVIL TOURNAMENT</p><div class="otgTournamentTagline8123">YOUR HARDEST OPPONENT IS YOU.</div>`;}
  function medalTeaser(){return `<section class="otgHubbsTeaser8123" aria-label="Hubbs Memorial Trophy"><img src="${TROPHY}" alt="Gold and cyan Hubbs Memorial Trophy" loading="lazy"><div><span class="eyebrow">SPECIAL HONOUR • LEGACY LONELY HEARTS</span><h2>HUBBS MEMORIAL TROPHY</h2><p>A proper trophy for the lonely-hearted legends. Forever in the OTG! hall of infamy.</p><button type="button" onclick="rhOpenHubbsMemorial8123()">VIEW THE TROPHY ›</button></div></section>`;}
  function titleTile(){
    const tile=document.querySelector('#home .v7DashTile.evil8097');if(!tile)return;
    const title=tile.querySelector('span>b');if(!title)return;
    title.textContent=CAMPAIGN;
    if(!tile.querySelector('.otgTileSponsor8123'))title.insertAdjacentHTML('afterend',`<small class="otgTileSponsor8123">SPONSORED BY ${esc(SPONSOR)}</small>`);
  }
  function brandCampaign(){
    const h=document.getElementById('evilcampaign');if(!h)return;
    const header=h.querySelector('header.rhEvilR1Hero8097:not(.slot)');
    if(!header||!header.querySelector('h1')||header.querySelector('h1').textContent.trim()!=='EVIL CAMPAIGN')return;
    if(!header.classList.contains('otgTournamentHero8123')){
      header.classList.add('otgTournamentHero8123');header.innerHTML=tournamentHeader();
    }
    const body=h.querySelector('.rhEvilR1Body8097');
    if(!body||body.querySelector('.otgHubbsTeaser8123'))return;
    const anchor=body.querySelector('.rhEvilR1MainNext8101')||body.querySelector('.rhEvilR1Stats8097');
    if(anchor)anchor.insertAdjacentHTML('afterend',medalTeaser());else body.insertAdjacentHTML('afterbegin',medalTeaser());
  }
  function wrap(fn,after){
    const original=window[fn];if(typeof original!=='function')return;
    window[fn]=function(){const result=original.apply(this,arguments);after();return result;};
  }
  function openHubbs(){
    const h=document.getElementById('evilcampaign');if(!h)return;
    if(typeof window.show==='function')window.show('evilcampaign');
    h.innerHTML=`<div class="rhEvilR18097"><button type="button" class="rhEvilR1Back8097" onclick="rhRenderEvilCampaignR18098()"><span>‹</span><b>BACK</b></button><main class="rhEvilR1Body8097"><section class="otgHubbsDetail8123"><small>OUT THE GARAGE! • THE EVIL TOURNAMENT</small><h2>HUBBS MEMORIAL TROPHY</h2><p>Once known as Lonely Hearts. A golden tribute to the overlooked, the single-car manufacturers and the glorious misfits who never got their own crowd.</p><img src="${TROPHY}" alt="The Hubbs Memorial Trophy: golden racing cup with a cyan heart and an engraved commemorative plinth"><p>FOR THE LONELY-HEARTED LEGENDS. ALWAYS PART OF THE STORY.</p><div class="otgHubbsCaution8123"><strong>COMPETITION STATUS</strong><br>The historic Lonely Hearts competition belongs to an earlier Evil playlist. It is not scheduled as a separate competition in the current 1,212-slot Specialist-First R1 campaign. This is the new trophy and name design; no unapproved event, winner, result, medal or campaign slot has been fabricated.</div><button class="otgHubbsBack8123" type="button" onclick="rhRenderEvilCampaignR18098()">‹ RETURN TO THE EVIL TOURNAMENT</button></section></main></div>`;
    try{window.scrollTo(0,0)}catch(_){}
  }
  window.rhOpenHubbsMemorial8123=openHubbs;
  window.rhBrandEvilTournament8123=brandCampaign;
  window.rhEvilTournamentTitle8123=CAMPAIGN;
  wrap('rhRenderHome',titleTile);
  wrap('rhOpenEvilCampaignR18098',brandCampaign);
  wrap('rhRenderEvilCampaignR18098',brandCampaign);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{titleTile();brandCampaign();},{once:true});
  else {titleTile();brandCampaign();}
})();
