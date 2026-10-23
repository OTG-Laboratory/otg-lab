/* OTG! v6.0.94 — Grand Tour final fixes: GT-12 remainder, GT-15, GT-16. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const safe=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function manufacturerMaster(){
 const map=new Map(), add=v=>{v=String(v||'').trim();if(v&&!map.has(v.toLocaleLowerCase()))map.set(v.toLocaleLowerCase(),v)};
 try{(window.state?.spaces||[]).forEach(sp=>(sp.cars||[]).forEach(c=>add(c.make)));}catch(_){}
 return [...map.values()].sort((a,b)=>a.localeCompare(b));
}
function renderMakes(){
 const input=$('rhCarMake'),box=$('rhMakeSuggestions');if(!input||!box)return;
 const q=input.value.trim(), key=q.toLocaleLowerCase();
 const matches=manufacturerMaster().filter(v=>!key||v.toLocaleLowerCase().includes(key)).slice(0,8);
 const exact=matches.some(v=>v.toLocaleLowerCase()===key);
 const rows=matches.map(v=>`<button type="button" onpointerdown="event.preventDefault();rhGT94ChooseManufacturer(decodeURIComponent('${encodeURIComponent(v)}'))"><span>${safe(v)}</span><small>MANUFACTURER</small></button>`);
 if(q&&!exact)rows.push(`<button type="button" onpointerdown="event.preventDefault();rhGT94ChooseManufacturer(decodeURIComponent('${encodeURIComponent(q)}'))"><span>${safe(q)}</span><small>ADD</small></button>`);
 box.innerHTML=rows.join('');box.hidden=!rows.length;
}
window.rhGT94ChooseManufacturer=function(v){const i=$('rhCarMake'),b=$('rhMakeSuggestions');if(i)i.value=v;if(b)b.hidden=true;i?.focus()};
window.rhGT94BindManufacturer=function(){const i=$('rhCarMake'),b=$('rhMakeSuggestions');if(!i||!b||i.dataset.gt94)return;i.dataset.gt94='1';i.addEventListener('focus',renderMakes);i.addEventListener('input',renderMakes);i.addEventListener('keydown',e=>{if(e.key==='Escape')b.hidden=true});i.addEventListener('blur',()=>setTimeout(()=>{b.hidden=true},140));};

// GT-15: when a newer worker takes control, reload once into the new build.
let updateReloadArmed=false;
if('serviceWorker' in navigator){navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!updateReloadArmed)return;updateReloadArmed=false;location.reload()})}
const prior=window.rhCheckForUpdate;
window.rhCheckForUpdate=async function(){
 const current=document.querySelector('meta[name="racehub-version"]')?.content||'6.0.94', b=$('rhCheckUpdateButton'),status=$('rhUpdateStatus');
 if(b)b.disabled=true; const set=t=>{if(status)status.textContent=t};
 try{
  set(`Installed version: ${current} • Checking latest version…`);
  const res=await fetch(`./index.html?otg=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'}});if(!res.ok)throw 0;
  const html=await res.text(),remote=html.match(/name=["']racehub-version["']\s+content=["']([^"']+)/i)?.[1];if(!remote)throw 0;
  const nums=v=>String(v).split('.').map(x=>parseInt(x,10)||0),a=nums(remote),c=nums(current);let newer=false;
  for(let i=0;i<Math.max(a.length,c.length);i++){if((a[i]||0)!==(c[i]||0)){newer=(a[i]||0)>(c[i]||0);break}}
  if(!newer){set(`Installed version: ${current} • Latest version: ${remote} — up to date.`);return}
  set(`Installed version: ${current} • Latest version: ${remote} — installing…`);updateReloadArmed=true;
  let reg=await navigator.serviceWorker.getRegistration();if(!reg)throw 0;await reg.update();
  const activate=()=>{if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});else if(reg.installing)reg.installing.addEventListener('statechange',()=>{if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'})})};
  activate();
  set(`Installed version: ${current} • Latest version: ${remote} — installing now…`);
  setTimeout(()=>{if(updateReloadArmed)location.reload()},2500);
 }catch(_){updateReloadArmed=false;set(`Installed version: ${current} • Latest version unavailable. Try again later.`)}finally{if(b)b.disabled=false}
};
window.RACEHUB_VERSION='6.0.94';
})();
