/* Press & hold to open. Anything with data-href opens its site after a firm ~0.7 s hold.
   An ASCII progress bar fills under the finger / cursor; moving cancels (so dragging still throws). */
(function () {
  'use strict';
  var HOLD = 700, N = 10;
  var bar = document.createElement('div');
  bar.className = 'hold-bar'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var cur = null;

  function paint(p, label) {
    var f = Math.round(p * N);
    bar.textContent = '[' + '■'.repeat(f) + '□'.repeat(N - f) + '] ' + (p >= 1 ? 'opening ' : 'hold → ') + label;
  }
  function stop() {
    if (!cur) return;
    cancelAnimationFrame(cur.raf); cur.el.classList.remove('holding');
    bar.classList.remove('on'); cur = null;
  }
  function host(u) { try { return new URL(u, location.href).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  document.addEventListener('pointerdown', function (e) {
    if (e.button && e.button !== 0) return;
    var el = e.target.closest('[data-href]');
    if (!el) return;
    var url = el.getAttribute('data-href'), label = host(url);
    cur = { el: el, x: e.clientX, y: e.clientY, t0: performance.now(), url: url };
    el.classList.add('holding');
    bar.style.left = Math.min(innerWidth - 230, Math.max(8, e.clientX - 60)) + 'px';
    bar.style.top = Math.max(8, e.clientY - 46) + 'px';
    paint(0, label); bar.classList.add('on');
    (function tick() {
      if (!cur) return;
      var p = Math.min(1, (performance.now() - cur.t0) / HOLD);
      paint(p, label);
      if (p >= 1) {
        if (navigator.vibrate) navigator.vibrate(18);
        var u = cur.url; cur.el.dataset.opened = String(Date.now());
        setTimeout(function () { window.open(u, '_blank', 'noopener'); stop(); }, 120);
        return;
      }
      cur.raf = requestAnimationFrame(tick);
    })();
  }, true);
  document.addEventListener('pointermove', function (e) { if (cur && Math.hypot(e.clientX - cur.x, e.clientY - cur.y) > 8) stop(); }, true);
  document.addEventListener('pointerup', stop, true);
  document.addEventListener('pointercancel', stop, true);
  window.addEventListener('scroll', stop, { passive: true });
  // a long press must not also trigger the normal click or the touch context menu
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-href]');
    if (el && el.dataset.opened && Date.now() - +el.dataset.opened < 800) { e.preventDefault(); e.stopPropagation(); }
  }, true);
  document.addEventListener('contextmenu', function (e) { if (e.target.closest('[data-href]')) e.preventDefault(); });
})();
