/* OTG! v6.0.24 — Stage 9D polish: Delete League + result-entry spacing only. */
(function(){
  const previousOpen=window.rhOpenLeagueV6018;
  const leagues=()=>{const s=rhSpace();if(!Array.isArray(s.leagues))s.leagues=[];return s.leagues};
  const league=id=>leagues().find(x=>x.id===id);
  const safe=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  window.rhDeleteLeagueConfirmV6024=function(id){
    const l=league(id); if(!l)return;
    const confirmed=(l.events||[]).filter(e=>e.confirmed||e.status==='complete').length;
    if(typeof rhConfirm==='function'){
      rhConfirm({
        title:'DELETE THIS LEAGUE?',
        copy:'This permanently removes this League, its Events, confirmed classifications and standings from the current OTG! Space.',
        detail:`${l.name} • ${l.events?.length||0} Events • ${confirmed} confirmed`,
        safeguard:'This cannot be undone. Your other Leagues and OTG! data are not affected.',
        confirmLabel:'DELETE LEAGUE',danger:true,onConfirm:`rhDeleteLeagueFinalV6024('${id}')`
      });
    }else if(confirm(`Delete ${l.name}? This permanently removes its League history and cannot be undone.`)) rhDeleteLeagueFinalV6024(id);
  };
  window.rhDeleteLeagueFinalV6024=function(id){
    const a=leagues(),i=a.findIndex(x=>x.id===id); if(i<0)return;
    a.splice(i,1); rhSave();
    if(typeof toast==='function')toast('League deleted');
    rhOpenLeagueHubV6018();
  };

  if(typeof previousOpen==='function') window.rhOpenLeagueV6018=function(id){
    previousOpen(id);
    const l=league(id),body=document.querySelector('#events .rhLeagueBodyV6018');
    if(!l||!body||body.querySelector('.rhLeagueDeleteV6024'))return;
    body.insertAdjacentHTML('beforeend',`<section class="rhLeagueDangerV6024"><small>DANGER ZONE</small><button class="rhLeagueDeleteV6024" onclick="rhDeleteLeagueConfirmV6024('${id}')">DELETE LEAGUE</button><p>Permanently removes this League and its saved Event history from this OTG! Space.</p></section>`);
  };
})();
