/* OTG! LAB v0.7 — optional catalogue clean-start proof link (isolated demo only). */
(()=>{'use strict';
if(!['otg-laboratory.github.io','localhost','127.0.0.1'].includes(location.hostname))return;
function ensure(){
 const panel=document.getElementById('otgLabPackPanel05');
 if(!panel){document.getElementById('otgLabOptionalEntry07')?.remove();return;}
 if(document.getElementById('otgLabOptionalEntry07'))return;
 const div=document.createElement('section');div.id='otgLabOptionalEntry07';div.className='rhSection rhSettingPanel';
 div.innerHTML=`<h2>🧪 OPTIONAL CATALOGUE — CLEAN START DEMO</h2>
 <p class="small">Open a separate, empty LAB test screen with <b>no catalogue preloaded</b>. You can choose to download FH5 yourself. Its demo-only storage is isolated from your FH5 LAB TEST Space, Garage and results. This is a proof of concept, <b>not yet the public Guide's default setup</b>.</p>
 <a class="rhSettingRow" href="./lab-optional-catalogue-demo-v07.html"><b>OPEN CLEAN-START CATALOGUE DEMO</b><span>Separate test page · no racing data changed ›</span></a>`;
 panel.insertAdjacentElement('afterend',div);
}
const original=window.rhRenderSettings;
if(typeof original==='function')window.rhRenderSettings=function(){const r=original.apply(this,arguments);ensure();return r};
document.addEventListener('click',e=>{if(e.target?.closest?.('[data-tab="more"],#navMore,#more'))setTimeout(ensure,0)},true);
ensure();
})();
