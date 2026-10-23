/* OTG! v6.0.91 — update checker: no restart when already current */
(()=>{
'use strict';

function currentVersion(){
  return document.querySelector('meta[name="racehub-version"]')?.content || '6.0.93';
}
function cmp(a,b){
  const aa=String(a||'').split('.').map(n=>parseInt(n,10)||0);
  const bb=String(b||'').split('.').map(n=>parseInt(n,10)||0);
  const len=Math.max(aa.length,bb.length);
  for(let i=0;i<len;i++){
    const x=aa[i]||0,y=bb[i]||0;
    if(x>y)return 1;
    if(x<y)return -1;
  }
  return 0;
}
window.rhCheckForUpdate=async function(){
  const CURRENT=currentVersion();
  const b=document.getElementById('rhCheckUpdateButton');
  const el=document.getElementById('rhUpdateStatus');
  if(b)b.disabled=true;
  const set=t=>{if(el)el.textContent=t};

  try{
    set(`Installed version: ${CURRENT} • Checking latest version…`);
    const r=await fetch(`./index.html?otg=${Date.now()}`,{
      cache:'no-store',
      headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'}
    });
    if(!r.ok)throw new Error('update check failed');
    const h=await r.text();
    const remote=h.match(/name=["']racehub-version["']\s+content=["']([^"']+)/i)?.[1];
    if(!remote)throw new Error('version missing');

    const relation=cmp(remote,CURRENT);
    if(relation===0){
      set(`Installed version: ${CURRENT} • Latest version: ${remote} — up to date.`);
      return;
    }
    if(relation<0){
      set(`Installed version: ${CURRENT} • Latest published version: ${remote}.`);
      return;
    }

    set(`Installed version: ${CURRENT} • Latest version: ${remote} — update available.`);
    const regs=await navigator.serviceWorker?.getRegistrations?.()||[];
    await Promise.all(regs.map(r=>r.update().catch(()=>{})));
    for(const reg of regs){
      if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
    }
    set(`Installed version: ${CURRENT} • Latest version: ${remote} — ready to install.`);
    // Deliberately do not reload when merely checking. Existing app flow/user action
    // can perform the actual update; the Check button itself is informational.
  }catch(_){
    set(`Installed version: ${CURRENT} • Latest version unavailable. Try again later.`);
  }finally{
    if(b)b.disabled=false;
  }
};
})();