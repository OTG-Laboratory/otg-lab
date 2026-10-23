// OTG! v6.0.139 — SPECIALS persistence + global scroll boundary lock
state=rhLoad();
rhSync();
if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v6139.js',{updateViaCache:'none'}).catch(()=>{}));}

// Prevent Android/PWA rubber-band from dragging the entire OTG! canvas beyond its real bounds.
// Normal scrolling remains native. The guard only consumes a gesture when the active scroll
// surface is already at its top/bottom edge and the finger continues past that edge.
(()=>{
  let lastY=null;
  const scrollable=(node)=>{
    let el=node instanceof Element?node:null;
    while(el&&el!==document.body&&el!==document.documentElement){
      const cs=getComputedStyle(el);
      if(/(auto|scroll)/.test(cs.overflowY)&&el.scrollHeight>el.clientHeight+1)return el;
      el=el.parentElement;
    }
    return document.scrollingElement||document.documentElement;
  };
  document.addEventListener('touchstart',e=>{lastY=e.touches?.[0]?.clientY??null},{capture:true,passive:true});
  document.addEventListener('touchmove',e=>{
    if(lastY==null||!e.touches?.length)return;
    const y=e.touches[0].clientY,dy=y-lastY,el=scrollable(e.target);
    lastY=y;
    const top=el===document.scrollingElement||el===document.documentElement||el===document.body?window.scrollY:el.scrollTop;
    const max=el===document.scrollingElement||el===document.documentElement||el===document.body?
      Math.max(0,document.documentElement.scrollHeight-window.innerHeight):Math.max(0,el.scrollHeight-el.clientHeight);
    if((top<=0&&dy>0)||(top>=max-1&&dy<0))e.preventDefault();
  },{capture:true,passive:false});
  const end=()=>{lastY=null};
  document.addEventListener('touchend',end,{capture:true,passive:true});
  document.addEventListener('touchcancel',end,{capture:true,passive:true});
})();
