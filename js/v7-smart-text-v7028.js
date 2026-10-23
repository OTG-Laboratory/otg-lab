/* OTG! v7.0.28 — global smart text-entry pass.
   Text/free-entry fields get phone keyboard prediction/autocorrect support.
   Numeric/time/result fields remain deliberately untouched/disabled. */
(()=>{
 'use strict';
 const numeric = el => {
   const type=(el.getAttribute('type')||'').toLowerCase();
   const mode=(el.getAttribute('inputmode')||'').toLowerCase();
   return ['number','range','date','datetime-local','time','month','week','tel'].includes(type) ||
          ['numeric','decimal'].includes(mode) ||
          el.matches('.rhStopwatch,.rhStopwatchField input,.rhTimeInputsV5781 input,[data-rh-result-time]') ||
          /(?:time|minute|second|millisecond|year|position|lap|racers|count|number)/i.test(`${el.id||''} ${el.name||''}`);
 };
 const textEntry = el => (el.tagName==='TEXTAREA') || ((el.tagName==='INPUT') && !numeric(el) && !['checkbox','radio','button','submit','reset','file','hidden','color'].includes((el.type||'text').toLowerCase()));
 function apply(root=document){
   root.querySelectorAll?.('input,textarea').forEach(el=>{
     if(numeric(el)){
       // Never turn smart text services on for numbers/results.
       return;
     }
     if(!textEntry(el)) return;
     // Search boxes still benefit from keyboard suggestions, but browser form-history
     // popups remain off so they do not fight OTG!'s own suggestion panels.
     el.setAttribute('autocorrect','on');
     el.setAttribute('spellcheck','true');
     el.setAttribute('autocapitalize', el.getAttribute('autocapitalize') || 'sentences');
     el.setAttribute('inputmode','text');
     if(!el.hasAttribute('enterkeyhint')) el.setAttribute('enterkeyhint','done');
   });
 }
 function boot(){
   apply();
   new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1){if(n.matches?.('input,textarea')) apply(n.parentElement||document); else apply(n);}}))).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
 window.rhApplySmartTextV7028=apply;
})();
