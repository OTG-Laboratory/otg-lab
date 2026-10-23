/* OTG! v6.0.78 — from-scratch reset-screen shell around locked approved artwork. */
(()=>{
  const previousConfirm=window.rhConfirm;
  const safe=(value)=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const close=()=>{
    document.getElementById('rhConfirmOverlay')?.remove();
    document.body.classList.remove('rhReset6078Open');
  };
  window.rhCloseReset6078=close;
  window.rhRunReset6078=(code)=>{
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
    document.body.classList.add('rhReset6078Open');
    const full=isFull;
    const image=full?'assets/final/full-reset-otg-v6078.png':'assets/final/reset-racing-data-v6078.png';
    const confirmLabel=options.confirmLabel|| (full?'FULL RESET':'RESET RACING DATA');
    const cancelLabel=options.cancelLabel||'CANCEL';
    document.body.insertAdjacentHTML('beforeend',
      `<div id="rhConfirmOverlay" class="rhReset6078 ${full?'full6078':'racing6078'}" role="dialog" aria-modal="true" aria-label="${safe(title)}">
        <div class="rhReset6078Stage">
          <img class="rhReset6078Art" src="${image}" alt="">
          <button class="rhReset6078Hit rhResetBack6078" type="button" aria-label="Back" onclick="rhCloseReset6078()"></button>
          <button class="rhReset6078Hit rhResetCancel6078" type="button" aria-label="${safe(cancelLabel)}" onclick="rhCloseReset6078()"></button>
          <button class="rhReset6078Hit rhResetConfirm6078" type="button" aria-label="${safe(confirmLabel)}" onclick="rhRunReset6078(${JSON.stringify(String(options.onConfirm||''))})"></button>
        </div>
      </div>`);
    document.getElementById('rhConfirmOverlay').scrollTop=0;
  };
})();
