/* OTG! v8.0.39 — app-wide single-result Smart Bar for genuine text-entry fields. */
(()=>{
'use strict';
const EXCLUDE_TYPES=new Set(['number','range','date','datetime-local','time','month','week','tel','checkbox','radio','button','submit','reset','file','hidden','color']);
const norm=v=>String(v??'').trim();
const low=v=>norm(v).toLowerCase();
const uniq=a=>[...new Set(a.map(norm).filter(Boolean))];
function numeric(el){const t=low(el.getAttribute('type')||'text'),m=low(el.getAttribute('inputmode'));return EXCLUDE_TYPES.has(t)||['numeric','decimal'].includes(m)||el.matches('.rhStopwatchField input,.rhTimeInputsV5781 input,[data-rh-result-time]')||/(?:time|minute|second|millisecond|year|position|lap|racers|count|number|points?)/i.test(`${el.id||''} ${el.name||''}`)}
function realText(el){if(!el||el.tagName!=='INPUT'||numeric(el))return false;const p=low(el.placeholder),id=low(el.id),aria=low(el.getAttribute('aria-label'));if(/search|filter|find/.test(`${p} ${id} ${aria}`))return false;return !EXCLUDE_TYPES.has(low(el.type||'text'))}
function fieldKind(el){const s=low(`${el.id} ${el.name} ${el.placeholder} ${el.getAttribute('aria-label')||''} ${el.closest('label')?.textContent||''}`);if(/manufacturer|\bmake\b/.test(s))return'make';if(/model|vehicle name|car name/.test(s))return'model';if(/class|type|category/.test(s))return'classType';if(/layout/.test(s))return'layout';if(/track|race name|round/.test(s)||el.closest('.rhRound,.rhSetupRoundV1,.v7PmdRound,.rhEventRoundFinal'))return'track';if(/championship|event name|setup name|league name/.test(s))return'name';return'generic'}
function corpora(){const out={make:[],model:[],classType:[],track:[],layout:[],name:[],generic:[]};let root=null;try{root=window.rhSpace?.()}catch{};if(!root)try{root=JSON.parse(localStorage.getItem('racehub')||'null')}catch{}
 const seen=new WeakSet();function walk(x){if(!x||typeof x!=='object'||seen.has(x))return;seen.add(x);if(Array.isArray(x)){x.forEach(walk);return}
  if(norm(x.make))out.make.push(x.make);if(norm(x.manufacturer))out.make.push(x.manufacturer);if(norm(x.model))out.model.push(x.model);if(norm(x.classType))out.classType.push(x.classType);if(norm(x.layout))out.layout.push(x.layout);if(norm(x.trackName))out.track.push(x.trackName);
  if(norm(x.name)){if(Object.prototype.hasOwnProperty.call(x,'layout')||Object.prototype.hasOwnProperty.call(x,'trackName'))out.track.push(x.name);else if(x.rounds||x.events||x.customGroups||x.customKO||x.type==='championship')out.name.push(x.name)}
  Object.values(x).forEach(walk)}walk(root);
 // Existing visible values are useful too, especially before state has been persisted.
 document.querySelectorAll('input').forEach(i=>{if(!realText(i))return;const v=norm(i.value);if(v)out[fieldKind(i)].push(v)});
 Object.keys(out).forEach(k=>out[k]=uniq(out[k]));return out}
function best(el){const q=low(el.value);if(!q)return'';const c=corpora()[fieldKind(el)]||[];return c.find(v=>low(v)!==q&&low(v).startsWith(q))||c.find(v=>low(v)!==q&&low(v).includes(q))||''}
function hide(el){const box=el._rhGlobalSmartBar;if(box){box.hidden=true;box.innerHTML=''}}
function refresh(el){const box=el._rhGlobalSmartBar;if(!box)return;const hit=best(el);if(!hit)return hide(el);box.innerHTML=`<button type="button" class="rhSmartSuggestionSingle"><span></span></button>`;box.querySelector('span').textContent=hit;box.hidden=false;box.querySelector('button').onpointerdown=e=>{e.preventDefault();el.value=hit;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));hide(el);el.focus()}}
function decorate(el){if(!realText(el)||el.dataset.rhGlobalSmart==='1'||el.closest('.rhSmartSuggestWrap'))return;el.dataset.rhGlobalSmart='1';const wrap=document.createElement('div');wrap.className='rhGlobalSmartWrap';el.parentNode.insertBefore(wrap,el);wrap.appendChild(el);const box=document.createElement('div');box.className='rhSmartSuggestions rhSmartSuggestionsAbove rhGlobalSmartBar';box.hidden=true;wrap.insertBefore(box,el);el._rhGlobalSmartBar=box;el.addEventListener('focus',()=>refresh(el));el.addEventListener('input',()=>refresh(el));el.addEventListener('blur',()=>setTimeout(()=>hide(el),120))}
function apply(root=document){if(root.matches?.('input'))decorate(root);root.querySelectorAll?.('input').forEach(decorate)}
function boot(){apply();new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)}))).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.rhApplyGlobalSmartBarV8039=apply;
})();
