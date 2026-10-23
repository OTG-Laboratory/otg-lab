// OTG! v5.7.77 — Production conformance bootstrap

state=rhLoad();rhSync();if(state&&!state.onboarded){window.rhStartOnboardingIfNeeded?.();}else{show('home');}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker-v5779.js',{updateViaCache:'none'}).catch(()=>{}));}


// OTG! v5.7.79 — native touch-scroll containment.
// Android/PWA can ignore CSS overscroll-behavior during a fast fling. These
// internal list surfaces therefore own the gesture from touchstart to touchend,
// including inertia, so the document cannot inherit the swipe at a boundary.
(()=>{
 const selector=[
  '.rhSetupCarsV1','.rhQueueWindowV1','.rhTimingBoardRows',
  '.rhOnMakeList','.rhGarageListV1','.rhRestoreListV1','.rhBackupListV1',
  '.rhRoundNamePickerList','.rhFrozenEntriesScrollV1','.rhFrozenRoundsScrollV1'
 ].join(',');
 let active=null,lastY=0,lastT=0,velocity=0,inertia=0,moved=false;
 const stopInertia=()=>{if(inertia){cancelAnimationFrame(inertia);inertia=0}};
 const scrollerFor=t=>{
  const el=t instanceof Element?t.closest(selector):null;
  return el&&el.scrollHeight>el.clientHeight+1?el:null;
 };
 document.addEventListener('touchstart',e=>{
  const el=scrollerFor(e.target);if(!el)return;
  stopInertia();active=el;lastY=e.touches[0].clientY;lastT=performance.now();velocity=0;moved=false;
 },{capture:true,passive:true});
 document.addEventListener('touchmove',e=>{
  if(!active||!e.touches.length)return;
  const now=performance.now(),y=e.touches[0].clientY,dy=lastY-y,dt=Math.max(8,now-lastT);
  active.scrollTop+=dy;velocity=dy/dt;lastY=y;lastT=now;moved=moved||Math.abs(dy)>1;
  // Always consume a list gesture, including at the first/last row.
  e.preventDefault();e.stopPropagation();
 },{capture:true,passive:false});
 const finish=()=>{
  if(!active)return;
  const el=active;active=null;
  if(!moved||Math.abs(velocity)<.08)return;
  let v=velocity,last=performance.now();
  const glide=now=>{
   const dt=Math.min(32,now-last);last=now;
   const before=el.scrollTop;el.scrollTop+=v*dt;
   const atEdge=el.scrollTop===before;
   v*=Math.pow(.94,dt/16.67);
   if(!atEdge&&Math.abs(v)>.02)inertia=requestAnimationFrame(glide);else inertia=0;
  };
  inertia=requestAnimationFrame(glide);
 };
 document.addEventListener('touchend',finish,{capture:true,passive:true});
 document.addEventListener('touchcancel',()=>{active=null;stopInertia()},{capture:true,passive:true});
})();
