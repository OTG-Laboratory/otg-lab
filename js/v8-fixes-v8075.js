/* OTG! v8.0.75 — compact Festival/Race Off History nav + Pick My Drive phone round-row fit. */
(()=>{
'use strict';

function compactHistory(rootId){
 const root=document.getElementById(rootId); if(!root)return;
 const tile=root.querySelector('.rhFestivalHeroV1 .rhHistoryHeroTileV8065');
 if(!tile||tile.classList.contains('rhHistoryNavV8075'))return;
 const head=tile.closest('.rhFestivalHeroV1')?.querySelector('.rhFestivalHeadV1');
 if(!head)return;
 const raw=tile.querySelector('em')?.textContent||'0 completed';
 const count=(raw.match(/\d+/)||['0'])[0];
 tile.classList.add('rhHistoryNavV8075');
 head.classList.add('rhHistoryHeadV8075');
 tile.innerHTML=`<span><b>HISTORY</b><em>${count} COMPLETED</em></span><strong aria-hidden="true">›</strong>`;
 head.appendChild(tile);
}
function decorateHistory(){compactHistory('festival');compactHistory('raceoff')}

for(const name of ['rhRenderFestival','rhRenderRaceOff']){
 const base=window[name];
 if(typeof base!=='function')continue;
 window[name]=function(){const out=base.apply(this,arguments);decorateHistory();setTimeout(decorateHistory,0);return out};
}

for(const id of ['festival','raceoff']){
 const host=document.getElementById(id); if(!host)continue;
 new MutationObserver(()=>queueMicrotask(decorateHistory)).observe(host,{childList:true,subtree:true});
}
window.addEventListener('load',()=>setTimeout(decorateHistory,0));
window.rhV8075DecorateHistory=decorateHistory;
})();
