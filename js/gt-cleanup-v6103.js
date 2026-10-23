/* OTG! v6.0.106 — catalogue live-filter root fix; captured-context manufacturer rename repair. */
(()=>{'use strict';
const q=id=>document.getElementById(id), safe=s=>typeof esc==='function'?esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function sp(){try{return typeof rhSpace==='function'?rhSpace():null}catch(_){return null}}
function makes(){const m=new Map(),add=v=>{v=String(v||'').trim();if(v&&!m.has(v.toLowerCase()))m.set(v.toLowerCase(),v)};try{(SEED?.cars||[]).forEach(c=>add(c.make))}catch(_){};try{(state?.spaces||[]).forEach(s=>(s.cars||[]).forEach(c=>add(c.make)))}catch(_){};return [...m.values()].sort((a,b)=>a.localeCompare(b))}
function best(raw){const k=raw.trim().toLowerCase();if(!k)return null;const a=makes();return a.find(x=>x.toLowerCase()===k)||a.find(x=>x.toLowerCase().startsWith(k))||a.find(x=>x.toLowerCase().includes(k))||null}
function renderOne(i,box){const raw=i.value.trim();if(!raw){box.innerHTML='';box.hidden=true;return}const hit=best(raw),v=hit||raw;box.innerHTML=`<button type="button" data-v="${encodeURIComponent(v)}"><span>${safe(v)}</span><small>${hit?'MANUFACTURER':'ADD CUSTOM'}</small></button>`;box.hidden=false;box.querySelector('button').onpointerdown=e=>{e.preventDefault();i.value=decodeURIComponent(e.currentTarget.dataset.v);box.hidden=true;i.focus()}}
function aliasFor(s,make){return (s.catalogueMakeAliases||{})[make]||make}
function catalogueParts(s){const fh=s.catalogueKey==='fh5';return {catalogue:(fh?window.FH5_CATALOGUE:window.GT7_CATALOGUE)||[],idFn:fh?window.fh5CarId:window.gt7CarId,render:fh?window.fh5RenderCatalogue:window.gt7RenderCatalogue}}
function spaceById(id){return (state?.spaces||[]).find(x=>String(x.id)===String(id))||null}
function captureRenameContext(s,oldMake){
 const current=aliasFor(s,oldMake),key=String(s.catalogueKey||'');
 const linked=(s.cars||[]).filter(c=>c&&c.catalogueId&&String(c.catalogueKey||key)===key&&(String(c.make||'')===current||String(c.make||'')===oldMake));
 return {
   spaceId:String(s.id),catalogueKey:key,oldMake:String(oldMake),currentMake:String(current),
   catalogueIds:linked.map(c=>String(c.catalogueId)),carIds:linked.map(c=>String(c.id))
 };
}
function saveRename(ctx,next){
 const activeBefore=String(state?.activeSpaceId||''),s=spaceById(ctx?.spaceId);
 if(!s?.catalogueOwned)return toast('Catalogue Space not found');
 if(activeBefore!==String(ctx.spaceId))return toast('Manufacturer rename cancelled — Space changed');
 if(String(s.catalogueKey||'')!==String(ctx.catalogueKey||''))return toast('Manufacturer rename cancelled — catalogue changed');
 const oldMake=String(ctx.oldMake||''),current=String(ctx.currentMake||aliasFor(s,oldMake));
 next=String(next||'').trim();if(!next||next===current)return;
 const catIds=new Set((ctx.catalogueIds||[]).map(String)),carIds=new Set((ctx.carIds||[]).map(String));
 s.catalogueMakeAliases=s.catalogueMakeAliases||{};
 if(next===oldMake)delete s.catalogueMakeAliases[oldMake];else s.catalogueMakeAliases[oldMake]=next;
 (s.cars||[]).forEach(c=>{
   if(!c)return;const linked=(c.catalogueId&&catIds.has(String(c.catalogueId)))||carIds.has(String(c.id));
   if(linked){c.make=next;if(c.name)c.name=[next,c.model,c.year].filter(Boolean).join(' ')}
 });
 if(s.favouriteManufacturer===current||s.favouriteManufacturer===oldMake)s.favouriteManufacturer=next;
 (s.runs||[]).forEach(r=>{
   if(!r)return;const manufacturerRun=r.type==='make'||r.type==='manufacturer'||r.type==='favourite';
   if(manufacturerRun&&(r.value===current||r.value===oldMake)){
     r.value=next;
     if(r.name===`${current} Championship`||r.name===`${oldMake} Championship`||manufacturerRun)r.name=`${next} Championship`;
   }
 });
 // Keep this transaction pinned to the exact Space captured when the pencil was tapped.
 state.activeSpaceId=ctx.spaceId;state.cars=s.cars;
 try{rhSave()}catch(_){return toast('Manufacturer rename could not be saved')}
 state.activeSpaceId=ctx.spaceId;state.cars=s.cars;
 try{if(typeof rhRenderGarage==='function')rhRenderGarage()}catch(_){}
 state.activeSpaceId=ctx.spaceId;state.cars=s.cars;
 toast(`${current} renamed to ${next}`);
}
window.rhGT103SaveRename=function(encoded){
 let ctx=null;try{ctx=JSON.parse(decodeURIComponent(encoded))}catch(_){return toast('Rename context unavailable')}
 const next=q('rhGT103RenameInput')?.value;
 q('rhGT103Rename')?.remove();q('rhGT101Rename')?.remove();q('rhGT100Rename')?.remove();
 requestAnimationFrame(()=>saveRename(ctx,next));
};
function openRename(oldMake){
 const s=sp();if(!s)return;const ctx=captureRenameContext(s,oldMake),current=ctx.currentMake,encoded=encodeURIComponent(JSON.stringify(ctx));
 q('rhGT103Rename')?.remove();q('rhGT101Rename')?.remove();q('rhGT100Rename')?.remove();
 document.body.insertAdjacentHTML('beforeend',`<div id="rhGT103Rename" class="rhOverlay"><div class="rhModal rhFormModal"><button class="rhModalX" onclick="document.getElementById('rhGT103Rename').remove()">×</button><h2>RENAME MANUFACTURER</h2><p>Rename this manufacturer in the current OTG! Space only. Existing Championship progress stays attached.</p><label>Manufacturer</label><input id="rhGT103RenameInput" class="rhSearch" autocomplete="off" value="${safe(current)}"><div class="rhModalActions"><button class="btn secondary" onclick="document.getElementById('rhGT103Rename').remove()">CANCEL</button><button class="btn" onclick="rhGT103SaveRename('${encoded}')">SAVE</button></div></div></div>`);
 setTimeout(()=>q('rhGT103RenameInput')?.focus(),50)
}
function compactCatalogue(){const s=sp();if(!s?.catalogueOwned)return;
 document.querySelectorAll('.rhCatalogueGarageCar.owned').forEach(row=>{row.querySelector('.rhGT96CatActions')?.remove();row.querySelector('.rhGT97InlineActions')?.remove();if(row.querySelector('.rhGT100InlineActions'))return;const cid=row.dataset.catalogueId,car=(s.cars||[]).find(c=>String(c.catalogueId)===String(cid))||(s.cars||[]).find(c=>String(c.id)===String(s.catalogueOwned[cid]));if(!car)return;const b=row.querySelector('span:last-child > b');if(!b)return;const a=document.createElement('span');a.className='rhGT100InlineActions';a.innerHTML=`<button type="button" class="rhGT100Edit" title="Edit car" aria-label="Edit car">✎</button>${String(car.notes||'').trim()?'<button type="button" class="rhGT100Note" title="View car note" aria-label="View car note">✉</button>':''}`;a.querySelector('.rhGT100Edit').onclick=e=>{e.preventDefault();e.stopPropagation();rhOpenCarEditor(car.id)};a.querySelector('.rhGT100Note')?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();window.rhGT95ViewCarNote?rhGT95ViewCarNote(car.id):rhOpenCarNotesV6012(car.id)});b.appendChild(a)})}
function manufacturerHeaders(){const s=sp();if(!s?.catalogueOwned)return;document.querySelectorAll('.rhCatalogueGarageV84 .rhGarageMakeV1').forEach(sec=>{const old=sec.dataset.make||'',head=sec.querySelector('.rhGarageMakeHeadV1'),b=head?.querySelector(':scope > b');if(!old||!head||!b)return;const alias=aliasFor(s,old);if(b.textContent!==alias)b.textContent=alias;if(!head.querySelector('.rhGT100MakeEdit')){const x=document.createElement('button');x.type='button';x.className='rhGT100MakeEdit';x.title='Rename manufacturer';x.setAttribute('aria-label','Rename manufacturer');x.textContent='✎';x.onclick=e=>{e.preventDefault();e.stopPropagation();openRename(old)};const count=head.querySelector('.rhCatalogueMakeCount');head.insertBefore(x,count||head.querySelector('em'))}})}
function favourite(){const wrap=document.querySelector('.rhFavGT95'),i=q('rhFavMakeGT95'),box=q('rhFavSuggestionsGT95');if(!wrap||!i||!box||wrap.dataset.gt100)return;wrap.dataset.gt100='1';const buttons=[...wrap.querySelectorAll('.rhFavSetGT95')];buttons.slice(1).forEach(x=>x.remove());const b=buttons[0];if(!b)return;const current=String(sp()?.favouriteManufacturer||'');b.textContent=current?'CHANGE FAVOURITE':'SET FAVOURITE';b.disabled=!i.value.trim();i.oninput=()=>{b.disabled=!i.value.trim();renderOne(i,box)};i.onfocus=()=>{if(i.value.trim())renderOne(i,box)};const next=wrap.nextElementSibling;if(next?.tagName==='BUTTON'&&/^(SET|CHANGE) FAVOURITE/.test(next.textContent.trim()))next.remove()}
function cleanCarMake(){const i=q('rhCarMake'),box=q('rhMakeSuggestions');if(!i||!box||i.dataset.gt100)return;const n=i.cloneNode(true);n.dataset.gt100='1';delete n.dataset.gt94;delete n.dataset.gt95;delete n.dataset.gt96;delete n.dataset.gt97;i.replaceWith(n);const s=sp(),isNew=/^Add Car$/i.test(String(n.closest('.rhModal')?.querySelector('h2')?.textContent||'').trim());if(s?.catalogueOwned&&!isNew){n.readOnly=true;n.setAttribute('aria-readonly','true');n.title='Rename catalogue manufacturers from the manufacturer heading';box.innerHTML='';box.hidden=true;if(!n.parentElement.querySelector('.rhGT100MakeHint'))n.insertAdjacentHTML('afterend','<small class="rhGT100MakeHint">Rename this manufacturer from its catalogue heading.</small>')}else{n.addEventListener('input',()=>renderOne(n,box));n.addEventListener('focus',()=>{if(n.value.trim())renderOne(n,box)});n.addEventListener('blur',()=>setTimeout(()=>box.hidden=true,120))}}
function catalogueCopy(){document.querySelectorAll('.rhCatalogueGarageV84 .rhGarageToolsV1 input').forEach(i=>i.placeholder='Search manufacturer and car')}
let queued=false;function polish(){queued=false;compactCatalogue();manufacturerHeaders();favourite();cleanCarMake();catalogueCopy()}
const mo=new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(polish)}});mo.observe(document.body,{subtree:true,childList:true});polish();
window.RACEHUB_VERSION='6.0.109';
})();
