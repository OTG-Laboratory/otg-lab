/* OTG! v7.0.20 — Pick My Drive completion + live-run lock */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc7=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const carLabel=c=>typeof carName==='function'?carName(c):[c.make,c.model,c.year].filter(Boolean).join(' ');
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let pmd=null;
function cars(){return (typeof rhSpace==='function'?rhSpace()?.cars:[])||[]}
function classLabel(c){return String(c.classType||c.class||'').trim()}
function groups(){
 const all=cars(),out=[];
 const make=new Map(),era=new Map(),cls=new Map();
 all.forEach(c=>{
  const m=String(c.make||'').trim(); if(m){if(!make.has(m))make.set(m,[]);make.get(m).push(c)}
  const y=Number(c.year); if(Number.isFinite(y)&&y>0){const e=Math.floor(y/10)*10;if(!era.has(e))era.set(e,[]);era.get(e).push(c)}
  const k=classLabel(c); if(k){if(!cls.has(k))cls.set(k,[]);cls.get(k).push(c)}
 });
 make.forEach((v,k)=>{if(v.length>=4)out.push({kind:'make',label:k.toUpperCase(),title:k,cars:v})});
 era.forEach((v,k)=>{if(v.length>=4)out.push({kind:'era',label:`BACK TO THE '${String(k).slice(2)}s!`,title:`${k}s`,cars:v})});
 cls.forEach((v,k)=>{if(v.length>=4)out.push({kind:'class',label:k.toUpperCase(),title:k,cars:v})});
 const vintage=all.filter(c=>Number(c.year)>0&&Number(c.year)<=1949); if(vintage.length>=4)out.push({kind:'vintage',label:'VINTAGE NIGHT!',title:'Vintage',cars:vintage});
 const classic=all.filter(c=>Number(c.year)>=1950&&Number(c.year)<=1990); if(classic.length>=4)out.push({kind:'classic',label:'CLASSIC THROWBACK!',title:'Classic',cars:classic});
 if(all.length>=2)out.push({kind:'mix',label:'GARAGE WILDCARD!',title:'Garage Mix',cars:all});
 return out;
}
function choose(){
 const gs=groups(); if(!gs.length){toast('Add at least 2 cars to your Garage first');return null}
 const g=gs[Math.floor(Math.random()*gs.length)],max=Math.min(10,g.cars.length),min=Math.min(5,max),n=max<=min?max:min+Math.floor(Math.random()*(max-min+1));
 const picked=shuffle(g.cars).slice(0,n);
 return {theme:g.title,headline:g.label,kind:g.kind,entries:picked.map(c=>c.id),rounds:[]};
}
function pickedCars(){const ids=new Set(pmd?.entries||[]);return cars().filter(c=>ids.has(c.id)).sort((a,b)=>(pmd.entries.indexOf(a.id)-pmd.entries.indexOf(b.id)))}
function cls(c){return classLabel(c)||'—'}
function selectedRows(){return pickedCars().map((c,i)=>`<div class="v7PmdCar"><b>${i+1}</b><span>${esc7(carLabel(c))}</span><small>${esc7(String(c.year||'—'))}</small><em>${esc7(cls(c))}</em></div>`).join('')}
function openPick(){pmd=choose();if(!pmd)return;renderPick()}
function renderPick(){
 show('home');const host=$('home');if(!host||!pmd)return;
 host.innerHTML=`<div class="v7PmdPick"><header><button onclick="rhRenderHome()">‹ BACK</button><img src="assets/brand/otg-approved-painted-mark-v6052.png" alt="OTG!"></header><main><p class="v7PmdKicker">OTG! PICKED...</p><h1>${esc7(pmd.headline)}</h1><h2>${pmd.entries.length} CARS SELECTED</h2><section class="v7PmdCars">${selectedRows()}</section><div class="v7PmdActions"><button onclick="rhPickMyDriveAgainV7()"><b>⇄ CHOOSE AGAIN</b><small>Give me another pick</small></button><button onclick="rhPickMyDriveSetupV7()"><b>🏁 LET’S DRIVE</b><small>Use this pick</small></button></div><section class="v7PmdInfo"><i>i</i><p><b>WHAT HAPPENS NEXT?</b>OTG! picked a theme and these ${pmd.entries.length} cars for you.<br>You choose the race(s) and how many rounds.<br>Then hit START and go racing!</p></section></main></div>`;window.scrollTo(0,0)
}
function roundRow(r,i){return `<div class="v7PmdRound"><b>${i+1}</b><input value="${esc7(r.name||'')}" placeholder="Race / track name" onchange="rhPmdRenameRoundV7(${i},this.value)"><input class="layout" value="${esc7(r.layout||'')}" placeholder="Layout (optional)" onchange="rhPmdRenameLayoutV7(${i},this.value)"><button onclick="rhPmdRemoveRoundV7(${i})">×</button></div>`}
function renderSetup(){
 show('home');const host=$('home');if(!host||!pmd)return;
 host.innerHTML=`<div class="v7PmdSetup"><header><button onclick="rhPickMyDriveBackV7()">‹ BACK</button><div><h1>PICK MY DRIVE SETUP</h1><p>OTG! chooses. You race.</p></div></header><main><section class="v7PmdLocked"><h2>🔒 YOUR CARS (LOCKED)</h2><p>These ${pmd.entries.length} cars were picked by OTG!<br>You can’t change this selection.</p><div class="v7PmdCars">${selectedRows()}</div></section><section class="v7PmdRounds"><div class="head"><div><h2>🏁 ROUNDS</h2><p>Create and order your rounds for this Pick My Drive.</p></div><button onclick="rhPmdAddRoundV7()">＋ ADD ROUND</button></div><div>${pmd.rounds.length?pmd.rounds.map(roundRow).join(''):'<div class="v7PmdNoRounds">NO ROUNDS YET</div>'}</div><button class="v7PmdLoad" onclick="rhPmdLoadSetupV7()">LOAD SAVED RACE SETUP</button></section><section class="v7PmdInfo"><i>i</i><p>All rounds will be raced by the ${pmd.entries.length} cars in the order shown above.<br>Your times across all rounds will be added for the results.</p></section><button class="v7PmdStart" ${pmd.rounds.length?'':'disabled'} onclick="rhPmdStartV7()">🏁 <span><b>START PICK MY DRIVE</b><small>Lock in your setup and go racing!</small></span></button></main></div>`;window.scrollTo(0,0)
}
function setupStore(){const s=typeof rhSpace==='function'?rhSpace():null;return Array.isArray(s?.raceSetups)?s.raceSetups:[]}
function closeChooser(){document.getElementById('v7PmdChooser')?.remove()}
window.rhPmdChooseSavedV7=id=>{const x=setupStore().find(v=>v.id===id);if(!x)return; pmd.rounds=(x.rounds||[]).map(r=>({id:rhId('round'),name:r.name||'',layout:r.layout||''}));closeChooser();renderSetup();toast(`Loaded ${x.name}`)};
window.rhPmdLoadSetupV7=()=>{const a=setupStore();if(!a.length)return toast('No saved Race Setups yet');closeChooser();const d=document.createElement('div');d.id='v7PmdChooser';d.className='v7SetupChooser';d.innerHTML=`<div class="v7SetupChooserShade" onclick="document.getElementById('v7PmdChooser')?.remove()"></div><section class="v7SetupChooserPanel"><div class="v7SetupChooserHead"><div><b>LOAD RACE SETUP</b><small>Choose a saved configuration</small></div><button onclick="document.getElementById('v7PmdChooser')?.remove()">×</button></div><div class="v7SetupChooserList">${a.map(x=>`<button onclick="rhPmdChooseSavedV7('${esc7(x.id)}')"><span><b>${esc7(x.name)}</b><small>${x.rounds.length} ROUND${x.rounds.length===1?'':'S'}</small><em>${x.rounds.map(r=>esc7(r.name)).join(' • ')}</em></span><i>›</i></button>`).join('')}</div><button class="v7SetupChooserCancel" onclick="document.getElementById('v7PmdChooser')?.remove()">CANCEL</button></section>`;document.body.appendChild(d)};
window.rhPickMyDriveComingSoon=openPick;
window.rhPickMyDriveAgainV7=()=>{pmd=choose();if(pmd)renderPick()};
window.rhPickMyDriveSetupV7=()=>{if(!pmd.rounds.length)pmd.rounds=[{id:rhId('round'),name:'Round 1',layout:''}];renderSetup()};
window.rhPickMyDriveBackV7=renderPick;
window.rhPmdAddRoundV7=()=>{pmd.rounds.push({id:rhId('round'),name:`Round ${pmd.rounds.length+1}`,layout:''});renderSetup()};
window.rhPmdRenameRoundV7=(i,v)=>{if(pmd.rounds[i])pmd.rounds[i].name=String(v||'').trim()||`Round ${i+1}`};
window.rhPmdRenameLayoutV7=(i,v)=>{if(pmd.rounds[i])pmd.rounds[i].layout=String(v||'').trim()};
window.rhPmdRemoveRoundV7=i=>{pmd.rounds.splice(i,1);renderSetup()};
window.rhPmdStartV7=()=>{
 if(!pmd||!pmd.entries.length||!pmd.rounds.length)return;
 const s=rhSpace(),run={id:rhId('run'),name:`Pick My Drive — ${pmd.theme}`,type:'festival',championshipType:'festival',value:'pick-my-drive',trophy:'pick-my-drive',pickMyDrive:true,pickMyDriveTheme:pmd.theme,createdAt:new Date().toISOString(),startedAt:new Date().toISOString(),status:'active',entries:[...pmd.entries],rounds:pmd.rounds.map(r=>({id:r.id||rhId('round'),name:r.name||'Round',layout:r.layout||''})),results:[]};
 s.runs.push(run);rhSave();pmd=null;show('festival');rhOpenRun(run.id)
};

const priorComplete=window.rhChampionshipCompleteTransition;
window.rhChampionshipCompleteTransition=function(runId){
 const r=typeof rhCurrentRuns==='function'?rhCurrentRuns().find(x=>x.id===runId):null;
 if(!r?.pickMyDrive)return priorComplete?.(runId);
 const host=document.getElementById('festival'); if(!host)return priorComplete?.(runId);
 if(typeof show==='function')show('festival');
 host.innerHTML=`<div class="rhScene rhChampScene"><div class="rhPageHead"><button class="rhBack" onclick="rhOpenRun('${r.id}')">‹</button><div><h1>PICK MY DRIVE COMPLETE</h1><p>${esc7(r.name)}</p></div></div></div><div class="rhContent"><section class="rhCompletionMilestone rhCompletionMilestoneFinal v7PmdComplete"><img src="assets/final/trophy-pick-my-drive.png" alt="Pick My Drive trophy"><div class="rhCompletionCopyFinal"><small>PICK MY DRIVE CHAMPION</small><h2>${esc7(r.name)}</h2><p>Every OTG!-picked car has completed every round.</p></div><button class="btn rhPrimaryWide" onclick="rhOpenRun('${r.id}')">VIEW FINAL LEADERBOARD</button></section></div>`;
 window.scrollTo(0,0);
};
})();
