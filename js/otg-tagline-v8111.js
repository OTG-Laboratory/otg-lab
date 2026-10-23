/* OTG! v8.0.111 — chosen brand line, dashboard only.
   Presentation-only: no Space, Garage, results or backup state changes. */
(() => {
  'use strict';
  const TEXT = 'YOUR HARDEST OPPONENT IS YOU.';
  function decorateHome() {
    const body = document.querySelector('#home .v7DashBody');
    if (!body || body.querySelector('.otgTagline8111')) return;
    const grid = body.querySelector('.v7DashGrid');
    if (!grid) return;
    const line = document.createElement('p');
    line.className = 'otgTagline8111';
    line.textContent = TEXT;
    grid.before(line);
  }
  const original = window.rhRenderHome;
  if (typeof original === 'function') {
    window.rhRenderHome = function (...args) {
      const result = original.apply(this, args);
      decorateHome();
      return result;
    };
  }
  decorateHome();
})();
