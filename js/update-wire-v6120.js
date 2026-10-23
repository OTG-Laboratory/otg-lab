/* OTG! v6.0.120 — robust update discovery + install wiring */
(()=>{
'use strict';
function currentVersion(){return document.querySelector('meta[name="racehub-version"]')?.content||'6.0.120';}
function cmp(a,b){const aa=String(a||'').split('.').map(n=>parseInt(n,10)||0),bb=String(b||'').split('.').map(n=>parseInt(n,10)||0),l=Math.max(aa.length,bb.length);for(let i=0;i<l;i++){const x=aa[i]||0,y=bb[i]||0;if(x>y)return 1;if(x<y)return -1;}return 0;}
async function fetchPublishedIndex(){
  const u=new URL('index.html',document.baseURI);
  u.searchParams.set('otg_update',Date.now().toString());
  const r=await fetch(u.href,{method:'GET',cache:'no-store',credentials:'same-origin',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache','Expires':'0'}});
  if(!r.ok)throw new Error('update check failed '+r.status);
  return r.text();
}
window.rhCheckForUpdate=async function(){
 const CURRENT=currentVersion(),b=document.getElementById('rhCheckUpdateButton'),el=document.getElementById('rhUpdateStatus'),set=t=>{if(el)el.textContent=t};
 if(b)b.disabled=true;
 try{
   set(`Installed version: ${CURRENT} • Checking latest version…`);
   const html=await fetchPublishedIndex();
   const remote=html.match(/name=["']racehub-version["']\s+content=["']([^"']+)/i)?.[1];
   if(!remote)throw new Error('version missing');
   const relation=cmp(remote,CURRENT);
   if(relation<=0){set(`Installed version: ${CURRENT} • Latest version: ${remote} — up to date.`);return;}
   set(`Installed version: ${CURRENT} • Latest version: ${remote} — installing…`);
   const regs=await navigator.serviceWorker?.getRegistrations?.()||[];
   await Promise.all(regs.map(reg=>reg.update().catch(()=>{})));
   for(const reg of regs){if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});}
   set(`Installed version: ${CURRENT} • Latest version: ${remote} — ready to install.`);
 }catch(e){console.warn('OTG update check',e);set(`Installed version: ${CURRENT} • Latest version unavailable. Try again later.`);}finally{if(b)b.disabled=false;}
};
})();
