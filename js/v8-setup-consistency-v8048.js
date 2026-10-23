/* OTG! v8.0.48 — Race Setup context fix + exact FH5 Hypercar catalogue repair. */
(()=>{
'use strict';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function currentSetup(){try{return (typeof rhSetup!=='undefined'&&rhSetup)?rhSetup:null}catch(_){return null}}
function close(){document.getElementById('rhSaveSetupName8046')?.remove()}
window.rhCloseSaveSetupName8046=close;
window.rhCommitSaveSetupName8046=function(){const input=document.getElementById('rhSaveSetupNameInput8046'),name=String(input?.value||'').trim();if(!name)return toast('Enter a setup name');const x=currentSetup();if(!x||!Array.isArray(x.rounds)||!x.rounds.length)return close();const s=typeof rhSpace==='function'?rhSpace():null;if(!s)return close();s.raceSetups=Array.isArray(s.raceSetups)?s.raceSetups:[];s.raceSetups.push({id:'setup-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name,rounds:x.rounds.map(r=>({name:r.name||''})),updatedAt:new Date().toISOString()});rhSave();close();toast('Race setup saved')};
window.rhSaveCurrentSetupV7=function(){const x=currentSetup();if(!x)return toast('No Championship setup open');if(!Array.isArray(x.rounds)||!x.rounds.length)return toast('Add at least one round first');close();const d=document.createElement('div');d.id='rhSaveSetupName8046';d.className='v7SetupChooser';d.innerHTML=`<div class="v7SetupChooserShade" onclick="rhCloseSaveSetupName8046()"></div><section class="v7SetupChooserPanel rhSaveSetupNamePanel8046" role="dialog" aria-modal="true"><div class="v7SetupChooserHead"><div><b>SAVE RACE SETUP</b><small>Name this reusable configuration</small></div><button type="button" onclick="rhCloseSaveSetupName8046()" aria-label="Close">×</button></div><label class="rhSaveSetupNameLabel8046">SETUP NAME<input id="rhSaveSetupNameInput8046" value="${esc(x.name?x.name+' Setup':'My Race Setup')}" autocomplete="off"></label><button class="v7SetupChooserCancel rhSaveSetupConfirm8046" type="button" onclick="rhCommitSaveSetupName8046()">SAVE RACE SETUP</button><button class="v7SetupChooserCancel" type="button" onclick="rhCloseSaveSetupName8046()">CANCEL</button></section>`;document.body.appendChild(d);setTimeout(()=>{const i=document.getElementById('rhSaveSetupNameInput8046');i?.focus();i?.select()},40)};

function repairFh5HypercarLabels8048(){
 const targets=[['Aston Martin','Valkyrie','2023'],['Pagani','Huayra BC','2016'],['Hennessey','Venom F5','2021']];
 let changed=false;
 try{
  if(typeof FH5_CATALOGUE!=='undefined')for(const c of FH5_CATALOGUE){if(targets.some(t=>c.make===t[0]&&c.model===t[1]&&String(c.year)===t[2])&&c.classType!=='Hypercar'){c.classType='Hypercar';changed=true}}
  if(typeof state!=='undefined'&&state?.spaces)for(const s of state.spaces){if(s?.catalogueKey!=='fh5-catalogue-v1')continue;for(const c of s.cars||[]){const make=c.make||c.manufacturer||'',model=c.model||'',year=String(c.year||'');if(targets.some(t=>make===t[0]&&model===t[1]&&year===t[2])&&c.classType!=='Hypercar'){c.classType='Hypercar';changed=true}}}
  if(changed&&typeof rhSave==='function')rhSave();
 }catch(e){console.warn('FH5 Hypercar label repair skipped',e)}
}
repairFh5HypercarLabels8048();
})();
