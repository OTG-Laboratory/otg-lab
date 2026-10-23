/* OTG! v6.0.88 update wire */
(()=>{const CURRENT='6.0.88';window.rhCheckForUpdate=async function(){
 const b=document.getElementById('rhCheckUpdateButton');if(b)b.disabled=true;
 const el=document.getElementById('rhUpdateStatus');
 const set=t=>{if(el)el.textContent=t};
 try{
  const r=await fetch(`./index.html?otg=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache, no-store, max-age=0','Pragma':'no-cache'}});
  const h=await r.text(),m=h.match(/name=["']racehub-version["']\s+content=["']([^"']+)/i),remote=m?.[1];
  if(!remote)throw 0;
  set(`Installed version: ${CURRENT} • Latest version: ${remote}${remote===CURRENT?' — up to date.':' — update available.'}`);
  if(remote!==CURRENT){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(x=>x.update().catch(()=>{})));location.reload(true)}
 }catch(_){set(`Installed version: ${CURRENT} • Latest version unavailable.`)}
 finally{if(b)b.disabled=false}
};})();