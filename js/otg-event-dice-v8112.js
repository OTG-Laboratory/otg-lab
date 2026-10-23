/* OTG! v8.0.112 — tiny random-number paint dice for active event pages.
   Pure UI utility. No rhSave(), event edits, or Space schema changes. */
(() => {
  'use strict';
  const KEY = 'otgEventPaintDiceMaximumV8112';
  const LIMIT = 9999;
  const q = (s, root=document) => root.querySelector(s);
  let modal = null;
  let scheduled = false;
  let lastScreen = null;

  function readMaximum() {
    try {
      const n = Number(localStorage.getItem(KEY));
      if (Number.isSafeInteger(n) && n >= 1 && n <= LIMIT) return n;
    } catch (_) {}
    return 10;
  }
  function randomBetweenOneAnd(n) {
    // Uniform inclusive draw. Crypto rejection sampling avoids modulo bias.
    if (n === 1) return 1;
    if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
      const a = new Uint32Array(1);
      const domain = 0x100000000;
      const bound = Math.floor(domain / n) * n;
      let x;
      do { window.crypto.getRandomValues(a); x = a[0]; } while (x >= bound);
      return (x % n) + 1;
    }
    return Math.floor(Math.random() * n) + 1;
  }
  function close() {
    if (!modal) return;
    const former = modal.returnFocus;
    modal.remove();
    modal = null;
    if (former && former.isConnected && !former.closest('.hidden')) former.focus({preventScroll:true});
  }
  function open(trigger) {
    if (modal) { q('#otgDiceMaximum8112', modal)?.focus(); return; }
    const d = document.createElement('div');
    d.className = 'otgDiceBackdrop8112';
    d.innerHTML = `<section class="otgDiceDialog8112" role="dialog" aria-modal="true" aria-labelledby="otgDiceTitle8112">
      <button class="otgDiceClose8112" type="button" aria-label="Close random number generator">×</button>
      <small class="otgDiceEyebrow8112">OTG! QUICK TOOL</small>
      <h2 id="otgDiceTitle8112">🎲 RANDOM NUMBER</h2>
      <div class="otgDiceInputs8112">
        <div><span>MINIMUM</span><strong aria-label="Minimum is always 1">1 🔒</strong></div>
        <label for="otgDiceMaximum8112"><span>MAXIMUM</span><input type="number" inputmode="numeric" min="1" max="${LIMIT}" step="1" id="otgDiceMaximum8112" value="${readMaximum()}" autocomplete="off"></label>
      </div>
      <div class="otgDiceResult8112" aria-live="polite" aria-atomic="true"><small>YOUR NUMBER</small><strong id="otgDiceValue8112">—</strong></div>
      <p class="otgDiceError8112" id="otgDiceError8112" role="alert" hidden></p>
      <button class="otgDiceRoll8112" type="button">🎲 ROLL</button>
      <p class="otgDiceHint8112">From 1 to your maximum, including both. Maximum remembered for next time.</p>
    </section>`;
    d.returnFocus = trigger;
    document.body.appendChild(d);
    modal = d;
    const max = q('#otgDiceMaximum8112', d);
    const roll = q('.otgDiceRoll8112', d);
    const val = q('#otgDiceValue8112', d);
    const err = q('#otgDiceError8112', d);
    const change = () => {
      val.textContent = '—';
      roll.textContent = '🎲 ROLL';
      err.hidden = true;
      err.textContent = '';
    };
    const draw = () => {
      const raw = max.value.trim();
      const n = Number(raw);
      if (!/^\d+$/.test(raw) || !Number.isSafeInteger(n) || n < 1 || n > LIMIT) {
        err.textContent = `Enter a whole-number maximum from 1 to ${LIMIT}.`;
        err.hidden = false;
        max.focus();
        return;
      }
      err.hidden = true;
      val.textContent = String(randomBetweenOneAnd(n));
      roll.textContent = '🎲 ROLL AGAIN';
      try { localStorage.setItem(KEY, String(n)); } catch (_) {}
    };
    max.addEventListener('input', change);
    max.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); draw(); } });
    roll.addEventListener('click', draw);
    q('.otgDiceClose8112', d).addEventListener('click', close);
    d.addEventListener('pointerdown', e => { if (e.target === d) close(); });
    d.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') {
        const els = [...d.querySelectorAll('button, input')].filter(el => !el.disabled);
        const first = els[0], last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    max.focus();
    max.select();
  }
  function target() {
    // Only show on an OPEN racing event, not on the Garage, campaign list,
    // race-off landing, records, setup wizard, or championship selection.
    const ro = q('#raceoff:not(.hidden)');
    if (ro) {
      const scene = q('.rhRaceOffDrawSceneV6118', ro);
      if (scene) return q('.rhFestivalHeadV1', scene);
      const round = q('.rhRaceOffRoundSceneV6122, .rhRaceOffRoundSceneV6119', ro);
      if (round) return q('.rhFestivalHeadV1', round);
    }
    const fest = q('#festival:not(.hidden)');
    if (fest) {
      const active = q('.v8GroupPage .rhOverviewHeroV1', fest);
      if (active && q('.rhCurrentCarV1, .v8StageCard', fest)) return active;
      const current = q('.rhChamp33 .rhChamp34Hero', fest);
      if (current && q('.rhChamp33Current', fest)) return current;
    }
    const ev = q('#event:not(.hidden)');
    if (ev && q('.rhCurrentCarV1, .rhChamp33Current, .rhEventActiveV1, .rhPageHead', ev)) {
      return q('.rhPageHead, .rhOverviewHeroV1, .rhChamp34Hero', ev);
    }
    return null;
  }
  function sync() {
    const t = target();
    const visible = q('main > .screen:not(.hidden)');
    if (modal && (visible !== lastScreen || !t)) close();
    lastScreen = visible;
    if (!t || q('.otgDiceLaunch8112', t)) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'otgDiceLaunch8112';
    b.setAttribute('aria-label', 'Random number for paint colour');
    b.title = 'Random paint number';
    b.textContent = '🎲';
    b.addEventListener('click', () => open(b));
    t.appendChild(b);
  }
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; sync(); });
  });
  const main = q('main');
  if (main) observer.observe(main, {childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  sync();
  window.otgDice8112 = Object.freeze({open:() => open(null),roll:randomBetweenOneAnd,maximum:readMaximum});
})();
