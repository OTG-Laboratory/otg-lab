/* OTG! v6.0.93 — Grand Tour GT-09..GT-14 polish only. */
(()=>{'use strict';
function polish(){
 document.querySelectorAll('#more .rhSettingRow').forEach(row=>{const b=row.querySelector('b');if((b?.textContent||'').trim().toUpperCase()==='ABOUT OUT THE GARAGE!')row.classList.add('rhAboutSettingRowV6093')});
}
const mo=new MutationObserver(polish);mo.observe(document.documentElement,{subtree:true,childList:true});polish();
window.RACEHUB_VERSION='6.0.93';
})();
