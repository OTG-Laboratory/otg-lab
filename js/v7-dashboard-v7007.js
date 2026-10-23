/* OTG! v7.0.10 — approved compact dashboard for locked v7 dashboard */
(()=>{
  const escV7=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const svg={
    raceoff:'<svg viewBox="0 0 64 64"><path d="M12 14h12v10H12zM12 40h12v10H12zM40 27h12v10H40z"/><path d="M24 19h8v13h8M24 45h8V32"/></svg>',
    custom:'<svg viewBox="0 0 64 64"><rect x="13" y="15" width="38" height="38" rx="5"/><path d="M22 10v10M42 10v10M21 29h8v8h-8zM35 29h8v8h-8zM21 41h8v8h-8zM35 41h8v8h-8z"/></svg>',
    garage:'<svg viewBox="0 0 64 64"><path d="M10 29 32 13l22 16v24H10z"/><path d="M18 51V32h28v19"/><path d="M23 43c0-5 4-9 9-9s9 4 9 9v5H23z"/></svg>',
    setups:'<svg viewBox="0 0 64 64"><rect x="17" y="13" width="30" height="40" rx="4"/><path d="M25 13v-3h14v7H25zM24 26h16M24 34h10M24 42h9"/><circle cx="43" cy="44" r="8"/><path d="M43 40v5l4 2"/></svg>',
    drive:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="21"/><circle cx="32" cy="32" r="5"/><path d="M13 29h38M32 37v15M17 22c8 3 12 8 15 10M47 22c-8 3-12 8-15 10"/></svg>',
    records:'<svg viewBox="0 0 64 64"><path d="M20 12h24v13c0 9-5 16-12 16s-12-7-12-16z"/><path d="M20 17H11v5c0 7 5 11 12 11M44 17h9v5c0 7-5 11-12 11M32 41v8M23 54h18M27 49h10"/></svg>',
    stats:'<svg viewBox="0 0 64 64"><rect x="14" y="36" width="9" height="16" rx="1"/><rect x="28" y="27" width="9" height="25" rx="1"/><rect x="42" y="15" width="9" height="37" rx="1"/></svg>',
    settings:'<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="9"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8M15 15l6 6M43 43l6 6M49 15l-6 6M21 43l-6 6"/><circle cx="32" cy="32" r="18"/></svg>'
  };
  function tile(cls,onclick,icon,title,sub,wide=false){return `<button class="v7DashTile ${cls}${wide?' wide':''}" onclick="${onclick}"><i aria-hidden="true">${icon}</i><span><b>${title}</b><small>${sub}</small></span><em aria-hidden="true">›</em></button>`}
  window.rhPickMyDriveComingSoon=function(){toast('Pick My Drive is next in v7')};
  window.rhRenderHome=function(){
    const s=typeof rhSpace==='function'?rhSpace():{name:'My OTG!'};
    const home=document.getElementById('home'); if(!home)return;
    home.innerHTML=`<div class="v7Dash">
      <section class="v7DashHero">
        <img class="v7DashLogo" src="assets/brand/otg-approved-painted-mark-v6052.png" alt="OTG! — Out The Garage!">
      </section>
      <main class="v7DashBody">
        <div class="v7DashGrid">
          ${tile('festival',"show('festival')",'🏁','FESTIVAL','OTG! Championships',true)}
          ${tile('raceoff',"show('raceoff')",svg.raceoff,'RACE OFF','Knockout Racing')}
          ${tile('custom',"show('events')",svg.custom,'CUSTOM RACING','Create Your Own')}
          ${tile('garage',"show('garage')",svg.garage,'GARAGE','Your Cars')}
          ${tile('setups','rhOpenRaceSetupsV7()',svg.setups,'RACE SETUPS','Saved Configs')}
          ${tile('pick','rhPickMyDriveComingSoon()',svg.drive,'PICK MY DRIVE','Let OTG! Choose')}
          ${tile('records',"rhRecordsMode='records';show('hall')",svg.records,'RECORDS','Results & Hall of Fame')}
          ${tile('stats',"rhMoreMode='stats';show('more')",svg.stats,'STATS','Your Racing Overview')}
          ${tile('settings',"rhMoreMode='settings';show('more')",svg.settings,'SETTINGS','Preferences & Data')}
        </div>
        <div class="v7DashFooter"><span></span><b>OTG!</b><span></span><small>OUT THE GARAGE!</small></div>
      </main>
    </div>`;
  };
  // Bootstrap renders Home before this v7 override is loaded. If Home is already
  // visible, repaint it now with the locked v7 dashboard instead of leaving the
  // legacy markup on screen until the user navigates away and back.
  const liveHome=document.getElementById('home');
  if(liveHome && !liveHome.classList.contains('hidden')) window.rhRenderHome();
})();
