/* OTG! v6.0.102 — manufacturer rename modal completion repair. */
(()=>{'use strict';
const q=id=>document.getElementById(id), safe=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function sp(){try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}}
function makes(){const m=new Map(),add=v=>{v=String(v||'').trim();if(v&&!m.has(v.toLowerCase()))m.set(v.toLowerCase(),v)};try{(SEED?.cars||[]).forEach(c=>add(c.make))}catch(_){};try{(state?.spaces||[]).forEach(s=>(s.cars||[]).forEach(c=>add(c.make)))}catch(_){};return [...m.values()].sort((a,b)=>a.localeCompare(b))}
function best(raw){const k=raw.trim().toLowerCase();if(!k)return null;const a=makes();return a.find(x=>x.toLowerCase()===k)||a.find(x=>x.toLowerCase().startsWith(k))||a.find(x=>x.toLowerCase().includes(k))||null}
function renderOne(i,box){const raw=i.value.trim();if(!raw){box.innerHTML='';box.hidden=true;return}const hit=best(raw),v=hit||raw;box.innerHTML=`<button type="button" data-v="${encodeURIComponent(v)}"><span>${safe(v)}</span><small>${hit?'MANUFACTURER':'ADD CUSTOM'}</small></button>`;box.hidden=false;box.querySelector('button').onpointerdown=e=>{e.preventDefault();i.value=decodeURIComponent(e.currentTarget.dataset.v);box.hidden=true;i.focus()}}
function aliasFor(s,make){return (s.catalogueMakeAliases||{})[make]||make}
function catalogueParts(s){const fh=s.catalogueKey==='fh5';return {catalogue:(fh?window.FH5_CATALOGUE:window.GT7_CATALOGUE)||[],idFn:fh?window.fh5CarId:window.gt7CarId,render:fh?window.fh5RenderCatalogue:window.gt7RenderCatalogue}}
function spaceById(id){return (state?.spaces||[]).find(x=>String(x.id)===String(id))||null}
function catalogueDefinition(s){
 if(!s)return null;
 if(s.catalogueKey==='fh5-catalogue-v1'&&Array.isArray(window.FH5_CATALOGUE)&&typeof window.fh5CarId==='function')return {catalogue:window.FH5_CATALOGUE,idFn:window.fh5CarId};
 if(s.catalogueKey==='gt7-catalogue-v1'&&Array.isArray(window.GT7_CATALOGUE)&&typeof window.gt7CarId==='function')return {catalogue:window.GT7_CATALOGUE,idFn:window.gt7CarId};
 return null;
}
function saveRename(spaceId,oldMake,next){
 const activeBefore=String(state?.activeSpaceId||''),s=spaceById(spaceId);
 if(!s?.catalogueOwned)return toast('Catalogue Space not found');
 if(activeBefore!==String(spaceId))return toast('Manufacturer rename cancelled — Space changed');
 const current=aliasFor(s,oldMake);next=String(next||'').trim();
 if(!next||next===current)return;
 const def=catalogueDefinition(s);if(!def)return toast('Catalogue identity unavailable');
 const ids=new Set(def.catalogue.filter(c=>c.make===oldMake).map(c=>String(def.idFn(c))));
 s.catalogueMakeAliases=s.catalogueMakeAliases||{};
 if(next===oldMake)delete s.catalogueMakeAliases[oldMake];else s.catalogueMakeAliases[oldMake]=next;
 (s.cars||[]).forEach(c=>{if(c.catalogueId&&ids.has(String(c.catalogueId))){c.make=next;if(c.name)c.name=[next,c.model,c.year].filter(Boolean).join(' ')}});
 if(s.favouriteManufacturer===current||s.favouriteManufacturer===oldMake)s.favouriteManufacturer=next;
 (s.runs||[]).forEach(r=>{
   const manufacturerRun=r&&(r.type==='make'||r.type==='manufacturer'||r.type==='favourite');
   if(manufacturerRun&&(r.value===current||r.value===oldMake)){
     r.value=next;
     if(r.name===`${current} Championship`||r.name===`${oldMake} Championship`||r.type==='make'||r.type==='manufacturer'||r.type==='favourite')r.name=`${next} Championship`;
   }
 });
 // Hard space isolation: keep the same active Space before, during and after persistence/render.
 state.activeSpaceId=spaceId;
 try{if(typeof rhSync==='function')rhSync()}catch(_){}
 try{rhSave()}catch(_){}
 state.activeSpaceId=spaceId;
 q('rhGT101Rename')?.remove();q('rhGT100Rename')?.remove();
 try{if(typeof rhRenderGarage==='function')rhRenderGarage()}catch(_){}
 state.activeSpaceId=spaceId;
 try{if(typeof rhSync==='function')rhSync()}catch(_){}
 try{rhSave()}catch(_){}
 toast(`${current} renamed to ${next}`);
}
window.rhGT101SaveRename=function(spaceId,oldMake){
 const sid=decodeURIComponent(spaceId),om=decodeURIComponent(oldMake),input=q('rhGT101RenameInput'),next=input?.value;
 // Close the blocking modal first so success/render feedback can never be trapped behind its blur.
 q('rhGT101Rename')?.remove();q('rhGT100Rename')?.remove();
 requestAnimationFrame(()=>saveRename(sid,om,next));
};
function openRename(oldMake){
 const s=sp();if(!s)return;const spaceId=String(s.id),current=aliasFor(s,oldMake);
 q('rhGT101Rename')?.remove();q('rhGT100Rename')?.remove();
 document.body.insertAdjacentHTML('beforeend',`<div id="rhGT101Rename" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="document.getElementById('rhGT101Rename').remove()">×</button><h2>RENAME MANUFACTURER</h2><p>Rename this manufacturer in the current OTG! Space only. Existing Championship progress stays attached.</p><label>Manufacturer</label><input id="rhGT101RenameInput" class="rhSearch" autocomplete="off" value="${safe(current)}"><div class="rhModalActions"><button class="btn secondary" onclick="document.getElementById('rhGT101Rename').remove()">CANCEL</button><button class="btn" onclick="rhGT101SaveRename('${encodeURIComponent(spaceId)}','${encodeURIComponent(oldMake)}')">SAVE</button></div></div></div>`);
 setTimeout(()=>q('rhGT101RenameInput')?.focus(),50)
}
function compactCatalogue(){const s=sp();if(!s?.catalogueOwned)return;
 document.querySelectorAll('.rhCatalogueGarageCar.owned').forEach(row=>{row.querySelector('.rhGT96CatActions')?.remove();row.querySelector('.rhGT97InlineActions')?.remove();if(row.querySelector('.rhGT100InlineActions'))return;const cid=row.dataset.catalogueId,car=(s.cars||[]).find(c=>String(c.catalogueId)===String(cid))||(s.cars||[]).find(c=>String(c.id)===String(s.catalogueOwned[cid]));if(!car)return;const b=row.querySelector('span:last-child > b');if(!b)return;const a=document.createElement('span');a.className='rhGT100InlineActions';a.innerHTML=`<button type="button" class="rhGT100Edit" title="Edit car" aria-label="Edit car">✎</button>${String(car.notes||'').trim()?'<button type="button" class="rhGT100Note" title="View car note" aria-label="View car note">✉</button>':''}`;a.querySelector('.rhGT100Edit').onclick=e=>{e.preventDefault();e.stopPropagation();rhOpenCarEditor(car.id)};a.querySelector('.rhGT100Note')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.rhGT95ViewCarNote?rhGT95ViewCarNote(car.id):rhOpenCarNotesV6012(car.id)});b.appendChild(a)})}
function manufacturerHeaders(){const s=sp();if(!s?.catalogueOwned)return;document.querySelectorAll('.rhCatalogueGarageV84 .rhGarageMakeV1').forEach(sec=>{const old=sec.dataset.make||'',head=sec.querySelector('.rhGarageMakeHeadV1'),b=head?.querySelector(':scope > b');if(!old||!head||!b)return;const alias=aliasFor(s,old);if(b.textContent!==alias)b.textContent=alias;if(!head.querySelector('.rhGT100MakeEdit')){const x=document.createElement('button');x.type='button';x.className='rhGT100MakeEdit';x.title='Rename manufacturer';x.setAttribute('aria-label','Rename manufacturer');x.textContent='✎';x.onclick=e=>{e.preventDefault();e.stopPropagation();openRename(old)};const count=head.querySelector('.rhCatalogueMakeCount');head.insertBefore(x,count||head.querySelector('em'))}})}
function favourite(){const wrap=document.querySelector('.rhFavGT95'),i=q('rhFavMakeGT95'),box=q('rhFavSuggestionsGT95');if(!wrap||!i||!box||wrap.dataset.gt100)return;wrap.dataset.gt100='1';const buttons=[...wrap.querySelectorAll('.rhFavSetGT95')];buttons.slice(1).forEach(x=>x.remove());const b=buttons[0];if(!b)return;const current=String(sp()?.favouriteManufacturer||'');b.textContent=current?'CHANGE FAVOURITE':'SET FAVOURITE';b.disabled=!i.value.trim();i.oninput=()=>{b.disabled=!i.value.trim();renderOne(i,box)};i.onfocus=()=>{if(i.value.trim())renderOne(i,box)};const next=wrap.nextElementSibling;if(next?.tagName==='BUTTON'&&/^(SET|CHANGE) FAVOURITE/.test(next.textContent.trim()))next.remove()}
function cleanCarMake(){const i=q('rhCarMake'),box=q('rhMakeSuggestions');if(!i||!box||i.dataset.gt100)return;const n=i.cloneNode(true);n.dataset.gt100='1';delete n.dataset.gt94;delete n.dataset.gt95;delete n.dataset.gt96;delete n.dataset.gt97;i.replaceWith(n);const s=sp();if(s?.catalogueOwned){n.readOnly=true;n.setAttribute('aria-readonly','true');n.title='Rename catalogue manufacturers from the manufacturer heading';box.innerHTML='';box.hidden=true;if(!n.parentElement.querySelector('.rhGT100MakeHint'))n.insertAdjacentHTML('afterend','<small class="rhGT100MakeHint">Rename this manufacturer from its catalogue heading.</small>')}else{n.addEventListener('input',()=>renderOne(n,box));n.addEventListener('focus',()=>{if(n.value.trim())renderOne(n,box)});n.addEventListener('blur',()=>setTimeout(()=>box.hidden=true,120))}}
function catalogueCopy(){document.querySelectorAll('.rhCatalogueGarageV84 .rhGarageToolsV1 input').forEach(i=>i.placeholder='Search manufacturer and car')}
let queued=false;function polish(){queued=false;compactCatalogue();manufacturerHeaders();favourite();cleanCarMake();catalogueCopy()}
const mo=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(polish)}});mo.observe(document.body,{subtree:true,childList:true});polish();
window.RACEHUB_VERSION='6.0.102';
})();
