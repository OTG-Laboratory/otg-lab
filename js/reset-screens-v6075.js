/* OTG! v6.0.75 — from-scratch reset-screen shell around locked approved artwork. */
(()=>{
  const previousConfirm=window.rhConfirm;
  const safe=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const close=()=>{
    document.getElementById('rhConfirmOverlay')?.remove();
    document.body.classList.remove('rhReset6075Open');
  };
  window.rhCloseReset6075=close;
  window.rhRunReset6075=(code)=>{
    close();
    if(!code)return;
    try{(0,eval)(code)}catch(err){console.error('OTG! reset action failed',err)}
  };
  window.rhConfirm=function(options={}){
    const title=String(options.title||'').trim();
    const destructive=options.severity==='destructive'||options.danger===true;
    const isRacing=/^RESET RACING DATA\?$/i.test(title);
    const isFull=/^FULL RESET OTG!\?$/i.test(title);
    if(!destructive||(!isRacing&&!isFull))return previousConfirm(options);

    const space=typeof rhSpace==='function'?rhSpace():null;
    const catalogueKey=space?.catalogueKey||'';
    /* The locked Full Reset artwork is catalogue-aware. Keep the v6.0.71
       generic-space fallback rather than showing catalogue wording where no
       dedicated catalogue exists. */
    if(isFull && catalogueKey!=='gt7-catalogue-v1' && catalogueKey!=='fh5-catalogue-v1'){
      return previousConfirm(options);
    }

    document.getElementById('rhConfirmOverlay')?.remove();
    document.body.classList.add('rhReset6075Open');
    const full=isFull;
    const image=full?'assets/final/full-reset-otg-v6075.png':'assets/final/reset-racing-data-v6075.png';
    const confirmLabel=options.confirmLabel|| (full?'FULL RESET':'RESET RACING DATA');
    const cancelLabel=options.cancelLabel||'CANCEL';
    document.body.insertAdjacentHTML('beforeend',
      `<div id="rhConfirmOverlay" class="rhReset6075 ${full?'full6075':'racing6075'}" role="dialog" aria-modal="true" aria-label="${safe(title)}">
        <div class="rhReset6075Stage">
          <img class="rhReset6075Art" src="${image}" alt="">
          <button class="rhReset6075Hit rhResetBack6075" type="button" aria-label="Back" onclick="rhCloseReset6075()"></button>
          <button class="rhReset6075Hit rhResetCancel6075" type="button" aria-label="${safe(cancelLabel)}" onclick="rhCloseReset6075()"></button>
          <button class="rhReset6075Hit rhResetConfirm6075" type="button" aria-label="${safe(confirmLabel)}" onclick="rhRunReset6075(${JSON.stringify(String(options.onConfirm||''))})"></button>
        </div>
      </div>`);
    document.getElementById('rhConfirmOverlay').scrollTop=0;
  };
})();
