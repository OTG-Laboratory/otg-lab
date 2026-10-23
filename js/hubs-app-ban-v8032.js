/* OTG! v8.0.32 — Hubs is website-only; block any legacy app character artwork. */
(()=>{'use strict';
 const isHubs=img=>{const s=String(img?.getAttribute?.('src')||'').toLowerCase();return /(?:^|\/)(?:hubs(?:-|\.|_)|.*\/hubs)/.test(s)};
 const purge=root=>{if(!root)return;if(root.tagName==='IMG'&&isHubs(root))root.remove();root.querySelectorAll?.('img').forEach(img=>{if(isHubs(img))img.remove()})};
 purge(document);
 new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)purge(n)}))).observe(document.documentElement,{childList:true,subtree:true});
})();